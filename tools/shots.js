const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const S='http://localhost:8799/index.html';
const errs=[];const mk=async(w,h)=>{const p=await b.newPage({viewport:{width:w,height:h}});p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});return p};
const out=process.argv[2]||'/tmp/shots';
let p=await mk(390,844);
await p.goto(S+'?nosplash');await p.waitForTimeout(1500);await p.screenshot({path:out+'/home.png'});await p.screenshot({path:out+'/home-full.png',fullPage:true});
for(const[r,n]of [['#/door/kutub','kutub'],['#/door/liqaat','liqaat'],['#/door/tawasul','tawasul'],['#/settings','set'],['#/search/الغيبة','search'],['#/daftar','daftar']]){await p.goto(S+'?nosplash'+r);await p.waitForTimeout(700);await p.screenshot({path:out+'/'+n+'.png'})}
await p.close();
p=await mk(1280,800);await p.goto(S+'?nosplash');await p.waitForTimeout(1300);await p.screenshot({path:out+'/desk.png'});await p.close();
console.log('errs',errs.slice(0,8));await b.close()})()
