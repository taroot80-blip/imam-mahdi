// المتون الكاملة لقسم «البحوث والمقارنات»: تُحمَّل من الشبكة عند اختيار نطاقها، وتُحفظ في الجهاز لتعمل بعدها دون إنترنت.
// المصدر: ثقلين thaqalayn.net. الفهرس الصغير في data/corpus.js، والمتون في مجلد corpus/ خارج نسخة أندرويد.
'use strict';
const Corpus=(()=>{
  const REPO='taroot80-blip/imam-mahdi';
  const bases=()=>{const local=/github\.io$|^localhost$|^127\./.test(location.hostname)?['corpus/']:[];
    return local.concat([`https://cdn.jsdelivr.net/gh/${REPO}@main/corpus/`,`https://raw.githubusercontent.com/${REPO}/main/corpus/`])};
  const CACHE='mastoor-corpus-1';
  // نطاقات المصادر: ما يحتاج الشبكة يُعلَّم net، وما لم يُفهرس بعد يُعلَّم ext (بحث خارجي)
  const SOURCES=[
    {k:'four',t:'الكتب الأربعة',d:'الكافي، الفقيه، التهذيب',net:true,books:()=>CORPUS.filter(b=>b.g==='four').map(b=>b.k),missing:['الاستبصار كاملًا','التهذيب: الأجزاء ٥–١٠']},
    {k:'kafi',t:'الكافي وحده',d:'بأجزائه الثمانية وتقييم المجلسي',net:true,books:()=>['kafi']},
    {k:'ghayba',t:'كتب الغيبة',d:'كمال الدين والغيبتان والإمامة والتبصرة',net:true,books:()=>CORPUS.filter(b=>b.g==='ghayba').map(b=>b.k)},
    {k:'bihar',t:'بحار الأنوار',d:'قيد الفهرسة: يُبحث فيه على المكتبات',net:true,ext:true,books:()=>[]},
    {k:'corpus',t:'كل الكتب المفهرسة',d:`${CORPUS.length} كتابًا من المصادر الحديثية`,net:true,books:()=>CORPUS.map(b=>b.k)},
    {k:'app',t:'نصوص التطبيق',d:'الموثقة، دون إنترنت',net:false,books:()=>[]},
    {k:'all',t:'الكل',d:'الكتب المفهرسة ونصوص التطبيق: للمقارنة بين العصور',net:true,books:()=>CORPUS.map(b=>b.k),withApp:true},
  ];
  const ROWS={},UNITS={};
  const meta=k=>CORPUS.find(b=>b.k===k);
  const loaded=k=>!!ROWS[k];
  const sizeMB=keys=>keys.filter(k=>!loaded(k)).reduce((s,k)=>s+meta(k).kb,0)/1024;
  async function fetchOne(k){const name=k+'.json';let c=null;
    try{c=await caches.open(CACHE);const hit=await c.match(name);if(hit)return await hit.json()}catch(e){}
    if(navigator.onLine===false)throw Object.assign(new Error('offline'),{offline:true});
    let last;for(const b of bases()){try{const r=await fetch(b+name,{mode:'cors'});if(!r.ok)throw new Error(r.status);const j=await r.clone().json();
        try{c&&await c.put(name,new Response(JSON.stringify(j),{headers:{'content-type':'application/json'}}))}catch(e){}return j}catch(e){last=e}}
    throw Object.assign(new Error('net'),{offline:navigator.onLine===false,cause:last})}
  async function ensure(keys,onProg){let done=0;onProg&&onProg(0,keys.length);
    for(const k of keys){if(!ROWS[k]){const j=await fetchOne(k);ROWS[k]=j.h}done++;onProg&&onProg(done,keys.length,k)}}
  async function cached(){try{const c=await caches.open(CACHE);const ks=await c.keys();return ks.map(r=>r.url.split('/').pop().replace('.json',''))}catch(e){return[]}}
  async function clear(){try{await caches.delete(CACHE)}catch(e){}Object.keys(ROWS).forEach(k=>delete ROWS[k]);Object.keys(UNITS).forEach(k=>delete UNITS[k])}
  // تقييم المجلسي (مرآة العقول) مصنَّفًا بأول كلمة
  const MAJ=[['sahih','صحيح','#22C55E'],['hasan','حسن','#14B8A6'],['muwathaq','موثق','#38BDF8'],['daif','ضعيف','#EF4444'],['majhul','مجهول','#FB923C'],['mursal','مرسل','#A78BFA'],['marfu','مرفوع','#F472B6'],['other','تقييم آخر','#E0B050'],['none','بلا تقييم','#6b5d4a']];
  function majClass(s){s=String(s||'').trim();if(!s)return'none';const w=[['صحيح','sahih'],['حسن','hasan'],['موثق','muwathaq'],['ضعيف','daif'],['مجهول','majhul'],['مرسل','mursal'],['مرفوع','marfu']].find(([a])=>s.startsWith(a));return w?w[1]:'other'}
  function units(k){if(UNITS[k])return UNITS[k];const b=meta(k),rows=ROWS[k]||[];
    return UNITS[k]=rows.map((r,i)=>{const no=String(r[1]).split('/').pop();return{id:'c:'+k+':'+i,title:`${b.t}${b.v>1?` ج${ar(r[0])}`:''} · حديث ${ar(+no||i+1)}`,raw:r[2],body:r[2],book:b.t,bk:k,author:b.a,death:b.d,
      era:Lab.eraOf(b.d),cent:Math.ceil(b.d/100),stype:'hadith',grade:'M'+majClass(r[3]),maj:r[3],beh:r[4]==='صحيح',moh:r[5],door:null,section:`ج${ar(r[0])}`,vol:r[0],url:'https://thaqalayn.net/hadith/'+r[1],hasText:true,corpus:true}})}
  return{SOURCES,MAJ,meta,loaded,sizeMB,ensure,units,cached,clear,majClass,source:k=>SOURCES.find(s=>s.k===k)}
})();
