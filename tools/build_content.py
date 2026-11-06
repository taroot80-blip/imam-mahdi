#!/usr/bin/env python3
# يدمج research/*.json في data/content.js، ويرفض ما ينقصه المصدر أو الرابط
import json,glob,re,sys
GR={'tawqi','riwaya','thiqa','kutub','dua','bahth','istinas'}
DOORS={'sifat','liqaat','aqwal','bahth','ghayba','tajil','alamat','tawasul','zuhur'}
out=[];rej=[];seen=set()
for f in sorted(glob.glob('research/[a-z].json')+glob.glob('research/e-*.json')):
    for it in json.load(open(f,encoding='utf8')):
        why=[]
        if it.get('door') not in DOORS: why.append('door')
        if it.get('grade') not in GR: why.append('grade')
        if not (it.get('text') or it.get('summary')): why.append('empty')
        if not it.get('url','').startswith('http'): why.append('url')
        if not (it.get('source') or {}).get('book'): why.append('book')
        if it.get('id') in seen: why.append('dup')
        if why: rej.append((f,it.get('id'),why)); continue
        seen.add(it['id']); out.append(it)
for f in glob.glob('research/over-*.json'):
    ov=json.load(open(f,encoding='utf8'))
    for it in out:
        o=ov.get(it['id'])
        if o:
            it['text']=o['text']; it['source']['page']=o.get('page',it['source'].get('page'))
            for k in ('url','title'):
                if o.get(k): it[k]=o[k]
            if o.get('book'): it['source']['book']=o['book'];it['source']['author']=o.get('author','');it['source']['vol']=o.get('vol','')
            if o.get('gradeNote') is not None: it['gradeNote']=o['gradeNote']
import sys;sys.path.insert(0,'tools');import fixes;out=fixes.apply(out)
open('data/content.js','w',encoding='utf8').write("'use strict';\nconst CONTENT="+json.dumps(out,ensure_ascii=False,indent=0)+";\n")
from collections import Counter
print(len(out),Counter(i['door'] for i in out)); print('rejected',rej)
