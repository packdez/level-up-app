// ===================== STATE =====================
const STORAGE_KEY = "levelup_v1";
const CAT_COLORS = {
  habit:"var(--cat-habit)", work:"var(--cat-work)", upwork:"var(--cat-upwork)",
  linkedin:"var(--cat-linkedin)", cook:"var(--cat-cook)", gym:"var(--cat-gym)",
  rest:"var(--cat-rest)", reset:"var(--cat-reset)"
};

function todayKey(d = new Date()){
  return d.toISOString().slice(0,10);
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return { startDate: todayKey(), checkins:{}, reading:{}, notifFired:{}, notifEnabled:false, activeAlarm:null };
}
let state = loadState();
if(!state.reading || Object.keys(state.reading).length===0){
  state.reading = {};
  READING_LIST.forEach(b => state.reading[b.order] = b.status);
}
function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getDayCheckin(key){
  if(!state.checkins[key]){
    state.checkins[key] = { morningPages:false, reading:false, cameraTalk:false, workout:false, deepWorkHrs:0, linkedin:false };
  }
  return state.checkins[key];
}

function dayScore(c){
  const core = ["morningPages","reading","cameraTalk","workout"];
  let n = core.filter(k=>c[k]).length;
  if(c.deepWorkHrs >= 5) n++;
  return Math.round((n/5)*100);
}

// ===================== NAV =====================
const screens = ["today","schedule","tracker","reading","settings"];
function showScreen(name){
  screens.forEach(s=>{
    document.getElementById("screen-"+s).classList.toggle("hidden", s!==name);
  });
  document.querySelectorAll(".tab").forEach(t=>{
    t.classList.toggle("active", t.dataset.screen===name);
  });
  if(name==="tracker") renderTracker();
  if(name==="reading") renderReading();
  if(name==="schedule") renderSchedule(currentDayType);
}
document.querySelectorAll(".tab").forEach(t=>{
  t.addEventListener("click", ()=>showScreen(t.dataset.screen));
});

// ===================== TOAST =====================
let toastTimer;
function toast(msg){
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>el.classList.remove("show"), 2200);
}

// ===================== TODAY SCREEN =====================
function pad(n){ return n.toString().padStart(2,"0"); }
function minsSinceMidnight(d){ return d.getHours()*60 + d.getMinutes(); }
function timeStrToMins(t){ const [h,m] = t.split(":").map(Number); return h*60+m; }

function renderTodayHeader(){
  const now = new Date();
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  document.getElementById("today-daylabel").textContent = dayNames[now.getDay()];
  document.getElementById("today-clock").textContent = pad(now.getHours())+":"+pad(now.getMinutes());
}

function computeStreak(){
  let streak = 0;
  let d = new Date();
  // if today not yet scored well, still allow checking from yesterday backward
  for(let i=0;i<60;i++){
    const key = todayKey(d);
    const c = state.checkins[key];
    const score = c ? dayScore(c) : 0;
    if(i===0 && score < 60){
      // today incomplete yet — don't break streak, just don't count today
      d.setDate(d.getDate()-1);
      continue;
    }
    if(score >= 60){ streak++; d.setDate(d.getDate()-1); }
    else break;
  }
  return streak;
}

function renderStreak(){
  const streak = computeStreak();
  document.getElementById("streak-num").textContent = streak;
  document.getElementById("streak-flame").style.opacity = streak>0 ? 1 : .3;
}

function getTodaySchedule(){
  const dow = new Date().getDay();
  const key = scheduleKeyForDay(dow);
  return { key, blocks: SCHEDULES[key] };
}

function renderNextUp(){
  const now = new Date();
  const nowMins = minsSinceMidnight(now);
  const { blocks } = getTodaySchedule();
  let next = null;
  for(const b of blocks){
    const start = timeStrToMins(b[0]);
    if(start > nowMins){ next = b; break; }
  }
  if(!next){
    document.getElementById("next-block-name").textContent = "Day complete 🎉";
    document.getElementById("next-countdown").textContent = "See you at 05:00";
    return;
  }
  const start = timeStrToMins(next[0]);
  const diff = start - nowMins;
  document.getElementById("next-block-name").textContent = next[2];
  document.getElementById("next-countdown").textContent = diff <= 1 ? "Starting now" : `in ${diff} min · ${next[0]}`;
}

function renderTimeline(){
  const { blocks } = getTodaySchedule();
  const track = document.getElementById("timeline-track");
  track.innerHTML = "";
  const dayStart = 5*60, dayEnd = 21*60+15; // 05:00 - 21:15
  const total = dayEnd - dayStart;

  blocks.forEach(b=>{
    let s = timeStrToMins(b[0]), e = timeStrToMins(b[1]);
    if(e<=s) e = s+15;
    s = Math.max(s, dayStart); e = Math.min(e, dayEnd);
    if(e<=s) return;
    const seg = document.createElement("div");
    seg.className = "timeline-seg";
    seg.style.width = ((e-s)/total*100)+"%";
    seg.style.background = CAT_COLORS[b[3]] || "var(--cat-rest)";
    track.appendChild(seg);
  });

  const now = new Date();
  const nowMins = minsSinceMidnight(now);
  if(nowMins >= dayStart && nowMins <= dayEnd){
    const marker = document.createElement("div");
    marker.className = "timeline-now";
    marker.style.left = ((nowMins-dayStart)/total*100)+"%";
    track.appendChild(marker);
  }

  const legend = document.getElementById("timeline-legend");
  const used = [...new Set(blocks.map(b=>b[3]))];
  legend.innerHTML = used.map(cat=>`
    <div class="timeline-legend-item">
      <span class="timeline-legend-dot" style="background:${CAT_COLORS[cat]}"></span>${CATEGORY_LABELS[cat]}
    </div>`).join("");
}

function renderHabits(){
  const key = todayKey();
  const c = getDayCheckin(key);
  const list = document.getElementById("habit-list");
  list.innerHTML = "";
  HABITS.forEach(h=>{
    const item = document.createElement("div");
    item.className = "habit-item" + (h.type==="bool" && c[h.key] ? " done" : "");
    if(h.type==="bool"){
      item.innerHTML = `
        <div class="habit-name"><span class="habit-dot" style="background:${c[h.key]?'var(--green)':'var(--text-faint)'}"></span>${h.name}</div>
        <div class="habit-toggle ${c[h.key]?'on':''}" data-key="${h.key}"><div class="knob"></div></div>`;
    } else {
      item.innerHTML = `
        <div class="habit-name">${h.name}</div>
        <div class="habit-hrs">
          <button class="hrs-btn" data-action="dec" data-key="${h.key}">−</button>
          <span class="hrs-val" id="hrs-val-${h.key}">${c[h.key]}h</span>
          <button class="hrs-btn" data-action="inc" data-key="${h.key}">+</button>
        </div>`;
    }
    list.appendChild(item);
  });

  list.querySelectorAll(".habit-toggle").forEach(t=>{
    t.addEventListener("click", ()=>{
      const k = t.dataset.key;
      const c = getDayCheckin(todayKey());
      c[k] = !c[k];
      saveState();
      renderAll();
    });
  });
  list.querySelectorAll(".hrs-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const k = btn.dataset.key;
      const c = getDayCheckin(todayKey());
      const h = HABITS.find(x=>x.key===k);
      if(btn.dataset.action==="inc") c[k] = Math.min(h.max, c[k]+1);
      else c[k] = Math.max(0, c[k]-1);
      saveState();
      renderAll();
    });
  });
}

function renderScore(){
  const c = getDayCheckin(todayKey());
  const score = dayScore(c);
  const circumference = 2*Math.PI*52;
  const offset = circumference - (score/100)*circumference;
  const ring = document.getElementById("score-ring-fg");
  ring.style.strokeDashoffset = offset;
  ring.style.stroke = score>=80 ? "var(--green)" : score>=50 ? "var(--gold)" : "var(--coral)";
  document.getElementById("score-ring-num").textContent = score+"%";
  const msgs = {
    0:"Check in on your habits to see today's score.",
    low:"Slow start — pick one habit and knock it out now.",
    mid:"Good progress. Keep the momentum going.",
    high:"Strong day. This is what consistency looks like."
  };
  document.getElementById("score-msg").textContent =
    score===0 ? msgs[0] : score<50 ? msgs.low : score<80 ? msgs.mid : msgs.high;
}

function renderAll(){
  renderTodayHeader();
  renderStreak();
  renderNextUp();
  renderTimeline();
  renderHabits();
  renderScore();
}

// ===================== SCHEDULE SCREEN =====================
let currentDayType = scheduleKeyForDay(new Date().getDay());
function renderSchedule(type){
  currentDayType = type;
  document.querySelectorAll(".daytype-tab").forEach(t=>{
    t.classList.toggle("active", t.dataset.type===type);
  });
  const list = document.getElementById("schedule-list");
  list.innerHTML = SCHEDULES[type].map(b=>`
    <div class="schedule-item">
      <div class="schedule-time">${b[0]}</div>
      <div class="schedule-bar" style="background:${CAT_COLORS[b[3]]}"></div>
      <div class="schedule-body">
        <div class="schedule-block">${b[2]}</div>
        <div class="schedule-cat">${CATEGORY_LABELS[b[3]]}</div>
      </div>
    </div>`).join("");
}
document.querySelectorAll(".daytype-tab").forEach(t=>{
  t.addEventListener("click", ()=>renderSchedule(t.dataset.type));
});

// ===================== TRACKER SCREEN =====================
function renderTracker(){
  const grid = document.getElementById("heatmap-grid");
  grid.innerHTML = "";
  const start = new Date(state.startDate);
  // align to Monday of start week
  const startDow = (start.getDay()+6)%7; // 0=Mon
  const gridStart = new Date(start);
  gridStart.setDate(gridStart.getDate()-startDow);

  const today = new Date(); today.setHours(0,0,0,0);

  for(let i=0;i<35;i++){
    const d = new Date(gridStart);
    d.setDate(d.getDate()+i);
    const key = todayKey(d);
    const cell = document.createElement("div");
    const isFuture = d > today;
    const c = state.checkins[key];
    const score = c ? dayScore(c) : 0;
    cell.className = "heatmap-cell" + (isFuture ? " future" : "");
    cell.textContent = d.getDate();
    if(!isFuture){
      cell.style.background = heatColor(score);
      cell.addEventListener("click", ()=>showDayDetail(key, d));
    }
    grid.appendChild(cell);
  }
  renderBarList();
}

function heatColor(score){
  if(score===0) return "#1B2A3E";
  if(score<40) return "#3A5A47";
  if(score<70) return "#2E9A5C";
  return "#3DDC84";
}

function showDayDetail(key, d){
  const c = state.checkins[key] || getDayCheckin(key);
  const el = document.getElementById("day-detail");
  el.classList.remove("hidden");
  const dateStr = d.toLocaleDateString(undefined,{weekday:'long', month:'short', day:'numeric'});
  el.innerHTML = `
    <div style="font-weight:600; margin-bottom:8px;">${dateStr} — ${dayScore(c)}%</div>
    <div style="font-size:12px; color:var(--text-dim); line-height:1.8;">
      Morning Pages: ${c.morningPages?"✅":"—"}<br>
      Reading: ${c.reading?"✅":"—"}<br>
      Camera Talk: ${c.cameraTalk?"✅":"—"}<br>
      Workout: ${c.workout?"✅":"—"}<br>
      Deep Work: ${c.deepWorkHrs||0}h<br>
      LinkedIn: ${c.linkedin?"✅":"—"}
    </div>`;
}

function renderBarList(){
  const keys = Object.keys(state.checkins);
  const n = Math.max(keys.length,1);
  const rates = {};
  ["morningPages","reading","cameraTalk","workout","linkedin"].forEach(k=>{
    rates[k] = Math.round(keys.filter(dk=>state.checkins[dk][k]).length / n * 100);
  });
  const names = {morningPages:"Morning Pages", reading:"Reading", cameraTalk:"Camera Talk", workout:"Workout", linkedin:"LinkedIn"};
  const list = document.getElementById("bar-list");
  list.innerHTML = Object.keys(rates).map(k=>`
    <div>
      <div class="bar-item-label"><span>${names[k]}</span><span>${rates[k]}%</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${rates[k]}%"></div></div>
    </div>`).join("");
}

// ===================== READING SCREEN =====================
const STATUS_CYCLE = ["not-started","in-progress","done"];
const STATUS_LABEL = {"not-started":"Not started","in-progress":"In progress","done":"Done"};
function renderReading(){
  const list = document.getElementById("reading-list");
  list.innerHTML = READING_LIST.map(b=>{
    const status = state.reading[b.order] || b.status;
    return `
    <div class="reading-item">
      <div class="reading-order">${b.order}</div>
      <div class="reading-body">
        <div class="reading-title">${b.title}</div>
        <div class="reading-slot">${b.slot}</div>
      </div>
      <div class="reading-status ${status}" data-order="${b.order}">${STATUS_LABEL[status]}</div>
    </div>`;
  }).join("");
  list.querySelectorAll(".reading-status").forEach(el=>{
    el.addEventListener("click", ()=>{
      const order = el.dataset.order;
      const cur = state.reading[order];
      const idx = STATUS_CYCLE.indexOf(cur);
      const next = STATUS_CYCLE[(idx+1)%STATUS_CYCLE.length];
      state.reading[order] = next;
      saveState();
      renderReading();
      toast("Updated: "+STATUS_LABEL[next]);
    });
  });
}

// ===================== SETTINGS =====================
function refreshNotifUI(){
  const btn = document.getElementById("notif-toggle");
  const status = document.getElementById("notif-status");
  if(!("Notification" in window)){
    status.textContent = "Not supported on this browser";
    btn.style.display = "none";
    return;
  }
  if(Notification.permission === "granted" && state.notifEnabled){
    status.textContent = "On — 5 min before each block";
    btn.textContent = "On";
    btn.classList.add("on");
  } else if(Notification.permission === "denied"){
    status.textContent = "Blocked in browser settings";
    btn.textContent = "Blocked";
  } else {
    status.textContent = "Off";
    btn.textContent = "Enable";
    btn.classList.remove("on");
  }
}
document.getElementById("notif-toggle").addEventListener("click", async ()=>{
  if(Notification.permission === "denied"){
    toast("Notifications are blocked — enable them in browser settings");
    return;
  }
  if(state.notifEnabled){
    state.notifEnabled = false;
    saveState();
    refreshNotifUI();
    toast("Reminders off");
    return;
  }
  const perm = await Notification.requestPermission();
  if(perm === "granted"){
    state.notifEnabled = true;
    saveState();
    refreshNotifUI();
    toast("Reminders on");
    new Notification("Level Up", {body:"Reminders are on. You'll get a nudge 5 min before each block.", icon:"icons/icon-192.png"});
  }
});

document.getElementById("export-btn").addEventListener("click", ()=>{
  const blob = new Blob([JSON.stringify(state,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `levelup-backup-${todayKey()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast("Backup downloaded");
});
document.getElementById("import-btn").addEventListener("click", ()=>{
  document.getElementById("import-file").click();
});
document.getElementById("import-file").addEventListener("change", (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const data = JSON.parse(reader.result);
      state = data;
      saveState();
      renderAll();
      toast("Backup restored");
    }catch(err){
      toast("Couldn't read that file");
    }
  };
  reader.readAsText(file);
});
document.getElementById("reset-btn").addEventListener("click", ()=>{
  if(confirm("This clears all check-ins and restarts your 30 days. Continue?")){
    state = { startDate: todayKey(), checkins:{}, reading:{}, notifFired:{}, notifEnabled:state.notifEnabled };
    READING_LIST.forEach(b => state.reading[b.order] = b.status);
    saveState();
    renderAll();
    toast("Data reset");
  }
});

// ===================== ALARM (looping, foreground) =====================
let audioCtx = null;
let alarmToneTimer = null;
let alarmVibrateTimer = null;
let alarmActive = false;

// Unlock audio on first user gesture (required by mobile browsers)
function unlockAudio(){
  if(!audioCtx){
    try{ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){}
  }
  if(audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}
["click","touchstart"].forEach(evt=>document.addEventListener(evt, unlockAudio, {once:false}));

function beepOnce(){
  if(!audioCtx) return;
  const t0 = audioCtx.currentTime;
  [880, 660].forEach((freq, i)=>{
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0 + i*0.22);
    gain.gain.exponentialRampToValueAtTime(0.35, t0 + i*0.22 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + i*0.22 + 0.2);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t0 + i*0.22);
    osc.stop(t0 + i*0.22 + 0.22);
  });
}

function startAlarmLoop(){
  unlockAudio();
  beepOnce();
  alarmToneTimer = setInterval(beepOnce, 1400);
  if(navigator.vibrate){
    navigator.vibrate([300,150,300,150,300]);
    alarmVibrateTimer = setInterval(()=>navigator.vibrate([300,150,300,150,300]), 1400);
  }
}
function stopAlarmLoop(){
  clearInterval(alarmToneTimer);
  clearInterval(alarmVibrateTimer);
  if(navigator.vibrate) navigator.vibrate(0);
}

function showAlarm(blockName, id){
  alarmActive = true;
  state.activeAlarm = { id, blockName, firedAt: Date.now() };
  saveState();
  document.getElementById("alarm-block-name").textContent = blockName;
  document.getElementById("alarm-overlay").classList.remove("hidden");
  startAlarmLoop();
}
function dismissAlarm(){
  alarmActive = false;
  state.activeAlarm = null;
  saveState();
  document.getElementById("alarm-overlay").classList.add("hidden");
  stopAlarmLoop();
}
document.getElementById("alarm-dismiss-btn").addEventListener("click", dismissAlarm);

// If the app was opened/returned to with an alarm still pending (unacknowledged
// within the last 20 min), surface it immediately.
function checkPendingAlarmOnResume(){
  if(state.activeAlarm && (Date.now() - state.activeAlarm.firedAt) < 20*60*1000){
    showAlarm(state.activeAlarm.blockName, state.activeAlarm.id);
  }
}
document.addEventListener("visibilitychange", ()=>{
  if(document.visibilityState === "visible") checkPendingAlarmOnResume();
});

// Messages from the service worker (fired when a notification is tapped)
if("serviceWorker" in navigator){
  navigator.serviceWorker.addEventListener("message", (e)=>{
    if(e.data && e.data.type === "ALARM_SHOW") showAlarm(e.data.block, e.data.id);
    if(e.data && e.data.type === "ALARM_DISMISS") dismissAlarm();
  });
}

// ===================== NOTIFICATION SCHEDULER =====================
async function fireReminder(block, id){
  const title = "Up next: " + block[2];
  const options = {
    body: `Starting at ${block[0]}`,
    icon: "icons/icon-192.png",
    badge: "icons/icon-192.png",
    tag: id,
    requireInteraction: true,
    vibrate: [300,150,300,150,300],
    actions: [{ action:"dismiss", title:"Dismiss" }],
    data: { blockName: block[2], id }
  };
  if("serviceWorker" in navigator){
    try{
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, options);
    }catch(e){
      new Notification(title, options);
    }
  } else {
    new Notification(title, options);
  }
  // If the app happens to already be in the foreground, loop the alarm right away too
  if(document.visibilityState === "visible"){
    showAlarm(block[2], id);
  }
}

function checkReminders(){
  if(!state.notifEnabled || Notification.permission!=="granted") return;
  const now = new Date();
  const nowMins = minsSinceMidnight(now);
  const key = todayKey();
  if(!state.notifFired[key]) state.notifFired[key] = [];
  const { blocks } = getTodaySchedule();
  blocks.forEach((b,idx)=>{
    const start = timeStrToMins(b[0]);
    const fireAt = start - 5;
    const id = key+"-"+idx;
    if(nowMins >= fireAt && nowMins < start && !state.notifFired[key].includes(id)){
      fireReminder(b, id);
      state.notifFired[key].push(id);
      saveState();
    }
  });
}
setInterval(checkReminders, 20000);

// ===================== INIT =====================
function renderInit(){
  renderAll();
  renderSchedule(currentDayType);
  refreshNotifUI();
  checkPendingAlarmOnResume();
}
renderInit();
setInterval(renderAll, 30000);

if("serviceWorker" in navigator){
  window.addEventListener("load", ()=>{
    navigator.serviceWorker.register("service-worker.js").catch(()=>{});
  });
}
