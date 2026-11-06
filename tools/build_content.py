#!/usr/bin/env python3
# يدمج research/*.json في data/content.js، ويرفض ما ينقصه المصدر أو الرابط
import json,glob,re,sys
GR={'tawqi','riwaya','thiqa','kutub','dua','bahth'}
DOORS={'sifat','liqaat','aqwal','bahth','ghayba','tajil','alamat','tawasul','zuhur'}
out=[];rej=[];seen=set()
for f in sorted(glob.glob('research/[a-z].json')+glob.glob('research/*-*.json')):
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
open('data/content.js','w',encoding='utf8').write("'use strict';\nconst CONTENT="+json.dumps(out,ensure_ascii=False,indent=0)+";\n")
from collections import Counter
print(len(out),Counter(i['door'] for i in out)); print('rejected',rej)
