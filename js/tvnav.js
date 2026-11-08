// التنقل بأزرار الريموت في نسخة التلفاز الذكي: الأسهم تنقل التحديد إلى أقرب زر في اتجاهها، و«موافق» يضغطه.
// لا يعمل إلا في التلفاز (أو بإضافة ?tv للرابط)، ولا يغيّر ترتيب الواجهة.
'use strict';
const TV=(()=>{
  let on=false;try{on=!!(window.NativeApp&&NativeApp.isTv&&String(NativeApp.isTv())==='1')}catch(e){}
  if(/[?&]tv\b/.test(location.search))on=true;
  if(!on)return{on:false};
  document.documentElement.classList.add('tv');
  const g=document.querySelector('.sp-gate span');if(g)g.textContent='اضغط «موافق» للدخول';
  const SEL='a[href],button:not([disabled]),input:not([type=hidden]):not([disabled]),select,textarea,summary,[tabindex]:not([tabindex="-1"]),[onclick],.mp-s';
  const box=el=>{const r=el.getBoundingClientRect();if(r.width<4||r.height<4)return null;const s=getComputedStyle(el);
    if(s.visibility==='hidden'||s.pointerEvents==='none'||+s.opacity===0)return null;return r};
  function layer(){const sp=document.getElementById('splash');if(sp&&!sp.hidden)return sp;
    const m=[...document.querySelectorAll('[role=dialog],dialog[open],.sheet,.modal,.ov')].filter(e=>!e.hidden&&box(e)&&getComputedStyle(e).position==='fixed').pop();
    return m||document.body}
  function cands(){return[...layer().querySelectorAll(SEL)].filter(el=>!el.closest('[hidden],[aria-hidden="true"]')).map(el=>({el,r:box(el)})).filter(o=>o.r)}
  const H=()=>innerHeight;
  function scrollBy(dy){const sc=[...document.querySelectorAll('*')].find(e=>e.scrollHeight>e.clientHeight+20&&/(auto|scroll)/.test(getComputedStyle(e).overflowY)&&box(e)&&e.clientHeight>H()*.5);
    (sc||document.scrollingElement).scrollBy({top:dy,behavior:'smooth'})}
  function focus(el){el.focus({preventScroll:true});const r=el.getBoundingClientRect();
    if(r.top<70||r.bottom>H()-30)el.scrollIntoView({block:'center',behavior:'smooth'})}
  function move(dir){const list=cands();if(!list.length){if(dir==='up'||dir==='down')scrollBy((dir==='down'?1:-1)*H()*.45);return}
    const cur=document.activeElement,c=list.find(o=>o.el===cur);
    if(!c){const v=list.filter(o=>o.r.bottom>0&&o.r.top<H());focus((v[0]||list[0]).el);return}
    const a=c.r;let best=null,bs=Infinity;
    for(const o of list){const b=o.r;if(o.el===cur||o.el.contains(cur)||cur.contains(o.el))continue;let main,cross;
      const ox=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left)),oy=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
      if(dir==='down'){if(b.top<a.bottom-a.height*.5)continue;main=b.top-a.bottom;cross=ox?0:Math.min(Math.abs(b.left-a.right),Math.abs(a.left-b.right))}
      else if(dir==='up'){if(b.bottom>a.top+a.height*.5)continue;main=a.top-b.bottom;cross=ox?0:Math.min(Math.abs(b.left-a.right),Math.abs(a.left-b.right))}
      else if(dir==='right'){if(b.left<a.right-a.width*.5)continue;main=b.left-a.right;cross=oy?0:Math.min(Math.abs(b.top-a.bottom),Math.abs(a.top-b.bottom))}
      else{if(b.right>a.left+a.width*.5)continue;main=a.left-b.right;cross=oy?0:Math.min(Math.abs(b.top-a.bottom),Math.abs(a.top-b.bottom))}
      const s=Math.max(0,main)+cross*2.5;if(s<bs){bs=s;best=o}}
    if((dir==='up'||dir==='down')&&(!best||(dir==='down'?best.r.top>H()*1.15:best.r.bottom<-H()*.15))){scrollBy((dir==='down'?1:-1)*H()*.45);return}
    if(best)focus(best.el)}
  const DIR={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',38:'up',40:'down',37:'left',39:'right'};
  addEventListener('keydown',e=>{const d=DIR[e.key]||DIR[e.keyCode],t=document.activeElement,typing=t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))&&t.type!=='range'&&t.type!=='checkbox';
    if(d){if(typing&&(d==='left'||d==='right'))return;e.preventDefault();e.stopPropagation();move(d);return}
    if(e.key==='Enter'||e.keyCode===13||e.keyCode===23){const sp=document.getElementById('splash');
      if(sp&&!sp.hidden&&(!t||t===document.body||!sp.contains(t))){e.preventDefault();sp.click();return}
      if(t&&t!==document.body&&!/^(A|BUTTON|INPUT|TEXTAREA|SELECT|SUMMARY)$/.test(t.tagName)){e.preventDefault();t.click()}}},true);
  // بعد تغيّر الصفحة يُحدَّد أول زر ظاهر حتى لا يضيع المؤشر
  addEventListener('hashchange',()=>setTimeout(()=>{const a=document.activeElement;if(!a||a===document.body||!box(a)){const l=cands().filter(o=>o.r.top>=0&&o.r.top<H());l[0]&&focus(l[0].el)}},450));
  return{on:true,move};
})();
