// ===================== CONSTANTS & DEFAULT DATA =====================

const CAT_COLORS = {habit:'#F2A93B', work:'#4C8DFF', upwork:'#9B6BFF', linkedin:'#35C4E0', cook:'#3DDC84', gym:'#FF6B5E', rest:'#4A5A72', reset:'#8B7FD8'};
const CAT_LABELS = {habit:'Habit', work:'Deep Work', upwork:'Upwork', linkedin:'LinkedIn', cook:'Cook & Eat', gym:'Workout', rest:'Break', reset:'Wind-down'};

const FIN_CATS_DEFAULT = ['Food/Groceries','Work/Business','Transport','Subscriptions','Health/Fitness','Personal/Discretionary','Other'];
const FIN_COLORS = {'Food/Groceries':'#F2A93B','Work/Business':'#4C8DFF','Transport':'#35C4E0','Subscriptions':'#9B6BFF','Health/Fitness':'#3DDC84','Personal/Discretionary':'#FF6B5E','Other':'#7C8AA0'};

const DAYTYPE_COLOR = {jog:'#4C8DFF', gym:'#FF6B5E', weekend:'#F2A93B'};
const DAYTYPE_LABEL = {jog:'Jog Day', gym:'Gym Day', weekend:'Weekend'};

const LIGHT_T = {bg:'#F5F3EF', surface:'#FFFFFF', surface2:'#ECE8E1', text:'#171B21', textMuted:'rgba(23,27,33,0.55)', border:'rgba(23,27,33,0.09)', navBg:'#FFFFFF', themeIconColor:'#F2A93B'};
const DARK_T  = {bg:'#0F1B2B', surface:'#16243A', surface2:'#1C2E48', text:'#EDEFF3', textMuted:'rgba(237,239,243,0.55)', border:'rgba(255,255,255,0.07)', navBg:'#0B1420', themeIconColor:'#7C90AE'};

const CURRENCY_INFO = {
  USD:{symbol:'$', prefix:true, decimals:2},
  XOF:{symbol:' CFA', prefix:false, decimals:0},
  NGN:{symbol:'₦', prefix:true, decimals:0}
};

// Editable habit list. Each habit is either a daily yes/no ('bool') or a daily
// numeric target ('number', e.g. Deep Work Hours). This is the DEFAULT seed only —
// the live list lives in state (S.habitDefs) so the user can add/remove/rename/reorder
// without any code change. Field names of the four defaults match legacy checkin keys
// so existing saved data keeps working after this update.
const HABIT_COLOR_POOL = ['#F2A93B','#4C8DFF','#9B6BFF','#FF6B5E','#35C4E0','#3DDC84','#FF8A65','#C792EA'];
function defaultHabitDefs(){
  return [
    {id:uid(), field:'morningPages', label:'Morning Pages', type:'bool', color:'#F2A93B'},
    {id:uid(), field:'reading', label:'Reading', type:'bool', color:'#4C8DFF'},
    {id:uid(), field:'cameraTalk', label:'Camera Talk Practice', type:'bool', color:'#9B6BFF'},
    {id:uid(), field:'workout', label:'Workout', type:'bool', color:'#FF6B5E'},
    {id:uid(), field:'deepWorkHours', label:'Deep Work Hours', type:'number', target:5, color:'#35C4E0'}
  ];
}

const SCHEDULE_DEFAULT = {
  jog: [
    {start:'05:00',end:'05:15',label:'Wake, morning pages',cat:'habit'},
    {start:'05:15',end:'05:40',label:'Reading',cat:'habit'},
    {start:'05:40',end:'05:50',label:'Camera talk practice',cat:'habit'},
    {start:'05:50',end:'07:00',label:'Buffer',cat:'rest'},
    {start:'07:00',end:'08:30',label:'Outdoor jog',cat:'gym'},
    {start:'08:30',end:'09:15',label:'Cook & eat breakfast',cat:'cook'},
    {start:'09:15',end:'11:00',label:'Work — deep block 1',cat:'work'},
    {start:'11:00',end:'11:15',label:'Break',cat:'rest'},
    {start:'11:15',end:'12:45',label:'Work — deep block 2',cat:'work'},
    {start:'12:45',end:'13:30',label:'Cook & eat lunch',cat:'cook'},
    {start:'13:30',end:'14:00',label:'Upwork (proposals/profile)',cat:'upwork'},
    {start:'14:00',end:'14:15',label:'LinkedIn post',cat:'linkedin'},
    {start:'14:15',end:'16:00',label:'Work — deep block 3',cat:'work'},
    {start:'16:00',end:'16:15',label:'Break',cat:'rest'},
    {start:'16:15',end:'17:30',label:'Work — deep block 4',cat:'work'},
    {start:'17:30',end:'18:15',label:'Cook & eat dinner',cat:'cook'},
    {start:'20:30',end:'21:00',label:'Wind-down',cat:'reset'},
    {start:'21:00',end:'21:15',label:'Lights out / Sleep',cat:'reset'}
  ],
  gym: [
    {start:'05:00',end:'05:15',label:'Wake, morning pages',cat:'habit'},
    {start:'05:15',end:'05:40',label:'Reading',cat:'habit'},
    {start:'05:40',end:'05:50',label:'Camera talk practice',cat:'habit'},
    {start:'05:50',end:'06:30',label:'Buffer',cat:'rest'},
    {start:'06:30',end:'07:15',label:'Cook & eat breakfast',cat:'cook'},
    {start:'07:15',end:'09:00',label:'Work — deep block 1',cat:'work'},
    {start:'09:00',end:'09:15',label:'Break',cat:'rest'},
    {start:'09:15',end:'10:45',label:'Work — deep block 2',cat:'work'},
    {start:'10:45',end:'11:30',label:'Upwork',cat:'upwork'},
    {start:'11:30',end:'12:15',label:'Cook & eat lunch',cat:'cook'},
    {start:'12:15',end:'14:00',label:'Work — deep block 3',cat:'work'},
    {start:'14:00',end:'14:15',label:'Break',cat:'rest'},
    {start:'14:15',end:'16:00',label:'Work — deep block 4',cat:'work'},
    {start:'16:00',end:'18:00',label:'Gym',cat:'gym'},
    {start:'18:00',end:'18:45',label:'Cook & eat dinner',cat:'cook'},
    {start:'20:30',end:'21:00',label:'Wind-down',cat:'reset'},
    {start:'21:00',end:'21:15',label:'Lights out / Sleep',cat:'reset'}
  ],
  weekend: [
    {start:'05:00',end:'05:50',label:'Wake, morning pages, reading, camera talk',cat:'habit'},
    {start:'07:00',end:'08:30',label:'Longer/relaxed workout',cat:'gym'},
    {start:'08:30',end:'09:15',label:'Cook & eat breakfast',cat:'cook'},
    {start:'09:15',end:'12:00',label:'Free / errands / rest',cat:'rest'},
    {start:'12:00',end:'12:45',label:'Cook & eat lunch',cat:'cook'},
    {start:'13:00',end:'14:00',label:'Optional light Upwork catch-up',cat:'upwork'},
    {start:'14:00',end:'14:15',label:'LinkedIn post if not done twice this week',cat:'linkedin'},
    {start:'18:00',end:'18:45',label:'Cook & eat dinner',cat:'cook'},
    {start:'18:45',end:'20:30',label:'Unstructured protected evening',cat:'rest'},
    {start:'20:30',end:'21:00',label:'Wind-down',cat:'reset'},
    {start:'21:00',end:'21:15',label:'Lights out / Sleep',cat:'reset'}
  ]
};

const READING_DEFAULT = [
  {title:'Psychology of Money', author:'Morgan Housel', status:'in_progress', progressPct:35},
  {title:'Atomic Habits', author:'James Clear', status:'not_started', progressPct:0},
  {title:'Never Split the Difference', author:'Chris Voss', status:'not_started', progressPct:0},
  {title:'The Charisma Myth', author:'Olivia Fox Cabane', status:'not_started', progressPct:0},
  {title:'Talk Like TED', author:'Carmine Gallo', status:'not_started', progressPct:0},
  {title:'Influence', author:'Robert Cialdini', status:'not_started', progressPct:0},
  {title:'To Sell Is Human', author:'Daniel Pink', status:'not_started', progressPct:0},
  {title:'The 48 Laws of Power', author:'Robert Greene', status:'not_started', progressPct:0},
  {title:'The Almanack of Naval Ravikant', author:'Eric Jorgenson', status:'not_started', progressPct:0}
];

// ---- small date/format helpers shared across app.js ----
function uid(){ return Math.random().toString(36).slice(2,9); }
function pad2(n){ return n<10 ? '0'+n : ''+n; }
function dateKey(d){ return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()); }
function addDays(d,n){ const r=new Date(d); r.setDate(r.getDate()+n); return r; }
function addMonths(d,n){ const r=new Date(d); r.setMonth(r.getMonth()+n); return r; }
function dayType(d){ const w=d.getDay(); if(w===2||w===4) return 'jog'; if(w===1||w===3||w===5) return 'gym'; return 'weekend'; }
function timeToMin(t){ const p=t.split(':'); return Number(p[0])*60+Number(p[1]); }
function mondayOf(d){ const r=new Date(d); const w=r.getDay(); const diff=(w===0?-6:1-w); r.setDate(r.getDate()+diff); return r; }
function monthKeyOf(dateStr){ return dateStr.slice(0,7); }
function daysBetween(a,b){ if(!a||!b) return null; return Math.max(0, Math.round((new Date(b)-new Date(a))/86400000)); }
function fmtMoneyFor(n,cur){
  const info = CURRENCY_INFO[cur] || CURRENCY_INFO.USD;
  const v = Number(n)||0;
  const abs = Math.abs(v);
  const formatted = abs.toLocaleString('en-US',{minimumFractionDigits:info.decimals, maximumFractionDigits:info.decimals});
  const sign = v<0 ? '-' : '';
  return info.prefix ? sign+info.symbol+formatted : sign+formatted+info.symbol;
}
function escapeHtml(s){
  return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function cloneSchedule(){
  const out = {};
  Object.keys(SCHEDULE_DEFAULT).forEach(k=>{ out[k] = SCHEDULE_DEFAULT[k].map(b=>({id:uid(), ...b})); });
  return out;
}
function defaultReadingList(){
  return READING_DEFAULT.map((b,i)=>({id:uid(), order:i, startedDate: b.status==='in_progress'?dateKey(addDays(new Date(),-14)):null, finishedDate:null, ...b}));
}
