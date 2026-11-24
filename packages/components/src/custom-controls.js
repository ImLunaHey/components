// Use the same select renderer in each app study as in the component gallery.
document.querySelectorAll('select:not([hidden])').forEach(select => {
  const label = select.getAttribute('aria-label') || select.closest('label')?.firstChild.textContent.trim() || 'Choose an option';
  select.setAttribute('aria-label', label);
  window.ComponentPickers.select(select);
});
