import { newE2EPage } from '@stencil/core/testing';
import { axeCheck } from '../../../testing/test-helpers';

describe('va-memorable-date', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<va-memorable-date></va-memorable-date>');

    const element = await page.find('va-memorable-date');
    expect(element).toHaveClass('hydrated');
    expect(element).toEqualHtml(`
      <va-memorable-date class='hydrated'>
      <mock:shadow-root>
        <fieldset>
          <legend>
            <div id='dateHint'>
            Please enter two digits for the month and day and four digits for the year.
            </div>
          </legend>
          <slot></slot>
          <div class='date-container'>
            <va-text-input aria-describedby='dateHint' class='hydrated input-month'></va-text-input>
            <va-text-input aria-describedby='dateHint' class='hydrated input-day'></va-text-input>
            <va-text-input aria-describedby='dateHint' class='hydrated input-year' value=''></va-text-input>
          </div>
        </fieldset>
      </mock:shadow-root>
    </va-memorable-date>
  `);
  });

  it('passes an axe check', async () => {
    const page = await newE2EPage();
    await page.setContent(
      `
      <va-memorable-date day="5" label="Test Label" month="3" name="test" year="2000"></va-memorable-date>
      `,
    );
    await axeCheck(page);
  });

  it('renders an error message', async () => {
    const page = await newE2EPage();
    await page.setContent('<va-memorable-date error="This is a mistake" />');

    // Render the error message text
    const error = await page.find('va-memorable-date >>> span.error-message');
    expect(error.innerText).toContain('This is a mistake');
  });

  it('renders a required span', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<va-memorable-date label="This is a field" required />',
    );

    const requiredSpan = await page.find(
      'va-memorable-date >>> span.required',
    );
    expect(requiredSpan).not.toBeNull();
  });

  it('sets a label', async () => {
    const page = await newE2EPage();
    await page.setContent('<va-memorable-date label="This is a label" />');

    const label = await page.find('va-memorable-date >>> legend');
    expect(label.innerText).toContain('This is a label');
  });

  it('sets a default date', async () => {
    const page = await newE2EPage();
    await page.setContent('<va-memorable-date value="1999-05-03" />');

    const month = await page.find('va-memorable-date >>> .input-month');
    const day = await page.find('va-memorable-date >>> .input-day');
    const year = await page.find('va-memorable-date >>> .input-year');

    expect(month.getAttribute('value')).toBe('05');
    expect(day.getAttribute('value')).toBe('03');
    expect(year.getAttribute('value')).toBe('1999');
  });

  it('updates date based on input fields', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<va-memorable-date value="1999-05-03" name="test" />',
    );

    const date = await page.find('va-memorable-date');
    const elementMonth = await page.find('va-memorable-date >>> .input-month');
    const elementDay = await page.find('va-memorable-date >>> .input-day');
    const elementYear = await page.find('va-memorable-date >>> .input-year');
    const handleMonth = await page.$('pierce/[name="testMonth"]');
    const handleDay = await page.$('pierce/[name="testDay"]');
    const handleYear = await page.$('pierce/[name="testYear"]');

    // Click three times to select all text in input
    await handleMonth.click({ clickCount: 3 });
    await handleMonth.press('0');
    await handleMonth.press('7');
    // Click three times to select all text in input
    await handleDay.click({ clickCount: 3 });
    await handleDay.press('2');
    await handleDay.press('1');
    // Click three times to select all text in input
    await handleYear.click({ clickCount: 3 });
    await handleYear.press('2');
    await handleYear.press('0');
    await handleYear.press('2');
    await handleYear.press('2');
    await page.waitForChanges();

    expect(elementMonth.getAttribute('value')).toBe('07');
    expect(elementDay.getAttribute('value')).toBe('21');
    expect(elementYear.getAttribute('value')).toBe('2022');
    expect(date.getAttribute('value')).toBe('2022-07-21');
  });

  it('year input only allows for 4 characters to be used', async () => {
    const page = await newE2EPage();
    await page.setContent('<va-memorable-date name="test" />');

    const elementYear = await page.find('va-memorable-date >>> .input-year');
    const handleYear = await page.$('pierce/[name="testYear"]');
    await handleYear.press('2');
    await handleYear.press('0');
    await handleYear.press('2');
    await handleYear.press('2');
    await handleYear.press('3');

    await page.waitForChanges();
    expect(elementYear.getAttribute('value')).toBe('2022');
  });

  it('day and month input field only allows for a maximum of 2 characters to be used', async () => {
    const page = await newE2EPage();
    await page.setContent('<va-memorable-date name="test" />');

    const elementMonth = await page.find('va-memorable-date >>> .input-month');
    const handleMonth = await page.$('pierce/[name="testMonth"]');
    await handleMonth.press('2');
    await handleMonth.press('0');
    await handleMonth.press('2');
    await handleMonth.press('2');
    await handleMonth.press('3');

    const elementDay = await page.find('va-memorable-date >>> .input-day');
    const handleDay = await page.$('pierce/[name="testDay"]');
    await handleDay.press('1');
    await handleDay.press('2');
    await handleDay.press('3');
    await handleDay.press('4');
    await handleDay.press('5');

    await page.waitForChanges();
    expect(elementMonth.getAttribute('value')).toBe('20');
    expect(elementDay.getAttribute('value')).toBe('12');
  });

  it('fires a error message onBlur if date is invalid and component is required', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<va-memorable-date value="1999-05-03" name="test" required="true" />',
    );
    const date = await page.find('va-memorable-date');
    const handleYear = await page.$('pierce/[name="testYear"]');

    // Click three times to select all text in input
    await handleYear.click({ clickCount: 3 });
    await handleYear.press('2');
    // Trigger Blur
    await handleYear.press('Tab');

    await page.waitForChanges();
    expect(date.getAttribute('error')).toEqual('Please enter a valid date');

    await handleYear.press('0');
    await handleYear.press('2');
    await handleYear.press('2');
    // Trigger Blur
    await handleYear.press('Tab');
    await page.waitForChanges();
    expect(date.getAttribute('error')).toEqual('');
  });

  it('emits dateBlur event', async () => {
    const page = await newE2EPage();

    await page.setContent(
      '<va-memorable-date value="1999-05-03" name="test" />',
    );

    const handleYear = await page.$('pierce/[name="testYear"]');
    const blurSpy = await page.spyOnEvent('dateBlur');
    // Trigger Blur
    await handleYear.press('Tab');

    expect(blurSpy).toHaveReceivedEvent();
  });

  it('emits dateChange event when input value is updated', async () => {
    const page = await newE2EPage();

    await page.setContent(
      '<va-memorable-date value="1999-05-03" name="test" />',
    );

    const handleMonth = await page.$('pierce/[name="testMonth"]');
    const handleDay = await page.$('pierce/[name="testDay"]');
    const handleYear = await page.$('pierce/[name="testYear"]');
    const spy = await page.spyOnEvent('dateChange');

    await handleMonth.press('7');
    // Click three times to select all text in input
    await handleDay.click({ clickCount: 3 });
    await handleDay.press('1');
    await handleDay.press('2');

    expect(spy).toHaveReceivedEventTimes(2);

    // Click three times to select all text in input
    await handleYear.click({ clickCount: 3 });
    await handleYear.press('2');
    await handleYear.press('0');
    await handleYear.press('2');
    await handleYear.press('2');

    expect(spy).toHaveReceivedEventTimes(6);
  });

  it('formats single digit days and months into 2 digits with a leading 0', async () => {
    const page = await newE2EPage();

    await page.setContent('<va-memorable-date name="test"/>');
    const date = await page.find('va-memorable-date');
    const handleMonth = await page.$('pierce/[name="testMonth"]');
    const handleDay = await page.$('pierce/[name="testDay"]');
    const handleYear = await page.$('pierce/[name="testYear"]');
    // Month
    await handleMonth.press('1');
    await handleMonth.press('Tab');
    // Day
    await handleDay.press('2');
    await handleDay.press('Tab');
    // Year
    await handleYear.press('2');
    await handleYear.press('0');
    await handleYear.press('2');
    await handleYear.press('2');
    // Trigger Blur
    await handleYear.press('Tab');
    await page.waitForChanges();
    expect(date.getAttribute('value')).toBe('2022-01-02');
  });

  it('only allows specific keys to be used inside input fields', async () => {
    const page = await newE2EPage();

    await page.setContent('<va-memorable-date name="test"/>');
    const date = await page.find('va-memorable-date');
    const handleMonth = await page.$('pierce/[name="testMonth"]');
    const handleDay = await page.$('pierce/[name="testDay"]');
    const handleYear = await page.$('pierce/[name="testYear"]');
    // Month
    await handleMonth.press('a');
    await handleMonth.press('Tab');
    // Day
    await handleDay.press('b');
    await handleDay.press('Tab');
    // Year
    await handleYear.press('`');
    await handleYear.press(']');
    await handleYear.press('/');
    await handleYear.press(',');
    // Trigger Blur
    await handleYear.press('Tab');
    await page.waitForChanges();
    expect(date.getAttribute('value')).toBe('--');
  });

  it('checks for valid year month and day', async () => {
    const page = await newE2EPage();

    await page.setContent('<va-memorable-date name="test"/>');
    const date = await page.find('va-memorable-date');
    const handleMonth = await page.$('pierce/[name="testMonth"]');
    const handleDay = await page.$('pierce/[name="testDay"]');
    const handleYear = await page.$('pierce/[name="testYear"]');
    // Month
    await handleMonth.press('0');
    await handleMonth.press('Tab');
    // Day
    await handleDay.press('9');
    await handleDay.press('9');
    await handleDay.press('Tab');
    // Year
    await handleYear.press('3');
    await handleYear.press('0');
    await handleYear.press('0');
    await handleYear.press('0');
    // Trigger Blur
    await handleYear.press('Tab');
    await page.waitForChanges();
    expect(date.getAttribute('error')).toEqual('Please enter a valid date');
  });
});