// ===================== ICONS =====================
// Small, dependency-free stroke-icon set (Feather-style). Usage:
//   icon('calendar', {size:18, color:'#F2A93B'})
// Every icon shares a 24x24 viewBox so they line up regardless of which is used.

const ICON_PATHS = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9.5a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
  calendarPlus: '<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17M12 13.5v6M9 16.5h6"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  wallet: '<path d="M3 7.5a2 2 0 0 1 2-2h13a1.5 1.5 0 0 1 1.5 1.5V9"/><path d="M3 7.5V18a2 2 0 0 0 2 2h14a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 19 9H6a2 2 0 0 1-2-2Z"/><circle cx="16.5" cy="14" r="1.25"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  edit: '<path d="M4 20h4.2L19.8 8.4a1.7 1.7 0 0 0 0-2.4l-1.8-1.8a1.7 1.7 0 0 0-2.4 0L4 15.8Z"/><path d="M13.5 6.5l4 4"/>',
  trash: '<path d="M4.5 7h15M9 7V5.2A1.2 1.2 0 0 1 10.2 4h3.6A1.2 1.2 0 0 1 15 5.2V7M18.5 7l-.8 12a2 2 0 0 1-2 1.9H8.3a2 2 0 0 1-2-1.9L5.5 7"/><path d="M10 11v6M14 11v6"/>',
  bell: '<path d="M6 10a6 6 0 0 1 12 0c0 4.2 1.4 5.8 2 6.5H4c.6-.7 2-2.3 2-6.5Z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  chevronLeft: '<path d="M14.5 5 8 12l6.5 7"/>',
  chevronRight: '<path d="M9.5 5 16 12l-6.5 7"/>',
  book: '<path d="M12 6.5c-1.4-1.2-3.6-1.7-6.5-1.7v13c2.9 0 5.1.5 6.5 1.7 1.4-1.2 3.6-1.7 6.5-1.7v-13c-2.9 0-5.1.5-6.5 1.7Z"/><path d="M12 6.5v13"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.2M12 18.3v2.2M4.6 7l1.9 1.1M17.5 15.9l1.9 1.1M3.5 12h2.2M18.3 12h2.2M4.6 17l1.9-1.1M17.5 8.1l1.9-1.1"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 3v2.2M12 18.8V21M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M3 12h2.2M18.8 12H21M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"/>',
  moon: '<path d="M20 13.7A8.4 8.4 0 1 1 10.3 4a6.7 6.7 0 0 0 9.7 9.7Z"/>',
  check: '<path d="M5 13l4.5 4.5L19 8"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  briefcase: '<rect x="3" y="7.5" width="18" height="12" rx="2"/><path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M3 12.5h18"/>',
  activity: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
  coffee: '<path d="M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 5.5c-.6.6-.6 1 0 1.6M11.5 5.5c-.6.6-.6 1 0 1.6"/>',
  refresh: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 12a8 8 0 0 1-13.7 5.6L4 15.5"/><path d="M20 4v4.5h-4.5M4 20v-4.5H8.5"/>',
  download: '<path d="M12 4v11.5M7.5 11.5 12 16l4.5-4.5"/><path d="M4.5 17.5V19a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-1.5"/>',
  upload: '<path d="M12 20V8.5M7.5 12.5 12 8l4.5 4.5"/><path d="M4.5 17.5V19a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-1.5"/>',
  arrowRight: '<path d="M4 12h16M14 6l6 6-6 6"/>',
  flag: '<path d="M6 3v18"/><path d="M6 4.5c2.4-1.5 4.8-1.5 7 0s4.6 1.5 6 0v9c-1.4 1.5-3.8 1.5-6 0s-4.6-1.5-7 0Z"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
  trending: '<path d="M4 16.5 10 10l4 4 6-7"/><path d="M15.5 6.5H20V11"/>',
  layers: '<path d="M12 3.5 21 8l-9 4.5L3 8Z"/><path d="m3 12 9 4.5L21 12M3 16l9 4.5L21 16"/>',
  bookmark: '<path d="M6 3.5h12v17l-6-3.6-6 3.6Z"/>',
  linkedin: '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M7.7 10v6.3M7.7 7.4v.1M11.4 16.3V10M11.4 12.7c0-1.5 1-2.7 2.4-2.7 1.6 0 2.2 1.1 2.2 2.8v3.5"/>',
  dumbbell: '<path d="M2.5 12h2M19.5 12h2M4.5 9v6M19.5 9v6M7 8v8M17 8v8M7 12h10"/>',
};

function icon(name, opts){
  opts = opts || {};
  const size = opts.size || 18;
  const color = opts.color || 'currentColor';
  const stroke = opts.stroke != null ? opts.stroke : 1.8;
  const path = ICON_PATHS[name] || '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex-shrink:0">${path}</svg>`;
}
