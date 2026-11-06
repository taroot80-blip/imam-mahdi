// أصوات غير موسيقية مولَّدة: لكل زر توقيعه من الأشياء: ورق، ماء، حجر، ريح، قلم، ختم...
'use strict';
const SFX=(()=>{
  let ctx=null;
  const on=()=>store.get('sfx',true);
  const ac=()=>{if(!ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ctx=new C()}if(ctx.state==='suspended')ctx.resume();return ctx};
  function noise(t0,d,f1,f2,g,type='bandpass',q=1.2,shape=2){const c=ac();if(!c)return;const t=c.currentTime+t0,n=Math.max(1,Math.floor(c.sampleRate*d)),b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);
    for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*Math.pow(1-i/n,shape);
    const s=c.createBufferSource(),f=c.createBiquadFilter(),v=c.createGain();s.buffer=b;f.type=type;f.Q.value=q;f.frequency.setValueAtTime(f1,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f2),t+d);v.gain.value=g;s.connect(f).connect(v).connect(c.destination);s.start(t)}
  function thud(t0,f,d,g){const c=ac();if(!c)return;const t=c.currentTime+t0,o=c.createOscillator(),v=c.createGain();o.frequency.setValueAtTime(f*2,t);o.frequency.exponentialRampToValueAtTime(f,t+d*.5);v.gain.setValueAtTime(g,t);v.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(v).connect(c.destination);o.start(t);o.stop(t+d+.02)}
  const drop=(t0,f,g=.22)=>{const c=ac();if(!c)return;const t=c.currentTime+t0,o=c.createOscillator(),v=c.createGain();o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*2.6,t+.11);v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(g,t+.006);v.gain.exponentialRampToValueAtTime(.0001,t+.14);o.connect(v).connect(c.destination);o.start(t);o.stop(t+.16)};
  const P={
    tap:()=>noise(0,.035,2600,1800,.16),
    paper:()=>{noise(0,.28,900,3600,.16,'bandpass',.7,1.2);noise(.12,.2,4200,1600,.1,'highpass',.7)},
    // حفيف قلب الصفحة: تجعّد متقطع ثم نفَس ورق
    leaf:()=>{for(let i=0;i<7;i++)noise(.02+i*.045+Math.random()*.02,.05,1800+Math.random()*3400,1400,.05+Math.random()*.06,'bandpass',1.6,1.4);noise(.05,.42,1200,5200,.11,'bandpass',.6,1);noise(.4,.14,3200,900,.1,'lowpass',.7)},
    water:()=>{drop(0,420);drop(.09,620,.14);noise(.05,.3,700,240,.05,'lowpass',.7)},
    sink:()=>{drop(0,300,.26);drop(.13,460,.2);drop(.29,640,.16);drop(.5,860,.1);noise(0,1.3,520,110,.12,'lowpass',.7,1)},
    stone:()=>{thud(0,110,.13,.5);noise(0,.04,2600,700,.22,'bandpass',2)},
    wind:()=>noise(0,.5,300,1400,.17,'bandpass',1.8,.7),
    pen:()=>{for(let i=0;i<4;i++)noise(i*.05,.04,5200,3400,.1,'highpass',1)},
    seal:()=>{thud(0,70,.2,.6);noise(0,.03,900,300,.3,'lowpass')},
    cloth:()=>noise(0,.24,600,2100,.15,'bandpass',.6,1.1),
    sand:()=>{for(let i=0;i<9;i++)noise(i*.022,.02,6400,5200,.06,'highpass',1)},
    wood:()=>{thud(0,300,.07,.4);thud(.09,240,.07,.28)},
    ember:()=>{for(let i=0;i<5;i++)noise(Math.random()*.2,.016,3000+Math.random()*2400,2000,.2,'bandpass',4)},
    key:()=>{noise(0,.03,4200,3000,.2,'bandpass',5);noise(.08,.05,2800,1800,.2,'bandpass',5);thud(.08,160,.05,.2)},
    wax:()=>{noise(0,.1,900,300,.14,'lowpass');thud(.05,90,.1,.34)},
    open:()=>noise(0,.2,500,2600,.11,'bandpass',1.3,1.1),
    close:()=>noise(0,.16,2400,450,.1,'bandpass',1.3,1.1),
    mic:()=>{thud(0,190,.06,.22);noise(.06,.06,2200,1200,.1)},
    cover:()=>{thud(0,84,.26,.5);noise(0,.5,420,1500,.13,'bandpass',.7,1)},
    save:()=>{noise(0,.05,3400,2200,.12);thud(.03,140,.08,.26)},
  };
  return {play(k){if(!on())return;try{P[k]&&P[k]()}catch(e){}},on,toggle(){store.set('sfx',!on());if(on())P.tap();return on()},unlock(){ac()}};
})();
document.addEventListener('click',e=>{const b=e.target.closest('button,a,[data-sfx]');if(!b)return;SFX.play(b.dataset.sfx||'tap')},true);
