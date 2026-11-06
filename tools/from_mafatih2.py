#!/usr/bin/env python3
import re,json,sys
sys.path.insert(0,'tools')
s=open('research/src/mafatih2.txt',encoding='utf8').read()
P={int(m[1]):re.sub(r'_{5,}.*$','',m[2]).strip() for m in re.finditer(r'#(\d+)\n(.*?)(?=\n#\d+\n|\Z)',s,re.S)}
def clean(t):
    t=re.sub(r'\s*\([٠-٩]+\)','',t).replace('عليه‌السلام','عليه السلام').replace('عليهم‌السلام','عليهم السلام').replace('عليها‌السلام','عليها السلام').replace('صلى‌الله‌عليه‌وآله','صلى الله عليه وآله')
    return re.sub(r' +',' ',t).replace(' ،','،').replace(' :',':').strip()
def paras(t,n=80):
    out=[];cur=[]
    for w in t.split():
        cur.append(w)
        if len(cur)>=n and re.search(r'[،.؟!؛]$',w): out.append(' '.join(cur));cur=[]
    if cur: out.append(' '.join(cur))
    return '\n\n'.join(out)
def seg(a,b,st,en):
    x=' '.join(P[p] for p in range(a,b+1));i=x.index(st);j=x.index(en,i);return clean(x[i:j])
U='https://books.rafed.net/view/1731/page/'
E=[dict(id='haj-ali-mafatih',door='liqaat',section='مع العامة',title='الحاج علي البغدادي في طريق الكاظمين',witness='الحاج علي البغدادي',text=paras(seg(586,590,'حكى الحاج',' المطلب الثاني')),summary='',source=dict(book='مفاتيح الجنان',author='الشيخ عباس القمي',vol='',page='586–590'),url=U+'586',alsoIn=['جنة المأوى','النجم الثاقب'],grade='thiqa',gradeNote='أوردها المحدث النوري في جنة المأوى والنجم الثاقب، ونقلها الشيخ القمي.',tags=['الكاظمين']),
 dict(id='rashti-mafatih',door='liqaat',section='مع العامة',title='السيد أحمد الرشتي في طريق طرابزون',witness='السيد أحمد الرشتي',text=paras(seg(657,659,'قدم النجف الأشرف',' الزيارة الثالثة')),summary='',source=dict(book='مفاتيح الجنان',author='الشيخ عباس القمي',vol='',page='657–659'),url=U+'657',alsoIn=['النجم الثاقب'],grade='thiqa',gradeNote='سمعها المحدث النوري من صاحبها، ونقلها الشيخ القمي عن النجم الثاقب.',tags=['الجامعة الكبيرة','زيارة عاشوراء'])]
json.dump(E,open('research/e-mafatih2.json','w',encoding='utf8'),ensure_ascii=False,indent=1)
for e in E: print(e['id'],len(e['text']),e['text'][:60],'...',e['text'][-90:])
