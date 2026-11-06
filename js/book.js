// كتاب اللقاءات: يُفتح كدفتي مصحف بورق البردي، يقلَّب من اليمين أو من اليسار، بحفيف ورق، وقارئ آلي رجل أو امرأة
'use strict';
const Book=(()=>{
  const root=document.getElementById('book');
  let item=null,pages=[],idx=0,busy=false,dbl=false,reading=null;
  const isDbl=()=>innerWidth>=760&&innerHeight>=480;

  function paginate(paras,w,h){
    const m=document.createElement('div');m.className='bk-text';m.style.cssText=`position:absolute;visibility:hidden;width:${w}px;left:-9999px;top:0`;root.appendChild(m);
    const out=[];let cur=[];
    const fits=()=>{m.innerHTML=cur.map(p=>`<p>${esc(p)}</p>`).join('');return m.scrollHeight<=h};
    for(const para of paras){
      cur.push(para);if(fits())continue;cur.pop();
      const words=para.split(/\s+/);let chunk=[];
      for(const wd of words){chunk.push(wd);cur.push(chunk.join(' '));const ok=fits();cur.pop();
        if(!ok){chunk.pop();if(chunk.length)cur.push(chunk.join(' '));out.push(cur);cur=[];chunk=[wd]}}
      if(chunk.length)cur.push(chunk.join(' '));
    }
    if(cur.length)out.push(cur);m.remove();return out;
  }
  function buildPages(){
    const S=stage().getBoundingClientRect();dbl=isDbl();
    const pw=(dbl?S.width/2:S.width)-52,ph=S.height-84;
    const body=item.text||item.summary||'';
    const paras=body.split(/\n\n+/).filter(Boolean);
    const sized=paginate(paras,pw,ph-0);
    pages=[{kind:'title'}].concat(sized.map(p=>({kind:'text',p})),[{kind:'source'}]);
    if(dbl&&pages.length%2)pages.splice(pages.length-1,0,{kind:'orn'});
  }
  const stage=()=>root.querySelector('.bk-stage');
  function pageHTML(p,i){
    const n=`<div class="bk-no">${ar(i+1)}</div>`;
    if(!p)return '';
    if(p.kind==='title')return `<div class="bk-title"><i class="orn"></i><small>${esc(item.section||'')}</small><h2>${esc(item.title)}</h2>${item.witness?`<p>${esc(item.witness)}</p>`:''}<span class="grade g-${esc(item.grade)}">${esc(gradeName(item.grade))}</span>${textKind(item)?`<small>${textKind(item)}</small>`:''}<i class="orn b"></i></div>`;
    if(p.kind==='orn')return `<div class="bk-title"><i class="orn"></i></div>`;
    if(p.kind==='source')return `<div class="bk-src">${sourceHTML(item)}</div>${n}`;
    return `<div class="bk-text">${p.p.map(x=>`<p>${esc(x)}</p>`).join('')}</div>${n}`;
  }
  // في الكتاب العربي الصفحة الأولى يمين والتالية يسار
  function renderStatic(){
    const R=root.querySelector('.bk-r'),L=root.querySelector('.bk-l');
    if(dbl){R.innerHTML=pageHTML(pages[idx],idx);L.innerHTML=pageHTML(pages[idx+1],idx+1)}
    else{R.innerHTML=pageHTML(pages[idx],idx)}
    root.querySelector('.bk-count').textContent=`${ar(idx+1)} / ${ar(pages.length)}`;
    root.querySelector('.bk-prev').disabled=idx<=0;root.querySelector('.bk-next').disabled=idx>=pages.length-(dbl?2:1);
  }
  function turn(dir,after){
    const step=dbl?2:1,to=idx+dir*step;if(busy||to<0||to>=pages.length)return after&&after(false);
    busy=true;SFX.play('leaf');
    const leaf=root.querySelector('.bk-leaf'),F=leaf.querySelector('.f'),B=leaf.querySelector('.b');
    const fwd=dir>0;
    if(dbl){ // الصفحة اليسرى تدور إلى اليمين عند التقدّم، حول الكعب في الوسط
      leaf.className='bk-leaf dbl '+(fwd?'fwd':'bwd');
      F.innerHTML=fwd?pageHTML(pages[idx+1],idx+1):pageHTML(pages[idx],idx);
      B.innerHTML=fwd?pageHTML(pages[to],to):pageHTML(pages[to+1],to+1);
      const R=root.querySelector('.bk-r'),L=root.querySelector('.bk-l');
      if(fwd){L.innerHTML=pageHTML(pages[to+1],to+1)}else{R.innerHTML=pageHTML(pages[to],to)}
    }else{ // الهاتف: ورقة كاملة تنقلب حول الكعب الأيمن عند التقدّم
      leaf.className='bk-leaf sgl '+(fwd?'fwd':'bwd');
      F.innerHTML=fwd?pageHTML(pages[idx],idx):pageHTML(pages[to],to);B.innerHTML='';
      root.querySelector('.bk-r').innerHTML=pageHTML(pages[fwd?to:idx],fwd?to:idx);
    }
    void leaf.offsetWidth;leaf.classList.add('go');
    const end=()=>{leaf.removeEventListener('animationend',end);idx=to;leaf.className='bk-leaf';F.innerHTML='';B.innerHTML='';renderStatic();busy=false;after&&after(true)};
    leaf.addEventListener('animationend',end);
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)setTimeout(()=>{if(busy)end()},30);
  }
  function pageSpeech(i){const p=pages[i];if(!p)return '';if(p.kind==='title')return item.title+'.';if(p.kind==='text')return p.p.join(' ');return ''}
  function stopRead(){reading=null;TTS.cancel();root.querySelectorAll('.bk-v').forEach(b=>b.classList.remove('on'))}
  function readFrom(g){
    reading=g;
    const step=dbl?2:1;
    const go=()=>{if(reading!==g)return;let t=pageSpeech(idx);if(dbl)t+=' '+pageSpeech(idx+1);
      if(!t.trim()){stopRead();return}
      TTS.speak(t,g,()=>{if(reading!==g)return;if(idx+step<pages.length&&pages[idx+step].kind!=='source')turn(1,ok=>ok?go():stopRead());else stopRead()})};
    go();
  }
  function open(it){
    item=it;idx=0;root.hidden=false;document.body.classList.add('lock');
    const info=TTS.info();
    root.innerHTML=`<div class="bk-wrap">
      <div class="bk-bar">
        <button class="ic bk-close" aria-label="إغلاق" data-sfx="close">${ic('x')}</button>
        <span class="bk-count"></span>
        <div class="bk-listen" role="group" aria-label="استمع للقارئ الآلي"><span>استمع</span>
          <button class="bk-v" data-v="m" data-sfx="tap" ${TTSok(info)}>رجل</button>
          <button class="bk-v" data-v="f" data-sfx="tap" ${TTSok(info)}>امرأة</button></div>
      </div>
      <div class="bk-stage">
        <div class="bk-spine"></div>
        <div class="bk-page bk-r"></div><div class="bk-page bk-l"></div>
        <div class="bk-leaf"><div class="f"></div><div class="b"></div></div>
        <div class="bk-edge e-r"></div><div class="bk-edge e-l"></div>
        <div class="bk-cover c-r"><i></i></div><div class="bk-cover c-l"><i></i></div>
      </div>
      <div class="bk-nav">
        <button class="btn2 bk-prev" data-sfx="tap">السابقة</button>
        <div class="bk-acts" id="bkActs"></div>
        <button class="btn2 bk-next" data-sfx="tap">التالية</button>
      </div></div>`;
    root.classList.toggle('dbl',isDbl());
    const ready=()=>{if(item!==it)return;buildPages();renderStatic()};
    const F=document.fonts;(F&&F.load?Promise.race([F.load(`400 ${store.get('font',19)}px Amiri`,'بسم'),new Promise(r=>setTimeout(r,1500))]):Promise.resolve()).then(ready,ready);
    App.actions(root.querySelector('#bkActs'),it);
    SFX.play('cover');
    requestAnimationFrame(()=>root.classList.add('opened'));
    if(!info.ok)root.querySelector('.bk-listen').title='لا يوجد صوت عربي مثبت في هذا الجهاز';
    wire();
  }
  const TTSok=i=>i.ok?'':'disabled';
  function close(){stopRead();root.classList.remove('opened');SFX.play('cover');setTimeout(()=>{root.hidden=true;root.innerHTML='';document.body.classList.remove('lock')},420)}
  function wire(){
    root.querySelector('.bk-close').onclick=()=>{close();if(location.hash.startsWith('#/item/'))history.back()};
    root.querySelector('.bk-next').onclick=()=>{stopRead();turn(1)};root.querySelector('.bk-prev').onclick=()=>{stopRead();turn(-1)};
    root.querySelectorAll('.bk-v').forEach(b=>b.onclick=()=>{const g=b.dataset.v,was=reading===g;stopRead();if(!was){b.classList.add('on');store.set('ttsVoice',g);readFrom(g)}});
    // السحب بالإصبع: من اليسار إلى اليمين يتقدّم، ومن اليمين إلى اليسار يرجع، كتصفح الكتاب العربي
    const s=stage();let x0=null,y0=0;
    s.onpointerdown=e=>{x0=e.clientX;y0=e.clientY};
    s.onpointerup=e=>{if(x0===null)return;const dx=e.clientX-x0,dy=e.clientY-y0;const X=x0;x0=null;
      if(e.target.closest('a,button'))return;
      if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.2){stopRead();turn(dx>0?1:-1);return}
      if(Math.abs(dx)<10&&Math.abs(dy)<10){const r=s.getBoundingClientRect(),k=(X-r.left)/r.width;if(k<.3){stopRead();turn(1)}else if(k>.7){stopRead();turn(-1)}}};
  }
  document.addEventListener('keydown',e=>{if(root.hidden)return;if(e.key==='ArrowLeft')turn(1);if(e.key==='ArrowRight')turn(-1);if(e.key==='Escape')root.querySelector('.bk-close').click()});
  addEventListener('resize',()=>{if(root.hidden||!item)return;root.classList.toggle('dbl',isDbl());const c=pages[idx];buildPages();idx=Math.min(idx,pages.length-1);if(isDbl()&&idx%2)idx--;renderStatic()});
  return{open,close,isOpen:()=>!root.hidden};
})();
