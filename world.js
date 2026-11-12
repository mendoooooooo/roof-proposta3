/* ROOF — the 3D city, the tower and its windows.
   WebGL draws the world; the videos are real DOM <video> elements placed in 3D
   underneath the canvas and seen through "holes" punched in the windows
   (the media server sends no CORS headers, so they cannot be WebGL textures). */
(() => {
'use strict';
const THREE = window.THREE, gsap = window.gsap;
const W = window.World = { ok: false, parallax: 1, onFrame: null };
if (!THREE || !gsap) return;

const coarse = matchMedia('(pointer:coarse)').matches;
const low = coarse || Math.min(innerWidth, innerHeight) < 620;
const canvas = document.getElementById('gl');
const QS = new URLSearchParams(location.search), AA = QS.has('aa') ? QS.get('aa') !== '0' : !low;
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: AA, alpha: true, powerPreference: 'high-performance' });
} catch (e) { return; }
W.ok = true;
renderer.setClearColor(0x000000, 0);
let dpr = Math.min(window.devicePixelRatio || 1, low ? 1.5 : 1.75);
renderer.setPixelRatio(dpr);

const V3 = THREE.Vector3;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.3, 4200);
const rig = { pos: new V3(170, 200, 340), tgt: new V3(0, 50, 0), fov: 0 };

/* ---------- constants ---------- */
const TW = 44, TH = 130, FZ = 22;            // tower width / height / front face z
const WIN_W = 12, WIN_H = 6.75;              // 16:9 windows
const COLS = [-14.5, 0, 14.5], ROWS = [52, 61.5, 71, 80.5, 90];
const ROOM = { hw: 21, floor: -5, ceil: 9, depth: 40 };
const DRUM = { n: 5, w: 13.16, h: 7.4, y: 2, z: -29 };
DRUM.a = DRUM.h / 2 / Math.tan(Math.PI / DRUM.n); DRUM.R = DRUM.a / Math.cos(Math.PI / DRUM.n);
const YELLOW = new THREE.Color(0xf7eb62);

const U = {
  uTime: { value: 0 },
  uFog: { value: 0.0021 },
  uFogColor: { value: new THREE.Color(0x0b0d14) },
  uGrow: { value: 0 },
  uGrowT: { value: 0 },
};
const FOG = `
uniform float uFog; uniform vec3 uFogColor;
float fogF(vec3 wp){ float d = distance(wp, cameraPosition); return 1. - exp(-uFog*uFog*d*d); }
vec3 applyFog(vec3 c, vec3 wp){ return mix(c, uFogColor, fogF(wp)); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
`;
const shader = (o) => new THREE.ShaderMaterial(Object.assign({}, o, {
  uniforms: Object.assign({ uTime: U.uTime, uFog: U.uFog, uFogColor: U.uFogColor }, o.uniforms || {}),
}));
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------- sky ---------- */
{
  const m = shader({
    side: THREE.BackSide, depthWrite: false,
    vertexShader: `varying vec3 vP; void main(){ vP = position; vec4 p = modelViewMatrix*vec4(position,1.); gl_Position = projectionMatrix*p; }`,
    fragmentShader: `${FOG} varying vec3 vP;
      void main(){ vec3 d = normalize(vP); float h = max(d.y, 0.);
        vec3 col = mix(uFogColor, vec3(.012,.014,.024), pow(h, .42));
        float az = dot(normalize(d.xz + 1e-4), normalize(vec2(-.5,-1.)));
        col += vec3(.13,.11,.08) * pow(1.-h, 9.) * (.35 + .65*smoothstep(-.2,1.,az));
        col += vec3(.05,.07,.12) * pow(1.-h, 3.) * .5;
        gl_FragColor = vec4(col, 1.); }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(3000, 32, 16), m);
  sky.renderOrder = 6; sky.frustumCulled = false;   // drawn after the city: only the pixels left empty get shaded
  scene.add(sky);
  W._sky = sky;
}

/* ---------- stars + drifting motes ---------- */
{
  const r = rng(11), n = low ? 500 : 1100, a = new Float32Array(n * 3), s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const th = r() * 6.283, y = .06 + r() * .94, k = Math.sqrt(1 - y * y);
    a.set([Math.cos(th) * k * 2600, y * 2600, Math.sin(th) * k * 2600], i * 3); s[i] = r();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(a, 3));
  g.setAttribute('aS', new THREE.BufferAttribute(s, 1));
  const m = shader({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aS; varying float vS; uniform float uTime;
      void main(){ vS = aS; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); gl_PointSize = 1. + aS*2.2; }`,
    fragmentShader: `varying float vS; uniform float uTime;
      void main(){ float d = length(gl_PointCoord-.5); float tw = .55+.45*sin(uTime*(.6+vS*2.)+vS*40.);
        gl_FragColor = vec4(vec3(.9,.92,1.), smoothstep(.5,.0,d)*tw*(.25+vS*.6)); }`,
  });
  const stars = new THREE.Points(g, m); stars.frustumCulled = false; stars.renderOrder = -9; scene.add(stars);

  const n2 = low ? 160 : 420, b = new Float32Array(n2 * 3), s2 = new Float32Array(n2);
  for (let i = 0; i < n2; i++) { b.set([(r() - .5) * 260, 20 + r() * 150, (r() - .2) * 240], i * 3); s2[i] = r(); }
  const g2 = new THREE.BufferGeometry();
  g2.setAttribute('position', new THREE.BufferAttribute(b, 3));
  g2.setAttribute('aS', new THREE.BufferAttribute(s2, 1));
  const m2 = shader({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aS; varying float vS; varying float vA; uniform float uTime;
      void main(){ vS = aS; vec3 p = position;
        p.x += sin(uTime*.12 + aS*30.)*6.; p.y += mod(uTime*(.6+aS) , 40.) - 20.; p.z += cos(uTime*.1 + aS*17.)*6.;
        vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv;
        gl_PointSize = (40. + aS*70.) / max(-mv.z, 1.); vA = smoothstep(2., 14., -mv.z) * (1.-smoothstep(160., 320., -mv.z)); }`,
    fragmentShader: `varying float vS; varying float vA;
      void main(){ float d = length(gl_PointCoord-.5); gl_FragColor = vec4(mix(vec3(1.,.95,.7), vec3(.97,.92,.38), vS), smoothstep(.5,0.,d)*.22*vA); }`,
  });
  const motes = new THREE.Points(g2, m2); motes.frustumCulled = false; motes.renderOrder = 1; scene.add(motes);
}

/* ---------- ground ---------- */
{
  const m = shader({
    uniforms: { uGrow: U.uGrow },
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `${FOG} varying vec3 vW; uniform float uTime; uniform float uGrow;
      void main(){ vec2 p = vW.xz;
        vec2 d = (fract(p/64.) - .5) * 64.;            // signed distance from street axis
        vec2 a = abs(d); float fw = fwidth(p.x) + fwidth(p.y);
        float street = 1. - smoothstep(8., 9.5 + fw, min(a.x, a.y));
        vec3 col = mix(vec3(.010,.011,.014), vec3(.026,.027,.032), street);
        float fade = 1. - smoothstep(.6, 3.5, fw);
        col += vec3(.30,.26,.13) * (smoothstep(.45+fw,.1,a.x) + smoothstep(.45+fw,.1,a.y)) * .22 * fade;
        vec2 id = floor(p/64.);
        float hx = hash(vec2(id.x, 3.)), hz = hash(vec2(7., id.y));
        float l1 = smoothstep(1.6,.2,abs(d.x-3.2)), l2 = smoothstep(1.6,.2,abs(d.x+3.2));
        float l3 = smoothstep(1.6,.2,abs(d.y-3.2)), l4 = smoothstep(1.6,.2,abs(d.y+3.2));
        vec3 head = vec3(1.,.93,.75), tail = vec3(1.,.12,.08);
        float lights = 0.;
        col += head * l1 * pow(fract( p.y/110. - uTime*(.05+hx*.05) + hx*9.), 16.) * 1.3 * fade;
        col += tail * l2 * pow(fract(-p.y/110. - uTime*(.05+hx*.04) + hx*5.), 16.) * 1.1 * fade;
        col += head * l3 * pow(fract( p.x/110. - uTime*(.05+hz*.05) + hz*9.), 16.) * 1.3 * fade;
        col += tail * l4 * pow(fract(-p.x/110. - uTime*(.05+hz*.04) + hz*5.), 16.) * 1.1 * fade;
        float r = length(p);
        col += vec3(.97,.92,.38) * (smoothstep(1.2,0.,abs(r-58.)) * .5 + smoothstep(.7,0.,abs(r-66.)) * .25 + exp(-r*.03)*.10) * (1.-smoothstep(60.,75.,max(abs(p.x),abs(p.y)))*0.);
        col *= smoothstep(0., .5, uGrow*1.4 - r/900.);
        gl_FragColor = vec4(applyFog(col, vW), 1.); }`,
  });
  const g = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), m);
  g.rotation.x = -Math.PI / 2; g.frustumCulled = false; g.renderOrder = 5; scene.add(g);
}

/* ---------- city ---------- */
{
  const r = rng(7), pitch = 64, R = low ? 9 : 13, list = [];
  for (let i = -R; i <= R; i++) for (let j = -R; j <= R; j++) {
    const cx = i * pitch, cz = j * pitch, d = Math.hypot(cx, cz);
    if (d < 70 || d > R * pitch * 1.02) continue;
    const front = cz > 0 && Math.abs(cx) < pitch * 1.6 && cz < 460;
    const height = () => {
      let h = 12 + Math.pow(r(), 2) * 58;
      if (r() < .11) h += 45 + r() * 60;
      h *= 1 - Math.min(d / (R * pitch), 1) * .35;
      if (front) h = Math.min(h, 16 + r() * 16);
      if (d < 140) h = Math.min(h, 46);
      return h;
    };
    const split = r();
    if (split < .4) {
      const along = r() < .5, k = .35 + r() * .3, gap = 3;
      const s1 = 46 * k - gap / 2, s2 = 46 * (1 - k) - gap / 2;
      const o1 = -23 + s1 / 2, o2 = 23 - s2 / 2;
      if (along) { list.push([cx + o1, cz, s1, height(), 40 + r() * 6]); list.push([cx + o2, cz, s2, height(), 40 + r() * 6]); }
      else { list.push([cx, cz + o1, 40 + r() * 6, height(), s1]); list.push([cx, cz + o2, 40 + r() * 6, height(), s2]); }
    } else {
      const w = 30 + r() * 16, dd = 30 + r() * 16, h = height();
      list.push([cx, cz, w, h, dd]);
      if (h > 50 && r() < .6) list.push([cx, cz, w * .55, h * 1.28, dd * .55]);  // stepped crown
    }
  }
  list.sort((a, b) => Math.hypot(a[0], a[1]) - Math.hypot(b[0], b[1]));   // near-to-far from the tower: early-z kills the overdraw
  const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, .5, 0);
  const seeds = new Float32Array(list.length);
  const mat = shader({
    uniforms: { uGrow: U.uGrow },
    vertexShader: `attribute float aSeed; uniform float uGrow;
      varying vec3 vW; varying vec3 vN; varying vec2 vF; varying float vSeed; varying float vG; varying float vY;
      void main(){
        vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
        vec4 o = instanceMatrix * vec4(0.,0.,0.,1.);
        float g = clamp(uGrow*2.3 - length(o.xz)/700. - aSeed*.35, 0., 1.);
        g = 1. - pow(1.-g, 3.);
        vec3 p = position; p.y *= g;
        vec4 w = instanceMatrix * vec4(p, 1.);
        vW = w.xyz; vN = normal; vSeed = aSeed; vG = g; vY = position.y;
        vF = vec2(abs(normal.x) > .5 ? position.z*sc.z : position.x*sc.x, p.y*sc.y);
        gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `${FOG} varying vec3 vW; varying vec3 vN; varying vec2 vF; varying float vSeed; varying float vG; varying float vY;
      void main(){
        vec3 col = vec3(.030,.032,.040);
        if (vN.y > .5) { col = vec3(.016,.017,.021); }
        else {
          vec2 cell = vec2(3.4, 3.7) * mix(.8, 1.35, fract(vSeed*7.31));
          vec2 uv = vF / cell; vec2 id = floor(uv), f = fract(uv); vec2 fw = fwidth(uv);
          float r = hash(id + vSeed*91.7);
          float lit = step(mix(.5,.78,fract(vSeed*3.7)), r);
          float mx = smoothstep(.10-fw.x,.10+fw.x,f.x)*smoothstep(.90+fw.x,.90-fw.x,f.x);
          float my = smoothstep(.22-fw.y,.22+fw.y,f.y)*smoothstep(.80+fw.y,.80-fw.y,f.y);
          float fade = 1. - smoothstep(.3, .95, max(fw.x, fw.y));
          float mask = mix(.46, mx*my, fade);
          vec3 tint = mix(vec3(1.,.80,.52), vec3(.72,.84,1.), step(.78, hash(id.yx + vSeed*13.)));
          tint = mix(tint, vec3(.97,.92,.38), step(.94, hash(id + 3.1 + vSeed)));
          col += tint * lit * mask * (.25 + .75*hash(id*1.7 + vSeed)) * .85;
          col += vec3(.035,.04,.055) * (1.-lit) * mask * fade;
          col += vec3(.9,.72,.35) * .07 * exp(-vW.y*.08);
        }
        col += vec3(.97,.92,.38) * (1.-vG) * smoothstep(.93, 1., vY) * 2.;
        gl_FragColor = vec4(applyFog(col, vW), 1.); }`,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, list.length);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = new V3(), S = new V3();
  list.forEach((b, i) => { P.set(b[0], 0, b[1]); S.set(b[2], b[3], b[4]); M.compose(P, Q, S); mesh.setMatrixAt(i, M); seeds[i] = r(); });
  geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
  mesh.frustumCulled = false; mesh.renderOrder = 4; scene.add(mesh);
}

/* ---------- the tower ---------- */
const towerU = { uGrowT: U.uGrowT, uOpen: { value: new THREE.Vector4(0, 71, WIN_W / 2, WIN_H / 2) }, uOpenOn: { value: 0 } };
{
  const geo = new THREE.BoxGeometry(TW, TH, TW); geo.translate(0, TH / 2, 0);
  const mat = shader({
    uniforms: towerU,
    vertexShader: `uniform float uGrowT; varying vec3 vW; varying vec3 vN;
      void main(){ vec3 p = position; p.y *= uGrowT; vec4 w = modelMatrix*vec4(p,1.); vW = w.xyz; vN = normal; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `${FOG} varying vec3 vW; varying vec3 vN; uniform vec4 uOpen; uniform float uOpenOn; uniform float uGrowT; uniform float uTime;
      void main(){
        vec3 col;
        if (vN.y > .5) col = vec3(.014);
        else {
          if (vN.z > .5 && uOpenOn > .5 && abs(vW.x-uOpen.x) < uOpen.z && abs(vW.y-uOpen.y) < uOpen.w) discard;
          float u = abs(vN.x) > .5 ? vW.z : vW.x; float v = vW.y;
          vec2 uv = vec2(u/2.2, v/4.75); vec2 f = fract(uv), id = floor(uv); vec2 fw = fwidth(uv);
          vec3 V = normalize(cameraPosition - vW);
          float fres = pow(1. - abs(dot(V, vN)), 3.);
          vec3 glass = mix(vec3(.018,.021,.03), vec3(.05,.058,.078), smoothstep(0., 130., v)) + vec3(.06,.075,.11)*fres;
          float fade = 1. - smoothstep(.25, .9, max(fw.x, fw.y));
          float line = max(1.-smoothstep(.02, .05+fw.x, min(f.x,1.-f.x)), 1.-smoothstep(.02, .06+fw.y, min(f.y,1.-f.y)));
          col = mix(glass, vec3(.008), line*fade*.85);
          float lit = step(.9, hash(id + 5.3));
          col += vec3(1.,.82,.55) * lit * (1.-line) * .16;
          float edge = smoothstep(20.9, 21.7, abs(u));
          col += vec3(.97,.92,.38) * edge * (.55 + .25*sin(v*.25 - uTime*1.4));
          col += vec3(.97,.92,.38) * smoothstep(127.4, 129.6, v) * .9;
          col += vec3(.97,.92,.38) * smoothstep(.985, 1., v/(130.*max(uGrowT,.001))) * (1.-uGrowT) * 3.;
        }
        gl_FragColor = vec4(applyFog(col, vW), 1.); }`,
  });
  const tower = new THREE.Mesh(geo, mat); tower.frustumCulled = false; scene.add(tower);
}

/* ---------- rooftop ---------- */
const roomVS = `varying vec3 vW; varying vec3 vN;
  void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; vN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*viewMatrix*w; }`;
const roomFS = `${FOG} varying vec3 vW; varying vec3 vN;
  uniform vec3 uL[3]; uniform vec3 uC[3]; uniform vec3 uBase; uniform float uGrid; uniform float uFall;
  void main(){ vec3 n = normalize(vN); vec3 acc = vec3(.05,.052,.06);
    vec3 V = normalize(cameraPosition - vW); vec3 spec = vec3(0.);
    for (int i = 0; i < 3; i++) { vec3 d = uL[i]-vW; float d2 = dot(d,d); vec3 l = d*inversesqrt(d2); float att = uFall/(uFall+d2);
      acc += uC[i]*max(dot(n,l),0.)*att; spec += uC[i]*pow(max(dot(n, normalize(l+V)),0.), 48.)*att; }
    vec3 col = uBase*acc;
    if (n.y > .5) { vec2 g = abs(fract(vW.xz/3.)-.5); vec2 fw = fwidth(vW.xz/3.);
      float l = smoothstep(.5-.012-max(fw.x,fw.y), .5, max(g.x,g.y)) * (1.-smoothstep(.1,.5,max(fw.x,fw.y)));
      col += vec3(.97,.92,.38)*l*.07*uGrid; col += spec*.5; }
    else col += spec*.08;
    gl_FragColor = vec4(applyFog(col, vW), 1.); }`;
const roomMat = (base, grid, lights, fall) => shader({
  uniforms: { uL: { value: lights.map(l => l[0]) }, uC: { value: lights.map(l => l[1]) }, uBase: { value: new THREE.Color(base) }, uGrid: { value: grid }, uFall: { value: fall || 90 } },
  vertexShader: roomVS, fragmentShader: roomFS,
});
const basic = (c) => new THREE.MeshBasicMaterial({ color: c });
function glowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
}
const GLOW = glowTex();
const glow = (color, size, opacity) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.set(size, size, 1); s.renderOrder = 3; return s; };
const roof = new THREE.Group();
{
  roof.position.y = TH;
  const L = [[new V3(0, TH + 9, 2), new THREE.Color(1.6, 1.45, .55)], [new V3(-14, TH + 4, 14), new THREE.Color(.35, .45, .8)], [new V3(16, TH + 5, -12), new THREE.Color(.5, .4, .2)]];
  const fm = roomMat(0x3a3b40, 1, L, 160), bm = roomMat(0x2a2b30, 0, L, 160);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(TW, TW), fm); floor.rotation.x = -Math.PI / 2; floor.position.y = .05; roof.add(floor);
  const box = (w, h, d, x, y, z, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m || bm); b.position.set(x, y, z); roof.add(b); return b; };
  box(TW, 1.3, .6, 0, .65, TW / 2 - .3); box(TW, 1.3, .6, 0, .65, -TW / 2 + .3); box(.6, 1.3, TW, TW / 2 - .3, .65, 0); box(.6, 1.3, TW, -TW / 2 + .3, .65, 0);
  box(7, 2.6, 5, -13, 1.3, -12); box(4, 1.8, 4, 14, .9, 13); box(3, 3.4, 3, 15, 1.7, -14);
  box(.25, 8, .25, -7, 4, -6.2); box(.25, 8, .25, 7, 4, -6.2); box(16, .2, .2, 0, 3, -6.2);
  box(.3, 20, .3, 15, 10, -14);
  const beacon = glow(0xff3a2a, 5, 1); beacon.position.set(15, 20.4, -14); roof.add(beacon); W._beacon = beacon;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(18, 18 * 273 / 491), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0 }));
  sign.position.set(0, 8.6, -6); sign.renderOrder = 4; roof.add(sign);
  if (window.ROOF_LOGO) new THREE.TextureLoader().load(window.ROOF_LOGO, t => { t.colorSpace = THREE.SRGBColorSpace; sign.material.map = t; sign.material.opacity = 1; sign.material.needsUpdate = true; });
  const g1 = glow(0xf7eb62, 46, .34); g1.position.set(0, 8.6, -6.4); roof.add(g1);
  const g2 = glow(0xf7eb62, 18, .22); g2.position.set(0, 2, -4); roof.add(g2);
  roof.visible = false; scene.add(roof);
}

/* ---------- interior room (moves behind whichever window we are in) ---------- */
const room = new THREE.Group();
const roomLightsLocal = [[new V3(0, 7.5, -12), new THREE.Color(2.2, 2.0, 1.7)], [new V3(-15, 4, -13), new THREE.Color(2.2, 1.95, .6)], [new V3(12, 5, -32), new THREE.Color(.7, .95, 1.9)]];
const roomLights = roomLightsLocal.map(l => [l[0].clone(), l[1]]);
const frontParts = [];
let drum; const faceObjs = [], drumParts = [], faceItems = [];
{
  const wallM = roomMat(0x5a5b60, 0, roomLights, 110), floorM = roomMat(0x48494e, 1, roomLights, 110);
  const { hw, floor, ceil, depth } = ROOM, h = ceil - floor, cy = (ceil + floor) / 2;
  const quad = (w, hh, x, y, z, ry, rx, m) => { const q = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), m || wallM); q.position.set(x, y, z); if (ry) q.rotation.y = ry; if (rx) q.rotation.x = rx; room.add(q); return q; };
  quad(hw * 2, depth, 0, floor, -depth / 2, 0, -Math.PI / 2, floorM);
  quad(hw * 2, depth, 0, ceil, -depth / 2, 0, Math.PI / 2);
  quad(depth, h, -hw, cy, -depth / 2, Math.PI / 2);                         // left wall
  quad(hw * 2, h, 0, cy, -depth, 0);                                        // back wall
  // right wall with an opening to the outside (z -30..-14, floor..5)
  quad(14, h, hw, cy, -7, -Math.PI / 2); quad(10, h, hw, cy, -35, -Math.PI / 2); quad(16, ceil - 5, hw, (ceil + 5) / 2, -22, -Math.PI / 2);
  for (let i = 0; i < 4; i++) frontParts.push(quad(1, 1, 0, 0, -.25, Math.PI));    // front wall around the window
  const strip = (w, hh, d, x, y, z, c) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), basic(c)); b.position.set(x, y, z); room.add(b); return b; };
  strip(.16, .1, depth - 2, -hw + .1, ceil - .3, -depth / 2, 0xf7eb62); strip(.16, .1, depth - 2, hw - .1, ceil - .3, -depth / 2, 0xf7eb62);
  strip(.16, .1, depth - 2, -hw + .1, floor + .08, -depth / 2, 0x8a8340); strip(hw * 2 - 2, .1, .16, 0, floor + .08, -depth + .1, 0x8a8340);
  for (let i = 0; i < 4; i++) strip(10, .08, .5, -15 + i * 10, ceil - .06, -8 - (i % 2) * 14, 0xfff6d8);
  strip(.12, 10, .12, hw - .06, 0, -14, 0xf7eb62); strip(.12, 10, .12, hw - .06, 0, -30, 0xf7eb62); strip(.12, .12, 16, hw - .06, 5, -22, 0xf7eb62);
  // art frame on the left wall
  strip(.06, .08, 20, -hw + .05, 5.6, -12.5, 0xf7eb62); strip(.06, .08, 20, -hw + .05, -3.6, -12.5, 0x55522a);
  const colM = roomMat(0x303136, 0, roomLights, 110);
  [[11, -9], [-11, -33], [11, -33]].forEach(p => { const c = new THREE.Mesh(new THREE.BoxGeometry(1.2, h, 1.2), colM); c.position.set(p[0], cy, p[1]); room.add(c); });
  // the drum: a five-sided prism of screens (each face is a hole onto a DOM film) that rolls as you scroll
  drum = new THREE.Group(); drum.position.set(0, DRUM.y, DRUM.z); room.add(drum);
  const holeM = new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0, blending: THREE.NoBlending, depthWrite: false });
  const faceG = new THREE.PlaneGeometry(DRUM.w, DRUM.h);
  for (let i = 0; i < DRUM.n; i++) {
    const al = i * Math.PI * 2 / DRUM.n, f = new THREE.Object3D();
    f.rotation.x = al; f.position.set(0, -DRUM.a * Math.sin(al), DRUM.a * Math.cos(al)); drum.add(f); faceObjs.push(f);
    const hole = new THREE.Mesh(faceG, holeM); hole.renderOrder = 10; f.add(hole);
    const back = new THREE.Mesh(faceG, basic(0x030304)); back.position.z = -.05; f.add(back);
    const e = al + Math.PI / DRUM.n, led = new THREE.Mesh(new THREE.BoxGeometry(DRUM.w + .5, .09, .09), basic(0xf7eb62));
    led.position.set(0, -DRUM.R * Math.sin(e), DRUM.R * Math.cos(e)); drum.add(led);
  }
  [-1, 1].forEach(sd => {
    const cap = new THREE.Mesh(new THREE.CircleGeometry(DRUM.a, 40), basic(0x08080a)); cap.rotation.y = sd * Math.PI / 2;
    cap.position.x = sd * (DRUM.w / 2 + .02); drum.add(cap);
    const hub = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.25, 40), basic(0xf7eb62)); hub.rotation.y = sd * Math.PI / 2; hub.position.x = sd * (DRUM.w / 2 + .06); drum.add(hub);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(.5, ROOM.ceil - DRUM.y, .5), basic(0x0c0c0e)); arm.position.set(sd * (DRUM.w / 2 + .6), DRUM.y + (ROOM.ceil - DRUM.y) / 2, DRUM.z); room.add(arm); drumParts.push(arm);
  });
  const sg = glow(0xf7eb62, 46, .12); sg.position.set(0, DRUM.y, DRUM.z); room.add(sg); drumParts.push(sg);
  room.visible = false; scene.add(room);
}
function layoutFront(xa) {
  const { hw, floor, ceil } = ROOM, x0 = xa - WIN_W / 2, x1 = xa + WIN_W / 2, y0 = -WIN_H / 2, y1 = WIN_H / 2;
  const set = (m, a, b, c, d) => { m.scale.set(Math.max(b - a, .001), Math.max(d - c, .001), 1); m.position.x = (a + b) / 2; m.position.y = (c + d) / 2; };
  set(frontParts[0], -hw, x0, floor, ceil); set(frontParts[1], x1, hw, floor, ceil); set(frontParts[2], x0, x1, y1, ceil); set(frontParts[3], x0, x1, floor, y0);
}

/* ---------- windows ---------- */
const css = { root: document.getElementById('css3d'), cam: document.getElementById('css3d-cam'), items: [] };
const slots = [], byId = {};
const winGeo = new THREE.PlaneGeometry(WIN_W, WIN_H), rimGeo = new THREE.PlaneGeometry(WIN_W + .7, WIN_H + .7);
const winVS = `varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`;
function makeSlot(def, i) {
  const s = Object.assign({ on: 0, ready: 0, started: false, want: false, hi: 0, seed: (i * 0.618) % 1 }, def);
  s.center = new V3(COLS[def.c], ROWS[def.r], FZ);
  s.group = new THREE.Group(); s.group.position.set(s.center.x, s.center.y, FZ + .06); scene.add(s.group);
  s.poster = new THREE.Mesh(winGeo, shader({
    uniforms: { map: { value: null }, uHas: { value: 0 }, uOn: { value: 0 }, uSeed: { value: s.seed }, uScale: { value: new THREE.Vector2(1, 1) } },
    vertexShader: winVS,
    fragmentShader: `${FOG} varying vec2 vUv; varying vec3 vW; uniform sampler2D map; uniform float uHas, uOn, uSeed, uTime; uniform vec2 uScale;
      void main(){ vec3 col;
        if (uHas > .5) col = texture2D(map, (vUv-.5)*uScale+.5).rgb * .92;
        else { float b = sin(vUv.x*9. + uTime*.6 + uSeed*20.)*.5+.5; float c = sin(vUv.y*5. - uTime*.4 + uSeed*8.)*.5+.5;
          col = mix(vec3(.10,.09,.04), vec3(.75,.68,.25), b*c*.7) + vec3(.03); }
        col *= uOn; gl_FragColor = vec4(applyFog(col, vW), 1.); }`,
  }));
  s.poster.position.z = -.02; s.group.add(s.poster);
  s.hole = new THREE.Mesh(winGeo, shader({
    uniforms: { uK: { value: 1 } }, transparent: true, depthWrite: false,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.ZeroFactor, blendDst: THREE.SrcAlphaFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.SrcAlphaFactor,
    vertexShader: winVS,
    fragmentShader: `${FOG} varying vec3 vW; uniform float uK; void main(){ gl_FragColor = vec4(0.,0.,0., 1. - (1.-uK)*(1.-fogF(vW))); }`,
  }));
  s.hole.renderOrder = 10; s.group.add(s.hole);
  s.rim = new THREE.Mesh(rimGeo, shader({
    uniforms: { uOn: { value: 0 }, uHi: { value: 0 }, uSeed: { value: s.seed } }, transparent: true, depthWrite: false,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor,
    vertexShader: winVS,
    fragmentShader: `${FOG} varying vec2 vUv; varying vec3 vW; uniform float uOn, uHi, uSeed, uTime;
      void main(){ vec2 a = abs(vUv-.5); float inner = step(a.x, ${(WIN_W / (WIN_W + .7) / 2).toFixed(4)}) * step(a.y, ${(WIN_H / (WIN_H + .7) / 2).toFixed(4)});
        float dist = distance(vW, cameraPosition);
        vec3 rim = mix(vec3(.55,.55,.48)*.5, vec3(.97,.92,.38)*1.3, uHi) * (1.-inner);
        float diag = vUv.x*.7 + vUv.y + sin(uTime*.12 + uSeed*9.)*.7;
        vec3 sheen = vec3(.55,.62,.8) * smoothstep(.35, 0., abs(diag-.9)) * .07 * inner * smoothstep(14., 50., dist);
        gl_FragColor = vec4((rim + sheen) * uOn * (1.-fogF(vW)), 0.); }`,
  }));
  s.rim.position.z = .02; s.rim.renderOrder = 11; s.group.add(s.rim);
  // DOM video
  if (def.video) {
    s.el = document.createElement('div'); s.el.className = 'win3d';
    s.videoEl = document.createElement('video');
    Object.assign(s.videoEl, { muted: true, loop: true, playsInline: true, preload: 'none' });
    s.videoEl.setAttribute('playsinline', ''); s.videoEl.setAttribute('muted', ''); s.videoEl.disableRemotePlayback = true;
    s.videoEl.addEventListener('playing', () => { if (s.ready < 1 && !s._tw) s._tw = gsap.to(s, { ready: 1, duration: .7, ease: 'power2.out' }); });
    s.el.appendChild(s.videoEl); css.cam.appendChild(s.el);
    css.items.push({ el: s.el, obj: s.group, scale: WIN_W / 640, slot: s, shown: false, reach: 9 });
  }
  if (def.poster) new THREE.TextureLoader().setCrossOrigin('anonymous').load(def.poster, t => {
    t.colorSpace = THREE.NoColorSpace; const u = s.poster.material.uniforms; u.map.value = t; u.uHas.value = 1;
    const ia = t.image.width / t.image.height, wa = WIN_W / WIN_H;
    if (ia > wa) u.uScale.value.set(wa / ia, 1); else u.uScale.value.set(1, ia / wa);
  }, undefined, () => {});
  slots.push(s); byId[s.id] = s; return s;
}

/* ---------- CSS 3D sync ---------- */
const _m = new THREE.Matrix4(), _s = new THREE.Matrix4(), _v = new V3();
const _p = new V3(), _n = new V3();
const CS = 100;   // CSS px per world unit: keeps the browser's 3D maths (and video sharpness) in a sane range
const ep = v => Math.abs(v) < 1e-10 ? 0 : +v.toFixed(7);
function syncCSS() {
  const hw = innerWidth / 2, hh = innerHeight / 2, fovPx = camera.projectionMatrix.elements[5] * hh;
  css.root.style.perspective = fovPx + 'px';
  const e = camera.matrixWorldInverse.elements;
  css.cam.style.transform = `translateZ(${fovPx}px) matrix3d(${ep(e[0])},${ep(-e[1])},${ep(e[2])},${ep(e[3])},${ep(e[4])},${ep(-e[5])},${ep(e[6])},${ep(e[7])},${ep(e[8])},${ep(-e[9])},${ep(e[10])},${ep(e[11])},${ep(e[12]*CS)},${ep(-e[13]*CS)},${ep(e[14]*CS)},${ep(e[15])}) translate(${hw}px,${hh}px)`;
  for (const it of css.items) {
    let show = it.visible !== false && (it.slot ? it.slot.k < .995 : true);
    if (show) for (let o = it.obj.parent; o; o = o.parent) if (!o.visible) { show = false; break; }
    if (show) {   // skip everything the camera cannot see: behind it, facing away, or off screen (fewer video layers to composite)
      _p.setFromMatrixPosition(it.obj.matrixWorld); _n.set(0, 0, 1).transformDirection(it.obj.matrixWorld);
      _v.copy(_p).applyMatrix4(camera.matrixWorldInverse);
      show = _v.z < -.6 && _n.dot(_v.copy(camera.position).sub(_p)) > 0;
      if (show) { _v.copy(_p).project(camera); const m = 1 + it.reach / Math.max(camera.position.distanceTo(_p), .1); show = Math.abs(_v.x) < m * 1.15 && Math.abs(_v.y) < m * 1.15; }
    }
    if (show !== it.shown) { it.shown = show; it.el.style.display = show ? 'block' : 'none'; }
    if (!show) continue;
    _s.makeScale(it.scale * CS, it.scale * CS, it.scale * CS); _m.multiplyMatrices(it.obj.matrixWorld, _s);
    const a = _m.elements;
    it.el.style.transform = `translate(-50%,-50%) matrix3d(${ep(a[0])},${ep(a[1])},${ep(a[2])},${ep(a[3])},${ep(-a[4])},${ep(-a[5])},${ep(-a[6])},${ep(-a[7])},${ep(a[8])},${ep(a[9])},${ep(a[10])},${ep(a[11])},${ep(a[12]*CS)},${ep(a[13]*CS)},${ep(a[14]*CS)},${ep(a[15])})`;
  }
}

/* ---------- which videos are allowed to play ---------- */
const MAXV = low ? 3 : 7;
function scheduleVideos() {
  const hw = innerWidth / 2, hh = innerHeight / 2, list = [];
  for (const s of slots) {
    s.score = 0; if (!s.videoEl || s.on < .5 || (s === cur && open > .98)) continue;
    _v.copy(s.center).applyMatrix4(camera.matrixWorldInverse); if (_v.z > -1) continue;
    const size = WIN_W / -_v.z; _v.copy(s.center).project(camera);
    if (Math.abs(_v.x) > 1.3 || Math.abs(_v.y) > 1.3) continue;
    s.score = size + (s === cur ? 5 : 0) + (s.started ? .02 : 0); list.push(s);
  }
  list.sort((a, b) => b.score - a.score);
  // while flying between windows only the two that matter keep decoding; the others hold their frame
  slots.forEach(s => { if (!s.videoEl) return; const want = list.indexOf(s) > -1 && list.indexOf(s) < MAXV && !document.hidden && (!flight || s.id === flightIds[0] || s.id === flightIds[1]);
    if (want) { if (!s.started) { s.started = true; s.videoEl.src = s.video; } if (s.videoEl.paused) s.videoEl.play().catch(() => {}); }
    else if (s.started && !s.videoEl.paused) s.videoEl.pause(); });
}

/* ---------- poses ---------- */
let cur = null, open = 0, flight = null, flightIds = [], drumPull = 0;
const tanH = () => Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
// the window covers the whole screen, on phones too: you are already "in" the video
const fillDist = (w, h, id) => { const a = h / 2 / tanH(), b = w / 2 / (tanH() * camera.aspect); return Math.min(a, b) / 1.035; };
function fillPose(s) { return { pos: new V3(s.center.x, s.center.y, FZ + fillDist(WIN_W, WIN_H, s.id)), tgt: new V3(s.center.x, s.center.y, FZ - 12) }; }
const ss = (a, b, x) => { const t = Math.min(Math.max((x - a) / (b - a), 0), 1); return t * t * (3 - 2 * t); };
const sm = t => t * t * t * (t * (t * 6 - 15) + 10);
let homeKeys = null;
function buildHomeKeys() {
  const s = byId.home, A = s.center, f = fillPose(s), a = (x, y, z) => new V3(A.x + x, A.y + y, A.z + z);
  const dS = Math.min(DRUM.h / 2 / tanH(), DRUM.w / 2 / (tanH() * camera.aspect)) / 1.03, zs = DRUM.z + DRUM.a + dS;
  homeKeys = [
    [0, f.pos, f.tgt],
    [.07, a(0, 0, -5), a(0, 0, -34)],
    [.15, a(3, .4, -12), a(-21, .9, -12.5)],
    [.215, a(3, .4, -12), a(-21, .9, -12.5)],
    [.28, a(0, DRUM.y, Math.min(zs + 8, -3)), a(0, DRUM.y, -40)],
    [.335, a(0, DRUM.y, zs + .4), a(0, DRUM.y, -40)],
    [.60, a(0, DRUM.y, zs), a(0, DRUM.y, -40)],
    [.66, a(11, .5, -22), new V3(70, A.y + 2, 0)],
    [.73, new V3(38, A.y + 4, 0), new V3(100, A.y - 6, -34)],
    [.81, new V3(54, 106, 26), new V3(64, 80, -84)],
    [.885, new V3(40, 135, 47), new V3(0, 135, -6)],
    [.925, new V3(15, 136.4, 38), new V3(-9, 137.4, -6)],
    [.955, new V3(14, 136.6, 37), new V3(-9, 137.6, -6)],
    [1, new V3(0, 153, 84), new V3(0, 129, 0)],
  ];
  if (camera.aspect < 1) {   // portrait: the sign sits above the text instead of beside it
    homeKeys[11] = [.925, new V3(4, 134, 54), new V3(0, 124, -6)];
    homeKeys[12] = [.955, new V3(3, 134.4, 52), new V3(0, 124, -6)];
    homeKeys[13] = [1, new V3(0, 147, 92), new V3(0, 129, 0)];   // from above the roof like before, with a gentle tilt so the sign and antenna stay upright
  }
}
function homePose(p) {
  if (!homeKeys) buildHomeKeys();
  const K = homeKeys; let i = 0; while (i < K.length - 2 && p > K[i + 1][0]) i++;
  const t = sm(Math.min(Math.max((p - K[i][0]) / (K[i + 1][0] - K[i][0]), 0), 1));
  rig.pos.lerpVectors(K[i][1], K[i + 1][1], t); rig.tgt.lerpVectors(K[i][2], K[i + 1][2], t);
}

/* ---------- public API ---------- */
W.init = (defs) => { defs.forEach(makeSlot); resize(); requestAnimationFrame(frame); setInterval(scheduleVideos, 350); };
W.slot = id => byId[id];
W.homeFillDist = () => fillDist(WIN_W, WIN_H, 'home');
W.preload = id => { const s = byId[id]; if (s && s.videoEl && !s.started) { s.started = true; s.videoEl.preload = 'auto'; s.videoEl.src = s.video; s.videoEl.play().catch(() => {}); } };
W.floor = id => { const s = byId[id]; return s ? 12 + s.r * 2 : 0; };
W.attachFaces = (els) => els.forEach((el, i) => { css.cam.appendChild(el); const it = { el, obj: faceObjs[i], scale: DRUM.w / 1280, visible: false, shown: false, reach: 10 }; faceItems.push(it); css.items.push(it); });
// turn: which face looks at us (fractional while rolling). pull: 0..1, the camera steps back to show the whole drum
W.setDrum = (turn, pull) => { drum.rotation.x = -turn * Math.PI * 2 / DRUM.n; drumPull = pull; };
// on-screen rectangle of a window seen from its fill pose (used to hand a video over to the page)
W.fillRect = () => { const d = fillDist(WIN_W, WIN_H), ppu = innerHeight / 2 / (tanH() * d), w = WIN_W * ppu, h = WIN_H * ppu; return { x: (innerWidth - w) / 2, y: (innerHeight - h) / 2, w, h }; };
W.setActive = (id) => {
  if (cur) cur.poster.visible = true;
  cur = byId[id] || null; open = 0; if (!cur) { towerU.uOpenOn.value = 0; return; }
  room.position.set(0, cur.center.y, FZ); layoutFront(cur.center.x); room.updateMatrixWorld(true);
  roomLightsLocal.forEach((l, i) => roomLights[i][0].copy(l[0]).add(room.position));
  towerU.uOpen.value.set(cur.center.x, cur.center.y, WIN_W / 2, WIN_H / 2); towerU.uOpenOn.value = 1;
  const home = id === 'home'; drum.visible = home; drumParts.forEach(m => m.visible = home); faceItems.forEach(it => it.visible = home);
};
W.setOpen = (o) => { open = o; if (cur) cur.poster.visible = o < .002; };
W.highlight = (id, v) => { const s = byId[id]; if (s) gsap.to(s, { hi: v, duration: .5 }); };
W.toFill = (id) => { const f = fillPose(byId[id]); rig.pos.copy(f.pos); rig.tgt.copy(f.tgt); W.setOpen(0); W.parallax = 0; };
W.setHome = (p) => {
  homePose(p); W.setOpen(ss(.008, .036, p));
  if (p > .3 && p < .64) rig.pos.z += drumPull * 6.5;
  W.parallax = p < .01 ? 0 : p < .66 ? .7 : 1.6;
};
W.setPage = (s, quickOpen) => {
  if (!cur) return; const f = fillPose(cur), xa = cur.center.x, e = sm(Math.min(s, 1)), s2 = Math.max(s - 1, 0), k = Math.min(s2 / 2, 1);
  rig.pos.set(f.pos.x + (xa * .45 - f.pos.x) * e - xa * .45 * k + Math.sin(s2 * .45) * 3.2 * k,
    cur.center.y + Math.sin(s2 * .6) * .5 * k, f.pos.z + (FZ - 6 - f.pos.z) * e - Math.min(s2 * 2.4, 22));
  rig.tgt.set(xa + (rig.pos.x * .6 - xa) * e + Math.sin(s2 * .3) * 7 * k, cur.center.y + .4 * e, FZ - 12 - 30 * e);
  W.setOpen(quickOpen ? ss(.004, .05, s) : ss(.08, .5, s)); W.parallax = s < .05 ? 0 : .7;
};
W.fly = (from, to, opt = {}) => {
  if (flight) flight.kill();
  flightIds = [from, to]; W.preload(to);
  const a = byId[from], b = byId[to], pa = fillPose(a), pb = fillPose(b);
  const span = a.center.distanceTo(b.center), back = 30 + span * .85;
  const side = (b.center.x - a.center.x) || (a.center.x >= 0 ? -14 : 14);
  const mid = a.center.clone().add(b.center).multiplyScalar(.5);
  const curve = new THREE.CatmullRomCurve3([
    pa.pos, new V3(a.center.x - side * .12, a.center.y + 1.5, FZ + back * .62),
    new V3(mid.x - Math.sign(side) * 6, mid.y + 4, FZ + back),
    new V3(b.center.x + side * .12, b.center.y + 1.5, FZ + back * .62), pb.pos], false, 'centripetal');
  const o = { u: 0 }, ta = pa.tgt, tb = pb.tgt;
  W.setActive(to); W.parallax = .5; W.highlight(to, 1);
  flight = gsap.timeline({ onComplete() { flight = null; rig.fov = 0; W.toFill(to); W.highlight(to, 0); } });
  flight.to(o, { u: 1, duration: opt.duration || 2.5, ease: 'power3.inOut', onUpdate() {
    curve.getPoint(o.u, rig.pos); rig.tgt.lerpVectors(ta, tb, ss(.18, .82, o.u)); rig.fov = Math.sin(o.u * Math.PI) * 7;
    rig.roll = Math.sin(o.u * Math.PI * 2) * -Math.sign(side) * .05;
  } });
  // the mouse sway fades out before the landing: once the window fills the screen nothing drifts any more
  flight.to(W, { parallax: 0, duration: .9, ease: "power2.inOut" }, Math.max(0, (opt.duration || 2.5) - 1.5));
  return flight;
};
W.intro = (to, quick) => {
  const b = byId[to], pb = fillPose(b);
  W.setActive(to); W.parallax = 1.4;
  const tl = gsap.timeline({ onComplete() { W.toFill(to); rig.roll = 0; } });
  if (quick) { U.uGrow.value = U.uGrowT.value = 1; slots.forEach(s => s.on = 1); roof.visible = true; W.toFill(to); return tl; }
  const curve = new THREE.CatmullRomCurve3([new V3(190, 215, 360), new V3(96, 150, 268), new V3(-44, 104, 150), new V3(b.center.x * .5 - 8, b.center.y + 6, 78), pb.pos], false, 'centripetal');
  const o = { u: 0 }, t0 = new V3(0, 46, 0);
  tl.to(U.uGrow, { value: 1, duration: 3.6, ease: 'power1.out' }, 0)
    .to(U.uGrowT, { value: 1, duration: 2.6, ease: 'power3.inOut', onStart() { roof.visible = false; }, onComplete() { roof.visible = true; } }, .9)
    .to(o, { u: 1, duration: 7.4, ease: 'power2.inOut', onUpdate() { curve.getPoint(o.u, rig.pos); rig.tgt.lerpVectors(t0, pb.tgt, ss(.12, .8, o.u)); rig.roll = Math.sin(o.u * Math.PI) * .06; } }, 0);
  slots.forEach((s, i) => {
    const at = 3.6 + ((i * 7) % slots.length) * .11;
    tl.to(s, { keyframes: [{ on: .7, duration: .06 }, { on: .15, duration: .08 }, { on: 1, duration: .25 }] }, at);
  });
  tl.to(W, { parallax: 0, duration: 1.4, ease: "power2.inOut" }, 5.4);   // sway gone before the landing: the video is perfectly still when the camera stops
  tl.call(() => W.highlight(to, 1), null, 4.6).call(() => W.highlight(to, 0), null, 7.2);
  return tl;
};
W.rig = rig; W.camera = camera; W.renderer = renderer; W.scene = scene;

/* ---------- loop ---------- */
const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = e.clientY / innerHeight * 2 - 1; }, { passive: true });
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; W.baseFov = camera.aspect < .8 ? 54 : camera.aspect < 1.2 ? 46 : 40;
  camera.fov = W.baseFov; camera.updateProjectionMatrix(); homeKeys = null;
  if (W.onResize) W.onResize();
}
addEventListener('resize', resize);
let last = 0, slow = 0, par = 1;
function frame(t) {
  requestAnimationFrame(frame);
  const dt = Math.min(t - last, 100); last = t;
  if (document.hidden) return;
  U.uTime.value = t / 1000;
  if (W.onFrame) W.onFrame(t, dt);
  // adaptive resolution: never let the scene stutter
  if (dt > 40) { if (++slow > 45 && dpr > 1) { dpr = Math.max(1, dpr - .25); renderer.setPixelRatio(dpr); renderer.setSize(innerWidth, innerHeight, false); slow = 0; } } else slow = Math.max(0, slow - 1);
  mouse.sx += (mouse.x - mouse.sx) * .045; mouse.sy += (mouse.y - mouse.sy) * .045; par += (W.parallax - par) * .06;
  const f = W.baseFov + (rig.fov || 0); if (Math.abs(camera.fov - f) > .01) { camera.fov = f; camera.updateProjectionMatrix(); }
  camera.position.copy(rig.pos); camera.lookAt(rig.tgt);
  camera.translateX(mouse.sx * par); camera.translateY(-mouse.sy * par * .6);
  camera.lookAt(rig.tgt); if (rig.roll) camera.rotateZ(rig.roll);
  camera.updateMatrixWorld(); camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
  W._sky.position.copy(camera.position);
  // rooms only exist while you can see into them
  const inside = camera.position.z < FZ + 1 && Math.abs(camera.position.x) < TW / 2 + 1 && camera.position.y < TH;
  room.visible = !!cur && (open > .001 || inside);
  W._beacon.material.opacity = .35 + .65 * (Math.sin(t / 380) > .2 ? 1 : 0);
  for (const s of slots) {
    s.k = Math.max(1 - s.ready * s.on, s === cur ? open : 0);
    s.hole.material.uniforms.uK.value = s.k;
    s.poster.material.uniforms.uOn.value = s.on;
    s.rim.material.uniforms.uOn.value = s.on * (s === cur ? 1 - open : 1); s.rim.material.uniforms.uHi.value = s.hi;
  }
  renderer.render(scene, camera);
  syncCSS();
}
})();
