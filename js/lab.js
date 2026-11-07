// محرك «البحوث والمقارنات»: يفهرس نصوص التطبيق الموثقة وفهرس الكتب، ويعدّ الذكر،
// ويوزعه على المصادر والعصور والقرون ودرجات النقل والأبواب، ويفهم السؤال العربي.
// لا يخترع رقمًا: كل عدد محسوب من نصوص التطبيق نفسها، ويتسع تلقائيًا كلما أُضيف محتوى.
'use strict';
const Lab=(()=>{
  const N=s=>norm(s).replace(/[^ء-ي0-9a-z\s]/g,' ').replace(/\s+/g,' ').trim();

  /* ---------- أعمار المصادر ----------
     [مطابقة العنوان، مطابقة المؤلف أو '' ، سنة الوفاة بالهجري (تقريبية للقرن)، المؤلف للعرض]
     الأقدم أولًا في التطابق مع «الغيبة» بحسب المؤلف. */
  const SRC=[
    ['الكافي','','329','الشيخ الكليني'],
    ['الغيبه','نعماني','360','النعماني'],
    ['الغيبه','طوسي','460','الشيخ الطوسي'],
    ['كمال الدين','','381','الشيخ الصدوق'],
    ['الارشاد','مفيد','413','الشيخ المفيد'],
    ['الخرائج والجرائح','','573','قطب الدين الراوندي'],
    ['الاحتجاج','','560','الطبرسي'],
    ['فرج المهموم','','664','السيد ابن طاووس'],
    ['كشف الغمه','','692','الإربلي'],
    ['بحار الانوار','','1111','العلامة المجلسي'],
    ['رياض العلماء','','1130','الأفندي'],
    ['قصص العلماء','','1302','التنكابني'],
    ['جنه الماوي','','1320','الميرزا حسين النوري'],
    ['النجم الثاقب','','1320','الميرزا حسين النوري'],
    ['مفاتيح الجنان','','1359','الشيخ عباس القمي'],
    ['الانوار البهيه','','1359','الشيخ عباس القمي'],
    ['اعيان الشيعه','','1371','السيد محسن الأمين'],
    ['تاريخ الغيبه الكبري','','1419','السيد محمد الصدر'],
    ['اجابات الاسئله العشره','','1443','الشيخ لطف الله الصافي'],
    ['بحث حول المهدي','','1400','السيد محمد باقر الصدر'],
  ];
  // ما يُعرف أنه معاصر: مواقع ومنتديات ومقالات وإصدارات حديثة
  const MODERN=/المعجم الموضوعي|في رحاب الامام المهدي|الاصول التمهيديه|موعود الاديان|المنتظر والمنتظرون|منتدي|ويكي|شبكه|موقع|مقاله|صحيفه|مركز الدراسات|الابطحي|كرامات الامام|التربيه المهدويه|الملامح المميزه|معجم احاديث|ملاقات|اروع القصص|الموسوعه القصصيه|ماهي|ما هي|^\d+ /;
  const WEB=/منتدي|ويكي|شبكه|موقع|مقاله|صحيفه|^\d+ |ماهي/;
  const ERA=[{k:'q',t:'القديمة',d:'حتى القرن الثامن',c:'#F2B632'},{k:'m',t:'المتأخرة',d:'القرن التاسع – الرابع عشر',c:'#14B8A6'},{k:'h',t:'المعاصرة',d:'بعد ١٣٧٠هـ',c:'#38BDF8'},{k:'u',t:'غير محدد',d:'لم يُعرف عصره بعد',c:'#8a7a63'}];
  const eraOf=y=>y==null?'u':y<=800?'q':y<=1370?'m':'h';
  const centOf=y=>y==null?null:Math.ceil(y/100);
  function parseDeath(s){if(/معاصر/.test(String(s||'')))return 1430;const m=String(s||'').match(/ت\s*(\d+)/);if(m)return +m[1];const c=String(s||'').match(/ق\s*(\d+)/);if(c)return +c[1]*100-50;return null}
  function srcMeta(book,author){const b=N(book),a=N(author);
    for(const [t,au,y,who] of SRC){if(b.includes(N(t))&&(!au||a.includes(au)))return{death:+y,author:author||who,type:'kitab'}}
    if(/^الغيبه$/.test(b)){const hit=SRC.find(r=>r[0]==='الغيبه'&&a.includes(r[1]));if(hit)return{death:+hit[2],author,type:'kitab'}}
    const bk=(typeof BOOKS!=='undefined'?BOOKS:[]).find(x=>N(x.t)===b);if(bk)return{death:parseDeath(bk.d),author:bk.a,type:'kitab'};
    const as=N(author);if(as&&/ابطحي|الصافي|الصدر|الكوراني|الصغير/.test(as)&&!WEB.test(b))return{death:1430,author,type:'kitab'};
    if(MODERN.test(b))return{death:1430,author,type:WEB.test(b)?'web':'kitab'};
    if(/مركز الدراسات|مركز الابحاث/.test(a))return{death:1430,author,type:'web'};
    return{death:null,author,type:'kitab'}}
  const TYPE={kitab:'كتاب',web:'موقع أو مقالة'};

  /* ---------- الفهرس ---------- */
  let IDX=null;
  function shortBook(b){return String(b||'غير مسمّى').replace(/^\(\d+\)\s*/,'').replace(/\s*\((?:المطبوع|ملحق)[^)]*\)/,'').replace(/،\s*الحكاية.*$/,'').replace(/^كمال الدين$/,'كمال الدين وتمام النعمة').trim()}
  function build(){if(IDX)return IDX;
    const units=CONTENT.map(x=>{const s=x.source||{},m=srcMeta(s.book,s.author),book=shortBook(s.book);
      const raw=[x.title,x.text||x.summary||''].join('\n');
      return{id:x.id,title:x.title,raw,body:N([x.title,x.text,x.summary,(x.tags||[]).join(' ')].join(' ')),book,author:m.author||'',death:m.death,era:eraOf(m.death),cent:centOf(m.death),stype:m.type,grade:x.grade,door:x.door,section:x.section,url:x.url,hasText:!!x.text}});
    const books=(typeof BOOKS!=='undefined'?BOOKS:[]).map(b=>{const y=parseDeath(b.d);return{n:b.n,t:b.t,a:b.a,d:b.d,body:N(b.t+' '+b.note),era:eraOf(y),cent:centOf(y),death:y,kind:b.kind,sec:b.era}});
    IDX={units,books};return IDX}
  // عدد مرات الذكر داخل نص مُطبَّع (لا يتداخل)
  function countIn(body,t){if(!t)return 0;let n=0,i=0;while((i=body.indexOf(t,i))>=0){n++;i+=t.length}return n}
  // مقتطف حول أول موضع، بالنص الأصلي مع التشكيل
  function snippet(raw,term,w=60){const map=[];let s='';
    for(let i=0;i<raw.length;i++){const c=N(raw[i]);if(!c){if(/\s/.test(raw[i])&&s&&s[s.length-1]!==' '){s+=' ';map.push(i)}continue}for(const ch of c){s+=ch;map.push(i)}}
    const k=s.indexOf(term);if(k<0)return null;const a=map[Math.max(0,k-w)]||0,bEnd=map[Math.min(map.length-1,k+term.length+w)]||raw.length;const st=map[k],en=map[k+term.length-1]+1;
    return{pre:(a>0?'… ':'')+raw.slice(a,st).replace(/\s+/g,' '),hit:raw.slice(st,en),post:raw.slice(en,bEnd+1).replace(/\s+/g,' ')+(bEnd<raw.length-1?' …':'')}}

  /* ---------- التحليل ---------- */
  const GR=['tawqi','riwaya','dua','thiqa','bahth','kutub','istinas'];
  function group(list,key,val){const o={};list.forEach(x=>{const k=key(x);if(k==null)return;o[k]=(o[k]||0)+(val?val(x):1)});return o}
  // units: نصوص من المتون الكاملة (Corpus) تُضاف إلى نصوص التطبيق أو تحل محلها
  function analyze({terms=[],scope='all',units:ext=null,withApp=true,poolN=null}={}){const {units,books}=build();
    const base=ext?(withApp?ext.concat(units):ext):units;
    const pool=scope==='all'?base:base.filter(u=>u.era===scope);
    const T=terms.map(t=>({label:t,n:N(t)})).filter(t=>t.n);
    const per=T.map(t=>{const hits=[];for(const u of pool){const c=countIn(u.body,t.n);if(c)hits.push({u,c})}
      hits.sort((a,b)=>b.c-a.c);const bt=books.filter(b=>b.body.includes(t.n));
      return{term:t.label,n:t.n,total:hits.reduce((s,h)=>s+h.c,0),items:hits.length,hits,
        byBook:group(hits,h=>h.u.book,h=>h.c),byEra:group(hits,h=>h.u.era,h=>h.c),byCent:group(hits,h=>h.u.cent,h=>h.c),
        byGrade:group(hits,h=>h.u.grade),byDoor:group(hits,h=>h.u.door,h=>h.c),
        bySection:group(hits,h=>(h.u.corpus?h.u.book:h.u.door)+'›'+h.u.section,h=>h.c),
        byType:group(hits,h=>h.u.stype,h=>h.c),eraGrade:group(hits,h=>h.u.era+'›'+h.u.grade),bookGrade:group(hits,h=>h.u.book+'›'+h.u.grade),
        byBeh:group(hits.filter(h=>h.u.corpus&&BEH.has(h.u.bk)),h=>h.u.book+'›'+(h.u.beh?'1':'0')),
        byBab:group(hits.filter(h=>h.u.bab),h=>h.u.book+' · '+h.u.bab,h=>h.c),byVia:group(hits.filter(h=>h.u.via),h=>h.u.via,h=>h.c),byGroup:group(hits,h=>h.u.g||'app',h=>h.c),
        ...chains(hits),
        corpusHits:hits.filter(h=>h.u.corpus).length,titleBooks:bt}});
    const ids=new Set();per.forEach(p=>p.hits.forEach(h=>ids.add(h.u.id)));
    return{terms:T.map(t=>t.label),scope,per,pool:(poolN!=null?poolN+(ext&&withApp?units.length:0):pool.length),matched:ids.size,cooc:cooc(per),gs:scheme(per),corpus:!!ext,withApp:!ext||withApp}}
  // كتب نقل الموقع تقييم البهبودي لأحاديثها
  const BEH=new Set(['kafi','faqih','tahdhib']);
  /* ---------- الأسانيد: استخراج تقريبي لرجال السند والمعصوم المروي عنه ---------- */
  const IMAMS=[[/^(ابي|ابا|ابو) عبد الله( جعفر بن محمد)?( الصادق)?$|^جعفر بن محمد( الصادق)?$|^الصادق$/,'الإمام الصادق'],
    [/^(ابي|ابا|ابو) جعفر الثاني$|^الجواد$|^ابي جعفر محمد بن علي الرضا$/,'الإمام الجواد'],
    [/^(ابي|ابا|ابو) جعفر( محمد بن علي)?( الباقر)?$|^الباقر$/,'أبو جعفر (الباقر غالبًا)'],
    [/^(ابي|ابا|ابو) ابراهيم$|^موسي بن جعفر$|^العبد الصالح$|^ابي الحسن موسي$|^الكاظم$/,'الإمام الكاظم'],
    [/^(ابي|ابا|ابو) الحسن الرضا$|^الرضا$|^علي بن موسي( الرضا)?$/,'الإمام الرضا'],
    [/^(ابي|ابا|ابو) الحسن الثالث$|^الهادي$|^(ابي|ابا|ابو) الحسن العسكري$/,'الإمام الهادي'],
    [/^(ابي|ابا|ابو) الحسن( الاول| الماضي)?$/,'أبو الحسن (الكاظم أو الرضا أو الهادي)'],
    [/^(ابي|ابا|ابو) محمد( الحسن بن علي)?( العسكري)?$|^العسكري$/,'أبو محمد (العسكري غالبًا)'],
    [/^علي بن الحسين$|^زين العابدين$|^السجاد$|^(ابي|ابا|ابو) محمد علي بن الحسين$/,'الإمام السجاد'],
    [/^امير المومنين$|^علي بن ابي طالب$|^علي$/,'أمير المؤمنين'],[/^رسول الله$|^النبي$/,'النبي'],
    [/^صاحب الزمان$|^القائم$|^صاحب الامر$|^الناحيه( المقدسه)?$/,'الإمام المهدي'],[/^الحسين بن علي$/,'الإمام الحسين'],[/^الحسن بن علي$/,'الإمام الحسن']];
  const LEAD=/^(\d+ )?(غط|ني|ك|كا|يب|بص|ما|لي|جا|ع|ن|ب|سن|شي|فس|كش|جش|مع|ل|يد|ثو|ص|ج|كنز|مل|عم|يج|قب|ير)?( [^ ]+){0,4}? ?(حدثنا|حدثني|اخبرنا|اخبرني|روي|روي عن|وروي|و?باسناده|و?بالاسناد|قال)? ?/;
  function cleanName(x){x=x.replace(/^(\d+ )+/,'').replace(/^(و|ف)?(حدثنا|حدثني|اخبرنا|اخبرني|روي|روي عن|عنه|و?باسناده عن|و?بهذا الاسناد|و?بالاسناد|قال|قالا|جميعا|عده من اصحابنا|جماعه)( |$)/g,'').replace(/ (جميعا|رفعه|مرسلا|عن بعض اصحابنا|وغيره|وغيرهما|قال|قالا|رحمه الله|رضي الله عنه)( .*)?$/,'').trim();
    const w=x.split(' ');return w.length>=2&&w.length<=7&&w[0].length>2&&!/^(في|من|ما|ان|انه|لا|اذا|قد|كان|الكافي|الغيبه|كتاب)$/.test(w[0])&&!/الكافي|الغيبه|الامالي|اكمال|كمال الدين|العيون|البصاير|المحاسن|تفسير/.test(x)?w.slice(0,6).join(' '):null}
  const CUT=/ (ع|عليه السلام|عليهما السلام|صلي الله|ص|قال|قالت|قالا|يقول|انه|انها|انهما|في قول|في قوله|مثله|نحوه|سالته|سالت|سمعت|سمعته|كتب|كتبت|في حديث|يرفعه|رفعه) /;
  const KW=/(?:^| )(?:اخبرني|اخبرنا|حدثني|حدثنا|حدثه|منهم|باسناده|بالاسناد|بهذا الاسناد|عنه|روي|جماعه|عده من اصحابنا)(?: |$)/g;
  function firstHead(x){let k=-1,m;KW.lastIndex=0;while((m=KW.exec(x)))k=m.index+m[0].length;if(k>=0)x=x.slice(k);
    const w=x.trim().split(' '),b=w.indexOf('بن');if(b>0)return w.slice(b-1,b+6).join(' ');let out=w.slice(-6);while(out.length&&out[0]==='بن')out.shift();return out.join(' ')}
  const AMBIG=/^(علي بن الحسين|الحسن بن علي|الحسين بن علي|جعفر بن محمد|موسي بن جعفر|علي بن موسي|علي)$/;
  function chainOf(u){if(u.stype!=='hadith')return null;let s=u.body.slice(0,600);if(s.indexOf(' عن ')<0)return null;
    s=s.replace(/^\d+ /,'');const seg=s.split(' عن ');if(seg.length<2)return null;
    const names=[];let imam=null,ended=false;
    for(let i=0;i<seg.length&&i<14;i++){let x=seg[i];const c=i?x.search(CUT):-1;let head=(c>0?x.slice(0,c):x).trim();
      if(i===0)head=firstHead(head);
      let hit=null;for(const [re,name] of IMAMS)if(re.test(head)){hit=name;break}
      if(hit&&AMBIG.test(head)&&!(c>0&&/^ (ع|عليه السلام|عليهما السلام) /.test(x.slice(c,c+16))))hit=null;
      if(hit){imam=hit;ended=true;break}
      head.split(/ و(?=[^ ]+ (?:بن|ابن) )/).forEach(y=>{const n=cleanName(y);if(n&&n!=='عنه')names.push(n)});
      if(c>0||(i&&head.split(' ').length>7)){ended=true;break}}
    if(!names.length&&!imam)return null;
    return{names,imam}}
  function chains(hits){const nar={},im={};let withChain=0;
    for(const h of hits){const c=h.u.chain!==undefined?h.u.chain:(h.u.chain=chainOf(h.u));if(!c)continue;withChain++;
      new Set(c.names).forEach(n=>nar[n]=(nar[n]||0)+1);const k=c.imam||'غير مصرّح أو غير معصوم';im[k]=(im[k]||0)+1}
    return{byNarr:nar,byImam:im,withChain}}
  // نظام الدرجات: درجات نقل نصوص التطبيق، وتقييم المجلسي لأحاديث الكافي
  const APPG={tawqi:'توقيع شريف',riwaya:'رواية في مصدر معتبر',thiqa:'عالم ثقة',kutub:'نقل كتب اللقاءات',dua:'دعاء مأثور',bahth:'بحث علمي',istinas:'للاستئناس'};
  const MAJ=[['sahih','صحيح','#22C55E'],['hasan','حسن','#14B8A6'],['muwathaq','موثق','#38BDF8'],['daif','ضعيف','#EF4444'],['majhul','مجهول','#FB923C'],['mursal','مرسل','#A78BFA'],['marfu','مرفوع','#F472B6'],['other','تقييم آخر','#E0B050'],['none','بلا تقييم','#6b5d4a']];
  function scheme(per){const ks=new Set();(per||[]).forEach(p=>Object.keys(p.byGrade).forEach(k=>ks.add(k)));
    const order=[...GR,...MAJ.map(m=>'M'+m[0]),'N'],keys=per?order.filter(k=>ks.has(k)):GR.slice();
    const mj=k=>MAJ.find(m=>'M'+m[0]===k)||MAJ[8];
    return{keys,name:k=>k==='N'?'كتاب غير حديثي':k[0]==='M'?(k==='Mnone'?'حديث بلا تقييم للمجلسي':mj(k)[1]+' عند المجلسي'):(APPG[k]||k),short:k=>k==='N'?'غير حديثي':k[0]==='M'?mj(k)[1]:(APPG[k]||k),color:k=>k==='N'?'#5b4f40':k[0]==='M'?mj(k)[2]:GRADE_C[k]}}
  // الكلمات المصاحبة للمصطلح في النصوص نفسها
  // أعلام أسانيد شائعة وأدوات لا تفيد في معرفة سياق القضية
  const NAMES=new Set('علي محمد احمد الحسن الحسين جعفر ابراهيم اسحاق يعقوب موسي عثمان سعيد عبد عبيد حدثنا حدثني اخبرنا اخبرني روي رواه فقال قالوا وقال واما فاما وانا وان فلما لما كنت كان كانوا وكان يقول يقال اليه عليه عليهم الينا ابيه ابوه ابيه رجل الرجل شيء فقد وقد لقد قلنا ذكر يوم سنه فهو احد كما وجه يكن فانك فمن ليس ولكن لكن غير مثل اني انه فانه منكم عليكم اليكم بكم انكم انهم وهم انما ايضا هناك هنا كذلك جميع اكثر الامر امر'.split(' '));
  const STOP=new Set('في من على عن الي الى الا ان انه انها ما لا لم لن قد قال قالت ثم او ام هو هي هم هذا هذه ذلك تلك التي الذي الذين كان كانت يكون مع بن ابن ابي ابو عليه السلام عليهم صلي الله اله وسلم عز وجل كل بعض حتي اذا اذ فقال فقلت قلت له لها لهم به بها فيه فيها منه منها عنه بين عند بعد قبل نحو يا اي اما ولا وما فلا وهو وهي وقد ولم فان وان انا نحن انت انتم لك لنا منا الله تعالي رضي رحمه رحمه الله ص ج'.split(' '));
  let DF=null;
  function df(){if(DF)return DF;DF={};build().units.forEach(u=>new Set(u.body.split(' ')).forEach(w=>DF[w]=(DF[w]||0)+1));return DF}
  function cooc(per){const o={},D=df(),Nn=build().units.length,terms=per.map(p=>p.n);
    per.forEach(p=>p.hits.forEach(h=>new Set(h.u.body.split(' ')).forEach(w=>{const w2=w.replace(/^[وف]/,'');if(w.length<3||STOP.has(w)||NAMES.has(w)||STOP.has(w2)||NAMES.has(w2)||/\d/.test(w)||terms.some(t=>w.includes(t)||t.includes(w)))return;o[w]=(o[w]||0)+1})));
    return Object.entries(o).filter(([w,c])=>c>=2||Object.keys(o).length<30).map(([w,c])=>[w,c,c*Math.log(1+Nn/(D[w]||1))]).sort((a,b)=>b[2]-a[2]).slice(0,40).map(([w,c])=>[w,c]).sort((a,b)=>b[1]-a[1])}
  // صورة المكتبة دون سؤال
  function overview(){const {units,books}=build();
    return{units:units.length,withText:units.filter(u=>u.hasText).length,sources:new Set(units.map(u=>u.book)).size,books:books.length,
      uEra:group(units,u=>u.era),uGrade:group(units,u=>u.grade),uDoor:group(units,u=>u.door),uBook:group(units,u=>u.book),uCent:group(units,u=>u.cent),uType:group(units,u=>u.stype),
      eraGrade:group(units,u=>u.era+'›'+u.grade),bEra:group(books,b=>b.era),bKind:group(books,b=>b.kind),bCent:group(books,b=>b.cent),bSec:group(books,b=>b.sec)}}

  /* ---------- فهم السؤال ---------- */
  const INTENT=[
    ['mind',/خريطه ذهنيه|ذهنيه|ذهني|شجره|خريطه مفاهيم|تفرع/],
    ['grade',/ثبوت|اعتبار|اعتباريه|توثيق|درجه|درجات|معتبر|صحه|قوه النقل|طريق النقل/],
    ['era',/قديم|القديمه|المتقدم|متقدمه|معاصر|المعاصره|متاخر|المتاخره|العصور|عصر|عصور/],
    ['cent',/قرن|القرون|عبر الزمن|تطور|تاريخيا|زمني/],
    ['book',/كل كتاب|كتاب كتاب|المصادر|مصدر|في الكتب|بين الكتب|الكتب عموما|كتب/],
    ['door',/الابواب|باب|موضوعات|اقسام/],
    ['cloud',/مصاحب|يقترن|يرتبط|سياق|الكلمات/],
    ['rijal',/رواه|الرواه|السند|الاسانيد|اسناد|اسانيد|رجال السند|المروي عنه/],
  ];
  const DROP=new Set(('قارن قارني مقارنه بين ذكر ذكره ذكرها عدد مرات مره كم كمي اعرض اظهر ارسم رسم بياني بيانيه وضح بين لي ابحث بحث حلل تحليل احص احصاء احصائيه نسبه '+
    'الكتب كتب كتاب الكتاب كل المصادر المصدر مصادر القديمه قديمه القديم المتقدمه المتقدمين المعاصره معاصره المعاصر المتاخره متاخره المتاخرين العصور عصور عصر عموما عامه '+
    'ما ماذا مدي مدى هل كيف اين متي لماذا وما وهل في من على عن الى الي بين و او ام ثم مع حسب حول عند منها فيها فيه به لها له ذلك هذا هذه التي الذي '+
    'ثبوت اعتبار اعتباريه توثيق درجه درجات معتبر معتبره صحه امر شيء قضيه مساله موضوع اهل البيت الامام المهدي عليه السلام عجل الله فرجه الشريف '+
    'خريطه ذهنيه ذهني شجره مفاهيم قرن القرون الزمن تطور تاريخيا زمني الابواب باب موضوعات اقسام مصاحبه المصاحبه الكلمات سياق يقترن يرتبط روايات الروايات النصوص نصوص فقط وحدها وغيرها غيرها الاربعه اربعه امهات البحار بحار الانوار الكافي وحده مكتبه الرجال رجال الرواه رواه السند اسانيد الاسانيد اسناد المروي المهدويه التطبيق المفهرسه الحديثيه الحديث الاحاديث احاديث عبر خلال لدي ورود وروده ورد يرد تكرار تكرر').split(' '));
  // نطاق المصادر من نص السؤال
  function srcOf(n){if(/الكتب الاربعه|امهات الكتب|الاصول الاربعه/.test(n))return'four';if(/بحار الانوار|البحار/.test(n))return'bihar';if(/كتب الغيبه/.test(n))return'ghayba';
    if(/في الكافي|الكافي وحده|كتاب الكافي/.test(n))return'kafi';if(/مكتبه الامام المهدي|مكتبه المهدي|كتب المهدويه|الكتب المهدويه|المولفات المهدويه/.test(n))return'mahdawi';if(/كتب الرجال|في الرجال|علم الرجال/.test(n))return'rijal';if(/كتب الحديث/.test(n))return'hadith';if(/المكتبه كلها|كل الكتب|جميع الكتب|الكتب كلها|الكتب المفهرسه/.test(n))return'corpus';if(/نصوص التطبيق/.test(n))return'app';return null}
  function parse(q){const raw0=String(q||'').trim(),n=N(raw0),src=srcOf(n);
    const raw=raw0.replace(/(في\s+)?كتب\s+الغيبة/g,' ').replace(/(في\s+)?(كتاب\s+)?الكافي(\s+وحده)?/g,' ');const views=INTENT.filter(([,r])=>r.test(n)).map(([k])=>k);
    let scope='all';if(/(القديمه|المتقدمه)\s*(فقط|وحدها)|في الكتب (القديمه|المتقدمه)(?! و)/.test(n)&&!/معاصر|متاخر/.test(n))scope='q';
    else if(/(المعاصره)\s*(فقط|وحدها)|في الكتب المعاصره(?! و)/.test(n)&&!/قديم|متقدم/.test(n))scope='h';
    // ما بين علامات التنصيص أولًا
    const quoted=[...raw.matchAll(/[«"“']([^»"”']{2,})[»"”']/g)].map(m=>m[1].trim());
    let terms=quoted;
    if(!terms.length){const segs=raw.split(/[،,؛;:\n]|\s+(?:و|او|أو)\s+/);terms=[];
      segs.forEach(seg=>{let cur=[];const flush=()=>{if(cur.length){terms.push(cur.join(' '));cur=[]}};
        seg.split(/\s+/).forEach(w=>{const k=N(w);if(!k)return;
          if(DROP.has(k)||/^\d+$/.test(k)){flush();return}
          // «والانتظار» بعد مصطلح = فاصل بين مصطلحين
          if(/^وال/.test(k)&&k.length>4){const rest=w.replace(/^و/,'');if(DROP.has(N(rest))){flush();return}flush();cur.push(rest);return}
          let v=w.replace(/[؟?!.]+$/,'');if(/^لل/.test(k)&&k.length>4)v='ال'+v.replace(/^لل/,'');cur.push(v)});flush()})}
    terms=[...new Set(terms.map(t=>t.trim()).filter(t=>N(t).length>=2))].slice(0,6);
    let view=views.find(v=>v!=='book')||(views.includes('book')?'book':null);
    if(terms.length>1&&!view)view='compare';
    if(!view)view=terms.length?'auto':'overview';
    return{q:raw0,terms,view,views,scope,src}}
  // إن لم يوجد المصطلح جرّب بلا «ال» أو بلا حرف عطف
  function refine(terms){const {units,books}=build();return terms.map(t=>{const n=N(t);const has=x=>units.some(u=>u.body.includes(x))||books.some(b=>b.body.includes(x));
    if(has(n))return{t,ok:true};for(const v of [n.replace(/^لل/,'ال'),n.replace(/^[بلكف]ال/,'ال'),n.replace(/^ال/,''),n.replace(/^و/,''),n.replace(/^و?ال/,''),n.replace(/ه$/,'')])if(v.length>=2&&v!==n&&has(v))return{t:v,ok:true,from:t};return{t,ok:false}})}

  const GRADE_C={tawqi:'#F2B632',riwaya:'#22C55E',dua:'#A78BFA',thiqa:'#14B8A6',bahth:'#38BDF8',kutub:'#FB923C',istinas:'#F472B6'};
  const KIND={m:'موسوعية',k:'مجلد كبير',b:'كتاب',r:'كتيب'};
  return{build,analyze,scheme,overview,chainOf,parse,refine,snippet,countIn,N,ERA,GR,GRADE_C,KIND,TYPE,eraOf,srcMeta,parseDeath}
})();
if(typeof module!=='undefined')module.exports=Lab;
