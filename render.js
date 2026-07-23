// ===================== RENDER: core screens =====================

function renderToday(){
  const t = T();
  const today = new Date();
  const todayKey = dateKey(today);
  const dt = dayType(today);
  const checkin = getCheckin(todayKey);
  const score = scoreOf(checkin);
  const streak = streakCount();
  const nowMin = today.getHours()*60+today.getMinutes();
  const todayBookings = (S.bookings[todayKey] || []).map(b=>({...b, isBooking:true}));
  const blocksRaw = [...(S.scheduleTemplates[dt] || []), ...todayBookings].sort((a,b)=>timeToMin(a.start)-timeToMin(b.start));
  const nowPct = (nowMin/1440*100).toFixed(2);

  const timelineSegs = blocksRaw.map(b=>{
    const left = (timeToMin(b.start)/1440*100).toFixed(2);
    const width = ((timeToMin(b.end)-timeToMin(b.start))/1440*100).toFixed(2);
    return `<div style="position:absolute;top:0;bottom:0;left:${left}%;width:${width}%;background:${CAT_COLORS[b.cat]};opacity:0.85;border-right:1px solid ${t.surface}"></div>`;
  }).join('');

  const nextBlock = blocksRaw.find(b=>timeToMin(b.start) > nowMin) || null;
  const nowLabel = pad2(today.getHours())+':'+pad2(today.getMinutes());

  const habitRowsHtml = S.habitDefs.map(h=>{
    if(h.type==='number'){
      const val = checkin[h.field]||0;
      const met = val>=h.target;
      return `
      <div style="display:flex;align-items:center;gap:12px;background:${t.surface};border-radius:14px;padding:12px 14px;border:1px solid ${t.border};box-shadow:${t.shadow}">
        <div style="width:26px;height:26px;border-radius:50%;background:${met?'#F2A93B':'transparent'};border:2px solid ${met?'#F2A93B':t.textMuted};flex-shrink:0"></div>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:600;color:${t.text}">${escapeHtml(h.label)}</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${t.textMuted}">target ${h.target}+</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <button data-act="numHabitDec" data-arg="${h.field}" style="width:26px;height:26px;border-radius:8px;background:${t.surface2};color:${t.text};border:none;font-size:16px;cursor:pointer">–</button>
          <div style="font-family:'JetBrains Mono',monospace;font-size:14px;color:#F2A93B;min-width:32px;text-align:center">${val.toFixed(1)}</div>
          <button data-act="numHabitInc" data-arg="${h.field}" style="width:26px;height:26px;border-radius:8px;background:${t.surface2};color:${t.text};border:none;font-size:16px;cursor:pointer">+</button>
        </div>
      </div>`;
    }
    const on = checkin[h.field];
    return `
    <div data-act="toggleHabit" data-arg="${h.field}" style="display:flex;align-items:center;gap:12px;background:${t.surface};border-radius:14px;padding:12px 14px;border:1px solid ${t.border};box-shadow:${t.shadow};cursor:pointer">
      <div style="width:26px;height:26px;border-radius:50%;background:${on?'#F2A93B':'transparent'};border:2px solid ${on?'#F2A93B':t.textMuted};flex-shrink:0"></div>
      <div style="flex:1"><div style="font-size:14px;font-weight:600;color:${t.text}">${escapeHtml(h.label)}</div></div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${on?'#F2A93B':t.textMuted}">${on?'DONE':'—'}</div>
    </div>`;
  }).join('');

  const liCountWeek = (()=>{ let n=0; for(let i=0;i<7;i++){ const dk=dateKey(addDays(today,-i)); const c=S.checkins[dk]; if(c&&c.linkedin) n++; } return n; })();
  const monthCutoff = dateKey(addDays(today,-29));
  const monthSpent = S.financeEntries.filter(e=>e.type==='expense'&&e.date>=monthCutoff&&(e.currency||'XOF')===S.financeCurrencyView).reduce((s,e)=>s+e.amount,0);

  return `
  <div style="padding:20px 20px 100px">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px">
      <div>
        <div style="font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700;color:${t.text};letter-spacing:-0.3px">${today.toLocaleDateString(undefined,{weekday:'long'})}</div>
        <div style="display:inline-flex;align-items:center;gap:6px;margin-top:6px;padding:4px 10px;border-radius:20px;background:${DAYTYPE_COLOR[dt]}22;border:1px solid ${DAYTYPE_COLOR[dt]}55">
          <div style="width:6px;height:6px;border-radius:50%;background:${DAYTYPE_COLOR[dt]}"></div>
          <span style="font-size:11px;font-weight:600;color:${DAYTYPE_COLOR[dt]};text-transform:uppercase;letter-spacing:0.5px">${DAYTYPE_LABEL[dt]}</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <button data-act="toggleTheme" style="width:32px;height:32px;border-radius:10px;background:${t.surface};border:1px solid ${t.border};box-shadow:${t.shadow};display:flex;align-items:center;justify-content:center;cursor:pointer">
          ${icon(S.theme==='dark'?'moon':'sun', {size:16, color:t.themeIconColor})}
        </button>
        <div style="text-align:right">
          <div style="display:flex;align-items:center;gap:5px;justify-content:flex-end">
            <div style="width:16px;height:20px;background:#F2A93B;border-radius:50% 50% 50% 50% / 60% 60% 40% 40%;animation:lu-flame 1.6s ease-in-out infinite;box-shadow:0 0 12px rgba(242,169,59,0.5)"></div>
            <span style="font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;color:#F2A93B">${streak}</span>
          </div>
          <div style="font-size:10px;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-top:2px">day streak</div>
        </div>
      </div>
    </div>

    <div style="background:${t.surface};border-radius:18px;padding:14px 16px;margin-bottom:14px;border:1px solid ${t.border};box-shadow:${t.shadow}">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px">
        <span style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px">Today's timeline</span>
        <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#F2A93B">${nowLabel}</span>
      </div>
      <div style="position:relative;height:34px;border-radius:8px;overflow:hidden;background:${t.surface2}">
        ${timelineSegs}
        <div style="position:absolute;top:-3px;bottom:-3px;left:${nowPct}%;width:2px;background:${t.text};box-shadow:0 0 6px rgba(120,120,120,0.6)"></div>
      </div>
    </div>

    <div style="display:flex;gap:14px;margin-bottom:14px">
      <div style="width:100px;height:100px;border-radius:50%;background:conic-gradient(#F2A93B ${score}%, ${t.surface2} 0);display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <div style="width:78px;height:78px;border-radius:50%;background:${t.surface};display:flex;flex-direction:column;align-items:center;justify-content:center">
          <div style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:${t.text}">${score}%</div>
          <div style="font-size:9px;color:${t.textMuted};letter-spacing:0.3px">SCORE</div>
        </div>
      </div>
      <div style="flex:1;background:${t.surface};border-radius:18px;padding:14px 16px;border:1px solid ${t.border};box-shadow:${t.shadow};display:flex;flex-direction:column;justify-content:center">
        <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Next up</div>
        ${nextBlock ? `
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
            ${nextBlock.isBooking ? icon('calendarPlus',{size:13,color:CAT_COLORS.booking}) : ''}
            <div style="font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:600;color:${t.text}">${escapeHtml(nextBlock.label)}</div>
          </div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#F2A93B;margin-bottom:8px">in ${timeToMin(nextBlock.start)-nowMin} min · ${nextBlock.start}</div>
          <button data-act="triggerAlarm" data-arg="${encodeURIComponent(JSON.stringify(nextBlock))}" style="align-self:flex-start;display:inline-flex;align-items:center;gap:5px;background:rgba(242,169,59,0.15);border:1px solid rgba(242,169,59,0.4);color:#F2A93B;font-size:11px;font-weight:600;padding:6px 12px;border-radius:20px;cursor:pointer">${icon('bell',{size:12,color:'#F2A93B'})}Preview alarm</button>
        ` : `<div style="font-size:13px;color:${t.textMuted}">Day's blocks are done.</div>`}
      </div>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:baseline;margin:18px 0 10px">
      <span style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px">Core habits</span>
      <button data-act="openHabits" style="background:none;border:none;color:#F2A93B;font-size:11px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:4px">${icon('edit',{size:12,color:'#F2A93B'})}Edit</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${habitRowsHtml}
      <div data-act="toggleLinkedin" style="display:flex;align-items:center;gap:12px;background:${t.surface};border-radius:14px;padding:12px 14px;border:1px solid ${t.border};box-shadow:${t.shadow};cursor:pointer">
        <div style="width:26px;height:26px;border-radius:50%;background:${checkin.linkedin?'#F2A93B':'transparent'};border:2px solid ${checkin.linkedin?'#F2A93B':t.textMuted};flex-shrink:0"></div>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:600;color:${t.text}">LinkedIn Post</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${t.textMuted}">${liCountWeek}/2 this week · weekly goal</div>
        </div>
      </div>
    </div>

    <div data-act="goFinanceTab" style="margin-top:18px;background:${t.surface2};border-radius:16px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;border:1px solid ${t.border};box-shadow:${t.shadow}">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="width:36px;height:36px;border-radius:11px;background:rgba(242,169,59,0.14);display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon('wallet',{size:17,color:'#F2A93B'})}</div>
        <div>
          <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px">Spent this month (${S.financeCurrencyView})</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:18px;color:${t.text};margin-top:3px">${fmtMoneyFor(monthSpent, S.financeCurrencyView)}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;color:#F2A93B">${icon('chevronRight',{size:16,color:'#F2A93B'})}</div>
    </div>
  </div>`;
}

function renderScheduleModeToggle(t){
  const modes = [{k:'routine', l:'Routine', i:'refresh'}, {k:'calendar', l:'Calendar', i:'calendar'}];
  return `<div style="display:flex;gap:8px;margin-bottom:16px;background:${t.surface2};border-radius:14px;padding:4px">
    ${modes.map(m=>{
      const active = S.scheduleMode===m.k;
      return `<button data-act="setScheduleMode" data-arg="${m.k}" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px 4px;border-radius:11px;background:${active?t.surface:'transparent'};box-shadow:${active?t.shadow:'none'};border:none;color:${active?'#F2A93B':t.textMuted};font-size:12.5px;font-weight:700;cursor:pointer">${icon(m.i,{size:14,color:active?'#F2A93B':t.textMuted})}${m.l}</button>`;
    }).join('')}
  </div>`;
}

function renderRoutineSchedule(t){
  const views = [
    {key:'jog', label:'Tue/Thu'}, {key:'gym', label:'Mon/Wed/Fri'}, {key:'weekend', label:'Weekend'}
  ];
  const optsHtml = views.map(v=>{
    const active = S.scheduleView===v.key;
    const c = DAYTYPE_COLOR[v.key];
    return `<button data-act="setScheduleView" data-arg="${v.key}" style="flex:1;padding:9px 4px;border-radius:12px;background:${active?c+'22':t.surface};border:1px solid ${active?c+'66':t.border};color:${active?c:t.textMuted};font-size:11px;font-weight:600;cursor:pointer">${v.label}</button>`;
  }).join('');

  const today = new Date();
  const nowMin = today.getHours()*60+today.getMinutes();
  const dt = dayType(today);
  const blocks = S.scheduleTemplates[S.scheduleView] || [];
  const rowsHtml = blocks.map(b=>{
    const isNow = S.scheduleView===dt && timeToMin(b.start)<=nowMin && nowMin<timeToMin(b.end);
    return `
    <div style="display:flex;align-items:center;gap:10px;background:${t.surface};border-radius:14px;padding:10px 12px;border:1px solid ${isNow?'rgba(242,169,59,0.5)':t.border};box-shadow:${t.shadow}">
      <div style="width:30px;height:30px;border-radius:9px;background:${CAT_COLORS[b.cat]}22;display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon(CAT_ICONS[b.cat]||'clock',{size:14,color:CAT_COLORS[b.cat]})}</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${t.textMuted};width:82px;flex-shrink:0">${b.start}–${b.end}</div>
      <div style="flex:1;font-size:13px;color:${t.text};font-weight:500">${escapeHtml(b.label)}</div>
      <button data-act="triggerAlarm" data-arg="${encodeURIComponent(JSON.stringify(b))}" style="width:28px;height:28px;border-radius:8px;background:${t.surface2};border:none;display:flex;align-items:center;justify-content:center;cursor:pointer">${icon('bell',{size:13,color:'#F2A93B'})}</button>
      <button data-act="openBlockEditor" data-arg="${S.scheduleView}|${b.id}" style="width:28px;height:28px;border-radius:8px;background:${t.surface2};border:none;display:flex;align-items:center;justify-content:center;cursor:pointer">${icon('edit',{size:13,color:t.textMuted})}</button>
    </div>`;
  }).join('');

  return `
    <div style="display:flex;gap:8px;margin-bottom:16px">${optsHtml}</div>
    <div style="display:flex;flex-direction:column;gap:8px">${rowsHtml}</div>
    <button data-act="addBlock" style="margin-top:14px;width:100%;display:flex;align-items:center;justify-content:center;gap:6px;padding:12px;border-radius:14px;background:rgba(242,169,59,0.12);border:1px dashed rgba(242,169,59,0.5);color:#F2A93B;font-size:13px;font-weight:600;cursor:pointer">${icon('plus',{size:14,color:'#F2A93B'})}Add block</button>
  `;
}

function renderCalendarSchedule(t){
  const todayD = new Date();
  const todayK = dateKey(todayD);
  const base = new Date(todayD.getFullYear(), todayD.getMonth(), 1);
  const view = addMonths(base, S.calMonthOffset);
  const daysIn = new Date(view.getFullYear(), view.getMonth()+1, 0).getDate();
  const leadBlank = (view.getDay()===0?6:view.getDay()-1);
  const monthLabel = view.toLocaleDateString(undefined,{month:'long',year:'numeric'});

  let cells = '';
  for(let i=0;i<leadBlank;i++) cells += `<div></div>`;
  for(let d=1; d<=daysIn; d++){
    const dObj = new Date(view.getFullYear(), view.getMonth(), d);
    const dk = dateKey(dObj);
    const isToday = dk===todayK;
    const isSel = dk===S.calSelectedDate;
    const hasBookings = (S.bookings[dk]||[]).length>0;
    cells += `<div class="lu-cal-cell" data-act="selectCalDate" data-arg="${dk}" style="background:${isSel?'#F2A93B':isToday?t.surface2:'transparent'};border:1px solid ${isSel?'#F2A93B':isToday?'rgba(242,169,59,0.4)':'transparent'}">
      <span style="font-size:12.5px;font-weight:${isToday||isSel?'700':'500'};color:${isSel?'#0F1B2B':t.text}">${d}</span>
      ${hasBookings ? `<div class="lu-cal-dot" style="background:${isSel?'#0F1B2B':'#F2A93B'}"></div>` : ''}
    </div>`;
  }
  const weekdayLabels = ['M','T','W','T','F','S','S'].map(l=>`<div style="text-align:center;font-size:10px;font-weight:600;color:${t.textMuted}">${l}</div>`).join('');

  const selDate = new Date(S.calSelectedDate+'T00:00:00');
  const selDt = dayType(selDate);
  const routineBlocks = (S.scheduleTemplates[selDt]||[]).map(b=>({...b, isRoutine:true}));
  const bookedBlocks = (S.bookings[S.calSelectedDate]||[]).map(b=>({...b, isRoutine:false}));
  const dayBlocks = [...routineBlocks, ...bookedBlocks].sort((a,b)=>timeToMin(a.start)-timeToMin(b.start));
  const selLabel = selDate.toLocaleDateString(undefined,{weekday:'long', month:'short', day:'numeric'});

  const agendaHtml = dayBlocks.length ? dayBlocks.map(b=>`
    <div style="display:flex;align-items:center;gap:10px;background:${t.surface};border-radius:14px;padding:10px 12px;border:1px solid ${t.border};box-shadow:${t.shadow};${b.isRoutine?'opacity:0.72':''}">
      <div style="width:30px;height:30px;border-radius:9px;background:${CAT_COLORS[b.cat]}22;display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon(CAT_ICONS[b.cat]||'clock',{size:14,color:CAT_COLORS[b.cat]})}</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${t.textMuted};width:82px;flex-shrink:0">${b.start}–${b.end}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;color:${t.text};font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(b.label)}</div>
        <div style="font-size:10px;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.4px">${b.isRoutine?'Routine':'Booked'}</div>
      </div>
      ${b.isRoutine ? '' : `<button data-act="editBooking" data-arg="${S.calSelectedDate}|${b.id}" style="width:28px;height:28px;border-radius:8px;background:${t.surface2};border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0">${icon('edit',{size:13,color:t.textMuted})}</button>`}
    </div>`).join('') : `<div style="text-align:center;padding:24px 0;color:${t.textMuted};font-size:13px">Nothing on the books for this day yet.</div>`;

  return `
    <div style="background:${t.surface};border-radius:18px;padding:14px 16px;border:1px solid ${t.border};box-shadow:${t.shadow};margin-bottom:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <button data-act="calPrevMonth" style="width:28px;height:28px;border-radius:8px;background:${t.surface2};border:none;display:flex;align-items:center;justify-content:center;cursor:pointer">${icon('chevronLeft',{size:14,color:t.text})}</button>
        <div data-act="calGoToday" style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;color:${t.text};cursor:pointer">${monthLabel}</div>
        <button data-act="calNextMonth" style="width:28px;height:28px;border-radius:8px;background:${t.surface2};border:none;display:flex;align-items:center;justify-content:center;cursor:pointer">${icon('chevronRight',{size:14,color:t.text})}</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:4px">${weekdayLabels}</div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px">${cells}</div>
    </div>

    <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px">
      <span style="font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700;color:${t.text}">${selLabel}</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">${agendaHtml}</div>
    <button data-act="openAddBooking" data-arg="${S.calSelectedDate}" style="margin-top:14px;width:100%;display:flex;align-items:center;justify-content:center;gap:6px;padding:12px;border-radius:14px;background:rgba(242,169,59,0.12);border:1px dashed rgba(242,169,59,0.5);color:#F2A93B;font-size:13px;font-weight:600;cursor:pointer">${icon('calendarPlus',{size:14,color:'#F2A93B'})}Book something for this day</button>
  `;
}

function renderSchedule(){
  const t = T();
  return `
  <div style="padding:20px 20px 100px">
    <div style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:${t.text};margin-bottom:14px">Schedule</div>
    ${renderScheduleModeToggle(t)}
    ${S.scheduleMode==='calendar' ? renderCalendarSchedule(t) : renderRoutineSchedule(t)}
  </div>`;
}

function renderTracker(){
  const t = T();
  const today = new Date();
  const todayKey = dateKey(today);
  const score = scoreOf(getCheckin(todayKey));
  const streak = streakCount();

  const viewOpts = ['day','week','month','year'].map(v=>{
    const active = S.trackerView===v;
    return `<button data-act="setTrackerView" data-arg="${v}" style="flex:1;padding:8px 2px;border-radius:10px;background:${active?'#F2A93B22':t.surface};border:1px solid ${t.border};box-shadow:${t.shadow};color:${active?'#F2A93B':t.textMuted};font-size:11px;font-weight:600;cursor:pointer">${v[0].toUpperCase()+v.slice(1)}</button>`;
  }).join('');

  let body = '';

  if(S.trackerView==='day'){
    const tDate = addDays(today, S.trackerDayOffset);
    const tKey = dateKey(tDate);
    const tCheckin = getCheckin(tKey);
    const tScore = scoreOf(tCheckin);
    let tCompleted=0;
    S.habitDefs.forEach(h=>{ if(h.type==='number'){ if((tCheckin[h.field]||0)>=h.target) tCompleted++; } else if(tCheckin[h.field]) tCompleted++; });
    const rows = S.habitDefs.map(h=>{
      if(h.type==='number'){
        const val = tCheckin[h.field]||0; const met = val>=h.target;
        return `<div data-act="trackerToggleNumHabit" data-arg="${h.field}" style="display:flex;align-items:center;gap:12px;background:${t.surface};border-radius:14px;padding:12px 14px;border:1px solid ${t.border};box-shadow:${t.shadow};cursor:pointer">
          <div style="width:24px;height:24px;border-radius:50%;background:${met?'#F2A93B':'transparent'};border:2px solid ${met?'#F2A93B':t.textMuted};flex-shrink:0"></div>
          <div style="flex:1;font-size:14px;font-weight:600;color:${t.text}">${escapeHtml(h.label)} ${h.target}+</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${met?'#F2A93B':t.textMuted}">${val.toFixed(1)}</div>
        </div>`;
      }
      const on = tCheckin[h.field];
      return `<div data-act="trackerToggleHabit" data-arg="${h.field}" style="display:flex;align-items:center;gap:12px;background:${t.surface};border-radius:14px;padding:12px 14px;border:1px solid ${t.border};box-shadow:${t.shadow};cursor:pointer">
        <div style="width:24px;height:24px;border-radius:50%;background:${on?'#F2A93B':'transparent'};border:2px solid ${on?'#F2A93B':t.textMuted};flex-shrink:0"></div>
        <div style="flex:1;font-size:14px;font-weight:600;color:${t.text}">${escapeHtml(h.label)}</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${on?'#F2A93B':t.textMuted}">${on?'DONE':'—'}</div>
      </div>`;
    }).join('');
    body = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <button data-act="trackerPrevDay" style="background:${t.surface};border:1px solid ${t.border};box-shadow:${t.shadow};color:${t.text};width:32px;height:32px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center">${icon('chevronLeft',{size:15,color:t.text})}</button>
        <div style="font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700;color:${t.text}">${tDate.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}</div>
        <button data-act="trackerNextDay" style="background:${t.surface};border:1px solid ${t.border};box-shadow:${t.shadow};color:${t.text};width:32px;height:32px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center">${icon('chevronRight',{size:15,color:t.text})}</button>
      </div>
      <div style="text-align:center;margin-bottom:16px"><span style="font-family:'JetBrains Mono',monospace;font-size:13px;color:#F2A93B">${tCompleted}/${S.habitDefs.length} completed · ${tScore}%</span></div>
      <div style="display:flex;flex-direction:column;gap:8px">${rows}</div>`;
  }

  if(S.trackerView==='week'){
    const monday = mondayOf(today);
    const weekDayLabels=['M','T','W','T','F','S','S'];
    let stripHtml='';
    for(let i=0;i<7;i++){
      const d=addDays(monday,i); const dk=dateKey(d); const c=S.checkins[dk]; const off=Math.round((d-today)/86400000);
      let color=t.surface2;
      if(c){ const s=scoreOf(c); color = s>=80?'#3DDC84': s>=60?'#F2A93B': s>=40?'#c98a2e': s>0?'#7a4a1f':t.surface2; }
      else if(dk===todayKey){ color = score>=60?'#F2A93B':t.surface2; }
      stripHtml += `<div data-act="jumpTrackerDay" data-arg="${off}" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer">
        <span style="font-size:9.5px;color:${t.textMuted}">${weekDayLabels[i]}</span>
        <div style="width:100%;aspect-ratio:1;border-radius:8px;background:${color}"></div>
      </div>`;
    }
    const weekDaysArr=[]; for(let i=0;i<7;i++) weekDaysArr.push(dateKey(addDays(monday,i)));
    let wSum=0,wN=0; weekDaysArr.forEach(dk=>{ const c=S.checkins[dk]; if(c){ wSum+=scoreOf(c); wN++; } });
    const weekAvg = wN?Math.round(wSum/wN):0;
    const barDefs = [...S.habitDefs, {field:'linkedin', label:'LinkedIn', type:'bool', color:'#35C4E0'}];
    const barsHtml = barDefs.map(hf=>{
      let n=0;
      weekDaysArr.forEach(dk=>{
        const c=S.checkins[dk]; if(!c) return;
        if(hf.type==='number'){ if((c[hf.field]||0)>=hf.target) n++; }
        else if(c[hf.field]) n++;
      });
      const pct = Math.round(n/7*100);
      return `<div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:${t.text};margin-bottom:4px"><span>${escapeHtml(hf.label)}</span><span style="font-family:'JetBrains Mono',monospace;color:${t.textMuted}">${pct}%</span></div>
        <div style="height:8px;border-radius:4px;background:${t.surface2};overflow:hidden"><div style="height:100%;width:${pct}%;background:${hf.color}"></div></div>
      </div>`;
    }).join('');
    body = `
      <div style="display:flex;gap:5px;margin-bottom:18px">${stripHtml}</div>
      <div style="font-size:12px;color:${t.textMuted};margin-bottom:18px">${streak}-day streak · ${weekAvg}% avg this week</div>
      <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Habit completion (7d)</div>
      <div style="display:flex;flex-direction:column;gap:10px">${barsHtml}</div>`;
  }

  if(S.trackerView==='month'){
    const base = new Date(today.getFullYear(), today.getMonth(), 1);
    const daysIn = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();
    const leadBlank = (base.getDay()===0?6:base.getDay()-1);
    let cells=''; for(let i=0;i<leadBlank;i++) cells += `<div style="aspect-ratio:1;border-radius:4px;background:transparent"></div>`;
    let mSum=0,mN=0; const monthDayKeys=[];
    for(let d=1; d<=daysIn; d++){
      const dk = dateKey(new Date(today.getFullYear(),today.getMonth(),d)); monthDayKeys.push(dk);
      const c = S.checkins[dk]; let color=t.surface2;
      if(c){ const s=scoreOf(c); color = s>=80?'#3DDC84': s>=60?'#F2A93B': s>=40?'#c98a2e': s>0?'#7a4a1f':t.surface2; mSum+=s; mN++; }
      cells += `<div style="aspect-ratio:1;border-radius:4px;background:${color}"></div>`;
    }
    const monthAvg = mN?Math.round(mSum/mN):0;
    const monthBest = bestStreakInRange(monthDayKeys);
    body = `
      <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">${today.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:16px">${cells}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border};box-shadow:${t.shadow}"><div style="font-size:10px;color:${t.textMuted};text-transform:uppercase">Avg score</div><div style="font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700;color:${t.text};margin-top:4px">${monthAvg}%</div></div>
        <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border};box-shadow:${t.shadow}"><div style="font-size:10px;color:${t.textMuted};text-transform:uppercase">Best streak</div><div style="font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700;color:${t.text};margin-top:4px">${monthBest}d</div></div>
      </div>`;
  }

  if(S.trackerView==='year'){
    let cells=''; let ySum=0,yN=0; const yearDayKeys=[];
    for(let m=0;m<12;m++){
      const dIn = new Date(today.getFullYear(),m+1,0).getDate(); let sSum=0,sN=0;
      for(let d=1; d<=dIn; d++){
        const dObj = new Date(today.getFullYear(),m,d); if(dObj>today) continue;
        const dk=dateKey(dObj); yearDayKeys.push(dk); const c=S.checkins[dk];
        if(c){ const s=scoreOf(c); sSum+=s; sN++; ySum+=s; yN++; }
      }
      const avg = sN?Math.round(sSum/sN):null;
      const color = avg===null ? t.surface2 : avg>=80?'#3DDC84': avg>=60?'#F2A93B': avg>=40?'#c98a2e':'#7a4a1f';
      const label = new Date(today.getFullYear(),m,1).toLocaleDateString(undefined,{month:'short'});
      cells += `<div style="border-radius:10px;background:${color};padding:10px 6px;text-align:center"><div style="font-size:9.5px;color:rgba(0,0,0,0.55);font-weight:700">${label}</div></div>`;
    }
    const yearAvg = yN?Math.round(ySum/yN):0;
    const yearBest = bestStreakInRange(yearDayKeys);
    body = `
      <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">${today.getFullYear()}</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px">${cells}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border};box-shadow:${t.shadow}"><div style="font-size:10px;color:${t.textMuted};text-transform:uppercase">Avg score</div><div style="font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700;color:${t.text};margin-top:4px">${yearAvg}%</div></div>
        <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border};box-shadow:${t.shadow}"><div style="font-size:10px;color:${t.textMuted};text-transform:uppercase">Longest streak</div><div style="font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700;color:${t.text};margin-top:4px">${yearBest}d</div></div>
      </div>`;
  }

  return `
  <div style="padding:20px 20px 100px">
    <div style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:${t.text};margin-bottom:14px">Tracker</div>
    <div style="display:flex;gap:6px;margin-bottom:18px">${viewOpts}</div>
    ${body}
  </div>`;
}
