#!/usr/bin/env python3
"""يبني فهرس المتون الكاملة لقسم «البحوث والمقارنات» من بيانات ثقلين (thaqalayn.net).
المصدر: مستودع ThaqalaynAPI (مجلد V2/ThaqalaynData). الاستعمال:
  python3 tools/build_corpus.py <مسار ThaqalaynData>
يكتب corpus/<المعرف>.json (يُحمَّل من الشبكة عند الطلب، ولا يدخل في نسخة أندرويد) و data/corpus.js (فهرس صغير مدمج).
كل حديث: [رقم الجزء، مسار الرابط في ثقلين، المتن مطبَّعًا بلا تشكيل، تقييم المجلسي، تقييم البهبودي، تقييم المحسني]"""
import json, re, sys, pathlib
SRC = pathlib.Path(sys.argv[1]); REPO = pathlib.Path(__file__).resolve().parent.parent
OUT = REPO / 'corpus'; OUT.mkdir(exist_ok=True)
# المعرف، العنوان، المؤلف، سنة الوفاة، المجموعة، ملفات ثقلين، عدد أجزاء الكتاب الكامل
BOOKS = [
 ('kafi','الكافي','الشيخ الكليني',329,'four',[1,2,3,4,5,6,7,8],8),
 ('faqih','من لا يحضره الفقيه','الشيخ الصدوق',381,'four',[34,35,36,37,38],5),
 ('tahdhib','تهذيب الأحكام','الشيخ الطوسي',460,'four',[41,42,43,44],10),
 ('kamal','كمال الدين وتمام النعمة','الشيخ الصدوق',381,'ghayba',[39],1),
 ('ghayba-numani','الغيبة للنعماني','النعماني',360,'ghayba',[22],1),
 ('ghayba-tusi','الغيبة للطوسي','الشيخ الطوسي',460,'ghayba',[27],1),
 ('imama','الإمامة والتبصرة من الحيرة','علي بن بابويه القمي',329,'ghayba',[45],1),
 ('uyun','عيون أخبار الرضا','الشيخ الصدوق',381,'other',[11,12],2),
 ('amali-saduq','الأمالي للصدوق','الشيخ الصدوق',381,'other',[29],1),
 ('amali-mufid','الأمالي للمفيد','الشيخ المفيد',413,'other',[13],1),
 ('khisal','الخصال','الشيخ الصدوق',381,'other',[10],1),
 ('tawhid','التوحيد','الشيخ الصدوق',381,'other',[14],1),
 ('maani','معاني الأخبار','الشيخ الصدوق',381,'other',[28],1),
 ('thawab','ثواب الأعمال وعقاب الأعمال','الشيخ الصدوق',381,'other',[23],1),
 ('kamil','كامل الزيارات','ابن قولويه',367,'other',[24],1),
 ('fadail-shia','فضائل الشيعة','الشيخ الصدوق',381,'other',[25],1),
 ('sifat-shia','صفات الشيعة','الشيخ الصدوق',381,'other',[26],1),
 ('fadail-ashhur','فضائل الأشهر الثلاثة','الشيخ الصدوق',381,'other',[40],1),
 ('mumin','كتاب المؤمن','الحسين بن سعيد الأهوازي',250,'other',[30],1),
 ('zuhd','كتاب الزهد','الحسين بن سعيد الأهوازي',250,'other',[31],1),
 ('nahj','نهج البلاغة','الشريف الرضي',406,'other',[32],1),
 ('mujam','معجم الأحاديث المعتبرة','الشيخ محمد آصف المحسني',1440,'other',[9],1),
]
# مطابق لدالتي norm في store.js و N في lab.js
DIAC = re.compile('[ً-ْٰـ]')
def N(s):
    s = DIAC.sub('', s or '')
    for a, b in (('أ','ا'),('إ','ا'),('آ','ا'),('ٱ','ا'),('ى','ي'),('ؤ','و'),('ئ','ي'),('ة','ه'),('ک','ك'),('ی','ي')): s = s.replace(a, b)
    s = s.lower()
    s = re.sub(r'[^ء-ي0-9a-z\s]', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()
def G(v):
    v = (v or '').strip()
    return '' if v in ('', 'لم يخرجه') else v
manifest = []
for key, t, a, d, grp, files, vols in BOOKS:
    rows = []
    for f in files:
        for h in json.load(open(SRC / f'{f}.json', encoding='utf-8')):
            txt = N(h.get('arabicText', ''))
            if not txt: continue
            url = (h.get('URL') or '').replace('https://thaqalayn.net/hadith/', '')
            rows.append([h.get('volume') or 1, url, txt, G(h.get('majlisiGrading')), G(h.get('behbudiGrading')), G(h.get('mohseniGrading'))])
    body = json.dumps({'k': key, 'h': rows}, ensure_ascii=False, separators=(',', ':'))
    (OUT / f'{key}.json').write_text(body, encoding='utf-8')
    manifest.append({'k': key, 't': t, 'a': a, 'd': d, 'g': grp, 'n': len(rows), 'v': len(files), 'of': vols, 'kb': round(len(body.encode()) / 1024)})
    print(key, len(rows), round(len(body.encode()) / 1048576, 2), 'MB')
(REPO / 'data' / 'corpus.js').write_text(
    "// فهرس المتون الكاملة المحمَّلة من الشبكة عند الطلب. يُولَّد بأداة tools/build_corpus.py من بيانات ثقلين thaqalayn.net\n'use strict';\nconst CORPUS=" +
    json.dumps(manifest, ensure_ascii=False, separators=(',', ':')) + ";\n", encoding='utf-8')
print('total', round(sum(m['kb'] for m in manifest) / 1024, 1), 'MB')
