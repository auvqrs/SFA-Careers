import { jobs } from './jobs.js';

// --- Configuration ---
const WEBHOOK_URL = "https://discord.com/api/webhooks/1440788753311469750/iCSQAL-yysfGv419hIyqM62PB_mSod8m7QMygCFDncI6Y2tTupSJRqsdaWvKOen7MZpH";

window.jobsData = jobs; // Make jobs data accessible globally for reference

// --- Departments & subjects mapping ---
const DEPARTMENTS = {
  core: ['English','Maths','Science'],
  humanities: ['History','Geography','Religious Education'],
  languages: ['German','French','Spanish'],
  creative: ['Art & Design','Drama','Music','Fashion Design'],
  tech: ['Food Technology','Design Technology','Computer Science'],
  social: ['Sociology','Child Development','Business','Psychology','Economics'],
  pe: ['Physical Education','Sports Science']
};

function renderJobs() {
  const grid = document.getElementById('jobsGrid');
  grid.innerHTML = '';
  jobs.forEach((job) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.id = `jobCard_${job.id}`;

    card.innerHTML = `
      <div class="posted">Posted on: ${job.posted_at}</div>
      <div class="title">${job.title}</div>
      <div class="short-desc" id="shortDesc_${job.id}">${job.short_description}</div>
      <div class="muted hidden" id="fullDesc_${job.id}">${job.full_description}</div>
      <div style="display:flex;gap:10px;margin-top:12px">
        <button class="btn small" id="toggleBtn_${job.id}">Show More</button>
        <button class="btn" id="applyBtn_${job.id}">Apply Now</button>
      </div>
    `;
    grid.appendChild(card);

    card.querySelector(`#toggleBtn_${job.id}`).addEventListener('click', () => toggleDesc(job.id));
    card.querySelector(`#applyBtn_${job.id}`).addEventListener('click', () => openApplication(job));
  });
}
renderJobs();

window.toggleDesc = function(jobId){
  const full = document.getElementById('fullDesc_' + jobId);
  const btn = document.getElementById('toggleBtn_' + jobId);
  if(full.classList.contains('hidden')){
    full.classList.remove('hidden');
    btn.textContent='Show Less';
  } else {
    full.classList.add('hidden');
    btn.textContent='Show More';
  }
};

let currentJob = null;
window.openApplication = function(job){
  currentJob = job;
  document.getElementById('jobsGrid').style.display = 'none';          // HIDE careers grid
  document.getElementById('applicationPage').style.display = 'block';  // SHOW application page

  // populate overview
  document.getElementById('roleTitle').textContent = 'Role: ' + (job.title || '—');
  document.getElementById('roleShort').textContent = job.short_description;
  document.getElementById('jobOverviewContainer').style.display='';
  document.getElementById('applicationForm').classList.add('hidden');

  // Pre-select department and load subjects if available
  if(job.department){
    document.getElementById('department').value = departmentValueFromName(job.department);
    loadSubjects();
    if(job.subjects) {
      // check those checkboxes
      setTimeout(() => { // Allow DOM to update
        const subjectChks = document.querySelectorAll('.subjectChk');
        job.subjects.forEach(subject=>{
          subjectChks.forEach(chk=>{
            if(chk.value.toLowerCase() === subject.toLowerCase()){ chk.checked=true; }
          });
        });
      }, 10);
    }
  }
};

// NEW: Page navigation logic
window.goBackToCareers = function(){
  document.getElementById('applicationPage').style.display = 'none';   // HIDE application page
  document.getElementById('jobsGrid').style.display = 'grid';          // SHOW careers grid
  document.getElementById('applicationForm').classList.add('hidden');
  document.getElementById('jobOverviewContainer').style.display='';
  currentJob = null;
};

window.beginApplication = function(){
  document.getElementById('applicationForm').classList.remove('hidden');
  document.getElementById('jobOverviewContainer').style.display='none';
};

function departmentValueFromName(name) {
  for (const [key, arr] of Object.entries(DEPARTMENTS)) {
    if (arr.map(s=>s.toLowerCase()).includes((name||'').toLowerCase()) || key.toLowerCase()===name.toLowerCase())
      return key;
    if((name||'').toLowerCase().includes(key)) return key;
  }
  const map = {
    "Core Subjects": "core",
    "Humanities": "humanities",
    "Languages":"languages",
    "Creative Arts":"creative",
    "Technology":"tech",
    "Social Sciences":"social",
    "PE":"pe"
  };
  return map[name]||'';
}

window.loadSubjects = function(){
  const dep = document.getElementById('department').value;
  const box = document.getElementById('subjectsBox');
  box.innerHTML='';
  if(!dep){ box.textContent='Please choose a department first.'; return; }
  const subjects = DEPARTMENTS[dep] || [];
  const frag = document.createElement('div');
  subjects.forEach(s => {
    const id = 'sub_' + s.replace(/[^a-z0-9]/ig,'_');
    const lbl = document.createElement('label');
    lbl.style.display='block';
    lbl.style.marginBottom='6px';
    lbl.innerHTML = `<input type="checkbox" id="${id}" value="${s}" class="subjectChk" /> ${s}`;
    frag.appendChild(lbl);
  });
  box.appendChild(frag);
};

window.showExpModal = function(){ document.getElementById('expModal').style.display='flex'; };
window.hideExpModal = function(){ document.getElementById('expModal').style.display='none'; clearExpModal(); };
function clearExpModal(){ document.getElementById('expGroup').value=''; document.getElementById('expRank').value=''; document.getElementById('expTime').value=''; }
window.saveExperience = function(){
  const group = document.getElementById('expGroup').value.trim();
  const rank = document.getElementById('expRank').value.trim();
  const time = document.getElementById('expTime').value.trim();
  if(!group && !rank && !time){ alert('Please enter at least one field for the experience.'); return; }
  const container = document.getElementById('expList');
  const div = document.createElement('div');
  div.className='exp-entry';
  div.textContent = `${group || '—'} | ${rank || '—'} | ${time || '—'}`;
  const rem = document.createElement('button'); rem.className='btn ghost small'; rem.style.marginLeft='8px'; rem.textContent='Remove';
  rem.onclick = ()=>{ container.removeChild(div); };
  div.appendChild(rem);
  container.appendChild(div);
  window.hideExpModal();
};

window.resetForm = function(){
  if(confirm('Reset the application form?')){
    document.getElementById('applicationForm').reset();
    document.getElementById('expList').innerHTML='';
    document.getElementById('formError').style.display='none';
  }
};

window.submitApplication = function(){
  const errBox = document.getElementById('formError'); errBox.style.display='none'; errBox.textContent='';
  const roblox = document.getElementById('robloxUsername').value.trim();
  const discord = document.getElementById('discordUsername').value.trim();
  const tz = document.getElementById('timeZone').value.trim();
  const email = document.getElementById('email').value.trim();
  const dep = document.getElementById('department').value;
  const interest = document.getElementById('interest').value.trim();

  if(!roblox || !discord || !tz || !email || !dep || !interest){ errBox.style.display='block'; errBox.textContent='Please fill all required fields.'; return; }
  if(interest.length < 50){ errBox.style.display='block'; errBox.textContent='Your answer for why you are interested must be at least 50 characters.'; return; }

  const selectedSubjects = Array.from(document.querySelectorAll('.subjectChk:checked')).map(i=>i.value);
  if(selectedSubjects.length < 1){ errBox.style.display='block'; errBox.textContent='Please select at least one subject in your chosen department.'; return; }

  const selectedDays = Array.from(document.querySelectorAll('.dayChk:checked')).map(i=>i.value);
  if(selectedDays.length < 4){ errBox.style.display='block'; errBox.textContent='You must select at least 4 working days.'; return; }

  const experiences = Array.from(document.querySelectorAll('.exp-entry')).map(e=>e.firstChild.textContent.trim());

  const fields = [
    { name: 'Roblox Username', value: roblox || '—' },
    { name: 'Discord Username', value: discord || '—' },
    { name: 'Time Zone', value: tz || '—' },
    { name: 'Email', value: email || '—' },
    { name: 'Department', value: dep || '—' },
    { name: 'Subjects', value: selectedSubjects.join(', ') || '—' },
    { name: 'Working Days', value: selectedDays.join(', ') || '—' },
    { name: 'Why interested', value: interest.substring(0,1000) || '—' },
    { name: 'Extra', value: (document.getElementById('extra').value || '—').substring(0,1000) }
  ];
  if(experiences.length) fields.push({ name: 'Experience', value: experiences.join(' | ').substring(0,1000) });

  const payload = {
    embeds: [{
      title: 'New Staff Application — Suffield Academy',
      color: 5814783,
      fields: fields,
      timestamp: new Date().toISOString()
    }]
  };

  fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(async res => {
    if(res.ok){
      alert('Application submitted successfully!');
      window.resetForm();
      window.goBackToCareers();
    } else {
      const text = await res.text();
      alert('Failed to submit application. Webhook returned: ' + res.status + ' \n' + text);
    }
  }).catch(err => { alert('Error sending webhook: ' + err.message); });
};