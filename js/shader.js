/* =========================================
   Shader da ilha 3D (corre na placa gráfica, linguagem GLSL)
   Terreno, céu, nuvens, mar e sol gerados por matemática — sem imagens.
   ========================================= */
const FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 R;uniform float T,S;uniform vec3 RO,TA;
vec3 sun;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*vn(p);p=p*2.03+vec2(17.,9.);a*=.5;}return s;}
float rdg(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*(1.-abs(vn(p)*2.-1.));p=p*2.1+vec2(5.,11.);a*=.5;}return s;}
float terrain(vec2 p){float d=length(p*vec2(.42,.75));float m=smoothstep(2.3,1.2,d+.45*fbm(p*.7+3.));return m*(.1+2.1*rdg(p*.5))-.08;}
vec3 nrm(vec3 p,float t){vec2 e=vec2(.004+.002*t,0.);return normalize(vec3(terrain(p.xz-e.xy)-terrain(p.xz+e.xy),2.*e.x,terrain(p.xz-e.yx)-terrain(p.xz+e.yx)));}
vec3 sky(vec3 d){
 vec3 zen=mix(vec3(.12,.2,.45),vec3(.16,.42,.85),smoothstep(0.,.6,sun.y));
 vec3 hor=mix(vec3(1.,.5,.3),vec3(.65,.82,.95),smoothstep(0.,.5,sun.y));
 vec3 c=mix(hor,zen,pow(clamp(d.y,0.,1.),.45));
 float sd=max(dot(d,sun),0.);
 c+=vec3(1.,.7,.4)*pow(sd,8.)*.35+vec3(1.,.9,.7)*pow(sd,700.)*3.;
 if(d.y>0.){vec2 cp=d.xz/(d.y+.15)*.6+vec2(T*.01,0.);float cl=smoothstep(.5,.85,fbm(cp*1.3));
  c=mix(c,mix(hor,vec3(1.),.7)*(.45+.55*smoothstep(0.,.4,sun.y)),cl*.7*smoothstep(0.,.2,d.y));}
 return c;}
vec3 shadeT(vec3 p,float t){
 vec3 n=nrm(p,t);float sl=1.-n.y;
 vec3 gr=mix(vec3(.07,.2,.07),vec3(.2,.38,.12),fbm(p.xz*6.));
 vec3 rk=mix(vec3(.2,.17,.15),vec3(.38,.32,.27),fbm(p.xz*9.+5.));
 vec3 c=mix(gr,rk,smoothstep(.28,.5,sl+p.y*.08));
 c=mix(c,vec3(.55,.5,.45),smoothstep(1.5,2.2,p.y)*.5);
 float sh=1.,tt=.05;
 for(int i=0;i<20;i++){vec3 q=p+sun*tt;float hh=q.y-terrain(q.xz);sh=min(sh,6.*hh/tt);tt+=clamp(hh,.04,.4);}
 sh=clamp(sh,0.,1.);
 vec3 sc=mix(vec3(1.,.6,.35),vec3(1.,.95,.85),smoothstep(0.,.4,sun.y));
 return c*(sc*max(dot(n,sun),0.)*sh*1.7+vec3(.25,.33,.45)*(.35+.65*n.y)*.6);}
vec3 shadeW(vec3 p,vec3 rd){
 vec2 w=vec2(vn(p.xz*3.+vec2(T*.4,0.))-.5,vn(p.xz*3.+vec2(0.,T*.5)+7.)-.5)*.14+vec2(sin(p.x*7.+T*1.7),cos(p.z*6.-T*1.4))*.015;
 vec3 n=normalize(vec3(w.x,1.,w.y));
 float f=pow(1.-max(dot(n,-rd),0.),4.);
 float dep=max(-terrain(p.xz),0.);
 vec3 base=mix(vec3(0.,.12,.2),vec3(.05,.7,.7),exp(-dep*2.5));
 vec3 rf=reflect(rd,n);rf.y=abs(rf.y);
 vec3 c=mix(base,sky(rf),f*.9+.08);
 c+=vec3(1.,.9,.7)*pow(max(dot(reflect(rd,n),sun),0.),250.)*2.;
 float fo=smoothstep(.14,0.,abs(terrain(p.xz)))*(.45+.55*vn(p.xz*14.+T));
 return c+vec3(fo);}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*R)/R.y;
 float a=S*3.14159;sun=normalize(vec3(-cos(a)*.9,sin(a)*.85+.08,-.55));
 vec3 ro=RO;ro.y=max(ro.y,max(terrain(ro.xz)+.3,.22));
 vec3 f=normalize(TA-ro),r=normalize(cross(f,vec3(0.,1.,0.))),u=cross(r,f);
 vec3 rd=normalize(f*1.4+r*uv.x+u*uv.y);
 float tw=rd.y<0.?-ro.y/rd.y:1e5,t=.05;bool hit=false;
 for(int i=0;i<110;i++){vec3 p=ro+rd*t;float h=p.y-terrain(p.xz);if(h<.0015*t){hit=true;break;}t+=max(.02,.5*h);if(t>tw||t>45.)break;}
 vec3 col;float d;
 if(hit&&t<tw){col=shadeT(ro+rd*t,t);d=t;}
 else if(tw<1e4){col=shadeW(ro+rd*tw,rd);d=tw;}
 else{col=sky(rd);d=60.;}
 col=mix(col,sky(normalize(vec3(rd.x,.02,rd.z))),1.-exp(-d*.05));
 col=pow(col*1.1,vec3(.4545));
 col*=1.-.35*dot(uv,uv);
 gl_FragColor=vec4(col,1.);}
`;
