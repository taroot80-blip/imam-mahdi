# يولّد نسيج ورق البردي (ألياف متعامدة) والخلفية الخافتة والأيقونات
import numpy as np
from PIL import Image, ImageFilter
rng=np.random.default_rng(255)
def fibres(S,axis):
    a=rng.normal(0,1,(S,S))
    k=[1,3,9,27]
    out=np.zeros((S,S))
    for w,g in zip(k,[.5,.8,1,.7]):
        n=rng.normal(0,1,(S,S//4 if False else S))
        # تمديد على طول المحور
        L=120
        ker=np.ones(L)/L
        m=np.apply_along_axis(lambda r:np.convolve(np.r_[r,r[:L]],ker,'same')[:S],axis,n)
        im=Image.fromarray(((m-m.min())/(m.max()-m.min())*255).astype('uint8')).filter(ImageFilter.GaussianBlur(w/4))
        out+=g*(np.asarray(im,float)/255-.5)
    return out
def papyrus(S,base,dark,name):
    h=fibres(S,1); v=fibres(S,0)
    # شرائح عريضة كالبردي
    strips=np.zeros(S); p=0
    while p<S:
        w=rng.integers(38,90); strips[p:p+w]=rng.normal(0,.05); p+=w
    mix=h*.75+v*.45+strips[:,None]+strips[None,:]*.6
    # بقع مرنة دورية
    low=Image.fromarray(rng.integers(0,255,(S//32,S//32),dtype='uint8')).resize((S,S),Image.BICUBIC).filter(ImageFilter.GaussianBlur(14))
    mix+= (np.asarray(low,float)/255-.5)*.8
    mix=(mix-mix.mean())/mix.std()
    t=np.clip(mix*.17+.5,0,1)[...,None]
    img=np.array(dark)*(1-t)+np.array(base)*t
    Image.fromarray(img.astype('uint8')).save(name,quality=70,method=6)
papyrus(640,(226,201,150),(170,134,82),'assets/papyrus.webp')
papyrus(640,(36,62,48),(14,30,22),'assets/papyrus-green.webp')
im=Image.open('assets/splash.webp').convert('RGB').resize((884,1632))
bg=im.filter(ImageFilter.GaussianBlur(4)).resize((720,1330))
a=np.asarray(bg,float)*np.array([1.0,.86,.66])*.55   # تدفئة وتعتيم
Image.fromarray(a.astype('uint8')).save('assets/bg.webp',quality=55,method=6)
