// ===================== ACTIONS =====================
// Every interactive element in the rendered HTML carries data-act="<name>" and
// optionally data-arg="<value>". Clicks/changes are delegated to these functions.

const ACTIONS = {};

// ---- theme / currency ----
ACTIONS.toggleTheme = () => setState({theme: S.theme==='light'?'dark':'light'});
ACTIONS.setThemeLight = () => setState({theme:'light'});
ACTIONS.setThemeDark = () => setState({theme:'dark'});
ACTIONS.setCurrency = (v) => setState({currency:v});

// ---- nav ----
ACTIONS.selectTab = (t) => setState({tab:t, moreOpen:false, moreScreen:null});
ACTIONS.goFinanceTab = () => setState({tab:'finance'});
ACTIONS.openMoreSheet = () => setState({moreOpen:true});
ACTIONS.closeMoreSheet = () => setState({moreOpen:false});
ACTIONS.openReading = () => setState({moreOpen:false, moreScreen:'reading'});
ACTIONS.openReview = () => setState({moreOpen:false, moreScreen:'review'});
ACTIONS.openHabits = () => setState({moreOpen:false, moreScreen:'habits'});
ACTIONS.openSettings = () => setState({moreOpen:false, moreScreen:'settings'});
ACTIONS.closeMoreScreen = () => setState({moreScreen:null});

// ---- today: habits ----
ACTIONS.toggleHabit = (field) => toggleHabit(field);
ACTIONS.toggleLinkedin = () => toggleHabit('linkedin');
ACTIONS.numHabitInc = (field) => { const key=dateKey(new Date()); const cur=getCheckin(key); const h=S.habitDefs.find(x=>x.field===field); const step=h&&h.step?h.step:0.5; setCheckin(key,{[field]: Math.round((cur[field]+step)*10)/10}); };
ACTIONS.numHabitDec = (field) => { const key=dateKey(new Date()); const cur=getCheckin(key); const h=S.habitDefs.find(x=>x.field===field); const step=h&&h.step?h.step:0.5; setCheckin(key,{[field]: Math.max(0,Math.round((cur[field]-step)*10)/10)}); };
ACTIONS.deepWorkInc = () => ACTIONS.numHabitInc('deepWorkHours');
ACTIONS.deepWorkDec = () => ACTIONS.numHabitDec('deepWorkHours');
ACTIONS.trackerToggleHabit = (field) => { const tDate=addDays(new Date(), S.trackerDayOffset); const tKey=dateKey(tDate); const c=getCheckin(tKey); setCheckin(tKey,{[field]: !c[field]}); };
ACTIONS.trackerToggleNumHabit = (field) => {
  const tDate=addDays(new Date(), S.trackerDayOffset); const tKey=dateKey(tDate); const c=getCheckin(tKey);
  const h=S.habitDefs.find(x=>x.field===field); const target=h?h.target:5;
  setCheckin(tKey,{[field]: c[field]>=target?0:target});
};

// ---- schedule ----
ACTIONS.setScheduleView = (v) => setState({scheduleView:v});
ACTIONS.openBlockEditor = (arg) => {
  const [dayKey, blockId] = arg.split('|');
  if(blockId){
    const block = (S.scheduleTemplates[dayKey]||[]).find(b=>b.id===blockId);
    setState({editingBlock: {...block, dayKey}});
  } else {
    setState({editingBlock: {id:null, dayKey, start:'09:00', end:'10:00', label:'', cat:'work'}});
  }
};
ACTIONS.closeBlockEditor = () => setState({editingBlock:null});
ACTIONS.setBlockStart = (v) => setState({editingBlock:{...S.editingBlock, start:v}});
ACTIONS.setBlockEnd = (v) => setState({editingBlock:{...S.editingBlock, end:v}});
ACTIONS.setBlockLabel = (v) => setState({editingBlock:{...S.editingBlock, label:v}});
ACTIONS.setBlockCat = (v) => setState({editingBlock:{...S.editingBlock, cat:v}});
ACTIONS.commitBlock = () => {
  const eb = S.editingBlock; if(!eb) return;
  const list = (S.scheduleTemplates[eb.dayKey]||[]).slice();
  const idx = list.findIndex(b=>b.id===eb.id);
  const cleaned = {id: eb.id||uid(), start:eb.start, end:eb.end, label:eb.label, cat:eb.cat};
  if(idx>=0) list[idx]=cleaned; else list.push(cleaned);
  list.sort((a,b)=>timeToMin(a.start)-timeToMin(b.start));
  setState({scheduleTemplates:{...S.scheduleTemplates, [eb.dayKey]:list}, editingBlock:null});
};
ACTIONS.askDeleteBlock = () => { const eb=S.editingBlock; askConfirm('Delete "'+eb.label+'" from the schedule?', 'deleteBlock'); };
ACTIONS.deleteBlock = () => {
  const eb = S.editingBlock; if(!eb || !eb.id) return;
  const list = (S.scheduleTemplates[eb.dayKey]||[]).filter(b=>b.id!==eb.id);
  setState({scheduleTemplates:{...S.scheduleTemplates, [eb.dayKey]:list}, editingBlock:null, confirm:null});
};
ACTIONS.addBlock = () => ACTIONS.openBlockEditor(S.scheduleView+'|');

// ---- calendar bookings (one-off events tied to a specific date) ----
ACTIONS.setScheduleMode = (v) => setState({scheduleMode:v});
ACTIONS.calPrevMonth = () => setState({calMonthOffset:S.calMonthOffset-1});
ACTIONS.calNextMonth = () => setState({calMonthOffset:S.calMonthOffset+1});
ACTIONS.calGoToday = () => setState({calMonthOffset:0, calSelectedDate:dateKey(new Date())});
ACTIONS.selectCalDate = (dk) => setState({calSelectedDate:dk});
ACTIONS.openAddBooking = (dk) => setState({addBookingOpen:true, editingBookingId:null, bookingDraft:{date:dk||S.calSelectedDate, start:'09:00', end:'10:00', label:'', cat:'booking'}});
ACTIONS.editBooking = (arg) => {
  const idx = arg.indexOf('|'); const dk = arg.slice(0,idx); const id = arg.slice(idx+1);
  const b = (S.bookings[dk]||[]).find(x=>x.id===id); if(!b) return;
  setState({addBookingOpen:true, editingBookingId:id, bookingDraft:{date:dk, start:b.start, end:b.end, label:b.label, cat:b.cat}});
};
ACTIONS.closeAddBooking = () => setState({addBookingOpen:false});
ACTIONS.setBookingStart = (v) => setState({bookingDraft:{...S.bookingDraft, start:v}});
ACTIONS.setBookingEnd = (v) => setState({bookingDraft:{...S.bookingDraft, end:v}});
ACTIONS.setBookingLabel = (v) => setState({bookingDraft:{...S.bookingDraft, label:v}});
ACTIONS.setBookingCat = (v) => setState({bookingDraft:{...S.bookingDraft, cat:v}});
ACTIONS.setBookingDate = (v) => setState({bookingDraft:{...S.bookingDraft, date:v}});
ACTIONS.submitBooking = () => {
  const d = S.bookingDraft; if(!d.label || !d.date) return;
  const list = (S.bookings[d.date]||[]).slice();
  const cleaned = {id: S.editingBookingId||uid(), start:d.start, end:d.end, label:d.label, cat:d.cat};
  const idx = list.findIndex(b=>b.id===cleaned.id);
  if(idx>=0) list[idx]=cleaned; else list.push(cleaned);
  list.sort((a,b)=>timeToMin(a.start)-timeToMin(b.start));
  setState({bookings:{...S.bookings, [d.date]:list}, addBookingOpen:false, calSelectedDate:d.date});
};
ACTIONS.askDeleteBooking = () => { const d=S.bookingDraft; askConfirm('Delete "'+d.label+'"?', 'deleteBooking'); };
ACTIONS.deleteBooking = () => {
  const d = S.bookingDraft; if(!S.editingBookingId) return;
  const list = (S.bookings[d.date]||[]).filter(b=>b.id!==S.editingBookingId);
  setState({bookings:{...S.bookings, [d.date]:list}, addBookingOpen:false, confirm:null});
};

// ---- alarm ----
ACTIONS.triggerAlarm = (blockJson) => {
  const block = JSON.parse(decodeURIComponent(blockJson));
  setState({alarmActive: block});
  startAlarmLoop();
};
ACTIONS.dismissAlarm = () => { stopAlarmLoop(); setState({alarmActive:null}); };

// ---- tracker ----
ACTIONS.setTrackerView = (v) => setState({trackerView:v});
ACTIONS.trackerPrevDay = () => setState({trackerDayOffset:S.trackerDayOffset-1});
ACTIONS.trackerNextDay = () => setState({trackerDayOffset:Math.min(0,S.trackerDayOffset+1)});
ACTIONS.jumpTrackerDay = (offset) => setState({trackerView:'day', trackerDayOffset:Number(offset)});

// ---- finance: mode/month ----
ACTIONS.setModeSpending = () => setState({financeMode:'spending'});
ACTIONS.setModeInvesting = () => setState({financeMode:'investing'});
ACTIONS.prevMonth = () => setState({financeMonthOffset:S.financeMonthOffset-1});
ACTIONS.nextMonth = () => setState({financeMonthOffset:Math.min(0,S.financeMonthOffset+1)});
ACTIONS.setFinanceCurrencyView = (v) => setState({financeCurrencyView:v});
ACTIONS.setInvestCurrencyView = (v) => setState({investCurrencyView:v});

// ---- finance settings ----
ACTIONS.openFinanceSettings = () => setState({financeSettingsOpen:true});
ACTIONS.closeFinanceSettings = () => setState({financeSettingsOpen:false});
ACTIONS.setBudget = (arg) => {
  const idx = arg.indexOf('::'); const cat = arg.slice(0,idx); const val = arg.slice(idx+2);
  const mi = monthInfo(S.financeMonthOffset);
  setBudgetValue(S.financeCurrencyView, mi.key, cat, val);
};
ACTIONS.copyBudgetsFromLastMonth = () => {
  const mi = monthInfo(S.financeMonthOffset);
  const prevMi = monthInfo(S.financeMonthOffset-1);
  copyBudgetsForward(S.financeCurrencyView, prevMi.key, mi.key);
};
ACTIONS.setNewCategoryName = (v) => setState({newCategoryName:v});
ACTIONS.addCategory = () => { const name=(S.newCategoryName||'').trim(); if(!name || S.financeCategories.includes(name)) return; setState({financeCategories:[...S.financeCategories, name], newCategoryName:''}); };
ACTIONS.removeCategory = (name) => askConfirm('Remove category "'+name+'"?', 'removeCategoryConfirmed', name);
ACTIONS.removeCategoryConfirmed = (name) => setState({financeCategories:S.financeCategories.filter(c=>c!==name), confirm:null});

// ---- ledger ----
ACTIONS.openLedger = () => setState({ledgerOpen:true});
ACTIONS.closeLedger = () => setState({ledgerOpen:false});

// ---- add expense ----
ACTIONS.openAddExpense = () => setState({addExpenseOpen:true, expenseDraft:{amount:'', category:S.financeCategories[0], desc:'', type:'expense', currency:S.financeCurrencyView}});
ACTIONS.closeAddExpense = () => setState({addExpenseOpen:false});
ACTIONS.setTypeExpense = () => setState({expenseDraft:{...S.expenseDraft, type:'expense'}});
ACTIONS.setTypeIncome = () => setState({expenseDraft:{...S.expenseDraft, type:'income'}});
ACTIONS.setTypeSavings = () => setState({expenseDraft:{...S.expenseDraft, type:'savings'}});
ACTIONS.setExpDesc = (v) => setState({expenseDraft:{...S.expenseDraft, desc:v}});
ACTIONS.setExpAmount = (v) => setState({expenseDraft:{...S.expenseDraft, amount:v}});
ACTIONS.setExpCategory = (v) => setState({expenseDraft:{...S.expenseDraft, category:v}});
ACTIONS.setExpCurrency = (v) => setState({expenseDraft:{...S.expenseDraft, currency:v}});
ACTIONS.submitExpense = () => {
  const d = S.expenseDraft;
  const amt = parseFloat(d.amount); if(!amt || amt<=0) return;
  const cat = d.type==='income' ? 'Income' : d.type==='savings' ? 'Savings' : d.category;
  const desc = d.desc || cat;
  const entry = {id:uid(), date:dateKey(new Date()), amount:amt, category:cat, desc, type:d.type, currency:d.currency||'XOF'};
  setState({financeEntries:[entry, ...S.financeEntries], addExpenseOpen:false});
};
ACTIONS.removeExpense = (arg) => { const [id,desc] = arg.split('::'); askConfirm('Delete "'+desc+'"?', 'removeExpenseConfirmed', id); };
ACTIONS.removeExpenseConfirmed = (id) => setState({financeEntries:S.financeEntries.filter(e=>e.id!==id), confirm:null});

// ---- reading ----
ACTIONS.openAddBook = () => setState({addBookOpen:true, newBook:{title:'',author:''}});
ACTIONS.closeAddBook = () => setState({addBookOpen:false});
ACTIONS.setNewBookTitle = (v) => setState({newBook:{...S.newBook, title:v}});
ACTIONS.setNewBookAuthor = (v) => setState({newBook:{...S.newBook, author:v}});
ACTIONS.submitBook = () => {
  const nb = S.newBook; if(!nb.title) return;
  const maxOrder = S.readingList.reduce((m,b)=>Math.max(m,b.order||0),0);
  const book = {id:uid(), title:nb.title, author:nb.author||'Unknown', status:'not_started', progressPct:0, startedDate:null, finishedDate:null, order:maxOrder+1};
  setState({readingList:[...S.readingList, book], addBookOpen:false});
};
ACTIONS.removeBook = (arg) => { const [id,title]=arg.split('::'); askConfirm('Remove "'+title+'" from your list?', 'removeBookConfirmed', id); };
ACTIONS.removeBookConfirmed = (id) => setState({readingList:S.readingList.filter(b=>b.id!==id), confirm:null});
ACTIONS.markBookDone = (id) => setState({readingList:S.readingList.map(b=> b.id===id?{...b,status:'done',progressPct:100,finishedDate:dateKey(new Date()),startedDate:b.startedDate||dateKey(new Date())}:b)});
ACTIONS.setBookProgress = (arg) => {
  const [id,val] = arg.split('::');
  setState({readingList:S.readingList.map(b=>{
    if(b.id!==id) return b;
    const started = b.startedDate || dateKey(new Date());
    return {...b, progressPct:Number(val), startedDate:started, status: b.status==='not_started'?'in_progress':b.status};
  })});
};
ACTIONS.restartBook = (id) => {
  const minOrder = Math.min(0, ...S.readingList.map(b=>b.order||0));
  setState({readingList:S.readingList.map(b=> b.id===id?{...b,status:'in_progress',progressPct:0,startedDate:dateKey(new Date()),finishedDate:null,order:minOrder-1}:b)});
};
ACTIONS.moveBook = (arg) => {
  const [id,dirStr] = arg.split('::'); const dir=Number(dirStr);
  const primary = S.readingList.filter(b=>b.status!=='done').sort((a,b)=>a.order-b.order);
  const idx = primary.findIndex(b=>b.id===id);
  const swapIdx = idx+dir;
  if(idx<0||swapIdx<0||swapIdx>=primary.length) return;
  const a=primary[idx], b=primary[swapIdx]; const oa=a.order, ob=b.order;
  setState({readingList:S.readingList.map(bk=>{
    if(bk.id===a.id) return {...bk, order:ob};
    if(bk.id===b.id) return {...bk, order:oa};
    return bk;
  })});
};

// ---- review ----
ACTIONS.setReviewWeekly = () => setState({reviewMode:'weekly'});
ACTIONS.setReviewMonthly = () => setState({reviewMode:'monthly'});
ACTIONS.setReflSkip = (v) => setState({reflectionDraft:{...S.reflectionDraft, skip:v}});
ACTIONS.setReflEasier = (v) => setState({reflectionDraft:{...S.reflectionDraft, easier:v}});
ACTIONS.setReflAdjustment = (v) => setState({reflectionDraft:{...S.reflectionDraft, adjustment:v}});
ACTIONS.completeMissed = (arg) => { const [dk,field] = arg.split('::'); setCheckin(dk,{[field]:true}); };
ACTIONS.saveReflection = () => {
  if(S.reviewMode==='weekly'){
    const key = dateKey(mondayOf(new Date()));
    const c = S.checkins;
    let sum=0,n=0; for(let i=0;i<7;i++){ const dk=dateKey(addDays(new Date(),-i)); if(c[dk]){ sum+=scoreOf(c[dk]); n++; } }
    const avg = n?Math.round(sum/n):0;
    let liCount=0; for(let i=0;i<7;i++){ const dk=dateKey(addDays(new Date(),-i)); if(c[dk]&&c[dk].linkedin) liCount++; }
    setState({weeklyReviews:{...S.weeklyReviews, [key]:{avgScore:avg, linkedinCount:liCount, reflection:{...S.reflectionDraft}}}, reflectionDraft:{skip:'',easier:'',adjustment:''}});
  } else {
    const today=new Date(); const key = today.getFullYear()+'-'+pad2(today.getMonth()+1);
    const c = S.checkins; const daysInMonth = today.getDate();
    let sum=0,n=0,liCount=0;
    for(let i=0;i<daysInMonth;i++){ const d=new Date(today.getFullYear(),today.getMonth(),i+1); const dk=dateKey(d); if(c[dk]){ sum+=scoreOf(c[dk]); n++; if(c[dk].linkedin) liCount++; } }
    const avg = n?Math.round(sum/n):0;
    setState({monthlyReviews:{...S.monthlyReviews, [key]:{avgScore:avg, linkedinCount:liCount, reflection:{...S.reflectionDraft}}}, reflectionDraft:{skip:'',easier:'',adjustment:''}});
  }
};

// ---- settings: notifications / data ----
ACTIONS.toggleNotif = (cat) => setState({notifPrefs:{...S.notifPrefs, [cat]: !S.notifPrefs[cat]}});
ACTIONS.enableNotifications = async () => {
  if(!('Notification' in window)) return;
  if(Notification.permission==='denied'){ toast('Notifications are blocked in browser settings'); return; }
  const perm = await Notification.requestPermission();
  if(perm==='granted'){ setState({notifEnabled:true}); toast('Reminders on'); }
};
ACTIONS.disableNotifications = () => setState({notifEnabled:false});
ACTIONS.askResetData = () => askConfirm('Reset all data? This cannot be undone.', 'resetData');
ACTIONS.resetData = () => { try{ localStorage.removeItem(STORAGE_KEY); }catch(e){} window.location.reload(); };
ACTIONS.exportData = () => {
  const s = S;
  const toSave = {checkins:s.checkins, financeEntries:s.financeEntries, weeklyReviews:s.weeklyReviews, monthlyReviews:s.monthlyReviews, scheduleTemplates:s.scheduleTemplates, readingList:s.readingList, financeCategories:s.financeCategories, budgets:s.budgets, notifPrefs:s.notifPrefs, investments:s.investments, theme:s.theme, currency:s.currency, bookings:s.bookings, habitDefs:s.habitDefs};
  const blob = new Blob([JSON.stringify(toSave,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='levelup-backup-'+dateKey(new Date())+'.json'; a.click();
  URL.revokeObjectURL(url);
};
ACTIONS.triggerImport = () => { const el=document.getElementById('import-file-input'); if(el) el.click(); };
ACTIONS.handleImportFile = (file) => {
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{ const data = JSON.parse(reader.result); Object.assign(S, data); persist(); render(); toast('Backup restored'); }
    catch(e){ toast("Couldn't read that file"); }
  };
  reader.readAsText(file);
};

// ---- investments ----
ACTIONS.openAddHolding = () => setState({addHoldingOpen:true, editingHoldingId:null, holdingDraft:{name:'',invested:'',currentValue:'',startDate:dateKey(new Date()),expectedReturnPct:'',maturityDate:'',platform:'',currency:'USD'}});
ACTIONS.editDetailHolding = () => {
  const h = S.investments.find(x=>x.id===S.investmentDetailId); if(!h) return;
  setState({addHoldingOpen:true, editingHoldingId:h.id, holdingDraft:{name:h.name, invested:String(h.invested), currentValue:String(h.currentValue), startDate:h.startDate||'', expectedReturnPct:h.expectedReturnPct!=null?String(h.expectedReturnPct):'', maturityDate:h.maturityDate||'', platform:h.platform||'', currency:h.currency||'USD'}});
};
ACTIONS.closeAddHolding = () => setState({addHoldingOpen:false});
ACTIONS.setHoldingName = (v) => setState({holdingDraft:{...S.holdingDraft, name:v}});
ACTIONS.setHoldingInvested = (v) => setState({holdingDraft:{...S.holdingDraft, invested:v}});
ACTIONS.setHoldingCurrent = (v) => setState({holdingDraft:{...S.holdingDraft, currentValue:v}});
ACTIONS.setHoldingStartDate = (v) => setState({holdingDraft:{...S.holdingDraft, startDate:v}});
ACTIONS.setHoldingExpectedReturn = (v) => setState({holdingDraft:{...S.holdingDraft, expectedReturnPct:v}});
ACTIONS.setHoldingMaturity = (v) => setState({holdingDraft:{...S.holdingDraft, maturityDate:v}});
ACTIONS.setHoldingPlatform = (v) => setState({holdingDraft:{...S.holdingDraft, platform:v}});
ACTIONS.setHoldingCurrency = (v) => setState({holdingDraft:{...S.holdingDraft, currency:v}});
ACTIONS.submitHolding = () => {
  const d = S.holdingDraft; if(!d.name) return;
  const invested = parseFloat(d.invested)||0, cur = parseFloat(d.currentValue)||0;
  const today = dateKey(new Date());
  if(S.editingHoldingId){
    setState({investments:S.investments.map(h=>{
      if(h.id!==S.editingHoldingId) return h;
      const hist = (h.currentValue!==cur) ? [...(h.valueHistory||[]), {date:today,value:cur}] : (h.valueHistory||[]);
      return {...h, name:d.name, invested, currentValue:cur, startDate:d.startDate, expectedReturnPct:d.expectedReturnPct===''?null:Number(d.expectedReturnPct), maturityDate:d.maturityDate, platform:d.platform, currency:d.currency||'USD', valueHistory:hist};
    }), addHoldingOpen:false});
  } else {
    setState({investments:[...S.investments, {id:uid(), name:d.name, invested, currentValue:cur, startDate:d.startDate||today, expectedReturnPct:d.expectedReturnPct===''?null:Number(d.expectedReturnPct), maturityDate:d.maturityDate, platform:d.platform||'—', currency:d.currency||'USD', valueHistory:[{date:d.startDate||today,value:invested},{date:today,value:cur}]}], addHoldingOpen:false});
  }
};
ACTIONS.openInvestmentDetail = (id) => setState({investmentDetailId:id, investmentTrendPeriod:'month', quickUpdateValue:''});
ACTIONS.closeInvestmentDetail = () => setState({investmentDetailId:null});
ACTIONS.setTrendPeriod = (p) => setState({investmentTrendPeriod:p});
ACTIONS.setQuickUpdateValue = (v) => setState({quickUpdateValue:v});
ACTIONS.logHoldingUpdate = () => {
  const v = parseFloat(S.quickUpdateValue); if(!v && v!==0) return;
  const today = dateKey(new Date());
  setState({investments:S.investments.map(h=> h.id===S.investmentDetailId ? {...h, currentValue:v, valueHistory:[...(h.valueHistory||[]), {date:today,value:v}]} : h), quickUpdateValue:''});
};
ACTIONS.askDeleteHolding = () => { const h=S.investments.find(x=>x.id===S.investmentDetailId); askConfirm('Delete holding "'+(h?h.name:'')+'"?', 'deleteHolding'); };
ACTIONS.deleteHolding = () => { const id=S.investmentDetailId; setState({investments:S.investments.filter(h=>h.id!==id), investmentDetailId:null, confirm:null}); };

// ---- manage habits ----
ACTIONS.openNewHabit = () => setState({newHabitOpen:true, newHabitDraft:{label:'', type:'bool', target:5}});
ACTIONS.closeNewHabit = () => setState({newHabitOpen:false});
ACTIONS.setNewHabitLabel = (v) => setState({newHabitDraft:{...S.newHabitDraft, label:v}});
ACTIONS.setNewHabitType = (v) => setState({newHabitDraft:{...S.newHabitDraft, type:v}});
ACTIONS.setNewHabitTarget = (v) => setState({newHabitDraft:{...S.newHabitDraft, target:Number(v)||1}});
ACTIONS.submitNewHabit = () => {
  const d = S.newHabitDraft; const label = (d.label||'').trim(); if(!label) return;
  const field = 'h_'+uid();
  const color = HABIT_COLOR_POOL[S.habitDefs.length % HABIT_COLOR_POOL.length];
  const def = {id:uid(), field, label, type:d.type, color, ...(d.type==='number'?{target:d.target||1}:{})};
  setState({habitDefs:[...S.habitDefs, def], newHabitOpen:false});
};
ACTIONS.renameHabit = (arg) => {
  const idx = arg.indexOf('::'); const id = arg.slice(0,idx); const label = arg.slice(idx+2);
  setState({habitDefs:S.habitDefs.map(h=> h.id===id ? {...h, label} : h)});
};
ACTIONS.setHabitTargetValue = (arg) => {
  const idx = arg.indexOf('::'); const id = arg.slice(0,idx); const val = Number(arg.slice(idx+2))||1;
  setState({habitDefs:S.habitDefs.map(h=> h.id===id ? {...h, target:val} : h)});
};
ACTIONS.askRemoveHabit = (arg) => { const [id,label] = [arg.split('::')[0], decodeURIComponent(arg.split('::')[1])]; askConfirm('Remove "'+label+'" from Core Habits? Past check-ins for it are kept but it will stop showing up.', 'removeHabitConfirmed', id); };
ACTIONS.removeHabitConfirmed = (id) => setState({habitDefs:S.habitDefs.filter(h=>h.id!==id), confirm:null});
ACTIONS.moveHabit = (arg) => {
  const [id,dirStr] = arg.split('::'); const dir=Number(dirStr);
  const list = S.habitDefs.slice();
  const idx = list.findIndex(h=>h.id===id);
  const swapIdx = idx+dir;
  if(idx<0||swapIdx<0||swapIdx>=list.length) return;
  [list[idx], list[swapIdx]] = [list[swapIdx], list[idx]];
  setState({habitDefs:list});
};

// ---- confirm dialog ----
ACTIONS.confirmYes = () => { const c=S.confirm; if(c && c.actionName){ ACTIONS[c.actionName](c.actionArg); } else { setState({confirm:null}); } };
ACTIONS.confirmNo = () => setState({confirm:null});
