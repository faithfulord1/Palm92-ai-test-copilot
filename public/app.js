const out = document.querySelector('#output');
const req = document.querySelector('#req');

async function call(path, body) {
  out.textContent = 'Working...';
  try {
    const response = await fetch(path, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data = await response.json();
    out.textContent = JSON.stringify(data,null,2);
  } catch (error) {
    out.textContent = `Request failed: ${error.message}`;
  }
}

document.querySelector('#analyse').addEventListener('click',()=>call('/api/analyze',{text:req.value}));
document.querySelector('#generate').addEventListener('click',()=>call('/api/tests',{text:req.value,requirementId:'REQ-DEMO'}));
