// خريطة توضيحية لمسار المسيرة: رسم غير مقيس، وكل محطة مربوطة بروايتها
'use strict';
const RouteMap=(()=>{
  const B={w:30,e:50,s:18,n:36}, W=640,H=580;
  const P=(lat,lng)=>[(1-(lng-B.w)/(B.e-B.w))*0+((lng-B.w)/(B.e-B.w))*W,(1-(lat-B.s)/(B.n-B.s))*H];
  const poly=a=>a.map(([la,ln])=>P(la,ln).map(v=>v.toFixed(1)).join(',')).join(' ');
  // بحار تقريبية
  const RED=[[29.9,32.6],[28,34.6],[29.5,34.95],[27,35.6],[24,37.3],[21.4,39.1],[18,41],[15,42.8],[12.6,43.4],[12.1,44],[12.3,43.2],[15,41.9],[18,40],[21,37.5],[24,35.6],[27,33.9]];
  const GULF=[[30,48],[29.3,48.1],[27,49.7],[25.5,50.5],[24.2,51.6],[24.2,54],[25.6,56.3],[26.4,56.4],[25.4,58],[27,56.9],[27,54.5],[28.6,51.2],[30,49.2]];
  const MED=[[40,28],[40,36],[36.8,36.2],[34,35.5],[31.3,34.3],[31,32],[31.5,28]];
  const CASP=[[40,50],[40,53.2],[37,54],[37.4,50]];
  const CITIES=[['بغداد',33.3,44.4],['دمشق',33.5,36.3],['الرياض',24.7,46.7]];
  function render(items){
    const stops=items.filter(i=>i.stop&&i.lat&&i.lng).sort((a,b)=>(a.order||0)-(b.order||0));
    const pts=stops.map(s=>P(+s.lat,+s.lng));
    const path=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
    const dots=stops.map((s,i)=>{const[x,y]=pts[i];return `<g class="mp-s" data-i="${i}" tabindex="0" role="button" aria-label="${esc(s.stop)}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="26" class="h"/><circle r="16" class="p"/><circle r="12" class="d"/><text class="n" y="6">${ar(i+1)}</text><text class="l" x="-18" y="7">${esc(s.stop)}</text></g>`}).join('');
    return `<div class="mp"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="خريطة توضيحية لمسار المسيرة">
      <defs><linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#123a3f"/><stop offset="1" stop-color="#0b2a30"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="#2a1d12"/>
      ${[RED,GULF,MED,CASP].map(a=>`<polygon points="${poly(a)}" fill="url(#seaG)" stroke="#c9a25a" stroke-opacity=".45"/>`).join('')}
      ${CITIES.map(([n,la,ln])=>{const[x,y]=P(la,ln);return `<g class="mp-c"><circle cx="${x}" cy="${y}" r="2.4"/><text x="${x-6}" y="${y+4}">${n}</text></g>`}).join('')}
      <path class="mp-line" d="${path}" pathLength="100"/>${dots}</svg>
      <p class="mp-note">خريطة توضيحية غير مقيسة، والترتيب كما في الروايات المذكورة تحت كل محطة.</p>
      <div class="mp-info" id="mpInfo"></div></div>`;
  }
  function wire(root,items){const stops=items.filter(i=>i.stop&&i.lat&&i.lng).sort((a,b)=>(a.order||0)-(b.order||0)),info=root.querySelector('#mpInfo');
    const pick=i=>{root.querySelectorAll('.mp-s').forEach((g,j)=>g.classList.toggle('on',i===j));const s=stops[i];if(!s)return;SFX.play('cloth');
      info.innerHTML=`<h3>${ar(i+1)}. ${esc(s.stop)}</h3><p>${esc(s.summary||s.title)}</p><a class="btn2" href="#/item/${s.id}">الرواية ومصدرها</a>`};
    root.querySelectorAll('.mp-s').forEach((g,i)=>{g.onclick=()=>pick(i);g.onkeydown=e=>{if(e.key==='Enter')pick(i)}});
    if(stops.length)pick(0)}
  return{render,wire};
})();
