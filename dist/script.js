const slides=[...document.querySelectorAll('.slide')], dots=[...document.querySelectorAll('.dots button')];
const weddingMusic=document.querySelector('#wedding-music');
const musicToggle=document.querySelector('#music-toggle');
const musicStatus=document.querySelector('#music-status');
if(weddingMusic) weddingMusic.volume=.4;

function syncMusicControl(){
 if(!weddingMusic || !musicToggle) return;
 const playing=!weddingMusic.paused;
 musicToggle.setAttribute('aria-pressed',String(playing));
 musicToggle.setAttribute('aria-label',playing?'Mute music':'Unmute music');
}
if(weddingMusic){
 weddingMusic.addEventListener('play',syncMusicControl);
 weddingMusic.addEventListener('pause',syncMusicControl);
}
if(musicToggle){
 musicToggle.addEventListener('click',async()=>{
  if(!weddingMusic) return;
  if(musicStatus) musicStatus.textContent='';
  if(!weddingMusic.paused){
   weddingMusic.pause();
   return;
  }
  musicToggle.disabled=true;
  try{await weddingMusic.play();}
  catch{if(musicStatus) musicStatus.textContent='Music could not start.';}
  finally{musicToggle.disabled=false;syncMusicControl();}
 });
}

// Preload all critical wedding images and handle initial loading screen
(function initLoadingScreen(){
 const loadingScreen = document.querySelector('#loading-screen');
 const progressBar = document.querySelector('#loader-bar');
 const percentEl = document.querySelector('#loader-percent');
 const statusEl = document.querySelector('#loader-status');
 const actionEl = document.querySelector('#loader-action');
 const progressArea = document.querySelector('#loader-progress-area');
 const openBtn = document.querySelector('#open-invitation-btn');

 if(!loadingScreen) return;
 document.body.classList.add('loading-locked');

 const imageUrls = [
  'assets/desktop-watercolor.webp',
  'assets/landing-roses.webp',
  'assets/couple-portrait.webp',
  'assets/couple-cutout.webp',
  'assets/mobile-landing-reference.webp',
  'assets/invitation-desktop.webp',
  'assets/invitation-mobile.webp',
  'assets/chapter/groom.webp',
  'assets/chapter/bride.webp',
  'assets/chapter/shared%20glare.webp',
  'assets/gallery/Cosy%20Couple%20Portrait%20Among%20Greenery.webp',
  'assets/gallery/Garden%20Couple%20Portrait.webp',
  'assets/gallery/Sunlit%20Affection%20Among%20Flowers.webp',
  'assets/gallery/Elegant%20Anime%20Wedding%20Portrait%20-%20Copy.webp',
  'assets/rsvp.webp'
 ];

 let loadedCount = 0;
 let displayedPercent = 0;
 let progressInterval = null;
 const total = imageUrls.length;

 function updateDisplay(targetPercent){
  clearInterval(progressInterval);
  progressInterval = setInterval(()=>{
   if(displayedPercent < targetPercent){
    displayedPercent++;
    if(percentEl) percentEl.textContent = `${displayedPercent}%`;
    if(progressBar) progressBar.style.width = `${displayedPercent}%`;
   } else {
    clearInterval(progressInterval);
    if(displayedPercent >= 100){
     onLoadingComplete();
    }
   }
  }, 10);
 }

 function onLoadingComplete(){
  if(statusEl) statusEl.textContent = 'Invitation Ready';
  if(progressArea) progressArea.classList.add('progress-done');
  if(actionEl){
   actionEl.hidden = false;
   actionEl.classList.add('is-ready');
  }
 }

 function onImageLoaded(){
  loadedCount++;
  const target = Math.min(100, Math.round((loadedCount / total) * 100));
  updateDisplay(target);
 }

 imageUrls.forEach(url => {
  const img = new Image();
  img.onload = onImageLoaded;
  img.onerror = onImageLoaded;
  img.src = url;
 });

 // Fallback in case of network delays
 setTimeout(()=>{
  if(displayedPercent < 100){
   updateDisplay(100);
  }
 }, 6000);

 if(openBtn){
  openBtn.addEventListener('click', async ()=>{
   if(weddingMusic){
    try {
     await weddingMusic.play();
     syncMusicControl();
    } catch(e) {
     console.log('Audio playback:', e);
    }
   }
   loadingScreen.classList.add('fade-out');
   document.body.classList.remove('loading-locked');
   setTimeout(()=>{
    loadingScreen.style.display = 'none';
   }, 800);
  });
 }
})();
// Reveal once on entry; content stays visible without JavaScript or motion support.
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const portraitFrame=document.querySelector('.hero-art');
const portraitImage=portraitFrame?portraitFrame.querySelector('img'):null;
if(portraitFrame && portraitImage && !motionPreference.matches && 'IntersectionObserver' in window){
 let portraitVisible=false,portraitLoaded=portraitImage.complete,portraitDone=false;
 const revealPortrait=()=>{
  if(portraitDone || !portraitVisible || !portraitLoaded)return;
  portraitDone=true;
  portraitFrame.classList.remove('portrait-waiting');
  portraitFrame.classList.add('portrait-revealed');
  portraitObserver.disconnect();
 };
 const portraitObserver=new IntersectionObserver(entries=>{
  portraitVisible=entries.some(entry=>entry.isIntersecting);
  revealPortrait();
 },{threshold:.15});
 portraitFrame.classList.add('portrait-waiting');
 portraitObserver.observe(portraitFrame);
 portraitImage.addEventListener('load',()=>{portraitLoaded=true;revealPortrait();},{once:true});
 portraitImage.addEventListener('error',()=>{portraitFrame.classList.remove('portrait-waiting');portraitObserver.disconnect();},{once:true});
 motionPreference.addEventListener('change',event=>{
  if(event.matches){portraitDone=true;portraitObserver.disconnect();portraitFrame.classList.remove('portrait-waiting','portrait-revealed');}
 });
}
if(!motionPreference.matches && 'IntersectionObserver' in window){
 const revealTargets=document.querySelectorAll('.invitation > *, .chapter-section > *, .glance-section > *, .section-heading, .programme article, .programme-footer, .slideshow, .rsvp-intro, .rsvp-seal-wrap, footer > *');
 const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}
 }),{threshold:.08});
 revealTargets.forEach((element,index)=>{
  element.style.setProperty('--reveal-delay',`${index%3*70}ms`);
  element.classList.add('motion-ready');revealObserver.observe(element);
 });
 motionPreference.addEventListener('change',event=>{
  if(event.matches){revealObserver.disconnect();revealTargets.forEach(element=>element.classList.add('is-visible'));}
 });
 document.addEventListener('focusin',event=>event.target.closest('.motion-ready')?.classList.add('is-visible'));
}
let current=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,timer;
function getSlides(){return [...document.querySelectorAll('.slides .slide')];}
function showSlide(index){
 const allSlides=getSlides();
 if(!allSlides.length)return;
 current=(index+allSlides.length)%allSlides.length;
 allSlides.forEach((slide,i)=>{
  if(i===current){
   slide.hidden=false;
   slide.removeAttribute('hidden');
   slide.classList.add('active');
  }else{
   slide.hidden=true;
   slide.setAttribute('hidden','');
   slide.classList.remove('active');
  }
 });
}
function restart(){
 clearInterval(timer);
 if(!paused)timer=setInterval(()=>showSlide(current+1),6000);
}
window.showPrevSlide=function(e){if(e)e.preventDefault();showSlide(current-1);restart();};
window.showNextSlide=function(e){if(e)e.preventDefault();showSlide(current+1);restart();};
const prevBtn=document.querySelector('#prev');if(prevBtn)prevBtn.onclick=window.showPrevSlide;
const nextBtn=document.querySelector('#next');if(nextBtn)nextBtn.onclick=window.showNextSlide;
let startX=0;const slidesContainer=document.querySelector('.slides');
if(slidesContainer){
 slidesContainer.addEventListener('touchstart',e=>startX=e.changedTouches[0].clientX,{passive:true});
 slidesContainer.addEventListener('touchend',e=>{
  const delta=e.changedTouches[0].clientX-startX;
  if(Math.abs(delta)>50){showSlide(current+(delta<0?1:-1));restart();}
 },{passive:true});
}
restart();
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInterval(timer);else restart()});
const form=document.querySelector('#rsvp-form'),guestCount=document.querySelector('#guests');
const rsvpDialog=document.querySelector('#rsvp-dialog');
document.querySelector('#open-rsvp').onclick=()=>{rsvpDialog.showModal();document.body.classList.add('dialog-open');};
document.querySelector('#close-rsvp').onclick=()=>rsvpDialog.close();
rsvpDialog.addEventListener('close',()=>document.body.classList.remove('dialog-open'));
rsvpDialog.addEventListener('click',event=>{const rect=rsvpDialog.getBoundingClientRect();if(event.target===rsvpDialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))rsvpDialog.close();});
form.addEventListener('change',()=>{guestCount.disabled=form.elements.attendance.value==='Regretfully declines';document.querySelector('#rsvp-result').hidden=true});
form.addEventListener('input',()=>document.querySelector('#rsvp-result').hidden=true);
let reply='';form.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(form),name=data.get('name').trim();if(!name){document.querySelector('#guest-name').setCustomValidity('Please enter your name.');document.querySelector('#guest-name').reportValidity();return}const accepts=data.get('attendance')==='Joyfully accepts';reply=`Wedding RSVP — Vijay & Angel\nJanuary 4\n\nName: ${name}\n${data.get('attendance')}${accepts?`\nGuests (including me): ${data.get('guests')}`:''}${data.get('message').trim()?`\n\n${data.get('message').trim()}`:''}`;document.querySelector('#reply-text').textContent=reply;document.querySelector('#rsvp-result').hidden=false;document.querySelector('#reply-status').textContent='';});
document.querySelector('#guest-name').addEventListener('input',e=>e.target.setCustomValidity(''));
document.querySelector('#copy-reply').onclick=async()=>{try{await navigator.clipboard.writeText(reply);document.querySelector('#reply-status').textContent='Reply copied. Paste it into a message to the family.'}catch{document.querySelector('#reply-status').textContent='Select and copy the reply above to send it to the family.'}};
document.querySelector('#share-reply').onclick=async()=>{if(navigator.share){try{await navigator.share({title:'Wedding RSVP — Vijay & Angel',text:reply});}catch(e){if(e.name!=='AbortError')document.querySelector('#reply-status').textContent='Please copy your reply and send it to the family.'}}else{window.open('https://wa.me/?text='+encodeURIComponent(reply),'_blank','noopener,noreferrer');}};

// Fixed ceremony instant in India time, independent of the visitor's timezone.
const weddingCountdown=document.querySelector('.rsvp-countdown');
if(weddingCountdown){
 const weddingInstant=Date.parse(weddingCountdown.dataset.weddingDate);
 const fields=['days','hours','minutes','seconds'].map(unit=>weddingCountdown.querySelector('[data-unit="'+unit+'"]'));
 let countdownInterval;
 function updateWeddingCountdown(){
  const remaining=Math.max(0,Math.ceil((weddingInstant-Date.now())/1000));
  const values=[Math.floor(remaining/86400),Math.floor(remaining/3600)%24,Math.floor(remaining/60)%60,remaining%60];
  fields.forEach((field,index)=>{field.textContent=String(values[index]).padStart(2,'0');});
  if(remaining===0){
   clearInterval(countdownInterval);
   weddingCountdown.nextElementSibling.hidden=false;
  }
 }
 countdownInterval=setInterval(updateWeddingCountdown,1000);
 updateWeddingCountdown();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateWeddingCountdown();});
}
