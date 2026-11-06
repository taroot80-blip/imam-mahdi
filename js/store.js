'use strict';
const store={
  get(k,d){try{const v=localStorage.getItem('mst.'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem('mst.'+k,JSON.stringify(v))}catch(e){}},
  list(k){return store.get(k,[])},
  toggle(k,id){const a=store.list(k),i=a.indexOf(id);if(i<0)a.unshift(id);else a.splice(i,1);store.set(k,a);return i<0},
  has(k,id){return store.list(k).includes(id)},
  exportAll(){const o={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('mst.'))o[k]=localStorage.getItem(k)}}catch(e){}return JSON.stringify(o,null,1)},
  importAll(s){const o=JSON.parse(s);Object.keys(o).forEach(k=>{if(k.startsWith('mst.'))localStorage.setItem(k,o[k])})},
};
const AR=new Intl.NumberFormat('ar-SA-u-nu-arab',{useGrouping:true});
const ar=n=>AR.format(n);
const ar2=n=>new Intl.NumberFormat('ar-SA-u-nu-arab',{minimumIntegerDigits:2,useGrouping:false}).format(n);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm=s=>String(s||'').replace(/[ً-ْٰـ]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/ة/g,'ه').replace(/ک/g,'ك').replace(/ی/g,'ي').toLowerCase();
const tamyeez=(n,one,two,few,many)=>n===0?`صفر ${many}`:n===1?one:n===2?two:(n%100>=3&&n%100<=10)?`${ar(n)} ${few}`:`${ar(n)} ${many}`;
const months=n=>tamyeez(n,'شهر واحد','شهران','أشهر','شهرًا');
const dayz=n=>tamyeez(n,'يوم واحد','يومان','أيام','يومًا');
