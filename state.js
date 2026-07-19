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
    expenseDraft: {amount:'', category: FIN_CATS_DEFAULT[0], desc:'', type:'expense', currency:'XOF'},
    financeMode: 'spending', financeMonthOffset: 0, ledgerOpen: false, financeCurrencyView: 'XOF', investCurrencyView: 'USD',
    budgets: {},
    addBookOpen: false, newBook: {title:'', author:''},
    reviewMode: 'weekly',
    reflectionDraft: {skip:'', easier:'', adjustment:''},
    alarmActive: null, alarmSnoozeId: null,
    notifPrefs: {habit:true, work:true, cook:true},
    notifEnabled: false,
    investments: [], addHoldingOpen: false, editingHoldingId: null,
    holdingDraft: {name:'', invested:'', currentValue:'', startDate:'', expectedReturnPct:'', maturityDate:'', platform:'', currency:'USD'},
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
    theme:s.theme, currency:s.currency, notifFired:s.notifFired, financeCurrencyView:s.financeCurrencyView, investCurrencyView:s.investCurrencyView
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
function entriesForMonthCur(monthKey, currency){ return S.financeEntries.filter(e=>monthKeyOf(e.date)===monthKey && (e.currency||'XOF')===currency); }

// ---- budgets: keyed by currency -> monthKey -> category -> amount ----
function getBudget(currency, monthKey, category){
  return S.budgets[currency] && S.budgets[currency][monthKey] ? S.budgets[currency][monthKey][category] : undefined;
}
function setBudgetValue(currency, monthKey, category, amount){
  const cur = S.budgets[currency] ? {...S.budgets[currency]} : {};
  const mo = cur[monthKey] ? {...cur[monthKey]} : {};
  if(amount===undefined || amount==='' || isNaN(amount)) delete mo[category]; else mo[category]=Number(amount);
  cur[monthKey] = mo;
  setState({budgets:{...S.budgets, [currency]:cur}});
}
function budgetsForMonth(currency, monthKey){
  return (S.budgets[currency] && S.budgets[currency][monthKey]) ? S.budgets[currency][monthKey] : {};
}
function copyBudgetsForward(currency, fromMonthKey, toMonthKey){
  const src = budgetsForMonth(currency, fromMonthKey);
  if(!Object.keys(src).length) return;
  const cur = S.budgets[currency] ? {...S.budgets[currency]} : {};
  cur[toMonthKey] = {...src, ...(cur[toMonthKey]||{})};
  setState({budgets:{...S.budgets, [currency]:cur}});
}
function daysLeftInMonth(offset){
  if(offset!==0) return 0;
  const mi = monthInfo(0);
  return mi.daysInMonth - new Date().getDate();
}

// ---- insights engine: plain factual observations from the user's own data ----
function computeInsights(currency, monthOffset){
  const insights = [];
  const mi = monthInfo(monthOffset);
  const prevMi = monthInfo(monthOffset-1);
  const entries = entriesForMonthCur(mi.key, currency);
  const prevEntries = entriesForMonthCur(prevMi.key, currency);
  const expenses = entries.filter(e=>e.type==='expense');
  const prevExpenses = prevEntries.filter(e=>e.type==='expense');

  const byCat = {}; expenses.forEach(e=>{ byCat[e.category]=(byCat[e.category]||0)+e.amount; });
  const prevByCat = {}; prevExpenses.forEach(e=>{ prevByCat[e.category]=(prevByCat[e.category]||0)+e.amount; });

  // 1) budget pace warnings
  const budgets = budgetsForMonth(currency, mi.key);
  const daysLeft = daysLeftInMonth(monthOffset);
  Object.keys(budgets).forEach(cat=>{
    const budget = budgets[cat]; if(!budget) return;
    const spent = byCat[cat]||0;
    const pct = Math.round(spent/budget*100);
    if(pct>=100){
      insights.push({type:'over', text:`${cat} is over budget by ${fmtMoneyFor(spent-budget, currency)}`});
    } else if(pct>=70){
      insights.push({type:'warn', text: monthOffset===0 && daysLeft>0
        ? `${cat} is at ${pct}% of budget with ${daysLeft} day${daysLeft===1?'':'s'} left in the month`
        : `${cat} is at ${pct}% of budget`});
    }
  });

  // 2) category trend vs last month
  Object.keys(byCat).forEach(cat=>{
    const now = byCat[cat]; const prev = prevByCat[cat];
    if(prev && prev>0){
      const chg = Math.round((now-prev)/prev*100);
      if(Math.abs(chg)>=20){
        insights.push({type: chg>0?'warn':'good', text:`${cat} spending is ${chg>0?'up':'down'} ${Math.abs(chg)}% vs last month`});
      }
    }
  });

  // 3) savings rate change
  const income = entries.filter(e=>e.type==='income').reduce((s,e)=>s+e.amount,0);
  const totalExp = expenses.reduce((s,e)=>s+e.amount,0);
  const saved = entries.filter(e=>e.type==='savings').reduce((s,e)=>s+e.amount,0);
  const prevIncome = prevEntries.filter(e=>e.type==='income').reduce((s,e)=>s+e.amount,0);
  const prevExpTotal = prevExpenses.reduce((s,e)=>s+e.amount,0);
  const prevSaved = prevEntries.filter(e=>e.type==='savings').reduce((s,e)=>s+e.amount,0);
  if(income>0 && prevIncome>0){
    const rate = Math.round((income-totalExp-saved)/income*100);
    const prevRate = Math.round((prevIncome-prevExpTotal-prevSaved)/prevIncome*100);
    if(Math.abs(rate-prevRate)>=5){
      insights.push({type: rate<prevRate?'warn':'good', text:`Your savings rate ${rate<prevRate?'dropped':'rose'} from ${prevRate}% to ${rate}% this month`});
    }
  }

  // 4) highest-in-N-months per category
  Object.keys(byCat).forEach(cat=>{
    let higherFound = false; let monthsChecked = 0;
    for(let i=1;i<=6;i++){
      const pastKey = monthInfo(monthOffset-i).key;
      const pastTotal = entriesForMonthCur(pastKey, currency).filter(e=>e.type==='expense'&&e.category===cat).reduce((s,e)=>s+e.amount,0);
      if(pastTotal>0){ monthsChecked++; if(pastTotal>=byCat[cat]) higherFound=true; }
    }
    if(!higherFound && monthsChecked>=2){
      insights.push({type:'warn', text:`This is your highest ${cat} month in the last 6`});
    }
  });

  return insights;
}

function askConfirm(message, actionName, actionArg){
  setState({confirm:{message, actionName, actionArg}});
}
