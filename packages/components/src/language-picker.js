window.LanguagePicker=(()=>{
const flags=Object.fromEntries(['us','jp','fr','de'].map(country=>[country,'/assets/flags/'+country.toUpperCase()+'.svg']));
const metadata={English:{country:'us',code:'en',native:'English'},Japanese:{country:'jp',code:'ja',native:'日本語'},French:{country:'fr',code:'fr',native:'Français'},German:{country:'de',code:'de',native:'Deutsch'}};
function icon(option){const entry=metadata[option.value];if(entry){const image=document.createElement('img');image.className='pc-flag';image.src=flags[entry.country];image.alt='';image.setAttribute('aria-hidden','true');return image}const globe=document.createElement('span');globe.className='pc-all-languages';globe.textContent='◎';globe.setAttribute('aria-hidden','true');return globe}
function renderOption(option){const row=document.createElement('span');row.className='pc-language';row.append(icon(option));const copy=document.createElement('span');copy.className='pc-language-copy';copy.textContent=option.label;const entry=metadata[option.value];if(entry&&entry.code!=='ja'&&entry.native!==option.label){const native=document.createElement('small');native.textContent=entry.native;copy.append(native)}row.append(copy);if(entry){const code=document.createElement('span');code.className='pc-language-code';code.textContent=entry.code;row.append(code)}return row}
return {mount(native){return ComponentPickers.select(native,{searchable:true,keywords:Object.fromEntries(Object.entries(metadata).map(([name,m])=>[name,m.code+' '+m.native])),renderOption,renderPrefix:icon})}};})();


