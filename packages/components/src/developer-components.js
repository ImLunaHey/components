import { File, FileDiff, UnresolvedFile } from '@pierre/diffs';
import { FileTree } from '@pierre/trees';
import { renderToHtml } from '@pierre/words/no-math';
import { codeToHtml } from '@pierre/highlights';
import darkTheme from '@pierre/highlights/themes/pierre-dark';
import lightTheme from '@pierre/highlights/themes/pierre-light';
import DOMPurify from 'dompurify';
import { files } from './file-samples.js';

const $=id=>document.getElementById(id);
const mode=()=>document.documentElement.dataset.theme==='dark'?'dark':'light';
const decoder=new TextDecoder();
const codeCSS=':host{--diffs-font-family:var(--font-mono,monospace);--diffs-font-size:12px;--diffs-line-height:22px}pre{--diffs-bg:var(--card);font-size:12px}';
const options=()=>({theme:{dark:'pierre-dark',light:'pierre-light'},themeType:mode(),preferredHighlighter:'highlights',overflow:'wrap',unsafeCSS:codeCSS});

export function initDeveloperComponents(){
 const instances=[];
 const fileView=new File({...options(),disableFileHeader:true,enableLineSelection:true});instances.push(fileView);
 const paths=Object.keys(files).map(name=>(name==='colours.ts'||name==='spacing.ts'?'tokens/':name.includes('Chart')?'components/charts/':'components/')+name);
 function showFile(path){const name=path.split('/').at(-1);if(!(name in files))return;$('file-preview-name').textContent=path;fileView.render({file:{name:path,contents:files[name],lang:'typescript'},containerWrapper:$('file-preview-code')})}
 const tree=new FileTree({paths,initialExpansion:'open',initialSelectedPaths:[paths[0]],search:false,fileTreeSearchMode:'hide-non-matches',gitStatus:[{path:paths[0],status:'modified'},{path:'tokens/colours.ts',status:'added'}],onSelectionChange:selected=>{if(selected.length)showFile(selected.at(-1))},unsafeCSS:':host{--trees-bg-override:var(--secondary);--trees-bg-muted-override:var(--muted);--trees-fg-override:var(--foreground);--trees-fg-muted-override:var(--muted-foreground);--trees-border-color-override:var(--border);--trees-accent-override:var(--accent);--trees-font-family:var(--font-sans)}'});
 tree.render({containerWrapper:$('pierre-file-tree')});$('file-search').oninput=e=>tree.setSearch(e.target.value||null);showFile(paths[0]);
 $('pierre-file-tree').dataset.engine='pierre-trees';$('file-preview-code').dataset.engine='pierre-diffs';

 const oldFile={name:'src/retry.ts',contents:'export async function request(url: string) {\n  const response = await fetch(url);\n  if (!response.ok) {\n    throw new Error("Request failed");\n  }\n  return response.json();\n}\n',lang:'typescript'};
 const newFile={name:'src/retry.ts',contents:'export async function request(url: string, retries = 3) {\n  for (let attempt = 0; attempt <= retries; attempt++) {\n    const response = await fetch(url);\n    if (response.ok) return response.json();\n    if (attempt === retries) {\n      throw new Error(`Request failed: ${response.status}`);\n    }\n    await new Promise(resolve => setTimeout(resolve, 250 * 2 ** attempt));\n  }\n}\n',lang:'typescript'};
 let layout='split';
 const diff=new FileDiff();instances.push(diff);
 function renderDiff(){diff.setOptions({...options(),diffStyle:layout,lineDiffType:'word-alt',overflow:$('diff-wrap').checked?'wrap':'scroll',enableLineSelection:true,onLineSelected:range=>{$('diff-selection').textContent=range?`${range.side==='deletions'?'Before':'After'} · lines ${range.start}–${range.end}`:'Select line numbers to inspect a range.'}});diff.render({oldFile,newFile,containerWrapper:$('code-diff'),forceRender:true})}
 $('diff-layout').querySelectorAll('button').forEach(b=>b.onclick=()=>{layout=b.dataset.layout;$('diff-layout').querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));renderDiff()});$('diff-wrap').onchange=renderDiff;renderDiff();

 const conflictFile={name:'src/retry-policy.ts',lang:'typescript',contents:'export const retryPolicy = {\n<<<<<<< HEAD\n  attempts: 3,\n  timeout: 5000,\n=======\n  attempts: 5,\n  timeout: 10000,\n>>>>>>> feature/resilient-requests\n  backoff: "exponential",\n};\n'};
 let conflict;
 function resetConflict(){conflict?.cleanUp();$('merge-conflict').replaceChildren();conflict=new UnresolvedFile({...options(),onMergeConflictResolve:file=>{$('conflict-status').textContent=file.contents.includes('<<<<<<<')?'Unresolved conflict remains.':'Resolved locally · the selected changes are shown above.'}});conflict.render({file:{...conflictFile},containerWrapper:$('merge-conflict')});$('conflict-status').textContent='1 unresolved conflict · retry policy'}
 $('conflict-reset').onclick=resetConflict;resetConflict();

 let resolved=false;
 const review=new File({...options(),renderAnnotation:()=>{
  const thread=document.createElement('div');thread.className='review-thread';
  const author=document.createElement('strong');author.textContent='Alex K. · review';
  const message=document.createElement('p');message.textContent='Could we add jitter to the backoff so concurrent workers do not retry at the same time?';
  const button=document.createElement('button');button.textContent=resolved?'Reopen thread':'Resolve thread';button.onclick=()=>{resolved=!resolved;button.textContent=resolved?'Reopen thread':'Resolve thread';$('review-badge').textContent=resolved?'Thread resolved':'1 open thread';$('review-badge').className='badge '+(resolved?'success':'warning')};thread.append(author,message,button);return thread;
 }});instances.push(review);review.render({file:newFile,lineAnnotations:[{lineNumber:8,metadata:{id:'retry-review'}}],containerWrapper:$('annotated-code')});

 const initialMarkdown='# Release notes\n\nA **small update** to the component library.\n\n- [x] Add syntax highlighting\n- [x] Add file diffs\n- [ ] Review mobile layouts\n\n| Component | State |\n| --- | --- |\n| Trees | Ready |\n| Diffs | Ready |\n\n> Changes stay in this local preview.\n\nVisit [Pierre](https://diffs.com) or inspect `retryPolicy`.\n';
 function markdown(){try{const html=decoder.decode(renderToHtml($('markdown-input').value,{skipHtml:true}));$('markdown-preview').innerHTML=DOMPurify.sanitize(html);$('markdown-status').textContent=`${$('markdown-input').value.length} characters · rendered with @pierre/words`}catch(error){$('markdown-status').textContent='Could not render Markdown: '+error.message}}
 $('markdown-input').value=initialMarkdown;$('markdown-input').oninput=markdown;$('markdown-reset').onclick=()=>{$('markdown-input').value=initialMarkdown;markdown()};markdown();

 const samples={typescript:'interface Project {\n  id: string;\n  name: string;\n  archived: boolean;\n}\n\nexport function activeProjects(items: Project[]) {\n  // Keep the original list unchanged.\n  return items.filter(item => !item.archived);\n}\n',json:'{\n  "name": "Component library",\n  "version": 1,\n  "private": true,\n  "features": ["charts", "diffs", "trees"]\n}',css:'.card {\n  display: grid;\n  gap: 12px;\n  border: 1px solid var(--border);\n  background: #1e1e1e;\n}\n\n.card:hover {\n  border-color: #b9a2e8;\n}',bash:'# Build the component gallery\nnpm install\nnpm run build\n\nif [ -d design ]; then\n  echo "Gallery is ready"\nfi\n'};
 function highlight(){try{$('syntax-preview').innerHTML=decoder.decode(codeToHtml($('syntax-input').value,{lang:$('syntax-language').value,theme:mode()==='dark'?darkTheme:lightTheme}))}catch(error){$('syntax-preview').textContent='Could not highlight: '+error.message}}
 $('syntax-language').onchange=()=>{$('syntax-input').value=samples[$('syntax-language').value];highlight()};$('syntax-input').oninput=highlight;$('syntax-input').value=samples.typescript;highlight();

 function jsonNode(key,value,depth=0){
  const label=document.createElement('span');label.className='json-key';label.textContent=String(key);
  if(value!==null&&typeof value==='object'){
   const details=document.createElement('details');details.open=depth<2;const summary=document.createElement('summary');summary.append(label,document.createTextNode(` ${Array.isArray(value)?'[':'{'}${Object.keys(value).length}${Array.isArray(value)?']':'}'}`));details.append(summary);for(const [k,v]of Object.entries(value))details.append(jsonNode(k,v,depth+1));return details;
  }
  const row=document.createElement('div');row.className='json-leaf';const content=document.createElement('span');content.className='json-value';content.textContent=JSON.stringify(value);row.append(label,document.createTextNode(': '),content);return row;
 }
 function inspectJSON(format=false){try{const value=JSON.parse($('json-input').value);if(format)$('json-input').value=JSON.stringify(value,null,2);$('json-preview').replaceChildren(jsonNode('root',value));$('json-status').textContent='Valid JSON';$('json-status').classList.remove('error');$('json-input').removeAttribute('aria-invalid')}catch(error){$('json-preview').replaceChildren();$('json-status').textContent=error.message;$('json-status').classList.add('error');$('json-input').setAttribute('aria-invalid','true')}}
 $('json-input').value=JSON.stringify({project:{name:'Component library',private:true},services:[{name:'API',healthy:true},{name:'Worker',healthy:false}],lastError:null},null,2);$('json-input').oninput=()=>inspectJSON();$('json-format').onclick=()=>inspectJSON(true);inspectJSON();

 const history=[];let historyIndex=0;
 function terminal(text,className=''){const line=document.createElement('div');line.textContent=text;line.className=className;$('terminal-output').append(line);$('terminal-output').scrollTop=$('terminal-output').scrollHeight}
 terminal('Component workspace · simulated terminal','muted');terminal('Type help for available demo commands.');
 $('terminal-form').onsubmit=e=>{e.preventDefault();const command=$('terminal-command').value.trim();if(!command)return;history.push(command);historyIndex=history.length;$('terminal-command').value='';if(command==='clear'){$('terminal-output').replaceChildren();return}terminal('❯ '+command,'info');if(command==='help')terminal('help    Show commands\nstatus  Show workspace status\nbuild   Show a sample build result\nclear   Clear the terminal');else if(command==='status')terminal('3 services online · 0 pending changes','success');else if(command==='build')terminal('✓ Sample build complete\n  Sample assets generated · no files written','success');else terminal('Unknown demo command. Try help.','warning')};
 $('terminal-command').onkeydown=e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();historyIndex=Math.max(0,Math.min(history.length,historyIndex+(e.key==='ArrowUp'?-1:1)));$('terminal-command').value=history[historyIndex]||''}};

 const themeObserver=new MutationObserver(()=>{instances.forEach(instance=>instance.setThemeType(mode()));conflict.setThemeType(mode());highlight()});themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 $('developer-status').textContent='';$('developer-status').hidden=true;
 window.addEventListener('pagehide',()=>{themeObserver.disconnect();tree.cleanUp();instances.forEach(instance=>instance.cleanUp());conflict.cleanUp()},{once:true});
}
