const A=require('../js/age.js'),assert=require('assert');
// الجمعة: JDN%7==4 (0=الاثنين)
assert.equal(A.BIRTH_JDN%7,4,'يوم الولادة جمعة');
// 15 شعبان 255 حسابيًا
const t=A.tabular((A.BIRTH_JDN-2440587.5)*864e5);assert.deepEqual([t.y,t.m,t.d],[255,8,15]);
// قيمة معلومة: 6 نوفمبر 2026 قبل المغرب
const a=A.age(Date.UTC(2026,10,6,12,30));
assert.equal(a.years,1192);assert.equal(a.months,9);assert.ok(a.days>=9&&a.days<=11,'days '+a.days);
assert.ok(a.solarYears>1157.2&&a.solarYears<1157.4);
assert.equal(a.totalHours,Math.floor(a.totalMinutes/60));
// الاستمرار: دقيقة لاحقة تزيد الإجمالي بدقيقة
assert.equal(A.age(Date.UTC(2026,10,6,12,31)).totalMinutes,a.totalMinutes+1);
// حد الفجر: 03:59 ثم 04:00 بتوقيت الكويت يتصفر العداد
assert.equal(A.age(Date.UTC(2026,10,6,1,0)).hours,0);assert.equal(A.age(Date.UTC(2026,10,6,0,59)).hours,23);
console.log('age ok',a.years,a.months,a.days,a.totalDays);
