#!/usr/bin/env python3
# يوسّع المقتطفات إلى الحديث الكامل من كمال الدين، ويستبعد الهوامش وأرقام الصفحات
import re,json
raw=open('research/src/kamal.txt',encoding='utf8').read()
parts=re.split(r'@@@(\d+) [^\n]*\n',raw)
chunks={int(parts[i]):parts[i+1] for i in range(1,len(parts),2)}
t=''.join(chunks[k] for k in sorted(chunks))
t=re.sub(r'____________\n.*?(?=\n\( \d+ \)\n|\Z)','',t,flags=re.S)
PG=re.compile(r'\n\( (\d+) \)\n')
marks=[]
def strip_pg(s):
    out=[];pos=0;n=0
    for m in PG.finditer(s):
        out.append(s[pos:m.start()]);n+=m.start()-pos;marks.append((n,int(m[1])));pos=m.end();out.append(' ');n+=1
    out.append(s[pos:]);return ''.join(out)
t=strip_pg(t)
def page_at(i):
    p=None
    for n,g in marks:
        if n<=i:p=g
        else:break
    return p
def nz(x): return re.sub(r'[ً-ْ\s،.:؛,"«»()\[\]0-9ـ؟!\-]','',x).replace('أ','ا').replace('إ','ا').replace('آ','ا').replace('ى','ي').replace('ة','ه')
H=[m.start() for m in re.finditer(r'\n\d+ ـ ',t)]+[len(t)]
def hadith(key):
    k=nz(key)
    for a,b in zip(H,H[1:]):
        if k in nz(t[a:b]): return a,b
    raise SystemExit('لا يوجد: '+key)
def clean(x):
    x=re.sub(r' ?\( \d+ \)','',x);x=re.sub(r'^\s*\d+ ـ ','',x)
    x=re.sub(r' ([،.:؛؟!])',r'\1',x);x=re.sub(r'[ \t]+',' ',x)
    return x.strip()
def paras(x,n=80):
    out=[]
    for line in x.split('\n'):
        line=line.strip()
        if not line: continue
        cur=[]
        for w in line.split():
            cur.append(w)
            if len(cur)>=n and re.search(r'[،.؟!؛:]$',w): out.append(' '.join(cur));cur=[]
        if cur: out.append(' '.join(cur))
    return '\n\n'.join(out)
K={'hasan-wajna-nasibi':'الميزاب','azdi-hasat-dhahab':'','ibrahim-mahziyar-taif':'','bani-rashid-hamadan':''}
A=sum((json.load(open(f'research/{f}.json',encoding='utf8')) for f in 'abcd'),[]);byid={i['id']:i for i in A}
keys={'wiladat-hakima-kamal':byid['wiladat-hakima-kamal']['text'].split('\n\n')[0][:45],'tawqi-samari-akhir':byid['tawqi-samari-akhir']['text'].split('\n\n')[0][:45]}
ov={}
for id,key in keys.items():
    a,b=hadith(key);tx=paras(clean(t[a:b]));p1,p2=page_at(a),page_at(b-1)
    ov[id]=dict(text=tx,page=f'{p1}–{p2}' if p1!=p2 else str(p1))
# القصص: رقم الحديث في كمال الدين
def by_phrase(id,phr):
    a,b=hadith(phr);ov[id]=dict(text=paras(clean(t[a:b])),page=f'{page_at(a)}–{page_at(b-1)}')
import sys
for line in open('tools/kamal_keys.txt',encoding='utf8'):
    if '|' in line:
        i,p=line.strip().split('|',1);by_phrase(i,p)
ov['tawqi-hawadith-waqia'].update(url='https://alkafeel.net/islamiclibrary/hadith/kamal/kamal/26.html',title='توقيع إسحاق بن يعقوب: أما الحوادث الواقعة',book='كمال الدين وتمام النعمة',author='الشيخ الصدوق',gradeNote='النص الكامل من كمال الدين.')
json.dump(ov,open('research/over-kamal.json','w',encoding='utf8'),ensure_ascii=False,indent=1)
for k,v in ov.items(): print(k,v['page'],len(v['text']),'|',v['text'][:70],'...',v['text'][-60:])
