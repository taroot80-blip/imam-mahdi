// اختبار مادة روضة الانتظار: كل مرجع موجود، والعبارات المشروحة مأخوذة بحروفها من نصوصها، والأسئلة سليمة
const fs=require('fs'),assert=require('assert'),vm=require('vm');const ctx={};vm.createContext(ctx);
for(const f of ['data/content.js','data/kids.js'])vm.runInContext(fs.readFileSync(f,'utf8').replace(/^const (\w+)=/mg,'var $1='),ctx);
const C=ctx.CONTENT,K=ctx.KIDS,ids=new Set(C.map(c=>c.id)),byId=id=>C.find(c=>c.id===id);
const refs=[...K.quiz.map(q=>q.src),...K.pairs.map(p=>p[2]),...K.orders.map(o=>o.src),...K.sayings.map(s=>s.src),...K.bayan.flatMap(b=>[b.src,b.more].filter(Boolean)),...K.hisn.map(h=>h.id),...Object.values(K.stories).flat().flatMap(s=>[s.src,s.also].filter(Boolean))];
refs.forEach(r=>assert.ok(ids.has(r),'مرجع مفقود: '+r));
K.quiz.forEach(q=>{assert.ok(q.c>=0&&q.c<q.a.length,q.q);assert.ok(q.lv[0]<=q.lv[1]);assert.equal(new Set(q.a).size,q.a.length,'خيارات مكررة: '+q.q)});
for(let age=3;age<=12;age++)assert.ok(K.quiz.filter(q=>age>=q.lv[0]&&age<=q.lv[1]).length>=4,'أسئلة قليلة لعمر '+age);
K.sayings.forEach(s=>{const t=byId(s.src).text;s.parts.forEach(p=>assert.ok(t.includes(p[0]),`«${p[0]}» ليست في نص ${s.src}`))});
const stories=Object.values(K.stories).flat();stories.forEach(s=>assert.ok(s.scenes.length>=3&&s.scenes.every(c=>c.tx&&c.props),s.id));
assert.equal(new Set(stories.map(s=>s.id)).size,stories.length);
console.log('kids ok',K.quiz.length,'سؤالًا',K.pairs.length,'زوجًا',stories.length,'حكاية',K.sayings.length,'قولًا',K.color.length,'رسمًا');
