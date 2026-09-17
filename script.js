const $ = id => document.getElementById(id);
let students = [];
let pendingDelete = null;

async function loadStudents(){
  try{
    const res = await fetch("/api/students");
    students = await res.json();
    updateStats();
    renderStudents();
  }catch(e){ showToast("Could not load student records."); }
}

function updateStats(){
  $("totalCount").textContent = students.length;
  $("cseCount").textContent = students.filter(s=>s.department==="CSE").length;
  $("activeCount").textContent = students.length;
  $("deptCount").textContent = new Set(students.map(s=>s.department)).size;
}

function renderStudents(){
  const term = $("search").value.toLowerCase().trim();
  const dept = $("departmentFilter").value;
  const year = $("yearFilter").value;
  const filtered = students.filter(s =>
    (!dept || s.department===dept) &&
    (!year || String(s.year)===year) &&
    `${s.name} ${s.email} ${s.department} ${s.year}`.toLowerCase().includes(term)
  );
  if(!filtered.length){
    $("studentGrid").innerHTML = `<div class="empty">No student records match your search.</div>`;
    return;
  }
  $("studentGrid").innerHTML = filtered.map(s=>{
    const initials = s.name.split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
    return `<article class="student-card">
      <div class="student-top"><div class="avatar">${escapeHtml(initials)}</div><span class="badge">${escapeHtml(s.department)}</span></div>
      <h3>${escapeHtml(s.name)}</h3><div class="email">${escapeHtml(s.email)}</div>
      <div class="student-meta"><span>Student ID · STU-${String(s.id).padStart(4,"0")}</span><span>${s.year}${s.year==1?"st":s.year==2?"nd":s.year==3?"rd":"th"} Year</span></div>
      <div class="card-actions"><button class="small-btn" onclick="editStudent(${s.id})">✎ Edit</button><button class="small-btn delete" onclick="askDelete(${s.id})">⌫ Delete</button></div>
    </article>`;
  }).join("");
}

function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}

$("studentForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const id = $("studentId").value;
  const payload = {name:$("name").value,email:$("email").value,department:$("department").value,year:$("year").value};
  const res = await fetch(id?`/api/students/${id}`:"/api/students",{method:id?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  const data = await res.json();
  if(!res.ok){showToast(data.error||"Something went wrong.");return;}
  showToast(id?"Student updated successfully.":"Student added successfully.");
  resetForm(); await loadStudents(); $("students").scrollIntoView({behavior:"smooth"});
});

function editStudent(id){
  const s=students.find(x=>x.id===id); if(!s)return;
  $("studentId").value=s.id;$("name").value=s.name;$("email").value=s.email;$("department").value=s.department;$("year").value=s.year;
  $("formTitle").textContent="Edit Student";$("saveBtn").textContent="✓ Update Student";$("cancelBtn").classList.remove("hidden");
  $("add").scrollIntoView({behavior:"smooth"});
}
function resetForm(){
  $("studentForm").reset();$("studentId").value="";$("formTitle").textContent="Add New Student";$("saveBtn").textContent="＋ Add Student";$("cancelBtn").classList.add("hidden");
}
$("cancelBtn").onclick=resetForm;

function askDelete(id){pendingDelete=id;$("deleteModal").classList.remove("hidden")}
function closeModal(){$("deleteModal").classList.add("hidden");pendingDelete=null}
$("closeModal").onclick=closeModal;$("keepBtn").onclick=closeModal;
$("confirmDelete").onclick=async()=>{
  if(!pendingDelete)return;
  const res=await fetch(`/api/students/${pendingDelete}`,{method:"DELETE"});
  const data=await res.json();closeModal();
  if(!res.ok){showToast(data.error||"Delete failed.");return;}
  showToast("Student deleted successfully.");loadStudents();
};

$("search").addEventListener("input",renderStudents);
$("departmentFilter").addEventListener("change",renderStudents);
$("yearFilter").addEventListener("change",renderStudents);
$("heroAdd").onclick=()=>$("add").scrollIntoView({behavior:"smooth"});
$("mobileMenu").onclick=()=>$("sidebar").classList.toggle("open");

$("themeBtn").onclick=()=>{
  document.body.classList.toggle("light-soft");
  localStorage.setItem("studenthub-theme",document.body.classList.contains("light-soft")?"soft":"default");
};

function showToast(text){
  const t=$("toast");t.textContent=text;t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2800);
}
loadStudents();
