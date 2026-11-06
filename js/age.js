// حساب عمره الشريف. نقطة البدء: فجر الجمعة 15 شعبان 255هـ بسامراء
// = الجمعة 29 يوليو 869م (تقويم يولياني)، JDN 2038670، الفجر نحو 04:00 بالتوقيت الشمسي لسامراء (01:04 UT)
(function(root){
'use strict';
const BIRTH_JDN=2038670;
const BIRTH_MS=(BIRTH_JDN-0.5-2440587.5)*864e5+64*6e4;
const BIRTH_H={y:255,m:8,d:15};
const DAWN_H=4, TZ_H=3; // يوم العمر يبدأ 04:00 بتوقيت الكويت
const MEAN_SOLAR=365.2425*864e5;

function tabular(ts){ // هجري حسابي احتياطي
  const jd=Math.floor(ts/864e5+2440587.5+0.5);
  const l=jd-1948440+10632,n=Math.floor((l-1)/10631),l2=l-10631*n+354;
  const j=Math.floor((10985-l2)/5316)*Math.floor((50*l2)/17719)+Math.floor(l2/5670)*Math.floor((43*l2)/15238);
  const l3=l2-Math.floor((30-j)/15)*Math.floor((17719*j)/50)-Math.floor(j/16)*Math.floor((15238*j)/43)+29;
  const m=Math.floor((24*l3)/709),d=l3-Math.floor((709*m)/24),y=30*n+j-30;
  return {y,m,d};
}
function hijriOf(ts){
  try{
    const p=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn',{timeZone:'UTC',day:'numeric',month:'numeric',year:'numeric'}).formatToParts(new Date(ts));
    const g=t=>parseInt(p.find(x=>x.type===t).value,10);
    const r={y:g('year'),m:g('month'),d:g('day')};
    if(r.y>1000&&r.m>0)return r;
  }catch(e){}
  return tabular(ts);
}
function age(ts){
  ts=ts===undefined?Date.now():ts;
  const local=ts+(TZ_H-DAWN_H)*36e5;           // منزاح بحيث يتبدّل اليوم عند الفجر
  const dayMs=((local%864e5)+864e5)%864e5;
  const h=hijriOf(local-dayMs+12*36e5);
  let d=h.d-BIRTH_H.d,m=h.m-BIRTH_H.m,y=h.y-BIRTH_H.y;
  if(d<0){d+=30;m-=1}
  if(m<0){m+=12;y-=1}
  const ms=ts-BIRTH_MS;
  return {years:y,months:m,days:d,hours:Math.floor(dayMs/36e5),minutes:Math.floor(dayMs/6e4)%60,seconds:Math.floor(dayMs/1e3)%60,
    totalDays:Math.floor(ms/864e5),totalHours:Math.floor(ms/36e5),totalMinutes:Math.floor(ms/6e4),totalSeconds:Math.floor(ms/1e3),
    solarYears:ms/MEAN_SOLAR,hijri:h};
}
const api={age,hijriOf,tabular,BIRTH_MS,BIRTH_JDN};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Age=api;
})(typeof window!=='undefined'?window:globalThis);
