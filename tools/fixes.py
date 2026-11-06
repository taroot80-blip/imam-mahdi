#!/usr/bin/env python3
# تصويبات ما بعد المراجعة المستقلة (research/review.md)
import re,json
DROP={'asma-muhammad','sayyid-haydar-hilli-araabi','tawqi-samari-mushahada','wiladat-riwayat-sana','ghayba-tawqi-mufid-wafa','tajil-takhir-husayn','tajil-idhaa','bahr-uloum-sahla-saff','tajil-fasad-ishrat','alamat-rayat-khurasan','alamat-ayat-samawiyya','fitan-rayat-sham','adwar-dar-mulk','haj-ali-baghdadi'}
# (id, القديم, الجديد): أخطاء صف ظاهرة فقط
TY=[('bahth-asala','بشخصه: محمد بن الحسن العسكري','بشخصه: ابن الحسن العسكري'),('ibrahim-mahziyar-taif','« م ح م د » ابن الحسن','«...» ابن الحسن'),('ibrahim-mahziyar-taif','بجبين محمد وموسى','بجبين «...» وموسى'),('wiladat-hakima-kamal','لا إلا إله الله','لا إله إلا الله'),('wiladat-hakima-kamal','يا سيدني','يا سيدتي'),
 ('tawqi-hawadith-waqia','وعلى بن اتبع','وعلى من اتبع'),('tawqi-hawadith-waqia','فأنما يأكل','فإنما يأكل'),
 ('hasan-wajna-nasibi','الميزات','الميزاب'),('bani-rashid-hamadan','طلال','ظلال'),('bani-rashid-hamadan','إمض','امض'),
 ('azdi-hasat-dhahab','أرأ حسن','أر أحسن'),('azdi-hasat-dhahab','فقال: لي ثبتت','فقال لي: ثبتت'),('azdi-hasat-dhahab','العمى،،','العمى،'),('azdi-hasat-dhahab','مستر شدا','مسترشدا'),
 ('ibrahim-mahziyar-taif','من ملابراهم الله','من ملأ براهم الله'),
 ('tadarru-ghayba','الاَمِْ','الاَمْرِ'),('bahth-falsafa-ghayba','تخفى والدته','تخفى ولادته'),('tajil-idda-ikhlas','أظهره الله أمره','أظهر الله أمره')]
PATCH={
 'alamat-kusuf-khusuf':dict(grade='bahth',gradeNote='من كلام الشيخ المفيد في الإرشاد، وليس لفظ معصوم.',source=dict(book='الإرشاد',author='الشيخ المفيد',vol='',page='')),
 'ibrahim-mahziyar-taif':dict(summary='',gradeNote='حُجب الاسم الشريف من النص. واستشكل محقق كمال الدين في هامش ص445 في هذه الرواية لتقدم زمان راويها عن عصر الغيبة.'),
 'tawqi-samari-akhir':dict(title='آخر التوقيعات إلى السمري',grade='tawqi',gradeNote='كمال الدين، الحديث 44.',summary=''),
 'tawqi-hawadith-waqia':dict(summary=''),'wiladat-hakima-kamal':dict(title='رواية السيدة حكيمة',summary='',gradeNote='الباب 42، الحديث 1، عن موسى بن محمد بن القاسم عن حكيمة بنت محمد.'),
 'hasan-wajna-nasibi':dict(summary=''),'azdi-hasat-dhahab':dict(summary=''),'bani-rashid-hamadan':dict(summary=''),'ibrahim-mahziyar-taif#':{},
 'zyara-yasin':dict(gradeNote='خرجت من الناحية المقدسة إلى الحميري، كما في المصدر ص627.'),
 'ghayba-mawsim-amri':dict(section='في الغيبة الصغرى'),
 'zuhur-sahla':dict(source=dict(book='الكافي',author='الشيخ الكليني',vol='',page='')),
 'tawqi-tasmiya-ismuhu':dict(source=dict(book='الكافي',author='الشيخ الكليني',vol='1',page='')),
 'dua-nudba':dict(gradeNote='ويستحب أن يُدعى به في الأعياد الأربعة: الفطر والأضحى والغدير ويوم الجمعة. وفي حاشية المصدر عند «وعرجت بروحه»: «وعرجت به» في نسخة.'),
}
INTERNAL=re.compile(r'[^.]*(?:قبل النشر|يلزم |يُراجع|تُراجع|مقتطف قصير|والمتن الكامل في الرابط|لم يُقرأ|لم تُقرأ)[^.]*\.?')
RENAME={'علامات غير حتمية':'علامات أخرى'}
def apply(items):
    out=[]
    for it in items:
        if it['id'] in DROP: continue
        for i,a,b in TY:
            if it['id']==i:
                for f in ('text','summary'):
                    if it.get(f): it[f]=it[f].replace(a,b)
        if it['id'] in PATCH:
            for k,v in PATCH[it['id']].items(): it[k]=v
        it['gradeNote']=INTERNAL.sub('',it.get('gradeNote') or '').strip()
        it['section']=RENAME.get(it['section'],it['section'])
        it['title']=re.sub(r'\s*\(مقتطفات?\)','',it['title'])
        if it['id']=='bahth-wilada': it['summary']=it['summary'].replace('255 و256 و258','255 و256')
        out.append(it)
    return out
