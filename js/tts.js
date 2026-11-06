// القارئ الآلي: رجل أو امرأة. يعتمد على أصوات الجهاز، وعند نقص أحدهما يقرّبه بتغيير طبقة الصوت
'use strict';
const TTS=(()=>{
  const N=window.NativeApp;
  if(N){let cb=null;window.__ttsDone=()=>{const f=cb;cb=null;f&&f()};
    return{info(){return{ok:N.ttsInfo()==='1'||true,m:true,f:true,count:1}},speak(t,g,done){cb=done;N.speak(String(t),g,store.get('ttsRate',.92));return true},cancel(){cb=null;N.stopSpeak()},pause(){},resume(){}}}
  const S=window.speechSynthesis;let voices=[],stop=true,onEnd=null;
  const MALE=/naayf|hamed|maged|majed|tarek|fahed|shakir|rami|moaz|omar|ali|salim|bassel|taim|male/i;
  const FEMALE=/hoda|salma|zariyah|laila|layla|mouna|amina|fatima|sana|iman|mona|rana|noura|female|google/i;
  function load(){if(!S)return;voices=S.getVoices().filter(v=>/^ar/i.test(v.lang))}
  if(S){load();S.onvoiceschanged=load}
  const pick=g=>{const re=g==='m'?MALE:FEMALE;return voices.find(v=>re.test(v.name)&&!(g==='m'&&/female/i.test(v.name)))||null};
  function info(){load();return{ok:!!S&&voices.length>0,m:!!pick('m'),f:!!pick('f'),count:voices.length}}
  function speak(text,g,done){if(!S)return false;load();cancel();stop=false;onEnd=done;
    const parts=String(text).replace(/\s+/g,' ').match(/[^.؟!؛:]+[.؟!؛:]*/g)||[text];let i=0;
    const v=pick(g)||voices[0]||null,exact=!!pick(g);
    const next=()=>{if(stop)return;if(i>=parts.length){const f=onEnd;onEnd=null;f&&f();return}
      const u=new SpeechSynthesisUtterance(parts[i++].trim());u.lang=v?v.lang:'ar';if(v)u.voice=v;u.rate=store.get('ttsRate',.92);
      u.pitch=exact?1:(g==='m'?.72:1.28);u.onend=next;u.onerror=next;S.speak(u)};
    next();return true}
  function cancel(){stop=true;onEnd=null;if(S)S.cancel()}
  return{info,speak,cancel,pause(){S&&S.pause()},resume(){S&&S.resume()}};
})();
