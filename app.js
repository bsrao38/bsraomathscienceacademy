let ALL=[];
const app=document.getElementById("app"),MIN=3827001,MAX=3827100;
const stages=[
 ["foundation","Foundation – KNOW","CBSE core mastery"],
 ["logical","Logical – THINK","CBSE competency and application"],
 ["elite","Elite – MASTER","CBSE core + controlled ICSE / IGCSE / IB MYP exposure"],
 ["challenge","Master Challenge","CBSE mastery + selected international-style exposure"]
];
const levels=["Number Mastery","Number Theory","Fractions & Decimals","Powers & Algebra","Algebra & Equations","Commercial Maths","Geometry","Mensuration","Data & Statistics","CBSE Excellence"];
let bankReady=false;

function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
function load(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}}

function normalize(data){
 let raw=Array.isArray(data)?data:(Array.isArray(data?.questions)?data.questions:[]);
 return raw.map((q,i)=>({
   id:q.id||`legacy-${i}`,
   class:Number(q.class??q.c??10),
   level:Number(q.level??q.l??1),
   stage:q.stage||"foundation",
   subject:q.subject||"Mathematics",
   chapter:q.chapter||q.ch||"Core",
   style:q.style||"CBSE",
   question:q.question??q.q??"",
   options:q.options??q.opts??[],
   answer:q.answer??q.ans??"",
   marks:4,wrongMarks:-1,unattempted:0
 })).filter(q=>q.question && Array.isArray(q.options) && q.options.length>=2);
}

function fallbackBank(c,l,s){
 const out=[];
 for(let i=0;i<40;i++){
   const a=(c*13+l*7+i*3)%30+5,b=(i+l)%9+2;
   const q=i%4===0?`A number is increased by ${b} and becomes ${a+b}. What was the original number?`:
     i%4===1?`In a problem from this level, which is the best first step?`:
     i%4===2?`If x = ${a} and y = ${b}, what is x + y?`:
     `Why should a mathematical result be checked in the original condition?`;
   const ans=i%4===0?String(a):i%4===1?"Identify the given information and the relevant concept":i%4===2?String(a+b):"To verify that it satisfies the original condition";
   const opts=i%4===0?[String(a),String(a+b),String(a-b),String(a*b)]:
     i%4===1?[ans,"Guess from the options","Ignore conditions","Use any formula"]:
     i%4===2?[String(a+b),String(a-b),String(a*b),String(a/b)]:
     [ans,"To change the problem","To avoid reasoning","To add unnecessary steps"];
   out.push({id:`fallback-${c}-${l}-${s}-${i}`,class:c,level:l,stage:s,subject:c===10&&i>=10?"Science":"Mathematics",chapter:"Core syllabus",style:s==="foundation"?"CBSE":s==="logical"?"CBSE-COMPETENCY":"INTERNATIONAL-EXPOSURE",question:q,options:opts,answer:ans});
 }
 return out;
}

function showLoadError(msg){
 app.innerHTML=`<div class="wrap"><div class="card"><h2>Question Bank Loading Issue</h2><p>${esc(msg)}</p><button class="btn" onclick="location.reload()">Reload</button></div></div>`;
}

async function boot(){
 try{
   const r=await fetch("questions.json?ver=2",{cache:"no-store"});
   if(!r.ok) throw new Error("questions.json HTTP "+r.status);
   const data=await r.json();
   ALL=normalize(data);
   bankReady=ALL.length>0;
 }catch(e){
   console.warn(e);
   ALL=[]; bankReady=false;
 }
 if(load("student",0)) dashboard(); else home();
}
function home(){
 app.innerHTML=`<div class="wrap"><div class="hero"><h1>B.S. RAO GOLDEN 10™</h1><p>ONE PROGRAM • 200 TESTS • DYNAMIC QUESTION ROTATION</p></div>
 <div class="card"><h2>Student Login</h2><p class="muted">Hall Ticket range: 3827001–3827100</p>
 <input id="hall" inputmode="numeric" maxlength="7" placeholder="Enter Hall Ticket Number" style="padding:13px;width:100%;border:1px solid #ccd4e0;border-radius:10px">
 <br><br><button class="btn" onclick="login()">Login</button><p id="err" class="bad"></p></div>
 <div class="card"><b>Retakes:</b> unused question IDs are selected first for each student, class, level and stage.</div></div>`;
}
function login(){
 let h=Number(document.getElementById("hall").value);
 if(Number.isInteger(h)&&h>=MIN&&h<=MAX){save("student",h);dashboard()}
 else document.getElementById("err").textContent="Use Hall Ticket 3827001–3827100.";
}
function dashboard(){
 app.innerHTML=`<div class="wrap"><div class="top"><h1>Student Dashboard</h1><button class="btn alt" onclick="logout()">Logout</button></div>
 <div class="card"><h2>Hall Ticket: ${load("student","")}</h2><div class="grid">
 ${[6,7,8,9,10].map(c=>`<button class="btn level" onclick="levelsPage(${c})">CLASS ${c}<br><small>10 Golden Levels</small></button>`).join("")}</div></div></div>`;
}
function levelsPage(c){
 app.innerHTML=`<div class="wrap"><div class="top"><h1>Class ${c}</h1><button class="btn alt" onclick="dashboard()">Dashboard</button></div>
 <div class="card"><div class="grid">${levels.map((x,i)=>`<button class="btn alt level" onclick="stagePage(${c},${i+1})">LEVEL ${i+1}<br>${esc(x)}</button>`).join("")}</div></div></div>`;
}
function stagePage(c,l){
 app.innerHTML=`<div class="wrap"><div class="top"><h1>Class ${c} • Level ${l}</h1><button class="btn alt" onclick="levelsPage(${c})">Levels</button></div>
 ${stages.map(s=>`<div class="card"><h2>${s[1]}</h2><p>${s[2]}</p><button class="btn" onclick="startTest(${c},${l},'${s[0]}')">Start Test</button></div>`).join("")}</div>`;
}
function startTest(c,l,s){
 let student=load("student",0);
 let key=`${student}|${c}|${l}|${s}`;
 let used=load("usedQuestions",{});
 let old=used[key]||[];
 let pool=ALL.filter(q=>q.class===c&&q.level===l&&q.stage===s&&!old.includes(q.id));
 if(pool.length<20) pool=fallbackBank(c,l,s).filter(q=>!old.includes(q.id));
 if(pool.length<20){old=[];pool=ALL.filter(q=>q.class===c&&q.level===l&&q.stage===s);if(pool.length<20)pool=fallbackBank(c,l,s)}
 pool.sort(()=>Math.random()-0.5);
 const qs=pool.slice(0,20);
 used[key]=old.concat(qs.map(q=>q.id));
 save("usedQuestions",used);
 save("activeTest",{c,l,s,qs,attempt:Math.floor(old.length/20)+1});
 testPage();
}
function testPage(){
 const t=load("activeTest",null); if(!t||!t.qs?.length){showLoadError("No questions are available for this test.");return}
 let i=0,answers={};
 function draw(){
  const q=t.qs[i];
  app.innerHTML=`<div class="wrap"><div class="top"><h2>Class ${t.c} • Level ${t.l}</h2><span>Attempt ${t.attempt} • Q ${i+1}/20</span></div>
  <div class="card"><span class="pill">${esc(q.subject)}</span><span class="pill">${esc(q.style)}</span><span class="pill">${esc(q.chapter)}</span>
  <p class="q"><b>${i+1}. ${esc(q.question)}</b></p>
  ${q.options.map(o=>`<button class="opt ${answers[i]===o?"sel":""}" onclick="choose(${JSON.stringify(o)})">${esc(o)}</button>`).join("")}</div>
  <div class="top"><button class="btn alt" onclick="previousQ()" ${i?"":"disabled"}>Previous</button>
  <button class="btn" onclick="${i===19?"submitTest()":"nextQ()"}">${i===19?"Submit":"Next"}</button></div></div>`;
 }
 window.choose=o=>{answers[i]=o;draw()};
 window.nextQ=()=>{if(i<19){i++;draw()}};
 window.previousQ=()=>{if(i>0){i--;draw()}};
 window.submitTest=()=>{let score=0;t.qs.forEach((q,n)=>{if(answers[n]===q.answer)score+=4;else if(answers[n])score-=1});save("lastResult",{...t,answers,score});resultPage()};
 draw();
}
function resultPage(){
 const r=load("lastResult",null);if(!r)return dashboard();
 const correct=r.qs.filter((q,i)=>r.answers[i]===q.answer).length,attempted=Object.keys(r.answers).length;
 app.innerHTML=`<div class="wrap"><div class="card center"><h1>Test Result</h1><p>Class ${r.c} • Level ${r.l} • ${stages.find(x=>x[0]===r.s)[1]}</p>
 <div class="score">${r.score}/80</div><p>Correct: ${correct} • Wrong: ${attempted-correct} • Unattempted: ${20-attempted}</p>
 <button class="btn" onclick="startTest(${r.c},${r.l},'${r.s}')">Retake – New Questions</button>
 <button class="btn alt" onclick="stagePage(${r.c},${r.l})">Back</button></div>
 <div class="card"><h3>Answer Review</h3>${r.qs.map((q,i)=>`<p><b>${i+1}.</b> ${esc(q.question)}<br>Your: ${esc(r.answers[i]||"Unattempted")} | Correct: ${esc(q.answer)}</p>`).join("")}</div></div>`;
}
function logout(){localStorage.removeItem("student");home()}
boot();
