// افتتاحية 15 ثانية على نسق الفيديو المرفق، ومشاهدها تتبع نبضاته (0.75، 2.0، 3.25 ... 12.0)
'use strict';
const Splash=(()=>{
  const el=document.getElementById('splash');
  const audio=document.getElementById('splashAudio');
  let done=null,timers=[],tick=null;
  const clear=()=>{timers.forEach(clearTimeout);timers=[];clearInterval(tick)};
  function finish(){clear();try{audio.pause()}catch(e){}el.classList.add('out');setTimeout(()=>{el.hidden=true;el.classList.remove('run','out');if(done){const d=done;done=null;d()}},620)}
  function age(){const a=Age.age();const n=el.querySelector('[data-age]');if(n)n.textContent=`${ar(a.years)} سنة · ${months(a.months)} · ${dayz(a.days)}`;
    const m=el.querySelector('[data-min]');if(m)m.textContent=`${ar(a.totalMinutes)} دقيقة`}
  function run(){el.classList.remove('gate');void el.offsetWidth;el.classList.add('run');age();tick=setInterval(age,1000);
    try{audio.currentTime=0;audio.muted=!SFX.on();const p=audio.play();p&&p.catch(()=>{})}catch(e){}
    timers.push(setTimeout(finish,15000));
    el.querySelectorAll('[data-spark]').forEach(s=>s.remove());
    const box=el.querySelector('.sp-sparks');for(let i=0;i<46;i++){const d=document.createElement('i');d.dataset.spark=1;d.style.cssText=`--x:${Math.random()*100}%;--y:${Math.random()*100}%;--d:${(3+Math.random()*6).toFixed(2)}s;--w:${(-Math.random()*8).toFixed(2)}s;--s:${(1+Math.random()*2.4).toFixed(1)}px`;box.appendChild(d)}
  }
  function start(cb){done=cb;
    if(!store.get('splash',true)||/[?&]nosplash/.test(location.search)){el.hidden=true;cb();return}
    el.hidden=false;el.classList.add('gate');
    // المتصفح يمنع الصوت قبل أول لمسة: جرّب مباشرة، وإلا فبوابة لمسة واحدة
    audio.muted=false;const p=audio.play();
    if(p&&p.then)p.then(()=>{audio.pause();run()}).catch(()=>{});else run();
  }
  el.addEventListener('click',e=>{if(e.target.closest('.sp-skip')){finish();return}if(el.classList.contains('gate')){SFX.unlock();run()}});
  return{start,replay(){start(()=>{})}};
})();
