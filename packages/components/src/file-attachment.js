// Shared attachment field: the OS chooser is native, the visible control is ours.
export function mountFileAttachment(host, { id, label = 'Attach file', maxBytes = 5 * 1024 * 1024 } = {}) {
  const native = document.createElement('input');
  native.type = 'file'; native.id = id; native.hidden = true;
  native.setAttribute('aria-label', label);
  const choose = document.createElement('button');
  choose.type = 'button'; choose.className = 'button small-button'; choose.textContent = label;
  const preview = document.createElement('span'); preview.className = 'attachment-preview';
  const status = document.createElement('span'); status.className = 'small muted'; status.setAttribute('role','status');
  const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'button small-button'; remove.textContent = 'Remove'; remove.hidden = true;
  let url;
  function clearPreview() { if(url) URL.revokeObjectURL(url); url = undefined; preview.replaceChildren(); }
  function reset() { clearPreview(); native.value = ''; status.textContent = ''; remove.hidden = true; }
  choose.onclick = () => native.click(); remove.onclick = reset;
  native.addEventListener('change', () => {
    clearPreview(); const file=native.files[0];
    if (!file) { reset(); return; }
    if(file.size > maxBytes) {reset(); status.textContent = `File must be under ${maxBytes / 1024 / 1024} MB.`;return;}
    status.textContent=file.name; remove.hidden=false;
    if(file.type.startsWith('image/')) { const image=document.createElement('img');url=URL.createObjectURL(file);image.src=url;image.alt=`Preview of ${file.name}`;image.width=40;image.height=40;image.style.objectFit='cover';image.style.borderRadius='5px';preview.append(image); }
  });
  host.classList.add('row');host.append(native,choose,preview,status,remove);
  window.addEventListener('pagehide',clearPreview,{once:true});
  return { native, reset };
}
