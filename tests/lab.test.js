// اختبار محرك «البحوث والمقارنات»: node tests/lab.test.js
const fs=require('fs'),assert=require('assert'),vm=require('vm');
const ctx={console,Intl};vm.createContext(ctx);
for(const f of ['js/store.js','data/books.js','data/content.js','js/lab.js'])vm.runInContext(fs.readFileSync(f,'utf8').replace(/^(const|let) (\w+)=/mg,'var $2='),ctx);
const L=ctx.Lab;
// الأعمار والعصور
assert.equal(L.srcMeta('الغيبة','الشيخ الطوسي').death,460);
assert.equal(L.srcMeta('الغيبة','النعماني').death,360);
assert.equal(L.eraOf(381),'q');assert.equal(L.eraOf(1111),'m');assert.equal(L.eraOf(1419),'h');
assert.equal(L.srcMeta('منتدى الكفيل','').type,'web');
assert.equal(L.parseDeath('ق 8–9هـ'),750);assert.equal(L.parseDeath('معاصر'),1430);
// العدّ لا يتداخل
assert.equal(L.countIn('ابا ابا','ابا'),2);
// كل نص له مصدر معروف العصر إلا القليل
const o=L.overview();assert.equal(o.units,ctx.CONTENT.length);
assert.ok((o.uEra.u||0)<=3,'غير محدد: '+o.uEra.u);
assert.equal(L.srcMeta('(720) الانتظار: الدلالة','مركز الدراسات التخصصية في الإمام المهدي').death,1430);
const cw=L.analyze({terms:['الغيبة']}).cooc.map(x=>x[0]);assert.ok(!cw.includes('علي')&&!cw.includes('محمد'),cw.slice(0,10).join(' '));
assert.equal(Object.values(o.bEra).reduce((a,b)=>a+b,0),62);assert.ok(!o.bEra.u,'كل الكتب معروفة العصر');
// التحليل يطابق العدّ اليدوي
const a=L.analyze({terms:['الغيبة']});const p=a.per[0];
let manual=0;ctx.CONTENT.forEach(x=>{const b=L.N([x.title,x.text,x.summary,(x.tags||[]).join(' ')].join(' '));manual+=L.countIn(b,L.N('الغيبة'))});
assert.equal(p.total,manual);assert.ok(p.total>0);
assert.equal(Object.values(p.byEra).reduce((s,v)=>s+v,0),p.total);
assert.equal(Object.values(p.byGrade).reduce((s,v)=>s+v,0),p.items);
// النطاق
const q=L.analyze({terms:['الغيبة'],scope:'q'}).per[0];assert.ok(q.total<=p.total);assert.ok(q.hits.every(h=>h.u.era==='q'));
// المقتطف يحمل الكلمة بنصها الأصلي
const h=p.hits[0];const sn=L.snippet(h.u.raw,p.n);assert.ok(sn&&L.N(sn.hit)===p.n,JSON.stringify(sn));
// فهم السؤال
const t=(q,terms,view,scope)=>{const r=L.parse(q);assert.deepEqual(r.terms,terms,q+' → '+JSON.stringify(r));if(view)assert.equal(r.view,view,q+' view '+r.view);if(scope)assert.equal(r.scope,scope,q)};
t('قارن ذكر السفياني بين الكتب القديمة والمعاصرة',['السفياني'],'era');
t('ما مدى ثبوت طول العمر في الكتب؟',['طول العمر'],'grade');
t('خريطة ذهنية للغيبة',['الغيبة'],'mind');
t('قارن: الغيبة، الانتظار، الفرج',['الغيبة','الانتظار','الفرج'],'compare');
t('الغيبة والانتظار',['الغيبة','الانتظار'],'compare');
t('كم مرة ذُكر «الصيحة» في كل كتاب',['الصيحة'],'book');
t('ذكر الدجال في الكتب القديمة فقط',['الدجال'],null,'q');
t('تطور ذكر الرجعة عبر القرون',['الرجعة'],'cent');
t('',[],'overview');
const ps=q=>L.parse(q);assert.equal(ps('ذكر الرجعة في الكتب الأربعة').src,'four');assert.deepEqual(ps('ذكر الرجعة في الكتب الأربعة').terms,['الرجعة']);
assert.equal(ps('قارن ذكر القائم في كتاب البحار وحده').src,'bihar');assert.deepEqual(ps('قارن ذكر القائم في كتاب البحار وحده').terms,['القائم']);
assert.equal(ps('الغيبة في كتب الغيبة').src,'ghayba');assert.deepEqual(ps('الغيبة في كتب الغيبة').terms,['الغيبة']);
assert.equal(ps('ذكر الحجة في الكافي').src,'kafi');assert.deepEqual(ps('ذكر الحجة في الكافي').terms,['الحجة']);
// المتون الكاملة: وحدات مصطنعة بنظام درجات المجلسي
const fake=[{id:'c1',title:'ح١',raw:'عن ابي عبد الله قال القائم منا',body:L.N('عن ابي عبد الله قال القائم منا'),book:'الكافي',bk:'kafi',death:329,era:'q',cent:4,grade:'Msahih',beh:true,door:null,section:'ج١',corpus:true},
 {id:'c2',title:'ح٢',raw:'القائم القائم',body:L.N('القائم القائم'),book:'الكافي',bk:'kafi',death:329,era:'q',cent:4,grade:'Mdaif',beh:false,door:null,section:'ج٢',corpus:true}];
const fa=L.analyze({terms:['القائم'],units:fake,withApp:false});assert.equal(fa.per[0].total,3);assert.equal(fa.pool,2);
assert.deepEqual(fa.gs.keys,['Msahih','Mdaif']);assert.equal(fa.gs.short('Mdaif'),'ضعيف');assert.equal(fa.per[0].byBeh['الكافي›1'],1);
const fb=L.analyze({terms:['القائم'],units:fake,withApp:true});assert.ok(fb.pool===2+ctx.CONTENT.length);
// تصحيح المصطلح: «للغيبة» → «الغيبة» غير موجود حرفيًا؟ يُقبل كما هو أو مصححًا
const r=L.refine(['للغيبه','كلمةغيرموجودةابدا']);assert.ok(r[0].ok);assert.equal(r[1].ok,false);
console.log('lab ok',o.units,'نصًا',o.sources,'مصدرًا · الغيبة',p.total,'ذكرًا في',p.items,'نصًا · العصور',JSON.stringify(p.byEra),'· غير محدد',o.uEra.u||0);
