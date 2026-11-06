// الرقعة: تُكتب على البردي، تُطوى، وتنزل في الماء. تبقى خاصة: لا تُرسل إلى أحد.
'use strict';
const Ruqa=(()=>{
  function html(item){return `<section class="ruqa" id="ruqa">
    <div class="rq-sheet"><div class="rq-fold f1"></div><div class="rq-fold f2"></div>
      <label for="rqText">رقعتك</label>
      <textarea id="rqText" rows="7" placeholder="اكتب حاجتك هنا. تبقى على جهازك ولا تُرسل إلى أحد."></textarea>
    </div>
    <div class="rq-water"><canvas id="rqCv" width="600" height="150"></canvas></div>
    <div class="rq-row"><button class="btn rq-send" data-sfx="tap">اطوِها وألقِها في الماء</button>
      <label class="rq-keep"><input type="checkbox" id="rqKeep"> احفظها في دفتري</label></div>
  </section>`}
  function ripples(cv){const x=cv.getContext('2d'),W=cv.width,H=cv.height;let t=0,rs=[],run=true;
    function f(){if(!run||!document.contains(cv))return;requestAnimationFrame(f);t+=.02;x.clearRect(0,0,W,H);
      const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(20,110,100,.5)');g.addColorStop(1,'rgba(8,30,34,.9)');x.fillStyle=g;x.fillRect(0,0,W,H);
      x.strokeStyle='rgba(200,240,230,.2)';for(let j=0;j<7;j++){x.beginPath();const y=18+j*20;for(let i=0;i<=W;i+=12)x.lineTo(i,y+Math.sin(i*.018+t*(1+j*.2)+j)*4);x.stroke()}
      rs=rs.filter(r=>r.a>.01);for(const r of rs){r.r+=2.2;r.a*=.975;x.strokeStyle=`rgba(242,214,140,${r.a})`;x.lineWidth=1.6;x.beginPath();x.ellipse(W/2,H/2,r.r,r.r*.32,0,0,6.3);x.stroke()}}
    f();return{drop(){[0,260,520].forEach(d=>setTimeout(()=>rs.push({r:6,a:.9}),d))}}}
  function wire(root){const cv=root.querySelector('#rqCv');if(!cv)return;const w=ripples(cv),s=root.querySelector('.rq-sheet'),t=root.querySelector('#rqText');
    root.querySelector('.rq-send').onclick=()=>{const v=t.value.trim();if(!v){App.toast('اكتب رقعتك أولًا');t.focus();return}
      if(root.querySelector('#rqKeep').checked){const a=store.list('ruqas');a.unshift({at:Date.now(),text:v});store.set('ruqas',a)}
      SFX.play('paper');s.classList.add('fold');
      setTimeout(()=>{s.classList.add('sink');SFX.play('sink');setTimeout(()=>w.drop(),520)},900);
      setTimeout(()=>{s.classList.remove('fold','sink');t.value='';App.toast('وصلت رقعتك إلى الماء')},3000)}}
  return{html,wire};
})();
