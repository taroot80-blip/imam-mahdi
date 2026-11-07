#!/usr/bin/env python3
"""يبني فهرس المكتبة الكبيرة لقسم «البحوث والمقارنات»:
  - بحار الأنوار (110 مجلدات) من مستودع huacheakedanc/bihar-al-anwar-md (طبعة دار إحياء التراث، بيروت)
  - الاستبصار، وتهذيب الأحكام كاملًا، ومكتبة الإمام المهدي، وكتب الرجال من OpenITI/RAW_Ghbook (مكتبة القائمية ghbook.ir)
الاستعمال:
  python3 tools/build_library.py <مجلد ملفات البحار .md> <مجلد ملفات القائمية <id>.md>
يكتب corpus/*.json (تُحمَّل من الشبكة عند الطلب) ويضيف الكتب إلى data/corpus.js.
كل وحدة: [الجزء، الصفحة، رقم العنوان في s، النص مطبَّعًا بلا تشكيل، مصدر النقل في البحار إن وُجد]"""
import json, re, sys, pathlib
BIHAR, GHB = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
REPO = pathlib.Path(__file__).resolve().parent.parent
OUT = REPO / 'corpus'; OUT.mkdir(exist_ok=True)
sys.path.insert(0, str(REPO / 'tools'))

DIAC = re.compile('[ً-ْٰـٕٔٓ]')
PERS = str.maketrans({'ی': 'ي', 'ي': 'ي', 'ک': 'ك', 'ۀ': 'ه', 'ە': 'ه', 'ٔ': '', 'ٕ': '', '‌': ' ', '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
                      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'})
def N(s):
    """مطابق لدالتي norm وN في التطبيق، بعد توحيد الحروف الفارسية."""
    s = DIAC.sub('', (s or '').translate(PERS))
    for a, b in (('أ', 'ا'), ('إ', 'ا'), ('آ', 'ا'), ('ٱ', 'ا'), ('ى', 'ي'), ('ؤ', 'و'), ('ئ', 'ي'), ('ة', 'ه')): s = s.replace(a, b)
    s = re.sub(r'[^ء-ي0-9a-z\s]', ' ', s.lower())
    return re.sub(r'\s+', ' ', s).strip()
def clean_title(s):
    s = DIAC.sub('', (s or '').translate(PERS)).replace('اللّٰه', 'الله')
    return re.sub(r'\s+', ' ', re.sub(r'\(\d+\)', '', s)).strip()[:90]

manifest_add = []
def write(key, body, meta):
    txt = json.dumps(body, ensure_ascii=False, separators=(',', ':'))
    (OUT / f'{key}.json').write_text(txt, encoding='utf-8')
    return len(txt.encode())

# ---------- بحار الأنوار ----------
def bihar():
    files = sorted(BIHAR.glob('*-beharolanvar-j*.md'), key=lambda p: int(re.search(r'j(\d+)', p.name)[1]))
    parts, total, kb = [], 0, 0
    for f in files:
        vol = int(re.search(r'j(\d+)', f.name)[1])
        page, heads, rows, cur, src = 0, [''], [], [], ''
        def flush():
            nonlocal cur, src
            t = N(' '.join(cur))
            if len(t) > 20: rows.append([vol, page, len(heads) - 1, t] + ([src] if src else []))
            cur, src = [], ''
        started = False
        for line in f.read_text(encoding='utf-8', errors='ignore').splitlines():
            s = line.strip()
            if not s: continue
            m = re.match(r'^ص:\s*([0-9۰-۹]+)', s)
            if m: page = int(m[1].translate(PERS)); started = True; continue
            if not started: continue
            if re.match(r'^(باب|أبواب|ابواب|كتاب|تتمة)\s', s) and len(s) < 220:
                flush(); heads.append(clean_title(s)); continue
            h = re.match(r'^«\s*([0-9۰-۹]+)\s*»\s*-?\s*(.*)', s)
            if h:
                flush(); rest = h[2]
                sm = re.match(r'^([^\s،]{1,6})\s*،\s*\[([^\]]{2,40})\]', rest)
                src = clean_title(sm[2]) if sm else ''
                sym = N(sm[1]) if sm else ''
                if src in ('الغيبة', 'الغیبة'): src = {'غط': 'الغيبة للطوسي', 'ني': 'الغيبة للنعماني'}.get(sym, src)
                if src in ('الأمالي', 'الامالي'): src = {'لي': 'الأمالي للصدوق', 'ما': 'الأمالي للطوسي', 'جا': 'الأمالي للمفيد'}.get(sym, src)
                cur = [rest]; continue
            if re.match(r'^-{3,}|^\(\d+\)\s', s) and not cur: continue
            cur.append(s)
            if sum(len(x) for x in cur) > 2400: flush()
        flush()
        key = f'bihar-{vol:03d}'
        size = write(key, {'k': key, 's': heads, 'h': rows}, None)
        parts.append(key); total += len(rows); kb += size / 1024
    print('bihar', len(parts), 'vols', total, 'units', round(kb / 1024, 1), 'MB')
    return {'k': 'bihar', 't': 'بحار الأنوار', 'a': 'العلامة المجلسي', 'd': 1111, 'g': 'bihar', 'n': total, 'v': len(parts), 'of': 110, 'kb': round(kb), 'f': parts, 'src': 'bihar-md'}

# ---------- مكتبة القائمية ----------
ORD = {'الاول': 1, 'الأول': 1, 'الثاني': 2, 'الثالث': 3, 'الرابع': 4, 'الخامس': 5, 'السادس': 6, 'السابع': 7, 'الثامن': 8, 'التاسع': 9, 'العاشر': 10}
def ghbook(gid, chunk=900, hadith=True):
    t = (GHB / f'{gid}.md').read_text(encoding='utf-8', errors='ignore')
    body = t.split('#META#Header#End#', 1)[-1]
    vol, page, heads, rows, cur = 1, 0, [''], [], []
    def flush():
        nonlocal cur
        x = N(' '.join(cur))
        if len(x) > 20: rows.append([vol, page, len(heads) - 1, x])
        cur = []
    for line in body.splitlines():
        s = line.strip()
        if not s or s.startswith('![') or '](' in s and s.startswith('#') and 'png' in s: continue
        s = re.sub(r'-?روا[يی]ت-[\d\s-]*', ' ', s)
        pv = re.search(r'PageV(\d+)P(\d+)', s)
        if pv:
            vol, page = int(pv[1]), int(pv[2]); s = re.sub(r'PageV\d+P\d+', ' ', s).strip()
            if not s: continue
        ph = re.search(r'،\s*ج\s*(\d+)\s*،\s*ص:\s*(\d+)\s*$', s)
        if ph and len(s) < 160:
            vol, page = int(ph[1]), int(ph[2]); continue
        pm = re.search(r'\[\s*صفحه\s*(\d+)\s*\]', s)
        if pm:
            page = int(pm[1]); s = re.sub(r'\[\s*صفحه\s*\d+\s*\]', ' ', s).strip()
            if not s: continue
        hm = re.match(r'^#{2,}\s*\|+\s*(.*)', s)
        if hm:
            flush(); title = clean_title(hm[1])
            vm = re.search(r'(?:المجلد|الجزء|جلد)\s*(\d+|' + '|'.join(ORD) + ')', title)
            if vm: vol = int(vm[1]) if vm[1].isdigit() else ORD.get(vm[1], vol)
            heads.append(title); continue
        s = re.sub(r'^#\s*', '', s); cont = s.startswith('~~'); s = s.lstrip('~').strip()
        if re.match(r'^\[\d+\]', s) and not cont: continue  # الحواشي
        if hadith and not cont and re.match(r'^\d+\s*[-ـ]?\s*\D', s) and cur: flush()
        cur.append(s)
        if not cont and sum(len(x) for x in cur) > chunk and not hadith: flush()
        if sum(len(x) for x in cur) > 3000: flush()
    flush()
    return heads, rows

def ghb_book(gid, key, t, a, d, g, hadith=False, split_mb=3.0):
    heads, rows = ghbook(gid, hadith=hadith)
    # الكتب الكبيرة تُقسَّم ملفات حتى لا يثقل تحميلها
    parts, size, cur, files = [], 0, [], []
    lim = split_mb * 1048576
    for r in rows:
        cur.append(r); size += len(r[3].encode()) + 16
        if size > lim: parts.append(cur); cur, size = [], 0
    if cur or not parts: parts.append(cur)
    kb = 0
    for i, p in enumerate(parts):
        fk = key if len(parts) == 1 else f'{key}-{i + 1}'
        kb += write(fk, {'k': fk, 's': heads, 'h': p}, None) / 1024; files.append(fk)
    e = {'k': key, 't': t, 'a': a, 'd': d, 'g': g, 'n': len(rows), 'v': 1, 'of': 1, 'kb': round(kb), 'src': 'ghbook', 'id': gid}
    if len(files) > 1: e['f'] = files
    return e

if __name__ == '__main__':
    from library_books import MAHDI, RIJAL, FOUR
    entries = []
    if BIHAR.exists() and any(BIHAR.glob('*.md')): entries.append(bihar())
    for gid, key, t, a, d in FOUR: entries.append(ghb_book(gid, key, t, a, d, 'four', hadith=True)); print(key, entries[-1]['n'])
    for gid, t, a, d in RIJAL: entries.append(ghb_book(gid, 'r-' + gid, t, a, d, 'rijal')); print('rijal', t, entries[-1]['n'])
    for gid, t, a, d in MAHDI:
        if (GHB / f'{gid}.md').exists() and (GHB / f'{gid}.md').stat().st_size > 3000:
            entries.append(ghb_book(gid, 'm-' + gid, t, a, d, 'mahdawi'))
    print('mahdawi', sum(1 for e in entries if e['g'] == 'mahdawi'), 'books')
    # دمج مع فهرس ثقلين
    js = (REPO / 'data' / 'corpus.js').read_text(encoding='utf-8')
    cur = json.loads(re.search(r'const CORPUS=(\[.*\]);', js, re.S)[1])
    keep = [c for c in cur if c.get('src') not in ('bihar-md', 'ghbook') and c['k'] not in [e['k'] for e in entries]]
    # التهذيب الكامل من القائمية يحل محل الأجزاء الأربعة من ثقلين
    if any(e['k'] == 'tahdhib-full' for e in entries): keep = [c for c in keep if c['k'] != 'tahdhib']
    allc = keep + entries
    (REPO / 'data' / 'corpus.js').write_text(
        "// فهرس المتون الكاملة المحمَّلة من الشبكة عند الطلب. يُولَّد بأداتي tools/build_corpus.py (ثقلين thaqalayn.net) وtools/build_library.py (بحار الأنوار، ومكتبة القائمية ghbook.ir)\n'use strict';\nconst CORPUS=" +
        json.dumps(allc, ensure_ascii=False, separators=(',', ':')) + ";\n", encoding='utf-8')
    print('total books', len(allc), 'MB', round(sum(c['kb'] for c in allc) / 1024, 1))
