#!/usr/bin/env python3
# ملف HTML واحد مستقل. الاستعمال: build_single.py [ساعات الصلاحية]
import re,base64,sys,time,mimetypes,pathlib
H=float(sys.argv[1]) if len(sys.argv)>1 else 24
exp=int((time.time()+H*3600)*1000)
b64=lambda p:base64.b64encode(open(p,'rb').read()).decode()
MIME={'.webp':'image/webp','.png':'image/png','.woff2':'font/woff2','.ogg':'audio/ogg','.m4a':'audio/mp4'}
uri=lambda p:f"data:{MIME[pathlib.Path(p).suffix]};base64,{b64(p)}"
s=open('index.html',encoding='utf8').read()
fonts=open('fonts/fonts.css',encoding='utf8').read()
fonts=re.sub(r'url\(([^)]+\.woff2)\)',lambda m:f"url({uri('fonts/'+m.group(1))})",fonts)
css=open('css/app.css',encoding='utf8').read()
css=re.sub(r'url\(\.\./assets/([\w.-]+)\)',lambda m:f"url({uri('assets/'+m.group(1))})",css)
s=s.replace('<link rel="manifest" href="manifest.webmanifest">\n','')
s=s.replace('<link rel="apple-touch-icon" href="icon-192.png">\n','')
s=s.replace('<link rel="icon" href="icon-192.png">',f'<link rel="icon" href="{uri("icon-192.png")}">')
s=s.replace('<link rel="stylesheet" href="fonts/fonts.css">',f'<style>{fonts}</style>')
s=s.replace('<link rel="stylesheet" href="css/app.css">',f'<style>{css}</style>')
gate=f"""<script>(function(){{var E={exp};if(Date.now()>E){{window.stop();document.documentElement.innerHTML='<head><meta charset=utf-8><title>المستور</title></head><body dir=rtl style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0805;color:#f5ead6;font:20px system-ui;text-align:center;padding:24px"><div><h1 style="color:#F2B632">المستور</h1><p>انتهت مدة هذه النسخة التجريبية.</p></div></body>'}}}})();</script>"""
s=s.replace('<title>',gate+'<title>',1)
s=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+open(m.group(1),encoding='utf8').read().replace('</script','<\\/script')+'</script>',s)
s=re.sub(r'src="assets/([\w.-]+\.(?:webp|png))"',lambda m:f'src="{uri("assets/"+m.group(1))}"',s)
s=s.replace('src="assets/splash.ogg"',f'src="{uri("assets/splash.ogg")}"').replace('src="assets/splash.m4a"',f'src="{uri("assets/splash.m4a")}"')
s=s.replace("href=\"#\"","href=\"#\"")
out='/tmp/mastoor/المستور-نسخة-24-ساعة.html'
pathlib.Path('/tmp/mastoor').mkdir(exist_ok=True)
open(out,'w',encoding='utf8').write(s)
print(out,round(len(s)/1e6,2),'MB; expires',time.strftime('%Y-%m-%d %H:%M',time.gmtime(exp/1000+3*3600)))
