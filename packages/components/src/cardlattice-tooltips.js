import { initProgressTooltips } from './progress-tooltips.js';
const dispose = initProgressTooltips(document.getElementById('cl-preview'));
window.addEventListener('pagehide', dispose, { once: true });
