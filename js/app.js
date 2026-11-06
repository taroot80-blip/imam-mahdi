'use strict';
const App=(()=>{
  const view=document.getElementById('view'),sheet=document.getElementById('sheet'),toastEl=document.getElementById('toast');
  const GRADES={tawqi:'توقيع شريف',riwaya:'رواية في مصدر معتبر',thiqa:'عالم ثقة',kutub:'نقل كتب اللقاءات',dua:'دعاء مأثور',bahth:'بحث علمي'};
  window.gradeName=g=>GRADES[g]||'';
  const byId=id=>CONTENT.find(x=>x.id===id);
  const inDoor=d=>CONTENT.filter(x=>x.door===d);
  const sections=d=>[...new Set(inDoor(d).map(x=>x.section))];
  let toastT;
  function toast(m){toastEl.textContent=m;toastEl.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>toastEl.classList.remove('on'),2400)}
  window.sourceHTML=it=>{const s=it.source||{};const loc=[s.vol&&`ج${s.vol}`,s.page&&`ص${s.page}`].filter(Boolean).join('، ');
    return `<h4>المصدر</h4><p class="src-main"><b>${esc(s.book||'')}</b>${s.author?` · ${esc(s.author)}`:''}${loc?` · ${esc(loc)}`:''}</p>
    ${it.alsoIn&&it.alsoIn.length?`<p class="src-also">وورد في: ${esc(it.alsoIn.join('، '))}</p>`:''}
    <p class="src-g"><span class="grade g-${esc(it.grade)}">${esc(gradeName(it.grade))}</span>${it.gradeNote?` ${esc(it.gradeNote)}`:''}</p>
    ${it.url?`<a class="src-link" href="${esc(it.url)}" target="_blank" rel="noopener" data-sfx="key">${ic('link')} افتح المصدر</a>`:''}`};
  function actions(box,it){
    const row=[['fav','heart','المفضلة'],['marks','mark','علامة رجوع']];
    box.innerHTML=row.map(([k,i,l])=>`<button class="ic act ${store.has(k,it.id)?'on':''}" data-k="${k}" aria-label="${l}" title="${l}" data-sfx="wax">${ic(i)}</button>`).join('')+
      `<button class="ic act" data-note aria-label="ملاحظة" title="ملاحظة" data-sfx="pen">${ic('note')}</button><button class="ic act" data-q aria-label="سؤال" title="سؤال" data-sfx="pen">${ic('q')}</button>`;
    box.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const on=store.toggle(b.dataset.k,it.id);b.classList.toggle('on',on);toast(on?'أُضيف إلى دفترك':'أُزيل من دفترك')});
    box.querySelector('[data-note]').onclick=()=>noteDlg(it,'note');box.querySelector('[data-q]').onclick=()=>noteDlg(it,'q');
  }
  function noteDlg(it,kind){const key=kind==='q'?'questions':'notes',all=store.get(key,{}),lbl=kind==='q'?'سؤالك':'ملاحظتك';
    openSheet(`<h3>${lbl}</h3><p class="muted">${esc(it.title)}</p><textarea id="nt" rows="6">${esc(all[it.id]||'')}</textarea><button class="btn" id="ntS" data-sfx="save">احفظ</button>`);
    sheet.querySelector('#ntS').onclick=()=>{const v=sheet.querySelector('#nt').value.trim();if(v)all[it.id]=v;else delete all[it.id];store.set(key,all);closeSheet();toast('حُفظ في دفترك')}}
  function openSheet(h){sheet.innerHTML=`<div class="sh-bg"></div><div class="sh"><button class="ic sh-x" aria-label="إغلاق" data-sfx="close">${ic('x')}</button>${h}</div>`;sheet.hidden=false;SFX.play('open');
    sheet.querySelector('.sh-bg').onclick=closeSheet;sheet.querySelector('.sh-x').onclick=closeSheet}
  function closeSheet(){sheet.hidden=true;sheet.innerHTML=''}

  /* ---------- الرئيسية ---------- */
  function dial(){const ticks=Array.from({length:60},(_,i)=>`<line class="t ${i%5?'':'b'}" x1="180" y1="10" x2="180" y2="${i%5?15:20}" transform="rotate(${i*6} 180 180)"/>`).join('');
    const orbs=Array.from({length:12},(_,i)=>{const a=i*30*Math.PI/180;return `<circle class="o" cx="${(180+Math.sin(a)*133).toFixed(1)}" cy="${(180-Math.cos(a)*133).toFixed(1)}" r="3.4" style="--i:${i}"/>`}).join('');
    return `<svg class="dial" viewBox="0 0 360 360" aria-hidden="true">
      <defs><path id="rt" d="M180 180m-143 0a143 143 0 1 1 286 0a143 143 0 1 1 -286 0"/><linearGradient id="dg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe49a"/><stop offset="1" stop-color="#c58a1c"/></linearGradient></defs>
      <circle cx="180" cy="180" r="172" class="c1"/><g class="ring-t">${ticks}</g>
      <g class="ring-a"><text class="rtx" direction="rtl"><textPath href="#rt" startOffset="100%">السلام عليك يا بقية الله في أرضه · السلام عليك يا ميثاق الله · السلام عليك يا وعد الله المضمون · السلام عليك يا بقية الله في أرضه ·</textPath></text></g>
      <g class="ring-b">${orbs}<circle cx="180" cy="180" r="133" class="c2"/></g>
      <circle cx="180" cy="180" r="116" class="c3"/><circle cx="180" cy="180" r="116" class="c4" pathLength="60" id="secArc"/>
      <g id="secHand"><circle cx="180" cy="64" r="4.5" fill="url(#dg)"/></g></svg>`}
  let ageMode=store.get('ageMode','y'),ageT=null;
  function ageTick(){const box=document.getElementById('ageBig');if(!box){clearInterval(ageT);return}const a=Age.age();
    const set=(id,v)=>{const e=document.getElementById(id);if(e&&e.textContent!==v)e.textContent=v};
    if(ageMode==='y'){set('ageBig',new Intl.NumberFormat('ar-SA-u-nu-arab',{useGrouping:false}).format(a.years));set('ageU','سنة هجرية');set('ageSub',`${months(a.months)} و${dayz(a.days)}`)}
    if(ageMode==='d'){set('ageBig',ar(a.totalDays));set('ageU','يومًا');set('ageSub',`نحو ${ar(Math.floor(a.solarYears))} سنة شمسية`)}
    if(ageMode==='h'){set('ageBig',ar(a.totalHours));set('ageU','ساعة');set('ageSub','منذ فجر مولده')}
    if(ageMode==='m'){set('ageBig',ar(a.totalMinutes));set('ageU','دقيقة');set('ageSub','منذ فجر مولده')}
    set('ageClock',`${ar2(a.hours)}:${ar2(a.minutes)}:${ar2(a.seconds)}`);
    const s=document.getElementById('secHand');if(s)s.style.transform=`rotate(${a.seconds*6}deg)`;
    const c=document.getElementById('secArc');if(c)c.style.strokeDasharray=`${a.seconds+1} 60`;
    const big=document.getElementById('ageBig');if(big)big.dataset.len=big.textContent.length}
  function doorBtn(d,i){return `<a class="door" href="#/door/${d.id}" data-sfx="${d.sfx}" data-m="${d.m}" data-idle="${d.idle}" style="--c:${d.c};--dx:${d.dx}px;--dy:${d.dy}px;--i:${i}"><span class="d-glow"></span><span class="d-face"><span class="d-ic">${ic(d.i)}</span><b>${d.t}</b><small>${d.s}</small></span></a>`}
  function searchBar(v=''){return `<form class="sbar" id="sbar" role="search"><span>${ic('search')}</span><input id="q" type="search" enterkeyhint="search" placeholder="ابحث في الموضوعات والكتب" aria-label="البحث" value="${esc(v)}"><button type="button" class="mic" id="mic" aria-label="التلقين الصوتي" data-sfx="mic">${ic('mic')}</button></form>`}
  function wireSearch(){const f=document.getElementById('sbar');if(!f)return;f.onsubmit=e=>{e.preventDefault();location.hash='#/search/'+encodeURIComponent(f.q.value.trim())};
    const m=document.getElementById('mic'),SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){m.onclick=()=>toast('التلقين الصوتي غير متاح في هذا المتصفح');return}
    m.onclick=()=>{const r=new SR();r.lang='ar-KW';r.interimResults=true;m.classList.add('on');toast('تكلّم الآن');
      r.onresult=e=>{const t=[...e.results].map(x=>x[0].transcript).join('');f.q.value=t;if(e.results[e.results.length-1].isFinal){m.classList.remove('on');location.hash='#/search/'+encodeURIComponent(t.trim())}};
      r.onerror=e=>{m.classList.remove('on');toast(e.error==='not-allowed'?'اسمح للمتصفح باستعمال الميكروفون':'لم أسمع بوضوح، حاول مجددًا')};r.onend=()=>m.classList.remove('on');r.start()}}
  function home(){view.innerHTML=`${searchBar()}
    <section class="hero"><button class="core" id="core" aria-label="صفاته ووصفه" data-sfx="ember">${dial()}
      <span class="age"><small>عمره الشريف</small><b id="ageBig">—</b><i id="ageU"></i><em id="ageSub"></em><span id="ageClock" class="clk"></span></span></button>
      <div class="modes" role="group" aria-label="طريقة عرض العمر">${[['y','بالسنين'],['d','بالأيام'],['h','بالساعة'],['m','بالدقيقة']].map(([k,t])=>`<button data-a="${k}" class="${k===ageMode?'on':''}" data-sfx="tap">${t}</button>`).join('')}</div>
      <p class="hint">المس القرص لتخرج صفاته ووصفه</p></section>
    <section class="doors" aria-label="الأبواب">${DOORS.map(doorBtn).join('')}</section>`;
    document.getElementById('core').onclick=e=>{e.currentTarget.classList.add('burst');setTimeout(()=>{location.hash='#/door/sifat'},300)};
    view.querySelectorAll('.modes button').forEach(b=>b.onclick=()=>{ageMode=b.dataset.a;store.set('ageMode',ageMode);view.querySelectorAll('.modes button').forEach(x=>x.classList.toggle('on',x===b));ageTick()});
    wireSearch();ageTick();clearInterval(ageT);ageT=setInterval(ageTick,1000)}
  function doorsPage(){view.innerHTML=`<h1 class="ph">الأبواب</h1><section class="doors">${DOORS.map(doorBtn).join('')}</section>`}

  /* ---------- الأبواب ---------- */
  const head=d=>`<a class="back" href="#/" data-sfx="close">${ic('back')} الرئيسية</a><header class="dh" style="--c:${d.c}"><span class="d-ic">${ic(d.i)}</span><div><h1>${d.t}</h1><p>${d.s}</p></div></header>`;
  const card=(it,i)=>`<a class="it" href="#/item/${it.id}" style="--i:${i}" data-sfx="paper"><b>${esc(it.title)}</b>${it.witness?`<small>${esc(it.witness)}</small>`:''}<span class="grade g-${esc(it.grade)}">${esc(gradeName(it.grade))}</span></a>`;
  const pending=t=>`<div class="pend"><b>${esc(t)}</b><span>قيد التوثيق</span></div>`;
  const PLAN={sifat:['ولادته','أسماؤه وألقابه','صفاته ووصفه'],liqaat:['مع الرواة','مع العلماء','مع الشعراء','مع العامة'],ghayba:['في الغيبة الصغرى','في الغيبة الكبرى'],tajil:['الأسباب الإيجابية: الإعداد','الأسباب السلبية: انتشار الظلم والفساد وأنواعه'],aqwal:['توقيعاته','أقواله وما أُثر عنه'],alamat:['العلامات الحتمية','علامات غير حتمية','الفتن والوقائع'],tawasul:['الزيارة','طلب لقائه','كتابة الرقعة','التوسل به','دعاء الندبة','دعاء العهد','الاستغاثة به','التضرع له'],zuhur:['مسيرة الظهور','أدواره']};
  function door(id){const d=DOORS.find(x=>x.id===id);if(!d)return notFound();
    if(id==='kutub')return kutub(d);if(id==='mawaqi')return mawaqi(d);if(id==='daftar')return daftar();
    const secs=[...new Set([...(PLAN[id]||[]),...sections(id)])];
    let tabsH=secs.length>1?`<div class="tabs" role="tablist">${secs.map((s,i)=>`<button data-t="${i}" class="${i?'':'on'}" data-sfx="${d.sfx}">${esc(s)}</button>`).join('')}</div>`:'';
    view.innerHTML=head(d)+(id==='sifat'?`<div class="age-mini"><b id="ageBig">—</b><i id="ageU"></i><em id="ageSub"></em><span id="ageClock" class="clk"></span></div>`:'')+tabsH+`<div id="secBody"></div>`;
    const show=i=>{const s=secs[i]||'',list=CONTENT.filter(x=>x.door===id&&x.section===s);const b=document.getElementById('secBody');
      let h='';if(id==='zuhur'&&s==='مسيرة الظهور')h+=RouteMap.render(list);
      if(id==='tawasul'&&s==='كتابة الرقعة')h+=Ruqa.html();
      h+=list.length?`<div class="its">${list.map(card).join('')}</div>`:pending(s||d.t);b.innerHTML=h;
      if(id==='zuhur'&&s==='مسيرة الظهور')RouteMap.wire(b,list);if(id==='tawasul'&&s==='كتابة الرقعة')Ruqa.wire(b)};
    view.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{view.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('on',x===b));show(+b.dataset.t)});
    show(0);if(id==='sifat'){ageMode='y';ageTick();clearInterval(ageT);ageT=setInterval(ageTick,1000)}}
  function kutub(d){let tab='all',era=0;const kinds=[['all','الكل'],['m','موسوعية'],['f','فردانية'],['k','مجلد كبير'],['b','كتاب'],['r','كتيب']];
    view.innerHTML=head(d)+`<div class="tabs">${kinds.map(([k,t],i)=>`<button data-k="${k}" class="${i?'':'on'}" data-sfx="wood">${t}</button>`).join('')}</div><div class="eras"><button data-e="0" class="on">كل العصور</button>${Object.keys(ERAS).map(e=>`<button data-e="${e}">${ERAS[e].split(':')[0]}</button>`).join('')}</div><p class="muted" id="kc"></p><div class="shelf" id="sh"></div>`;
    const show=()=>{const l=BOOKS.filter(b=>(tab==='all'||(tab==='f'?b.kind!=='m':b.kind===tab))&&(!era||b.era==era));document.getElementById('kc').textContent=`${ar(l.length)} عنوانًا`;
      document.getElementById('sh').innerHTML=l.map((b,i)=>`<button class="bk k-${b.kind}" data-n="${b.n}" style="--i:${i%14}" data-sfx="paper"><i></i><b>${esc(b.t)}</b><small>${esc(b.a)} · ${esc(b.d)}</small><span>${KINDS[b.kind]}</span></button>`).join('');
      document.querySelectorAll('.bk').forEach(x=>x.onclick=()=>bookSheet(BOOKS[x.dataset.n-1]))};
    view.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{tab=b.dataset.k;view.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('on',x===b));show()});
    view.querySelectorAll('.eras button').forEach(b=>b.onclick=()=>{era=+b.dataset.e;view.querySelectorAll('.eras button').forEach(x=>x.classList.toggle('on',x===b));show()});show()}
  function webLinks(q){return SITES.slice(0,4).map(s=>`<a class="wl" target="_blank" rel="noopener" href="https://www.google.com/search?q=${encodeURIComponent(q+' site:'+s.q)}" data-sfx="key">${ic('link')} ${esc(s.t)}</a>`).join('')}
  function bookSheet(b){openSheet(`<span class="grade">${KINDS[b.kind]}</span><h3>${esc(b.t)}</h3><p>${esc(b.a)} · ${esc(b.d)}</p>${b.note?`<p class="muted">${esc(b.note)}</p>`:''}<p class="muted">${ERAS[b.era]}</p><h4>ابحث عنه في</h4><div class="wls">${webLinks(b.t+' '+b.a.split(' ').slice(0,3).join(' '))}</div>`)}
  function mawaqi(d){view.innerHTML=head(d)+`<div class="its">${SITES.map((s,i)=>`<a class="it" style="--i:${i}" href="${s.u}" target="_blank" rel="noopener" data-sfx="key"><b>${esc(s.t)}</b><small>${esc(s.d)}</small><span class="grade">${esc(s.q)}</span></a>`).join('')}</div>`}
  function daftar(){const d=DOORS.find(x=>x.id==='daftar');const n=store.get('notes',{}),q=store.get('questions',{}),r=store.list('ruqas');
    const lst=(ids,f)=>{const a=ids.map(byId).filter(Boolean);return a.length?`<div class="its">${a.map(f||card).join('')}</div>`:''};
    view.innerHTML=head(d)+`<section class="df"><h2>المفضلة</h2>${lst(store.list('fav'))||'<p class="muted">اضغط القلب في أي رواية لتظهر هنا.</p>'}
      <h2>علامات الرجوع</h2>${lst(store.list('marks'))||'<p class="muted">ضع علامة في أي نص لتعود إليه.</p>'}
      <h2>ملاحظاتي</h2>${lst(Object.keys(n),(it,i)=>`<a class="it" href="#/item/${it.id}"><b>${esc(it.title)}</b><small>${esc(n[it.id])}</small></a>`)||'<p class="muted">لا ملاحظات بعد.</p>'}
      <h2>أسئلتي</h2>${lst(Object.keys(q),(it,i)=>`<a class="it" href="#/item/${it.id}"><b>${esc(it.title)}</b><small>${esc(q[it.id])}</small></a>`)||'<p class="muted">لا أسئلة بعد.</p>'}
      ${r.length?`<h2>رقاعي</h2>${r.map(x=>`<div class="it"><small>${esc(x.text)}</small></div>`).join('')}`:''}
      <div class="rw"><button class="btn2" id="ex" data-sfx="save">صدّر نسخة احتياطية</button><label class="btn2">استورد نسخة<input type="file" id="im" accept="application/json" hidden></label></div></section>`;
    document.getElementById('ex').onclick=()=>{const u=URL.createObjectURL(new Blob([store.exportAll()],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download='المستور-دفتري.json';a.click();URL.revokeObjectURL(u)};
    document.getElementById('im').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{store.importAll(t);toast('استُعيد دفترك');daftar()}catch(x){toast('الملف غير صالح')}})}}
  function item(id){const it=byId(id);if(!it)return notFound();
    if(it.door==='liqaat'){if(!view.innerHTML)door('liqaat');Book.open(it);return}
    const d=DOORS.find(x=>x.id===it.door);
    view.innerHTML=`<a class="back" href="#/door/${it.door}" data-sfx="close">${ic('back')} ${esc(d.t)}</a><article class="pap"><small>${esc(it.section)}</small><h1>${esc(it.title)}</h1>
      ${(it.summary&&it.summary!==it.text)?`<p class="sum">${esc(it.summary)}</p>`:''}${(it.text||'').split(/\n\n+/).filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join('')}</article>
      <div class="srcbox">${sourceHTML(it)}</div><div class="acts" id="acts"></div>`;
    actions(document.getElementById('acts'),it)}
  /* ---------- البحث ---------- */
  function search(q){q=q||'';view.innerHTML=`<h1 class="ph">البحث</h1>${searchBar(q)}<div id="res"></div>`;wireSearch();if(!q){document.getElementById('res').innerHTML=`<div class="chips">${['الصفات','الغيبة','التوقيعات','طول العمر','السفراء','السفياني','زيارة آل ياسين'].map(c=>`<a href="#/search/${encodeURIComponent(c)}">${c}</a>`).join('')}</div>`;return}
    const toks=norm(q).split(/\s+/).filter(Boolean);
    const hit=s=>{const n=norm(s);return toks.every(t=>n.includes(t))};
    const items=CONTENT.filter(x=>hit([x.title,x.text,x.summary,x.section,(x.tags||[]).join(' '),x.source&&x.source.book,x.witness].join(' ')));
    const bks=BOOKS.filter(b=>hit(b.t+' '+b.a+' '+b.note));const dr=DOORS.filter(d=>hit(d.t+' '+d.s));
    SFX.play('sand');
    document.getElementById('res').innerHTML=`<p class="muted">${ar(items.length+bks.length+dr.length)} نتيجة لـ«${esc(q)}»</p>
      ${dr.length?`<div class="its">${dr.map((d,i)=>`<a class="it" href="#/door/${d.id}" style="--i:${i}"><b>${d.t}</b><small>باب</small></a>`).join('')}</div>`:''}
      ${items.length?`<div class="its">${items.map(card).join('')}</div>`:''}
      ${bks.length?`<h2 class="sh2">كتب</h2><div class="its">${bks.map((b,i)=>`<button class="it" data-b="${b.n}" style="--i:${i%10}"><b>${esc(b.t)}</b><small>${esc(b.a)}</small></button>`).join('')}</div>`:''}
      <h2 class="sh2">ابحث على الشبكة</h2><div class="wls">${webLinks(q)}</div>`;
    view.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>bookSheet(BOOKS[b.dataset.b-1]))}
  /* ---------- الإعدادات ---------- */
  function settings(){view.innerHTML=`<h1 class="ph">الإعدادات</h1><section class="who"><img src="assets/designer.webp" alt="محمد علي"><h2>محمد علي</h2>
      <button class="mail" id="mail" data-sfx="tap">taroot80@gmail.com</button><p>بإشراف مجموعة بقية الله</p></section>
    <section class="set"><label><span>أصوات الأزرار</span><input type="checkbox" id="sSnd" ${SFX.on()?'checked':''}></label>
      <label><span>الافتتاحية عند الفتح</span><input type="checkbox" id="sSpl" ${store.get('splash',true)?'checked':''}></label>
      <label><span>حجم الخط</span><input type="range" id="sFont" min="16" max="26" value="${store.get('font',19)}"></label>
      <button class="btn2" id="replay" data-sfx="tap">أعد عرض الافتتاحية</button></section>
    <section class="set"><h3>عن الحساب</h3><p class="muted">يبدأ العمر من فجر الجمعة ١٥ شعبان ٢٥٥هـ بسامراء، ويتقدم بالتقويم الهجري أم القرى. والساعات والدقائق تقريبية لأن وقت الفجر يومها غير مضبوط بالدقيقة.</p>
    <h3>عن المحتوى</h3><p class="muted">كل نص مربوط بمصدره. وما لم يكتمل توثيقه يظهر «قيد التوثيق». ودرجة كل نص تبيّن طريق نقله، ولا تعني الحكم بصحته.</p></section>`;
    document.getElementById('mail').onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText('taroot80@gmail.com');toast('نُسخ البريد')};
    document.getElementById('sSnd').onchange=()=>{SFX.toggle();sndIcon()};document.getElementById('sSpl').onchange=e=>store.set('splash',e.target.checked);
    document.getElementById('sFont').oninput=e=>{store.set('font',+e.target.value);applyFont()};document.getElementById('replay').onclick=()=>{store.set('splash',true);Splash.replay()}}
  const notFound=()=>{view.innerHTML=`<div class="pend"><b>لم نجد هذه الصفحة</b><a class="btn" href="#/">عُد إلى الرئيسية</a></div>`};
  const applyFont=()=>document.documentElement.style.setProperty('--read',store.get('font',19)+'px');
  const sndIcon=()=>{document.getElementById('sndBtn').innerHTML=ic(SFX.on()?'vol':'mute')};
  function route(){const h=location.hash.slice(1)||'/',[,a,b]=h.split('/');TTS.cancel();closeSheet();if(Book.isOpen()&&a!=='item')Book.close();
    clearInterval(ageT);scrollTo(0,0);
    document.querySelectorAll('.bot a').forEach(x=>x.classList.toggle('on',x.dataset.n===(a||'home')));
    if(!a)home();else if(a==='doors')doorsPage();else if(a==='door')door(b);else if(a==='item')item(b);else if(a==='search')search(decodeURIComponent(b||''));else if(a==='daftar')daftar();else if(a==='settings')settings();else notFound();
    view.classList.remove('in');void view.offsetWidth;view.classList.add('in')}
  function boot(){document.querySelectorAll('[data-i]').forEach(e=>e.innerHTML=ic(e.dataset.i));sndIcon();applyFont();
    document.getElementById('sndBtn').onclick=()=>{SFX.toggle();sndIcon();toast(SFX.on()?'الأصوات مفعّلة':'الأصوات مطفأة')};
    addEventListener('hashchange',route);route();
    if(document.fonts&&document.fonts.load)document.fonts.load('400 19px Amiri','بسم').catch(()=>{});Splash.start(()=>{});
    if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{})}
  return{boot,actions,toast};
})();
window.App=App;App.boot();
