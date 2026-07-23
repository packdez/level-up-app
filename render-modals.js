// ===================== RENDER: modals & overlays =====================

function renderMoreSheet(){
  if(!S.moreOpen) return '';
  const t = T();
  const anim = JUST_OPENED.moreSheet ? 'animation:lu-slideup 0.22s ease;' : '';
  return `
  <div data-act="closeMoreSheet" style="position:absolute;inset:0;background:rgba(0,0,0,0.5);z-index:29"></div>
  <div style="position:absolute;left:0;right:0;bottom:0;background:${t.surface};border-radius:22px 22px 0 0;padding:10px 16px 26px;z-index:30;${anim}border-top:1px solid ${t.border}">
    <div style="width:36px;height:4px;border-radius:2px;background:${t.textMuted};opacity:0.3;margin:2px auto 14px"></div>
    <button data-act="openReading" style="width:100%;text-align:left;background:none;border:none;padding:12px 6px;font-size:14px;font-weight:600;color:${t.text};cursor:pointer;border-bottom:1px solid ${t.border};display:flex;align-items:center;gap:12px">${icon('book',{size:17,color:t.textMuted})}Reading List</button>
    <button data-act="openReview" style="width:100%;text-align:left;background:none;border:none;padding:12px 6px;font-size:14px;font-weight:600;color:${t.text};cursor:pointer;border-bottom:1px solid ${t.border};display:flex;align-items:center;gap:12px">${icon('flag',{size:17,color:t.textMuted})}Review</button>
    <button data-act="openHabits" style="width:100%;text-align:left;background:none;border:none;padding:12px 6px;font-size:14px;font-weight:600;color:${t.text};cursor:pointer;border-bottom:1px solid ${t.border};display:flex;align-items:center;gap:12px">${icon('target',{size:17,color:t.textMuted})}Manage Habits</button>
    <button data-act="openSettings" style="width:100%;text-align:left;background:none;border:none;padding:12px 6px;font-size:14px;font-weight:600;color:${t.text};cursor:pointer;display:flex;align-items:center;gap:12px">${icon('settings',{size:17,color:t.textMuted})}Settings</button>
  </div>`;
}

function modalShell(title, closeAct, innerHtml, extraPadBottom, justOpened){
  const t = T();
  const anim = justOpened ? 'animation:lu-slideup 0.25s ease;' : '';
  return `
  <div style="position:absolute;inset:0;background:${t.bg};z-index:20;display:flex;flex-direction:column;${anim}">
    <div style="display:flex;align-items:center;gap:10px;padding:16px 20px;border-bottom:1px solid ${t.border};flex-shrink:0">
      <button data-act="${closeAct}" style="background:none;border:none;color:#F2A93B;display:flex;align-items:center;cursor:pointer">${icon('chevronLeft',{size:20,color:'#F2A93B'})}</button>
      <div style="font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:700;color:${t.text}">${title}</div>
    </div>
    <div data-scroll-id="modal" style="flex:1;overflow-y:auto;padding:16px 20px ${extraPadBottom||'40px'}">${innerHtml}</div>
  </div>`;
}

function renderReadingModal(){
  const t = T();
  const activeBooks = S.readingList.filter(b=>b.status!=='done').sort((a,b)=>a.order-b.order);
  const currentBook = activeBooks[0];
  const queued = activeBooks.slice(1);
  const finished = S.readingList.filter(b=>b.status==='done').sort((a,b)=>(b.finishedDate||'').localeCompare(a.finishedDate||''));

  let inner = `<div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Now reading</div>`;
  if(currentBook){
    inner += `
    <div style="background:${t.surface2};border-radius:16px;padding:16px;margin-bottom:18px;border:1px solid rgba(242,169,59,0.3)">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;color:${t.text}">${escapeHtml(currentBook.title)}</div>
      <div style="font-size:12px;color:${t.textMuted};margin-bottom:10px">${escapeHtml(currentBook.author)}</div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:${t.textMuted};margin-bottom:5px"><span>Progress</span><span style="font-family:'JetBrains Mono',monospace;color:#F2A93B">${currentBook.progressPct}%</span></div>
      <input type="range" min="0" max="100" value="${currentBook.progressPct}" data-act-change="setBookProgress" data-arg-prefix="${currentBook.id}::" style="width:100%;margin-bottom:12px">
      <button data-act="markBookDone" data-arg="${currentBook.id}" style="background:rgba(61,220,132,0.15);border:1px solid rgba(61,220,132,0.4);color:#3DDC84;font-size:12px;font-weight:600;padding:7px 14px;border-radius:20px;cursor:pointer">Mark finished</button>
    </div>`;
  }
  inner += `<div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Up next</div><div style="display:flex;flex-direction:column;gap:8px;margin-bottom:18px">`;
  inner += queued.map(qb=>`
    <div style="display:flex;align-items:center;gap:10px;background:${t.surface};border-radius:12px;padding:10px 12px;border:1px solid ${t.border};box-shadow:${t.shadow}">
      <div style="flex:1"><div style="font-size:13px;color:${t.text};font-weight:500">${escapeHtml(qb.title)}</div><div style="font-size:11px;color:${t.textMuted}">${escapeHtml(qb.author)}</div></div>
      <button data-act="moveBook" data-arg="${qb.id}::-1" style="background:none;border:none;color:${t.textMuted};display:flex;align-items:center;cursor:pointer;transform:rotate(-90deg)">${icon('chevronRight',{size:14,color:t.textMuted})}</button>
      <button data-act="moveBook" data-arg="${qb.id}::1" style="background:none;border:none;color:${t.textMuted};display:flex;align-items:center;cursor:pointer;transform:rotate(90deg)">${icon('chevronRight',{size:14,color:t.textMuted})}</button>
      <button data-act="removeBook" data-arg="${qb.id}::${encodeURIComponent(qb.title)}" style="background:none;border:none;color:${t.textMuted};display:flex;align-items:center;cursor:pointer">${icon('x',{size:14,color:t.textMuted})}</button>
    </div>`).join('') || `<div style="font-size:12px;color:${t.textMuted}">Nothing queued.</div>`;
  inner += `</div>`;

  if(finished.length){
    inner += `<div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Finished</div><div style="display:flex;flex-direction:column;gap:8px;margin-bottom:18px">`;
    inner += finished.map(fb=>{
      const dur = fb.startedDate && fb.finishedDate ? (daysBetween(fb.startedDate, fb.finishedDate)+'d') : '';
      return `<div style="display:flex;align-items:center;gap:10px;background:${t.surface};border-radius:12px;padding:10px 12px;border:1px solid ${t.border};box-shadow:${t.shadow}">
        <div style="flex:1"><div style="font-size:13px;color:${t.text};font-weight:500">${escapeHtml(fb.title)}</div><div style="font-size:11px;color:${t.textMuted}">${escapeHtml(fb.author)} ${dur?'· '+dur:''}</div></div>
        <button data-act="restartBook" data-arg="${fb.id}" style="background:rgba(242,169,59,0.12);border:1px solid rgba(242,169,59,0.3);color:#F2A93B;font-size:11px;padding:5px 10px;border-radius:16px;cursor:pointer">Restart</button>
      </div>`;
    }).join('');
    inner += `</div>`;
  }

  if(S.addBookOpen){
    inner += `
    <div style="background:${t.surface};border-radius:14px;padding:14px;margin-top:8px;border:1px solid ${t.border};box-shadow:${t.shadow}">
      <input data-act-change="setNewBookTitle" value="${escapeHtml(S.newBook.title)}" placeholder="Title" style="width:100%;box-sizing:border-box;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:8px;color:${t.text};font-size:13px;padding:8px 10px;margin-bottom:8px">
      <input data-act-change="setNewBookAuthor" value="${escapeHtml(S.newBook.author)}" placeholder="Author" style="width:100%;box-sizing:border-box;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:8px;color:${t.text};font-size:13px;padding:8px 10px;margin-bottom:10px">
      <div style="display:flex;gap:8px">
        <button data-act="submitBook" style="flex:1;background:#F2A93B;border:none;color:#0F1B2B;font-size:12px;font-weight:700;padding:9px;border-radius:10px;cursor:pointer">Add</button>
        <button data-act="closeAddBook" style="flex:1;background:${t.surface2};border:none;color:${t.textMuted};font-size:12px;padding:9px;border-radius:10px;cursor:pointer">Cancel</button>
      </div>
    </div>`;
  } else {
    inner += `<button data-act="openAddBook" style="width:100%;display:flex;align-items:center;justify-content:center;gap:6px;padding:12px;border-radius:14px;background:rgba(242,169,59,0.12);border:1px dashed rgba(242,169,59,0.5);color:#F2A93B;font-size:13px;font-weight:600;cursor:pointer;margin-top:6px">${icon('plus',{size:14,color:'#F2A93B'})}Add book</button>`;
  }

  return modalShell('Reading List', 'closeMoreScreen', inner, '100px', JUST_OPENED.modalScreen);
}

function renderReviewModal(){
  const t = T();
  const today = new Date();
  const isWeekly = S.reviewMode==='weekly';
  const monday = mondayOf(today);
  const weekDaysArr = []; for(let i=0;i<7;i++) weekDaysArr.push(dateKey(addDays(monday,i)));
  const monthDayKeys = []; const daysInMonth = today.getDate();
  for(let i=0;i<daysInMonth;i++) monthDayKeys.push(dateKey(new Date(today.getFullYear(),today.getMonth(),i+1)));

  const periodDays = isWeekly ? weekDaysArr.filter(dk=>dk<=dateKey(today)) : monthDayKeys.filter(dk=>dk<=dateKey(today));
  let sum=0,n=0,liCount=0;
  periodDays.forEach(dk=>{ const c=S.checkins[dk]; if(c){ sum+=scoreOf(c); n++; if(c.linkedin) liCount++; } });
  const avg = n?Math.round(sum/n):0;

  const missedItems = [];
  periodDays.forEach(dk=>{
    const c = S.checkins[dk];
    S.habitDefs.filter(h=>h.type==='bool').forEach(h=>{ if(!c || !c[h.field]){ missedItems.push({label:h.label+' — '+dk, dk, field:h.field}); } });
  });

  const history = Object.keys(isWeekly?S.weeklyReviews:S.monthlyReviews).sort((a,b)=>a<b?1:-1);
  const historyHtml = history.map(key=>{
    const rh = (isWeekly?S.weeklyReviews:S.monthlyReviews)[key];
    const summary = [rh.reflection.skip, rh.reflection.easier, rh.reflection.adjustment].filter(Boolean).join(' · ');
    return `<div style="background:${t.surface};border-radius:14px;padding:12px 14px;border:1px solid ${t.border};box-shadow:${t.shadow}">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:12px;font-weight:600;color:${t.text}">${key}</span><span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#F2A93B">${rh.avgScore}%</span></div>
      <div style="font-size:11px;color:${t.textMuted};line-height:1.5">${escapeHtml(summary)}</div>
    </div>`;
  }).join('') || `<div style="font-size:12px;color:${t.textMuted}">No history yet.</div>`;

  const inner = `
    <div style="display:flex;gap:8px;margin-bottom:16px">
      <button data-act="setReviewWeekly" style="flex:1;padding:8px;border-radius:10px;background:${isWeekly?'#F2A93B22':t.surface};border:1px solid ${t.border};box-shadow:${t.shadow};color:${isWeekly?'#F2A93B':t.textMuted};font-size:12px;font-weight:600;cursor:pointer">Weekly</button>
      <button data-act="setReviewMonthly" style="flex:1;padding:8px;border-radius:10px;background:${!isWeekly?'#F2A93B22':t.surface};border:1px solid ${t.border};box-shadow:${t.shadow};color:${!isWeekly?'#F2A93B':t.textMuted};font-size:12px;font-weight:600;cursor:pointer">Monthly</button>
    </div>
    <div style="background:${t.surface2};border-radius:16px;padding:16px;margin-bottom:16px;border:1px solid ${t.border};box-shadow:${t.shadow}">
      <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">${isWeekly?'This week':'This month'}</div>
      <div style="display:flex;gap:16px">
        <div><div style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:${t.text}">${avg}%</div><div style="font-size:10px;color:${t.textMuted}">avg score</div></div>
        <div><div style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:${t.text}">${liCount}/2</div><div style="font-size:10px;color:${t.textMuted}">LinkedIn posts</div></div>
      </div>
    </div>
    ${missedItems.length ? `
    <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Missed this period</div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:18px">
      ${missedItems.slice(0,12).map(mi=>`
        <div data-act="completeMissed" data-arg="${mi.dk}::${mi.field}" style="display:flex;align-items:center;gap:10px;background:${t.surface};border-radius:12px;padding:9px 12px;border:1px solid ${t.border};box-shadow:${t.shadow};cursor:pointer">
          <div style="width:18px;height:18px;border-radius:50%;border:2px solid #FF6B5E;flex-shrink:0"></div>
          <div style="flex:1;font-size:12.5px;color:${t.text}">${escapeHtml(mi.label)}</div>
          <span style="font-size:10.5px;color:#F2A93B">Tap to complete</span>
        </div>`).join('')}
    </div>` : ''}
    <div style="font-size:12px;font-weight:600;color:${t.text};margin-bottom:8px">What did I skip most, and why?</div>
    <textarea data-act-change="setReflSkip" style="width:100%;box-sizing:border-box;background:${t.surface};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:10px;color:${t.text};font-size:13px;padding:10px;min-height:56px;margin-bottom:12px;font-family:'Inter',sans-serif">${escapeHtml(S.reflectionDraft.skip)}</textarea>
    <div style="font-size:12px;font-weight:600;color:${t.text};margin-bottom:8px">What felt easier this period?</div>
    <textarea data-act-change="setReflEasier" style="width:100%;box-sizing:border-box;background:${t.surface};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:10px;color:${t.text};font-size:13px;padding:10px;min-height:56px;margin-bottom:12px;font-family:'Inter',sans-serif">${escapeHtml(S.reflectionDraft.easier)}</textarea>
    <div style="font-size:12px;font-weight:600;color:${t.text};margin-bottom:8px">One adjustment for next period</div>
    <textarea data-act-change="setReflAdjustment" style="width:100%;box-sizing:border-box;background:${t.surface};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:10px;color:${t.text};font-size:13px;padding:10px;min-height:56px;margin-bottom:14px;font-family:'Inter',sans-serif">${escapeHtml(S.reflectionDraft.adjustment)}</textarea>
    <button data-act="saveReflection" style="width:100%;padding:12px;border-radius:14px;background:#F2A93B;border:none;color:#0F1B2B;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:22px">Save review</button>
    <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">History</div>
    <div style="display:flex;flex-direction:column;gap:10px">${historyHtml}</div>`;

  return modalShell('Review', 'closeMoreScreen', inner, null, JUST_OPENED.modalScreen);
}

function renderManageHabitsModal(){
  const t = T();
  const rows = S.habitDefs.map((h,i)=>`
    <div style="background:${t.surface};border-radius:14px;padding:12px 14px;border:1px solid ${t.border};box-shadow:${t.shadow};margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:${h.type==='number'?'8px':'0'}">
        <div style="width:8px;height:8px;border-radius:50%;background:${h.color};flex-shrink:0"></div>
        <input data-act-change="renameHabit" data-arg-prefix="${h.id}::" value="${escapeHtml(h.label)}" style="flex:1;background:none;border:none;color:${t.text};font-size:13.5px;font-weight:600;padding:4px 0">
        <span style="font-size:10px;color:${t.textMuted};font-family:'JetBrains Mono',monospace;text-transform:uppercase">${h.type==='number'?'number':'yes/no'}</span>
        <button data-act="moveHabit" data-arg="${h.id}::-1" ${i===0?'disabled':''} style="background:none;border:none;color:${i===0?t.border:t.textMuted};display:flex;align-items:center;cursor:pointer;transform:rotate(-90deg)">${icon('chevronRight',{size:13,color:i===0?t.border:t.textMuted})}</button>
        <button data-act="moveHabit" data-arg="${h.id}::1" ${i===S.habitDefs.length-1?'disabled':''} style="background:none;border:none;color:${i===S.habitDefs.length-1?t.border:t.textMuted};display:flex;align-items:center;cursor:pointer;transform:rotate(90deg)">${icon('chevronRight',{size:13,color:i===S.habitDefs.length-1?t.border:t.textMuted})}</button>
        <button data-act="askRemoveHabit" data-arg="${h.id}::${encodeURIComponent(h.label)}" style="background:none;border:none;color:#FF6B5E;display:flex;align-items:center;cursor:pointer">${icon('x',{size:15,color:'#FF6B5E'})}</button>
      </div>
      ${h.type==='number' ? `
      <div style="display:flex;align-items:center;gap:8px;padding-left:16px">
        <span style="font-size:11px;color:${t.textMuted}">Daily target</span>
        <input type="number" step="0.5" data-act-change="setHabitTargetValue" data-arg-prefix="${h.id}::" value="${h.target}" style="width:60px;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:6px;color:${t.text};font-family:'JetBrains Mono',monospace;font-size:12px;padding:4px 6px">
      </div>` : ''}
    </div>`).join('');

  const nd = S.newHabitDraft;
  const addForm = S.newHabitOpen ? `
    <div style="background:${t.surface};border-radius:14px;padding:14px;border:1px solid ${t.border};box-shadow:${t.shadow};margin-top:6px">
      <input data-act-change="setNewHabitLabel" value="${escapeHtml(nd.label)}" placeholder="Habit name" style="width:100%;box-sizing:border-box;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:8px;color:${t.text};font-size:13px;padding:9px 10px;margin-bottom:10px">
      <div style="display:flex;gap:8px;margin-bottom:10px">
        <button data-act="setNewHabitType" data-arg="bool" style="flex:1;padding:8px;border-radius:10px;background:${nd.type==='bool'?'#F2A93B22':t.surface2};border:none;color:${nd.type==='bool'?'#F2A93B':t.textMuted};font-size:12px;font-weight:600;cursor:pointer">Yes / No</button>
        <button data-act="setNewHabitType" data-arg="number" style="flex:1;padding:8px;border-radius:10px;background:${nd.type==='number'?'#F2A93B22':t.surface2};border:none;color:${nd.type==='number'?'#F2A93B':t.textMuted};font-size:12px;font-weight:600;cursor:pointer">Daily number</button>
      </div>
      ${nd.type==='number' ? `<input type="number" step="0.5" data-act-change="setNewHabitTarget" value="${nd.target}" placeholder="Daily target" style="width:100%;box-sizing:border-box;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:8px;color:${t.text};font-family:'JetBrains Mono',monospace;font-size:13px;padding:9px 10px;margin-bottom:10px">` : ''}
      <div style="display:flex;gap:8px">
        <button data-act="submitNewHabit" style="flex:1;background:#F2A93B;border:none;color:#0F1B2B;font-size:12px;font-weight:700;padding:9px;border-radius:10px;cursor:pointer">Add habit</button>
        <button data-act="closeNewHabit" style="flex:1;background:${t.surface2};border:none;color:${t.textMuted};font-size:12px;padding:9px;border-radius:10px;cursor:pointer">Cancel</button>
      </div>
    </div>` : `<button data-act="openNewHabit" style="width:100%;display:flex;align-items:center;justify-content:center;gap:6px;padding:12px;border-radius:14px;background:rgba(242,169,59,0.12);border:1px dashed rgba(242,169,59,0.5);color:#F2A93B;font-size:13px;font-weight:600;cursor:pointer;margin-top:6px">${icon('plus',{size:14,color:'#F2A93B'})}Add habit</button>`;

  const inner = `
    <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">Core habits</div>
    <div style="font-size:10.5px;color:${t.textMuted};margin-bottom:12px;line-height:1.5">These are the habits tracked every day on Today and Tracker. Tap a name to rename it, use the arrows to reorder, or remove one — nothing about past check-ins is lost.</div>
    ${rows}
    ${addForm}
    <div style="font-size:10.5px;color:${t.textMuted};margin-top:16px;line-height:1.5">LinkedIn Post stays separate since it's tracked as a weekly goal (2x/week) rather than a daily habit.</div>`;

  return modalShell('Manage Habits', 'closeMoreScreen', inner, null, JUST_OPENED.modalScreen);
}

function renderSettingsModal(){
  const t = T();
  const currencies = [{v:'USD',l:'USD'},{v:'XOF',l:'XOF'},{v:'NGN',l:'NGN'}];
  const currencyHtml = currencies.map(c=>`<button data-act="setCurrency" data-arg="${c.v}" style="flex:1;padding:10px;border-radius:12px;background:${S.currency===c.v?'#F2A93B22':t.surface};border:1px solid ${t.border};box-shadow:${t.shadow};color:${S.currency===c.v?'#F2A93B':t.textMuted};font-size:12px;font-weight:600;cursor:pointer">${c.l}</button>`).join('');
  const notifRows = [{k:'habit',l:'Habit blocks'},{k:'work',l:'Work blocks'},{k:'cook',l:'Cook & meal blocks'}];
  const notifHtml = notifRows.map(nr=>{
    const on = S.notifPrefs[nr.k];
    return `<div data-act="toggleNotif" data-arg="${nr.k}" style="display:flex;align-items:center;justify-content:space-between;background:${t.surface};border-radius:12px;padding:12px 14px;border:1px solid ${t.border};box-shadow:${t.shadow};cursor:pointer">
      <div style="display:flex;align-items:center;gap:10px">${icon('bell',{size:15,color:on?'#F2A93B':t.textMuted})}<div><div style="font-size:13px;color:${t.text};font-weight:500">${nr.l}</div><div style="font-size:11px;color:${t.textMuted}">Alerts 5 min before</div></div></div>
      <div style="width:40px;height:22px;border-radius:12px;background:${on?'#F2A93B':t.surface2};position:relative;flex-shrink:0">
        <div style="position:absolute;top:2px;left:${on?21:2}px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left 0.15s ease"></div>
      </div>
    </div>`;
  }).join('');

  const inner = `
    <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">Appearance</div>
    <div style="display:flex;gap:8px;margin-bottom:22px">
      <button data-act="setThemeLight" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;border-radius:12px;background:${S.theme==='light'?'#F2A93B22':t.surface};border:1px solid ${t.border};box-shadow:${t.shadow};color:${S.theme==='light'?'#F2A93B':t.textMuted};font-size:12px;font-weight:600;cursor:pointer">${icon('sun',{size:14,color:S.theme==='light'?'#F2A93B':t.textMuted})}Light</button>
      <button data-act="setThemeDark" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;border-radius:12px;background:${S.theme==='dark'?'#F2A93B22':t.surface};border:1px solid ${t.border};box-shadow:${t.shadow};color:${S.theme==='dark'?'#F2A93B':t.textMuted};font-size:12px;font-weight:600;cursor:pointer">${icon('moon',{size:14,color:S.theme==='dark'?'#F2A93B':t.textMuted})}Dark</button>
    </div>
    <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">Currency</div>
    <div style="display:flex;gap:8px;margin-bottom:22px">${currencyHtml}</div>
    <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">Alarm notifications</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px">${notifHtml}</div>
    <button data-act="${S.notifEnabled?'disableNotifications':'enableNotifications'}" style="width:100%;padding:10px;border-radius:12px;background:${S.notifEnabled?'#3DDC8422':t.surface};border:1px solid ${S.notifEnabled?'#3DDC84':t.border};color:${S.notifEnabled?'#3DDC84':t.text};font-size:12px;font-weight:600;cursor:pointer;margin-bottom:22px">${S.notifEnabled?'Reminders on — tap to turn off':'Enable reminders'}</button>

    <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">Data</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:8px">
      <button data-act="exportData" style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;border-radius:14px;background:${t.surface};border:1px solid ${t.border};box-shadow:${t.shadow};color:${t.text};font-size:13px;font-weight:600;cursor:pointer">${icon('download',{size:15,color:t.text})}Export data (.json)</button>
      <button data-act="triggerImport" style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;border-radius:14px;background:${t.surface};border:1px solid ${t.border};box-shadow:${t.shadow};color:${t.text};font-size:13px;font-weight:600;cursor:pointer">${icon('upload',{size:15,color:t.text})}Import data</button>
      <input type="file" id="import-file-input" accept="application/json" style="display:none">
      <button data-act="askResetData" style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;border-radius:14px;background:rgba(255,107,94,0.12);border:1px solid rgba(255,107,94,0.4);color:#FF6B5E;font-size:13px;font-weight:600;cursor:pointer">${icon('trash',{size:15,color:'#FF6B5E'})}Reset all data</button>
    </div>
    <div style="font-size:10.5px;color:${t.textMuted};margin-bottom:22px;line-height:1.5">Export keeps a backup or moves data to another device. Reset clears everything so you can start fresh.</div>
    <div style="font-size:10.5px;color:${t.textMuted};line-height:1.6">Level Up · personal build<br/>All data stored locally on this device.</div>`;

  return modalShell('Settings', 'closeMoreScreen', inner, null, JUST_OPENED.modalScreen);
}

function renderFinanceSettingsModal(){
  const t = T();
  const cur = S.financeCurrencyView;
  const mi = monthInfo(S.financeMonthOffset);
  const budgets = budgetsForMonth(cur, mi.key);
  const prevMi = monthInfo(S.financeMonthOffset-1);
  const prevBudgets = budgetsForMonth(cur, prevMi.key);
  const hasPrev = Object.keys(prevBudgets).length>0;
  const hasCurrent = Object.keys(budgets).length>0;

  const budgetRows = S.financeCategories.map(cat=>`
    <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0">
      <span style="font-size:12px;color:${t.text}">${escapeHtml(cat)}</span>
      <input type="number" data-act-change="setBudget" data-arg-prefix="${cat}::" value="${budgets[cat]!=null?budgets[cat]:''}" placeholder="—" style="width:90px;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:8px;color:${t.text};font-family:'JetBrains Mono',monospace;font-size:12px;padding:5px 8px;text-align:right">
    </div>`).join('');
  const categoryRows = S.financeCategories.map(cat=>`
    <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0">
      <span style="font-size:12px;color:${t.text}">${escapeHtml(cat)}</span>
      <button data-act="removeCategory" data-arg="${encodeURIComponent(cat)}" style="background:none;border:none;color:#FF6B5E;display:flex;align-items:center;cursor:pointer">${icon('x',{size:13,color:'#FF6B5E'})}</button>
    </div>`).join('');

  const inner = `
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
      <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px">Budgets — ${cur} · ${mi.label}</div>
    </div>
    <div style="font-size:10.5px;color:${t.textMuted};margin-bottom:10px">Budgets are set per month — this month starts empty unless you copy last month's forward.</div>
    ${!hasCurrent && hasPrev ? `<button data-act="copyBudgetsFromLastMonth" style="width:100%;padding:9px;border-radius:10px;background:rgba(76,141,255,0.12);border:1px solid rgba(76,141,255,0.35);color:#4C8DFF;font-size:12px;font-weight:600;cursor:pointer;margin-bottom:12px">Copy budgets from ${prevMi.label}</button>` : ''}
    <div style="background:${t.surface};border-radius:14px;padding:14px;margin-bottom:22px;border:1px solid ${t.border};box-shadow:${t.shadow}">${budgetRows}</div>
    <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">Categories</div>
    <div style="background:${t.surface};border-radius:14px;padding:14px;border:1px solid ${t.border};box-shadow:${t.shadow}">
      ${categoryRows}
      <div style="display:flex;gap:8px;margin-top:10px">
        <input data-act-change="setNewCategoryName" value="${escapeHtml(S.newCategoryName)}" placeholder="New category" style="flex:1;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:8px;color:${t.text};font-size:12px;padding:8px 10px">
        <button data-act="addCategory" style="background:#F2A93B;border:none;color:#0F1B2B;font-size:12px;font-weight:700;padding:8px 14px;border-radius:8px;cursor:pointer">Add</button>
      </div>
    </div>`;

  return modalShell('Budgets & Categories', 'closeFinanceSettings', inner, null, JUST_OPENED.financeSettings);
}

function renderLedgerModal(){
  const t = T();
  const cur = S.financeCurrencyView;
  const fmt = (n)=>fmtMoneyFor(n, cur);
  const allInCur = S.financeEntries.filter(e=>(e.currency||'XOF')===cur);
  const monthKeys = Array.from(new Set(allInCur.map(e=>monthKeyOf(e.date)))).sort((a,b)=>a<b?1:-1);
  const monthsHtml = monthKeys.map(mk=>{
    const ents = allInCur.filter(e=>monthKeyOf(e.date)===mk);
    const total = ents.filter(e=>e.type==='expense').reduce((s,e)=>s+e.amount,0);
    const buckets = {};
    ents.forEach(e=>{ const day=Number(e.date.slice(8,10)); const wi=Math.min(4,Math.floor((day-1)/7)); buckets[wi]=buckets[wi]||[]; buckets[wi].push(e); });
    const weeksHtml = Object.keys(buckets).sort((a,b)=>a-b).map(wi=>{
      const arr = buckets[wi].slice().sort((a,b)=>a.date<b.date?1:-1);
      const wTotal = arr.filter(e=>e.type==='expense').reduce((s,e)=>s+e.amount,0);
      const entriesHtml = arr.map(e=>{
        const color = e.type==='income'?'#3DDC84':e.type==='savings'?'#F2A93B':(FIN_COLORS[e.category]||'#7C8AA0');
        const amountColor = e.type==='expense'?t.text:'#3DDC84';
        return `<div style="display:flex;align-items:center;gap:10px;background:${t.surface};border-radius:10px;padding:8px 12px;border:1px solid ${t.border};box-shadow:${t.shadow}">
          <div style="width:7px;height:7px;border-radius:50%;background:${color};flex-shrink:0"></div>
          <div style="flex:1;min-width:0;font-size:12px;color:${t.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(e.desc)}</div>
          <div style="font-size:10px;color:${t.textMuted}">${e.date}</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:${amountColor}">${(e.type==='expense'?'-':'+')+fmt(e.amount)}</div>
        </div>`;
      }).join('');
      return `<div style="margin-bottom:10px">
        <div style="font-size:10.5px;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.4px;margin-bottom:6px">Week ${Number(wi)+1} · ${fmt(wTotal)}</div>
        <div style="display:flex;flex-direction:column;gap:6px">${entriesHtml}</div>
      </div>`;
    }).join('');
    const d = new Date(mk+'-01T00:00:00');
    return `<div style="margin-bottom:22px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">
        <span style="font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700;color:${t.text}">${d.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</span>
        <span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#FF6B5E">${fmt(total)}</span>
      </div>${weeksHtml}
    </div>`;
  }).join('') || `<div style="font-size:12px;color:${t.textMuted}">No transactions yet.</div>`;

  return modalShell('All transactions', 'closeLedger', monthsHtml, null, JUST_OPENED.ledger);
}

function renderInvestmentDetail(){
  const t = T();
  const dh = S.investments.find(h=>h.id===S.investmentDetailId);
  if(!dh) return '';
  const g = dh.currentValue-dh.invested; const gp = dh.invested>0?Math.round(g/dh.invested*100):0;
  const gainColor = g>=0?'#3DDC84':'#FF6B5E';
  const hist = (dh.valueHistory||[]).slice().sort((a,b)=>a.date<b.date?-1:1);
  const lastDate = hist.length?hist[hist.length-1].date:dh.startDate;
  const daysSince = daysBetween(lastDate, dateKey(new Date())) || 0;
  const stale = daysSince>=30;

  const period = S.investmentTrendPeriod;
  const count = period==='week'?8:period==='month'?12:5;
  const today = new Date();
  const pts=[];
  for(let i=count-1;i>=0;i--){
    let bucketEnd;
    if(period==='week') bucketEnd = addDays(today,-7*i);
    else if(period==='month') bucketEnd = addMonths(today,-i);
    else bucketEnd = new Date(today.getFullYear()-i,11,31);
    const bucketKey = dateKey(bucketEnd);
    let val = dh.invested;
    hist.forEach(hp=>{ if(hp.date<=bucketKey) val=hp.value; });
    pts.push(val);
  }
  const maxV = Math.max(1,...pts), minV = Math.min(...pts);
  const range = Math.max(1, maxV-minV);
  const trendPoints = pts.map((v,i)=>{ const x=(i/(pts.length-1))*300; const y=75-((v-minV)/range*68); return x.toFixed(1)+','+y.toFixed(1); }).join(' ');

  const periods = [{k:'week',l:'8w'},{k:'month',l:'12m'},{k:'year',l:'5y'}];
  const periodHtml = periods.map(p=>`<button data-act="setTrendPeriod" data-arg="${p.k}" style="padding:5px 10px;border-radius:8px;background:${S.investmentTrendPeriod===p.k?'#F2A93B22':t.surface};border:1px solid ${t.border};box-shadow:${t.shadow};color:${S.investmentTrendPeriod===p.k?'#F2A93B':t.textMuted};font-size:10.5px;font-weight:600;cursor:pointer">${p.l}</button>`).join('');

  const inner = `
    ${stale ? `<div style="background:rgba(242,169,59,0.12);border:1px solid rgba(242,169,59,0.35);border-radius:12px;padding:10px 12px;font-size:11.5px;color:#F2A93B;margin-bottom:14px">Value last logged ${daysSince} days ago — worth an update?</div>` : ''}
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px">
      <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border};box-shadow:${t.shadow}"><div style="font-size:9.5px;color:${t.textMuted};text-transform:uppercase">Invested</div><div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:${t.text};margin-top:4px">${fmtMoneyFor(dh.invested, dh.currency||'USD')}</div></div>
      <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border};box-shadow:${t.shadow}"><div style="font-size:9.5px;color:${t.textMuted};text-transform:uppercase">Current</div><div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:${t.text};margin-top:4px">${fmtMoneyFor(dh.currentValue, dh.currency||'USD')}</div></div>
      <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border};box-shadow:${t.shadow}"><div style="font-size:9.5px;color:${t.textMuted};text-transform:uppercase">Gain</div><div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:${gainColor};margin-top:4px">${(g>=0?'+':'')+fmtMoneyFor(g, dh.currency||'USD')} (${(gp>=0?'+':'')+gp}%)</div></div>
    </div>
    <div style="background:${t.surface};border-radius:14px;padding:14px;margin-bottom:16px;border:1px solid ${t.border};box-shadow:${t.shadow};display:flex;flex-direction:column;gap:8px">
      <div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:${t.textMuted}">Start date</span><span style="font-family:'JetBrains Mono',monospace;color:${t.text}">${dh.startDate||'—'}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:${t.textMuted}">Expected return</span><span style="font-family:'JetBrains Mono',monospace;color:${t.text}">${dh.expectedReturnPct!=null?dh.expectedReturnPct+'%/yr':'—'}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:${t.textMuted}">Maturity</span><span style="font-family:'JetBrains Mono',monospace;color:${t.text}">${dh.maturityDate||'None'}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:${t.textMuted}">Platform</span><span style="color:${t.text}">${escapeHtml(dh.platform||'—')}</span></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px">Trend</div>
      <div style="display:flex;gap:6px">${periodHtml}</div>
    </div>
    <div style="background:${t.surface};border-radius:14px;padding:12px;margin-bottom:16px;border:1px solid ${t.border};box-shadow:${t.shadow}">
      <svg viewBox="0 0 300 80" style="width:100%;height:80px"><polyline points="${trendPoints}" fill="none" stroke="#4C8DFF" stroke-width="2.5"></polyline></svg>
    </div>
    <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Log a new value</div>
    <div style="display:flex;gap:8px;margin-bottom:20px">
      <input type="number" data-act-change="setQuickUpdateValue" value="${S.quickUpdateValue}" placeholder="Current value" style="flex:1;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:10px;color:${t.text};font-family:'JetBrains Mono',monospace;font-size:14px;padding:9px 10px">
      <button data-act="logHoldingUpdate" style="background:#F2A93B;border:none;color:#0F1B2B;font-size:12px;font-weight:700;padding:0 16px;border-radius:10px;cursor:pointer">Log</button>
    </div>
    <div style="display:flex;gap:8px">
      <button data-act="editDetailHolding" style="flex:1;background:${t.surface};border:1px solid ${t.border};box-shadow:${t.shadow};color:${t.text};font-size:13px;font-weight:600;padding:11px;border-radius:12px;cursor:pointer">Edit details</button>
      <button data-act="askDeleteHolding" style="flex:1;background:rgba(255,107,94,0.12);border:1px solid rgba(255,107,94,0.4);color:#FF6B5E;font-size:13px;padding:11px;border-radius:12px;cursor:pointer">Delete</button>
    </div>`;

  return modalShell(escapeHtml(dh.name), 'closeInvestmentDetail', inner, null, JUST_OPENED.investmentDetail);
}

function renderBlockEditorSheet(){
  if(!S.editingBlock) return '';
  const t = T();
  const eb = S.editingBlock;
  const anim = JUST_OPENED.blockEditor ? 'animation:lu-slideup 0.22s ease;' : '';
  const catOptions = Object.keys(CAT_LABELS).map(k=>`<option value="${k}" ${eb.cat===k?'selected':''}>${CAT_LABELS[k]}</option>`).join('');
  return `
  <div data-act="closeBlockEditor" style="position:absolute;inset:0;background:rgba(0,0,0,0.5);z-index:29"></div>
  <div style="position:absolute;left:0;right:0;bottom:0;background:${t.surface};border-radius:22px 22px 0 0;padding:16px 20px 26px;z-index:30;${anim}border-top:1px solid ${t.border}">
    <div style="font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;color:${t.text};margin-bottom:14px">${eb.id?'Edit block':'New block'}</div>
    <div style="display:flex;gap:8px;margin-bottom:10px">
      <input type="time" data-act-change="setBlockStart" value="${eb.start}" style="flex:1;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:10px;color:${t.text};font-family:'JetBrains Mono',monospace;font-size:13px;padding:9px 10px">
      <input type="time" data-act-change="setBlockEnd" value="${eb.end}" style="flex:1;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:10px;color:${t.text};font-family:'JetBrains Mono',monospace;font-size:13px;padding:9px 10px">
    </div>
    <input data-act-change="setBlockLabel" value="${escapeHtml(eb.label)}" placeholder="Label" style="width:100%;box-sizing:border-box;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:10px;color:${t.text};font-size:13px;padding:10px 12px;margin-bottom:10px">
    <select data-act-change="setBlockCat" style="width:100%;box-sizing:border-box;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:10px;color:${t.text};font-size:13px;padding:10px 12px;margin-bottom:16px">${catOptions}</select>
    <div style="display:flex;gap:8px">
      <button data-act="commitBlock" style="flex:1;background:#F2A93B;border:none;color:#0F1B2B;font-size:13px;font-weight:700;padding:11px;border-radius:12px;cursor:pointer">Save</button>
      ${eb.id ? `<button data-act="askDeleteBlock" style="flex:1;background:rgba(255,107,94,0.15);border:1px solid rgba(255,107,94,0.4);color:#FF6B5E;font-size:13px;padding:11px;border-radius:12px;cursor:pointer">Delete</button>` : ''}
      <button data-act="closeBlockEditor" style="flex:1;background:${t.surface2};border:none;color:${t.textMuted};font-size:13px;padding:11px;border-radius:12px;cursor:pointer">Cancel</button>
    </div>
  </div>`;
}

function renderAddBookingSheet(){
  if(!S.addBookingOpen) return '';
  const t = T();
  const d = S.bookingDraft;
  const anim = JUST_OPENED.addBooking ? 'animation:lu-slideup 0.22s ease;' : '';
  const catOptions = Object.keys(CAT_LABELS).map(k=>`<option value="${k}" ${d.cat===k?'selected':''}>${CAT_LABELS[k]}</option>`).join('');
  return `
  <div data-act="closeAddBooking" style="position:absolute;inset:0;background:rgba(0,0,0,0.5);z-index:29"></div>
  <div style="position:absolute;left:0;right:0;bottom:0;background:${t.surface};border-radius:22px 22px 0 0;padding:16px 20px 26px;z-index:30;${anim}border-top:1px solid ${t.border}">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
      ${icon('calendarPlus',{size:17,color:'#F2A93B'})}
      <div style="font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;color:${t.text}">${S.editingBookingId?'Edit booking':'Book something'}</div>
    </div>
    <input type="date" data-act-change="setBookingDate" value="${d.date}" style="width:100%;box-sizing:border-box;background:${t.surface2};border:1px solid ${t.border};border-radius:10px;color:${t.text};font-family:'JetBrains Mono',monospace;font-size:13px;padding:9px 10px;margin-bottom:10px">
    <input data-act-change="setBookingLabel" value="${escapeHtml(d.label)}" placeholder="What's happening? e.g. Dentist appointment" style="width:100%;box-sizing:border-box;background:${t.surface2};border:1px solid ${t.border};border-radius:10px;color:${t.text};font-size:13px;padding:10px 12px;margin-bottom:10px">
    <div style="display:flex;gap:8px;margin-bottom:10px">
      <input type="time" data-act-change="setBookingStart" value="${d.start}" style="flex:1;background:${t.surface2};border:1px solid ${t.border};border-radius:10px;color:${t.text};font-family:'JetBrains Mono',monospace;font-size:13px;padding:9px 10px">
      <input type="time" data-act-change="setBookingEnd" value="${d.end}" style="flex:1;background:${t.surface2};border:1px solid ${t.border};border-radius:10px;color:${t.text};font-family:'JetBrains Mono',monospace;font-size:13px;padding:9px 10px">
    </div>
    <select data-act-change="setBookingCat" style="width:100%;box-sizing:border-box;background:${t.surface2};border:1px solid ${t.border};border-radius:10px;color:${t.text};font-size:13px;padding:10px 12px;margin-bottom:16px">${catOptions}</select>
    <div style="display:flex;gap:8px">
      <button data-act="submitBooking" style="flex:1;background:#F2A93B;border:none;color:#0F1B2B;font-size:13px;font-weight:700;padding:11px;border-radius:12px;cursor:pointer">Save</button>
      ${S.editingBookingId ? `<button data-act="askDeleteBooking" style="flex:1;background:rgba(255,107,94,0.15);border:1px solid rgba(255,107,94,0.4);color:#FF6B5E;font-size:13px;padding:11px;border-radius:12px;cursor:pointer">Delete</button>` : ''}
      <button data-act="closeAddBooking" style="flex:1;background:${t.surface2};border:none;color:${t.textMuted};font-size:13px;padding:11px;border-radius:12px;cursor:pointer">Cancel</button>
    </div>
  </div>`;
}

function renderAddExpenseSheet(){
  if(!S.addExpenseOpen) return '';
  const t = T();
  const d = S.expenseDraft;
  const anim = JUST_OPENED.addExpense ? 'animation:lu-slideup 0.22s ease;' : '';
  const catOptions = S.financeCategories.map(c=>`<option value="${escapeHtml(c)}" ${d.category===c?'selected':''}>${escapeHtml(c)}</option>`).join('');
  return `
  <div data-act="closeAddExpense" style="position:absolute;inset:0;background:rgba(0,0,0,0.5);z-index:29"></div>
  <div style="position:absolute;left:0;right:0;bottom:0;background:${t.surface};border-radius:22px 22px 0 0;padding:16px 20px 26px;z-index:30;${anim}border-top:1px solid ${t.border}">
    <div style="font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;color:${t.text};margin-bottom:14px">Add entry</div>
    <div style="display:flex;gap:8px;margin-bottom:10px">
      <button data-act="setTypeExpense" style="flex:1;padding:8px;border-radius:10px;background:${d.type==='expense'?'#FF6B5E22':t.surface2};border:none;color:${d.type==='expense'?'#FF6B5E':t.textMuted};font-size:12px;font-weight:600;cursor:pointer">Expense</button>
      <button data-act="setTypeIncome" style="flex:1;padding:8px;border-radius:10px;background:${d.type==='income'?'#3DDC8422':t.surface2};border:none;color:${d.type==='income'?'#3DDC84':t.textMuted};font-size:12px;font-weight:600;cursor:pointer">Income</button>
      <button data-act="setTypeSavings" style="flex:1;padding:8px;border-radius:10px;background:${d.type==='savings'?'#F2A93B22':t.surface2};border:none;color:${d.type==='savings'?'#F2A93B':t.textMuted};font-size:12px;font-weight:600;cursor:pointer">Savings</button>
    </div>
    <input data-act-change="setExpDesc" value="${escapeHtml(d.desc)}" placeholder="What was it? e.g. Beans and rice" style="width:100%;box-sizing:border-box;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:10px;color:${t.text};font-size:13px;padding:10px 12px;margin-bottom:10px">
    <div style="display:flex;gap:8px;margin-bottom:10px">
      <input type="number" data-act-change="setExpAmount" value="${d.amount}" placeholder="Amount" style="flex:1;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:10px;color:${t.text};font-family:'JetBrains Mono',monospace;font-size:15px;padding:10px 12px">
      <select data-act-change="setExpCurrency" style="width:88px;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:10px;color:${t.text};font-family:'JetBrains Mono',monospace;font-size:13px;padding:10px 6px">
        ${CUR_LIST.map(c=>`<option value="${c}" ${d.currency===c?'selected':''}>${c}</option>`).join('')}
      </select>
    </div>
    ${d.type==='expense' ? `<select data-act-change="setExpCategory" style="width:100%;box-sizing:border-box;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:10px;color:${t.text};font-size:13px;padding:10px 12px;margin-bottom:16px">${catOptions}</select>` : ''}
    <div style="display:flex;gap:8px">
      <button data-act="submitExpense" style="flex:1;background:#F2A93B;border:none;color:#0F1B2B;font-size:13px;font-weight:700;padding:11px;border-radius:12px;cursor:pointer">Save</button>
      <button data-act="closeAddExpense" style="flex:1;background:${t.surface2};border:none;color:${t.textMuted};font-size:13px;padding:11px;border-radius:12px;cursor:pointer">Cancel</button>
    </div>
  </div>`;
}

function renderAddHoldingSheet(){
  if(!S.addHoldingOpen) return '';
  const t = T();
  const d = S.holdingDraft;
  const anim = JUST_OPENED.addHolding ? 'animation:lu-slideup 0.22s ease;' : '';
  return `
  <div data-act="closeAddHolding" style="position:absolute;inset:0;background:rgba(0,0,0,0.5);z-index:29"></div>
  <div data-scroll-id="holdingsheet" style="position:absolute;left:0;right:0;bottom:0;background:${t.surface};border-radius:22px 22px 0 0;padding:16px 20px 26px;z-index:30;${anim}border-top:1px solid ${t.border};max-height:80%;overflow-y:auto">
    <div style="font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;color:${t.text};margin-bottom:14px">${S.editingHoldingId?'Edit holding':'Add holding'}</div>
    <input data-act-change="setHoldingName" value="${escapeHtml(d.name)}" placeholder="Name (e.g. Index Fund)" style="width:100%;box-sizing:border-box;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:10px;color:${t.text};font-size:13px;padding:10px 12px;margin-bottom:10px">
    <div style="display:flex;gap:8px;margin-bottom:10px">
      <input type="number" data-act-change="setHoldingInvested" value="${d.invested}" placeholder="Invested" style="flex:1;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:10px;color:${t.text};font-family:'JetBrains Mono',monospace;font-size:14px;padding:10px 12px">
      <input type="number" data-act-change="setHoldingCurrent" value="${d.currentValue}" placeholder="Current value" style="flex:1;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:10px;color:${t.text};font-family:'JetBrains Mono',monospace;font-size:14px;padding:10px 12px">
      <select data-act-change="setHoldingCurrency" style="width:78px;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:10px;color:${t.text};font-family:'JetBrains Mono',monospace;font-size:12.5px;padding:10px 4px">
        ${CUR_LIST.map(c=>`<option value="${c}" ${d.currency===c?'selected':''}>${c}</option>`).join('')}
      </select>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:10px">
      <input type="date" data-act-change="setHoldingStartDate" value="${d.startDate}" style="flex:1;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:10px;color:${t.text};font-family:'JetBrains Mono',monospace;font-size:12.5px;padding:9px 10px">
      <input type="number" data-act-change="setHoldingExpectedReturn" value="${d.expectedReturnPct}" placeholder="Expected % return" style="flex:1;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:10px;color:${t.text};font-family:'JetBrains Mono',monospace;font-size:12.5px;padding:9px 10px">
    </div>
    <input type="date" data-act-change="setHoldingMaturity" value="${d.maturityDate}" style="width:100%;box-sizing:border-box;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:10px;color:${t.text};font-family:'JetBrains Mono',monospace;font-size:12.5px;padding:9px 10px;margin-bottom:10px">
    <input data-act-change="setHoldingPlatform" value="${escapeHtml(d.platform)}" placeholder="Platform (e.g. broker, bank)" style="width:100%;box-sizing:border-box;background:${t.surface2};border:1px solid ${t.border};box-shadow:${t.shadow};border-radius:10px;color:${t.text};font-size:13px;padding:10px 12px;margin-bottom:16px">
    <div style="display:flex;gap:8px">
      <button data-act="submitHolding" style="flex:1;background:#F2A93B;border:none;color:#0F1B2B;font-size:13px;font-weight:700;padding:11px;border-radius:12px;cursor:pointer">Save</button>
      <button data-act="closeAddHolding" style="flex:1;background:${t.surface2};border:none;color:${t.textMuted};font-size:13px;padding:11px;border-radius:12px;cursor:pointer">Cancel</button>
    </div>
  </div>`;
}

function renderAlarmOverlay(){
  if(!S.alarmActive) return '';
  const b = S.alarmActive;
  return `
  <div style="position:absolute;inset:0;background:#1a0f0d;z-index:40;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 30px;box-sizing:border-box">
    <div style="position:relative;width:140px;height:140px;display:flex;align-items:center;justify-content:center;margin-bottom:32px">
      <div style="position:absolute;inset:0;border-radius:50%;border:2px solid #FF6B5E;animation:lu-ring 1.6s ease-out infinite"></div>
      <div style="position:absolute;inset:0;border-radius:50%;border:2px solid #FF6B5E;animation:lu-ring 1.6s ease-out infinite;animation-delay:0.5s"></div>
      <div style="width:88px;height:88px;border-radius:50%;background:#FF6B5E;display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px rgba(255,107,94,0.6)">
        <div style="width:34px;height:34px;border-radius:50%;border:4px solid #1a0f0d;border-top-color:transparent"></div>
      </div>
    </div>
    <div style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Time for</div>
    <div style="font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:700;color:#fff;text-align:center;margin-bottom:6px">${escapeHtml(b.label)}</div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:14px;color:#FF6B5E;margin-bottom:44px">${b.start}</div>
    <button data-act="dismissAlarm" style="width:100%;max-width:280px;padding:16px;border-radius:18px;background:#fff;border:none;color:#1a0f0d;font-size:15px;font-weight:700;cursor:pointer">Dismiss</button>
  </div>`;
}

function renderConfirmModal(){
  if(!S.confirm) return '';
  const t = T();
  return `
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.55);z-index:50;display:flex;align-items:center;justify-content:center;padding:30px">
    <div style="background:${t.surface};border-radius:18px;padding:20px;width:100%;border:1px solid ${t.border};box-shadow:${t.shadow}">
      <div style="font-size:14px;font-weight:600;color:${t.text};margin-bottom:16px;line-height:1.4">${escapeHtml(S.confirm.message)}</div>
      <div style="display:flex;gap:8px">
        <button data-act="confirmYes" style="flex:1;background:rgba(255,107,94,0.15);border:1px solid rgba(255,107,94,0.4);color:#FF6B5E;font-size:13px;font-weight:700;padding:11px;border-radius:12px;cursor:pointer">Confirm</button>
        <button data-act="confirmNo" style="flex:1;background:${t.surface2};border:none;color:${t.text};font-size:13px;padding:11px;border-radius:12px;cursor:pointer">Cancel</button>
      </div>
    </div>
  </div>`;
}

function renderBottomNav(){
  const t = T();
  const tabs = [
    {k:'today', l:'Today', i:'home'}, {k:'schedule', l:'Schedule', i:'calendar'}, {k:'tracker', l:'Tracker', i:'chart'}, {k:'finance', l:'Finance', i:'wallet'}
  ];
  const tabsHtml = tabs.map(tb=>{
    const active = S.tab===tb.k;
    return `<button data-act="selectTab" data-arg="${tb.k}" style="flex:1;background:none;border:none;padding:7px 2px 5px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer">
      <div style="width:38px;height:24px;border-radius:12px;background:${active?'rgba(242,169,59,0.15)':'transparent'};display:flex;align-items:center;justify-content:center">
        ${icon(tb.i,{size:18,color:active?'#F2A93B':t.textMuted})}
      </div>
      <span style="font-size:9.5px;font-weight:600;color:${active?'#F2A93B':t.textMuted}">${tb.l}</span>
    </button>`;
  }).join('');
  const moreActive = S.moreOpen || S.moreScreen;
  return `
  <div style="display:flex;align-items:stretch;background:${t.navBg};border-top:1px solid ${t.border};padding:6px 4px 2px">
    ${tabsHtml}
    <button data-act="openMoreSheet" style="flex:1;background:none;border:none;padding:7px 2px 5px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer">
      <div style="width:38px;height:24px;border-radius:12px;background:${moreActive?'rgba(242,169,59,0.15)':'transparent'};display:flex;align-items:center;justify-content:center">
        ${icon('grid',{size:18,color:moreActive?'#F2A93B':t.textMuted})}
      </div>
      <span style="font-size:9.5px;font-weight:600;color:${moreActive?'#F2A93B':t.textMuted}">More</span>
    </button>
  </div>`;
}
