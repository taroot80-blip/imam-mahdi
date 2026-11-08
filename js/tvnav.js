// التلفاز الذكي (Android TV): يُعرف من غلاف أندرويد، فتعمل الأسهم بالريموت على نقل التركيز إلى أقرب عنصر
// في اتجاهها، وزر الوسط (OK) يضغطه، مع إطار ذهبي متوهّج يومض بنبضة عند كل انتقال، وتمرير يبقيه في الوسط.
'use strict';
(function(){
  let tv=false;
  try{tv=!!(window.NativeApp&&NativeApp.isTV&&NativeApp.isTV())}catch(e){}
  if(/[?&]tv\b/.test(location.search))tv=true;   // للتجربة في المتصفح
  if(!tv)return;
  document.documentElement.dataset.tv='1';

  const SEL='a[href],button:not([disabled]),summary,input:not([type=hidden]):not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"]),[onclick],[role=button]';
  const DIRS={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
  const open=id=>{const e=document.getElementById(id);return e&&!e.hidden&&e};

  function visible(el){
    if(el.closest('[hidden],[inert]'))return false;
    const r=el.getBoundingClientRect();if(r.width<4||r.height<4)return false;
    const cs=getComputedStyle(el);return cs.visibility!=='hidden'&&cs.display!=='none'&&+cs.opacity>0.05;
  }
  // الطبقة المفتوحة في الأعلى تحصر التنقّل داخلها
  function scope(){
    for(const id of ['splash','book']){const e=open(id);if(e)return e}
    const dlg=[...document.querySelectorAll('[role=dialog],dialog[open],.modal,.sheet,.ov')].filter(e=>!e.hidden&&visible(e)).pop();
    return dlg||document.body;
  }
  const list=()=>[...scope().querySelectorAll(SEL)].filter(visible);
  const mid=r=>({x:r.left+r.width/2,y:r.top+r.height/2});

  function move(dx,dy){
    const L=list();if(!L.length)return false;
    const cur=document.activeElement;
    if(!cur||cur===document.body||!L.includes(cur)){
      const v=L.filter(e=>{const r=e.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&!e.closest('#bot')});
      focusEl(v[0]||L[0]);return true;
    }
    const a=cur.getBoundingClientRect(),c=mid(a);let best=null,bs=Infinity;
    for(const el of L){if(el===cur||el.contains(cur)||cur.contains(el))continue;
      const r=el.getBoundingClientRect(),p=mid(r);
      const along=dx?(p.x-c.x)*dx:(p.y-c.y)*dy;
      const edge=dx?(dx>0?r.left-a.right:a.left-r.right):(dy>0?r.top-a.bottom:a.top-r.bottom);
      if(along<=2&&edge<-2)continue;
      const cross=dx?Math.abs(p.y-c.y):Math.abs(p.x-c.x);
      const ov=dx?Math.min(a.bottom,r.bottom)-Math.max(a.top,r.top):Math.min(a.right,r.right)-Math.max(a.left,r.left);
      const s=Math.max(edge,0)+cross*(ov>0?0.6:2.4)+along*0.15;
      if(s<bs){bs=s;best=el}
    }
    if(best){focusEl(best);return true}
    return false;
  }
  function focusEl(el){
    if(!el)return;
    if(!el.hasAttribute('tabindex')&&!/^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(el.tagName))el.setAttribute('tabindex','0');
    el.focus({preventScroll:true});
    const r=el.getBoundingClientRect(),m=innerHeight*0.2;
    if(!el.closest('#bot')&&(r.top<m||r.bottom>innerHeight-m))scrollBy({top:r.top+r.height/2-innerHeight/2,behavior:'smooth'});
    el.classList.remove('tv-hit');void el.offsetWidth;el.classList.add('tv-hit');
  }

  addEventListener('keydown',e=>{
    const t=e.target,typing=t&&(t.tagName==='TEXTAREA'||(t.tagName==='INPUT'&&!/^(button|checkbox|radio|range|submit)$/.test(t.type)));
    // الكتاب يُقلَّب بالسهمين يمينًا ويسارًا
    if(open('book')&&(e.key==='ArrowLeft'||e.key==='ArrowRight'))return;
    const d=DIRS[e.key];
    if(d){
      if(typing&&d[0])return;
      e.preventDefault();
      if(!move(d[0],d[1])&&d[1])scrollBy({top:d[1]*innerHeight*0.45,behavior:'smooth'});
      return;
    }
    if((e.key==='Enter'||e.key===' ')&&t&&t!==document.body&&!typing){
      if(/^(BUTTON|A|SUMMARY|SELECT)$/.test(t.tagName))return;
      e.preventDefault();t.click();
    }
  },true);

  const first=()=>{const all=list().filter(e=>!e.closest('#bot')),
    L=all.filter(e=>e.closest('main')&&!e.classList.contains('back')&&!/^(INPUT|TEXTAREA)$/.test(e.tagName)&&!e.closest('form,.search,.srch'));
    const a=document.activeElement,el=all.find(e=>e.classList.contains('door'))&&location.hash.length<3?all.find(e=>e.classList.contains('door')):(L[0]||all[0]);
    if(el&&(!a||a===document.body||!visible(a)||a.closest('#bot')||!a.closest('main')))focusEl(el)};
  addEventListener('hashchange',()=>{setTimeout(first,380);setTimeout(first,1100)});
  addEventListener('load',()=>setTimeout(first,900));
  // بعد الافتتاحية: التركيز على أول باب
  new MutationObserver(()=>{if(!open('splash'))setTimeout(first,300)}).observe(document.getElementById('splash')||document.body,{attributes:true,attributeFilter:['hidden']});

  document.head.insertAdjacentHTML('beforeend',`<style>
html[data-tv] :focus{outline:none}
html[data-tv] :focus-visible,html[data-tv] [tabindex]:focus,html[data-tv] button:focus,html[data-tv] a:focus{
  outline:4px solid #F2B632;outline-offset:4px;border-radius:16px;position:relative;z-index:3;
  box-shadow:0 0 0 9px rgba(242,182,50,.18),0 0 32px rgba(242,182,50,.6);transform:scale(1.04);
  transition:transform .16s cubic-bezier(.23,1,.32,1),box-shadow .16s}
html[data-tv] .tv-hit{animation:tvhit .34s cubic-bezier(.23,1,.32,1)}
@keyframes tvhit{0%{box-shadow:0 0 0 0 rgba(255,211,110,.95),0 0 32px rgba(242,182,50,.6)}100%{box-shadow:0 0 0 16px rgba(255,211,110,0),0 0 32px rgba(242,182,50,.6)}}
html[data-tv] body{cursor:none}
html[data-tv] main{max-width:1180px}
@media (prefers-reduced-motion:reduce){html[data-tv] :focus-visible{transform:none}html[data-tv] .tv-hit{animation:none}}
</style>`);
})();
