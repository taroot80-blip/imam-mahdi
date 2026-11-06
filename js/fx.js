// خلفية حيّة: جزيئات ذهبية وخطوط ليزر تعبر الشاشة بهدوء
'use strict';
const FX=(()=>{
  const c=document.getElementById('fx'),x=c.getContext('2d');let W=0,H=0,DPR=1,ps=[],beam=null,last=0,slow=0,run=true;
  const lowEnd=(navigator.hardwareConcurrency||4)<=2;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function size(){DPR=Math.min(devicePixelRatio||1,1.5);W=innerWidth;H=innerHeight;c.width=W*DPR;c.height=H*DPR;x.setTransform(DPR,0,0,DPR,0,0);
    const n=reduced?12:lowEnd?22:Math.min(70,Math.round(W*H/16000));ps=Array.from({length:n},mk)}
  function mk(){return{x:Math.random()*W,y:Math.random()*H,r:.4+Math.random()*1.6,v:.05+Math.random()*.22,p:Math.random()*6.3,s:.4+Math.random()*1.4}}
  function newBeam(){const up=Math.random()<.5,col=Math.random()<.72?'242,182,50':Math.random()<.5?'20,184,166':'56,189,248';beam={t:0,d:2600+Math.random()*1800,y:H*(.1+Math.random()*.8),a:(up?-1:1)*(.08+Math.random()*.16),col}}
  function draw(t){if(!run)return;requestAnimationFrame(draw);const dt=Math.min(50,t-last);last=t;
    if(dt>34){slow++;if(slow>60&&ps.length>16){ps.length=Math.ceil(ps.length*.7);slow=0}}else slow=Math.max(0,slow-1);
    x.clearRect(0,0,W,H);
    for(const p of ps){p.y-=p.v*dt*.03;p.p+=.0016*dt*p.s;if(p.y<-4){p.y=H+4;p.x=Math.random()*W}
      const a=.2+.5*Math.pow(Math.sin(p.p),2);x.beginPath();x.arc(p.x+Math.sin(p.p)*6,p.y,p.r,0,6.3);x.fillStyle=`rgba(255,${200+Math.round(p.p*9)%30},110,${a})`;x.fill()}
    if(!reduced){if(!beam&&Math.random()<.006)newBeam();
      if(beam){beam.t+=dt;const k=beam.t/beam.d;if(k>=1)beam=null;else{const px=-W*.3+k*W*1.6,len=W*.45,dy=Math.tan(beam.a)*len,g=x.createLinearGradient(px,0,px+len,0);
        g.addColorStop(0,`rgba(${beam.col},0)`);g.addColorStop(.75,`rgba(${beam.col},.5)`);g.addColorStop(1,`rgba(255,255,240,.85)`);x.strokeStyle=g;x.lineWidth=1.1;x.beginPath();x.moveTo(px,beam.y);x.lineTo(px+len,beam.y+dy);x.stroke()}}}
  }
  addEventListener('resize',size);document.addEventListener('visibilitychange',()=>{run=!document.hidden;if(run)requestAnimationFrame(draw)});
  size();requestAnimationFrame(draw);return{};
})();
