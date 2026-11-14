(() => {
 if(!window.gsap || !window.ScrollTrigger)return;
 gsap.registerPlugin(ScrollTrigger);
 // phones: the address bar showing/hiding must not trigger a full recalculation (it made scrolling stutter)
 ScrollTrigger.config({ignoreMobileResize:true});
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
 let context;
 const progress=document.createElement('div');
 progress.className='reading-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
 const install=()=>{
  context?.revert();
  if(reduce)return;
  context=gsap.context(()=>{
   gsap.fromTo(progress,{scaleX:0},{scaleX:1,ease:'none',scrollTrigger:{start:0,end:()=>Math.max(1,document.documentElement.scrollHeight-innerHeight),scrub:.2,invalidateOnRefresh:true}});
   document.querySelectorAll('.section-head,.intro>div,.project-narrative>p,.studio-story>div,.cx-clients>.clients-frame').forEach(el=>{
    gsap.fromTo(el,{y:45,opacity:0},{y:0,opacity:1,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}});
   });
   document.querySelectorAll('.card,.archive-card,.project-gallery>button').forEach(el=>{
    fine?gsap.fromTo(el,{y:55,opacity:0,clipPath:'inset(12% 0 0 0)'},{y:0,opacity:1,clipPath:'inset(0% 0 0 0)',clearProps:'clipPath',duration:1.05,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 94%',once:true}}):gsap.fromTo(el,{y:30,opacity:0},{y:0,opacity:1,clearProps:'transform,opacity',duration:.7,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 96%',once:true}}); // phones: no clip-path on cards with video, it made scrolling stutter
   });
   document.querySelectorAll('.services-list>details').forEach((el,i)=>{
    gsap.fromTo(el,{x:-25,opacity:0},{x:0,opacity:1,duration:.6,delay:(i%3)*.07,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 94%',once:true}});
   });
   if(fine){
    document.querySelectorAll('.card-media img,.card-media video').forEach(el=>{
     gsap.fromTo(el,{yPercent:-4,scale:1.12},{yPercent:4,scale:1.12,ease:'none',scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:.7}});
    });
   }
   gsap.fromTo('.footer-cta',{y:65,opacity:0},{y:0,opacity:1,duration:1,ease:'power3.out',scrollTrigger:{trigger:'footer',start:'top 85%',once:true}});
  });
  ScrollTrigger.refresh();
 };
 // Rebuild effects when the single-page navigation replaces its content.
 new MutationObserver(()=>requestAnimationFrame(install)).observe(document.querySelector('main'),{childList:true});
 // A refresh while the finger-flick is still scrolling stops the scroll on phones ("the page locks"):
 // recalculations wait until scrolling has been still for a moment, and photos in fixed-size frames need none.
 let lastScroll=0,rt=0;addEventListener('scroll',()=>{lastScroll=performance.now()},{passive:true});
 const softRefresh=()=>{clearTimeout(rt);rt=setTimeout(function wait(){if(performance.now()-lastScroll<450){rt=setTimeout(wait,250);return}ScrollTrigger.refresh()},250)};
 document.addEventListener('toggle',softRefresh,true);
 window.addEventListener('load',softRefresh);
 let wasLoading=true;new MutationObserver(()=>{const l=document.body.classList.contains('is-loading');if(wasLoading&&!l)softRefresh();wasLoading=l}).observe(document.body,{attributes:true,attributeFilter:['class']});
 document.addEventListener('load',e=>{const t=e.target;if(t.tagName==='IMG'&&!t.closest('.card-media,.archive-media,.clients-crop'))softRefresh()},true);
 install();
})();
