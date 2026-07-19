// ===================== STATE =====================
const STORAGE_KEY = 'levelup_os_v2';

function defaultState(){
  return {
    tab: 'today', moreOpen: false, moreScreen: null,
    theme: 'dark', currency: 'USD',
    scheduleView: dayType(new Date()),
    editingBlock: null,
    trackerView: 'day', trackerDayOffset: 0,
    addExpenseOpen: false, financeSettingsOpen: false, newCategoryName: '',
    expenseDraft: {amount:'', category: FIN_CATS_DEFAULT[0], desc:'', type:'expense'},
    financeMode: 'spending', financeMonthOffset: 0, ledgerOpen: false,
    budgets: {},
    addBookOpen: false, newBook: {title:'', author:''},
    reviewMode: 'weekly',
    reflectionDraft: {skip:'', easier:'', adjustment:''},
    alarmActive: null, alarmSnoozeId: null,
    notifPrefs: {habit:true, work:true, cook:true},
    notifEnabled: false,
    investments: [], addHoldingOpen: false, editingHoldingId: null,
    holdingDraft: {name:'', invested:'', currentValue:'', startDate:'', expectedReturnPct:'', maturityDate:'', platform:''},
    investmentDetailId: null, investmentTrendPeriod: 'month', quickUpdateValue:'',
    confirm: null,
    checkins: {}, financeEntries: [], weeklyReviews: {}, monthlyReviews: {},
    scheduleTemplates: cloneSchedule(), readingList: defaultReadingList(),
    financeCategories: FIN_CATS_DEFAULT.slice(),
    notifFired: {}
  };
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const saved = JSON.parse(raw);
      const base = defaultState();
      return Object.assign(base, saved, {
        // transient/UI state should never be restored from storage
        tab:'today', moreOpen:false, moreScreen:null, addExpenseOpen:false, financeSettingsOpen:false,
        addBookOpen:false, alarmActive:null, confirm:null, addHoldingOpen:false, investmentDetailId:null,
        editingBlock:null, ledgerOpen:false
      });
    }
  }catch(e){}
  return defaultState();
}

let S = loadState();

function persist(){
  const s = S;
  const toSave = {
    checkins:s.checkins, financeEntries:s.financeEntries, weeklyReviews:s.weeklyReviews, monthlyReviews:s.monthlyReviews,
    scheduleTemplates:s.scheduleTemplates, readingList:s.readingList, financeCategories:s.financeCategories,
    budgets:s.budgets, notifPrefs:s.notifPrefs, notifEnabled:s.notifEnabled, investments:s.investments,
    theme:s.theme, currency:s.currency, notifFired:s.notifFired
  };
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)); }catch(e){}
}

function setState(patch){
  Object.assign(S, patch);
  persist();
  render();
}

function fmtMoney(n){ return fmtMoneyFor(n, S.currency); }
function T(){ return S.theme==='dark' ? DARK_T : LIGHT_T; }

function getCheckin(key){
  return S.checkins[key] || {morningPages:false, reading:false, cameraTalk:false, workout:false, deepWorkHours:0, linkedin:false};
}
function scoreOf(c){
  let n=0;
  if(c.morningPages) n++;
  if(c.reading) n++;
  if(c.cameraTalk) n++;
  if(c.workout) n++;
  if(c.deepWorkHours>=5) n++;
  return Math.round(n/5*100);
}
function setCheckin(key, patch){
  const cur = getCheckin(key);
  S.checkins = {...S.checkins, [key]: {...cur, ...patch}};
  persist(); render();
}
function toggleHabit(field){
  const key = dateKey(new Date());
  const cur = getCheckin(key);
  setCheckin(key, {[field]: !cur[field]});
}
function streakCount(){
  let n=0; let d=new Date();
  while(true){
    const key = dateKey(d);
    const c = S.checkins[key];
    if(!c) break;
    if(scoreOf(c) < 60) break;
    n++; d = addDays(d,-1);
  }
  return n;
}
function bestStreakInRange(days){
  let best=0, cur=0;
  days.forEach(dk=>{
    const c = S.checkins[dk];
    if(c && scoreOf(c)>=60){ cur++; best=Math.max(best,cur); } else { cur=0; }
  });
  return best;
}

function monthInfo(offset){
  const base = new Date(); base.setDate(1);
  const m = addMonths(base, offset);
  return { key: m.getFullYear()+'-'+pad2(m.getMonth()+1), label: m.toLocaleDateString(undefined,{month:'long',year:'numeric'}), daysInMonth: new Date(m.getFullYear(), m.getMonth()+1, 0).getDate() };
}
function entriesForMonth(monthKey){ return S.financeEntries.filter(e=>monthKeyOf(e.date)===monthKey); }

function askConfirm(message, actionName, actionArg){
  setState({confirm:{message, actionName, actionArg}});
}
