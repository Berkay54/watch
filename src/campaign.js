const pieces = [
  { name:'Skeleton', calibre:'Calibre 01', image:'/public/images/collection-gold.jpg', alt:'Skeleton watch with silver dial and warm metallic mechanism',
    movement:'Automatic movement', case:'42mm case', crystal:'Sapphire crystal',
    note:'An open view of mechanical precision. A study in structure, rhythm, and light.' },
  { name:'Nocturne', calibre:'Calibre 02', image:'/public/images/collection-steel.webp', alt:'Brushed steel watch with a charcoal dial and black leather strap',
    movement:'Mechanical movement', case:'40mm steel case', crystal:'Sapphire crystal',
    note:'A quiet expression in brushed steel. Charcoal, silver, and the measured passage of time.' },
  { name:'Patrimoine', calibre:'Calibre 03', image:'/public/images/collection-heritage.webp', alt:'Vintage ivory dial in a champagne gold case with a brown leather strap',
    movement:'Hand-wound movement', case:'38mm gold case', crystal:'Domed crystal',
    note:'An archive-inspired study. Warm ivory, a fine patina, and proportions made to endure.' },
];
export function initCampaign() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width:700px)');
  const stage = document.querySelector('.stage');
  const productStage = document.querySelector('.product-stage');
  const editorial = document.querySelector('.editorial-stage');
  const collection = document.querySelector('.collection');
  const field = document.querySelector('.gallery-field');
  const plates = document.querySelector('.gallery-plates');
  const craft = document.querySelector('.craft');
  const aperture = document.querySelector('.craft-aperture');
  const craftImage = aperture.querySelector('img');
  const closing = document.querySelector('.closing');
  const closingImage = document.querySelector('.closing-product img');
  const announcement = document.querySelector('.gallery-announcement');
  const detailNote = document.querySelector('#piece-note');
  const discover = document.querySelector('.piece-discover');
  const fields = ['.piece-index','.piece-name','.piece-calibre','.piece-movement','.piece-case','.piece-crystal'].map(s=>document.querySelector(s));
  const clamp = x=>Math.max(0,Math.min(1,x));
  const range = (x,a,b)=>clamp((x-a)/(b-a));
  const ease = x=>x*x*(3-2*x);
  let active=0, dragging=null, raf=0, width=innerWidth, height=innerHeight;
  let craftTop=0,closingTop=0,lastPhase=-1,lastReveal=-1,lastClosing=-1,textRevision=0;
  let transitioningUntil=0, suppressClickUntil=0;
  const nodes = pieces.map((piece,i)=>{
    const button=document.createElement('button');
    button.className='gallery-piece';
    button.type='button';
    button.dataset.piece=String(i);
    button.setAttribute('aria-label','Select '+piece.name);
    const image=document.createElement('img');
    image.src=piece.image;
    image.alt=piece.alt;
    image.loading='lazy';
    image.decoding='async';
    image.width=i===0?1600:1024;
    image.height=i===0?900:1536;
    image.draggable=false;
    button.append(image);
    plates.append(button);
    button.addEventListener('click',()=>{ if(!dragging && performance.now()>suppressClickUntil) select(i,false); });
    return button;
  });
  function offset(i){ return ((i-active+pieces.length+1)%pieces.length)-1; }
  function renderGallery(drag=0,instant=false) {
    const spacing=narrow.matches?width*.73:Math.min(width*.32,440);
    nodes.forEach((node,i)=>{
      const d=offset(i);
      node.style.transition=instant||reduced.matches?'none':'transform 720ms cubic-bezier(.22,.61,.36,1), opacity 620ms cubic-bezier(.22,.61,.36,1)';
      node.style.transform='translate(-50%,-50%) translate3d('+(d*spacing+drag)+'px,'+(Math.abs(d)*(narrow.matches?16:35))+'px,0) scale('+(d===0?1:.73)+')';
      node.style.opacity=d===0?'1':'.36';
      node.style.zIndex=d===0?'3':'1';
      node.classList.toggle('is-active',d===0);
      node.setAttribute('aria-current',d===0?'true':'false');
      node.querySelector('img').style.transform='translateX('+(-d*12)+'px) scale('+(d===0?1.025:1)+')';
    });
  }
  function writeInfo(){
    const piece=pieces[active];
    const values=[String(active+1).padStart(2,'0')+' / 03',piece.name,piece.calibre,piece.movement,piece.case,piece.crystal];
    fields.forEach((field,i)=>field.textContent=values[i]);
    document.querySelector('.gallery-count').innerHTML=String(active+1).padStart(2,'0')+' <span>/ 03</span>';
    announcement.textContent=piece.name+', '+piece.calibre+'. Piece '+(active+1)+' of '+pieces.length+'.';
    detailNote.textContent=piece.note;
  }
  async function updateInfo(keyboard){
    const revision=++textRevision;
    fields.forEach(el=>el.getAnimations().forEach(a=>a.cancel()));
    if(keyboard||reduced.matches){ writeInfo(); return; }
    const out=fields.map((el,i)=>el.animate([{transform:'translateY(0)'},{transform:'translateY(-115%)'}],{duration:140,delay:i*12,easing:'cubic-bezier(.32,0,.67,0)',fill:'forwards'}));
    await Promise.all(out.map(a=>a.finished.catch(()=>{})));
    if(revision!==textRevision)return;
    writeInfo();
    out.forEach(a=>a.cancel());
    fields.forEach((el,i)=>el.animate([{transform:'translateY(115%)'},{transform:'translateY(0)'}],{duration:300,delay:i*16,easing:'cubic-bezier(.22,.61,.36,1)'}));
  }
  function select(index,keyboard=false){
    const next=(index+pieces.length)%pieces.length;
    if(next===active){renderGallery();return;}
    active=next;
    detailNote.hidden=true;
    discover.setAttribute('aria-expanded','false');
    renderGallery(0,keyboard);
    transitioningUntil=performance.now()+(keyboard||reduced.matches?0:750);
    updateInfo(keyboard);
  }
  document.querySelector('.gallery-prev').addEventListener('click',()=>select(active-1));
  document.querySelector('.gallery-next').addEventListener('click',()=>select(active+1));
  field.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
      e.preventDefault();
      select(active+(e.key==='ArrowRight'?1:-1),true);
    }else if(e.key==='Home'||e.key==='End'){
      e.preventDefault(); select(e.key==='Home'?0:pieces.length-1,true);
    }
  });
  discover.addEventListener('click',()=>{
    detailNote.hidden=!detailNote.hidden;
    discover.setAttribute('aria-expanded',String(!detailNote.hidden));
  });
  field.addEventListener('pointerdown',e=>{
    if(e.button!==0||dragging)return;
    dragging={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,horizontal:false};
  });
  field.addEventListener('pointermove',e=>{
    if(dragging&&dragging.id===e.pointerId){
      const dx=e.clientX-dragging.x,dy=e.clientY-dragging.y;
      if(!dragging.horizontal&&Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)*1.2){
        dragging.horizontal=true;
        field.setPointerCapture(e.pointerId);
        field.classList.add('is-dragging');
      }
      if(dragging.horizontal){dragging.dx=dx;renderGallery(Math.max(-width*.3,Math.min(width*.3,dx))*.72,true);}
    }else if(e.pointerType==='mouse'&&!reduced.matches){
      const rect=field.getBoundingClientRect();
      const x=(e.clientX-rect.left)/rect.width-.5;
      nodes[active].querySelector('img').style.transform='translateX('+(x*8)+'px) scale(1.025)';
    }
  });
  function release(e){
    if(!dragging||dragging.id!==e.pointerId)return;
    const moved=dragging.horizontal,dx=dragging.dx;
    dragging=null;
    if(moved) suppressClickUntil=performance.now()+350;
    field.classList.remove('is-dragging');
    if(field.hasPointerCapture(e.pointerId))field.releasePointerCapture(e.pointerId);
    if(moved&&Math.abs(dx)>45)select(active+(dx<0?1:-1));
    else renderGallery();
  }
  addEventListener('pointerup',release);
  field.addEventListener('pointercancel',e=>{if(dragging?.id===e.pointerId){dragging=null;field.classList.remove('is-dragging');renderGallery();}});
  field.addEventListener('pointerleave',()=>{if(!dragging)nodes[active].querySelector('img').style.transform='scale(1.025)';});
  function measure(){
    width=stage.clientWidth;
    height=stage.clientHeight;
    craftTop=craft.offsetTop;
    closingTop=closing.offsetTop;
    renderGallery(0,true);
    lastPhase=lastReveal=lastClosing=-1;
    wake();
  }
  function wake(){if(!raf&&!document.hidden)raf=requestAnimationFrame(draw);}
  function draw(){
    raf=0;
    const state=window.watchScene?.state;
    if(!state)return;
    const y=scrollY;
    const phase=reduced.matches?1:clamp((y-state.travel)/Math.max(1,state.handoff));
    if(phase!==lastPhase){
      lastPhase=phase;
      const t=ease(phase),exit=ease(range(phase,0,.4));
      if(reduced.matches){
        productStage.style.transform='';
        productStage.style.opacity='';
        editorial.style.opacity='';
        editorial.style.transform='';
        collection.style.opacity='1';
        collection.style.transform='';
        ['.masthead','.edition','.position'].forEach(selector=>stage.querySelector(selector).style.opacity='');
      }else{
        // This acts on the hero's outer stage only AFTER its approved film clock ends.
        productStage.style.transform=phase===0?'':'translate3d('+(-width*.24*t)+'px,'+(height*.08*t)+'px,0) scale('+(1-t*.3)+')';
        productStage.style.opacity=String(1-ease(range(phase,.2,.52)));
        editorial.style.opacity=String(1-exit);
        editorial.style.transform='translateX('+(-12*exit)+'px)';
        stage.querySelector('.masthead').style.opacity=String(1-ease(range(phase,.15,.5)));
        stage.querySelector('.edition').style.opacity=String(1-exit);
        stage.querySelector('.position').style.opacity=String(1-exit);
        collection.style.opacity=String(ease(range(phase,.42,.8)));
        collection.style.transform=phase===1?'':'translateY('+(-state.handoff*(1-phase))+'px)';
      }
    }
    const reveal=reduced.matches?1:ease(range(y,craftTop-height*.65,craftTop+height*.15));
    if(reveal!==lastReveal){
      lastReveal=reveal;
      aperture.style.clipPath='inset('+(12*(1-reveal))+'% '+(10*(1-reveal))+'% '+(12*(1-reveal))+'% '+(10*(1-reveal))+'%)';
      craftImage.style.transform='scale('+(1.3-.13*reveal)+')';
    }
    const finale=reduced.matches?1:ease(range(y,closingTop-height*.6,closingTop+height*.12));
    if(finale!==lastClosing){
      lastClosing=finale;
      closingImage.style.transform='scale('+(1.08-finale*.08)+')';
    }
  }
  addEventListener('scroll',wake,{passive:true});
  addEventListener('resize',measure,{passive:true});
  new ResizeObserver(measure).observe(collection);
  reduced.addEventListener('change',measure);
  narrow.addEventListener('change',measure);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else measure();});
  writeInfo();
  measure();
  window.watchCollection={get state(){return {active,name:pieces[active].name,dragging:!!dragging,transitioning:performance.now()<transitioningUntil,handoff:lastPhase};}};
}
