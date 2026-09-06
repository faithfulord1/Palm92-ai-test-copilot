let selected='clean';
let currentAnalysis=null;
const output=document.getElementById('output');
const summary=document.getElementById('summary');

function show(value){output.textContent=JSON.stringify(value,null,2);}
function setSummary(analysis){
  summary.className='status ' + (analysis.status==='READY_FOR_HUMAN_APPROVAL'?'ok':analysis.blockingFindingCount?'bad':'warn');
  summary.innerHTML=`<strong>${analysis.status}</strong><br>Risk score: ${analysis.riskScore}/100 · Findings: ${analysis.findings.length} · Blocking: ${analysis.blockingFindingCount}`;
}

async function api(path,body){
  const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body||{})});
  const data=await response.json();
  if(!response.ok) throw new Error(data.error||'Request failed');
  return data;
}

async function analyse(){
  currentAnalysis=await api('/api/refx-insurance/analyze',{scenario:selected});
  setSummary(currentAnalysis);
  show(currentAnalysis);
}

document.getElementById('clean').onclick=async()=>{selected='clean';currentAnalysis=null;summary.className='status';summary.textContent='Clean scenario selected. Run analysis.';show(await api('/api/refx-insurance/sample',{scenario:'clean'}));};
document.getElementById('anomaly').onclick=async()=>{selected='anomaly';currentAnalysis=null;summary.className='status warn';summary.textContent='Risky scenario selected. Run analysis.';show(await api('/api/refx-insurance/sample',{scenario:'anomaly'}));};
document.getElementById('analyse').onclick=()=>analyse().catch((error)=>show({error:error.message}));
document.getElementById('request').onclick=async()=>{try{if(!currentAnalysis) await analyse();show(await api('/api/refx-insurance/decision',{analysis:currentAnalysis,approved:false}));}catch(error){show({error:error.message});}};
document.getElementById('approve').onclick=async()=>{try{if(!currentAnalysis) await analyse();show(await api('/api/refx-insurance/decision',{analysis:currentAnalysis,approved:true,approver:'Faith Wright',comment:'Reviewed in Palm92 portfolio demo.'}));}catch(error){show({error:error.message});}};
