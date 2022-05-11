/**
 * Code needed to trap focus within a modal. Modified from
 * https://github.com/ionic-team/ionic-framework/blob/main/core/src/utils/overlays.ts#L85
 * A more extensive list can be found at
 * https://github.com/KittyGiraudel/focusable-selectors/blob/main/index.js
 */
 export const focusableQueryString = [
  '.hydrated:not([tabindex^="-"])',
  '[tabindex]:not([tabindex^="-"])',
  'input:not([type=hidden]):not([tabindex^="-"])',
  'textarea:not([tabindex^="-"])',
  'button:not([tabindex^="-"])',
  'select:not([tabindex^="-"])',
].join(',');