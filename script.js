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


  /* ---------- 1. GSAP text mask-reveal on a few key headlines ---------- */
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

  /* ---------- 2. GSAP perspective tilt-in for the prototype device strip ---------- */
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

  /* ---------- 3. Count-up animation for stat numbers ---------- */
  (function initCountUp(){
    var counters = document.querySelectorAll('.count-up');
    if (!counters.length) return;
    function animateCounter(el){
      var target = parseInt(el.dataset.target, 10) || 0;
      if (reduceMotion) { el.textContent = target; return; }
      var duration = 900;
      var start = null;
      function step(ts){
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    }
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  })();
})();
