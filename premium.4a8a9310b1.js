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
