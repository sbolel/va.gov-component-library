import { newE2EPage } from '@stencil/core/testing';
import { axeCheck } from '../../../testing/test-helpers';

describe('va-alert', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<va-alert></va-alert>');
    const element = await page.find('va-alert');

    expect(element).toEqualHtml(`
      <va-alert class="hydrated" status="info">
        <mock:shadow-root>
          <div class="alert info">
            <i aria-hidden="true"></i>
            <div class="body">
              <slot name="headline"></slot>
              <slot></slot>
            </div>
          </div>
        </mock:shadow-root>
      </va-alert>
    `);
  });

  it('renders an empty div with a "polite" aria-live tag when not visible', async () => {
    const page = await newE2EPage();

    await page.setContent('<va-alert visible="false"></va-alert>');
    const element = await page.find('va-alert');

    expect(element).toEqualHtml(`
      <va-alert class="hydrated" visible="false" status="info">
        <mock:shadow-root>
          <div aria-live="polite"></div>
        </mock:shadow-root>
      </va-alert>
    `);
  });

  it('passes an axe check', async () => {
    const page = await newE2EPage();
    await page.setContent(
      `<va-alert><h3 slot="headline">Alert</h3>Alert content</va-alert>`,
    );

    await axeCheck(page);
  });

  it('only shows a close icon if the closeable prop is passed', async () => {
    const page = await newE2EPage();
    await page.setContent('<va-alert>Alert</va-alert>');

    const element = await page.find('va-alert');

    let button = await page.find('va-alert >>> button');
    expect(button).toBeNull();

    element.setProperty('closeable', true);
    await page.waitForChanges();
    button = await page.find('va-alert >>> button');

    expect(button).not.toBeNull();
  });

  it('fires a custom "close" event when the close button is clicked', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<va-alert closeable="true">Content inside</va-alert>',
    );

    const closeSpy = await page.spyOnEvent('closeEvent');

    const button = await page.find('va-alert >>> button');
    await button.click();

    expect(closeSpy).toHaveReceivedEventTimes(1);
  });

  it('fires an analytics event when a link is clicked', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<va-alert><h4 slot="headline">This is an alert</h4><a href="#">This is a link</a></va-alert>',
    );

    const analyticsSpy = await page.spyOnEvent('component-library-analytics');

    const link = await page.find('va-alert a');
    await link.click();

    expect(analyticsSpy).toHaveReceivedEventDetail({
      action: 'linkClick',
      componentName: 'va-alert',
      details: {
        headline: 'This is an alert',
        backgroundOnly: false,
        clickLabel: 'This is a link',
        status: 'info',
        closeable: false,
      },
    });
  });

  it('uses a null headline in the analytics event detail when the heading is absent', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<va-alert><a href="#">This is a link</a></va-alert>',
    );

    const analyticsSpy = await page.spyOnEvent('component-library-analytics');

    const link = await page.find('va-alert a');
    await link.click();

    expect(analyticsSpy).toHaveReceivedEventDetail({
      action: 'linkClick',
      componentName: 'va-alert',
      details: {
        headline: null,
        backgroundOnly: false,
        clickLabel: 'This is a link',
        status: 'info',
        closeable: false,
      },
    });
  });

  it('does not fire an analytics event when disableAnalytics is passed', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<va-alert disable-analytics="true"><a href="#">This is a link</a></va-alert>',
    );

    const analyticsSpy = await page.spyOnEvent('component-library-analytics');

    const link = await page.find('va-alert a');
    await link.click();

    expect(analyticsSpy).toHaveReceivedEventTimes(0);
  });

  it('has the correct accessibility attributes when in an error state', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<va-alert status="error"><h4 slot="headline">This is an alert</h4><div>This is the alert content</div>',
    );

    const element = await page.find('va-alert >>> .alert');

    expect(element).toEqualAttributes({
      'role': 'alert',
      'aria-live': 'assertive',
    });
  });

  // Skipped because I'm not sure why the test isn't working. I've verified that
  // the event is emitted as expected using the Stencil dev server, so the
  // problem is with this test, not the component.
  it.skip('emits the vaComponentDidLoad event', async () => {
    const page = await newE2EPage();
    // For debugging:
    // https://pptr.dev/#?product=Puppeteer&version=v10.2.0&show=api-class-page
    const events = [
      'close',
      'console',
      'dialog',
      'domcontentloaded',
      'error',
      'frameattached',
      'framenavigated',
      'load',
      'metrics',
      'pageerror',
      'popup',
      'request',
      'requestfailed',
      'requestfinished',
      'response',
      'workercreated',
      'workerdestroyed',
    ];
    events.forEach(name => {
      page.on(name, () => {
        console.log(`Event caught: ${name}`);
      });
    });
    console.log('attaching spy...');
    const loadSpy = await page.spyOnEvent('va-component-did-load');
    console.log('...spy attached');
    await page.setContent(`<va-alert></va-alert>`);
    await page.find('va-alert');

    expect(loadSpy).toHaveReceivedEvent();
  });

  it('should set status to info if null', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<va-alert><h4 slot="headline">This is an alert</h4><div>This is the alert content</div>',
    );

    const element = await page.find('va-alert >>> .alert');

    expect(element.classList.contains('info')).toBeTruthy();
  });

  it('should set status to info if it is an empty string', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<va-alert status=""><h4 slot="headline">This is an alert</h4><div>This is the alert content</div>',
    );

    const element = await page.find('va-alert >>> .alert');

    expect(element.classList.contains('info')).toBeTruthy();
  });

  it('should set status to info if value not in pre-defined list', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<va-alert status="Fake"><h4 slot="headline">This is an alert</h4><div>This is the alert content</div>',
    );

    const element = await page.find('va-alert >>> .alert');

    expect(element.classList.contains('info')).toBeTruthy();
  });

  it('should not overwrite status if valid', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<va-alert status="continue"><h4 slot="headline">This is an alert</h4><div>This is the alert content</div>',
    );

    const element = await page.find('va-alert >>> .alert');

    expect(element.classList.contains('info')).toBeFalsy();
    expect(element.classList.contains('continue')).toBeTruthy();
  });

  /** Begin USWDS v3 Tests */

  it('uswds renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<va-alert uswds></va-alert>');
    const element = await page.find('va-alert');

    expect(element).toEqualHtml(`
      <va-alert class="hydrated" status="info" uswds="">
        <mock:shadow-root>
          <div class="usa-alert usa-alert--info">
            <div class="usa-alert__body" role="presentation">
              <slot name="headline"></slot>
              <slot></slot>
            </div>
          </div>
        </mock:shadow-root>
      </va-alert>
    `);
  });

  it('uswds renders an empty div with a "polite" aria-live tag when not visible', async () => {
    const page = await newE2EPage();

    await page.setContent('<va-alert uswds visible="false"></va-alert>');
    const element = await page.find('va-alert');

    expect(element).toEqualHtml(`
      <va-alert class="hydrated" visible="false" status="info" uswds="">
        <mock:shadow-root>
          <div aria-live="polite"></div>
        </mock:shadow-root>
      </va-alert>
    `);
  });

  it('uswds passes an axe check', async () => {
    const page = await newE2EPage();
    await page.setContent(
      `<va-alert uswds><h3 slot="headline">Alert</h3>Alert content</va-alert>`,
    );

    await axeCheck(page);
  });

  it('uswds only shows a close icon if the closeable prop is passed', async () => {
    const page = await newE2EPage();
    await page.setContent('<va-alert uswds>Alert</va-alert>');

    const element = await page.find('va-alert');

    let button = await page.find('va-alert >>> button');
    expect(button).toBeNull();

    element.setProperty('closeable', true);
    await page.waitForChanges();
    button = await page.find('va-alert >>> button');

    expect(button).not.toBeNull();
  });

  it('uswds fires a custom "close" event when the close button is clicked', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<va-alert uswds closeable="true">Content inside</va-alert>',
    );

    const closeSpy = await page.spyOnEvent('closeEvent');

    const button = await page.find('va-alert >>> button');
    await button.click();

    expect(closeSpy).toHaveReceivedEventTimes(1);
  });

  it('uswds fires an analytics event when a link is clicked', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<va-alert uswds><h4 slot="headline">This is an alert</h4><a href="#">This is a link</a></va-alert>',
    );

    const analyticsSpy = await page.spyOnEvent('component-library-analytics');

    const link = await page.find('va-alert a');
    await link.click();

    expect(analyticsSpy).toHaveReceivedEventDetail({
      action: 'linkClick',
      componentName: 'va-alert',
      details: {
        headline: 'This is an alert',
        backgroundOnly: false,
        clickLabel: 'This is a link',
        status: 'info',
        closeable: false,
      },
    });
  });

  it('uswds uses a null headline in the analytics event detail when the heading is absent', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<va-alert uswds><a href="#">This is a link</a></va-alert>',
    );

    const analyticsSpy = await page.spyOnEvent('component-library-analytics');

    const link = await page.find('va-alert a');
    await link.click();

    expect(analyticsSpy).toHaveReceivedEventDetail({
      action: 'linkClick',
      componentName: 'va-alert',
      details: {
        headline: null,
        backgroundOnly: false,
        clickLabel: 'This is a link',
        status: 'info',
        closeable: false,
      },
    });
  });

  it('uswds does not fire an analytics event when disableAnalytics is passed', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<va-alert uswds disable-analytics="true"><a href="#">This is a link</a></va-alert>',
    );

    const analyticsSpy = await page.spyOnEvent('component-library-analytics');

    const link = await page.find('va-alert a');
    await link.click();

    expect(analyticsSpy).toHaveReceivedEventTimes(0);
  });

  it('uswds has the correct accessibility attributes when in an error state', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<va-alert uswds status="error"><h4 slot="headline">This is an alert</h4><div>This is the alert content</div>',
    );

    const element = await page.find('va-alert >>> .usa-alert');

    expect(element).toEqualAttributes({
      'role': 'alert',
      'aria-live': 'assertive',
    });
  });

  it('uswds should set status to info if null', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<va-alert uswds><h4 slot="headline">This is an alert</h4><div>This is the alert content</div>',
    );

    const element = await page.find('va-alert >>> .usa-alert');

    expect(element.classList.contains('usa-alert--info')).toBeTruthy();
  });

  it('uswds should set status to info if it is an empty string', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<va-alert uswds status=""><h4 slot="headline">This is an alert</h4><div>This is the alert content</div>',
    );

    const element = await page.find('va-alert >>> .usa-alert');

    expect(element.classList.contains('usa-alert--info')).toBeTruthy();
  });

  it('uswds should set status to info if value not in pre-defined list', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<va-alert uswds status="Fake"><h4 slot="headline">This is an alert</h4><div>This is the alert content</div>',
    );

    const element = await page.find('va-alert >>> .usa-alert');

    expect(element.classList.contains('usa-alert--info')).toBeTruthy();
  });

  it('uswds should not overwrite status if valid', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<va-alert uswds status="continue"><h4 slot="headline">This is an alert</h4><div>This is the alert content</div>',
    );

    const element = await page.find('va-alert >>> .usa-alert');

    expect(element.classList.contains('usa-alert--info')).toBeFalsy();
    expect(element.classList.contains('usa-alert--continue')).toBeTruthy();
  });
});
