// رسوم «البحوث والمقارنات»: SVG مستقلة تعمل دون إنترنت، بخلفيتها وألوانها وخطها،
// فتُطبع وتُصدَّر كما تُرى. والحركة من CSS (.chart) فإن غابت بقي الرسم كاملًا.
'use strict';
const Charts=(()=>{
  const PAL=['#F2B632','#14B8A6','#38BDF8','#F472B6','#A78BFA','#22C55E','#FB923C','#EF4444','#A3E635','#E0B050','#7dd3c0','#c084fc'];
  const INK='#f5ead6',MUT='#c4b398',GRID='rgba(242,182,50,.16)',BG1='#1c130b',BG2='#0e0906',FONT="Tajawal,'El Messiri',Cairo,sans-serif";
  const e=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const n=v=>(typeof ar==='function'?ar(v):String(v));
  const cut=(s,k)=>{s=String(s);return s.length>k?s.slice(0,k-1)+'…':s};
  const f1=v=>Math.round(v*10)/10;
  // نص عربي: a='r' يبدأ من x ويمتد يسارًا، 'l' ينتهي عند x ويمتد يمينًا، 'm' وسط
  const T=(x,y,s,{a='r',size=13,fill=INK,w=500,cls='',extra=''}={})=>`<text x="${f1(x)}" y="${f1(y)}" direction="rtl" text-anchor="${a==='r'?'start':a==='l'?'end':'middle'}" font-size="${size}" font-weight="${w}" fill="${fill}" ${cls?`class="${cls}"`:''} ${extra}>${e(s)}</text>`;
  let uid=0,CW=640;const narrow=()=>CW<520;
  function frame(W,H,body,{title='',sub=''}={}){const id='g'+(++uid);
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="${FONT}" role="img" aria-label="${e(title)}">
<defs><linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BG1}"/><stop offset="1" stop-color="${BG2}"/></linearGradient>
<linearGradient id="${id}l" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#F2B632" stop-opacity="0"/><stop offset=".5" stop-color="#ffd36e"/><stop offset="1" stop-color="#F2B632" stop-opacity="0"/></linearGradient></defs>
<rect width="${W}" height="${H}" rx="18" fill="url(#${id}b)"/><rect x=".5" y=".5" width="${W-1}" height="${H-1}" rx="18" fill="none" stroke="rgba(242,182,50,.32)"/>
${title?T(W-22,34,cut(title,Math.floor((W-40)/6.6)),{size:Math.max(12.5,Math.min(18,(W-48)/(title.length*.56))),w:700,fill:'#ffd36e'}):''}${sub?T(W-22,56,sub,{size:12.5,fill:MUT}):''}
<rect class="cg-laser" x="0" y="${title?66:0}" width="${W}" height="1.5" fill="url(#${id}l)"/>
${body}</svg>`}
  const empty=(W,H,o)=>frame(W,H,T(W/2,H/2+6,'لا بيانات لهذا الرسم بعد',{a:'m',fill:MUT,size:15}),o);

  /* أعمدة أفقية مرتبة، تنمو من اليمين */
  function hbar(data,o={}){data=data.filter(d=>d.value>0);const W=CW,rh=30,top=o.title?82:20,lw=o.lw||Math.round(CW*.36),H=top+Math.max(1,data.length)*rh+18;
    if(!data.length)return empty(W,160,o);const max=Math.max(...data.map(d=>d.value)),bw=W-lw-80;
    const body=data.map((d,i)=>{const y=top+i*rh,w=Math.max(3,d.value/max*bw),x=W-lw-20-w,c=d.color||PAL[i%PAL.length];
      return `<g style="--i:${i}">${T(W-20,y+19,cut(d.label,o.cut||Math.floor(lw/7.4)),{size:13})}<rect x="${W-lw-20-bw}" y="${y+6}" width="${bw}" height="18" rx="9" fill="rgba(255,255,255,.04)"/>
      <rect class="cg-bx" x="${f1(x)}" y="${y+6}" width="${f1(w)}" height="18" rx="9" fill="${c}"/>${T(x-8,y+20,n(d.value),{a:'r',size:13,w:700,fill:c,cls:'cg-pop'})}</g>`}).join('');
    return frame(W,H,body,o)}

  /* حلقة دائرية مع وسيلة إيضاح */
  function arc(cx,cy,r,a0,a1){const p=a=>[cx+r*Math.sin(a),cy-r*Math.cos(a)];const [x0,y0]=p(a0),[x1,y1]=p(a1);return `M${f1(x0)} ${f1(y0)}A${r} ${r} 0 ${a1-a0>Math.PI?1:0} 1 ${f1(x1)} ${f1(y1)}`}
  function donut(data,o={}){data=data.filter(d=>d.value>0);const W=CW,top=o.title?70:10,nr=narrow(),H=nr?top+250+data.length*30:top+Math.max(250,data.length*30+30);
    if(!data.length)return empty(W,200,o);const tot=data.reduce((s,d)=>s+d.value,0),cx=nr?W/2:170,cy=nr?top+122:top+(H-top)/2,r=92;let a=0;
    const segs=data.map((d,i)=>{const da=d.value/tot*Math.PI*2,c=d.color||PAL[i%PAL.length];const p=arc(cx,cy,r,a,a+Math.max(da-.02,.001));a+=da;
      return `<path class="cg-arc" style="--i:${i}" pathLength="1" d="${p}" fill="none" stroke="${c}" stroke-width="34" stroke-linecap="butt"/>`}).join('');
    const leg=data.map((d,i)=>{const y=nr?top+262+i*30:top+(H-top)/2-data.length*15+i*30+20,c=d.color||PAL[i%PAL.length];
      return `<g class="cg-pop" style="--i:${i}"><rect x="${W-36}" y="${y-11}" width="14" height="14" rx="4" fill="${c}"/>${T(W-46,y,cut(d.label,24),{size:13.5})}${T(nr?22:330,y,`${n(d.value)} · ${n(Math.round(d.value/tot*100))}٪`,{a:'l',size:13.5,w:700,fill:c})}</g>`}).join('');
    return frame(W,H,`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="34"/>${segs}
      ${T(cx,cy+4,n(tot),{a:'m',size:30,w:700,fill:'#ffd36e',cls:'cg-pop'})}${T(cx,cy+26,o.center||'المجموع',{a:'m',size:12.5,fill:MUT})}${leg}`,o)}

  /* خط ومساحة عبر محور (القرون) */
  function area(labels,series,o={}){const W=CW,top=o.title?86:24,H=top+230,l=50,r=24,b=46,ih=H-top-b,iw=W-l-r;
    const max=Math.max(1,...series.flatMap(s=>s.values));if(!labels.length)return empty(W,200,o);
    const X=i=>labels.length===1?l+iw/2:W-r-i*(iw/(labels.length-1)),Y=v=>top+ih-v/max*ih;
    let g='';for(let k=0;k<=4;k++){const v=max*k/4,y=Y(v);g+=`<line x1="${l}" x2="${W-r}" y1="${f1(y)}" y2="${f1(y)}" stroke="${GRID}"/>${T(l-8,y+4,n(Math.round(v)),{a:'l',size:11,fill:MUT})}`}
    labels.forEach((t,i)=>{g+=T(X(i),H-b+22,t,{a:'m',size:12,fill:MUT})});
    const id='a'+(++uid);
    const paths=series.map((s,si)=>{const c=s.color||PAL[si%PAL.length];const pts=s.values.map((v,i)=>[X(i),Y(v)]);
      const d=pts.map((p,i)=>(i?'L':'M')+f1(p[0])+' '+f1(p[1])).join('');
      return `<defs><linearGradient id="${id}${si}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".42"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient></defs>
      <path class="cg-fade" d="${d}L${f1(pts[pts.length-1][0])} ${top+ih}L${f1(pts[0][0])} ${top+ih}Z" fill="url(#${id}${si})"/>
      <path class="cg-line" pathLength="1" d="${d}" fill="none" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>
      ${pts.map((p,i)=>s.values[i]?`<circle class="cg-dot" style="--i:${i}" cx="${f1(p[0])}" cy="${f1(p[1])}" r="5" fill="${BG2}" stroke="${c}" stroke-width="2.5"/>`:'').join('')}`}).join('');
    return frame(W,H,g+paths+legend(series,W,H-12),o)}
  function legend(series,W,y){if(series.length<2)return '';let x=W-22;return series.map((s,i)=>{const c=s.color||PAL[i%PAL.length],t=cut(s.name,Math.max(5,Math.min(16,Math.floor((W-40)/series.length/7.2)-5)));const h=`<rect x="${x-12}" y="${y-10}" width="12" height="12" rx="3" fill="${c}"/>${T(x-18,y,t,{size:12})}`;x-=t.length*7.2+40;return h}).join('')}

  /* أعمدة عمودية مجمّعة: مقارنة مصطلحات عبر فئات */
  function grouped(cats,series,o={}){const W=CW,top=o.title?86:24,b=series.length>1?70:52,H=top+240+b-52,l=46,r=20,ih=H-top-b,iw=W-l-r;
    const max=Math.max(1,...series.flatMap(s=>s.values));if(!cats.length)return empty(W,200,o);
    const gw=iw/cats.length,bw=Math.min(34,(gw-14)/series.length);let g='';
    for(let k=0;k<=4;k++){const v=max*k/4,y=top+ih-v/max*ih;g+=`<line x1="${l}" x2="${W-r}" y1="${f1(y)}" y2="${f1(y)}" stroke="${GRID}"/>${T(l-8,y+4,n(Math.round(v)),{a:'l',size:11,fill:MUT})}`}
    cats.forEach((c,ci)=>{const gx=W-r-ci*gw-gw/2;g+=T(gx,top+ih+20,cut(c,Math.max(5,Math.min(14,Math.floor(gw/7.4)))),{a:'m',size:12.5,fill:MUT});
      series.forEach((s,si)=>{const v=s.values[ci]||0,h=v/max*ih,x=gx+(series.length/2-si-1)*bw,col=s.color||PAL[si%PAL.length];
        g+=`<rect class="cg-by" style="--i:${ci*series.length+si}" x="${f1(x+2)}" y="${f1(top+ih-h)}" width="${f1(bw-4)}" height="${f1(Math.max(h,0))}" rx="6" fill="${col}"/>${v?T(x+bw/2,top+ih-h-6,n(v),{a:'m',size:11.5,w:700,fill:col,cls:'cg-pop'}):''}`})});
    return frame(W,H,g+legend(series,W,H-14),o)}

  /* شبكة عنكبوتية (رادار) */
  function radar(axes,series,o={}){const W=CW,top=o.title?70:10,H=top+340,cx=W/2,cy=top+170,R=Math.min(118,W*.27);if(axes.length<3)return hbar(axes.map((a,i)=>({label:a,value:series[0].values[i]})),o);
    const max=Math.max(1,...series.flatMap(s=>s.values)),ang=i=>i/axes.length*Math.PI*2,P=(i,r)=>[cx-r*Math.sin(ang(i)),cy-r*Math.cos(ang(i))];
    let g='';for(let k=1;k<=4;k++)g+=`<polygon points="${axes.map((_,i)=>P(i,R*k/4).map(f1).join(',')).join(' ')}" fill="none" stroke="${GRID}"/>`;
    axes.forEach((a,i)=>{const [x,y]=P(i,R),[tx,ty]=P(i,R+24);g+=`<line x1="${cx}" y1="${cy}" x2="${f1(x)}" y2="${f1(y)}" stroke="${GRID}"/>`+T(tx,ty+4,cut(a,13),{a:'m',size:12,fill:MUT})});
    g+=series.map((s,si)=>{const c=s.color||PAL[si%PAL.length];const pts=s.values.map((v,i)=>P(i,v/max*R).map(f1).join(','));
      return `<polygon class="cg-grow" style="--i:${si}" points="${pts.join(' ')}" fill="${c}" fill-opacity=".22" stroke="${c}" stroke-width="2.5" stroke-linejoin="round"/>${pts.map((p,i)=>s.values[i]?`<circle class="cg-dot" style="--i:${i}" cx="${p.split(',')[0]}" cy="${p.split(',')[1]}" r="4" fill="${c}"/>`:'').join('')}`}).join('');
    return frame(W,H,g+legend(series,W,H-12),o)}

  /* خريطة حرارية: صفوف × أعمدة */
  function heat(rows,cols,M,o={}){const W=CW,top=o.title?82:20,lw=Math.min(150,Math.round(W*.28)),ch=34,H=top+rows.length*ch+52;if(!rows.length||!cols.length)return empty(W,200,o);
    const cw=(W-lw-30)/cols.length,max=Math.max(1,...M.flat());let g='';
    cols.forEach((c,j)=>{g+=T(W-lw-20-j*cw-cw/2,top+12,cut(c,Math.max(6,Math.floor(cw/8))),{a:'m',size:12,fill:MUT})});
    rows.forEach((rw,i)=>{const y=top+22+i*ch;g+=T(W-20,y+21,cut(rw,Math.floor(lw/7.5)),{size:13});
      cols.forEach((c,j)=>{const v=M[i][j]||0,x=W-lw-20-(j+1)*cw,t=v/max;
        g+=`<rect class="cg-pop" style="--i:${i*cols.length+j}" x="${f1(x+2)}" y="${y+2}" width="${f1(cw-4)}" height="${ch-4}" rx="7" fill="${v?`rgba(242,182,50,${f1(.12+t*.83)})`:'rgba(255,255,255,.035)'}"/>${v?T(x+cw/2,y+22,n(v),{a:'m',size:12.5,w:700,fill:t>.55?'#1a120b':INK}):''}`})});
    return frame(W,H,g,o)}

  /* مربعات متداخلة (treemap) */
  function squarify(items,x,y,w,h){const out=[];items=items.filter(d=>d.value>0).sort((a,b)=>b.value-a.value);const tot=items.reduce((s,d)=>s+d.value,0);if(!tot)return out;
    const scale=w*h/tot;let rest=items.map(d=>({...d,a:d.value*scale}));
    while(rest.length){const short=Math.min(w,h);let row=[rest[0]],best=worst(row,short);
      for(let i=1;i<rest.length;i++){const nr=row.concat(rest[i]),wv=worst(nr,short);if(wv<=best){row=nr;best=wv}else break}
      const sum=row.reduce((s,d)=>s+d.a,0),th=sum/short;let off=0;
      row.forEach(d=>{const len=d.a/th;if(w>=h)out.push({...d,x:x+w-th,y:y+off,w:th,h:len});else out.push({...d,x:x+w-off-len,y,w:len,h:th});off+=len});
      if(w>=h)w-=th;else{y+=th;h-=th}rest=rest.slice(row.length)}
    return out;function worst(r,s){const sum=r.reduce((a,d)=>a+d.a,0),mx=Math.max(...r.map(d=>d.a)),mn=Math.min(...r.map(d=>d.a));return Math.max(s*s*mx/(sum*sum),sum*sum/(s*s*mn))}}
  function treemap(data,o={}){const W=CW,top=o.title?76:12,H=top+330;if(!data.some(d=>d.value>0))return empty(W,200,o);
    const cells=squarify(data.map((d,i)=>({...d,color:d.color||PAL[i%PAL.length]})),14,top,W-28,H-top-14);
    return frame(W,H,cells.map((c,i)=>{const big=c.w>70&&c.h>40;return `<g class="cg-pop" style="--i:${i}"><rect x="${f1(c.x+2)}" y="${f1(c.y+2)}" width="${f1(Math.max(c.w-4,1))}" height="${f1(Math.max(c.h-4,1))}" rx="8" fill="${c.color}" fill-opacity=".85"/>
      ${big?T(c.x+c.w-10,c.y+22,cut(c.label,Math.floor(c.w/8)),{size:12.5,w:700,fill:'#1a120b'})+T(c.x+c.w-10,c.y+40,n(c.value),{size:12,fill:'#1a120b'}):c.w>26&&c.h>20?T(c.x+c.w/2,c.y+c.h/2+5,n(c.value),{a:'m',size:11,w:700,fill:'#1a120b'}):''}</g>`}).join(''),o)}

  /* سحابة كلمات حلزونية */
  function cloud(words,o={}){const W=CW,top=o.title?74:10,H=top+300;if(!words.length)return empty(W,200,o);
    const max=words[0][1],min=words[words.length-1][1],placed=[],cx=W/2,cy=top+(H-top)/2;let g='';
    words.forEach(([w,c],i)=>{const fs=Math.round(13+(max===min?.5:(c-min)/(max-min))*26),bw=w.length*fs*.56+8,bh=fs*1.15;
      for(let t=0;t<900;t++){const a=t*.35,r=2.2*a,x=cx+r*Math.cos(a)*1.5,y=cy+r*Math.sin(a)*.8;const bx={x:x-bw/2,y:y-bh/2,w:bw,h:bh};
        if(bx.x<12||bx.x+bw>W-12||bx.y<top||bx.y+bh>H-8)continue;
        if(placed.some(p=>!(bx.x+bx.w<p.x||p.x+p.w<bx.x||bx.y+bx.h<p.y||p.y+p.h<bx.y)))continue;
        placed.push(bx);g+=T(x,y+fs*.35,w,{a:'m',size:fs,w:i<5?700:500,fill:PAL[i%PAL.length],cls:'cg-pop',extra:`style="--i:${i}"`});break}});
    return frame(W,H,g,o)}

  /* خريطة ذهنية شعاعية: جذر ← فروع ← أوراق */
  function mind(tree,o={}){const W=CW,top=o.title?70:10,H=top+(narrow()?560:520),cx=W/2,cy=top+(H-top)/2;const br=(tree.children||[]).slice(0,8);
    if(!br.length)return empty(W,220,o);let links='',nodes='';const nr=narrow(),R1=W*(nr?.24:.2),R2=W*(nr?.33:.28),Y1=nr?140:125,Y2=nr?232:215;
    const leaves=br.reduce((s,b)=>s+Math.max(1,Math.min(4,(b.children||[]).length)),0);let k=0;const OFF=br.length<=3?Math.PI/4:0;
    br.forEach((b,i)=>{const kids=(b.children||[]).slice(0,4),span=Math.max(1,kids.length),mid=OFF+(k+span/2)/leaves*Math.PI*2;const c=b.color||PAL[i%PAL.length];
      const bx=cx+R1*Math.sin(mid),by=cy-Y1*Math.cos(mid);
      links+=`<path class="cg-line" pathLength="1" d="M${cx} ${cy}Q${f1((cx+bx)/2+12)} ${f1((cy+by)/2-12)} ${f1(bx)} ${f1(by)}" fill="none" stroke="${c}" stroke-width="3" stroke-opacity=".85"/>`;
      kids.forEach((kd,j)=>{const a=OFF+(k+j+.5)/leaves*Math.PI*2,lx=cx+R2*Math.sin(a),ly=cy-Y2*Math.cos(a);
        links+=`<path class="cg-line" pathLength="1" style="--i:${j+2}" d="M${f1(bx)} ${f1(by)}Q${f1((bx+lx)/2)} ${f1((by+ly)/2+10)} ${f1(lx)} ${f1(ly)}" fill="none" stroke="${c}" stroke-width="1.6" stroke-opacity=".6"/>`;
        const right=Math.sin(a)>=0;const lab=cut(kd.label,nr?10:14)+(kd.value?` (${n(kd.value)})`:'');
        nodes+=`<g class="cg-pop" style="--i:${i*4+j+8}"><circle cx="${f1(lx)}" cy="${f1(ly)}" r="5" fill="${c}"/>${T(right?lx+9:lx-9,ly+4,lab,{a:right?'l':'r',size:12,fill:INK})}</g>`});
      k+=span;const lab=cut(b.label,14),tw=lab.length*7.6+24;
      nodes+=`<g class="cg-pop" style="--i:${i+1}"><rect x="${f1(bx-tw/2)}" y="${f1(by-16)}" width="${f1(tw)}" height="32" rx="16" fill="${BG1}" stroke="${c}" stroke-width="2"/>${T(bx,by+5,lab,{a:'m',size:13,w:700,fill:c})}${b.value?`<circle cx="${f1(bx+tw/2-2)}" cy="${f1(by-14)}" r="11" fill="${c}"/>${T(bx+tw/2-2,by-10,n(b.value),{a:'m',size:10.5,w:700,fill:'#1a120b'})}`:''}</g>`});
    const rl=cut(tree.label,16),rw=rl.length*10+40;
    nodes+=`<g class="cg-pop"><rect x="${f1(cx-rw/2)}" y="${cy-24}" width="${f1(rw)}" height="48" rx="24" fill="#F2B632"/>${T(cx,cy+7,rl,{a:'m',size:18,w:700,fill:'#1a120b'})}</g>`;
    return frame(W,H,links+nodes,o)}

  /* تدفق (sankey): يسار ← يمين */
  function sankey(L,R,links,o={}){const W=CW,top=o.title?80:16,H=top+300,nw=14,gap=10,x1=W-Math.round(W*.24),x0=Math.round(W*.27);links=links.filter(l=>l.value>0);if(!links.length)return empty(W,200,o);
    const tot=links.reduce((s,l)=>s+l.value,0),ih=H-top-20;
    const lay=(arr,side)=>{const sums=arr.map(a=>links.filter(l=>(side?l.t:l.s)===a.k).reduce((s,l)=>s+l.value,0));const used=arr.filter((_,i)=>sums[i]);const sc=(ih-gap*(used.length-1))/tot;let y=top;const m={};
      arr.forEach((a,i)=>{if(!sums[i])return;m[a.k]={...a,y,h:sums[i]*sc,v:sums[i],off:0};y+=sums[i]*sc+gap});return{m,sc}};
    const A=lay(L,0),B=lay(R,1),sc=A.sc;let g='';
    links.sort((p,q)=>(A.m[p.s].y-A.m[q.s].y)||(B.m[p.t].y-B.m[q.t].y)).forEach((l,i)=>{const s=A.m[l.s],t=B.m[l.t],h=l.value*sc;const ys=s.y+s.off+h/2,yt=t.y+t.off+h/2;s.off+=h;t.off+=h;
      g+=`<path class="cg-line" style="--i:${i}" pathLength="1" d="M${x1} ${f1(ys)}C${(x0+x1)/2} ${f1(ys)} ${(x0+x1)/2} ${f1(yt)} ${x0+nw} ${f1(yt)}" fill="none" stroke="${s.c}" stroke-opacity=".45" stroke-width="${f1(Math.max(h,1.5))}"/>`});
    Object.values(A.m).forEach((s,i)=>{g+=`<rect class="cg-pop" style="--i:${i}" x="${x1}" y="${f1(s.y)}" width="${nw}" height="${f1(s.h)}" rx="4" fill="${s.c}"/>`+T(W-14,s.y+s.h/2+5,`${cut(s.t,narrow()?8:12)} ${n(s.v)}`,{size:12.5,w:700,fill:s.c})});
    Object.values(B.m).forEach((t,i)=>{g+=`<rect class="cg-pop" style="--i:${i+4}" x="${x0}" y="${f1(t.y)}" width="${nw}" height="${f1(t.h)}" rx="4" fill="${t.c}"/>`+T(x0-8,t.y+t.h/2+5,`${cut(t.t,narrow()?11:15)} ${n(t.v)}`,{a:'r',size:12,fill:t.c})});
    return frame(W,H,g,o)}

  /* أعمدة مكدسة ١٠٠٪ */
  function stack(cats,segs,M,o={}){const W=CW,top=o.title?82:20,rh=40,lw=narrow()?84:120,H=top+cats.length*rh+54+(narrow()?48:0);if(!cats.length)return empty(W,200,o);const bw=W-lw-64;let g='';
    cats.forEach((c,i)=>{const y=top+i*rh,tot=M[i].reduce((s,v)=>s+v,0);g+=T(W-20,y+24,cut(c,narrow()?9:14),{size:13})+T(16,y+24,n(tot),{a:'l',size:12,fill:MUT});let x=W-lw-20;
      if(!tot){g+=`<rect x="${W-lw-20-bw}" y="${y+8}" width="${bw}" height="24" rx="8" fill="rgba(255,255,255,.04)"/>`;return}
      M[i].forEach((v,j)=>{if(!v)return;const w=v/tot*bw;x-=w;g+=`<rect class="cg-bx" style="--i:${i*segs.length+j}" x="${f1(x)}" y="${y+8}" width="${f1(w)}" height="24" fill="${segs[j].c}"/>${w>30?T(x+w/2,y+25,n(Math.round(v/tot*100))+'٪',{a:'m',size:11,w:700,fill:'#1a120b'}):''}`})});
    let x=W-22,ly=H-18-(narrow()?48:0);g+=segs.map(s=>{const wd=s.t.length*6.6+34;if(x-wd<10){x=W-22;ly+=22}const h=`<rect x="${x-12}" y="${ly-10}" width="12" height="12" rx="3" fill="${s.c}"/>${T(x-18,ly,s.t,{size:11.5})}`;x-=wd;return h}).join('');
    return frame(W,H,g,o)}

  /* شمس متفجرة: حلقة داخلية للأبواب وخارجية للأقسام */
  function sunburst(tree,o={}){const kids=(tree||[]).filter(k=>k.value>0),nr=narrow(),W=CW,top=o.title?70:10,H=nr?top+330+kids.length*26:top+360,cx=nr?W/2:W/2-110,cy=nr?top+165:top+(H-top)/2;if(!kids.length)return empty(W,200,o);
    const tot=kids.reduce((s,k)=>s+k.value,0);let a=0,g='',leg='';
    kids.forEach((k,i)=>{const c=k.color||PAL[i%PAL.length],da=k.value/tot*Math.PI*2;
      g+=`<path class="cg-arc" style="--i:${i}" pathLength="1" d="${arc(cx,cy,70,a,a+da-.015)}" fill="none" stroke="${c}" stroke-width="44"/>`;let b=a;
      (k.children||[]).forEach((s,j)=>{const ds=s.value/tot*Math.PI*2;g+=`<path class="cg-arc" style="--i:${i+j+3}" pathLength="1" d="${arc(cx,cy,124,b,b+ds-.012)}" fill="none" stroke="${c}" stroke-opacity="${.45+.5*(j%2)}" stroke-width="54"/>`;b+=ds});a+=da;
      const y=nr?top+340+i*26:top+30+i*Math.min(26,(H-top-40)/kids.length);leg+=`<g class="cg-pop" style="--i:${i}"><rect x="${W-34}" y="${y-11}" width="13" height="13" rx="3" fill="${c}"/>${T(W-42,y,`${cut(k.label,18)} · ${n(k.value)}`,{size:12.5})}</g>`});
    return frame(W,H,g+`<circle cx="${cx}" cy="${cy}" r="46" fill="${BG2}"/>${T(cx,cy+6,o.center||'',{a:'m',size:14,w:700,fill:'#ffd36e'})}`+leg,o)}

  /* فقاعات على خط زمني: س = القرن، ح = العدد */
  function bubbles(items,o={}){const W=CW,top=o.title?80:16,H=top+250,l=30,r=30;if(!items.length)return empty(W,200,o);
    const xs=items.map(d=>d.x),mn=Math.min(...xs),mx=Math.max(...xs),mv=Math.max(...items.map(d=>d.v));const X=x=>mx===mn?W/2:W-r-(x-mn)/(mx-mn)*(W-l-r),base=H-46;let g=`<line x1="${l}" x2="${W-r}" y1="${base}" y2="${base}" stroke="${GRID}" stroke-width="2"/>`;
    const cents=[...new Set(xs.map(x=>Math.ceil(x/100)))];cents.forEach(c=>{const x=X(c*100-50);if(x>=l&&x<=W-r)g+=T(x,base+22,'ق'+n(c),{a:'m',size:11.5,fill:MUT})});
    const lanes=[];items.sort((a,b)=>b.v-a.v).forEach((d,i)=>{const rr=(narrow()?6:8)+Math.sqrt(d.v/mv)*(narrow()?18:24);let x=X(d.x),y=base-rr-6;
      const x0=x,y0=base-rr-6;for(let t=0;t<600;t++){const a=t*.55,rd=Math.sqrt(t)*7;x=x0+Math.cos(a)*rd;y=y0-Math.abs(Math.sin(a))*rd*.8;if(x-rr<l||x+rr>W-r||y-rr<top+6)continue;if(!lanes.some(p=>Math.hypot(p.x-x,p.y-y)<p.r+rr+2))break}lanes.push({x,y,r:rr});const c=d.color||PAL[i%PAL.length];
      g+=`<g class="cg-pop" style="--i:${i}"><line x1="${f1(x)}" x2="${f1(x)}" y1="${f1(y+rr)}" y2="${base}" stroke="${c}" stroke-opacity=".4"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(rr)}" fill="${c}" fill-opacity=".8"/>${T(x,y+4,n(d.v),{a:'m',size:11,w:700,fill:'#1a120b'})}${rr>16?'':''}<title>${e(d.label)}: ${n(d.v)}</title></g>`;
      if(i===0){const lx=Math.max(l+50,Math.min(W-r-50,x));g+=T(lx,Math.max(top+14,y-rr-8),cut(d.label,16),{a:'m',size:12,w:700,fill:c})}});
    return frame(W,H,g,o)}

  /* وردة قطبية */
  function rose(data,o={}){data=data.filter(d=>d.value>0);const W=CW,top=o.title?70:10,H=top+330,cx=W/2,cy=top+(H-top)/2,R=Math.min(130,W*.29);if(!data.length)return empty(W,200,o);
    const mx=Math.max(...data.map(d=>d.value)),da=Math.PI*2/data.length;let g='';
    for(let k=1;k<=3;k++)g+=`<circle cx="${cx}" cy="${cy}" r="${R*k/3}" fill="none" stroke="${GRID}"/>`;
    data.forEach((d,i)=>{const r=24+Math.sqrt(d.value/mx)*(R-24),a0=i*da,a1=a0+da-.04,c=d.color||PAL[i%PAL.length];const p=(a,rr)=>[cx+rr*Math.sin(a),cy-rr*Math.cos(a)];
      const [x0,y0]=p(a0,r),[x1,y1]=p(a1,r),[lx,ly]=p(a0+da/2,r+18);
      g+=`<path class="cg-grow" style="--i:${i}" d="M${cx} ${cy}L${f1(x0)} ${f1(y0)}A${f1(r)} ${f1(r)} 0 0 1 ${f1(x1)} ${f1(y1)}Z" fill="${c}" fill-opacity=".82"/>`+T(lx,ly+4,`${cut(d.label,10)} ${n(d.value)}`,{a:'m',size:11.5,fill:c})});
    return frame(W,H,g,o)}

  return{setW:w=>{CW=w},hbar,donut,area,grouped,radar,heat,treemap,cloud,mind,sankey,stack,sunburst,bubbles,rose,PAL}
})();
if(typeof module!=='undefined')module.exports=Charts;
