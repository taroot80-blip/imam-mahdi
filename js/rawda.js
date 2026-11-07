// «روضة الانتظار»: صفحة البراعم (٣–١٢ سنة) بافتتاحية تلتئم فيها الأبواب المتناثرة، وأقسامها التسعة.
'use strict';
const Rawda=(()=>{
  const V=()=>document.getElementById('view');
  const SEC=[
    {id:'bustan',t:'بستان الانتظار',s:'ألعاب ومسابقات، وحدك أو مع صديق',c:'#22C55E',ic:'tree',sfx:'leafk'},
    {id:'ashbal',t:'أشبال الحجة',s:'قصص مصورة متحركة وكرتون',c:'#F2B632',ic:'film',sfx:'pop'},
    {id:'baraim',t:'براعم النور',s:'ابحث واطبع',c:'#38BDF8',ic:'lens',sfx:'sparkle'},
    {id:'bayan',t:'نور البيان',s:'أسئلتك وأجوبتها',c:'#A78BFA',ic:'bulb',sfx:'chimek'},
    {id:'hisn',t:'حصن البرهان',s:'أذكار ووصايا',c:'#14B8A6',ic:'castle',sfx:'stone'},
    {id:'yaqin',t:'محطة اليقين',s:'كرامات وشفاء ومعاجز',c:'#F472B6',ic:'starburst',sfx:'sparkle'},
    {id:'ajyal',t:'حكايات الأجيال',s:'حكايات اللقاء مسموعة',c:'#FB923C',ic:'ear',sfx:'paper'},
    {id:'rihab',t:'في رحاب إمامي المنتظر',s:'كلماته وشرحها',c:'#E0B050',ic:'scroll',sfx:'pen'},
    {id:'rusum',t:'رسوم الانتظار',s:'مرسم وتلوين',c:'#EF4444',ic:'brush',sfx:'pop'},
  ];
  const KI={
    tree:'<path d="M12 22v-7"/><circle cx="12" cy="9" r="6"/><path d="M8 20h8"/>',
    film:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/>',
    lens:'<circle cx="11" cy="11" r="6"/><path d="M15.5 15.5L20 20"/><path d="M9 10.5a2.5 2.5 0 012.5-2.5"/>',
    bulb:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 00-3.5 10.9V16h7v-2.1A6 6 0 0012 3z"/>',
    castle:'<path d="M4 21V9l2 1V7l3 1V5h6v3l3-1v3l2-1v12z"/><path d="M10 21v-4a2 2 0 014 0v4"/>',
    starburst:'<path d="M12 2l2 6 6 .5-4.6 4 1.5 6.5L12 15.5 7.1 19l1.5-6.5L4 8.5 10 8z"/>',
    ear:'<path d="M8 8a4 4 0 118 0c0 3-3 4-3 7a3 3 0 01-6 0"/><path d="M11 9a1 1 0 112 0"/>',
    scroll:'<path d="M6 4h11a2 2 0 012 2v12a2 2 0 01-2 2H8"/><path d="M6 4a2 2 0 00-2 2v2h4V6a2 2 0 00-2-2zM8 20a2 2 0 01-2-2V8"/><path d="M11 9h5M11 13h5"/>',
    brush:'<path d="M14 4l6 6-8 8-6-6z"/><path d="M6 12l-2 6 6-2"/>',
    users:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 20c0-3.5 2.7-6 6-6s6 2.5 6 6M14 20c0-2.6 1.4-4.6 4-4.6s4 2 4 4.6"/>',
    phone:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
    trophy:'<path d="M8 4h8v5a4 4 0 01-8 0z"/><path d="M8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4M12 13v4M8 21h8M9 17h6v4H9z"/>',
    cards:'<rect x="3" y="6" width="10" height="14" rx="2"/><path d="M8 4l10-1 1 14"/>',
    check:'<path d="M5 12l5 5 9-10"/>',
    sort:'<path d="M7 4v16M4 7l3-3 3 3M17 20V4M14 17l3 3 3-3"/>',
    play:'<path d="M7 4l13 8-13 8z"/>',
    undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>',
    fill:'<path d="M5 11l7-7 7 7-7 7z"/><path d="M20 15s2 2.6 2 4a2 2 0 01-4 0c0-1.4 2-4 2-4z"/>',
    eraser:'<path d="M3 17l9-9 7 7-5 5H6z"/><path d="M14 20h7"/>',
  };
  const kic=n=>`<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${KI[n]||''}</svg>`;
  const byId=id=>CONTENT.find(x=>x.id===id);
  const srcLine=id=>{const x=byId(id);if(!x)return '';return `<a class="k-src" href="#/item/${esc(id)}" data-sfx="paper">${ic('book')} ${esc(x.source.book)}${x.source.page?`، ص${esc(x.source.page)}`:''} · <span class="grade g-${esc(x.grade)}">${esc(gradeName(x.grade))}</span></a>`};
  const kid=()=>store.get('kid',null);
  const say=(t,btn)=>{const v=store.get('kidVoice','f');if(btn){if(btn.classList.contains('on')){TTS.cancel();btn.classList.remove('on');return}document.querySelectorAll('.k-say.on').forEach(b=>b.classList.remove('on'));btn.classList.add('on')}
    TTS.speak(t,v,()=>btn&&btn.classList.remove('on'))};
  const sayBtn=t=>`<button class="k-say" data-t="${esc(t)}" aria-label="استمع" data-sfx="tap">${ic('vol')}</button>`;
  const wireSay=r=>r.querySelectorAll('.k-say').forEach(b=>b.onclick=e=>{e.stopPropagation();say(b.dataset.t,b)});
  const back=(to,t)=>`<a class="back k-back" href="${to}" data-sfx="close">${ic('back')} ${t}</a>`;
  const head=s=>`${back('#/rawda','روضة الانتظار')}<header class="k-head" style="--c:${s.c}"><span class="k-hic">${kic(s.ic)}</span><div><h1>${s.t}</h1><p>${s.s}</p></div></header>`;
  const sec=id=>SEC.find(s=>s.id===id);

  /* ---------- الروضة: افتتاحية الستائر والأبواب المتناثرة ---------- */
  let lastHub=0;
  function hub(){const intro=Date.now()-lastHub>90000;lastHub=Date.now();const k=kid();
    V().innerHTML=`${back('#/','الرئيسية')}<section class="rwd ${intro?'intro':''}" id="rw">
      <div class="rw-stage"><i class="rw-beam"></i><i class="rw-beam b2"></i>${Array.from({length:18},(_,i)=>`<i class="rw-star" style="--x:${(i*53)%100}%;--y:${(i*37)%60}%;--d:${(i%6)*.4}s"></i>`).join('')}
        <div class="rw-title"><span class="rw-sun"><svg viewBox="0 0 120 80" aria-hidden="true"><circle cx="60" cy="44" r="22" fill="#FFD36E"/>${Array.from({length:10},(_,i)=>`<rect x="58" y="6" width="4" height="12" rx="2" fill="#FFD36E" transform="rotate(${i*36} 60 44)"/>`).join('')}<path d="M18 62c0-10 9-16 19-14 3-9 15-13 23-7 7-6 21-3 23 8 9 0 16 6 16 13z" fill="#f4ecdf" opacity=".95"/></svg></span>
          <h1>روضة الانتظار</h1><p>${k?`أهلًا يا ${esc(k.name)}`:'للبراعم من ٣ إلى ١٢ سنة'}</p></div></div>
      <div class="rw-grid">${SEC.map((s,i)=>{const a=(i*137)%360,r=180+(i%3)*60;return `<a class="rw-door" href="#/rawda/${s.id}" data-sfx="${s.sfx}" style="--c:${s.c};--i:${i};--fx:${Math.round(Math.cos(a)*r)}px;--fy:${Math.round(Math.sin(a)*r)}px;--fr:${(i%2?1:-1)*(40+i*17)}deg"><span class="rw-ic">${kic(s.ic)}</span><b>${s.t}</b><small>${s.s}</small></a>`}).join('')}</div>
      <i class="rw-cur l"></i><i class="rw-cur r"></i></section>
      <div class="k-bar">${k?`<span>${esc(k.name)} · ${ar(k.age)} سنوات</span><button class="btn2 k-sm" id="kEdit" data-sfx="tap">غيّر الاسم أو العمر</button>`:`<button class="btn k-sm" id="kEdit" data-sfx="pop">اكتب اسمك وعمرك</button>`}<button class="btn2 k-sm" id="kVoice" data-sfx="tap">${ic('vol')} صوت الراوي: ${store.get('kidVoice','f')==='m'?'رجل':'امرأة'}</button></div>`;
    if(intro){try{SFX.play('curtain')}catch(e){}setTimeout(()=>{try{SFX.play('chimek')}catch(e){}},900)}
    document.getElementById('kEdit').onclick=()=>profile(()=>hub());
    document.getElementById('kVoice').onclick=e=>{store.set('kidVoice',store.get('kidVoice','f')==='m'?'f':'m');e.currentTarget.innerHTML=`${ic('vol')} صوت الراوي: ${store.get('kidVoice','f')==='m'?'رجل':'امرأة'}`;say('أهلًا بك في روضة الانتظار')}}

  /* ---------- الاسم والعمر ---------- */
  function profile(done,title){const k=kid()||{name:'',age:7};const sh=document.getElementById('sheet');
    sh.innerHTML=`<div class="sh-bg"></div><div class="sh k-prof"><button class="ic sh-x" aria-label="إغلاق" data-sfx="close">${ic('x')}</button><h3>${title||'قبل أن نبدأ'}</h3>
      <label class="k-lab">ما اسمك؟<input id="kN" maxlength="24" value="${esc(k.name)}" placeholder="اكتب اسمك" autocomplete="off"></label>
      <div class="k-lab">كم عمرك؟<div class="k-ages">${[3,4,5,6,7,8,9,10,11,12].map(a=>`<button type="button" data-a="${a}" class="${a==k.age?'on':''}" data-sfx="pop">${ar(a)}</button>`).join('')}</div></div>
      <button class="btn" id="kGo" data-sfx="sparkle">هيا نبدأ</button></div>`;sh.hidden=false;let age=k.age;
    const close=()=>{sh.hidden=true;sh.innerHTML=''};sh.querySelector('.sh-bg').onclick=close;sh.querySelector('.sh-x').onclick=close;
    sh.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{age=+b.dataset.a;sh.querySelectorAll('[data-a]').forEach(x=>x.classList.toggle('on',x===b))});
    sh.querySelector('#kGo').onclick=()=>{const n=sh.querySelector('#kN').value.trim();if(!n){sh.querySelector('#kN').focus();App.toast('اكتب اسمك أولًا');return}store.set('kid',{name:n,age});close();done&&done({name:n,age})}}

  /* ---------- بستان الانتظار ---------- */
  const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const forAge=age=>KIDS.quiz.filter(q=>age>=q.lv[0]&&age<=q.lv[1]);
  function bustan(){const s=sec('bustan');if(!kid())return profile(()=>bustan());const k=kid();
    V().innerHTML=head(s)+`<p class="k-hi">يا ${esc(k.name)}، اختر لعبتك:</p>
      <div class="k-games">${[['quiz','check','سؤال وخيارات','اختر الجواب الصحيح'],['tf','q','صح أم خطأ','أسرع جواب'],['cards','cards','البطاقات المقلوبة','اقلب واعثر على الأزواج'],['order','sort','رتّب الكلمات','ضعها في مكانها']].map(([id,i,t,d],n)=>`<button class="k-game" data-g="${id}" style="--i:${n}" data-sfx="pop"><span>${KI[i]?kic(i):ic(i)}</span><b>${t}</b><small>${d}</small></button>`).join('')}</div>
      <h2 class="k-h2">${kic('users')} العب مع صديق</h2>
      <div class="k-games two"><button class="k-game" data-p="same" data-sfx="pop"><span>${kic('users')}</span><b>على هاتف واحد</b><small>الشاشة نصفان، وكل لاعب يجيب من جهته</small></button>
        <button class="k-game" data-p="net" data-sfx="pop"><span>${kic('phone')}</span><b>على هاتفين</b><small>برمز غرفة عبر الإنترنت</small></button></div>
      <p class="muted k-note">الأسئلة مختارة لعمر ${ar(k.age)} سنوات، وكل سؤال مأخوذ من نص موثق في التطبيق.</p>`;
    V().querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>({quiz:()=>quiz('mcq'),tf:()=>quiz('tf'),cards:cards,order:order})[b.dataset.g]());
    V().querySelector('[data-p=same]').onclick=duel;V().querySelector('[data-p=net]').onclick=net}
  function pickQs(kind,age,n=8){let l=forAge(age);l=l.filter(q=>kind==='tf'?q.a.length===2:kind==='mcq'?q.a.length>2:true);if(l.length<n)l=l.concat(KIDS.quiz.filter(q=>kind==='tf'?q.a.length===2:q.a.length>2&&!l.includes(q)));return shuffle(l).slice(0,n)}
  const opts=q=>{const o=q.a.map((t,i)=>({t,ok:i===q.c}));return q.a.length===2?o:shuffle(o)};
  function quiz(kind){const k=kid(),qs=pickQs(kind,k.age);let i=0,score=0;const s=sec('bustan');
    const show=()=>{if(i>=qs.length)return finish();const q=qs[i],o=opts(q);
      V().innerHTML=head(s)+`<div class="k-play"><div class="k-prog"><i style="transform:scaleX(${i/qs.length})"></i></div><p class="k-count"><span>السؤال ${ar(i+1)} من ${ar(qs.length)}</span><span class="k-sc">${kic('starburst')} ${ar(score)}</span></p>
        <div class="k-q"><h2>${esc(q.q)}</h2>${sayBtn(q.q+'. '+o.map(x=>x.t).join('، أو '))}</div>
        <div class="k-opts ${o.length===2?'tf':''}">${o.map((x,j)=>`<button class="k-opt" data-ok="${x.ok?1:0}" style="--i:${j}">${esc(x.t)}</button>`).join('')}</div><div id="kFb"></div></div>`;
      wireSay(V());if(k.age<=6)say(q.q);
      V().querySelectorAll('.k-opt').forEach(b=>b.onclick=()=>{const ok=b.dataset.ok==='1';V().querySelectorAll('.k-opt').forEach(x=>{x.disabled=true;if(x.dataset.ok==='1')x.classList.add('ok')});if(!ok)b.classList.add('no');
        if(ok){score++;try{SFX.play('win')}catch(e){}burst(b)}else try{SFX.play('stone')}catch(e){}
        document.getElementById('kFb').innerHTML=`<div class="k-fb ${ok?'ok':'no'}"><b>${ok?'أحسنت!':'لا بأس، الجواب الصحيح: '+esc(q.a[q.c])}</b>${srcLine(q.src)}<button class="btn" id="kNext" data-sfx="pop">${i+1<qs.length?'التالي':'النتيجة'}</button></div>`;
        if(k.age<=6)say(ok?'أحسنت':'الجواب الصحيح: '+q.a[q.c]);document.getElementById('kNext').onclick=()=>{i++;show()}})};
    const finish=()=>{result(score,qs.length,()=>quiz(kind))};show()}
  function result(score,total,again,names){const s=sec('bustan'),k=kid(),pct=score/total;
    V().innerHTML=head(s)+`<div class="k-res"><span class="k-trophy">${kic('trophy')}</span><h2>${pct>=.8?'رائع يا '+esc(k.name)+'!':pct>=.5?'أحسنت يا '+esc(k.name):'محاولة جميلة يا '+esc(k.name)}</h2>
      <p class="k-big">${ar(score)} من ${ar(total)}</p><div class="k-stars">${Array.from({length:5},(_,i)=>`<i class="${i<Math.round(pct*5)?'on':''}" style="--i:${i}">${kic('starburst')}</i>`).join('')}</div>
      <div class="rw2"><button class="btn" id="kAgain" data-sfx="pop">العب مرة أخرى</button><button class="btn2" data-home="1" data-sfx="close">ألعاب أخرى</button></div></div>`;
    document.getElementById('kAgain').onclick=again;V().querySelector('[data-home]').onclick=()=>bustan();confetti();say(`${score} من ${total}. ${pct>=.5?'أحسنت':'حاول مرة أخرى'}`)}
  function burst(el){const r=el.getBoundingClientRect();for(let i=0;i<10;i++){const p=document.createElement('i');p.className='k-spark';p.style.cssText=`left:${r.left+r.width/2}px;top:${r.top+r.height/2}px;--dx:${Math.cos(i/10*6.28)*70}px;--dy:${Math.sin(i/10*6.28)*70}px`;document.body.appendChild(p);setTimeout(()=>p.remove(),800)}}
  function confetti(){if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;const C=['#F2B632','#22C55E','#38BDF8','#F472B6','#A78BFA'];for(let i=0;i<40;i++){const p=document.createElement('i');p.className='k-conf';p.style.cssText=`left:${Math.random()*100}vw;background:${C[i%5]};--d:${Math.random()*.8}s;--r:${Math.random()*720}deg`;document.body.appendChild(p);setTimeout(()=>p.remove(),3200)}}

  /* البطاقات المقلوبة: وحدك أو بالتناوب */
  function cards(two){const k=kid(),n=k.age<=5?3:k.age<=8?5:6,pr=shuffle(KIDS.pairs).slice(0,n);const deck=shuffle(pr.flatMap((p,i)=>[{p:i,t:p[0],a:1},{p:i,t:p[1],a:0}]));
    let open=[],found=0,moves=0,turn=0,sc=[0,0],lock=false;const s=sec('bustan');
    V().innerHTML=head(s)+`<div class="k-play"><p class="k-count" id="cInfo"></p><div class="k-deck c${deck.length}">${deck.map((c,i)=>`<button class="k-card" data-i="${i}" aria-label="بطاقة"><span class="f b">${kic('starburst')}</span><span class="f t ${c.a?'w':''}">${esc(c.t)}</span></button>`).join('')}</div>
      ${two?'':`<button class="btn2" id="cTwo" data-sfx="pop">${kic('users')} العبها مع صديق بالتناوب</button>`}</div>`;
    const info=()=>{const el=document.getElementById('cInfo');if(!el)return;el.innerHTML=two?`دور ${turn?'اللاعب الثاني':esc(k.name)} · ${esc(k.name)} ${ar(sc[0])} — الثاني ${ar(sc[1])}`:`المحاولات ${ar(moves)} · الأزواج ${ar(found)} من ${ar(n)}`};info();
    const tb=document.getElementById('cTwo');if(tb)tb.onclick=()=>cards(true);
    V().querySelectorAll('.k-card').forEach(b=>b.onclick=()=>{if(lock||b.classList.contains('up'))return;b.classList.add('up');try{SFX.play('paper')}catch(e){}open.push(b);
      if(open.length===2){moves++;lock=true;const [x,y]=open.map(e=>deck[+e.dataset.i]);
        if(x.p===y.p){setTimeout(()=>{open.forEach(e=>e.classList.add('done'));open=[];lock=false;found++;if(two)sc[turn]++;try{SFX.play('win')}catch(e){}info();
            if(found===n){if(two)duelEnd(sc,[k.name,'صديقك']);else result(Math.max(1,n-Math.max(0,moves-n-1)),n,()=>cards())}},450)}
        else setTimeout(()=>{open.forEach(e=>e.classList.remove('up'));open=[];lock=false;if(two)turn=1-turn;info()},1000)}})}
  /* الترتيب */
  function order(){const k=kid(),o=KIDS.orders.find(x=>k.age>=x.lv[0])||KIDS.orders[0];const s=sec('bustan');let pick=[];const pool=shuffle(o.items);
    const draw=()=>{V().innerHTML=head(s)+`<div class="k-play"><div class="k-q"><h2>${esc(o.t)}</h2>${sayBtn(o.t)}</div>
      <ol class="k-slots">${o.items.map((_,i)=>`<li class="${pick[i]?'full':''}">${pick[i]?esc(pick[i]):'…'}</li>`).join('')}</ol>
      <div class="k-pool">${pool.map(t=>`<button class="k-opt sm" ${pick.includes(t)?'disabled':''} data-t="${esc(t)}" data-sfx="pop">${esc(t)}</button>`).join('')}</div>
      <div class="rw2"><button class="btn2" id="oUndo" data-sfx="tap">${kic('undo')} تراجع</button></div><div id="kFb"></div></div>`;wireSay(V());
      V().querySelectorAll('.k-pool .k-opt').forEach(b=>b.onclick=()=>{pick.push(b.dataset.t);if(pick.length===o.items.length){const ok=pick.every((t,i)=>t===o.items[i]);draw();
        document.getElementById('kFb').innerHTML=`<div class="k-fb ${ok?'ok':'no'}"><b>${ok?'ترتيب صحيح! أحسنت':'الترتيب الصحيح: '+o.items.map(esc).join(' ← ')}</b>${srcLine(o.src)}<button class="btn" id="kNext" data-sfx="pop">${ok?'انتهيت':'حاول مرة أخرى'}</button></div>`;
        if(ok){try{SFX.play('win')}catch(e){}confetti()}document.getElementById('kNext').onclick=()=>{if(ok)bustan();else{pick=[];draw()}}}else draw()});
      document.getElementById('oUndo').onclick=()=>{pick.pop();draw()}};draw()}

  /* لاعبان على هاتف واحد: الشاشة نصفان، والنصف العلوي مقلوب */
  function duel(){const k=kid();const sh=document.getElementById('sheet');
    sh.innerHTML=`<div class="sh-bg"></div><div class="sh k-prof"><button class="ic sh-x" aria-label="إغلاق" data-sfx="close">${ic('x')}</button><h3>من يلعب مع ${esc(k.name)}؟</h3>
      <label class="k-lab">اسم اللاعب الثاني<input id="d2" maxlength="24" placeholder="اسم صديقك"></label>
      <div class="k-lab">عمره<div class="k-ages">${[3,4,5,6,7,8,9,10,11,12].map(a=>`<button type="button" data-a="${a}" class="${a==k.age?'on':''}" data-sfx="pop">${ar(a)}</button>`).join('')}</div></div><button class="btn" id="dGo" data-sfx="sparkle">ابدأ المنافسة</button></div>`;sh.hidden=false;let age=k.age;
    const close=()=>{sh.hidden=true;sh.innerHTML=''};sh.querySelector('.sh-bg').onclick=close;sh.querySelector('.sh-x').onclick=close;
    sh.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{age=+b.dataset.a;sh.querySelectorAll('[data-a]').forEach(x=>x.classList.toggle('on',x===b))});
    sh.querySelector('#dGo').onclick=()=>{const n2=sh.querySelector('#d2').value.trim()||'صديقي';close();duelPlay([k.name,n2],Math.min(k.age,age))}}
  function duelPlay(names,age){const qs=pickQs('any',age,8);let i=0;const sc=[0,0];
    const show=()=>{if(i>=qs.length)return duelEnd(sc,names);const q=qs[i],o=opts(q);let done=false;
      const half=(p)=>`<div class="d-half p${p}"><p class="d-name">${esc(names[p])} · ${ar(sc[p])}</p><h3>${esc(q.q)}</h3><div class="k-opts ${o.length===2?'tf':''}">${o.map(x=>`<button class="k-opt" data-p="${p}" data-ok="${x.ok?1:0}">${esc(x.t)}</button>`).join('')}</div></div>`;
      V().innerHTML=`<div class="k-duel">${half(1)}<div class="d-mid"><span>${ar(i+1)} / ${ar(qs.length)}</span><button class="ic" id="dX" aria-label="إنهاء" data-sfx="close">${ic('x')}</button></div>${half(0)}</div>`;
      document.getElementById('dX').onclick=()=>bustan();
      V().querySelectorAll('.k-opt').forEach(b=>b.onclick=()=>{if(done)return;const p=+b.dataset.p,ok=b.dataset.ok==='1';
        if(ok){done=true;sc[p]++;b.classList.add('ok');try{SFX.play('win')}catch(e){}V().querySelectorAll('.k-opt').forEach(x=>{x.disabled=true;if(x.dataset.ok==='1')x.classList.add('ok')});
          V().querySelector('.d-half.p'+p).classList.add('win');setTimeout(()=>{i++;show()},1300)}
        else{b.classList.add('no');b.disabled=true;try{SFX.play('stone')}catch(e){}V().querySelectorAll(`.k-opt[data-p="${p}"]`).forEach(x=>x.disabled=true);
          if([...V().querySelectorAll('.k-opt')].every(x=>x.disabled)){done=true;V().querySelectorAll('.k-opt[data-ok="1"]').forEach(x=>x.classList.add('ok'));setTimeout(()=>{i++;show()},1500)}}})};show()}
  function duelEnd(sc,names){const s=sec('bustan'),w=sc[0]===sc[1]?-1:sc[0]>sc[1]?0:1;
    V().innerHTML=head(s)+`<div class="k-res"><span class="k-trophy">${kic('trophy')}</span><h2>${w<0?'تعادل جميل!':'الفائز: '+esc(names[w])}</h2><p class="k-big">${esc(names[0])} ${ar(sc[0])} — ${esc(names[1])} ${ar(sc[1])}</p>
      <div class="rw2"><button class="btn" data-home="1" data-sfx="pop">ألعاب أخرى</button></div></div>`;V().querySelector('[data-home]').onclick=()=>{netClose();bustan()};confetti()}

  /* لاعبان على هاتفين: غرفة برمز عبر PeerJS، والمضيف يدير الأسئلة */
  let peer=null,conn=null;
  function loadPeer(){return window.Peer?Promise.resolve():new Promise((ok,no)=>{const sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js';sc.onload=ok;sc.onerror=no;document.head.appendChild(sc)})}
  function netClose(){try{conn&&conn.close();peer&&peer.destroy()}catch(e){}conn=peer=null}
  function net(){const s=sec('bustan');netClose();
    V().innerHTML=head(s)+`<div class="k-play"><h2 class="k-h2">${kic('phone')} اللعب على هاتفين</h2><p class="muted">يحتاج الهاتفان إلى الإنترنت. أحدكما ينشئ غرفة، والآخر يكتب رمزها.</p>
      <div class="k-games two"><button class="k-game" id="nHost" data-sfx="pop"><span>${kic('users')}</span><b>أنشئ غرفة</b><small>وأعطِ الرمز لصديقك</small></button>
      <div class="k-game"><span>${kic('phone')}</span><b>ادخل غرفة</b><input id="nCode" inputmode="numeric" maxlength="4" placeholder="الرمز" aria-label="رمز الغرفة"><button class="btn k-sm" id="nJoin" data-sfx="pop">ادخل</button></div></div><div id="nMsg"></div></div>`;
    const msg=h=>document.getElementById('nMsg').innerHTML=h;
    const fail=()=>msg(`<div class="k-fb no"><b>تعذّر الاتصال. تأكد من الإنترنت ثم حاول مجددًا.</b></div>`);
    document.getElementById('nHost').onclick=async()=>{if(navigator.onLine===false)return fail();msg('<p class="muted">يجهَّز…</p>');try{await loadPeer()}catch(e){return fail()}
      const code=String(Math.floor(1000+Math.random()*9000));peer=new Peer('mastoor-rawda-'+code);
      peer.on('open',()=>msg(`<div class="k-fb ok"><b>رمز الغرفة</b><p class="k-code">${ar(code)}</p><p class="muted">ينتظر دخول صديقك…</p></div>`));peer.on('error',fail);
      peer.on('connection',c=>{conn=c;c.on('open',()=>netHost(c))})};
    document.getElementById('nJoin').onclick=async()=>{const code=document.getElementById('nCode').value.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).trim();if(code.length!==4)return msg('<div class="k-fb no"><b>اكتب الرمز من ٤ أرقام</b></div>');
      if(navigator.onLine===false)return fail();msg('<p class="muted">يتصل…</p>');try{await loadPeer()}catch(e){return fail()}
      peer=new Peer();peer.on('error',fail);peer.on('open',()=>{conn=peer.connect('mastoor-rawda-'+code,{reliable:true});conn.on('open',()=>netGuest(conn));conn.on('error',fail)})}}
  function netHost(c){const k=kid();let other=null,i=0,qs=[],sc=[0,0],ans=[null,null];
    c.on('data',d=>{if(d.t==='hello'){other=d;qs=pickQs('any',Math.min(k.age,d.age),8);c.send({t:'hello',name:k.name});next()}
      if(d.t==='ans'&&d.i===i){ans[1]=d.ok;resolve()}});
    c.on('close',()=>{App.toast('خرج صديقك من الغرفة');netClose();bustan()});
    const next=()=>{if(i>=qs.length){c.send({t:'end',sc,names:[k.name,other.name]});return duelEnd(sc,[k.name,other.name])}ans=[null,null];const q=qs[i],o=opts(q);c.send({t:'q',i,n:qs.length,q:q.q,o,sc,names:[k.name,other.name]});netQ(i,qs.length,q.q,o,sc,[k.name,other.name],0,ok=>{ans[0]=ok;resolve()})};
    const resolve=()=>{if(ans[0]===null||ans[1]===null)return;if(ans[0])sc[0]++;if(ans[1])sc[1]++;c.send({t:'res',sc,ans});netRes(sc,ans,[k.name,other.name],0);setTimeout(()=>{i++;next()},1600)}}
  function netGuest(c){const k=kid();c.send({t:'hello',name:k.name,age:k.age});
    c.on('data',d=>{if(d.t==='q')netQ(d.i,d.n,d.q,d.o,d.sc,d.names,1,ok=>c.send({t:'ans',i:d.i,ok}));if(d.t==='res')netRes(d.sc,d.ans,null,1);if(d.t==='end')duelEnd([d.sc[1],d.sc[0]],[d.names[1],d.names[0]])});
    c.on('close',()=>{App.toast('انتهت الغرفة');netClose();bustan()})}
  function netQ(i,n,q,o,sc,names,me,onAns){const s=sec('bustan');
    V().innerHTML=head(s)+`<div class="k-play"><p class="k-count">السؤال ${ar(i+1)} من ${ar(n)} · ${esc(names[0])} ${ar(sc[0])} — ${esc(names[1])} ${ar(sc[1])}</p>
      <div class="k-q"><h2>${esc(q)}</h2>${sayBtn(q)}</div><div class="k-opts ${o.length===2?'tf':''}">${o.map(x=>`<button class="k-opt" data-ok="${x.ok?1:0}">${esc(x.t)}</button>`).join('')}</div><div id="kFb"></div></div>`;wireSay(V());
    V().querySelectorAll('.k-opt').forEach(b=>b.onclick=()=>{const ok=b.dataset.ok==='1';V().querySelectorAll('.k-opt').forEach(x=>{x.disabled=true;if(x.dataset.ok==='1')x.classList.add('ok')});if(!ok)b.classList.add('no');try{SFX.play(ok?'win':'stone')}catch(e){}
      document.getElementById('kFb').innerHTML='<p class="muted">ينتظر جواب صديقك…</p>';onAns(ok)})}
  function netRes(sc,ans,names,me){const f=document.getElementById('kFb');if(f)f.innerHTML=`<div class="k-fb ${ans[me]?'ok':'no'}"><b>${ans[me]?'أحسنت!':'لا بأس'}</b><p>${ans[1-me]?'وصديقك أجاب صحيحًا':'وصديقك لم يُصب هذه المرة'}</p></div>`}

  /* ---------- الحكايات المصورة ---------- */
  function scene(s){const sky={night:['#0b1230','#1b2350'],dusk:['#2a1b3d','#a0522d'],dawn:['#1e2a4a','#e8a05b'],day:['#3b82c4','#a7d8f0']}[s.sky]||['#0b1230','#1b2350'];const P=new Set(s.props);let g='';
    if(P.has('stars'))for(let i=0;i<16;i++)g+=`<circle class="sc-tw" style="--d:${(i%5)*.5}s" cx="${(i*47)%360}" cy="${(i*29)%90+8}" r="${i%3?1.4:2.2}" fill="#fff"/>`;
    if(P.has('moon'))g+=`<g class="sc-fl"><circle cx="300" cy="40" r="20" fill="#f8e7a8"/><circle cx="310" cy="34" r="18" fill="${sky[0]}"/></g>`;
    if(P.has('sunrays')||s.sky==='day')g+=`<g class="sc-spin" style="transform-origin:60px 40px"><circle cx="60" cy="40" r="18" fill="#ffd36e"/>${Array.from({length:8},(_,i)=>`<rect x="58" y="10" width="4" height="10" rx="2" fill="#ffd36e" transform="rotate(${i*45} 60 40)"/>`).join('')}</g>`;
    if(P.has('rain'))for(let i=0;i<24;i++)g+=`<line class="sc-rain" style="--d:${(i%6)*.15}s" x1="${(i*31)%360}" y1="0" x2="${(i*31)%360-6}" y2="14" stroke="#9cc4ff" stroke-width="1.5"/>`;
    g+=`<path d="M0 175 Q90 160 180 172 T360 168 V220 H0z" fill="${s.sky==='day'?'#5aa05a':'#1d2b20'}"/>`;
    if(P.has('road'))g+=`<path d="M150 220 L175 172 H190 L230 220z" fill="${s.sky==='day'?'#d9b98a':'#3a3226'}"/>`;
    if(P.has('field'))g+=`<path d="M0 185 Q180 170 360 185 V220 H0z" fill="${s.sky==='day'?'#8fbf5a':'#22351f'}"/>`;
    if(P.has('river'))g+=`<path class="sc-wave" d="M0 195 Q45 188 90 195 T180 195 T270 195 T360 195 V212 H0z" fill="#4aa3df"/>`;
    if(P.has('tree'))g+=`<g class="sc-sway" style="transform-origin:300px 180px"><rect x="296" y="140" width="8" height="40" fill="#6b4a2b"/><circle cx="300" cy="132" r="24" fill="#2f8f4e"/></g>`;
    if(P.has('house'))g+=`<g><rect x="40" y="110" width="110" height="68" rx="4" fill="#c9a77a"/><path d="M32 112 L95 74 L158 112z" fill="#8a5a3c"/><rect x="62" y="132" width="26" height="22" rx="3" fill="${P.has('lamp')||s.sky==='night'||s.sky==='dusk'?'#ffd36e':'#7fb6e0'}" class="${P.has('lamp')?'sc-glow':''}"/><rect x="104" y="140" width="22" height="38" rx="3" fill="#6b4a2b"/></g>`;
    if(P.has('mosque')||P.has('dome'))g+=`<g transform="translate(${P.has('house')?190:120} 0)"><rect x="10" y="120" width="110" height="58" fill="#e8dcc4"/><path d="M30 120 Q65 60 100 120z" fill="#F2B632"/><rect x="0" y="80" width="12" height="98" fill="#e8dcc4"/><path d="M0 80 L6 66 L12 80z" fill="#F2B632"/>${P.has('mosque')?'<rect x="118" y="80" width="12" height="98" fill="#e8dcc4"/><path d="M118 80 L124 66 L130 80z" fill="#F2B632"/>':''}<path d="M55 178 V150 a10 10 0 0120 0 V178z" fill="#6b4a2b"/><circle cx="65" cy="58" r="3" fill="#F2B632"/></g>`;
    if(P.has('beam'))g+=`<g class="sc-beam"><path d="M180 0 L140 178 H230z" fill="url(#bm)"/><circle cx="185" cy="120" r="16" fill="#fff8d6" opacity=".95"/></g>`;
    if(P.has('birds'))for(let i=0;i<5;i++)g+=`<path class="sc-bird" style="--d:${i*.6}s" d="M${120+i*30} ${40+(i%2)*14} q6 -6 12 0 q6 -6 12 0" stroke="#fff" stroke-width="2.2" fill="none"/>`;
    if(P.has('book'))g+=`<g transform="translate(250 150)"><path d="M0 8 Q20 0 40 8 V30 Q20 22 0 30z" fill="#fff"/><path d="M20 4 V26" stroke="#c9a77a"/></g>`;
    if(P.has('cup'))g+=`<g transform="translate(260 148)"><path d="M0 0 H28 L24 26 H4z" fill="#d8c2a0"/><path class="sc-steam" d="M10 -4 q4 -8 0 -14 M18 -4 q4 -8 0 -14" stroke="#fff" fill="none" opacity=".7"/></g>`;
    if(P.has('coins'))g+=`<g transform="translate(250 160)">${[0,1,2].map(i=>`<ellipse cx="${i*14}" cy="${10-i*4}" rx="10" ry="5" fill="#F2B632" stroke="#a9780f"/>`).join('')}</g>`;
    if(P.has('goat'))g+=`<g transform="translate(240 150)"><ellipse cx="20" cy="16" rx="20" ry="11" fill="#f4f1ea"/><circle cx="8" cy="12" r="5" fill="#3b2a1e"/><circle cx="26" cy="18" r="5" fill="#3b2a1e"/><circle cx="42" cy="8" r="7" fill="#f4f1ea"/><rect x="6" y="24" width="3" height="10" fill="#555"/><rect x="30" y="24" width="3" height="10" fill="#555"/></g>`;
    if(P.has('bread'))g+=`<g transform="translate(250 160)"><ellipse cx="14" cy="8" rx="14" ry="7" fill="#d9a35b"/><ellipse cx="38" cy="10" rx="10" ry="4" fill="#4caf50"/></g>`;
    if(P.has('wind'))for(let i=0;i<4;i++)g+=`<path class="sc-wind" style="--d:${i*.4}s" d="M${20+i*40} ${100+i*12} q30 -10 60 0 t60 0" stroke="#e9d6b0" stroke-width="2" fill="none" opacity=".7"/>`;
    return `<svg class="scene" viewBox="0 0 360 220" role="img" aria-label="${esc(s.tx.slice(0,60))}"><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient><linearGradient id="bm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff8d6" stop-opacity=".95"/><stop offset="1" stop-color="#fff8d6" stop-opacity="0"/></linearGradient></defs><rect width="360" height="220" fill="url(#sk)"/>${g}</svg>`}
  function storyList(id){const s=sec(id),L=KIDS.stories[id]||[];
    V().innerHTML=head(s)+`<div class="k-stories">${L.map((st,i)=>`<a class="k-st" href="#/rawda/${id}/${st.id}" style="--i:${i}" data-sfx="pop">${scene(st.scenes[0])}<b>${esc(st.t)}</b><small>${ar(st.scenes.length)} مشاهد · ${esc(gradeName((byId(st.src)||{}).grade))}</small></a>`).join('')}</div>
      ${id==='ashbal'?`<h2 class="k-h2">${kic('film')} فيديوهات كرتون</h2>${KIDS.videos.length?`<div class="its">${KIDS.videos.map((v,i)=>`<a class="it" href="${esc(v.u)}" target="_blank" rel="noopener" style="--i:${i}"><b>${esc(v.t)}</b><small>${esc(v.ch)}</small></a>`).join('')}</div>`:`<div class="pend"><b>تُضاف فيديوهات الكرتون بعد اعتماد قنواتها</b><span>قيد الإعداد</span></div>`}`:''}
      ${id==='yaqin'||id==='ajyal'?`<p class="muted k-note">كل حكاية صياغة مبسطة للأطفال من قصتها الموثقة في باب «لقاءاته»، ودرجتها ظاهرة عليها.</p>`:''}`}
  function story(id,sid){const s=sec(id),st=(KIDS.stories[id]||[]).find(x=>x.id===sid);if(!st)return storyList(id);let i=0,auto=true;
    const draw=()=>{const sc=st.scenes[i];V().innerHTML=back('#/rawda/'+id,s.t)+`<div class="k-story" style="--c:${s.c}"><h1>${esc(st.t)}</h1><div class="k-frame" key="${i}">${scene(sc)}</div>
      <p class="k-tx">${esc(sc.tx)}</p><div class="k-dots">${st.scenes.map((_,j)=>`<i class="${j===i?'on':''}"></i>`).join('')}</div>
      <div class="k-ctl"><button class="btn2" id="sP" ${i?'':'disabled'} data-sfx="leaf">السابق</button><button class="btn k-play-b" id="sA" data-sfx="tap">${ic(auto?'vol':'mute')} ${auto?'الراوي يقرأ':'الراوي متوقف'}</button><button class="btn2" id="sN" data-sfx="leaf">${i+1<st.scenes.length?'التالي':'النهاية'}</button></div>
      ${i+1===st.scenes.length?`<div class="k-end">${srcLine(st.src)}<a class="btn2 k-sm" href="#/item/${esc(st.src)}" data-sfx="paper">اقرأ القصة كاملة كما في المصدر</a></div>`:''}</div>`;
      document.getElementById('sP').onclick=()=>{i--;draw()};document.getElementById('sN').onclick=()=>{if(i+1<st.scenes.length){i++;draw()}else{TTS.cancel();location.hash='#/rawda/'+id}};
      document.getElementById('sA').onclick=()=>{auto=!auto;if(!auto)TTS.cancel();draw()};
      if(auto)say(sc.tx)};draw()}

  /* ---------- في رحاب إمامي المنتظر ---------- */
  function rihab(){const s=sec('rihab');
    V().innerHTML=head(s)+`<div class="k-says">${KIDS.sayings.map((x,i)=>{const it=byId(x.src);return `<article class="k-say-c" style="--i:${i}"><blockquote>${esc(it.text||it.summary)}</blockquote>${sayBtn(it.text||it.summary)}
      <div class="k-parts">${x.parts.map((p,j)=>`<button class="k-part" data-k="${i}-${j}" data-sfx="pop">${esc(p[0])}</button>`).join('')}</div><div class="k-exp" id="ex${i}"></div>${srcLine(x.src)}</article>`}).join('')}</div>
      <p class="muted k-note">اضغط على كل عبارة ليظهر شرحها. الشروح صياغة مبسطة للأطفال، والنص الأصلي بحروفه من مصدره.</p>`;wireSay(V());
    V().querySelectorAll('.k-part').forEach(b=>b.onclick=()=>{const [i,j]=b.dataset.k.split('-').map(Number),p=KIDS.sayings[i].parts[j];V().querySelectorAll(`.k-part[data-k^="${i}-"]`).forEach(x=>x.classList.toggle('on',x===b));
      const e=document.getElementById('ex'+i);e.innerHTML=`<p><b>${esc(p[0])}:</b> ${esc(p[1])}</p>`;e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop');say(p[1])})}

  /* ---------- نور البيان ---------- */
  function bayan(){const s=sec('bayan');
    V().innerHTML=head(s)+`<div class="k-qa">${KIDS.bayan.map((x,i)=>`<details class="k-qd" style="--i:${i}"><summary data-sfx="chimek"><span>${kic('bulb')}</span>${esc(x.q)}</summary><div><p>${esc(x.a)}</p>${sayBtn(x.q+'. '+x.a)}${srcLine(x.src)}${x.more?`<a class="k-more" href="#/item/${esc(x.more)}" data-sfx="paper">للكبار: الشبهة وجوابها بالتفصيل</a>`:''}</div></details>`).join('')}</div>
      <p class="muted k-note">الأجوبة صياغة مبسطة للأطفال من نصوص موثقة في التطبيق.</p>`;wireSay(V());
    V().querySelectorAll('details').forEach(d=>d.ontoggle=()=>{if(d.open)V().querySelectorAll('details').forEach(o=>{if(o!==d)o.open=false})})}

  /* ---------- حصن البرهان ---------- */
  function hisn(){const s=sec('hisn');
    V().innerHTML=head(s)+`<div class="k-hisn">${KIDS.hisn.map((h,i)=>{const it=byId(h.id),t=(it.text||it.summary||'');return `<article class="k-h" style="--i:${i}"><span class="k-shield">${kic('castle')}</span><div><b>${esc(h.t)}</b><small>${esc(h.why)}</small>
      <p class="k-hx">${esc(t.length>260?t.slice(0,260)+'…':t)}</p>${sayBtn(t.slice(0,600))}<a class="k-more" href="#/item/${esc(h.id)}" data-sfx="paper">اقرأه كاملًا</a>${srcLine(h.id)}</div></article>`}).join('')}</div>
      <div class="pend"><b>الأحراز والأذكار التحصينية المأثورة عنه عليه السلام</b><span>قيد التوثيق</span></div>`;wireSay(V())}

  /* ---------- براعم النور: بحث سهل وطباعة ---------- */
  function baraim(q){const s=sec('baraim');q=q||'';
    V().innerHTML=head(s)+`<form class="k-search" id="bF"><input id="bQ" value="${esc(q)}" placeholder="عن ماذا تبحث؟ مثل: الولادة، الشمس، السفراء" aria-label="ابحث" enterkeyhint="search"><button class="btn" data-sfx="sparkle">${ic('search')} ابحث</button></form>
      <div class="chips">${['الولادة','الشمس','السفراء','الدعاء','الحج','العلامات','نرجس'].map(w=>`<button type="button" data-w="${w}" data-sfx="pop">${w}</button>`).join('')}</div><div id="bR"></div>`;
    const run=v=>{const n=norm(v);if(!n){document.getElementById('bR').innerHTML='';return}
      const R=[];KIDS.quiz.forEach(x=>{if(norm(x.q+' '+x.a[x.c]).includes(n))R.push({t:x.q.replace(/…/,'«'+x.a[x.c]+'»'),d:'الجواب: '+x.a[x.c],src:x.src})});
      KIDS.bayan.forEach(x=>{if(norm(x.q+' '+x.a).includes(n))R.push({t:x.q,d:x.a,src:x.src})});
      KIDS.sayings.forEach(x=>{const it=byId(x.src);if(norm(it.text+' '+x.parts.map(p=>p[1]).join(' ')).includes(n))R.push({t:it.text,d:x.parts.map(p=>p[1]).join(' '),src:x.src})});
      Object.values(KIDS.stories).flat().forEach(st=>{if(norm(st.t+' '+st.scenes.map(c=>c.tx).join(' ')).includes(n))R.push({t:'حكاية: '+st.t,d:st.scenes[0].tx,src:st.src})});
      const seen=new Set(),U=R.filter(r=>{const k=r.t;if(seen.has(k))return false;seen.add(k);return true}).slice(0,24);
      document.getElementById('bR').innerHTML=U.length?`<p class="muted">${ar(U.length)} نتيجة. اختر ما تريد طباعته:</p><div class="k-res-l">${U.map((r,i)=>`<label class="k-ri" style="--i:${i}"><input type="checkbox" checked data-i="${i}"><span><b>${esc(r.t)}</b><small>${esc(r.d)}</small>${srcLine(r.src)}</span></label>`).join('')}</div>
        <button class="btn" id="bPrint" data-sfx="paper">${ic('print')} اطبع ورقة البحث</button>`:`<div class="pend"><b>لم أجد شيئًا عن «${esc(v)}»</b><span>جرّب كلمة أخرى</span></div>`;
      const pb=document.getElementById('bPrint');if(pb)pb.onclick=()=>printSheet(v,U.filter((_,i)=>document.querySelector(`.k-ri input[data-i="${i}"]`).checked))};
    document.getElementById('bF').onsubmit=e=>{e.preventDefault();run(document.getElementById('bQ').value)};
    V().querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{document.getElementById('bQ').value=b.dataset.w;run(b.dataset.w)});if(q)run(q)}
  function printSheet(q,R){const k=kid();const w=document.createElement('div');w.id='kPrint';
    w.innerHTML=`<header><h1>براعم النور: بحثي عن «${esc(q)}»</h1><p>${k?`اسمي: ${esc(k.name)} · عمري: ${ar(k.age)} سنوات · `:''}تطبيق «المستور» · روضة الانتظار</p></header>${R.map((r,i)=>{const x=byId(r.src);return `<section><h2>${ar(i+1)}. ${esc(r.t)}</h2><p>${esc(r.d)}</p><small>المصدر: ${esc(x?x.source.book:'')}${x&&x.source.page?`، ص${esc(x.source.page)}`:''}</small></section>`}).join('')}<footer>أرسم هنا ما تعلمته: <span></span></footer>`;
    document.body.appendChild(w);document.body.classList.add('k-printing');const done=()=>{document.body.classList.remove('k-printing');w.remove()};
    if(window.NativeApp&&NativeApp.printPage){NativeApp.printPage('براعم النور');addEventListener('hashchange',done,{once:true});return}
    addEventListener('afterprint',done,{once:true});setTimeout(()=>window.print(),80)}

  /* ---------- رسوم الانتظار: مرسم وتلوين ---------- */
  const ART={
    shams:'<path d="M150 110 a50 50 0 1 0 100 0 a50 50 0 1 0 -100 0"/>'+Array.from({length:12},(_,i)=>`<path transform="rotate(${i*30} 200 110)" d="M192 50 L208 50 L200 26 Z"/>`).join('')+'<path d="M60 270 c0-40 35-62 70-55 c10-38 60-52 92-25 c26-24 82-12 90 34 c40 2 62 28 62 60 c0 26-20 42-48 42 H100 c-26 0-40-22-40-56z"/><path d="M40 370 h320 v24 h-320z"/><path d="M80 345 c20-18 40-18 60 0 s40 18 60 0 s40-18 60 0 s40 18 60 0"/>',
    samarra:'<path d="M120 380 V230 H280 V380 Z"/><path d="M130 230 Q200 80 270 230 Z"/><path d="M195 95 h10 v-25 h-10z"/><path d="M200 50 a10 10 0 1 0 0.1 0z"/><path d="M60 380 V150 H90 V380 Z"/><path d="M55 150 L75 105 L95 150 Z"/><path d="M310 380 V150 H340 V380 Z"/><path d="M305 150 L325 105 L345 150 Z"/><path d="M175 380 V310 a25 25 0 0 1 50 0 V380 Z"/><path d="M140 260 h30 v30 h-30z"/><path d="M230 260 h30 v30 h-30z"/><path d="M20 380 h360 v15 h-360z"/>',
    jamkaran:'<path d="M80 380 V250 H320 V380 Z"/><path d="M110 250 Q200 120 290 250 Z"/><path d="M195 140 h10 v-20 h-10z"/><path d="M185 112 q15 -20 30 0 q-15 -8 -30 0z"/><path d="M20 380 V140 H50 V380 Z"/><path d="M15 140 L35 90 L55 140 Z"/><path d="M350 380 V140 H380 V380 Z"/><path d="M345 140 L365 90 L385 140 Z"/><path d="M170 380 V300 a30 30 0 0 1 60 0 V380 Z"/><path d="M100 280 a14 14 0 0 1 28 0 v30 h-28z"/><path d="M272 280 a14 14 0 0 1 28 0 v30 h-28z"/><path d="M0 380 h400 v15 h-400z"/>',
    kaaba:'<path d="M110 150 L200 120 L290 150 V350 L200 380 L110 350 Z"/><path d="M110 150 L200 180 L290 150"/><path d="M200 180 V380"/><path d="M110 190 L200 220 L290 190"/><path d="M225 250 h30 v70 h-30z"/><path d="M40 395 Q200 330 360 395 Z"/><path d="M60 60 a20 20 0 1 0 0.1 0z"/><path d="M330 70 a14 14 0 1 0 0.1 0z"/>',
    nisf:'<path d="M300 40 a50 50 0 1 0 50 70 a40 40 0 1 1 -50 -70z"/><path d="M90 120 h40 v10 h-40z"/><path d="M85 130 h50 l-8 70 h-34z"/><path d="M110 100 v20"/><path d="M230 160 h36 v10 h-36z"/><path d="M226 170 h44 l-7 60 h-30z"/><path d="M248 140 v20"/><path d="M40 300 L60 290 L80 300 L70 280 L85 265 L65 263 L60 245 L52 263 L33 265 L48 280 Z"/><path d="M330 260 L345 252 L360 260 L352 245 L364 234 L348 232 L345 218 L340 232 L325 234 L337 245 Z"/><path d="M0 330 Q200 300 400 330 V400 H0Z"/><path d="M150 330 V260 Q200 220 250 260 V330 Z"/>',
    nur:'<path d="M60 380 V230 H240 V380 Z"/><path d="M45 232 L150 160 L255 232 Z"/><path d="M100 260 h50 v45 h-50z"/><path d="M170 300 h40 v80 h-40z"/><path d="M125 160 L95 0 H205 L175 160 Z"/><path d="M280 80 q15 -15 30 0 q15 -15 30 0"/><path d="M300 140 q12 -12 24 0 q12 -12 24 0"/><path d="M250 40 q10 -10 20 0 q10 -10 20 0"/><path d="M0 380 h400 v20 h-400z"/>',
    ruqa:'<path d="M0 250 Q50 230 100 250 T200 250 T300 250 T400 250 V400 H0 Z"/><path d="M0 300 Q50 285 100 300 T200 300 T300 300 T400 300"/><path d="M150 180 L250 160 L262 230 L162 250 Z"/><path d="M175 195 L240 183 M178 210 L243 198 M181 225 L230 216"/><path d="M60 80 a35 35 0 1 0 0.1 0z"/><path d="M280 90 c0-20 18-30 36-26 c6-18 34-22 46-6 c20 0 30 14 30 30 H280z"/>',
    sardab:'<path d="M60 390 V140 Q200 20 340 140 V390 Z"/><path d="M110 390 V170 Q200 90 290 170 V390 Z"/><path d="M130 330 h140 v20 h-140z M120 350 h160 v20 h-160z M110 370 h180 v20 h-180z"/><path d="M180 200 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0"/><path d="M40 390 h320 v10 h-320z"/><path d="M90 140 h-30 M310 140 h30"/>',
  };
  function rusum(id){const s=sec('rusum');
    if(!id){V().innerHTML=head(s)+`<div class="k-cl">${KIDS.color.map((c,i)=>`<a class="k-cp" href="#/rawda/rusum/${c.id}" style="--i:${i}" data-sfx="pop"><svg viewBox="0 0 400 400" fill="#fff" stroke="#1a120b" stroke-width="5" stroke-linejoin="round">${ART[c.id]}</svg><b>${esc(c.t)}</b><small>${esc(c.note)}</small></a>`).join('')}</div>
      <p class="muted k-note">لا يُرسم الإمام عليه السلام في هذه الصفحات، بل يرمز إليه النور والشمس خلف السحاب.</p>`;return}
    const c=KIDS.color.find(x=>x.id===id);if(!c)return rusum();
    const COLS=['#EF4444','#FB923C','#F2B632','#FFE08A','#22C55E','#14B8A6','#38BDF8','#2563EB','#A78BFA','#F472B6','#8B5A2B','#ffffff','#9ca3af','#1a120b'];
    V().innerHTML=back('#/rawda/rusum',s.t)+`<div class="k-paint"><h1>${esc(c.t)}</h1><div class="k-canvas"><canvas id="pc" width="800" height="800"></canvas><canvas id="pl" width="800" height="800"></canvas></div>
      <div class="k-tools"><button class="k-tool on" data-m="fill" aria-label="تلوين بالدلو" data-sfx="tap">${kic('fill')}</button><button class="k-tool" data-m="brush" aria-label="فرشاة" data-sfx="tap">${kic('brush')}</button><button class="k-tool" data-m="erase" aria-label="ممحاة" data-sfx="tap">${kic('eraser')}</button><button class="k-tool" id="pU" aria-label="تراجع" data-sfx="tap">${kic('undo')}</button></div>
      <div class="k-cols">${COLS.map((x,i)=>`<button class="k-col ${i===2?'on':''}" data-c="${x}" style="--c:${x}" aria-label="لون" data-sfx="pop"></button>`).join('')}</div>
      <div class="rw2"><button class="btn" id="pS" data-sfx="save">${ic('image')} احفظ رسمتي</button><button class="btn2" id="pP" data-sfx="paper">${ic('print')} اطبعها للتلوين بالأقلام</button><button class="btn2" id="pC" data-sfx="tap">امسح الألوان</button></div></div>`;
    const pc=document.getElementById('pc'),pl=document.getElementById('pl'),g=pc.getContext('2d',{willReadFrequently:true}),gl=pl.getContext('2d',{willReadFrequently:true});let col='#F2B632',mode='fill',hist=[],mask=null;
    g.fillStyle='#fff';g.fillRect(0,0,800,800);
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="800" height="800" fill="none" stroke="#1a120b" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${ART[id]}</svg>`;
    const im=new Image();im.onload=()=>{gl.drawImage(im,0,0,800,800);const d=gl.getImageData(0,0,800,800).data;mask=new Uint8Array(640000);for(let i=0;i<640000;i++)mask[i]=d[i*4+3]>90?1:0};
    im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
    const snap=()=>{hist.push(g.getImageData(0,0,800,800));if(hist.length>15)hist.shift()};
    const pos=e=>{const r=pl.getBoundingClientRect(),t=e.touches?e.touches[0]:e;return[Math.floor((t.clientX-r.left)/r.width*800),Math.floor((t.clientY-r.top)/r.height*800)]};
    function fill(x,y){if(!mask||mask[y*800+x])return;snap();const D=g.getImageData(0,0,800,800),d=D.data,i0=(y*800+x)*4,tr=d[i0],tg=d[i0+1],tb=d[i0+2];
      const n=parseInt(col.slice(1),16),R=n>>16&255,G=n>>8&255,B=n&255;if(Math.abs(tr-R)+Math.abs(tg-G)+Math.abs(tb-B)<10)return;
      const same=p=>!mask[p]&&Math.abs(d[p*4]-tr)+Math.abs(d[p*4+1]-tg)+Math.abs(d[p*4+2]-tb)<60;const st=[y*800+x],seen=new Uint8Array(640000);
      while(st.length){const p=st.pop();if(seen[p])continue;seen[p]=1;if(!same(p))continue;d[p*4]=R;d[p*4+1]=G;d[p*4+2]=B;const px=p%800;if(px>0)st.push(p-1);if(px<799)st.push(p+1);if(p>=800)st.push(p-800);if(p<639200)st.push(p+800)}
      g.putImageData(D,0,0);try{SFX.play('pop')}catch(e){}}
    let drawing=false,last=null;
    const start=e=>{e.preventDefault();const [x,y]=pos(e);if(mode==='fill'){fill(x,y);return}snap();drawing=true;last=[x,y];stroke(x,y)};
    const stroke=(x,y)=>{g.strokeStyle=mode==='erase'?'#fff':col;g.lineWidth=mode==='erase'?36:22;g.lineCap='round';g.beginPath();g.moveTo(last[0],last[1]);g.lineTo(x,y);g.stroke();last=[x,y]};
    pl.addEventListener('pointerdown',e=>{pl.setPointerCapture(e.pointerId);start(e)});pl.addEventListener('pointermove',e=>{if(drawing){const [x,y]=pos(e);stroke(x,y)}});pl.addEventListener('pointerup',()=>drawing=false);pl.addEventListener('pointercancel',()=>drawing=false);
    V().querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{mode=b.dataset.m;V().querySelectorAll('[data-m]').forEach(x=>x.classList.toggle('on',x===b))});
    V().querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{col=b.dataset.c;if(mode==='erase')mode='fill';V().querySelectorAll('[data-c]').forEach(x=>x.classList.toggle('on',x===b));V().querySelectorAll('[data-m]').forEach(x=>x.classList.toggle('on',x.dataset.m===mode))});
    document.getElementById('pU').onclick=()=>{const h=hist.pop();if(h)g.putImageData(h,0,0)};
    document.getElementById('pC').onclick=()=>{snap();g.fillStyle='#fff';g.fillRect(0,0,800,800)};
    const merged=()=>{const m=document.createElement('canvas');m.width=m.height=800;const x=m.getContext('2d');x.drawImage(pc,0,0);x.drawImage(pl,0,0);return m.toDataURL('image/png')};
    document.getElementById('pS').onclick=()=>{const u=merged(),fn='رسمتي-'+c.t+'.png';if(window.NativeApp&&NativeApp.saveFile){NativeApp.saveFile(fn,'image/png',u.split(',')[1]);return}const a=document.createElement('a');a.href=u;a.download=fn;document.body.appendChild(a);a.click();a.remove();App.toast('حُفظت رسمتك')};
    document.getElementById('pP').onclick=()=>{const w=document.createElement('div');w.id='kPrint';w.innerHTML=`<header><h1>${esc(c.t)}</h1><p>لوّنني · روضة الانتظار</p></header><img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}" alt="">`;document.body.appendChild(w);document.body.classList.add('k-printing');
      const done=()=>{document.body.classList.remove('k-printing');w.remove()};if(window.NativeApp&&NativeApp.printPage){NativeApp.printPage(c.t);addEventListener('hashchange',done,{once:true});return}addEventListener('afterprint',done,{once:true});setTimeout(()=>window.print(),120)}}

  function page(sub,arg){netClose();TTS.cancel();document.body.classList.add('kids');
    if(!sub)return hub();
    ({bustan,ashbal:()=>arg?story('ashbal',arg):storyList('ashbal'),yaqin:()=>arg?story('yaqin',arg):storyList('yaqin'),ajyal:()=>arg?story('ajyal',arg):storyList('ajyal'),
      rihab,bayan,hisn,baraim:()=>baraim(arg?decodeURIComponent(arg):''),rusum:()=>rusum(arg)}[sub]||hub)()}
  return{page,SEC,leave(){document.body.classList.remove('kids');netClose()}}
})();
