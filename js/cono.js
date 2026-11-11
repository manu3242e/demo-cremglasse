// Cono a cialda 3D costruito a codice (niente modelli, niente texture): cialda con la griglia incrociata, bordo arrotolato,
// tre palline (fiordilatte, pistacchio, lampone laccato nel colore del brand) con la gonna mantecata, un lampone e la paletta d'oro.
// All'apertura il cono sale con un rimbalzo e le palline cadono una alla volta e si impilano; poi gira con lo scroll ed esce dalla hero.
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.getElementById('gl');
const foto = document.documentElement.classList.contains('foto');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true, powerPreference: 'high-performance'});
} catch (e) {
  document.documentElement.classList.add('no-gl');
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
const camera = new THREE.PerspectiveCamera(30, 1, .1, 50);
camera.position.set(0, 0, 7);

const key = new THREE.DirectionalLight(0xfff1dc, 2.4); key.position.set(-3, 4, 5); scene.add(key);
const contro = new THREE.DirectionalLight(0x8fb5a8, 2.2); contro.position.set(4, 1, -4); scene.add(contro);
const caldo = new THREE.PointLight(0xc41645, 5, 7); caldo.position.set(1.4, -1.4, 1.4); scene.add(caldo);
scene.add(new THREE.AmbientLight(0xffffff, .3));

/* ---------- materiali ---------- */
const cialda = new THREE.MeshStandardMaterial({color: 0xd9a35e, roughness: .72, metalness: 0});
const cialdaScura = new THREE.MeshStandardMaterial({color: 0xa86b2c, roughness: .8, metalness: 0});
const fiordilatte = new THREE.MeshPhysicalMaterial({color: 0xf6ead6, roughness: .55, clearcoat: .2, clearcoatRoughness: .6});
const pistacchio = new THREE.MeshPhysicalMaterial({color: 0xa9b46a, roughness: .55, clearcoat: .2, clearcoatRoughness: .6});
const lampone = new THREE.MeshPhysicalMaterial({color: 0xc41645, roughness: .22, metalness: .15, clearcoat: 1, clearcoatRoughness: .12, envMapIntensity: 1.4});
const frutto = new THREE.MeshPhysicalMaterial({color: 0xb0123a, roughness: .35, clearcoat: .8});
const oro = new THREE.MeshStandardMaterial({color: 0xbc9b62, roughness: .25, metalness: 1, envMapIntensity: 1.3});

const gelato = new THREE.Group();   // posizione e scala
const giro = new THREE.Group();     // rotazione sull'asse
const corpo = new THREE.Group();    // centrato sull'altezza totale
gelato.add(giro); giro.add(corpo); scene.add(gelato);

/* ---------- cono: tip a y=-1.6, bocca a y=0 con raggio .52 ---------- */
const H = 1.6, RB = .52;
const cono = new THREE.Group(); corpo.add(cono);
const geoCono = new THREE.ConeGeometry(RB, H, 64, 1, true); geoCono.rotateX(Math.PI); geoCono.translate(0, -H / 2, 0);
cono.add(new THREE.Mesh(geoCono, cialda));
// griglia incrociata: eliche sulla superficie
const punto = (t, a) => new THREE.Vector3(Math.cos(a) * RB * t * 1.012, -H + H * t, Math.sin(a) * RB * t * 1.012);
for (const verso of [1, -1]) for (let i = 0; i < 14; i++) {
  const a0 = i / 14 * Math.PI * 2, pts = [];
  for (let k = 0; k <= 24; k++) { const t = .04 + k / 24 * .95; pts.push(punto(t, a0 + verso * t * 2.4)); }
  cono.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .011, 5), cialdaScura));
}
const bordo = new THREE.Mesh(new THREE.TorusGeometry(RB + .01, .05, 16, 96), cialda); bordo.rotation.x = Math.PI / 2; cono.add(bordo);

/* ---------- palline con la gonna mantecata ---------- */
function pallina(r, mat, seme) {
  const g = new THREE.SphereGeometry(r, 72, 54), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const a = Math.atan2(v.z, v.x), y = v.y / r;
    let d = Math.sin(v.x * 9 + seme) * Math.cos(v.z * 8 - seme) * .022 + Math.sin(v.y * 13 + a * 3 + seme) * .014;
    if (y < -.15) d += (Math.sin(a * 9 + seme) * .5 + .5) * .09 * Math.min(1, (-y - .15) * 2.2);   // gonna ondulata
    v.multiplyScalar(1 + d);
    if (y < -.55) v.y = -r * .55 + (v.y + r * .55) * .35;   // base schiacciata sul cono
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return new THREE.Mesh(g, mat);
}
const PALLINE = [
  {m: pallina(.56, fiordilatte, 1), y: .3, r: .56},
  {m: pallina(.48, pistacchio, 2.3), y: .86, r: .48},
  {m: pallina(.41, lampone, 4.1), y: 1.33, r: .41}
];
PALLINE.forEach((b, i) => { b.m.rotation.y = i * 1.3; b.m.position.y = b.y; corpo.add(b.m); });
// lampone in cima: drupeole istanziate
const lamponeFrutto = new THREE.Group();
const geoD = new THREE.SphereGeometry(.034, 12, 10), N_D = 46;
const drupe = new THREE.InstancedMesh(geoD, frutto, N_D), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s1 = new THREE.Vector3(1, 1, 1);
for (let i = 0; i < N_D; i++) {
  const y = 1 - (i / (N_D - 1)) * 2, rr = Math.sqrt(1 - y * y), a = i * 2.39996;
  drupe.setMatrixAt(i, m4.compose(new THREE.Vector3(Math.cos(a) * rr * .1, y * .12, Math.sin(a) * rr * .1), q, s1));
}
lamponeFrutto.add(drupe); lamponeFrutto.position.set(.06, 1.33 + .41 + .06, .05); lamponeFrutto.rotation.z = .3; corpo.add(lamponeFrutto);
// paletta d'oro infilata nella pallina di mezzo
const paletta = new THREE.Group();
const manico = new THREE.Mesh(new THREE.BoxGeometry(.05, .62, .012), oro); manico.position.y = .31; paletta.add(manico);
const pala = new THREE.Mesh(new THREE.CylinderGeometry(.075, .075, .012, 32), oro); pala.rotation.x = Math.PI / 2; pala.scale.set(1, 1.35, 1); paletta.add(pala);
paletta.position.set(.3, .95, .2); paletta.rotation.set(.2, .5, -.55); corpo.add(paletta);

corpo.position.y = -(1.33 + .41 - H) / 2 - .05;   // centro dell'altezza totale su y=0

/* ---------- impaginazione e animazione ---------- */
let W = 0, Hh = 0, mobile = false;
function misura() {
  W = innerWidth; Hh = innerHeight; mobile = W / Hh < .95;
  renderer.setSize(W, Hh, false);
  camera.aspect = W / Hh; camera.updateProjectionMatrix();
}
addEventListener('resize', misura); misura();

const ridotto = foto || matchMedia('(prefers-reduced-motion: reduce)').matches;
let tApertura = null, mx = 0, my = 0, tx = 0, ty = 0, angolo = 0;
addEventListener('apertura', () => tApertura = performance.now());
if (window.APERTO) tApertura = performance.now();   // caricato dopo l'apertura: si monta subito
addEventListener('mousemove', e => { mx = e.clientX / W - .5; my = e.clientY / Hh - .5; });
const eo = t => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
const rimbalzo = t => { t = Math.min(Math.max(t, 0), 1); const n = 7.5625, d = 2.75;
  if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; };
const elastico = t => { t = Math.min(Math.max(t, 0), 1); return t === 0 || t === 1 ? t : Math.pow(2, -9 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI / 3)) + 1; };

cono.scale.setScalar(.0001); PALLINE.forEach(b => b.m.visible = false); lamponeFrutto.visible = paletta.visible = false;
let ultimo = performance.now(), primo = true;
function frame(t) {
  requestAnimationFrame(frame);
  const dt = Math.min((t - ultimo) / 1000, .05); ultimo = t;
  const S = window.SCROLL || {y: 0, v: 0};
  const hp = S.y / Hh;
  if (hp > 1.25 && !primo) { canvas.style.opacity = 0; return; }
  canvas.style.opacity = String(Math.max(0, 1 - Math.max(0, hp - .75) * 2.2));

  // apertura: il cono sale, le palline cadono e si impilano con uno schiacciamento
  if (tApertura || ridotto) {
    const k = ridotto ? 10 : (t - tApertura) / 1000;
    cono.scale.setScalar(Math.max(.0001, elastico(k / .9)));
    PALLINE.forEach((b, i) => {
      const p = (k - .45 - i * .32) / .6;
      b.m.visible = p > 0;
      b.m.position.y = b.y + (1 - rimbalzo(p)) * 3.2;
      const sq = p > .3 && p < 1 ? Math.sin((p - .3) / .7 * Math.PI) * .12 : 0;
      b.m.scale.set(1 + sq, 1 - sq, 1 + sq);
    });
    const pf = (k - 1.65) / .5;
    lamponeFrutto.visible = pf > 0; lamponeFrutto.scale.setScalar(Math.max(.0001, elastico(pf)));
    const pp = (k - 1.85) / .6;
    paletta.visible = pp > 0; paletta.scale.setScalar(Math.max(.0001, eo(pp)));
  }

  // a destra su desktop, in alto sul telefono (dalla mezza larghezza/altezza visibile della camera)
  const mezzaH = 1.876, mezzaW = mezzaH * (W / Hh);
  const base = mobile
    ? {x: .1, y: mezzaH * .47, s: Math.min(.5, mezzaW * .42)}
    : {x: Math.max(1.1, mezzaW * .52), y: -.22, s: Math.min(.8, mezzaW * .25)};
  const esce = hp * (mobile ? 2.2 : 3.0);
  gelato.position.set(base.x + esce, base.y - hp * .25, 0);
  gelato.scale.setScalar(base.s);
  tx += (mx - tx) * .05; ty += (my - ty) * .05;
  gelato.rotation.z = -.12 - tx * .12 - hp * .5;
  gelato.rotation.x = .16 + ty * .18;

  angolo += dt * (ridotto ? 0 : .4) + Math.abs(S.v) * dt * 2;
  giro.rotation.y = angolo + tx * .6;

  renderer.render(scene, camera);
  primo = false;
}
requestAnimationFrame(frame);
