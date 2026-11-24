import { initProgressTooltips } from './progress-tooltips.js';
import { initHtmlElements } from './html-elements.js';
import { initWorkflowComponents } from './workflow-components.js';
import { initSurfaceComponents } from './surface-components.js';
import { initAppComponents } from './app-components.js';
import { createTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel, functionalUpdate } from '@tanstack/table-core';
import { initDataComponents } from './data-components.js';
const $=id=>document.getElementById(id);

// One custom renderer for every select, including legacy specimens and table controls.
document.querySelectorAll('select:not([hidden]):not([data-custom-renderer])').forEach(select=>{select.setAttribute('aria-label',select.getAttribute('aria-label')||select.closest('label')?.firstChild.textContent.trim()||'Choose an option');window.ComponentPickers.select(select)});
document.querySelectorAll('input[list]').forEach(input=>{const list=$(input.getAttribute('list'));const items=[...list.options].map(o=>({value:o.value,label:o.value}));input.removeAttribute('list');input.setAttribute('aria-label',input.getAttribute('aria-label')||'Find a person');window.ComponentPickers.combobox(input,items);list.remove()});

// Backdrop dismissal requires both pointer-down and pointer-up outside the panel.
document.querySelectorAll('dialog').forEach(dialog=>{
 let startedOutside=false;
 const outside=e=>{const r=dialog.getBoundingClientRect();return e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom};
 dialog.addEventListener('pointerdown',e=>{startedOutside=e.target===dialog&&outside(e)});
 dialog.addEventListener('click',e=>{if(startedOutside&&e.target===dialog&&outside(e))dialog.close();startedOutside=false});
});

// Local file previews: never upload files, and release object URLs when replaced.
let previewUrl;
const upload=$('file').closest('.upload'),preview=document.createElement('div');preview.id='upload-preview';preview.className='upload-preview';upload.append(preview);
function showFile(file){if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=undefined;preview.replaceChildren();$('file-status').textContent=file?`${file.name} · ${(file.size/1024).toFixed(1)} KB`:'No file selected';$('file-status').classList.add('file-meta');if(!file)return;
 if(file.type.startsWith('image/')){const image=document.createElement('img');image.alt=`Preview of ${file.name}`;previewUrl=URL.createObjectURL(file);image.src=previewUrl;image.onerror=()=>{image.remove();const error=document.createElement('p');error.textContent='This image format could not be previewed.';preview.prepend(error)};preview.append(image)}else{const note=document.createElement('p');note.className='small muted';note.textContent='Document attached · preview unavailable for this format.';preview.append(note)}
 const remove=document.createElement('button');remove.className='button small-button';remove.textContent='Remove attachment';remove.type='button';remove.onclick=()=>{$('file').value='';showFile(null)};preview.append(remove);
}
$('file').onchange=()=>showFile($('file').files[0]);upload.addEventListener('dragover',e=>{e.preventDefault();upload.classList.add('dragover')});upload.addEventListener('dragleave',()=>upload.classList.remove('dragover'));upload.addEventListener('drop',e=>{e.preventDefault();upload.classList.remove('dragover');$('file').files=e.dataTransfer.files;showFile(e.dataTransfer.files[0])});window.addEventListener('pagehide',()=>{if(previewUrl)URL.revokeObjectURL(previewUrl)});

// Compact calendar with roving focus and real month navigation.
let month=new Date(2026,10,1),selected=new Date(2026,10,23),focused=selected;
const key=d=>`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const format=d=>d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
function days(container,date,make){container.replaceChildren();['Mo','Tu','We','Th','Fr','Sa','Su'].forEach(day=>{const n=document.createElement('span');n.textContent=day;container.append(n)});for(let i=0;i<(date.getDay()+6)%7;i++)container.append(document.createElement('span'));for(let i=1;i<=new Date(date.getFullYear(),date.getMonth()+1,0).getDate();i++){const day=new Date(date.getFullYear(),date.getMonth(),i),b=document.createElement('button');b.type='button';b.textContent=i;b.setAttribute('aria-label',format(day));make(b,day);container.append(b)}while(container.children.length<49){const blank=document.createElement('span');blank.setAttribute('aria-hidden','true');container.append(blank)}}
function calendar(focus=false){$('month-title').textContent=month.toLocaleDateString('en-GB',{month:'long',year:'numeric'});days($('calendar'),month,(b,day)=>{b.dataset.date=key(day);b.tabIndex=key(day)===key(focused)?0:-1;b.setAttribute('aria-pressed',String(!!selected&&key(day)===key(selected)));if(key(day)===key(new Date()))b.classList.add('today');b.onclick=()=>{selected=focused=day;$('date-value').value=format(day);calendar(true)};b.onkeydown=e=>{let target;if(e.key==='ArrowRight')target=new Date(day.getFullYear(),day.getMonth(),day.getDate()+1);if(e.key==='ArrowLeft')target=new Date(day.getFullYear(),day.getMonth(),day.getDate()-1);if(e.key==='ArrowDown')target=new Date(day.getFullYear(),day.getMonth(),day.getDate()+7);if(e.key==='ArrowUp')target=new Date(day.getFullYear(),day.getMonth(),day.getDate()-7);if(e.key==='Home')target=new Date(day.getFullYear(),day.getMonth(),day.getDate()-(day.getDay()+6)%7);if(e.key==='End')target=new Date(day.getFullYear(),day.getMonth(),day.getDate()+6-(day.getDay()+6)%7);if(e.key==='PageDown'||e.key==='PageUp')target=new Date(day.getFullYear(),day.getMonth()+(e.key==='PageDown'?1:-1),1);if(target){e.preventDefault();focused=target;month=new Date(target.getFullYear(),target.getMonth(),1);calendar(true)}}});if(focus)$('calendar').querySelector('[tabindex="0"]')?.focus()}
$('prev-month').onclick=()=>{month=new Date(month.getFullYear(),month.getMonth()-1,1);focused=month;calendar()};$('next-month').onclick=()=>{month=new Date(month.getFullYear(),month.getMonth()+1,1);focused=month;calendar()};$('clear-date').onclick=()=>{selected=null;$('date-value').value='No date selected';calendar()};calendar();
let rangeStart=null,rangeEnd=null;function rangeCalendar(){[$('range-start'),$('range-end')].forEach((container,i)=>days(container,new Date(2026,10+i,1),(b,day)=>{const active=rangeStart&&key(day)===key(rangeStart)||rangeEnd&&key(day)===key(rangeEnd);b.setAttribute('aria-pressed',String(!!active));if(rangeStart&&rangeEnd&&day>rangeStart&&day<rangeEnd)b.classList.add('in-range');b.onclick=()=>{if(!rangeStart||rangeEnd){rangeStart=day;rangeEnd=null}else{rangeEnd=day;if(rangeEnd<rangeStart)[rangeStart,rangeEnd]=[rangeEnd,rangeStart]}$('range-value').value=rangeEnd?`${format(rangeStart)} – ${format(rangeEnd)}`:`${format(rangeStart)} · choose end date`;rangeCalendar()}}))};$('range-clear').onclick=()=>{rangeStart=rangeEnd=null;$('range-value').value='Choose a start and end date.';rangeCalendar()};rangeCalendar();

// TanStack Table owns every row transformation and selection state.
const projects=[{name:'Component library',status:'Ready',owner:'Luna',time:'2 min ago'},{name:'Personal website',status:'Building',owner:'Luna',time:'5 min ago'},{name:'Notes',status:'Ready',owner:'Alex',time:'18 min ago'},{name:'Status page',status:'Failed',owner:'Sam',time:'1 hour ago'},{name:'Fleet Monitor',status:'Ready',owner:'Luna',time:'2 hours ago'},{name:'Cardlattice',status:'Building',owner:'Ella',time:'3 hours ago'},{name:'Image archive',status:'Ready',owner:'Alex',time:'Yesterday'},{name:'API gateway',status:'Failed',owner:'Sam',time:'Yesterday'}];
const columns=[{id:'select',header:'Select',enableHiding:false,enableSorting:false},...['name','status','owner','time'].map(accessorKey=>({accessorKey,header:({name:'Project',status:'Status',owner:'Owner',time:'Updated'})[accessorKey],filterFn:accessorKey==='status'?'equalsString':'includesString',enableHiding:accessorKey!=='name'}))];
const table=createTable({data:projects,columns,getRowId:r=>r.name,getCoreRowModel:getCoreRowModel(),getFilteredRowModel:getFilteredRowModel(),getSortedRowModel:getSortedRowModel(),getPaginationRowModel:getPaginationRowModel(),enableRowSelection:true,state:{},onStateChange:()=>{}});
let tableState={...table.initialState,sorting:[{id:'name',desc:false}],pagination:{pageIndex:0,pageSize:5}};
table.setOptions(previous=>({...previous,state:tableState,onStateChange:updater=>{tableState=functionalUpdate(updater,tableState);table.setOptions(o=>({...o,state:tableState}));drawTable()}}));window.galleryTable=table;
const tbody=$('project-rows'),thead=tbody.closest('table').querySelector('thead');tbody.closest('table').dataset.engine='tanstack-table';
function checkbox(label,checked,mixed,onchange){const input=document.createElement('input');input.type='checkbox';input.setAttribute('aria-label',label);input.checked=checked;input.indeterminate=mixed;input.onchange=onchange;return input}
function drawTable(){thead.replaceChildren();const tr=document.createElement('tr');for(const column of table.getVisibleLeafColumns()){const th=document.createElement('th');if(column.id==='select')th.append(checkbox('Select visible projects',table.getIsAllPageRowsSelected(),table.getIsSomePageRowsSelected(),table.getToggleAllPageRowsSelectedHandler()));else{const b=document.createElement('button');b.textContent=column.columnDef.header+(column.getIsSorted()==='asc'?' ↑':column.getIsSorted()==='desc'?' ↓':'');b.onclick=column.getToggleSortingHandler();th.setAttribute('aria-sort',column.getIsSorted()==='asc'?'ascending':column.getIsSorted()==='desc'?'descending':'none');th.append(b)}tr.append(th)}thead.append(tr);tbody.replaceChildren();
 for(const row of table.getRowModel().rows){const tr=document.createElement('tr');tr.classList.toggle('selected',row.getIsSelected());for(const cell of row.getVisibleCells()){const td=document.createElement('td');if(cell.column.id==='select')td.append(checkbox('Select '+row.original.name,row.getIsSelected(),false,row.getToggleSelectedHandler()));else if(cell.column.id==='name'){const b=document.createElement('button');b.className='link-button';b.textContent=cell.getValue();b.onclick=()=>{$('drawer-title').textContent=row.original.name;$('drawer-status').textContent=row.original.status;$('drawer-status').className='badge '+(row.original.status==='Failed'?'error':row.original.status==='Building'?'warning':'success');$('drawer').showModal()};td.append(b)}else if(cell.column.id==='status'){const badge=document.createElement('span');badge.className='badge '+(cell.getValue()==='Failed'?'error':cell.getValue()==='Building'?'warning':'success');badge.textContent=cell.getValue();td.append(badge)}else td.textContent=cell.getValue();tr.append(td)}tbody.append(tr)}
 const count=table.getFilteredRowModel().rows.length;if(!count){const row=tbody.insertRow(),cell=row.insertCell();cell.colSpan=table.getVisibleLeafColumns().length;cell.textContent='No projects match these filters.'}
 const selected=table.getSelectedRowModel().rows.length;$('bulk').hidden=!selected;$('selected-count').textContent=selected+' selected';$('table-count').textContent=`${count} of ${projects.length} projects`;$('table-page').textContent=`Page ${tableState.pagination.pageIndex+1} of ${Math.max(1,table.getPageCount())}`;$('table-prev').disabled=!table.getCanPreviousPage();$('table-next').disabled=!table.getCanNextPage();
}
$('table-search').oninput=e=>{table.setPageIndex(0);table.getColumn('name').setFilterValue(e.target.value)};$('status-filter').onchange=e=>{table.setPageIndex(0);table.getColumn('status').setFilterValue(e.target.value==='all'?undefined:e.target.value)};$('clear-selection').onclick=()=>table.resetRowSelection();$('table-prev').onclick=()=>table.previousPage();$('table-next').onclick=()=>table.nextPage();$('table-size').onchange=e=>table.setPageSize(Number(e.target.value));
for(const column of table.getAllLeafColumns().filter(c=>c.getCanHide())){const label=document.createElement('label');label.className='check';label.append(checkbox('Show '+column.columnDef.header,true,false,column.getToggleVisibilityHandler()),document.createTextNode(column.columnDef.header));$('column-options').append(label)}drawTable();

// Search remains focused while command options are navigated with aria-activedescendant.
const commands=[{name:'Create project',description:'Start a new workspace project',group:'Actions',symbol:'+',key:'N',run:()=>$('edit').showModal()},{name:'Toggle appearance',description:'Switch between light and dark',group:'Actions',symbol:'◐',key:'T',run:()=>document.querySelector(`[data-theme="${document.documentElement.dataset.theme==='dark'?'light':'dark'}"]`).click()},{name:'Forms & inputs',description:'Selects, comboboxes and date pickers',group:'Navigate',symbol:'⌨',key:'F',run:()=>document.querySelector('[data-category="forms"]').click()},{name:'Tables & data',description:'Projects, metrics and activity',group:'Navigate',symbol:'▤',key:'D',run:()=>document.querySelector('[data-category="data"]').click()},{name:'All components',description:'Browse the complete gallery',group:'Navigate',symbol:'⊞',key:'A',run:()=>document.querySelector('[data-category="all"]').click()},{name:'Edit project details',description:'Update name and description',group:'Actions',symbol:'✎',key:'E',run:()=>$('edit').showModal()}];
let matches=[],active=0;const search=$('command-search'),results=$('command-results');search.setAttribute('role','combobox');search.setAttribute('aria-controls','command-results');search.setAttribute('aria-autocomplete','list');results.setAttribute('role','listbox');results.setAttribute('aria-label','Commands');
function highlight(){[...results.querySelectorAll('[role=option]')].forEach((node,i)=>node.setAttribute('aria-selected',String(i===active)));const current=results.querySelectorAll('[role=option]')[active];if(current){search.setAttribute('aria-activedescendant',current.id);current.scrollIntoView({block:'nearest'})}else search.removeAttribute('aria-activedescendant')}
function runCommand(index){const cmd=matches[index];if(!cmd)return;$('command').close();cmd.run()}
function commandList(){const q=search.value.toLowerCase().trim();matches=commands.filter(c=>(c.name+' '+c.description).toLowerCase().includes(q)).sort((a,b)=>a.group.localeCompare(b.group));active=0;results.replaceChildren();let group;matches.forEach((c,i)=>{if(c.group!==group){group=c.group;const heading=document.createElement('div');heading.className='command-section';heading.textContent=group;heading.setAttribute('role','presentation');results.append(heading)}const item=document.createElement('div');item.className='command-item';item.id='command-option-'+i;item.setAttribute('role','option');const symbol=document.createElement('span');symbol.className='command-symbol';symbol.textContent=c.symbol;symbol.setAttribute('aria-hidden','true');const copy=document.createElement('span');copy.className='command-copy';copy.textContent=c.name;const desc=document.createElement('small');desc.textContent=c.description;copy.append(desc);const key=document.createElement('kbd');key.textContent=c.key;item.append(symbol,copy,key);item.onpointermove=()=>{active=i;highlight()};item.onpointerdown=e=>e.preventDefault();item.onclick=()=>runCommand(i);results.append(item)});$('no-commands').hidden=matches.length>0;highlight()}
search.oninput=commandList;$('command').addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();active=(active+(e.key==='ArrowDown'?1:-1)+matches.length)%Math.max(1,matches.length);highlight()}else if(e.key==='Enter'){e.preventDefault();runCommand(active)}});new MutationObserver(()=>{search.setAttribute('aria-expanded',String($('command').open));if($('command').open){search.value='';commandList();search.focus()}}).observe($('command'),{attributes:true,attributeFilter:['open']});document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if($('command').open)$('command').close();else $('command').showModal()}});commandList();

const team=new Set(['Luna H.']);function renderTeam(){ $('team-tags').replaceChildren();for(const name of team){const tag=document.createElement('span');tag.className='tag';tag.textContent=name;const remove=document.createElement('button');remove.textContent='×';remove.setAttribute('aria-label','Remove '+name);remove.onclick=()=>{team.delete(name);renderTeam()};tag.append(remove);$('team-tags').append(tag)}$('team-options').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(team.has(b.textContent))))} $('team-options').querySelectorAll('button').forEach(b=>b.onclick=()=>{team.has(b.textContent)?team.delete(b.textContent):team.add(b.textContent);renderTeam()});renderTeam();
const digits=[];function otpStatus(){const code=digits.map(d=>d.value).join('');$('otp-status').textContent=code.length===6?'Code ready to verify.':`${code.length} of 6 digits entered.`}for(let i=0;i<6;i++){const input=document.createElement('input');input.type='text';input.inputMode='numeric';input.maxLength=1;input.autocomplete=i===0?'one-time-code':'off';input.setAttribute('aria-label','Digit '+(i+1));input.oninput=()=>{input.value=input.value.replace(/\D/g,'').slice(-1);if(input.value)digits[i+1]?.focus();otpStatus()};input.onkeydown=e=>{if(e.key==='Backspace'&&!input.value)digits[i-1]?.focus();if(e.key==='ArrowLeft')digits[i-1]?.focus();if(e.key==='ArrowRight')digits[i+1]?.focus()};input.onpaste=e=>{e.preventDefault();const code=e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6-i);[...code].forEach((c,n)=>digits[i+n].value=c);digits[Math.min(i+code.length,5)]?.focus();otpStatus()};digits.push(input);$('otp').append(input)}
const publishMenu=$('publish-menu'),publishTrigger=document.querySelector('[popovertarget="publish-menu"]'),publishGroup=publishTrigger.closest('.split-button');
const publishOptions=[...publishMenu.querySelectorAll('[data-publish]')];
publishTrigger.setAttribute('aria-haspopup','menu');
publishTrigger.setAttribute('aria-controls',publishMenu.id);
publishTrigger.setAttribute('aria-expanded','false');
publishMenu.setAttribute('role','menu');
publishMenu.setAttribute('aria-label','Publishing options');
publishMenu.style.cssText='position:fixed;inset:auto;margin:0;max-width:calc(100vw - 16px);overflow:auto';
function placePublishMenu(){
 if(!publishMenu.matches(':popover-open'))return;
 const anchor=publishGroup.getBoundingClientRect(),edge=8,gap=6;
 if(anchor.bottom<=0||anchor.top>=innerHeight){publishMenu.hidePopover();return}
 publishMenu.style.maxHeight=`${Math.max(0,innerHeight-2*edge)}px`;
 const width=publishMenu.getBoundingClientRect().width,height=publishMenu.getBoundingClientRect().height;
 const below=innerHeight-anchor.bottom-gap-edge,above=anchor.top-gap-edge;
 const flip=below<height&&above>below;
 publishMenu.style.maxHeight=`${Math.max(0,flip?above:below)}px`;
 publishMenu.style.left=`${Math.max(edge,Math.min(anchor.left,innerWidth-width-edge))}px`;
 publishMenu.style.top=`${flip?Math.max(edge,anchor.top-gap-publishMenu.getBoundingClientRect().height):anchor.bottom+gap}px`;
}
publishMenu.addEventListener('toggle',()=>{
 const open=publishMenu.matches(':popover-open');
 publishTrigger.setAttribute('aria-expanded',String(open));
 if(open){placePublishMenu();(publishOptions.find(b=>b.dataset.publish===$('publish-action').textContent)||publishOptions[0]).focus({preventScroll:true})}
});
window.addEventListener('scroll',placePublishMenu,true);
window.addEventListener('resize',placePublishMenu);
new ResizeObserver(placePublishMenu).observe(publishGroup);
publishTrigger.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!publishMenu.matches(':popover-open'))publishMenu.showPopover();else publishOptions[e.key==='ArrowDown'?0:publishOptions.length-1].focus()}});
publishMenu.addEventListener('keydown',e=>{
 const index=publishOptions.indexOf(document.activeElement);
 if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
  e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?publishOptions.length-1:(index+(e.key==='ArrowDown'?1:-1)+publishOptions.length)%publishOptions.length;publishOptions[next].focus();
 }else if(e.key==='Escape'||e.key==='Tab'){
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation()}
  publishMenu.hidePopover();publishTrigger.focus();
 }
});
publishOptions.forEach(b=>{b.setAttribute('role','menuitem');b.tabIndex=-1;b.onclick=()=>{$('publish-action').textContent=b.dataset.publish;publishMenu.hidePopover();$('publish-action').focus()}});
$('publish-action').onclick=()=>{$('publish-result').textContent=$('publish-action').textContent+' · completed in this preview'};
$('copy-command').onclick=async()=>{try{await navigator.clipboard.writeText($('copy-text').textContent);$('copy-result').textContent='Copied to clipboard.'}catch{$('copy-result').textContent='Clipboard unavailable. Select and copy the command.'}};
const contextMenu=$('context-menu'),contextTarget=$('context-target'),contextOpen=$('context-open');
const contextOptions=[...contextMenu.querySelectorAll('[data-context]')];
// Auto-popover dismissal can consume the opening right-button release on macOS.
// Dismiss on a subsequent outside pointer-down instead, never on pointer-up.
contextMenu.setAttribute('popover','manual');
contextMenu.setAttribute('role','menu');
contextMenu.setAttribute('aria-label','Project asset actions');
for(const trigger of [contextTarget,contextOpen]){trigger.setAttribute('aria-haspopup','menu');trigger.setAttribute('aria-controls',contextMenu.id);trigger.setAttribute('aria-expanded','false')}
let contextInvoker=contextTarget;
function closeContext(restoreFocus=false){
 if(!contextMenu.matches(':popover-open'))return;
 contextMenu.hidePopover();
 for(const trigger of [contextTarget,contextOpen])trigger.setAttribute('aria-expanded','false');
 if(restoreFocus)contextInvoker.focus({preventScroll:true});
}
function context(e){
 e.preventDefault();contextInvoker=e.currentTarget===contextOpen?contextOpen:contextTarget;
 // Manual popovers do not automatically close other open popovers.
 document.querySelectorAll(':popover-open').forEach(p=>{if(p!==contextMenu)p.hidePopover()});
 contextMenu.style.cssText='position:fixed;inset:auto;margin:0;max-width:calc(100vw - 16px);max-height:calc(100dvh - 16px);overflow:auto';
 contextMenu.showPopover();
 const anchor=contextInvoker.getBoundingClientRect(),menu=contextMenu.getBoundingClientRect();
 const pointer=e.type==='contextmenu'&&(e.clientX!==0||e.clientY!==0);
 const x=pointer?e.clientX:anchor.left,y=pointer?e.clientY:anchor.bottom+6;
 contextMenu.style.left=`${Math.max(8,Math.min(x,innerWidth-menu.width-8))}px`;
 contextMenu.style.top=`${Math.max(8,Math.min(y,innerHeight-menu.height-8))}px`;
 for(const trigger of [contextTarget,contextOpen])trigger.setAttribute('aria-expanded','true');
 contextOptions[0].focus({preventScroll:true});
}
contextTarget.oncontextmenu=context;
contextOpen.onclick=context;
contextTarget.onkeydown=e=>{if((e.key==='F10'&&e.shiftKey)||e.key==='ContextMenu')context(e)};
document.addEventListener('pointerdown',e=>{
 if(contextMenu.contains(e.target))return;
 // A fresh right-click on the target repositions the existing menu.
 if(e.button===2&&contextTarget.contains(e.target))return;
 closeContext(false);
},true);
contextMenu.addEventListener('contextmenu',e=>e.preventDefault());
contextMenu.addEventListener('keydown',e=>{
 const index=contextOptions.indexOf(document.activeElement);
 if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
  e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?contextOptions.length-1:(index+(e.key==='ArrowDown'?1:-1)+contextOptions.length)%contextOptions.length;contextOptions[next].focus();
 }else if(e.key==='Escape'||e.key==='Tab'){
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation()}
  closeContext(true);
 }
});
contextMenu.addEventListener('focusout',()=>queueMicrotask(()=>{if(!contextMenu.contains(document.activeElement))closeContext(false)}));
window.addEventListener('resize',()=>closeContext(true));
contextOptions.forEach(b=>{b.setAttribute('role','menuitem');b.tabIndex=-1;b.onclick=()=>{$('context-result').textContent=b.dataset.context;closeContext(true)}});
$('mark-read').onclick=()=>{document.querySelectorAll('.notification.unread').forEach(n=>n.classList.remove('unread'));$('unread-count').textContent='All caught up';$('mark-read').disabled=true};
const handle=$('resize-handle'),panels=$('split-panels');function split(n){n=Math.max(20,Math.min(70,n));panels.style.setProperty('--split',n+'%');handle.setAttribute('aria-valuenow',Math.round(n))}handle.onpointerdown=e=>{handle.setPointerCapture(e.pointerId)};handle.onpointermove=e=>{if(handle.hasPointerCapture(e.pointerId)){const r=panels.getBoundingClientRect();split((e.clientX-r.left)/r.width*100)}};handle.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();split(Number(handle.getAttribute('aria-valuenow'))+(e.key==='ArrowLeft'?-2:2))}};

initDataComponents();
initAppComponents();
initSurfaceComponents();
initWorkflowComponents();
initHtmlElements();

import('./developer-components.js').then(({initDeveloperComponents})=>initDeveloperComponents()).catch(error=>{document.getElementById('developer-status').textContent='Developer components could not load: '+error.message;console.error(error)});

const disposeProgressTooltips = initProgressTooltips();
window.addEventListener("pagehide", disposeProgressTooltips, { once: true });
