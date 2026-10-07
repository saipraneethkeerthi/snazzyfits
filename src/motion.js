import {useEffect} from 'react';

const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));

// One passive scroll listener and one queued frame for the entire scene.
// No scroll interception, timers driving motion, or React renders on scroll.
export function useMotionScene(path,products){
 useEffect(()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let teardown=()=>{};
  const setup=()=>{
   teardown();
   const targets=[...document.querySelectorAll('[data-reveal],.section-heading,.review-section,.newsletter>div')];
   const hero=document.querySelector('.hero');
   const parallax=[...document.querySelectorAll('[data-parallax]')];
   const story=document.querySelector('.story');
   const steps=[...document.querySelectorAll('.story-step')];
   const cleanupStyles=()=>{
    hero?.style.removeProperty('--hero-progress');
    parallax.forEach(node=>node.style.removeProperty('--parallax-y'));
    steps.forEach(node=>node.classList.remove('story-active','story-past'));
    story?.classList.remove('story-motion');
    const caption=story?.querySelector('.story-image-label');
    if(caption)caption.textContent='SNAZZYFITS / EVERYDAY, YOUR WAY.';
   };
   if(reduced.matches||!('IntersectionObserver' in window)){
    targets.forEach(node=>{node.classList.remove('motion-ready');node.classList.add('visible');});cleanupStyles();teardown=cleanupStyles;return;
   }
   const reveal=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('visible');reveal.unobserve(entry.target);}
   },{threshold:.08,rootMargin:'0px 0px -24px 0px'});
   targets.forEach(node=>{
    if(!node.hasAttribute('data-reveal'))node.setAttribute('data-reveal','fade');
    const grid=node.parentElement;
    if(grid?.matches('.product-grid,.category-grid,.style-grid')){
     const columnCount=innerWidth<=800?2:4;
     const index=[...grid.children].indexOf(node)%columnCount;
     node.style.setProperty('--delay',`${index*55}ms`);
    }
    // Already-revealed content never replays when sorting or saving a product.
    if(!node.classList.contains('visible')){node.classList.add('motion-ready');reveal.observe(node);}
   });
   const revealFocused=e=>{
    let node=e.target;
    while(node instanceof Element){if(node.matches('[data-reveal]')){node.classList.add('visible');reveal.unobserve(node);}node=node.parentElement;}
   };
   document.addEventListener('focusin',revealFocused);
   let frame=0;
   const paint=()=>{
    frame=0;
    if(document.hidden)return;
    if(hero){const bounds=hero.getBoundingClientRect();const progress=clamp(-bounds.top/bounds.height,0,1);hero.style.setProperty('--hero-progress',progress.toFixed(4));}
    for(const node of parallax){
     const bounds=node.getBoundingClientRect();
     if(bounds.bottom<0||bounds.top>innerHeight)continue;
     // Total travel is 20px (±10px), including narrow screens.
     const progress=clamp((innerHeight-bounds.top)/(innerHeight+bounds.height),0,1);
     node.style.setProperty('--parallax-y',`${((progress-.5)*20).toFixed(2)}px`);
    }
    if(story&&steps.length){
     const desktop=innerWidth>600;
     story.classList.toggle('story-motion',desktop);
     let active=0;
     if(desktop){
      const focal=innerHeight*.52;
      let distance=Infinity;
      steps.forEach((step,i)=>{const r=step.getBoundingClientRect();const d=Math.abs(r.top+r.height*.5-focal);if(d<distance){distance=d;active=i;}});
     }
     steps.forEach((step,i)=>{step.classList.toggle('story-active',desktop&&i===active);step.classList.toggle('story-past',desktop&&i<active);});
     if(desktop){const label=steps[active].querySelector('span')?.textContent;const caption=story.querySelector('.story-image-label');if(caption&&caption.textContent!==label)caption.textContent=label;}
     else{const caption=story.querySelector('.story-image-label');if(caption)caption.textContent='SNAZZYFITS / EVERYDAY, YOUR WAY.';}
    }
   };
   const queue=()=>{if(!frame)frame=requestAnimationFrame(paint);};
   window.addEventListener('scroll',queue,{passive:true});
   window.addEventListener('resize',queue,{passive:true});
   document.addEventListener('visibilitychange',queue);
   queue();
   teardown=()=>{
    reveal.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',queue);window.removeEventListener('resize',queue);document.removeEventListener('visibilitychange',queue);document.removeEventListener('focusin',revealFocused);targets.forEach(node=>{node.classList.remove('motion-ready');node.classList.add('visible');});cleanupStyles();
   };
  };
  setup();reduced.addEventListener('change',setup);
  return()=>{reduced.removeEventListener('change',setup);teardown();};
 },[path,products]);
}
