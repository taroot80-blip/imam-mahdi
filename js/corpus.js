// المتون الكاملة لقسم «البحوث والمقارنات»: تُحمَّل من الشبكة عند اختيار نطاقها، وتُحفظ في الجهاز لتعمل بعدها دون إنترنت.
// المصادر: ثقلين thaqalayn.net، وبحار الأنوار (طبعة دار إحياء التراث)، ومكتبة القائمية ghbook.ir عبر OpenITI.
// الفهرس الصغير في data/corpus.js، والمتون في مجلد corpus/ خارج نسخة أندرويد.
'use strict';
const Corpus=(()=>{
  const REPO='taroot80-blip/imam-mahdi';
  const bases=()=>{const local=/github\.io$|^localhost$|^127\./.test(location.hostname)?['corpus/']:[];
    return local.concat([`https://taroot80-blip.github.io/imam-mahdi/corpus/`,`https://raw.githubusercontent.com/${REPO}/main/corpus/`,`https://cdn.jsdelivr.net/gh/${REPO}@main/corpus/`])};
  const CACHE='mastoor-corpus-1';
  const by=g=>CORPUS.filter(b=>b.g===g).map(b=>b.k);
  const HADITH=new Set(['four','ghayba','other','bihar']);
  // نطاقات المصادر: كلها تحتاج الشبكة أول مرة إلا نصوص التطبيق
  const SOURCES=[
    {k:'four',t:'الكتب الأربعة',d:'الكافي، الفقيه، التهذيب، الاستبصار',net:true,books:()=>by('four')},
    {k:'kafi',t:'الكافي وحده',d:'بأجزائه الثمانية وتقييم المجلسي',net:true,books:()=>['kafi']},
    {k:'bihar',t:'بحار الأنوار',d:'١١٠ مجلدات، طبعة دار إحياء التراث',net:true,books:()=>['bihar']},
    {k:'ghayba',t:'كتب الغيبة',d:'كمال الدين والغيبتان وأمهات كتب الغيبة',net:true,books:()=>by('ghayba').concat(CORPUS.filter(b=>b.g==='mahdawi'&&b.d&&b.d<1000).map(b=>b.k))},
    {k:'mahdawi',t:'مكتبة الإمام المهدي',d:`${by('mahdawi').length} كتابًا لمؤلفي الإمامية، قديمًا وحديثًا`,net:true,books:()=>by('mahdawi')},
    {k:'rijal',t:'كتب الرجال',d:'الكشي والطوسي والخلاصة ومعجم رجال الحديث',net:true,books:()=>by('rijal')},
    {k:'hadith',t:'كتب الحديث كلها',d:'الأربعة والبحار وكتب الغيبة وأمهات الحديث',net:true,books:()=>CORPUS.filter(b=>HADITH.has(b.g)).map(b=>b.k)},
    {k:'corpus',t:'المكتبة كلها',d:`${CORPUS.length} كتابًا: الحديث والمهدوية والرجال`,net:true,books:()=>CORPUS.map(b=>b.k)},
    {k:'app',t:'نصوص التطبيق',d:'الموثقة، دون إنترنت',net:false,books:()=>[]},
    {k:'all',t:'الكل مع التطبيق',d:'المكتبة كلها ونصوص التطبيق',net:true,books:()=>CORPUS.map(b=>b.k),withApp:true},
  ];
  const meta=k=>CORPUS.find(b=>b.k===k);
  const files=k=>{const b=meta(k);return b&&b.f?b.f:[k]};
  // ذاكرة مؤقتة محدودة للملفات المقروءة، والباقي يُقرأ من مخزن الجهاز عند الحاجة
  const MEM=new Map();let memSize=0;const MEM_MAX=45e6;
  const remember=(f,j,size)=>{if(size>12e6)return;MEM.set(f,{j,size});memSize+=size;for(const [k,v] of MEM){if(memSize<=MEM_MAX)break;MEM.delete(k);memSize-=v.size}};
  const SEEN=new Set();
  const loaded=k=>files(k).every(f=>SEEN.has(f));
  const sizeMB=keys=>keys.filter(k=>!loaded(k)).reduce((s,k)=>s+(meta(k)||{kb:0}).kb,0)/1024;
  async function cacheKeys(){try{const c=await caches.open(CACHE);return new Set((await c.keys()).map(r=>r.url.split('/').pop().replace('.json','')))}catch(e){return new Set()}}
  async function getFile(f){const m=MEM.get(f);if(m)return m.j;let c=null;
    try{c=await caches.open(CACHE);const hit=await c.match(f+'.json');if(hit){const t=await hit.text();const j=JSON.parse(t);SEEN.add(f);remember(f,j,t.length);return j}}catch(e){}
    if(navigator.onLine===false)throw Object.assign(new Error('offline'),{offline:true});
    let last;for(const b of bases()){try{const r=await fetch(b+f+'.json',{mode:'cors'});if(!r.ok)throw new Error(r.status);const t=await r.text();const j=JSON.parse(t);
        try{c&&await c.put(f+'.json',new Response(t,{headers:{'content-type':'application/json'}}))}catch(e){}SEEN.add(f);remember(f,j,t.length);return j}catch(e){last=e}}
    throw Object.assign(new Error('net'),{offline:navigator.onLine===false,cause:last})}
  // يعرف ما حُفظ في الجهاز من قبل حتى لا يُطلب الاتصال بلا داع
  let warmed=false;async function warm(){if(warmed)return;warmed=true;(await cacheKeys()).forEach(f=>SEEN.add(f))}
  const MAJ=[['sahih','صحيح'],['hasan','حسن'],['muwathaq','موثق'],['daif','ضعيف'],['majhul','مجهول'],['mursal','مرسل'],['marfu','مرفوع']];
  function majClass(s){s=String(s||'').trim();if(!s)return'none';const w=MAJ.find(([,a])=>s.startsWith(a));return w?w[0]:'other'}
  function unit(b,f,i,r,s){const thq=typeof r[1]==='string',vol=r[0],multi=(b.v>1||b.of>1||b.g==='bihar');
    if(thq){const no=String(r[1]).split('/').pop();return{id:'c:'+f+':'+i,title:`${b.t}${multi?` ج${ar(vol)}`:''} · حديث ${ar(+no||i+1)}`,raw:r[2],body:r[2],book:b.t,bk:b.k,g:b.g,author:b.a,death:b.d,
      era:Lab.eraOf(b.d),cent:Math.ceil(b.d/100),stype:'hadith',grade:'M'+majClass(r[3]),beh:r[4]==='صحيح',door:null,section:multi?`ج${ar(vol)}`:b.t,vol,url:'https://thaqalayn.net/hadith/'+r[1],hasText:true,corpus:true}}
    const page=r[1],bab=(s&&s[r[2]])||'';const vl=b.g==='bihar'||vol>1||b.of>1;
    return{id:'c:'+f+':'+i,title:`${b.t}${vl?` ج${ar(vol)}`:''}${page?` ص${ar(page)}`:''}`,raw:r[3],body:r[3],book:b.t,bk:b.k,g:b.g,author:b.a,death:b.d,
      era:Lab.eraOf(b.d),cent:b.d?Math.ceil(b.d/100):null,stype:HADITH.has(b.g)?'hadith':b.g,grade:HADITH.has(b.g)?'Mnone':'N',beh:false,door:null,section:vl?`ج${ar(vol)}`:b.t,bab,vol,page,via:r[4]||'',
      url:b.src==='ghbook'?`https://www.ghbook.ir/index.php?option=com_dbook&task=viewbook&book_id=${b.id}`:null,hasText:true,corpus:true}}
  // يمرّ على الكتب ملفًا ملفًا ويحتفظ بالنصوص التي فيها أحد المصطلحات فقط
  async function scan(keys,terms,onProg){await warm();const T=terms.map(t=>Lab.N(t)).filter(Boolean),out=[];let pool=0;
    const all=keys.flatMap(k=>files(k).map(f=>[k,f]));let done=0;onProg&&onProg(0,all.length);
    for(const [k,f] of all){const j=await getFile(f),b=meta(k),s=j.s;const rows=j.h;pool+=rows.length;
      for(let i=0;i<rows.length;i++){const r=rows[i],txt=typeof r[1]==='string'?r[2]:r[3];if(T.some(t=>txt.indexOf(t)>=0))out.push(unit(b,f,i,r,s))}
      done++;onProg&&onProg(done,all.length,k);if(done%6===0)await new Promise(r=>setTimeout(r,0))}
    return{units:out,pool}}
  async function cached(){return[...(await cacheKeys())]}
  async function clear(){try{await caches.delete(CACHE)}catch(e){}MEM.clear();memSize=0;SEEN.clear();warmed=false}
  return{SOURCES,meta,files,loaded,sizeMB,scan,warm,cached,clear,majClass,source:k=>SOURCES.find(s=>s.k===k)}
})();
