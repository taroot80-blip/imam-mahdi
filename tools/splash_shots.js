const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage({viewport:{width:390,height:844}});
await p.goto('http://localhost:8799/index.html');await p.waitForTimeout(300);
const ts=[.8,1.6,4.2,6.2,7.6,9.9,10.8,12.2,13.5,14.7];let t0=Date.now();
const gate=await p.$('.sp-gate');
// قياس التوقيت: يدير الزمن بتجميد الحركات عند كل لحظة
await p.evaluate(()=>{const s=document.getElementById('splash');s.classList.remove('gate');s.classList.add('run')});
for(let i=0;i<ts.length;i++){await p.evaluate(t=>{document.getAnimations().forEach(a=>{const el=a.effect&&a.effect.target;if(el&&el.closest&&el.closest('#splash')&&!el.closest('.sp-sparks')){a.pause();a.currentTime=t*1000}})},ts[i]);await p.waitForTimeout(120);await p.screenshot({path:`/tmp/shots/s${i}.png`})}
await b.close()})()
