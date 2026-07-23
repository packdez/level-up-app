// ===================== MASTER RENDER =====================

let PREV_SNAPSHOT = {moreOpen:false, moreScreen:null, financeSettingsOpen:false, ledgerOpen:false, investmentDetailId:null, editingBlock:null, addExpenseOpen:false, addHoldingOpen:false, confirm:null, tab:'today', addBookingOpen:false, scheduleMode:'routine'};
let JUST_OPENED = {};
function computeJustOpened(){
  JUST_OPENED = {
    moreSheet: S.moreOpen && !PREV_SNAPSHOT.moreOpen,
    modalScreen: !!S.moreScreen && S.moreScreen !== PREV_SNAPSHOT.moreScreen,
    financeSettings: S.financeSettingsOpen && !PREV_SNAPSHOT.financeSettingsOpen,
    ledger: S.ledgerOpen && !PREV_SNAPSHOT.ledgerOpen,
    investmentDetail: !!S.investmentDetailId && S.investmentDetailId !== PREV_SNAPSHOT.investmentDetailId,
    blockEditor: !!S.editingBlock && !PREV_SNAPSHOT.editingBlock,
    addExpense: S.addExpenseOpen && !PREV_SNAPSHOT.addExpenseOpen,
    addHolding: S.addHoldingOpen && !PREV_SNAPSHOT.addHoldingOpen,
    addBooking: S.addBookingOpen && !PREV_SNAPSHOT.addBookingOpen,
    confirm: !!S.confirm && !PREV_SNAPSHOT.confirm,
    tabChanged: S.tab !== PREV_SNAPSHOT.tab,
    scheduleModeChanged: S.scheduleMode !== PREV_SNAPSHOT.scheduleMode
  };
  PREV_SNAPSHOT = {moreOpen:S.moreOpen, moreScreen:S.moreScreen, financeSettingsOpen:S.financeSettingsOpen, ledgerOpen:S.ledgerOpen, investmentDetailId:S.investmentDetailId, editingBlock:S.editingBlock, addExpenseOpen:S.addExpenseOpen, addHoldingOpen:S.addHoldingOpen, addBookingOpen:S.addBookingOpen, confirm:S.confirm, tab:S.tab, scheduleMode:S.scheduleMode};
}

function render(){
  computeJustOpened();
  const t = T();
  document.body.style.background = t.bg;

  // preserve scroll position of any scrollable container across the re-render
  const scrollMap = {};
  document.querySelectorAll('[data-scroll-id]').forEach(el=>{ scrollMap[el.getAttribute('data-scroll-id')] = el.scrollTop; });

  let screenHtml = '';
  if(S.tab==='today') screenHtml = renderToday();
  else if(S.tab==='schedule') screenHtml = renderSchedule();
  else if(S.tab==='tracker') screenHtml = renderTracker();
  else if(S.tab==='finance') screenHtml = renderFinance();

  if(JUST_OPENED.tabChanged || JUST_OPENED.scheduleModeChanged){
    screenHtml = `<div style="animation:lu-tabswitch 0.2s cubic-bezier(.4,0,.2,1)">${screenHtml}</div>`;
  }

  let modalHtml = '';
  if(S.moreScreen==='reading') modalHtml = renderReadingModal();
  else if(S.moreScreen==='review') modalHtml = renderReviewModal();
  else if(S.moreScreen==='settings') modalHtml = renderSettingsModal();
  else if(S.moreScreen==='habits') modalHtml = renderManageHabitsModal();
  if(S.financeSettingsOpen) modalHtml += renderFinanceSettingsModal();
  if(S.ledgerOpen) modalHtml += renderLedgerModal();
  if(S.investmentDetailId) modalHtml += renderInvestmentDetail();

  const root = document.getElementById('screen-root');
  root.style.background = t.bg;
  root.innerHTML = `
    <div data-scroll-id="main" style="flex:1;overflow-y:auto;overflow-x:hidden;position:relative;background:${t.bg}">
      ${screenHtml}
      ${modalHtml}
    </div>
    ${renderBottomNav()}
    ${renderMoreSheet()}
    ${renderAddExpenseSheet()}
    ${renderAddHoldingSheet()}
    ${renderBlockEditorSheet()}
    ${renderAddBookingSheet()}
    ${renderAlarmOverlay()}
    ${renderConfirmModal()}
  `;

  // restore scroll positions
  document.querySelectorAll('[data-scroll-id]').forEach(el=>{
    const id = el.getAttribute('data-scroll-id');
    if(scrollMap[id]!=null) el.scrollTop = scrollMap[id];
  });

  // re-attach import file listener (input is recreated each render)
  const importInput = document.getElementById('import-file-input');
  if(importInput){
    importInput.addEventListener('change', (e)=>{ ACTIONS.handleImportFile(e.target.files[0]); e.target.value=''; });
  }
}

// ===================== EVENT DELEGATION =====================

document.addEventListener('click', (e)=>{
  const el = e.target.closest('[data-act]');
  if(!el) return;
  const name = el.getAttribute('data-act');
  const arg = el.getAttribute('data-arg');
  if(ACTIONS[name]){
    unlockAudio();
    ACTIONS[name](arg);
  }
});

document.addEventListener('change', (e)=>{
  const el = e.target;
  const name = el.getAttribute('data-act-change');
  if(!name) return;
  const prefix = el.getAttribute('data-arg-prefix') || '';
  const value = prefix ? prefix+el.value : el.value;
  if(ACTIONS[name]) ACTIONS[name](value);
});

// ===================== TOAST =====================
let toastTimer;
function toast(msg){
  const el = document.getElementById('toast');
  if(!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>el.classList.remove('show'), 2200);
}

// ===================== ALARM AUDIO/VIBRATION =====================
let audioCtx = null;
let alarmToneTimer = null;
let alarmVibrateTimer = null;

function unlockAudio(){
  if(!audioCtx){
    try{ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){}
  }
  if(audioCtx && audioCtx.state==='suspended') audioCtx.resume();
}
function beepOnce(){
  if(!audioCtx) return;
  const t0 = audioCtx.currentTime;
  [880,660].forEach((freq,i)=>{
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type='sine'; osc.frequency.value=freq;
    gain.gain.setValueAtTime(0.0001, t0+i*0.22);
    gain.gain.exponentialRampToValueAtTime(0.35, t0+i*0.22+0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0+i*0.22+0.2);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t0+i*0.22); osc.stop(t0+i*0.22+0.22);
  });
}
function startAlarmLoop(){
  unlockAudio();
  beepOnce();
  clearInterval(alarmToneTimer);
  alarmToneTimer = setInterval(beepOnce, 1400);
  if(navigator.vibrate){
    navigator.vibrate([300,150,300,150,300]);
    clearInterval(alarmVibrateTimer);
    alarmVibrateTimer = setInterval(()=>navigator.vibrate([300,150,300,150,300]), 1400);
  }
}
function stopAlarmLoop(){
  clearInterval(alarmToneTimer);
  clearInterval(alarmVibrateTimer);
  if(navigator.vibrate) navigator.vibrate(0);
}

// ===================== NOTIFICATION SCHEDULER =====================
async function fireReminder(block, id){
  const title = 'Up next: '+block.label;
  const options = {
    body: `Starting at ${block.start}`,
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    tag: id,
    requireInteraction: true,
    vibrate: [300,150,300,150,300],
    actions: [{action:'dismiss', title:'Dismiss'}],
    data: {block, id}
  };
  if('serviceWorker' in navigator){
    try{ const reg = await navigator.serviceWorker.ready; await reg.showNotification(title, options); }
    catch(e){ try{ new Notification(title, options); }catch(e2){} }
  } else {
    try{ new Notification(title, options); }catch(e){}
  }
  if(document.visibilityState==='visible'){
    setState({alarmActive: block});
    startAlarmLoop();
  }
}

function checkReminders(){
  if(!S.notifEnabled || !('Notification' in window) || Notification.permission!=='granted') return;
  const now = new Date();
  const nowMin = now.getHours()*60+now.getMinutes();
  const key = dateKey(now);
  if(!S.notifFired[key]) S.notifFired[key] = [];
  const dt = dayType(now);
  const blocks = S.scheduleTemplates[dt] || [];
  blocks.forEach((b,idx)=>{
    if(!S.notifPrefs[b.cat] && ['habit','work','cook'].includes(b.cat)) return;
    const start = timeToMin(b.start);
    const fireAt = Math.max(0, start-5); // never fire "before midnight" for blocks in the first 5 min of the day
    const stableId = b.id || idx; // block.id is stable across edits/reorders; idx is a fallback only
    const id = key+'-'+stableId;
    if(nowMin>=fireAt && nowMin<start && !S.notifFired[key].includes(id)){
      fireReminder(b, id);
      S.notifFired[key].push(id);
      persist();
    }
  });
}
setInterval(checkReminders, 20000);
setInterval(()=>{ if(S.tab==='today' && document.visibilityState==='visible' && !S.alarmActive) render(); }, 30000);

// pending alarm resume (if a notification fired while backgrounded and user taps it)
function checkPendingAlarmOnResume(){
  // handled via service worker postMessage below
}
document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible') render(); });

if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('message', (e)=>{
    if(e.data && e.data.type==='ALARM_SHOW'){
      setState({alarmActive: e.data.block});
      startAlarmLoop();
    }
    if(e.data && e.data.type==='ALARM_DISMISS'){
      stopAlarmLoop();
      setState({alarmActive:null});
    }
  });
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('service-worker.js').catch(()=>{});
  });
}

// ===================== INIT =====================
render();
