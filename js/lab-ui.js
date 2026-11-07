// صفحة «البحوث والمقارنات»: سؤال ← فهم ← أرقام ← رسوم ← جدول ← تصدير وطباعة وجسر إلى Claude
'use strict';
const LabUI=(()=>{
  const C=Charts,L=Lab;
  const ERA=Object.fromEntries(L.ERA.map(x=>[x.k,x]));
  const doorT=id=>(DOORS.find(d=>d.id===id)||{}).t||id;
  const doorC=id=>(DOORS.find(d=>d.id===id)||{}).c;
  const gName=g=>window.gradeName?gradeName(g):g;
  const VIEWS=[['auto','تلقائي'],['book','حسب الكتب'],['era','القديمة والمعاصرة'],['cent','عبر القرون'],['grade','الثبوت والاعتبار'],['door','حسب الأبواب'],['mind','خريطة ذهنية'],['cloud','الكلمات المصاحبة']];
  const SCOPES=[['all','كل العصور'],['q','القديمة'],['m','المتأخرة'],['h','المعاصرة']];
  const EX=['قارن ذكر الغيبة بين الكتب القديمة والمعاصرة','ما مدى ثبوت روايات اللقاء؟','خريطة ذهنية للانتظار','قارن: السفياني، الصيحة، اليماني','تطور ذكر الفرج عبر القرون','كم ذُكر «طول العمر» في كل كتاب','الكلمات المصاحبة للظهور'];
  let st={q:'',terms:[],view:'auto',scope:'all',src:'four'},last=null,runId=0;
  const srcPref=()=>{try{return localStorage.getItem('mst.labSrc')||'four'}catch(e){return'four'}};
  const view=()=>document.getElementById('view');
  const sorted=(o,k=99)=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,k);

  /* ---------- الصفحة ---------- */
  function page(q){q=q||'';const o=L.overview();
    view().innerHTML=`<a class="back" href="#/" data-sfx="close">${ic('back')} الرئيسية</a>
    <section class="lab-hero"><i class="lz l1"></i><i class="lz l2"></i><i class="lz l3"></i>
      <span class="lab-orb">${ic('lab')}</span><h1>البحوث والمقارنات</h1>
      <p>مختبر بياني يقيس حضور القضية المهدوية في الكتب، ويقارن ذكرها وثبوتها بين المصادر القديمة والمتأخرة والمعاصرة، ويرسمها خرائط ذهنية وإحصائية.</p>
      <div class="lab-cov"><span><b>${ar(o.units)}</b> نصًا موثقًا</span><span><b>${ar(o.sources)}</b> مصدرًا</span><span><b>${ar(o.books)}</b> عنوانًا في الفهرس</span></div></section>
    <form class="lab-ask" id="labAsk" role="search"><textarea id="labQ" rows="2" enterkeyhint="search" placeholder="اكتب سؤالك البحثي، مثل: قارن ذكر الغيبة بين الكتب القديمة والمعاصرة" aria-label="السؤال البحثي">${esc(q)}</textarea>
      <div class="lab-ask-b"><button type="button" class="mic" id="labMic" aria-label="التلقين الصوتي" data-sfx="tap">${ic('mic')}</button><button class="btn lab-go" data-sfx="ember">${ic('spark')} حلّل</button></div></form>
    <div class="chips lab-ex">${EX.map(x=>`<button type="button" data-ex="${esc(x)}" data-sfx="tap">${esc(x)}</button>`).join('')}</div>
    <section class="srcs" id="labSrc" aria-label="مصادر المقارنة"><h2>${ic('shelf')} قارن في</h2><div class="src-row">${Corpus.SOURCES.map((x,i)=>`<button type="button" class="src" data-src="${x.k}" style="--i:${i}" data-sfx="wood"><b>${x.net?`<span class="net" title="يحتاج الشبكة أول مرة">${ic('globe')}</span>`:''}${x.t}</b><small>${x.d}</small></button>`).join('')}</div></section>
    <div class="lab-ctl"><div class="seg" id="labScope" role="group" aria-label="نطاق الكتب">${SCOPES.map(([k,t])=>`<button type="button" data-s="${k}" data-sfx="tap">${t}</button>`).join('')}</div>
      <div class="tabs lab-views" id="labViews" role="group" aria-label="نوع المقارنة">${VIEWS.map(([k,t])=>`<button type="button" data-v="${k}" data-sfx="wood">${t}</button>`).join('')}</div></div>
    <div id="labOut" aria-live="polite"></div>`;
    const f=document.getElementById('labAsk'),ta=document.getElementById('labQ');
    f.onsubmit=e=>{e.preventDefault();go(ta.value)};ta.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();go(ta.value)}};
    view().querySelectorAll('[data-ex]').forEach(b=>b.onclick=()=>{ta.value=b.dataset.ex;go(ta.value)});
    view().querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{st.scope=b.dataset.s;run()});
    view().querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{st.view=b.dataset.v;run()});
    view().querySelectorAll('[data-src]').forEach(b=>b.onclick=()=>{st.src=b.dataset.src;try{localStorage.setItem('mst.labSrc',st.src)}catch(e){}run()});
    mic(ta);
    const src=srcPref();if(q){const p=L.parse(q);st={q,terms:fix(p.terms),view:p.view==='compare'||p.view==='overview'?'auto':p.view,scope:p.scope,parsed:p,src:p.src||(p.views.includes('era')&&src!=='app'?'all':src)}}else st={q:'',terms:[],view:'auto',scope:'all',src};
    run()}
  function go(q){q=String(q||'').trim();const h='#/lab/'+encodeURIComponent(q);if(location.hash===h)page(q);else location.hash=h}
  function fix(terms){return L.refine(terms).map(r=>r.t)}
  function mic(ta){const m=document.getElementById('labMic'),SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(window.NativeApp){m.onclick=()=>{window.__speech=t=>{if(t){ta.value=t;go(t)}};NativeApp.listen()};return}
    if(!SR){m.onclick=()=>App.toast('التلقين الصوتي غير متاح في هذا المتصفح');return}
    m.onclick=()=>{const r=new SR();r.lang='ar-KW';r.interimResults=true;m.classList.add('on');App.toast('تكلّم الآن');
      r.onresult=e=>{const t=[...e.results].map(x=>x[0].transcript).join('');ta.value=t;if(e.results[e.results.length-1].isFinal){m.classList.remove('on');go(t)}};
      r.onerror=()=>{m.classList.remove('on');App.toast('لم أسمع بوضوح، حاول مجددًا')};r.onend=()=>m.classList.remove('on');r.start()}}

  /* ---------- التشغيل ---------- */
  async function run(){const id=++runId;Charts.setW((document.getElementById('view').clientWidth||400)<600?420:560);view().querySelectorAll('[data-s]').forEach(b=>b.classList.toggle('on',b.dataset.s===st.scope));
    view().querySelectorAll('[data-v]').forEach(b=>b.classList.toggle('on',b.dataset.v===st.view));
    view().querySelectorAll('[data-src]').forEach(b=>b.classList.toggle('on',b.dataset.src===st.src));
    const out=document.getElementById('labOut');const show=h=>{out.classList.remove('flash');void out.offsetWidth;out.innerHTML=h;wire(out);out.classList.add('flash')};
    if(!st.terms.length){last={overview:true};show(overviewHTML());return}
    const S=Corpus.source(st.src)||Corpus.source('app');
    if(S.ext){const a=L.analyze({terms:st.terms,scope:st.scope});a.per.forEach(p=>{p.hits=p.hits.filter(h=>/بحار/.test(h.u.book))});last=null;show(biharHTML(a));return}
    let units=null;
    if(S.net){const keys=S.books();if(keys.some(k=>!Corpus.loaded(k))){show(loadingHTML(S,keys));
        try{await Corpus.ensure(keys,(d,n,k)=>{const bar=document.getElementById('ldBar'),t=document.getElementById('ldT');if(bar)bar.style.transform=`scaleX(${n?d/n:0})`;if(t&&k)t.textContent=`حُمِّل ${(Corpus.meta(k)||{}).t||''} (${ar(d)} من ${ar(n)})`})}
        catch(e){if(id!==runId)return;show(offlineHTML(S,e));return}
        if(id!==runId)return}
      units=keys.flatMap(k=>Corpus.units(k))}
    await new Promise(r=>setTimeout(r,20));if(id!==runId)return;
    const a=L.analyze({terms:st.terms,scope:st.scope,units,withApp:!units||!!S.withApp});a.src=S;last=a;
    show(understood(a)+kpis(a)+insights(a)+`<section class="lab-grid">${charts(a).map(card).join('')}</section>`+table(a)+titles(a)+note(a)+actions());
    try{SFX.play('sand')}catch(e){}}
  function loadingHTML(S,keys){return `<section class="lab-load"><span class="ld-orb">${ic('globe')}</span><h2>يُحمَّل «${esc(S.t)}» من الشبكة</h2>
    <p class="muted">نحو ${ar(Math.max(1,Math.round(Corpus.sizeMB(keys))))} م.ب تُحمَّل مرة واحدة، ثم تُحفظ في جهازك وتعمل بعدها دون إنترنت.</p><div class="ld-track"><i id="ldBar"></i></div><p class="muted" id="ldT">يبدأ التحميل…</p></section>`}
  function offlineHTML(S,e){return `<section class="lab-load off"><span class="ld-orb">${ic('globe')}</span><h2>${e&&e.offline?'هذا الخيار يحتاج اتصالًا بالإنترنت':'تعذّر الوصول إلى المتون الآن'}</h2>
    <p class="muted">«${esc(S.t)}» متون كاملة تُحمَّل من الشبكة أول مرة. ${e&&e.offline?'اتصل بالإنترنت ثم أعد المحاولة':'تحقق من الاتصال ثم أعد المحاولة'}، أو اختر «نصوص التطبيق» لتعمل دون إنترنت.</p>
    <div class="rw"><button class="btn" id="ldRetry" data-sfx="key">أعد المحاولة</button><button class="btn2" id="ldApp" data-sfx="wood">قارن في نصوص التطبيق</button></div></section>`}
  function biharHTML(a){const q=st.terms;const L2=a.per.filter(p=>p.items);
    const ext=t=>[['مكتبة أهل البيت','ablibrary.net'],['مكتبة مدرسة الفقاهة','lib.eshia.ir'],['شبكة رافد','rafed.net']].map(([n,d])=>`<a class="wl" target="_blank" rel="noopener" href="https://www.google.com/search?q=${encodeURIComponent(`"${t}" "بحار الأنوار" site:${d}`)}" data-sfx="key">${ic('link')} ${n}</a>`).join('');
    return `<section class="lab-load"><span class="ld-orb">${ic('shelf')}</span><h2>بحار الأنوار قيد الفهرسة</h2>
      <p class="muted">لا تتوفر متونه الكاملة مفهرسة في التطبيق بعد، فلا تُعرض له أعداد ولا رسوم حتى لا تكون أرقامًا ناقصة. ابحث فيه الآن على المكتبات المتخصصة، وستُضاف متونه على دفعات.</p></section>
      ${q.map((t,i)=>`<section class="lab-und"><h2><span class="dot" style="--c:${C.PAL[i%C.PAL.length]}"></span>«${esc(t)}» في بحار الأنوار</h2><div class="wls">${ext(t)}</div>
        ${(L2.find(p=>p.term===t)||{items:0}).items?`<p class="muted">وفي نصوص التطبيق ${ar(L2.find(p=>p.term===t).items)} نصًا منقولًا من البحار يرد فيه:</p><div class="its">${L2.find(p=>p.term===t).hits.map((h,j)=>`<a class="it" style="--i:${j}" href="#/item/${esc(h.u.id)}"><b>${esc(h.u.title)}</b><small>${esc(h.u.section||'')}</small></a>`).join('')}</div>`:''}</section>`).join('')}`}

  function understood(a){const p=st.parsed||{},bad=a.per.filter(x=>!x.total).map(x=>x.term);
    const vt=(VIEWS.find(v=>v[0]===st.view)||[])[1],sc=(SCOPES.find(s=>s[0]===st.scope)||[])[1];
    return `<section class="lab-und"><h2>${ic('spark')} فهمتُ سؤالك هكذا</h2>
      <div class="lab-terms">${a.terms.map((t,i)=>`<span class="term" style="--c:${C.PAL[i%C.PAL.length]}">${esc(t)}<button type="button" data-rm="${i}" aria-label="احذف ${esc(t)}" data-sfx="tap">${ic('x')}</button></span>`).join('')}
        <form class="term-add" id="termAdd"><input id="termIn" placeholder="أضف مصطلحًا للمقارنة" aria-label="أضف مصطلحًا"><button class="ic" aria-label="أضف" data-sfx="pen">${ic('plus')}</button></form></div>
      <p class="muted">المصادر: <b>${esc(a.src?a.src.t:'نصوص التطبيق')}</b> · المقارنة: <b>${vt}</b> · العصر: <b>${sc}</b> · بحثتُ في ${ar(a.pool)} ${a.corpus?(a.withApp?'حديثًا ونصًا':'حديثًا'):'نصًا'}</p>${a.src&&a.src.missing?`<p class="muted lab-miss">قيد الفهرسة في هذا النطاق: ${esc(a.src.missing.join('، '))}</p>`:''}
      ${bad.length?`<p class="lab-warn">لم يرد «${esc(bad.join('»، «'))}» في هذه المصادر. جرّب صيغة أخرى للكلمة، أو ابحث عنه على الشبكة من صفحة البحث.</p>`:''}</section>`}
  function kpis(a){const P=a.per,tot=P.reduce((s,p)=>s+p.total,0),books=new Set(P.flatMap(p=>p.hits.map(h=>h.u.book))).size;
    const old=Math.min(...P.flatMap(p=>p.hits.map(h=>h.u.death)).filter(Boolean));
    const k=[[tot,'مرة ذُكر'],[a.matched,a.corpus?(a.withApp?'حديثًا ونصًا ورد فيه':'حديثًا ورد فيه'):'نصًا ورد فيه'],[books,'مصدرًا'],[a.pool?Math.round(a.matched/a.pool*1000)/10:0,'٪ من النصوص'],[isFinite(old)?Math.ceil(old/100):0,'أقدم قرن']];
    return `<section class="kpis">${k.map(([v,t],i)=>`<div class="kpi" style="--i:${i}"><b data-count="${v}">${ar(v)}</b><span>${t}</span></div>`).join('')}</section>`}
  function insights(a){const L2=[];a.per.forEach(p=>{if(!p.total)return;const tb=sorted(p.byBook,1)[0],e=p.byEra;
      L2.push(`«${esc(p.term)}»: أكثر وروده في <b>${esc(tb[0])}</b> (${ar(tb[1])}).`);
      const q=e.q||0,h=e.h||0,m=e.m||0;if(!a.corpus||a.withApp)L2.push(`في القديمة ${ar(q)}، وفي المتأخرة ${ar(m)}، وفي المعاصرة ${ar(h)}.`);
      const gg=sorted(p.byGrade).filter(([k])=>k!=='Mnone'),g=gg[0];if(g)L2.push(`أكثر نصوصه درجةً: «${esc(a.gs.name(g[0]))}» (${ar(g[1])} من ${ar(p.items)}).`);
      if(a.corpus){const b=Object.entries(p.byBeh).reduce((o,[k,v])=>{o[k.endsWith('›1')?1:0]+=v;return o},[0,0]);if(b[0]+b[1])L2.push(`صحّح البهبودي ${ar(b[1])} من ${ar(b[0]+b[1])} حديثًا فيه (${ar(Math.round(b[1]/(b[0]+b[1])*100))}٪).`)}});
    if(a.per.length>1){const w=[...a.per].sort((x,y)=>y.total-x.total);L2.push(`الأكثر حضورًا بين المصطلحات: «${esc(w[0].term)}» (${ar(w[0].total)})، والأقل: «${esc(w[w.length-1].term)}» (${ar(w[w.length-1].total)}).`)}
    return L2.length?`<section class="lab-ins"><h2>${ic('note')} قراءة سريعة</h2><ul>${L2.map((s,i)=>`<li style="--i:${i}">${s}</li>`).join('')}</ul></section>`:''}

  /* ---------- الرسوم المختارة ---------- */
  const ERAK=['q','m','h','u'];
  function centAxis(objs){const cs=[...new Set(objs.flatMap(o=>Object.keys(o)).filter(k=>k!=='null').map(Number))].sort((a,b)=>a-b);
    if(!cs.length)return[];const out=[];for(let c=cs[0];c<=cs[cs.length-1];c++)out.push(c);return out}
  function charts(a){const P=a.per.filter(p=>p.total),one=P.length===1,p=P[0],V=st.view,list=[];if(!P.length)return[];
    const T=s=>`«${P.map(x=>x.term).join('» و«')}» ${s}`;const G=a.gs,GK=G.keys.length?G.keys:L.GR;
    const byBook=()=>({k:'book',svg:C.hbar(sorted(one?p.byBook:sumObj(P.map(x=>x.byBook)),14).map(([l,v])=>({label:l,value:v})),{title:T('في كل كتاب'),sub:'مرات الذكر مرتبة من الأكثر'})});
    const eraDonut=()=>({k:'era',svg:C.donut(ERAK.map(k=>({label:ERA[k].t,value:(one?p.byEra:sumObj(P.map(x=>x.byEra)))[k]||0,color:ERA[k].c})),{title:T('بين العصور'),sub:'القديمة حتى ق٨ · المتأخرة ق٩–١٤ · المعاصرة',center:'ذكرًا'})});
    const eraGroup=()=>({k:'era',svg:C.grouped(ERAK.slice(0,3).map(k=>ERA[k].t),P.map((x,i)=>({name:x.term,values:ERAK.slice(0,3).map(k=>x.byEra[k]||0),color:C.PAL[i%C.PAL.length]})),{title:'مقارنة المصطلحات بين الكتب القديمة والمتأخرة والمعاصرة',sub:'مرات الذكر في كل عصر'})});
    const cent=()=>{const ax=centAxis(P.map(x=>x.byCent));return{k:'cent',svg:C.area(ax.map(c=>'ق'+ar(c)),P.map((x,i)=>({name:x.term,values:ax.map(c=>x.byCent[c]||0),color:C.PAL[i%C.PAL.length]})),{title:T('عبر القرون'),sub:'بحسب قرن وفاة المؤلف'})}};
    const gradeStack=()=>({k:'grade',svg:C.stack(ERAK.filter(k=>P.some(x=>x.byEra[k])).map(k=>ERA[k].t),GK.map(g=>({t:G.short(g),c:G.color(g)})),ERAK.filter(k=>P.some(x=>x.byEra[k])).map(k=>GK.map(g=>P.reduce((s,x)=>s+(x.eraGrade[k+'›'+g]||0),0))),{title:T(': ثبوته واعتباره في كل عصر'),sub:'نسبة النصوص بحسب درجة النقل'})});
    const gradeDonut=()=>({k:'grade',svg:C.donut(GK.map(g=>({label:G.name(g),value:(one?p.byGrade:sumObj(P.map(x=>x.byGrade)))[g]||0,color:G.color(g)})),{title:T(': درجات النقل'),sub:'عدد النصوص لكل درجة',center:'نصًا'})});
    const gradeMulti=()=>({k:'grade',svg:C.heat(P.map(x=>x.term),GK.map(G.short),P.map(x=>GK.map(g=>x.byGrade[g]||0)),{title:'ثبوت كل مصطلح: درجات النقل',sub:'عدد النصوص في كل درجة'})});
    const sank=()=>{const L1=ERAK.map(k=>({k,t:ERA[k].t,c:ERA[k].c})),R1=GK.map(g=>({k:g,t:G.short(g),c:G.color(g)}));const links=[];
      ERAK.forEach(k=>GK.forEach(g=>{const v=P.reduce((s,x)=>s+(x.eraGrade[k+'›'+g]||0),0);if(v)links.push({s:k,t:g,value:v})}));
      return{k:'grade',svg:C.sankey(L1,R1,links,{title:T(': من العصر إلى درجة النقل'),sub:'كل شريط عدد النصوص'})}};
    const doors=()=>{const ids=DOORS.map(d=>d.id).filter(id=>P.some(x=>x.byDoor[id])||['sifat','liqaat','aqwal','ghayba','alamat','zuhur','tawasul'].includes(id)).filter(id=>id!=='mawaqi'&&id!=='daftar'&&id!=='kutub');
      return{k:'door',svg:C.radar(ids.map(doorT),P.map((x,i)=>({name:x.term,values:ids.map(id=>x.byDoor[id]||0),color:C.PAL[i%C.PAL.length]})),{title:T('في أبواب التطبيق'),sub:'أين يتوزع الحديث عنه'})}};
    const heatDoor=()=>{const ids=[...new Set(P.flatMap(x=>Object.keys(x.byDoor)))];return{k:'door',svg:C.heat(P.map(x=>x.term),ids.map(doorT),P.map(x=>ids.map(id=>x.byDoor[id]||0)),{title:'خريطة حرارية: المصطلحات × الأبواب',sub:'كلما اشتد اللون كثر الذكر'})}};
    const sun=()=>{const s=one?p.bySection:sumObj(P.map(x=>x.bySection)),by={};Object.entries(s).forEach(([k,v])=>{const [d,sec]=k.split('›');(by[d]=by[d]||{label:doorT(d),value:0,color:doorC(d),children:[]}).value+=v;by[d].children.push({label:sec,value:v})});
      return{k:'door',svg:C.sunburst(Object.values(by).sort((a,b)=>b.value-a.value),{title:T(': الأبواب وأقسامها'),sub:'الحلقة الداخلية الأبواب، والخارجية أقسامها',center:one?p.term:''})}};
    const mindC=()=>{const tree=P.length>1?{label:'المقارنة',children:P.map((x,i)=>({label:x.term,value:x.total,color:C.PAL[i%C.PAL.length],children:sorted(x.byBook,4).map(([l,v])=>({label:l,value:v}))}))}
        :{label:p.term,children:sorted(p.byDoor,8).map(([d,v])=>{const secs=sorted(Object.fromEntries(Object.entries(p.bySection).filter(([k])=>k.startsWith(d+'›')).map(([k,v2])=>[k.split('›')[1],v2])),2);
          const bks=sorted(p.hits.filter(h=>h.u.door===d).reduce((o,h)=>(o[h.u.book]=(o[h.u.book]||0)+h.c,o),{}),2);
          return{label:doorT(d),value:v,color:doorC(d),children:[...secs,...bks].map(([l,v2])=>({label:l,value:v2}))}})};
      return{k:'mind',svg:C.mind(tree,{title:T(': خريطة ذهنية'),sub:P.length>1?'كل فرع مصطلح، وأوراقه أكثر كتبه ذكرًا له':'الفروع أبواب، والأوراق أقسامها ومصادرها'})}};
    const cloudC=()=>({k:'cloud',svg:C.cloud(a.cooc.slice(0,32),{title:T(': الكلمات المصاحبة'),sub:'أكثر الكلمات ورودًا معه في النصوص نفسها'})});
    const bub=()=>{const m={};P.forEach(x=>x.hits.forEach(h=>{if(!h.u.death)return;const k=h.u.book;(m[k]=m[k]||{label:k,x:h.u.death,v:0}).v+=h.c}));
      return{k:'cent',svg:C.bubbles(Object.values(m).map(d=>({...d,color:ERA[L.eraOf(d.x)].c})),{title:T(': المصادر على خط الزمن'),sub:'موضع الفقاعة قرن المؤلف، وحجمها مرات الذكر'})}};
    const tree=()=>({k:'book',svg:C.treemap(sorted(one?p.byBook:sumObj(P.map(x=>x.byBook)),18).map(([l,v])=>({label:l,value:v})),{title:T(': مساحة كل مصدر'),sub:'المساحة على قدر الذكر'})});
    const type=()=>({k:'book',svg:C.rose(GK.map(g=>({label:G.short(g),value:(one?p.byGrade:sumObj(P.map(x=>x.byGrade)))[g]||0,color:G.color(g)})),{title:T(': وردة الدرجات'),sub:'طول البتلة على قدر النصوص'})});
    const multiBook=()=>{const books=sorted(sumObj(P.map(x=>x.byBook)),7).map(b=>b[0]);return{k:'book',svg:C.grouped(books.map(b=>b.replace(/ وتمام النعمة| في معرفة الأئمة/,'')),P.map((x,i)=>({name:x.term,values:books.map(b=>x.byBook[b]||0),color:C.PAL[i%C.PAL.length]})),{title:'المصطلحات في أكثر الكتب ذكرًا لها',sub:'مرات الذكر'})}};
    // للمتون الكاملة
    const BK=()=>sorted(sumObj(P.map(x=>x.byBook))).map(b=>b[0]);
    const share=()=>({k:'book',svg:C.donut(sorted(sumObj(P.map(x=>x.byBook)),9).map(([l,v],i)=>({label:l,value:v,color:C.PAL[i%C.PAL.length]})),{title:T(': نصيب كل كتاب'),sub:'من مجموع مرات الذكر',center:'ذكرًا'})});
    const bookGrade=()=>{const bk=BK().filter(b=>GK.some(g=>P.some(x=>(x.bookGrade[b+'›'+g]||0)&&g!=='Mnone'))).slice(0,8);const gk=GK.filter(g=>g!=='Mnone');
      return{k:'grade',svg:C.stack(bk,gk.map(g=>({t:G.short(g),c:G.color(g)})),bk.map(b=>gk.map(g=>P.reduce((s,x)=>s+(x.bookGrade[b+'›'+g]||0),0))),{title:T(': ثبوته عند المجلسي'),sub:'نسبة الأحاديث بحسب تقييمه، فيما قيّمه منها'})}};
    const maj=()=>{const gk=GK.filter(g=>g[0]==='M'&&g!=='Mnone');return{k:'grade',svg:C.donut(gk.map(g=>({label:G.short(g),value:(sumObj(P.map(x=>x.byGrade)))[g]||0,color:G.color(g)})),{title:T(': تقييم المجلسي'),sub:'في مرآة العقول لأحاديث الكافي',center:'حديثًا'})}};
    const beh=()=>{const o=sumObj(P.map(x=>x.byBeh)),bk=[...new Set(Object.keys(o).map(k=>k.split('›')[0]))];
      return{k:'grade',svg:C.stack(bk,[{t:'صحيح عند البهبودي',c:'#22C55E'},{t:'لم يُخرجه',c:'#6b5d4a'}],bk.map(b=>[o[b+'›1']||0,o[b+'›0']||0]),{title:T(': ما صحّحه البهبودي'),sub:'نسبة الأحاديث المختارة في الصحيح من كل كتاب'})}};
    const vols=()=>{const sec=sumObj(P.map(x=>x.bySection)),bk=BK().filter(b=>Object.keys(sec).some(k=>k.startsWith(b+'›')&&k!==b+'›ج١')).slice(0,6);if(!bk.length)return share();
      const vs=[...new Set(Object.keys(sec).filter(k=>bk.some(b=>k.startsWith(b+'›'))).map(k=>k.split('›')[1]))].sort((x,y)=>x.localeCompare(y,'ar',{numeric:true}));
      return{k:'book',svg:C.heat(bk,vs,bk.map(b=>vs.map(v=>sec[b+'›'+v]||0)),{title:T(': في أجزاء كل كتاب'),sub:'أين يتركز الذكر داخل الكتاب'})}};
    const heatBook=()=>{const bk=BK().slice(0,8);return{k:'book',svg:C.heat(P.map(x=>x.term),bk,P.map(x=>bk.map(b=>x.byBook[b]||0)),{title:'خريطة حرارية: المصطلحات × الكتب',sub:'كلما اشتد اللون كثر الذكر'})}};
    const sunC=()=>{const s=sumObj(P.map(x=>x.bySection)),by={};Object.entries(s).forEach(([k,v])=>{const [b,sec]=k.split('›');(by[b]=by[b]||{label:b,value:0,children:[]}).value+=v;by[b].children.push({label:sec,value:v})});
      return{k:'book',svg:C.sunburst(Object.values(by).sort((x,y)=>y.value-x.value).slice(0,10),{title:T(': الكتب وأجزاؤها'),sub:'الحلقة الداخلية الكتب، والخارجية أجزاؤها',center:one?p.term:''})}};
    const mindB=()=>{const tree=P.length>1?{label:'المقارنة',children:P.map((x,i)=>({label:x.term,value:x.total,color:C.PAL[i%C.PAL.length],children:sorted(x.byBook,4).map(([l,v])=>({label:l,value:v}))}))}
        :{label:p.term,children:sorted(p.byBook,7).map(([b,v],i)=>({label:b,value:v,color:C.PAL[i%C.PAL.length],children:sorted(Object.fromEntries(Object.entries(p.bySection).filter(([k])=>k.startsWith(b+'›')).map(([k,v2])=>[k.split('›')[1],v2])),3).map(([l,v2])=>({label:l,value:v2}))}))};
      return{k:'mind',svg:C.mind(tree,{title:T(': خريطة ذهنية'),sub:'الفروع كتب، والأوراق أجزاؤها'})}};
    const hasMaj=GK.some(g=>g[0]==='M'&&g!=='Mnone'),hasBeh=P.some(x=>Object.keys(x.byBeh).length);
    if(a.corpus&&!a.withApp){const planC=one?{auto:[byBook,share,vols,...(hasMaj?[maj]:[]),...(hasBeh?[beh]:[]),mindB,cloudC,tree,sunC],book:[byBook,share,tree,vols,sunC],era:[byBook,share,cent],cent:[byBook,vols,cent],grade:[...(hasMaj?[maj,bookGrade]:[]),...(hasBeh?[beh]:[]),byBook,share],door:[sunC,vols,mindB],mind:[mindB,sunC,cloudC],cloud:[cloudC,mindB,byBook]}
        :{auto:[multiBook,heatBook,...(hasMaj?[gradeMulti]:[]),...(hasBeh?[beh]:[]),mindB,vols,cloudC],book:[multiBook,heatBook,tree,vols],era:[multiBook,heatBook],cent:[multiBook,vols],grade:[...(hasMaj?[gradeMulti,bookGrade]:[]),...(hasBeh?[beh]:[]),multiBook],door:[heatBook,sunC,mindB],mind:[mindB,sunC,cloudC],cloud:[cloudC,mindB,multiBook]};
      (planC[V]||planC.auto).filter((f,i,arr)=>arr.indexOf(f)===i).forEach((fn,i)=>list.push({...fn(),big:i===0}));return list}
    const plan=one?{auto:[byBook,eraDonut,cent,gradeStack,mindC,sank,doors,cloudC,bub,tree,gradeDonut,sun],book:[byBook,tree,bub,eraDonut,gradeStack,cent],era:[eraDonut,gradeStack,cent,bub,byBook,sank],cent:[cent,bub,eraDonut,byBook],grade:[gradeStack,sank,gradeDonut,type,eraDonut,byBook],door:[doors,sun,mindC,byBook],mind:[mindC,sun,cloudC,doors],cloud:[cloudC,mindC,byBook]}
      :{auto:[eraGroup,multiBook,cent,heatDoor,gradeMulti,mindC,doors,sank,cloudC,bub],book:[multiBook,byBook,tree,bub],era:[eraGroup,cent,gradeStack,bub],cent:[cent,bub,eraGroup],grade:[gradeMulti,gradeStack,sank,gradeDonut],door:[heatDoor,doors,sun,mindC],mind:[mindC,sun,cloudC],cloud:[cloudC,mindC,multiBook]};
    (plan[V]||plan.auto).forEach((fn,i)=>list.push({...fn(),big:i===0}));return list}
  const sumObj=arr=>arr.reduce((o,x)=>{Object.entries(x).forEach(([k,v])=>o[k]=(o[k]||0)+v);return o},{});
  let cid=0;const BANK={};
  function card(c,i){const id='c'+(++cid);BANK[id]=c.svg;
    return `<figure class="lab-card ${c.big?'big':''}" style="--i:${i}" id="${id}">${c.svg}
      <figcaption><button type="button" class="ic" data-zoom="${id}" aria-label="تكبير" title="تكبير" data-sfx="open">${ic('expand')}</button><button type="button" class="ic" data-png="${id}" aria-label="صورة PNG" title="حفظ صورة" data-sfx="key">${ic('image')}</button><button type="button" class="ic" data-svg="${id}" aria-label="ملف SVG" title="حفظ رسم متجه" data-sfx="key">${ic('download')}</button></figcaption></figure>`}

  /* ---------- الجداول ---------- */
  let rows=[],sortK='c',shown=30;
  function table(a){rows=[];shown=30;a.per.forEach((p,pi)=>p.hits.forEach(h=>rows.push({p:pi,term:p.term,n:p.n,u:h.u,c:h.c})));
    if(!rows.length)return '';return `<section class="lab-tbl"><div class="tbl-h"><h2>${ic('table')} جدول المواضع</h2><select id="tSort" aria-label="ترتيب الجدول"><option value="c">الأكثر ذكرًا</option><option value="d">الأقدم مصدرًا</option><option value="g">الدرجة</option><option value="b">اسم المصدر</option></select></div>
      <div class="tbl-w"><table><thead><tr><th>م</th><th>المصطلح</th><th>النص والمقتطف</th><th>المصدر</th><th>العصر</th><th>الدرجة</th><th>مرات</th></tr></thead><tbody id="tBody">${rowsHTML()}</tbody></table></div><div class="tbl-more" id="tMore">${moreHTML()}</div></section>`}
  const moreHTML=()=>rows.length>shown?`<button class="btn2" id="tMoreB" data-sfx="paper">اعرض المزيد (${ar(Math.min(rows.length,shown+30))} من ${ar(rows.length)})</button><small class="muted">والجدول المصدَّر يحمل المواضع كلها</small>`:'';
  function rowsHTML(){const G=(last&&last.gs)||L.scheme(),g=G.keys;const r=[...rows].sort((x,y)=>sortK==='c'?y.c-x.c:sortK==='d'?(x.u.death||9999)-(y.u.death||9999):sortK==='g'?g.indexOf(x.u.grade)-g.indexOf(y.u.grade):x.u.book.localeCompare(y.u.book,'ar'));
    return r.slice(0,shown).map((x,i)=>{const s=L.snippet(x.u.raw,x.n);return `<tr style="--i:${Math.min(i,20)}"><td data-l="م">${ar(i+1)}</td><td data-l="المصطلح"><span class="dot" style="--c:${C.PAL[x.p%C.PAL.length]}"></span>${esc(x.term)}</td>
      <td data-l="النص" class="tx">${x.u.corpus?`<a href="${esc(x.u.url)}" target="_blank" rel="noopener" data-sfx="key"><b>${esc(x.u.title)}</b> ${ic('link')}</a>`:`<a href="#/item/${esc(x.u.id)}" data-sfx="paper"><b>${esc(x.u.title)}</b></a>`}${s?`<q>${esc(s.pre)}<mark>${esc(s.hit)}</mark>${esc(s.post)}</q>`:''}</td>
      <td data-l="المصدر">${esc(x.u.book)}${x.u.author?`<small>${esc(x.u.author)}</small>`:''}</td><td data-l="العصر"><span class="era" style="--c:${ERA[x.u.era].c}">${ERA[x.u.era].t}</span>${x.u.cent?`<small>ق${ar(x.u.cent)}</small>`:''}</td>
      <td data-l="الدرجة">${x.u.grade==='Mnone'&&!x.u.beh?'<small>—</small>':`<span class="grade" style="color:${G.color(x.u.grade)}">${esc(x.u.grade==='Mnone'?'':G.name(x.u.grade))}</span>`}${x.u.beh?'<small class="beh">صحيح عند البهبودي</small>':''}</td><td data-l="مرات" class="num">${ar(x.c)}</td></tr>`}).join('')}
  function titles(a){const b=a.per.flatMap(p=>p.titleBooks.map(x=>({...x,term:p.term})));if(!b.length)return '';
    return `<section class="lab-tbl"><h2>${ic('shelf')} كتب يحمل عنوانها المصطلح</h2><p class="muted">من فهرس الـ${ar(Lab.build().books.length)} عنوانًا؛ يُعرف منها اتجاه التأليف في القضية عبر العصور.</p>
      <div class="tbl-w"><table><thead><tr><th>العنوان</th><th>المؤلف</th><th>الوفاة</th><th>العصر</th><th>النوع</th></tr></thead><tbody>${b.map(x=>`<tr><td><b>${esc(x.t)}</b></td><td>${esc(x.a)}</td><td>${esc(x.d)}</td><td><span class="era" style="--c:${ERA[x.era].c}">${ERA[x.era].t}</span></td><td>${L.KIND[x.kind]||''}</td></tr>`).join('')}</tbody></table></div></section>`}
  const note=a=>a&&a.corpus?`<p class="lab-note">المتون الكاملة من موقع «ثقلين» (thaqalayn.net) بنسخها العربية، والعدّ على النص بلا تشكيل فيشمل السند والمتن. تقييم المجلسي من مرآة العقول ويخص الكافي، وتقييم البهبودي كما نقله الموقع. والتقييم بيان لحال السند عند صاحبه لا حكم من التطبيق. ${a.withApp?`وأُضيفت نصوص التطبيق الموثقة (${ar(Lab.build().units.length)} نصًا) لتشمل المقارنة الكتب المعاصرة.`:''}</p>`
    :`<p class="lab-note">الأرقام محسوبة من نصوص التطبيق الموثقة (${ar(Lab.build().units.length)} نصًا) لا من متون الكتب كاملة. ولمقارنة المتون الكاملة اختر «الكتب الأربعة» أو «كتب الغيبة» أو «كل الكتب المفهرسة». والدرجة تبيّن طريق النقل ولا تعني الحكم بصحته. والعصر بحسب وفاة المؤلف.</p>`;
  const actions=()=>`<section class="lab-acts"><button class="btn" id="aAI" data-sfx="ember">${ic('spark')} حلّل بعمق مع Claude</button><button class="btn2" id="aPrint" data-sfx="paper">${ic('print')} اطبع أو احفظ PDF</button><button class="btn2" id="aHtml" data-sfx="key">${ic('download')} صدّر التقرير</button><button class="btn2" id="aCsv" data-sfx="key">${ic('table')} صدّر الجدول CSV</button></section>`;

  /* ---------- صورة المكتبة دون سؤال ---------- */
  function overviewHTML(){const o=L.overview();const k=[[o.units,'نصًا موثقًا'],[o.withText,'بمتنه الحرفي'],[o.sources,'مصدرًا'],[o.books,'عنوانًا في الفهرس']];
    const ax=centAxis([o.uCent,o.bCent]);
    const list=[
      {svg:C.donut(ERAK.map(k=>({label:ERA[k].t,value:o.uEra[k]||0,color:ERA[k].c})),{title:'نصوص التطبيق بين العصور',sub:'بحسب عصر مصدر كل نص',center:'نصًا'}),big:true},
      {svg:C.area(ax.map(c=>'ق'+ar(c)),[{name:'نصوص التطبيق',values:ax.map(c=>o.uCent[c]||0)},{name:'كتب الفهرس',values:ax.map(c=>o.bCent[c]||0),color:'#38BDF8'}],{title:'المادة عبر القرون',sub:'نصوص التطبيق وكتب الفهرس بحسب قرن المؤلف'})},
      {svg:C.hbar(sorted(o.uBook,12).map(([l,v])=>({label:l,value:v})),{title:'أكثر المصادر نصوصًا في التطبيق',sub:'عدد النصوص المنقولة من كل مصدر'})},
      {svg:C.stack(ERAK.filter(k=>o.uEra[k]).map(k=>ERA[k].t),L.GR.map(g=>({t:gName(g),c:L.GRADE_C[g]})),ERAK.filter(k=>o.uEra[k]).map(k=>L.GR.map(g=>o.eraGrade[k+'›'+g]||0)),{title:'الثبوت والاعتبار في كل عصر',sub:'نسبة النصوص بحسب درجة النقل'})},
      {svg:C.sankey(ERAK.map(k=>({k,t:ERA[k].t,c:ERA[k].c})),L.GR.map(g=>({k:g,t:gName(g),c:L.GRADE_C[g]})),ERAK.flatMap(k=>L.GR.map(g=>({s:k,t:g,value:o.eraGrade[k+'›'+g]||0}))),{title:'من العصر إلى درجة النقل',sub:'تدفق النصوص'})},
      {svg:C.radar(DOORS.filter(d=>o.uDoor[d.id]).map(d=>d.t),[{name:'النصوص',values:DOORS.filter(d=>o.uDoor[d.id]).map(d=>o.uDoor[d.id])}],{title:'النصوص في أبواب التطبيق',sub:'توزيع المادة الموثقة'})},
      {svg:C.treemap(sorted(o.uBook,20).map(([l,v])=>({label:l,value:v})),{title:'خريطة المصادر',sub:'المساحة على قدر النصوص'})},
      {svg:C.grouped(['القديمة','المتأخرة','المعاصرة','الموسوعات'],Object.keys(L.KIND).map((k,i)=>({name:L.KIND[k],values:[1,2,3,4].map(s=>Lab.build().books.filter(b=>b.sec===s&&b.kind===k).length),color:C.PAL[i]})),{title:'فهرس الكتب: الأقسام والأحجام',sub:'من الكتيب إلى الموسوعة'})},
      {svg:C.rose(Object.keys(L.KIND).map((k,i)=>({label:L.KIND[k],value:o.bKind[k]||0,color:C.PAL[i]})),{title:'أحجام كتب الفهرس',sub:'عدد العناوين لكل نوع'})},
    ];
    return `<section class="lab-und"><h2>${ic('spark')} صورة المكتبة الآن</h2><p class="muted">اكتب سؤالًا بحثيًا أو اختر مثالًا، فيُستخرج المصطلح ويُقاس حضوره ويُرسم. هذه خلاصة المادة التي تجري عليها المقارنات.</p></section>
      <section class="kpis">${k.map(([v,t],i)=>`<div class="kpi" style="--i:${i}"><b data-count="${v}">${ar(v)}</b><span>${t}</span></div>`).join('')}</section>
      <section class="lab-grid">${list.map(card).join('')}</section>${note()}
      <section class="lab-acts"><button class="btn2" id="aPrint" data-sfx="paper">${ic('print')} اطبع أو احفظ PDF</button><button class="btn2" id="aHtml" data-sfx="key">${ic('download')} صدّر التقرير</button></section>`}

  /* ---------- الربط ---------- */
  function wire(out){out.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{st.terms.splice(+b.dataset.rm,1);run()});
    const ta=out.querySelector('#termAdd');if(ta)ta.onsubmit=e=>{e.preventDefault();const v=out.querySelector('#termIn').value.trim();if(v&&st.terms.length<6){st.terms.push(...fix([v]));run()}};
    out.querySelectorAll('[data-zoom]').forEach(b=>b.onclick=()=>zoom(b.dataset.zoom));
    out.querySelectorAll('[data-png]').forEach(b=>b.onclick=()=>png(b.dataset.png));
    out.querySelectorAll('[data-svg]').forEach(b=>b.onclick=()=>save(name(b.dataset.svg)+'.svg','image/svg+xml',standalone(BANK[b.dataset.svg])));
    const s=out.querySelector('#tSort');if(s)s.onchange=()=>{sortK=s.value;document.getElementById('tBody').innerHTML=rowsHTML()};
    const more=()=>{const b=document.getElementById('tMoreB');if(b)b.onclick=()=>{shown+=30;document.getElementById('tBody').innerHTML=rowsHTML();document.getElementById('tMore').innerHTML=moreHTML();more()}};more();
    const on=(id,f)=>{const e=out.querySelector('#'+id);if(e)e.onclick=f};
    on('ldRetry',()=>run());on('ldApp',()=>{st.src='app';run()});on('aPrint',printReport);on('aHtml',()=>save(fileBase()+'.html','text/html',reportHTML()));on('aCsv',csv);on('aAI',claude);
    countUp(out)}
  function countUp(out){if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;out.querySelectorAll('[data-count]').forEach(el=>{const v=+el.dataset.count,t0=performance.now();
    const dec=v%1?10:1;const step=t=>{const k=Math.min(1,(t-t0)/900),e=1-Math.pow(1-k,3);el.textContent=ar(Math.round(v*e*dec)/dec);if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)})}
  function zoom(id){const sh=document.getElementById('sheet');sh.innerHTML=`<div class="sh-bg"></div><div class="sh lab-zoom"><button class="ic sh-x" aria-label="إغلاق" data-sfx="close">${ic('x')}</button>${BANK[id]}<div class="rw"><button class="btn2" id="zP" data-sfx="key">${ic('image')} صورة</button><button class="btn2" id="zS" data-sfx="key">${ic('download')} SVG</button></div></div>`;
    sh.hidden=false;const close=()=>{sh.hidden=true;sh.innerHTML=''};sh.querySelector('.sh-bg').onclick=close;sh.querySelector('.sh-x').onclick=close;
    sh.querySelector('#zP').onclick=()=>png(id);sh.querySelector('#zS').onclick=()=>save(name(id)+'.svg','image/svg+xml',standalone(BANK[id]))}

  /* ---------- التصدير ---------- */
  const fileBase=()=>'المستور-بحث'+(st.terms.length?'-'+st.terms.join('-'):'-المكتبة');
  const name=id=>{const m=(BANK[id]||'').match(/aria-label="([^"]*)"/);return 'المستور-'+((m&&m[1])||'رسم').replace(/[«»"':؟?\/\\]/g,'').trim().replace(/\s+/g,'-').slice(0,60)};
  let FONT_CSS=null;
  async function fontCSS(){if(FONT_CSS)return FONT_CSS;try{const b64=async u=>{const r=await fetch(u);const bl=await r.blob();return await new Promise(res=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.readAsDataURL(bl)})};
      const [a,b]=await Promise.all([b64('fonts/Tajawal-500-1.woff2'),b64('fonts/Tajawal-700-1.woff2')]);
      FONT_CSS=`@font-face{font-family:Tajawal;font-weight:400 600;src:url(${a})}@font-face{font-family:Tajawal;font-weight:700 900;src:url(${b})}`}catch(e){FONT_CSS=''}return FONT_CSS}
  function standalone(svg,css=''){return '<?xml version="1.0" encoding="UTF-8"?>\n'+svg.replace('<defs>',`<defs>${css?`<style>${css}</style>`:''}`).replace(/ class="[^"]*"/g,'').replace(/ style="--i:\d+"/g,'')}
  async function png(id){App.toast('يُجهَّز الرسم…');const css=await fontCSS();const s=standalone(BANK[id],css),vb=s.match(/viewBox="0 0 (\d+) (\d+)"/),W=+vb[1],H=+vb[2],k=2.5;
    const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=W*k;c.height=H*k;const g=c.getContext('2d');g.drawImage(img,0,0,c.width,c.height);
      const d=c.toDataURL('image/png');saveData(name(id)+'.png','image/png',d)};img.onerror=()=>App.toast('تعذّر تجهيز الصورة؛ جرّب حفظ SVG');
    img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s)}
  function saveData(fn,mime,dataUrl){if(window.NativeApp&&NativeApp.saveFile){NativeApp.saveFile(fn,mime,dataUrl.split(',')[1]);return}
    const a=document.createElement('a');a.href=dataUrl;a.download=fn;document.body.appendChild(a);a.click();a.remove();App.toast('حُفظ الملف')}
  function save(fn,mime,text){if(window.NativeApp){if(NativeApp.saveFile){NativeApp.saveFile(fn,mime,btoa(unescape(encodeURIComponent(text))));return}NativeApp.saveText(fn,text);return}
    const u=URL.createObjectURL(new Blob([text],{type:mime+';charset=utf-8'})),a=document.createElement('a');a.href=u;a.download=fn;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);App.toast('حُفظ الملف')}
  function csv(){const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';const h=['المصطلح','النص','المقتطف','المصدر','المؤلف','العصر','القرن','الدرجة','مرات الذكر','الرابط'];
    const body=rows.map(x=>{const s=L.snippet(x.u.raw,x.n);return [x.term,x.u.title,s?s.pre+s.hit+s.post:'',x.u.book,x.u.author,ERA[x.u.era].t,x.u.cent||'',(last.gs?last.gs.name(x.u.grade):x.u.grade)+(x.u.beh?' · صحيح عند البهبودي':''),x.c,x.u.url||''].map(q).join(',')});
    save(fileBase()+'.csv','text/csv','\ufeff'+[h.map(q).join(','),...body].join('\r\n'))}
  function reportHTML(){const out=document.getElementById('labOut').cloneNode(true);out.querySelectorAll('figcaption,.lab-acts,.term button,.term-add,select').forEach(e=>e.remove());
    out.querySelectorAll('[class]').forEach(e=>{if(e.tagName==='svg'||e.closest('svg'))e.removeAttribute('class')});
    const title='البحوث والمقارنات'+(st.terms.length?': '+st.terms.join('، '):'');
    return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>
body{margin:0;padding:24px;background:#0b0805;color:#f5ead6;font:16px/1.7 Tajawal,Cairo,system-ui,sans-serif;max-width:1000px;margin:auto}h1{color:#F2B632;margin:0}h2{color:#ffd36e;font-size:19px}svg{width:100%;height:auto;display:block}
figure{margin:0 0 16px}.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}.kpi{border:1px solid #F2B63255;border-radius:14px;padding:10px;text-align:center}.kpi b{display:block;font-size:26px;color:#F2B632}
.lab-grid{display:grid;gap:14px}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #F2B63233;padding:6px 8px;vertical-align:top;text-align:right}th{background:#2a1d12;color:#ffd36e}td small{display:block;color:#c4b398}q{display:block;color:#c4b398;quotes:none}mark{background:#F2B632;color:#1a120b;border-radius:3px}
a{color:#ffd36e}.term{display:inline-block;border:1px solid #F2B632;border-radius:99px;padding:2px 12px;margin:2px}.muted,.lab-note{color:#c4b398}.dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--c);margin-left:6px}.era{color:var(--c)}
@media print{body{padding:0}figure,tr{break-inside:avoid}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>
<h1>${esc(title)}</h1><p class="muted">تطبيق «المستور» · بإشراف مجموعة بقية الله · ${new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-arab',{dateStyle:'long'}).format(new Date())}${st.q?`<br>السؤال: ${esc(st.q)}`:''}</p>${out.innerHTML}</body></html>`}
  function printReport(){document.body.classList.add('lab-printing');const done=()=>document.body.classList.remove('lab-printing');
    if(window.NativeApp&&NativeApp.printPage){addEventListener('hashchange',done,{once:true});NativeApp.printPage(fileBase());return}
    if(window.NativeApp){save(fileBase()+'.html','text/html',reportHTML());done();App.toast('احفظ التقرير ثم افتحه للطباعة');return}
    addEventListener('afterprint',done,{once:true});setTimeout(()=>window.print(),60)}

  /* ---------- الجسر إلى Claude ---------- */
  function claude(){if(!last||last.overview)return;const a=last;
    const lines=a.per.map(p=>{const b=sorted(p.byBook,8).map(([k,v])=>`${k}: ${v}`).join('؛ ');const e=ERAK.map(k=>`${ERA[k].t}: ${p.byEra[k]||0}`).join('، ');const g=sorted(p.byGrade).map(([k,v])=>`${a.gs.name(k)}: ${v}`).join('، ');
      return `• «${p.term}»: ${p.total} ذكرًا في ${p.items} نصًا.\n  حسب الكتب: ${b}\n  حسب العصور: ${e}\n  درجات النقل: ${g}`}).join('\n');
    const ex=rows.slice().sort((x,y)=>y.c-x.c).slice(0,10).map(x=>{const s=L.snippet(x.u.raw,x.n,90);return `- ${x.u.book}${x.u.author?` (${x.u.author})`:''}${x.u.url?` ${x.u.url}`:''}: «${s?s.pre+s.hit+s.post:x.u.title}»`}).join('\n');
    const prompt=`أنت باحث متخصص في الدراسات المهدوية عند الشيعة الإمامية الاثني عشرية.
سؤالي البحثي: ${st.q||st.terms.join('، ')}
هذه إحصاءات من تطبيق «المستور» محسوبة من ${a.pool} ${a.corpus?`حديثًا ونصًا في: ${a.src.t} (المتون من ثقلين thaqalayn.net)`:'نصًا موثقًا (عينة مجموعة، لا متون الكتب كاملة)'}:
${lines}
مقتطفات مع مصادرها:
${ex}
المطلوب: تحليل مقارن لحضور القضية وثبوتها بين المصادر القديمة والمتأخرة والمعاصرة، مع خريطة ذهنية نصية وجدول، والتنبيه على حدود العينة. اعتمد مصادر الإمامية، واذكر الخلاف دون ترجيح من عندك، ولا تنسب نصًا لم يرد في مصدره، ولا توقيت للظهور.`;
    try{navigator.clipboard&&navigator.clipboard.writeText(prompt).catch(()=>{})}catch(e){}
    const u='https://claude.ai/new?q='+encodeURIComponent(prompt.length>5000?prompt.slice(0,5000)+'…':prompt);
    const sh=document.getElementById('sheet');sh.innerHTML=`<div class="sh-bg"></div><div class="sh"><button class="ic sh-x" aria-label="إغلاق" data-sfx="close">${ic('x')}</button>
      <h3>${ic('spark')} تحليل أعمق مع Claude</h3><p class="muted">جهّزتُ طلبًا يحمل سؤالك وأرقام المقارنة ومقتطفاتها بمصادرها، ونسختُه أيضًا. يحتاج اتصالًا بالإنترنت وحسابًا في Claude.</p>
      <textarea rows="8" readonly>${esc(prompt)}</textarea><a class="btn" href="${esc(u)}" target="_blank" rel="noopener" data-sfx="ember">${ic('link')} افتح Claude بالطلب</a><button class="btn2" id="cpP" data-sfx="pen">انسخ الطلب</button></div>`;
    sh.hidden=false;const close=()=>{sh.hidden=true;sh.innerHTML=''};sh.querySelector('.sh-bg').onclick=close;sh.querySelector('.sh-x').onclick=close;
    sh.querySelector('#cpP').onclick=()=>{const t=sh.querySelector('textarea');const ok=()=>App.toast('نُسخ الطلب'),fb=()=>{t.select();try{document.execCommand('copy');ok()}catch(e){App.toast('حدّد النص وانسخه')}};navigator.clipboard?navigator.clipboard.writeText(prompt).then(ok,fb):fb()}}

  return{page}
})();
