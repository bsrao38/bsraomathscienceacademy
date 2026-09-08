let ALL=[];
const app=document.getElementById("app");
const MIN=3827001, MAX=3827100, TEST_SECONDS=45*60;

const stages=[
 ["foundation","Foundation – KNOW","CBSE core mastery"],
 ["logical","Logical – THINK","CBSE competency and application"],
 ["elite","Elite – MASTER","CBSE core + controlled ICSE / IGCSE / IB MYP exposure"],
 ["challenge","Master Challenge","CBSE mastery + selected international-style exposure"]
];
const levels=["Number Mastery","Number Theory","Fractions & Decimals","Powers & Algebra","Algebra & Equations","Commercial Maths","Geometry","Mensuration","Data & Statistics","CBSE Excellence"];

function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
function load(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}}
function stageNorm(s){s=String(s??"").toLowerCase().trim();if(s.includes("foundation")||s.includes("know"))return"foundation";if(s.includes("logical")||s.includes("think"))return"logical";if(s.includes("elite")||s.includes("master"))return s.includes("challenge")?"challenge":"elite";if(s.includes("challenge"))return"challenge";return s}
function normalize(data){
 const raw=Array.isArray(data)?data:(Array.isArray(data?.questions)?data.questions:[]);
 return raw.map((q,i)=>({
  id:String(q.id??`q-${i}`),
  class:Number(q.class??q.classNo??q.c??q.grade??0),
  level:Number(q.level??q.levelNo??q.l??0),
  stage:stageNorm(q.stage??q.stageId??q.mode),
  subject:q.subject??"Mathematics",
  chapter:q.chapter??q.ch??"Core syllabus",
  style:q.style??"CBSE",
  question:q.question??q.q??"",
  options:Array.isArray(q.options)?q.options:(Array.isArray(q.opts)?q.opts:[]),
  answer:String(q.answer??q.ans??""),
  marks:4,wrongMarks:-1,unattempted:0
 })).filter(q=>q.class>=6&&q.class<=10&&q.level>=1&&q.level<=10&&q.question&&q.options.length>=2);
}

/* A safe 60-item generated reserve is used only when the JSON bank cannot
   supply enough items. It also prevents a broken/stale JSON cache from
   blocking the test. */
function reservePool(c,l,s){
 const arr=[];
 for(let i=0;i<60;i++){
  const a=(c*17+l*11+i*7)%41+5, b=(l*5+i)%12+2;
  let q,ans,opts,subj;
  if(c===10 && i>=10 && i<15){
   subj="Physics"; q=`A circuit quantity changes from ${a} units to ${a+b} units. What is the increase?`; ans=String(b); opts=[String(b),String(a),String(a+b),String(a*b)];
  } else if(c===10 && i>=15){
   subj="Chemistry"; q="Which observation is strongest evidence that a chemical change may have occurred?"; ans="Formation of a new substance"; opts=[ans,"Only a change in shape","Only movement","Only change in size"];
  } else if(i%4===0){
   subj="Mathematics"; q=`What is ${a} + ${b}?`; ans=String(a+b); opts=[String(a+b),String(a-b),String(a*b),String(a+b+1)];
  } else if(i%4===1){
   subj=c===10?"Science":"Science"; q=`Which is the best scientific/mathematical first step when solving a problem from this level?`; ans="Identify the given information and the relevant concept"; opts=[ans,"Guess from the options","Ignore conditions","Use any formula"];
  } else if(i%4===2){
   subj="Mathematics"; q=`A quantity changes from ${a} to ${a+b}. What is the change?`; ans=String(b); opts=[String(b),String(a),String(a+b),String(a*b)];
  } else {
   subj="Science"; q="Why should a result be checked against the original condition or evidence?"; ans="To verify that the result is supported by the given condition or evidence"; opts=[ans,"To avoid reasoning","To change the question","To add unnecessary steps"];
  }
  const style=s==="foundation"?"CBSE":s==="logical"?"CBSE-COMPETENCY":s==="elite"?"ICSE/IGCSE/IB-EXPOSURE":"INTEGRATED";
  arr.push({id:`RES-${c}-${l}-${s}-${i+1}`,class:c,level:l,stage:s,subject:subj,chapter:"Core syllabus",style,question:q,options:opts,answer:ans});
 }
 return arr;
}

async function loadBank(){
 try{
  const base=new URL("questions.json",document.baseURI).href;
  const r=await fetch(base+"?v="+Date.now(),{cache:"no-store"});
  if(!r.ok)throw new Error("HTTP "+r.status);
  const d=await r.json();
  ALL=normalize(d);
 }catch(e){
  console.warn("Question bank fetch failed; reserve pool will be used.",e);
  ALL=[];
 }
 if(load("student",0))dashboard();else home();
}

function home(){app.innerHTML=`<div class="wrap"><div class="hero"><h1>B.S. RAO GOLDEN 10™</h1><p>ONE PROGRAM • 200 TESTS • 60-QUESTION POOL</p></div><div class="card"><h2>Student Login</h2><p>Hall Ticket: 3827001–3827100</p><input id="hall" inputmode="numeric" maxlength="7" placeholder="Enter Hall Ticket Number" style="padding:13px;width:100%;border:1px solid #ccd4e0;border-radius:10px"><br><br><button class="btn" id="loginBtn">Login</button><p id="err" class="bad"></p></div></div>`;document.getElementById("loginBtn").onclick=login}
function login(){const h=Number(document.getElementById("hall").value);if(Number.isInteger(h)&&h>=MIN&&h<=MAX){save("student",h);dashboard()}else document.getElementById("err").textContent="Use Hall Ticket 3827001–3827100."}
function dashboard(){app.innerHTML=`<div class="wrap"><div class="top"><h1>Student Dashboard</h1><button class="btn alt" id="logout">Logout</button></div><div class="card"><h2>Hall Ticket: ${load("student","")}</h2><div class="grid">${[6,7,8,9,10].map(c=>`<button class="btn level" onclick="levelsPage(${c})">CLASS ${c}<br><small>10 Golden Levels</small></button>`).join("")}</div></div></div>`;document.getElementById("logout").onclick=logout}
function levelsPage(c){app.innerHTML=`<div class="wrap"><div class="top"><h1>Class ${c}</h1><button class="btn alt" onclick="dashboard()">Dashboard</button></div><div class="card"><div class="grid">${levels.map((x,i)=>`<button class="btn alt level" onclick="stagePage(${c},${i+1})">LEVEL ${i+1}<br>${esc(x)}</button>`).join("")}</div></div></div>`}
function stagePage(c,l){app.innerHTML=`<div class="wrap"><div class="top"><h1>Class ${c} • Level ${l}</h1><button class="btn alt" onclick="levelsPage(${c})">Levels</button></div>${stages.map(s=>`<div class="card"><h2>${s[1]}</h2><p>${s[2]}</p><button class="btn startBtn" data-s="${s[0]}">Start Test</button></div>`).join("")}</div>`;document.querySelectorAll(".startBtn").forEach(b=>b.onclick=()=>startTest(c,l,b.dataset.s))}
function startTest(c,l,s){
 const student=load("student",0), key=`${student}|${c}|${l}|${s}`;
 let used=load("usedQuestions",{});
 let old=Array.isArray(used[key])?used[key]:[];
 let pool=ALL.filter(q=>q.class===c&&q.level===l&&q.stage===s&&!old.includes(q.id));
 if(pool.length<20){
  const reserve=reservePool(c,l,s);
  const known=new Set(old);
  pool=reserve.filter(q=>!known.has(q.id));
 }
 if(pool.length<20){
  old=[]; used[key]=[]; pool=ALL.filter(q=>q.class===c&&q.level===l&&q.stage===s);
  if(pool.length<20)pool=reservePool(c,l,s);
 }
 pool.sort(()=>Math.random()-.5);
 const qs=pool.slice(0,20);
 used[key]=(old||[]).concat(qs.map(q=>q.id));
 save("usedQuestions",used);
 // Clear stale active test before starting a fresh one.
 localStorage.removeItem("lastResult");
 save("activeTest",{student,c,l,s,qs,attempt:Math.floor((old||[]).length/20)+1,current:0,answers:{},endTime:null});
 testPage();
}
function testPage(){
 const t=load("activeTest",null);if(!t?.qs?.length){stagePage(t?.c||6,t?.l||1);return}
 let i=Number(t.current||0),answers=t.answers||{},timerHandle=null;
 if(!t.endTime){t.endTime=Date.now()+TEST_SECONDS*1000;save("activeTest",t)}
 const fmt=x=>`${String(Math.floor(x/60)).padStart(2,"0")}:${String(x%60).padStart(2,"0")}`;
 function draw(){
  const q=t.qs[i],left=Math.max(0,Math.ceil((t.endTime-Date.now())/1000));
  app.innerHTML=`<div class="wrap"><div class="top"><h2>Class ${t.c} • Level ${t.l}</h2><b>⏱️ <span id="timer">${fmt(left)}</span></b><span>Attempt ${t.attempt} • Q ${i+1}/20</span></div><div class="card"><span class="pill">${esc(q.subject)}</span><span class="pill">${esc(q.style)}</span><span class="pill">${esc(q.chapter)}</span><p class="q"><b>${i+1}. ${esc(q.question)}</b></p><div id="opts">${q.options.map((o,k)=>`<button type="button" class="opt ${answers[i]===String(o)?"sel":""}" data-k="${k}">${esc(o)}</button>`).join("")}</div></div><div class="top"><button class="btn alt" id="prev" ${i?"":"disabled"}>Previous</button><button class="btn" id="next">${i===19?"Submit":"Next"}</button></div></div>`;
  document.querySelectorAll("#opts .opt").forEach(b=>b.onclick=()=>{answers[i]=String(q.options[Number(b.dataset.k)]);t.answers=answers;t.current=i;save("activeTest",t);draw()});
  document.getElementById("prev").onclick=()=>{if(i){i--;t.current=i;save("activeTest",t);draw()}};
  document.getElementById("next").onclick=()=>{if(i===19)submitTest(false);else{i++;t.current=i;save("activeTest",t);draw()}};
 }
 function tick(){const left=Math.max(0,Math.ceil((t.endTime-Date.now())/1000)),el=document.getElementById("timer");if(el)el.textContent=fmt(left);if(left<=0){clearInterval(timerHandle);submitTest(true)}}
 function submitTest(auto){if(!auto&&!confirm("Submit the test now? You can submit before 45 minutes."))return;clearInterval(timerHandle);let score=0;t.qs.forEach((q,n)=>{if(answers[n]===String(q.answer))score+=4;else if(answers[n])score-=1});const total=80,pct=Math.max(0,Math.min(100,score/total*100));const elapsed=Math.min(TEST_SECONDS,Math.max(0,Date.now()-(t.endTime-TEST_SECONDS*1000))/1000);save("lastResult",{...t,answers,score,total,percentage:pct,elapsed,autoSubmitted:auto,submittedAt:Date.now()});localStorage.removeItem("activeTest");resultPage()}
 window.submitTest=submitTest;draw();tick();timerHandle=setInterval(tick,1000)
}
function resultPage(){const r=load("lastResult",null);if(!r){dashboard();return}const correct=r.qs.filter((q,i)=>r.answers[i]===String(q.answer)).length,attempted=Object.keys(r.answers||{}).length,pct=Math.max(0,Math.min(100,(r.score/80)*100));let board=load("rankResults",[]);board=board.filter(x=>!(x.student===r.student&&x.c===r.c&&x.l===r.l&&x.s===r.s&&x.attempt===r.attempt));board.push({student:r.student,c:r.c,l:r.l,s:r.s,attempt:r.attempt,score:r.score,submittedAt:r.submittedAt});save("rankResults",board);const same=board.filter(x=>x.c===r.c&&x.l===r.l&&x.s===r.s).sort((a,b)=>b.score-a.score||a.submittedAt-b.submittedAt);const pos=same.findIndex(x=>x.student===r.student&&x.submittedAt===r.submittedAt)+1;app.innerHTML=`<div class="wrap"><div class="card center"><h1>🏆 Test Result</h1><p>Class ${r.c} • Level ${r.l} • ${stages.find(x=>x[0]===r.s)[1]}</p><div class="score">${r.score}/80</div><div class="grid"><div class="card"><b>Total</b><br>80 Marks</div><div class="card"><b>Percentage</b><br>${pct.toFixed(2)}%</div><div class="card"><b>Rank</b><br>#${pos||"—"}</div><div class="card"><b>Correct</b><br>${correct}/20</div></div><p>Wrong: ${attempted-correct} • Unattempted: ${20-attempted}</p>${r.autoSubmitted?'<p class="bad"><b>45-minute time limit reached. Test auto-submitted.</b></p>':'<p class="good"><b>Submitted successfully.</b></p>'}<p><button class="btn" onclick="startTest(${r.c},${r.l},'${r.s}')">Retake – New Questions</button> <button class="btn alt" onclick="stagePage(${r.c},${r.l})">Back</button></p><p class="muted small">Rank is device-local on this static GitHub Pages version; a shared all-student rank requires an online database.</p></div></div>`}
function logout(){localStorage.removeItem("student");localStorage.removeItem("activeTest");home()}
loadBank();