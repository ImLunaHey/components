import { defineChart, mountChart, lineY, areaY, barY, dot, cell } from '@tanstack/charts';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scalePoint } from '@tanstack/charts/scales/point';
import { scaleBand } from '@tanstack/charts/scales/band';
import { polar, radialArc, pie } from '@tanstack/charts/polar';
import { tooltip } from '@tanstack/charts/tooltip';
import { Virtualizer, observeElementRect, observeElementOffset, elementScroll } from '@tanstack/virtual-core';
import { createTable, getCoreRowModel, getGroupedRowModel, getExpandedRowModel, functionalUpdate } from '@tanstack/table-core';

const $ = id => document.getElementById(id);
const theme = { foreground:'var(--foreground)', muted:'var(--muted-foreground)', grid:'var(--border)', background:'transparent', palette:['var(--info)','var(--accent)','var(--warning)'] };
const numeric = (label,format=value=>String(value)) => ({scale:scaleLinear,grid:true,axis:{label,ticks:{count:4,format}}});
const categorical = () => ({scale:()=>scalePoint().padding(.35),grid:false});
const tip = format => ({use:tooltip,format});

export function initDataComponents(){
 const hosts=new Map();
 function chart(id,spec,label,onSelect,height=250){
  const scales=Object.fromEntries(Object.entries(spec.scales).map(([name,scale])=>[name,scale&&scale.axis!==false?{...scale,axis:{...scale.axis,tickLabels:{thin:{minGap:12,priority:'ends'},fontSize:11}}}:scale]));
  const options={definition:defineChart({theme,keyboard:true,tooltip,...spec,scales}),height,ariaLabel:label,onSelect};
  if(hosts.has(id))hosts.get(id).update(options);
  else hosts.set(id,mountChart($(id),options));
  $(id).dataset.engine='tanstack-charts';
 }
 let windowSize=12;
 const visibleSeries=new Set(['API','Worker']);
 function traffic(){
  const interval=windowSize===12?5:windowSize===24?15:30;
  const rows=Array.from({length:windowSize},(_,i)=>{
   const minutes=24*60-(windowSize-1-i)*interval;
   const label=String(Math.floor(minutes/60)%24).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');
   return ['API','Worker'].map((series,s)=>({time:label,series,value:Math.round(460+s*180+150*Math.sin(i*.6+s)+i*4),id:series+i}));
  }).flat().filter(row=>visibleSeries.has(row.series));
  chart('traffic-chart',{
   marks:[lineY(rows,{x:'time',y:'value',z:'series',key:'id',stroke:d=>d.series==='API'?'var(--info)':'var(--accent)',strokeWidth:2,points:true})],
   scales:{x:{...categorical(),axis:{ticks:{count:5}}},y:numeric('Requests / min')},focus:'group-x',
   tooltip:{use:tooltip,formatGroup:points=>[points[0]?.datum.time,...points.map(p=>`${p.datum.series}: ${p.datum.value} req/min`)].join('\n')},
  },'Request traffic for API and worker services',undefined,280);
 }
 $('chart-window').querySelectorAll('button').forEach(b=>b.onclick=()=>{windowSize=Number(b.dataset.window);$('chart-window').querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));traffic()});
 $('traffic-legend').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(visibleSeries.has(b.dataset.series)){if(visibleSeries.size===1)return;visibleSeries.delete(b.dataset.series)}else visibleSeries.add(b.dataset.series);b.setAttribute('aria-pressed',String(visibleSeries.has(b.dataset.series)));traffic()});
 traffic();

 const memory=Array.from({length:8},(_,i)=>({time:`${16+i}:00`,app:6.2+i*.45+Math.sin(i)*.8,cache:2.2+Math.cos(i)*.3}));
 chart('memory-chart',{
  marks:[areaY(memory,{x:'time',y1:0,y2:'app',fill:'var(--info)',fillOpacity:.55}),areaY(memory,{x:'time',y1:'app',y2:d=>d.app+d.cache,fill:'var(--accent)',fillOpacity:.65})],
  scales:{x:{...categorical(),axis:{ticks:{count:4}}},y:numeric('Memory (GiB)',v=>v.toFixed(0))},
  tooltip:tip(p=>`${p.datum.time}\nApplication: ${p.datum.app.toFixed(1)} GiB\nCache: ${p.datum.cache.toFixed(1)} GiB`),
 },'Application and cache memory usage in GiB');

 const deployments=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day,i)=>({day,completed:[24,39,31,48,35,19,16][i],failed:[2,1,4,2,3,0,1][i]}));
 let sorted=false;
 function bars(){
  const days=sorted?[...deployments].sort((a,b)=>(b.completed+b.failed)-(a.completed+a.failed)):deployments;
  const rows=days.flatMap(d=>[{day:d.day,status:'Completed',value:d.completed},{day:d.day,status:'Failed',value:d.failed}]);
  chart('deploy-chart',{marks:[barY(rows,{x:'day',y:'value',z:'status',fill:d=>d.status==='Completed'?'var(--success)':'var(--destructive)',inset:3,radius:2})],scales:{x:{scale:()=>scaleBand().padding(.2)},y:numeric('Builds')},focus:'group-x',tooltip:{use:tooltip,formatGroup:points=>[points[0]?.datum.day,...points.map(p=>`${p.datum.status}: ${p.datum.value}`)].join('\n')}},'Completed and failed deployments by day');
 }
 $('bar-sort').onclick=()=>{sorted=!sorted;$('bar-sort').textContent=sorted?'Sort by day':'Sort by total';bars()};bars();

 const storage=[{name:'Media',value:2.4,colour:'var(--info)'},{name:'Backups',value:1.6,colour:'var(--accent)'},{name:'Projects',value:1.1,colour:'var(--warning)'}];
 chart('storage-chart',{marks:[polar({inset:12,marks:[radialArc(pie(storage,{value:'value',gapAngle:.025}),{key:'name',innerRadius:c=>c.radius*.68,fill:d=>d.colour})],scales:{angle:null,radius:null}})],guides:false,scales:{x:null,y:null},tooltip:tip(p=>`${p.datum.name}: ${p.datum.value.toFixed(1)} TB (${Math.round(p.datum.fraction*100)}%)`)},'Storage breakdown: media 2.4 TB, backups 1.6 TB, projects 1.1 TB',p=>{if(p)$('storage-selection').textContent=`${p.datum.name} · ${p.datum.value.toFixed(1)} TB · ${Math.round(p.datum.fraction*100)}% of storage`});

 const samples=Array.from({length:48},(_,i)=>({id:`REQ-${4100+i}`,load:Math.round(12+(i*17)%78),latency:Math.round(20+(i*17)%78*1.9+Math.sin(i)*24)}));
 chart('latency-chart',{marks:[dot(samples,{x:'load',y:'latency',key:'id',r:4,fill:'var(--accent)',fillOpacity:.75,stroke:'var(--card)',strokeWidth:1})],scales:{x:numeric('CPU load (%)'),y:numeric('Latency (ms)')},tooltip:tip(p=>`${p.datum.id}\nCPU: ${p.datum.load}% · Latency: ${p.datum.latency} ms`)},'Relationship between CPU load and request latency',p=>{if(p)$('latency-selection').textContent=`${p.datum.id} · CPU ${p.datum.load}% · ${p.datum.latency} ms`});

 const activity=['API','Worker','Storage','Auth'].flatMap((service,s)=>Array.from({length:12},(_,i)=>({service,hour:String(i*2).padStart(2,'0')+':00',value:20+((i*31+s*17)%110)})));
 chart('activity-chart',{marks:Array.from({length:5},(_,bucket)=>cell(activity.filter(d=>Math.floor(d.value/30)===bucket),{x:'hour',y:'service',inset:2,radius:3,fill:`color-mix(in srgb, var(--info) ${20+bucket*20}%, var(--secondary))`})),scales:{x:{scale:scaleBand().domain(Array.from({length:12},(_,i)=>String(i*2).padStart(2,'0')+':00')).padding(.04),axis:{ticks:{count:6}}},y:{scale:scaleBand().domain(['API','Worker','Storage','Auth']).padding(.08)}},tooltip:tip(p=>`${p.datum.service} · ${p.datum.hour}\n${p.datum.value} requests`)},'Service requests per two-hour bucket',undefined,240);

 // Window a large log with the real TanStack Virtual core; filtering retains original event IDs.
 const events=Array.from({length:10000},(_,i)=>({id:i+1,time:new Date(Date.UTC(2026,10,23,9,0,i)).toISOString().slice(11,19),level:i%37===0?'ERROR':i%13===0?'WARN':'INFO',message:i%37===0?'Worker · upstream timeout; retry scheduled':i%13===0?'Storage · response slower than expected':`API · request completed · /v1/${['projects','events','users','health'][i%4]}`}));
 let filtered=events;
 const scroller=$('virtual-log'),spacer=$('log-spacer');
 function renderLog(instance){
  const items=instance.getVirtualItems();spacer.style.height=`${instance.getTotalSize()}px`;spacer.replaceChildren();
  if(!filtered.length){const empty=document.createElement('p');empty.className='log-empty';empty.textContent='No events match these filters.';spacer.append(empty)}
  for(const item of items){
   const row=filtered[item.index];if(!row)continue;
   const line=document.createElement('div');line.className='log-row';line.setAttribute('role','listitem');line.setAttribute('aria-setsize',filtered.length);line.setAttribute('aria-posinset',item.index+1);line.style.transform=`translateY(${item.start}px)`;
   [String(row.id).padStart(5,'0'),row.time,row.level,row.message].forEach((value,j)=>{const span=document.createElement('span');span.textContent=value;span.className=j===2?(row.level==='ERROR'?'error':row.level==='WARN'?'warning':'info'):j===3?'log-message':'muted';if(j===3)span.title=value;line.append(span)});spacer.append(line);
  }
  $('log-count').textContent=`${filtered.length.toLocaleString()} matching events · ${items.length} rows rendered${items.length?` · ${items[0].index+1}–${items.at(-1).index+1}`:''}`;
 }
 const virtualizer=new Virtualizer({count:filtered.length,getScrollElement:()=>scroller,estimateSize:()=>40,overscan:5,observeElementRect,observeElementOffset,scrollToFn:elementScroll,onChange:renderLog,getItemKey:index=>filtered[index]?.id??index});
 const cleanup=virtualizer._didMount();virtualizer._willUpdate();renderLog(virtualizer);scroller.dataset.engine='tanstack-virtual';
 function filterLog(){const query=$('log-search').value.toLowerCase(),level=$('log-level').value;filtered=events.filter(e=>(level==='all'||e.level===level)&&`${e.id} ${e.time} ${e.message}`.toLowerCase().includes(query));virtualizer.setOptions({...virtualizer.options,count:filtered.length,getItemKey:index=>filtered[index]?.id??index});virtualizer.scrollToOffset(0);virtualizer._willUpdate();renderLog(virtualizer)}
 $('log-search').oninput=filterLog;$('log-level').onchange=filterLog;$('log-latest').onclick=()=>{if(filtered.length)virtualizer.scrollToIndex(filtered.length-1,{align:'end'})};

 const resources=['Production','Preview','Development'].flatMap((environment,e)=>['API','Worker','Storage'].map((service,i)=>({environment,service,requests:[640,320,180][i]*(3-e),memory:[4.2,2.8,1.5][i]*(3-e),services:1})));
 let table,state;
 table=createTable({data:resources,columns:[{id:'environment',accessorKey:'environment'},{id:'service',accessorKey:'service'},{id:'requests',accessorKey:'requests',aggregationFn:'sum'},{id:'memory',accessorKey:'memory',aggregationFn:'sum'},{id:'services',accessorKey:'services',aggregationFn:'sum'}],initialState:{grouping:['environment'],expanded:true},getCoreRowModel:getCoreRowModel(),getGroupedRowModel:getGroupedRowModel(),getExpandedRowModel:getExpandedRowModel(),onStateChange:updater=>{state=functionalUpdate(updater,state);table.setOptions(old=>({...old,state}));renderResources()}});
 state={...table.initialState,grouping:['environment'],expanded:true};table.setOptions(old=>({...old,state}));
 function renderResources(){
  const body=$('grouped-table').tBodies[0];body.replaceChildren();
  for(const row of table.getRowModel().rows){const tr=body.insertRow();tr.className=row.getIsGrouped()?'resource-group':'resource-child';const name=tr.insertCell();if(row.getIsGrouped()){const button=document.createElement('button');button.className='group-toggle';button.textContent=(row.getIsExpanded()?'▾ ':'▸ ')+row.getValue('environment');button.setAttribute('aria-expanded',String(row.getIsExpanded()));button.onclick=row.getToggleExpandedHandler();name.append(button)}else name.textContent=row.getValue('service');for(const id of ['requests','memory','services'])tr.insertCell().textContent=Number(row.getValue(id)).toLocaleString('en-GB',{maximumFractionDigits:id==='memory'?1:0})}
  $('group-expand').textContent=table.getIsAllRowsExpanded()?'Collapse all':'Expand all';
 }
 $('group-expand').onclick=()=>table.toggleAllRowsExpanded(!table.getIsAllRowsExpanded());renderResources();$('grouped-table').dataset.engine='tanstack-table';

 window.addEventListener('pagehide',()=>{cleanup();hosts.forEach(host=>host.destroy())},{once:true});
}
