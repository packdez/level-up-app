// ===================== RENDER: Finance =====================

function renderFinance(){
  const t = T();
  const modeTabsHtml = `
    <button data-act="setModeSpending" style="flex:1;padding:9px;border-radius:12px;background:${S.financeMode==='spending'?'#F2A93B22':t.surface};border:1px solid ${t.border};color:${S.financeMode==='spending'?'#F2A93B':t.textMuted};font-size:12px;font-weight:600;cursor:pointer">Spending</button>
    <button data-act="setModeInvesting" style="flex:1;padding:9px;border-radius:12px;background:${S.financeMode==='investing'?'#F2A93B22':t.surface};border:1px solid ${t.border};color:${S.financeMode==='investing'?'#F2A93B':t.textMuted};font-size:12px;font-weight:600;cursor:pointer">Investments</button>`;

  return `
  <div style="padding:20px 20px 110px;animation:lu-fadein 0.35s ease">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:${t.text}">Finance</div>
      <button data-act="openFinanceSettings" style="background:${t.surface};border:1px solid ${t.border};color:${t.text};width:32px;height:32px;border-radius:10px;cursor:pointer;font-size:14px">⚙</button>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:16px">${modeTabsHtml}</div>
    ${S.financeMode==='spending' ? renderFinanceSpending() : renderFinanceInvesting()}
  </div>`;
}

function renderFinanceSpending(){
  const t = T();
  const mi = monthInfo(S.financeMonthOffset);
  const monthEntries = entriesForMonth(mi.key);
  const expenses = monthEntries.filter(e=>e.type==='expense');
  const income = monthEntries.filter(e=>e.type==='income');
  const savingsEntries = monthEntries.filter(e=>e.type==='savings');
  const totalExpense = expenses.reduce((s,e)=>s+e.amount,0);
  const totalIncome = income.reduce((s,e)=>s+e.amount,0);
  const totalSaved = savingsEntries.reduce((s,e)=>s+e.amount,0);
  const savingsRate = totalIncome>0 ? Math.round((totalIncome-totalExpense-totalSaved)/totalIncome*100) : null;

  const byCat = {}; expenses.forEach(e=>{ byCat[e.category]=(byCat[e.category]||0)+e.amount; });
  const catList = Object.keys(byCat).sort((a,b)=>byCat[b]-byCat[a]);
  const categoryTotals = catList.map(cat=>{
    const amt = byCat[cat]; const pct = totalExpense?Math.round(amt/totalExpense*100):0;
    return {category:cat, pct, color: FIN_COLORS[cat]||'#7C8AA0'};
  });
  let donutGradient = t.surface2;
  if(categoryTotals.length){
    let acc=0; const segs=[];
    categoryTotals.forEach(c=>{ const start=acc; acc+=c.pct; segs.push(c.color+' '+start+'% '+acc+'%'); });
    if(acc<100) segs.push(t.surface2+' '+acc+'% 100%');
    donutGradient = 'conic-gradient('+segs.join(',')+')';
  }
  const legendHtml = categoryTotals.map(ct=>`
    <div style="display:flex;align-items:center;gap:6px;font-size:11px">
      <div style="width:7px;height:7px;border-radius:50%;background:${ct.color};flex-shrink:0"></div>
      <span style="color:${t.text};flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(ct.category)}</span>
      <span style="color:${t.textMuted};font-family:'JetBrains Mono',monospace">${ct.pct}%</span>
    </div>`).join('');

  const weekBuckets=[[],[],[],[],[]];
  expenses.forEach(e=>{ const day=Number(e.date.slice(8,10)); const wi=Math.min(4,Math.floor((day-1)/7)); weekBuckets[wi].push(e); });
  const weekTotalsRaw = weekBuckets.map((arr,i)=>({label:'W'+(i+1), total:arr.reduce((s,e)=>s+e.amount,0)})).filter((w,i)=> i===0 || w.total>0 || (i*7)<mi.daysInMonth);
  const maxWeek = Math.max(1, ...weekTotalsRaw.map(w=>w.total));
  const weekBarsHtml = weekTotalsRaw.map(w=>{
    const h = Math.round(w.total/maxWeek*100);
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end">
      <div style="width:100%;max-width:26px;border-radius:5px;background:#4C8DFF;height:${h}%;min-height:3px"></div>
      <span style="font-size:9px;color:${t.textMuted}">${w.label}</span>
    </div>`;
  }).join('');

  const prevMi = monthInfo(S.financeMonthOffset-1);
  const prevTotal = entriesForMonth(prevMi.key).filter(e=>e.type==='expense').reduce((s,e)=>s+e.amount,0);
  let trendDisplay = '—';
  if(prevTotal>0){ const chg=Math.round((totalExpense-prevTotal)/prevTotal*100); trendDisplay=(chg>=0?'+':'')+chg+'% vs last month'; }
  else if(totalExpense>0){ trendDisplay='new activity'; }
  const topCategoryLabel = categoryTotals[0] ? categoryTotals[0].category : null;

  const recentHtml = monthEntries.slice().sort((a,b)=>a.date<b.date?1:-1).slice(0,5).map(e=>{
    const color = e.type==='income'?'#3DDC84':e.type==='savings'?'#F2A93B':(FIN_COLORS[e.category]||'#7C8AA0');
    const amountDisplay = (e.type==='expense'?'-':'+')+fmtMoney(e.amount);
    const amountColor = e.type==='expense'?t.text:'#3DDC84';
    return `<div style="display:flex;align-items:center;gap:10px;background:${t.surface};border-radius:12px;padding:9px 12px;border:1px solid ${t.border}">
      <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0"></div>
      <div style="flex:1;min-width:0">
        <div style="font-size:12.5px;color:${t.text};font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(e.desc)}</div>
        <div style="font-size:10px;color:${t.textMuted}">${escapeHtml(e.category)} · ${e.date}</div>
      </div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:12.5px;color:${amountColor}">${amountDisplay}</div>
      <button data-act="removeExpense" data-arg="${e.id}::${encodeURIComponent(e.desc)}" style="background:none;border:none;color:${t.textMuted};font-size:14px;cursor:pointer">×</button>
    </div>`;
  }).join('');

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <button data-act="prevMonth" style="background:${t.surface};border:1px solid ${t.border};color:${t.text};width:32px;height:32px;border-radius:10px;cursor:pointer;font-size:14px">‹</button>
      <div style="font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700;color:${t.text}">${mi.label}</div>
      <button data-act="nextMonth" style="background:${t.surface};border:1px solid ${t.border};color:${t.text};width:32px;height:32px;border-radius:10px;cursor:pointer;font-size:14px">›</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
      <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border}"><div style="font-size:10px;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px">Income</div><div style="font-family:'JetBrains Mono',monospace;font-size:15px;color:#3DDC84;margin-top:4px">${fmtMoney(totalIncome)}</div></div>
      <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border}"><div style="font-size:10px;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px">Expenses</div><div style="font-family:'JetBrains Mono',monospace;font-size:15px;color:#FF6B5E;margin-top:4px">${fmtMoney(totalExpense)}</div></div>
      <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border}"><div style="font-size:10px;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px">Saved</div><div style="font-family:'JetBrains Mono',monospace;font-size:15px;color:#F2A93B;margin-top:4px">${fmtMoney(totalSaved)}</div></div>
      <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border}"><div style="font-size:10px;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px">Savings rate</div><div style="font-family:'JetBrains Mono',monospace;font-size:15px;color:${t.text};margin-top:4px">${savingsRate===null?'—':savingsRate+'%'}</div></div>
    </div>
    ${categoryTotals.length ? `
    <div style="display:flex;gap:16px;align-items:center;background:${t.surface};border-radius:16px;padding:16px;margin-bottom:16px;border:1px solid ${t.border}">
      <div style="width:110px;height:110px;border-radius:50%;background:${donutGradient};display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <div style="width:70px;height:70px;border-radius:50%;background:${t.surface};display:flex;flex-direction:column;align-items:center;justify-content:center">
          <div style="font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:700;color:${t.text}">${fmtMoney(totalExpense)}</div>
          <div style="font-size:8px;color:${t.textMuted}">TOTAL</div>
        </div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;gap:6px;min-width:0">${legendHtml}</div>
    </div>` : ''}
    <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">By week this month</div>
    <div style="display:flex;align-items:flex-end;gap:8px;height:70px;background:${t.surface};border-radius:14px;padding:12px;margin-bottom:16px;border:1px solid ${t.border}">${weekBarsHtml}</div>
    ${topCategoryLabel ? `<div style="background:${t.surface2};border-radius:14px;padding:12px 14px;margin-bottom:16px;font-size:12px;color:${t.text}">Biggest category: <span style="color:#F2A93B;font-weight:600">${escapeHtml(topCategoryLabel)}</span> · trend: <span style="font-weight:600">${trendDisplay}</span></div>` : ''}
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px">Recent</div>
      <button data-act="openLedger" style="font-size:11px;color:#F2A93B;background:none;border:none;cursor:pointer">View all →</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px">${recentHtml || `<div style="font-size:12px;color:${t.textMuted}">No entries yet this month.</div>`}</div>
    <button data-act="openAddExpense" style="position:fixed;right:26px;bottom:96px;width:52px;height:52px;border-radius:50%;background:#F2A93B;border:none;color:#0F1B2B;font-size:24px;font-weight:700;cursor:pointer;box-shadow:0 8px 20px rgba(242,169,59,0.4);z-index:15">+</button>`;
}

function renderFinanceInvesting(){
  const t = T();
  const totalInvested = S.investments.reduce((s,h)=>s+h.invested,0);
  const totalCurrentVal = S.investments.reduce((s,h)=>s+h.currentValue,0);
  const gain = totalCurrentVal-totalInvested;
  const gainPct = totalInvested>0?Math.round(gain/totalInvested*100):0;
  const maxBar = Math.max(totalInvested, totalCurrentVal, 1);
  const gainColor = gain>=0?'#3DDC84':'#FF6B5E';

  const holdingsHtml = S.investments.map(h=>{
    const g = h.currentValue-h.invested; const gp = h.invested>0?Math.round(g/h.invested*100):0;
    const hGainColor = g>=0?'#3DDC84':'#FF6B5E';
    return `<div data-act="openInvestmentDetail" data-arg="${h.id}" style="background:${t.surface};border-radius:14px;padding:12px 14px;border:1px solid ${t.border};cursor:pointer">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:13px;font-weight:600;color:${t.text}">${escapeHtml(h.name)}</span>
        <span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:${hGainColor}">${(g>=0?'+':'')+fmtMoney(g)} (${(gp>=0?'+':'')+gp}%)</span>
      </div>
      <div style="font-size:11px;color:${t.textMuted}">Invested ${fmtMoney(h.invested)} · Now ${fmtMoney(h.currentValue)} · ${escapeHtml(h.platform||'—')}</div>
    </div>`;
  }).join('');

  return `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px">
      <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border}"><div style="font-size:9.5px;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.4px">Invested</div><div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:${t.text};margin-top:4px">${fmtMoney(totalInvested)}</div></div>
      <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border}"><div style="font-size:9.5px;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.4px">Current</div><div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:${t.text};margin-top:4px">${fmtMoney(totalCurrentVal)}</div></div>
      <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border}"><div style="font-size:9.5px;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.4px">Gain/Loss</div><div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:${gainColor};margin-top:4px">${(gain>=0?'+':'')+fmtMoney(gain)}</div></div>
    </div>
    <div style="display:flex;gap:6px;height:14px;border-radius:7px;overflow:hidden;margin-bottom:20px">
      <div style="width:${Math.round(totalInvested/maxBar*100)}%;background:#4C8DFF"></div>
      <div style="width:${Math.round(totalCurrentVal/maxBar*100)}%;background:${gainColor}"></div>
    </div>
    <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Holdings</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">${holdingsHtml || `<div style="font-size:12px;color:${t.textMuted}">No holdings logged yet.</div>`}</div>
    <button data-act="openAddHolding" style="width:100%;padding:12px;border-radius:14px;background:rgba(242,169,59,0.12);border:1px dashed rgba(242,169,59,0.5);color:#F2A93B;font-size:13px;font-weight:600;cursor:pointer">+ Add holding</button>`;
}
