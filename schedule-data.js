// All times 24h "HH:MM". category drives color coding.
const SCHEDULES = {
  tuethu: [
    ["05:00","05:15","Wake, morning pages","habit"],
    ["05:15","05:40","Reading","habit"],
    ["05:40","05:50","Camera talk practice","habit"],
    ["05:50","07:00","Buffer — prep / light admin","rest"],
    ["07:00","08:30","Outdoor jog","habit"],
    ["08:30","09:15","Cook & eat breakfast","cook"],
    ["09:15","11:00","Work — deep block 1","work"],
    ["11:00","11:15","Break","rest"],
    ["11:15","12:45","Work — deep block 2","work"],
    ["12:45","13:30","Cook & eat lunch","cook"],
    ["13:30","14:00","Upwork — proposals / profile","upwork"],
    ["14:00","14:15","LinkedIn post","linkedin"],
    ["14:15","16:00","Work — deep block 3","work"],
    ["16:00","16:15","Break","rest"],
    ["16:15","17:30","Work — deep block 4","work"],
    ["17:30","18:15","Cook & eat dinner","cook"],
    ["20:30","21:00","Wind-down — no screens, dim lights, journal note","reset"],
    ["21:00","21:15","Lights out / Sleep","reset"],
  ],
  monwedfri: [
    ["05:00","05:15","Wake, morning pages","habit"],
    ["05:15","05:40","Reading","habit"],
    ["05:40","05:50","Camera talk practice","habit"],
    ["05:50","06:30","Buffer — prep / light admin","rest"],
    ["06:30","07:15","Cook & eat breakfast","cook"],
    ["07:15","09:00","Work — deep block 1","work"],
    ["09:00","09:15","Break","rest"],
    ["09:15","10:45","Work — deep block 2","work"],
    ["10:45","11:30","Upwork — proposals / profile","upwork"],
    ["11:30","12:15","Cook & eat lunch","cook"],
    ["12:15","14:00","Work — deep block 3","work"],
    ["14:00","14:15","Break","rest"],
    ["14:15","16:00","Work — deep block 4","work"],
    ["16:00","18:00","Gym","gym"],
    ["18:00","18:45","Cook & eat dinner","cook"],
    ["20:30","21:00","Wind-down — no screens, dim lights, journal note","reset"],
    ["21:00","21:15","Lights out / Sleep","reset"],
  ],
  weekend: [
    ["05:00","05:15","Wake, morning pages","habit"],
    ["05:15","05:40","Reading","habit"],
    ["05:40","05:50","Camera talk practice","habit"],
    ["07:00","08:30","Longer / relaxed workout","habit"],
    ["08:30","09:15","Cook & eat breakfast","cook"],
    ["09:15","12:00","Free / errands / rest","rest"],
    ["12:00","12:45","Cook & eat lunch","cook"],
    ["12:45","16:00","Optional light Upwork catch-up","upwork"],
    ["16:00","16:30","LinkedIn post if not done twice this week","linkedin"],
    ["18:00","18:45","Cook & eat dinner","cook"],
    ["18:45","20:30","Fully unstructured — protected, no work","rest"],
    ["20:30","21:00","Wind-down — no screens, dim lights, journal note","reset"],
    ["21:00","21:15","Lights out / Sleep","reset"],
  ],
};

const CATEGORY_LABELS = {
  habit:"Habit", work:"Work", upwork:"Upwork", linkedin:"LinkedIn",
  cook:"Cook", gym:"Gym", rest:"Rest", reset:"Reset"
};

const READING_LIST = [
  {order:0, title:"Psychology of Money — Morgan Housel", slot:"Primary", status:"in-progress"},
  {order:1, title:"Atomic Habits — James Clear", slot:"Primary", status:"not-started"},
  {order:2, title:"Never Split the Difference — Chris Voss", slot:"Primary", status:"not-started"},
  {order:3, title:"The Charisma Myth — Olivia Fox Cabane", slot:"Primary", status:"not-started"},
  {order:4, title:"Talk Like TED — Carmine Gallo", slot:"Primary", status:"not-started"},
  {order:5, title:"Influence — Robert Cialdini", slot:"Primary", status:"not-started"},
  {order:6, title:"To Sell Is Human — Daniel Pink", slot:"Primary", status:"not-started"},
  {order:7, title:"The 48 Laws of Power — Robert Greene", slot:"Primary", status:"not-started"},
  {order:8, title:"The Almanack of Naval Ravikant — Eric Jorgenson", slot:"Optional / Evening", status:"not-started"},
];

// day-of-week (0=Sun..6=Sat) -> schedule key
function scheduleKeyForDay(dow){
  if(dow===2||dow===4) return "tuethu";
  if(dow===1||dow===3||dow===5) return "monwedfri";
  return "weekend";
}

const HABITS = [
  {key:"morningPages", name:"Morning Pages", type:"bool"},
  {key:"reading", name:"Reading", type:"bool"},
  {key:"cameraTalk", name:"Camera Talk", type:"bool"},
  {key:"workout", name:"Workout", type:"bool"},
  {key:"deepWorkHrs", name:"Deep Work Hours", type:"number", max:10},
  {key:"linkedin", name:"LinkedIn Post", type:"bool"},
];
