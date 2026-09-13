'use strict';
(() => {
 const root=document.documentElement;
 const chrome=document.querySelector('.site-chrome');
 if(chrome){const updateChrome=()=>root.style.setProperty('--chrome-height',chrome.getBoundingClientRect().height+'px');updateChrome();if('ResizeObserver' in window)new ResizeObserver(updateChrome).observe(chrome);else addEventListener('resize',updateChrome)}
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 const key='ezra-accessibility-v1';
 let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{}
 let prefs={motion:typeof saved.motion==='boolean'?saved.motion:null,contrast:saved.contrast===true,large:saved.large===true};
 const reduced=()=>media.matches||prefs.motion===true;
 const panel=document.createElement('dialog');panel.id='access-panel';panel.setAttribute('aria-labelledby','access-title');
 panel.innerHTML=`<button class="dialog-close" data-close>סגירה</button><h2 id="access-title">נוח לך יותר ככה?</h2><p>התאימו את הקריאה והתנועה. ההעדפות נשמרות בדפדפן הזה בלבד.</p><label><input id="motion-pref" type="checkbox">הפחתת תנועה ואפקטים</label><label><input id="contrast-pref" type="checkbox">ניגודיות מוגברת</label><label><input id="large-pref" type="checkbox">טקסט מוגדל</label><button class="text-button" id="reset-prefs">איפוס לברירות המחדל</button><p><a href="accessibility.html">הצהרת הנגישות</a> · <a href="privacy.html">פרטיות</a></p>`;
 document.body.append(panel);
 let opener;
 function apply(){root.classList.toggle('no-motion',reduced());root.classList.toggle('motion-on',!reduced());root.classList.toggle('high-contrast',prefs.contrast);root.classList.toggle('large-text',prefs.large);document.getElementById('motion-pref').checked=reduced();document.getElementById('motion-pref').disabled=media.matches;document.getElementById('contrast-pref').checked=prefs.contrast;document.getElementById('large-pref').checked=prefs.large;if(reduced()){document.querySelectorAll('.is-pending').forEach(e=>{e.classList.remove('is-pending');e.classList.add('in')});document.querySelectorAll('.stage-inner,.tilt').forEach(e=>e.style.transform='')}}
 function persist(){try{localStorage.setItem(key,JSON.stringify(prefs))}catch{}}
 apply();media.addEventListener('change',apply);
 document.querySelectorAll('[data-open="access-panel"]').forEach(b=>b.addEventListener('click',()=>{opener=b;panel.showModal()}));
 panel.querySelector('[data-close]').addEventListener('click',()=>panel.close());
 panel.addEventListener('close',()=>opener?.focus());
 ['motion','contrast','large'].forEach(k=>document.getElementById(k+'-pref').addEventListener('change',e=>{prefs[k]=e.target.checked;apply();persist()}));
 document.getElementById('reset-prefs').addEventListener('click',()=>{prefs={motion:null,contrast:false,large:false};try{localStorage.removeItem(key)}catch{}apply()});
 if('IntersectionObserver' in window){const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('is-pending');e.target.classList.add('in');obs.unobserve(e.target)}}),{threshold:.05});document.querySelectorAll('.reveal').forEach(e=>{if(!reduced())e.classList.add('is-pending');obs.observe(e)})}
 let scheduled=false;const bar=document.getElementById('progress-bar');
 function scroll(){scheduled=false;if(bar){const h=root.scrollHeight-innerHeight;bar.style.width=(h>0?scrollY/h*100:0)+'%'}}
 addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(scroll)}},{passive:true});scroll();
 document.getElementById('hero-cta')?.addEventListener('click',()=>{const e=document.getElementById('problem');e.setAttribute('tabindex','-1');e.focus({preventScroll:true});e.scrollIntoView({behavior:reduced()?'instant':'smooth'})});
 // Depth follows pointer input only; no endless animation, scroll hijacking or autoplay.
 function tilt(surface,target,range){let frame=0;surface.addEventListener('pointermove',e=>{if(reduced()||e.pointerType!=='mouse'||innerWidth<960)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(reduced())return;const r=surface.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;target.style.transform=`perspective(1200px) rotateX(${-y*range}deg) rotateY(${x*range}deg)`})});surface.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);target.style.transform=''})}
 const stage=document.getElementById('hero-stage');if(stage)tilt(stage,document.getElementById('stage-inner'),14);

 // Consent is intentionally not persisted or misrepresented as a server audit record.
 const form=document.getElementById('demo-consent');if(form){const accept=form.querySelector('#accept-demo'),go=form.querySelector('button[type=submit]');go.disabled=!accept.checked;accept.addEventListener('change',()=>go.disabled=!accept.checked);form.addEventListener('submit',e=>{e.preventDefault();if(!accept.checked){accept.focus();return}location.assign('https://ezra-baktana.netlify.app')})}
})();

(()=>{if(document.querySelector('#hero')||!('IntersectionObserver' in window))return;const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('galaxy-active',entry.isIntersecting)));document.querySelectorAll('.site-footer').forEach(e=>observer.observe(e))})();
