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
  const blocksRaw = S.scheduleTemplates[dt] || [];
  const nowPct = (nowMin/1440*100).toFixed(2);

  const timelineSegs = blocksRaw.map(b=>{
    const left = (timeToMin(b.start)/1440*100).toFixed(2);
    const width = ((timeToMin(b.end)-timeToMin(b.start))/1440*100).toFixed(2);
    return `<div style="position:absolute;top:0;bottom:0;left:${left}%;width:${width}%;background:${CAT_COLORS[b.cat]};opacity:0.85;border-right:1px solid ${t.surface}"></div>`;
  }).join('');

  const nextBlock = blocksRaw.find(b=>timeToMin(b.start) > nowMin) || null;
  const nowLabel = pad2(today.getHours())+':'+pad2(today.getMinutes());

  const habitRowsHtml = HABIT_DEFS.map(h=>{
    const on = checkin[h.field];
    return `
    <div data-act="toggleHabit" data-arg="${h.field}" style="display:flex;align-items:center;gap:12px;background:${t.surface};border-radius:14px;padding:12px 14px;border:1px solid ${t.border};cursor:pointer">
      <div style="width:26px;height:26px;border-radius:50%;background:${on?'#F2A93B':'transparent'};border:2px solid ${on?'#F2A93B':t.textMuted};flex-shrink:0"></div>
      <div style="flex:1"><div style="font-size:14px;font-weight:600;color:${t.text}">${h.label}</div></div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${on?'#F2A93B':t.textMuted}">${on?'DONE':'—'}</div>
    </div>`;
  }).join('');

  const dw = checkin.deepWorkHours||0;
  const dwMet = dw>=5;
  const liCountWeek = (()=>{ let n=0; for(let i=0;i<7;i++){ const dk=dateKey(addDays(today,-i)); const c=S.checkins[dk]; if(c&&c.linkedin) n++; } return n; })();
  const monthCutoff = dateKey(addDays(today,-29));
  const monthSpent = S.financeEntries.filter(e=>e.type==='expense'&&e.date>=monthCutoff).reduce((s,e)=>s+e.amount,0);

  return `
  <div style="padding:20px 20px 100px;animation:lu-fadein 0.35s ease">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px">
      <div>
        <div style="font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700;color:${t.text};letter-spacing:-0.3px">${today.toLocaleDateString(undefined,{weekday:'long'})}</div>
        <div style="display:inline-flex;align-items:center;gap:6px;margin-top:6px;padding:4px 10px;border-radius:20px;background:${DAYTYPE_COLOR[dt]}22;border:1px solid ${DAYTYPE_COLOR[dt]}55">
          <div style="width:6px;height:6px;border-radius:50%;background:${DAYTYPE_COLOR[dt]}"></div>
          <span style="font-size:11px;font-weight:600;color:${DAYTYPE_COLOR[dt]};text-transform:uppercase;letter-spacing:0.5px">${DAYTYPE_LABEL[dt]}</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <button data-act="toggleTheme" style="width:32px;height:32px;border-radius:10px;background:${t.surface};border:1px solid ${t.border};display:flex;align-items:center;justify-content:center;cursor:pointer">
          <div style="width:14px;height:14px;border-radius:50%;background:${t.themeIconColor}"></div>
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

    <div style="background:${t.surface};border-radius:18px;padding:14px 16px;margin-bottom:14px;border:1px solid ${t.border}">
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
      <div style="flex:1;background:${t.surface};border-radius:18px;padding:14px 16px;border:1px solid ${t.border};display:flex;flex-direction:column;justify-content:center">
        <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Next up</div>
        ${nextBlock ? `
          <div style="font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:600;color:${t.text};margin-bottom:2px">${escapeHtml(nextBlock.label)}</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#F2A93B;margin-bottom:8px">in ${timeToMin(nextBlock.start)-nowMin} min · ${nextBlock.start}</div>
          <button data-act="triggerAlarm" data-arg="${encodeURIComponent(JSON.stringify(nextBlock))}" style="align-self:flex-start;background:rgba(242,169,59,0.15);border:1px solid rgba(242,169,59,0.4);color:#F2A93B;font-size:11px;font-weight:600;padding:6px 12px;border-radius:20px;cursor:pointer">Preview alarm</button>
        ` : `<div style="font-size:13px;color:${t.textMuted}">Day's blocks are done.</div>`}
      </div>
    </div>

    <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin:18px 0 10px">Core habits</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${habitRowsHtml}
      <div style="display:flex;align-items:center;gap:12px;background:${t.surface};border-radius:14px;padding:12px 14px;border:1px solid ${t.border}">
        <div style="width:26px;height:26px;border-radius:50%;background:${dwMet?'#F2A93B':'transparent'};border:2px solid ${dwMet?'#F2A93B':t.textMuted};flex-shrink:0"></div>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:600;color:${t.text}">Deep Work Hours</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${t.textMuted}">target 5.0+ hrs</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <button data-act="deepWorkDec" style="width:26px;height:26px;border-radius:8px;background:${t.surface2};color:${t.text};border:none;font-size:16px;cursor:pointer">–</button>
          <div style="font-family:'JetBrains Mono',monospace;font-size:14px;color:#F2A93B;min-width:32px;text-align:center">${dw.toFixed(1)}</div>
          <button data-act="deepWorkInc" style="width:26px;height:26px;border-radius:8px;background:${t.surface2};color:${t.text};border:none;font-size:16px;cursor:pointer">+</button>
        </div>
      </div>
      <div data-act="toggleLinkedin" style="display:flex;align-items:center;gap:12px;background:${t.surface};border-radius:14px;padding:12px 14px;border:1px solid ${t.border};cursor:pointer">
        <div style="width:26px;height:26px;border-radius:50%;background:${checkin.linkedin?'#F2A93B':'transparent'};border:2px solid ${checkin.linkedin?'#F2A93B':t.textMuted};flex-shrink:0"></div>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:600;color:${t.text}">LinkedIn Post</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${t.textMuted}">${liCountWeek}/2 this week · weekly goal</div>
        </div>
      </div>
    </div>

    <div data-act="goFinanceTab" style="margin-top:18px;background:${t.surface2};border-radius:16px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;border:1px solid ${t.border}">
      <div>
        <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px">Spent this month</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:18px;color:${t.text};margin-top:3px">${fmtMoney(monthSpent)}</div>
      </div>
      <div style="font-size:12px;color:#F2A93B">Finance →</div>
    </div>
  </div>`;
}

function renderSchedule(){
  const t = T();
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
    <div style="display:flex;align-items:center;gap:10px;background:${t.surface};border-radius:14px;padding:10px 12px;border:1px solid ${isNow?'rgba(242,169,59,0.5)':t.border}">
      <div style="width:8px;height:8px;border-radius:50%;background:${CAT_COLORS[b.cat]};flex-shrink:0"></div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${t.textMuted};width:88px;flex-shrink:0">${b.start}–${b.end}</div>
      <div style="flex:1;font-size:13px;color:${t.text};font-weight:500">${escapeHtml(b.label)}</div>
      <button data-act="triggerAlarm" data-arg="${encodeURIComponent(JSON.stringify(b))}" style="width:26px;height:26px;border-radius:8px;background:${t.surface2};border:none;color:#F2A93B;font-size:12px;cursor:pointer">◔</button>
      <button data-act="openBlockEditor" data-arg="${S.scheduleView}|${b.id}" style="width:26px;height:26px;border-radius:8px;background:${t.surface2};border:none;color:${t.textMuted};font-size:12px;cursor:pointer">✎</button>
    </div>`;
  }).join('');

  return `
  <div style="padding:20px 20px 100px;animation:lu-fadein 0.35s ease">
    <div style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:${t.text};margin-bottom:14px">Schedule</div>
    <div style="display:flex;gap:8px;margin-bottom:16px">${optsHtml}</div>
    <div style="display:flex;flex-direction:column;gap:8px">${rowsHtml}</div>
    <button data-act="addBlock" style="margin-top:14px;width:100%;padding:12px;border-radius:14px;background:rgba(242,169,59,0.12);border:1px dashed rgba(242,169,59,0.5);color:#F2A93B;font-size:13px;font-weight:600;cursor:pointer">+ Add block</button>
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
    return `<button data-act="setTrackerView" data-arg="${v}" style="flex:1;padding:8px 2px;border-radius:10px;background:${active?'#F2A93B22':t.surface};border:1px solid ${t.border};color:${active?'#F2A93B':t.textMuted};font-size:11px;font-weight:600;cursor:pointer">${v[0].toUpperCase()+v.slice(1)}</button>`;
  }).join('');

  let body = '';

  if(S.trackerView==='day'){
    const tDate = addDays(today, S.trackerDayOffset);
    const tKey = dateKey(tDate);
    const tCheckin = getCheckin(tKey);
    const tScore = scoreOf(tCheckin);
    let tCompleted=0; ['morningPages','reading','cameraTalk','workout'].forEach(f=>{ if(tCheckin[f]) tCompleted++; }); if(tCheckin.deepWorkHours>=5) tCompleted++;
    const rows = HABIT_DEFS.map(h=>{
      const on = tCheckin[h.field];
      return `<div data-act="trackerToggleHabit" data-arg="${h.field}" style="display:flex;align-items:center;gap:12px;background:${t.surface};border-radius:14px;padding:12px 14px;border:1px solid ${t.border};cursor:pointer">
        <div style="width:24px;height:24px;border-radius:50%;background:${on?'#F2A93B':'transparent'};border:2px solid ${on?'#F2A93B':t.textMuted};flex-shrink:0"></div>
        <div style="flex:1;font-size:14px;font-weight:600;color:${t.text}">${h.label}</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${on?'#F2A93B':t.textMuted}">${on?'DONE':'—'}</div>
      </div>`;
    }).join('') + `
      <div data-act="trackerToggleDeepWork" style="display:flex;align-items:center;gap:12px;background:${t.surface};border-radius:14px;padding:12px 14px;border:1px solid ${t.border};cursor:pointer">
        <div style="width:24px;height:24px;border-radius:50%;background:${tCheckin.deepWorkHours>=5?'#F2A93B':'transparent'};border:2px solid ${tCheckin.deepWorkHours>=5?'#F2A93B':t.textMuted};flex-shrink:0"></div>
        <div style="flex:1;font-size:14px;font-weight:600;color:${t.text}">Deep Work 5h+</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${tCheckin.deepWorkHours>=5?'#F2A93B':t.textMuted}">${tCheckin.deepWorkHours.toFixed(1)}h</div>
      </div>`;
    body = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <button data-act="trackerPrevDay" style="background:${t.surface};border:1px solid ${t.border};color:${t.text};width:32px;height:32px;border-radius:10px;cursor:pointer">‹</button>
        <div style="font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700;color:${t.text}">${tDate.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}</div>
        <button data-act="trackerNextDay" style="background:${t.surface};border:1px solid ${t.border};color:${t.text};width:32px;height:32px;border-radius:10px;cursor:pointer">›</button>
      </div>
      <div style="text-align:center;margin-bottom:16px"><span style="font-family:'JetBrains Mono',monospace;font-size:13px;color:#F2A93B">${tCompleted}/5 completed · ${tScore}%</span></div>
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
    const barsHtml = HABIT_FIELDS_BASE.map(hf=>{
      let n=0; weekDaysArr.forEach(dk=>{ const c=S.checkins[dk]; if(c&&c[hf.field]) n++; });
      const pct = Math.round(n/7*100);
      return `<div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:${t.text};margin-bottom:4px"><span>${hf.label}</span><span style="font-family:'JetBrains Mono',monospace;color:${t.textMuted}">${pct}%</span></div>
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
        <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border}"><div style="font-size:10px;color:${t.textMuted};text-transform:uppercase">Avg score</div><div style="font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700;color:${t.text};margin-top:4px">${monthAvg}%</div></div>
        <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border}"><div style="font-size:10px;color:${t.textMuted};text-transform:uppercase">Best streak</div><div style="font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700;color:${t.text};margin-top:4px">${monthBest}d</div></div>
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
        <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border}"><div style="font-size:10px;color:${t.textMuted};text-transform:uppercase">Avg score</div><div style="font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700;color:${t.text};margin-top:4px">${yearAvg}%</div></div>
        <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border}"><div style="font-size:10px;color:${t.textMuted};text-transform:uppercase">Longest streak</div><div style="font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700;color:${t.text};margin-top:4px">${yearBest}d</div></div>
      </div>`;
  }

  return `
  <div style="padding:20px 20px 100px;animation:lu-fadein 0.35s ease">
    <div style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:${t.text};margin-bottom:14px">Tracker</div>
    <div style="display:flex;gap:6px;margin-bottom:18px">${viewOpts}</div>
    ${body}
  </div>`;
}
