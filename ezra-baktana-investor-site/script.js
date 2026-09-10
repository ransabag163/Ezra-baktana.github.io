const bar = document.getElementById('progress-bar');
  function onScroll(){
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    bar.style.width = scrolled + '%';
  }
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  const headerEl = document.getElementById('top');
  const heroEl = document.getElementById('hero');

  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); } });
  }, {threshold:0.12});
  revealEls.forEach(el=>revealObserver.observe(el));

  const journeySvg = document.getElementById('journey-svg');
  const journeyObserver = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ journeySvg.classList.add('in'); } });
  }, {threshold:0.3});
  journeyObserver.observe(journeySvg);

  const sections = document.querySelectorAll('section[data-theme]');
  const dotnav = document.getElementById('dotnav');
  sections.forEach((sec)=>{
    const b = document.createElement('button');
    b.dataset.target = sec.id;
    if(sec.dataset.theme==='dark') b.classList.add('on-dark');
    b.addEventListener('click', ()=> sec.scrollIntoView({behavior:'smooth'}));
    dotnav.appendChild(b);
  });
  const dotButtons = dotnav.querySelectorAll('button');
  const sectionObserver = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        dotButtons.forEach(b=>b.classList.toggle('active', b.dataset.target===e.target.id));
      }
    });
  }, {threshold:0.5});
  sections.forEach(s=>sectionObserver.observe(s));

  document.getElementById('hero-cta').addEventListener('click', ()=>{
    document.getElementById('problem').scrollIntoView({behavior:'smooth'});
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduceMotion){
    document.addEventListener('scroll', ()=>{
      const y = window.scrollY;
      if(y < window.innerHeight){
        heroEl.querySelectorAll('.orb').forEach((orb,i)=>{ orb.style.transform = `translateY(${y * (0.08 + i*0.02)}px)`; });
      }
    }, {passive:true});

    const stage = document.getElementById('hero-stage');
    const stageInner = document.getElementById('stage-inner');
    if(stage && window.matchMedia('(min-width:960px)').matches){
      stage.addEventListener('mousemove', (e)=>{
        const r = stage.getBoundingClientRect();
        const px = (e.clientX - r.left)/r.width - 0.5;
        const py = (e.clientY - r.top)/r.height - 0.5;
        stageInner.style.transform = `rotateY(${px*14}deg) rotateX(${-py*14}deg)`;
      });
      stage.addEventListener('mouseleave', ()=>{ stageInner.style.transform = 'rotateY(0deg) rotateX(0deg)'; });
    }
  }



(function(){
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Real 3D hero (Three.js) ---------- */
  (function initHero3D(){
    if (reduceMotion) return;
    if (typeof THREE === 'undefined') return;

    var stage = document.getElementById('hero-stage');
    var canvas = document.getElementById('hero-3d-canvas');
    var fallback = document.getElementById('stage-inner');
    if (!stage || !canvas || !fallback) return;

    try {
      var homeImg = fallback.querySelector('img[data-key="SHOT_HOME"]');
      var chatImg = fallback.querySelector('img[data-key="SHOT_CHAT"]');
      if (!homeImg || !chatImg || !homeImg.src || !chatImg.src) return;

      var W = stage.clientWidth, H = stage.clientHeight;
      if (W < 10 || H < 10) return;

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(32, W / H, 0.1, 100);
      camera.position.set(0, 0, 9);

      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(W, H, false);

      scene.add(new THREE.AmbientLight(0xffffff, 1.0));
      var key = new THREE.DirectionalLight(0xffffff, 0.5);
      key.position.set(2, 3, 4);
      scene.add(key);

      var loader = new THREE.TextureLoader();
      function makePlane(src, w, h) {
        var tex = loader.load(src, function () { renderer.render(scene, camera); });
        if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
        else tex.encoding = 3001; /* sRGBEncoding fallback for older three builds */
        var mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.55, metalness: 0.05 });
        return new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      }

      var back = makePlane(chatImg.src, 2.05, 4.1);
      back.position.set(1.05, 0.55, -1.1);
      back.rotation.y = 0.24;
      back.rotation.z = 0.05;
      back.material.opacity = 0.65;
      scene.add(back);

      var front = makePlane(homeImg.src, 2.35, 4.55);
      front.position.set(-0.55, -0.35, 1.0);
      front.rotation.y = -0.2;
      front.rotation.z = -0.05;
      scene.add(front);

      var baseFrontY = front.rotation.y, baseBackY = back.rotation.y;
      var mouseX = 0, mouseY = 0;
      stage.addEventListener('mousemove', function (e) {
        var r = stage.getBoundingClientRect();
        mouseX = (e.clientX - r.left) / r.width - 0.5;
        mouseY = (e.clientY - r.top) / r.height - 0.5;
      });
      stage.addEventListener('mouseleave', function () { mouseX = 0; mouseY = 0; });

      var scrollProgress = 0;
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.create({
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: function (self) { scrollProgress = self.progress; }
        });
      }

      var running = true, rafId = null;
      function animate() {
        if (!running) return;
        rafId = requestAnimationFrame(animate);
        var t = Date.now() * 0.00018;
        front.rotation.y = baseFrontY + mouseX * 0.3 + Math.sin(t) * 0.015;
        front.rotation.x = mouseY * 0.18;
        back.rotation.y = baseBackY + mouseX * 0.16;
        camera.position.z = 9 - scrollProgress * 3;
        camera.position.y = scrollProgress * 0.5;
        renderer.render(scene, camera);
      }

      var vis = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          running = en.isIntersecting;
          if (running && rafId === null) animate();
          if (!running && rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
        });
      }, { threshold: 0.01 });
      vis.observe(stage);

      window.addEventListener('resize', function () {
        var w = stage.clientWidth, h = stage.clientHeight;
        if (w < 10 || h < 10) return;
        camera.aspect = w / h; camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      });

      renderer.render(scene, camera);
      canvas.classList.add('active');
      animate();
    } catch (err) {
      /* Any WebGL failure: canvas simply stays hidden and the static fallback (already
         visible by default) continues to display normally. */
      if (window.console) console.warn('Hero 3D scene unavailable, using static fallback.', err);
    }
  })();

  /* ---------- 2. GSAP text mask-reveal on a few key headlines ---------- */
  (function initTextReveal(){
    if (reduceMotion) return;
    if (typeof gsap === 'undefined') return;
    var targets = document.querySelectorAll('.mask-reveal span');
    if (!targets.length) return;
    document.body.classList.add('gsap-ready');
    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
    targets.forEach(function (el) {
      gsap.to(el, {
        y: '0%',
        duration: 1.1,
        ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });
  })();

  /* ---------- 3. GSAP perspective tilt-in for the prototype device strip ---------- */
  (function initDeviceTiltIn(){
    if (reduceMotion) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    var devices = document.querySelectorAll('.device-strip .device');
    devices.forEach(function (el, i) {
      gsap.fromTo(el,
        { opacity: 0, y: 34, rotateY: (i % 2 === 0 ? -22 : 22), transformPerspective: 800 },
        {
          opacity: 1, y: 0, rotateY: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%' }
        }
      );
    });
  })();
})();
