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
 if('IntersectionObserver' in window){const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){nav.forEach(a=>a.removeAttribute('aria-current'));nav.find(a=>a.hash==='#'+e.target.id)?.setAttribute('aria-current','location')}}),{rootMargin:'-10% 0px -50% 0px'});nav.forEach(a=>{const sec=document.querySelector(a.hash);if(sec)obs.observe(sec)})}
 const buttons=[...document.querySelectorAll('.screen-zoom')];if(!buttons.length)return;
 const dialog=document.createElement('dialog');dialog.className='image-dialog';dialog.setAttribute('aria-labelledby','screen-title');dialog.innerHTML='<button class="dialog-close" type="button">סגירה</button><h2 id="screen-title">מסך מתוך אב הטיפוס</h2><figure><img alt=""><figcaption></figcaption></figure>';
 document.body.append(dialog);let opener;
 buttons.forEach(b=>b.addEventListener('click',()=>{opener=b;dialog.querySelector('img').src=b.dataset.image;dialog.querySelector('img').alt='מסך אב טיפוס: '+b.dataset.caption;dialog.querySelector('figcaption').textContent=b.dataset.caption;dialog.showModal()}));
 dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>opener?.focus());
})();

// Foreground depth: restrained pointer response and a single entrance per card.
(()=>{const cards=document.querySelectorAll('#solution .flow-step,#journey .journey-callout .card');const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('no-motion');const fine=matchMedia('(hover: hover) and (pointer: fine)');const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){if(!reduced())entry.target.classList.add('depth-enter');observer.unobserve(entry.target)}},{threshold:.18}):null;cards.forEach(card=>{observer?.observe(card);card.addEventListener('pointermove',e=>{if(reduced()||!fine.matches)return;const r=card.getBoundingClientRect();card.style.setProperty('--depth-x',`${(0.5-(e.clientY-r.top)/r.height)*5}deg`);card.style.setProperty('--depth-y',`${((e.clientX-r.left)/r.width-0.5)*5}deg`)});card.addEventListener('pointerleave',()=>{card.style.removeProperty('--depth-x');card.style.removeProperty('--depth-y')})})})();

// Animate visible star fields only; preferences and reduced-motion remain authoritative.
(()=>{const surfaces=document.querySelectorAll('section[data-theme="dark"],.site-footer');if(!('IntersectionObserver' in window))return;const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('galaxy-active',entry.isIntersecting)),{rootMargin:'60px'});surfaces.forEach(surface=>observer.observe(surface))})();
