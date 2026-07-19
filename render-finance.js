// ===================== RENDER: Finance =====================

const CUR_LIST = ['XOF','USD','NGN'];

function renderFinance(){
  const t = T();
  const modeTabsHtml = `
    <button data-act="setModeSpending" style="flex:1;padding:9px;border-radius:12px;background:${S.financeMode==='spending'?'#F2A93B22':t.surface};border:1px solid ${t.border};color:${S.financeMode==='spending'?'#F2A93B':t.textMuted};font-size:12px;font-weight:600;cursor:pointer">Spending</button>
    <button data-act="setModeInvesting" style="flex:1;padding:9px;border-radius:12px;background:${S.financeMode==='investing'?'#F2A93B22':t.surface};border:1px solid ${t.border};color:${S.financeMode==='investing'?'#F2A93B':t.textMuted};font-size:12px;font-weight:600;cursor:pointer">Investments</button>`;

  return `
  <div style="padding:20px 20px 110px;animation:lu-fadein 0.35s ease">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:${t.text}">Finance</div>
      ${S.financeMode==='spending' ? `<button data-act="openFinanceSettings" style="background:${t.surface};border:1px solid ${t.border};color:${t.text};width:32px;height:32px;border-radius:10px;cursor:pointer;font-size:14px">⚙</button>` : ''}
    </div>
    <div style="display:flex;gap:8px;margin-bottom:12px">${modeTabsHtml}</div>
    ${S.financeMode==='spending' ? renderFinanceSpending() : renderFinanceInvesting()}
  </div>`;
}

function currencyPills(activeVal, actionName){
  const t = T();
  return `<div style="display:flex;gap:6px;margin-bottom:16px">${CUR_LIST.map(c=>`
    <button data-act="${actionName}" data-arg="${c}" style="padding:6px 14px;border-radius:20px;background:${activeVal===c?'#4C8DFF22':t.surface};border:1px solid ${activeVal===c?'#4C8DFF66':t.border};color:${activeVal===c?'#4C8DFF':t.textMuted};font-size:11.5px;font-weight:600;cursor:pointer">${c}</button>`).join('')}</div>`;
}

function insightCard(ins){
  const t = T();
  const colors = {warn:'#F2A93B', over:'#FF6B5E', good:'#3DDC84'};
  const c = colors[ins.type] || t.textMuted;
  return `<div style="display:flex;align-items:flex-start;gap:9px;background:${t.surface};border-radius:12px;padding:10px 12px;border:1px solid ${t.border}">
    <div style="width:7px;height:7px;border-radius:50%;background:${c};margin-top:4px;flex-shrink:0"></div>
    <div style="font-size:12px;color:${t.text};line-height:1.4">${escapeHtml(ins.text)}</div>
  </div>`;
}

function renderFinanceSpending(){
  const t = T();
  const cur = S.financeCurrencyView;
  const mi = monthInfo(S.financeMonthOffset);
  const monthEntries = entriesForMonthCur(mi.key, cur);
  const expenses = monthEntries.filter(e=>e.type==='expense');
  const income = monthEntries.filter(e=>e.type==='income');
  const savingsEntries = monthEntries.filter(e=>e.type==='savings');
  const totalExpense = expenses.reduce((s,e)=>s+e.amount,0);
  const totalIncome = income.reduce((s,e)=>s+e.amount,0);
  const totalSaved = savingsEntries.reduce((s,e)=>s+e.amount,0);
  const savingsRate = totalIncome>0 ? Math.round((totalIncome-totalExpense-totalSaved)/totalIncome*100) : null;
  const fmt = (n)=>fmtMoneyFor(n, cur);

  const byCat = {}; expenses.forEach(e=>{ byCat[e.category]=(byCat[e.category]||0)+e.amount; });
  const catList = Object.keys(byCat).sort((a,b)=>byCat[b]-byCat[a]);
  const categoryTotals = catList.map(cat=>{
    const amt = byCat[cat]; const pct = totalExpense?Math.round(amt/totalExpense*100):0;
    return {category:cat, amt, pct, color: FIN_COLORS[cat]||'#7C8AA0'};
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

  // ---- budget summary ----
  const budgets = budgetsForMonth(cur, mi.key);
  const totalBudget = Object.values(budgets).reduce((s,v)=>s+(v||0),0);
  const balance = totalBudget - totalExpense;
  const hasBudgets = Object.keys(budgets).length>0;

  const budgetRowsHtml = catList.map(cat=>{
    const budget = budgets[cat];
    if(budget==null) return '';
    const spent = byCat[cat];
    const pct = Math.min(100, Math.round(spent/budget*100));
    const over = spent>budget;
    return `<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:4px">
        <span style="color:${t.text}">${escapeHtml(cat)}</span>
        <span style="font-family:'JetBrains Mono',monospace;color:${over?'#FF6B5E':t.textMuted}">${fmt(spent)} / ${fmt(budget)}</span>
      </div>
      <div style="height:6px;border-radius:3px;background:${t.surface2};overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${over?'#FF6B5E':'#F2A93B'}"></div>
      </div>
    </div>`;
  }).join('');

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

  const insights = computeInsights(cur, S.financeMonthOffset);
  const insightsHtml = insights.length ? insights.map(insightCard).join('') : `<div style="font-size:12px;color:${t.textMuted}">No notable patterns yet — keep logging and insights will show up here.</div>`;

  const recentHtml = monthEntries.slice().sort((a,b)=>a.date<b.date?1:-1).slice(0,5).map(e=>{
    const color = e.type==='income'?'#3DDC84':e.type==='savings'?'#F2A93B':(FIN_COLORS[e.category]||'#7C8AA0');
    const amountDisplay = (e.type==='expense'?'-':'+')+fmt(e.amount);
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
    ${currencyPills(cur, 'setFinanceCurrencyView')}
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <button data-act="prevMonth" style="background:${t.surface};border:1px solid ${t.border};color:${t.text};width:32px;height:32px;border-radius:10px;cursor:pointer;font-size:14px">‹</button>
      <div style="font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700;color:${t.text}">${mi.label}</div>
      <button data-act="nextMonth" style="background:${t.surface};border:1px solid ${t.border};color:${t.text};width:32px;height:32px;border-radius:10px;cursor:pointer;font-size:14px">›</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border}"><div style="font-size:10px;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px">Income</div><div style="font-family:'JetBrains Mono',monospace;font-size:15px;color:#3DDC84;margin-top:4px">${fmt(totalIncome)}</div></div>
      <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border}"><div style="font-size:10px;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px">Expenses</div><div style="font-family:'JetBrains Mono',monospace;font-size:15px;color:#FF6B5E;margin-top:4px">${fmt(totalExpense)}</div></div>
      <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border}"><div style="font-size:10px;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px">Saved</div><div style="font-family:'JetBrains Mono',monospace;font-size:15px;color:#F2A93B;margin-top:4px">${fmt(totalSaved)}</div></div>
      <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border}"><div style="font-size:10px;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px">Savings rate</div><div style="font-family:'JetBrains Mono',monospace;font-size:15px;color:${t.text};margin-top:4px">${savingsRate===null?'—':savingsRate+'%'}</div></div>
    </div>

    ${hasBudgets ? `
    <div style="background:${t.surface2};border-radius:16px;padding:14px 16px;margin-bottom:16px;border:1px solid ${t.border}">
      <div style="display:flex;justify-content:space-between;margin-bottom:10px">
        <div><div style="font-size:9.5px;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px">Total budget</div><div style="font-family:'JetBrains Mono',monospace;font-size:14px;color:${t.text};margin-top:3px">${fmt(totalBudget)}</div></div>
        <div><div style="font-size:9.5px;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px">Spent</div><div style="font-family:'JetBrains Mono',monospace;font-size:14px;color:#FF6B5E;margin-top:3px">${fmt(totalExpense)}</div></div>
        <div style="text-align:right"><div style="font-size:9.5px;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px">Balance</div><div style="font-family:'JetBrains Mono',monospace;font-size:14px;color:${balance>=0?'#3DDC84':'#FF6B5E'};margin-top:3px">${fmt(balance)}</div></div>
      </div>
      <div style="height:8px;border-radius:4px;background:${t.surface};overflow:hidden;margin-bottom:12px">
        <div style="height:100%;width:${Math.min(100,Math.round(totalExpense/Math.max(1,totalBudget)*100))}%;background:${balance>=0?'#F2A93B':'#FF6B5E'}"></div>
      </div>
      ${budgetRowsHtml}
    </div>` : `<div data-act="openFinanceSettings" style="background:${t.surface2};border-radius:14px;padding:12px 14px;margin-bottom:16px;font-size:11.5px;color:${t.textMuted};cursor:pointer;border:1px dashed ${t.border}">No budgets set for ${cur} this month — tap the ⚙ to add some and see your balance here.</div>`}

    <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Insights</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">${insightsHtml}</div>

    ${categoryTotals.length ? `
    <div style="display:flex;gap:16px;align-items:center;background:${t.surface};border-radius:16px;padding:16px;margin-bottom:16px;border:1px solid ${t.border}">
      <div style="width:110px;height:110px;border-radius:50%;background:${donutGradient};display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <div style="width:70px;height:70px;border-radius:50%;background:${t.surface};display:flex;flex-direction:column;align-items:center;justify-content:center">
          <div style="font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;color:${t.text}">${fmt(totalExpense)}</div>
          <div style="font-size:8px;color:${t.textMuted}">TOTAL</div>
        </div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;gap:6px;min-width:0">${legendHtml}</div>
    </div>` : ''}
    <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">By week this month</div>
    <div style="display:flex;align-items:flex-end;gap:8px;height:70px;background:${t.surface};border-radius:14px;padding:12px;margin-bottom:16px;border:1px solid ${t.border}">${weekBarsHtml}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px">Recent</div>
      <button data-act="openLedger" style="font-size:11px;color:#F2A93B;background:none;border:none;cursor:pointer">View all →</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px">${recentHtml || `<div style="font-size:12px;color:${t.textMuted}">No ${cur} entries yet this month.</div>`}</div>
    <button data-act="openAddExpense" style="position:fixed;right:26px;bottom:96px;width:52px;height:52px;border-radius:50%;background:#F2A93B;border:none;color:#0F1B2B;font-size:24px;font-weight:700;cursor:pointer;box-shadow:0 8px 20px rgba(242,169,59,0.4);z-index:15">+</button>`;
}

function renderFinanceInvesting(){
  const t = T();
  const cur = S.investCurrencyView;
  const fmt = (n)=>fmtMoneyFor(n, cur);
  const filtered = S.investments.filter(h=>(h.currency||'USD')===cur);
  const totalInvested = filtered.reduce((s,h)=>s+h.invested,0);
  const totalCurrentVal = filtered.reduce((s,h)=>s+h.currentValue,0);
  const gain = totalCurrentVal-totalInvested;
  const maxBar = Math.max(totalInvested, totalCurrentVal, 1);
  const gainColor = gain>=0?'#3DDC84':'#FF6B5E';

  const holdingsHtml = filtered.map(h=>{
    const g = h.currentValue-h.invested; const gp = h.invested>0?Math.round(g/h.invested*100):0;
    const hGainColor = g>=0?'#3DDC84':'#FF6B5E';
    return `<div data-act="openInvestmentDetail" data-arg="${h.id}" style="background:${t.surface};border-radius:14px;padding:12px 14px;border:1px solid ${t.border};cursor:pointer">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:13px;font-weight:600;color:${t.text}">${escapeHtml(h.name)}</span>
        <span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:${hGainColor}">${(g>=0?'+':'')+fmt(g)} (${(gp>=0?'+':'')+gp}%)</span>
      </div>
      <div style="font-size:11px;color:${t.textMuted}">Invested ${fmt(h.invested)} · Now ${fmt(h.currentValue)} · ${escapeHtml(h.platform||'—')}</div>
    </div>`;
  }).join('');

  return `
    ${currencyPills(cur, 'setInvestCurrencyView')}
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px">
      <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border}"><div style="font-size:9.5px;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.4px">Invested</div><div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:${t.text};margin-top:4px">${fmt(totalInvested)}</div></div>
      <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border}"><div style="font-size:9.5px;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.4px">Current</div><div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:${t.text};margin-top:4px">${fmt(totalCurrentVal)}</div></div>
      <div style="background:${t.surface};border-radius:14px;padding:12px;border:1px solid ${t.border}"><div style="font-size:9.5px;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.4px">Gain/Loss</div><div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:${gainColor};margin-top:4px">${(gain>=0?'+':'')+fmt(gain)}</div></div>
    </div>
    <div style="display:flex;gap:6px;height:14px;border-radius:7px;overflow:hidden;margin-bottom:20px">
      <div style="width:${Math.round(totalInvested/maxBar*100)}%;background:#4C8DFF"></div>
      <div style="width:${Math.round(totalCurrentVal/maxBar*100)}%;background:${gainColor}"></div>
    </div>
    <div style="font-size:11px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Holdings (${cur})</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">${holdingsHtml || `<div style="font-size:12px;color:${t.textMuted}">No ${cur} holdings logged yet.</div>`}</div>
    <button data-act="openAddHolding" style="width:100%;padding:12px;border-radius:14px;background:rgba(242,169,59,0.12);border:1px dashed rgba(242,169,59,0.5);color:#F2A93B;font-size:13px;font-weight:600;cursor:pointer">+ Add holding</button>`;
}
