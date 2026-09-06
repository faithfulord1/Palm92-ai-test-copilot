const out = document.querySelector('#output');
const req = document.querySelector('#req');

async function call(path, body, method='POST') {
  out.textContent = 'Working...';
  try {
    const response = await fetch(path, {
      method,
      headers: body ? {'Content-Type':'application/json'} : {},
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json();
    out.textContent = JSON.stringify(data,null,2);
  } catch (error) {
    out.textContent = `Request failed: ${error.message}`;
  }
}

document.querySelector('#analyse').addEventListener('click',()=>call('/api/analyze',{text:req.value}));
document.querySelector('#generate').addEventListener('click',()=>call('/api/tests',{text:req.value,requirementId:'STEVE-REQ-001'}));
document.querySelector('#antonio').addEventListener('click',()=>call('/api/demo/antonio',null,'GET'));
document.querySelector('#evidence').addEventListener('click',()=>call('/api/evidence',{
  correlationId:'STEVE-EVID-001',
  beforeState:{testStatus:'Pending',requirement:'Sensitive profile changes require confirmation'},
  action:'Execute governed test and capture the observed result',
  expected:'Unapproved sensitive action is blocked',
  actual:'Action remained blocked until explicit human approval',
  afterState:{testStatus:'Evidence captured',decision:'Human review required'},
  verification:'Result checked against the acceptance criterion and approval policy',
  environment:'Steve demo',
  tester:'Faith Wright',
  approval:'Pending reviewer sign-off'
}));
document.querySelector('#blocked').addEventListener('click',()=>call('/api/sensitive-action',{
  action:'Send customer data to an external email address',
  approved:false
}));
document.querySelector('#approved').addEventListener('click',()=>call('/api/sensitive-action',{
  action:'Send customer data to an external email address',
  approved:true,
  approver:'Faith Wright'
}));
