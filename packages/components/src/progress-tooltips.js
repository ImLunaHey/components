const selector = 'progress, meter, [role="progressbar"], [role="meter"]';

export function progressDescription(bar) {
  const native = bar.matches('progress, meter');
  const label = bar.getAttribute('aria-label') ||
    (bar.getAttribute('aria-labelledby') || '').split(/\s+/).map(id => document.getElementById(id)?.textContent || '').join(' ').trim() ||
    (() => { const label = bar.labels?.[0]?.cloneNode(true); label?.querySelectorAll('progress,meter').forEach(node => node.remove()); return label?.textContent.trim(); })() ||
    (bar.matches('meter,[role="meter"]') ? 'Usage' : 'Progress');
  const raw = native ? bar.getAttribute('value') : bar.getAttribute('aria-valuenow');
  if (raw === null) return `${label} · In progress`;
  const min = native ? (bar.matches('meter') ? bar.min : 0) : Number(bar.getAttribute('aria-valuemin') || 0);
  const max = native ? bar.max : Number(bar.getAttribute('aria-valuemax') || 100);
  const value = native ? bar.value : Number(raw);
  const percent = max > min ? Math.round(Math.max(0, Math.min(1, (value - min) / (max - min))) * 100) : 0;
  const detail = bar.getAttribute('aria-valuetext') || bar.dataset.progressDetail;
  return `${label} · ${percent}%${detail ? ' · ' + detail : ''}`;
}

export function initProgressTooltips(root = document) {
  const attached = new WeakSet();
  const tip = document.createElement('div');
  tip.id = 'progress-tooltip-' + crypto.randomUUID();
  tip.className = 'progress-tooltip';
  tip.setAttribute('role', 'tooltip');
  tip.setAttribute('popover', 'manual');
  tip.hidden = true;
  document.body.append(tip);
  let active = null, hideTimer;
  const unavailable = bar => !bar.isConnected || !!bar.closest('[hidden], [aria-hidden="true"]');
  function hide() {
    clearTimeout(hideTimer);
    if (active) {
      const ids = (active.getAttribute('aria-describedby') || '').split(/\s+/).filter(id => id && id !== tip.id);
      if (ids.length) active.setAttribute('aria-describedby', ids.join(' '));
      else active.removeAttribute('aria-describedby');
    }
    active = null;
    if (tip.matches(':popover-open')) tip.hidePopover?.();
    tip.hidden = true;
  }
  function place() {
    if (!active) return;
    if (unavailable(active)) return hide();
    const r = active.getBoundingClientRect(), t = tip.getBoundingClientRect();
    tip.style.left = Math.max(8, Math.min(r.left + r.width / 2 - t.width / 2, window.innerWidth - t.width - 8)) + 'px';
    tip.style.top = (r.top >= t.height + 12 ? r.top - t.height - 8 : Math.min(r.bottom + 8, window.innerHeight - t.height - 8)) + 'px';
  }
  function show(bar) {
    clearTimeout(hideTimer);
    if (unavailable(bar)) return;
    if (active !== bar) hide();
    active = bar;
    const ids = new Set((bar.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
    ids.add(tip.id); bar.setAttribute('aria-describedby', [...ids].join(' '));
    tip.textContent = progressDescription(bar);
    tip.hidden = false;
    if (!tip.matches(':popover-open')) tip.showPopover?.();
    place();
  }
  const leave = () => { if (document.activeElement !== active) hideTimer = setTimeout(hide, 150); };
  function enhance(node) {
    if (node.nodeType !== 1 && node.nodeType !== 9) return;
    const bars = [...(node.matches?.(selector) ? [node] : []), ...node.querySelectorAll(selector)];
    for (const bar of bars) {
      if (attached.has(bar)) continue;
      attached.add(bar);
      if (!bar.hasAttribute('tabindex')) bar.tabIndex = 0;
      bar.addEventListener('pointerenter', () => show(bar));
      bar.addEventListener('pointerleave', leave);
      bar.addEventListener('focus', () => show(bar));
      bar.addEventListener('blur', hide);
    }
  }
  const keydown = e => { if (e.key === 'Escape' && active) { e.preventDefault(); e.stopPropagation(); hide(); } };
  tip.addEventListener('pointerenter', () => clearTimeout(hideTimer));
  tip.addEventListener('pointerleave', leave);
  document.addEventListener('keydown', keydown, true);
  window.addEventListener('resize', place);
  document.addEventListener('scroll', place, true);
  enhance(root);
  const observer = new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) enhance(node);
    if (active) { if (unavailable(active)) hide(); else { const text = progressDescription(active); if (text !== tip.textContent) tip.textContent = text; place(); } }
  });
  observer.observe(root, {subtree:true, childList:true, attributes:true, attributeFilter:['value','max','min','aria-valuenow','aria-valuemin','aria-valuemax','aria-valuetext','aria-label','data-progress-detail','hidden','aria-hidden']});
  return () => { hide(); observer.disconnect(); tip.remove(); document.removeEventListener('keydown', keydown, true); window.removeEventListener('resize', place); document.removeEventListener('scroll', place, true); };
}
