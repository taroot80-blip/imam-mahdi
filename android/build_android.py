#!/usr/bin/env python3
"""بناء «المستور» (AAB للمتجر + APK للتجربة) دون Android SDK كامل.
TOOLS: فيه bundletool.jar وandroid.jar وaapt/package/bin/x64/linux/aapt2 وdex2jar/*/d2j-jar2dex.sh
KEYS: مفتاح الرفع، يُنشأ أول مرة ولا يُرفع إلى المستودع أبدًا.
الاستعمال: TOOLS=... KEYS=... OUT=... VERSION_CODE=1 VERSION_NAME=1.0.0 python3 android/build_android.py
"""
import os, pathlib, secrets, shutil, subprocess, sys, zipfile
from PIL import Image
HERE=pathlib.Path(__file__).resolve().parent; REPO=HERE.parent
T=pathlib.Path(os.environ['TOOLS']); KEYS=pathlib.Path(os.environ['KEYS']); KEYS.mkdir(parents=True,exist_ok=True)
OUT=pathlib.Path(os.environ['OUT']); OUT.mkdir(parents=True,exist_ok=True); B=OUT/'build'
AAPT2=str(T/'aapt/package/bin/x64/linux/aapt2'); JAR=str(T/'android.jar'); BT=['java','-jar',str(T/'bundletool.jar')]
J2D=str(next((T/'dex2jar').glob('*/d2j-jar2dex.sh')))
PKG='com.almaateeq.mastoor'; VC=int(os.environ.get('VERSION_CODE',1)); VN=os.environ.get('VERSION_NAME','1.0.0')
MIN_SDK,TARGET_SDK=24,36; NAME='المستور'
WEB=['index.html','privacy.html','manifest.webmanifest','icon-192.png','icon-512.png','js','data','assets','fonts','css']
def run(c,**k):
    r=subprocess.run([str(x) for x in c],capture_output=True,text=True,**k)
    if r.returncode: print('FAILED',' '.join(map(str,c)),r.stdout[-3000:],r.stderr[-3000:]); sys.exit(1)
    return r.stdout
if B.exists(): shutil.rmtree(B)
for p in ['res/values','res/drawable-nodpi','res/mipmap-anydpi-v26','res/mipmap-xxxhdpi','classes','module/manifest','module/dex','module/assets/www']: (B/p).mkdir(parents=True)
ic=Image.open(REPO/'icon-512.png').convert('RGBA')
ic.resize((192,192)).save(B/'res/mipmap-xxxhdpi/ic_launcher.png')
fg=Image.new('RGBA',(432,432),(0,0,0,0)); sm=ic.resize((280,280)); fg.paste(sm,(76,76)); fg.save(B/'res/drawable-nodpi/ic_fg.png')
(B/'res/mipmap-anydpi-v26/ic_launcher.xml').write_text('<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/ic_bg"/><foreground android:drawable="@drawable/ic_fg"/></adaptive-icon>\n')
(B/'res/values/strings.xml').write_text(f'<?xml version="1.0" encoding="utf-8"?>\n<resources><string name="app_name">{NAME}</string><color name="ic_bg">#0B0805</color></resources>\n',encoding='utf-8')
(B/'res/values/styles.xml').write_text('<?xml version="1.0" encoding="utf-8"?>\n<resources><style name="AppTheme" parent="android:Theme.Material.NoActionBar"><item name="android:windowBackground">#0B0805</item><item name="android:colorAccent">#F2B632</item><item name="android:statusBarColor">#0B0805</item><item name="android:navigationBarColor">#0B0805</item></style></resources>\n')
m=B/'AndroidManifest.xml'
m.write_text(f'''<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="{PKG}">
  <uses-permission android:name="android.permission.INTERNET"/>
  <queries><intent><action android:name="android.intent.action.VIEW"/><data android:scheme="https"/></intent>
    <intent><action android:name="android.speech.action.RECOGNIZE_SPEECH"/></intent>
    <intent><action android:name="android.intent.action.TTS_SERVICE"/></intent></queries>
  <application android:enableOnBackInvokedCallback="true" android:label="@string/app_name" android:icon="@mipmap/ic_launcher" android:roundIcon="@mipmap/ic_launcher"
      android:theme="@style/AppTheme" android:allowBackup="false" android:supportsRtl="true" android:hardwareAccelerated="true" android:usesCleartextTraffic="false">
    <activity android:name=".MainActivity" android:exported="true" android:launchMode="singleTask"
        android:configChanges="orientation|screenSize|screenLayout|keyboardHidden|smallestScreenSize|uiMode|density">
      <intent-filter><action android:name="android.intent.action.MAIN"/><category android:name="android.intent.category.LAUNCHER"/></intent-filter>
    </activity>
  </application>
</manifest>
''',encoding='utf-8')
run([AAPT2,'compile','--dir',B/'res','-o',B/'compiled.zip'])
run([AAPT2,'link','--proto-format','-o',B/'linked.zip','-I',JAR,'--manifest',m,'--min-sdk-version',MIN_SDK,'--target-sdk-version',TARGET_SDK,'--version-code',VC,'--version-name',VN,'--auto-add-overlay',B/'compiled.zip'])
srcs=[str(p) for p in (HERE/'src').rglob('*.java')]
run(['javac','-nowarn','-source','8','-target','8','-bootclasspath',JAR,'-encoding','UTF-8','-d',B/'classes']+srcs)
run(['jar','cf',B/'classes.jar','-C',B/'classes','.'])
run(['bash',J2D,'-f','-o',B/'module/dex/classes.dex',B/'classes.jar'])
www=B/'module/assets/www'
for n in WEB:
    s=REPO/n
    if s.is_dir(): shutil.copytree(s,www/n)
    else: shutil.copy(s,www/n)
with zipfile.ZipFile(B/'linked.zip') as z:
    for n in z.namelist():
        d=B/'module'/('manifest/AndroidManifest.xml' if n=='AndroidManifest.xml' else n); d.parent.mkdir(parents=True,exist_ok=True); d.write_bytes(z.read(n))
with zipfile.ZipFile(B/'base.zip','w',zipfile.ZIP_DEFLATED) as z:
    for f in sorted((B/'module').rglob('*')):
        if f.is_file(): z.write(f,f.relative_to(B/'module'))
aab=OUT/f'المستور-{VN}.aab'
if aab.exists(): aab.unlink()
run(BT+['build-bundle',f'--modules={B/"base.zip"}',f'--output={aab}'])
ks,pf=KEYS/'mastoor-upload.jks',KEYS/'mastoor-upload-password.txt'
if not ks.exists():
    pw=secrets.token_urlsafe(18)
    run(['keytool','-genkeypair','-keystore',ks,'-storetype','JKS','-alias','upload','-keyalg','RSA','-keysize','4096','-validity','10000','-storepass',pw,'-keypass',pw,'-dname','CN=Al-Mastoor, O=Mohammad Ali Almaateeq, C=KW'])
    pf.write_text(pw)
pw=pf.read_text().strip()
run(['jarsigner','-keystore',ks,'-storepass',pw,'-keypass',pw,'-sigalg','SHA256withRSA','-digestalg','SHA-256',aab,'upload'])
run(BT+['validate',f'--bundle={aab}'])
apks=B/'app.apks'
run(BT+['build-apks',f'--bundle={aab}',f'--output={apks}','--mode=universal',f'--ks={ks}','--ks-key-alias=upload',f'--ks-pass=pass:{pw}',f'--key-pass=pass:{pw}'])
with zipfile.ZipFile(apks) as z: (OUT/f'المستور-{VN}-للتجربة.apk').write_bytes(z.read('universal.apk'))
print('done',aab.stat().st_size)
