'use strict';
(()=>{
 const reduced=()=>document.documentElement.classList.contains('no-motion')||matchMedia('(prefers-reduced-motion: reduce)').matches;

 const hero=document.getElementById('hero');const front=document.querySelector('.phone-front'),back=document.querySelector('.phone-back');let pending=false;
 function depth(){pending=false;if(!hero||!front||!back)return;if(reduced()||innerWidth<960){front.style.translate='';back.style.translate='';front.style.rotate='';back.style.rotate='';return}const rect=hero.getBoundingClientRect();if(rect.bottom<0)return;const progress=Math.max(0,Math.min(1,-rect.top/rect.height));front.style.translate=`0 ${-progress*65}px`;back.style.translate=`0 ${progress*40}px`;front.style.rotate=`${-progress*5}deg`;back.style.rotate=`${progress*4}deg`}
 addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(depth)}},{passive:true});addEventListener('resize',depth);new MutationObserver(depth).observe(document.documentElement,{attributes:true,attributeFilter:['class']});

 const conversation=document.querySelector('.floating-messages');
 if(conversation&&'IntersectionObserver' in window){const chatObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){if(!reduced())conversation.classList.add('chat-playing');chatObserver.disconnect()}},{threshold:.25});chatObserver.observe(conversation)}
 const journey=document.getElementById('journey-svg');
 if(journey&&'IntersectionObserver' in window){new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)journey.classList.add('in')}),{threshold:.1}).observe(journey)}
 document.querySelectorAll('.count-up').forEach(el=>{el.textContent=el.dataset.target});
 const nav=[...document.querySelectorAll('#top nav a[href^="#"]')];
 // Every section is watched, not only the four in the menu, so the highlight
 // leaves a link as soon as the reader scrolls past it instead of staying lit.
 if(nav.length&&'IntersectionObserver' in window){
  const sections=[...document.querySelectorAll('#main > section[id]')];
  const linkFor=sections.map(s=>nav.find(a=>a.hash==='#'+s.id)||null);
  const seen=new Set();let shown=null;
  const sync=()=>{
   let index=-1;
   for(let i=0;i<sections.length;i++)if(seen.has(sections[i]))index=i;
   let link=null;
   for(let i=index;i>=0;i--)if(linkFor[i]){link=linkFor[i];break}
   if(link===shown)return;
   shown=link;
   nav.forEach(a=>a===link?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));
  };
  const obs=new IntersectionObserver(entries=>{
   for(const e of entries)e.isIntersecting?seen.add(e.target):seen.delete(e.target);
   sync();
  },{rootMargin:'-15% 0px -55% 0px'});
  sections.forEach(s=>obs.observe(s));
 }
 const buttons=[...document.querySelectorAll('.screen-zoom')];if(!buttons.length)return;
 const dialog=document.createElement('dialog');dialog.className='image-dialog';dialog.setAttribute('aria-labelledby','screen-title');dialog.innerHTML='<button class="dialog-close" type="button">סגירה</button><h2 id="screen-title">מסך מתוך אב הטיפוס</h2><p class="image-status" role="status" aria-live="polite"></p><button class="image-retry" type="button" hidden>ניסיון נוסף</button><figure><img alt="" hidden><figcaption></figcaption></figure>';
 document.body.append(dialog);let opener;let request=0;
 const status=dialog.querySelector('.image-status'),retry=dialog.querySelector('.image-retry'),figure=dialog.querySelector('figure');
 function loadScreen(){
  const current=++request;const img=new Image();img.alt='מסך אב טיפוס: '+opener.dataset.caption;img.hidden=true;
  figure.querySelector('img').replaceWith(img);figure.setAttribute('aria-busy','true');retry.hidden=true;status.textContent='טוען את התמונה…';
  img.onload=()=>{if(current!==request)return;img.hidden=false;figure.setAttribute('aria-busy','false');status.textContent='התמונה מוכנה לצפייה';};
  img.onerror=()=>{if(current!==request)return;figure.setAttribute('aria-busy','false');status.textContent='לא הצלחנו לטעון את התמונה. אפשר לנסות שוב או לסגור ולחזור לגלריה.';retry.hidden=false;};
  img.src=opener.dataset.image;
 }
 buttons.forEach(b=>b.addEventListener('click',()=>{opener=b;dialog.querySelector('#screen-title').textContent=b.dataset.caption;dialog.querySelector('figcaption').textContent=b.dataset.caption;dialog.showModal();loadScreen()}));
 retry.addEventListener('click',loadScreen);
 dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>opener?.focus());
})();

// Animate visible star fields only; preferences and reduced-motion remain authoritative.
(()=>{const surfaces=document.querySelectorAll('section[data-theme="dark"],.site-footer');if(!('IntersectionObserver' in window))return;const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('galaxy-active',entry.isIntersecting)),{rootMargin:'60px'});surfaces.forEach(surface=>observer.observe(surface))})();
