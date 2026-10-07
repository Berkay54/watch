import { initCampaign } from './campaign.js';
import { models, sequence } from './models.js';
// Preserve the native-scroll stage and gated decoder architecture from the first prototype.
const film = document.querySelector('.film');
const stage = document.querySelector('.stage');
const productStage = document.querySelector('.product-stage');
const editorialStage = document.querySelector('.editorial-stage');
const status = document.querySelector('.status');
const note = document.querySelector('.scroll-note');
const indicator = document.querySelector('.position-rule');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = matchMedia('(max-width: 700px)');
const clamp = (x, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
const range = (x, a, b) => clamp((x - a) / (b - a));
const smooth = x => x * x * (3 - 2 * x);
const mix = (a, b, t) => a + (b - a) * t;
const total = models.length * sequence.dwell + (models.length - 1) * sequence.bridge;
let target = 0, progress = 0, raf = 0, previous = 0, travel = 1, origin = 0;
let lastComposition = -1;
let handoff = 0;
const starts = models.map((_, i) => i * (sequence.dwell + sequence.bridge));
const channels = models.map((model, index) => {
  const product = document.createElement('div');
  product.className = 'product';
  const frame = document.createElement('div');
  frame.className = 'product-frame';
  frame.style.transformOrigin = model.framing.focus.join('% ') + '%';
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.disablePictureInPicture = true;
  video.setAttribute('aria-hidden', 'true');
  video.style.transform = 'scale(' + model.framing.overscan + ')';
  frame.append(video);
  product.append(frame);
  productStage.append(product);
  const story = document.createElement('article');
  story.className = 'story';
  story.id = model.id;
  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = 'The mechanical studies / ' + model.identity;
  const headline = document.createElement('h1');
  headline.className = 'headline';
  for (const line of model.headline) {
    const outer = document.createElement('span');
    outer.className = 'line';
    const inner = document.createElement('span');
    inner.textContent = line;
    outer.append(inner);
    headline.append(outer);
  }
  const info = document.createElement('div');
  info.className = 'model-info';
  const name = document.createElement('h2');
  name.textContent = model.name;
  const specification = document.createElement('p');
  specification.textContent = model.specification;
  info.append(name, specification);
  const ordinal = document.createElement('p');
  ordinal.className = 'ordinal';
  ordinal.append(String(index + 1).padStart(2, '0'));
  const count = document.createElement('span');
  count.textContent = '/ ' + String(sequence.plannedCollectionSize).padStart(2, '0');
  ordinal.append(count);
  story.append(eyebrow, headline, info, ordinal);
  editorialStage.append(story);
  const channel = { video, frame, product, story, index, model, ready:false, failed:false,
    target:0, lastSeek:-Infinity, started:0, seeks:0, completed:0, totalLatency:0,
    maxLatency:0, focusX:0, focusY:0, dx:0, dy:0, still:null, makingStill:false };
  video.addEventListener('loadeddata', () => { channel.ready = true; updateStatus(); wake(); });
  video.addEventListener('seeked', () => {
    const latency = performance.now() - channel.started;
    channel.completed++;
    channel.totalLatency += latency;
    channel.maxLatency = Math.max(channel.maxLatency, latency);
    wake();
  });
  video.addEventListener('error', () => {
    if (model.original && video.getAttribute('src') !== model.original) {
      channel.ready = false;
      video.src = model.original;
    } else { channel.failed = true; updateStatus(); }
  });
  video.src = model.source;
  video.pause();
  return channel;
});
function updateStatus() {
  status.textContent = channels.some(c => c.failed) ? 'A film could not be loaded. Refresh to retry.'
    : channels.every(c => c.ready) ? '' : 'Preparing the film';
}
function measure() {
  travel = Math.round(total * (mobile.matches ? 1600 : sequence.pixelsPerUnit));
  handoff = reduced.matches ? 0 : Math.round(stage.clientHeight * (mobile.matches ? .7 : 1));
  film.style.height = reduced.matches ? 'auto' : 'calc(100svh + ' + (travel + handoff) + 'px)';
  const box = film.getBoundingClientRect();
  origin = box.top + scrollY;
  // The new exit follows the original film clock; it never stretches its 6440px desktop mapping.
  for (const c of channels) {
    const f = c.frame;
    c.focusX = f.offsetLeft + f.offsetWidth * c.model.framing.focus[0] / 100;
    c.focusY = f.offsetTop + f.offsetHeight * c.model.framing.focus[1] / 100;
    c.dx = stage.clientWidth / 2 - c.focusX;
    c.dy = stage.clientHeight / 2 - c.focusY;
  }
  lastComposition = -1;
  readScroll();
}
function readScroll() {
  target = reduced.matches ? 0 : clamp((scrollY - origin) / travel);
  wake();
}
function wake() {
  if (!raf && !document.hidden) raf = requestAnimationFrame(tick);
}
function frameEnd(c) { return Math.max(0, c.video.duration - 1 / c.model.fps || 0); }
function clocks(u) {
  for (const c of channels) {
    const start = starts[c.index];
    const previousBridge = start - sequence.bridge;
    const incoming = c.index === 0 ? 0 : .18;
    const outgoing = c.index === channels.length - 1 ? 1 : .82;
    let fraction;
    if (c.index > 0 && u < start) {
      fraction = .18 * range(u, previousBridge + sequence.bridge / 2, start);
    } else if (u <= start + sequence.dwell) {
      fraction = mix(incoming, outgoing, range(u, start, start + sequence.dwell));
    } else {
      fraction = mix(outgoing, 1, range(u, start + sequence.dwell, start + sequence.dwell + sequence.bridge / 2));
    }
    c.target = clamp(fraction) * frameEnd(c);
  }
}
function composition(p) {
  const u = p * total;
  for (const c of channels) {
    const i = c.index, start = starts[i], end = start + sequence.dwell;
    const hasIncoming = i > 0, hasOutgoing = i < channels.length - 1;
    const inbound = hasIncoming ? range(u, start - sequence.bridge / 2, start) : 1;
    const outbound = hasOutgoing ? range(u, end, end + sequence.bridge / 2) : 0;
    const visible = u >= (hasIncoming ? start - sequence.bridge / 2 : 0) &&
      u < (hasOutgoing ? end + sequence.bridge / 2 : total + .001);
    // One product owns the macro field. Swap only at the exact zero-luminance focal point.
    const approach = hasIncoming && inbound < 1 ? 1 - smooth(inbound) : smooth(outbound);
    const scale = Math.exp(Math.log(c.model.framing.macroScale) * approach);
    const light = hasIncoming && inbound < 1
      ? smooth(range(inbound, 0, .55))
      : 1 - smooth(range(outbound, .58, 1));
    c.product.style.visibility = visible ? 'visible' : 'hidden';
    c.product.style.opacity = visible ? '1' : '0';
    c.frame.style.transform = 'translate3d(' + c.dx * approach + 'px,' + c.dy * approach + 'px,0) scale(' + scale + ')';
    c.frame.style.filter = 'brightness(' + light + ')';
    const exit = hasOutgoing ? smooth(range(u, end, end + sequence.bridge * .27)) : 0;
    const entry = hasIncoming ? smooth(range(u, start - sequence.bridge * .16, start + .04)) : 1;
    const textOpacity = entry * (1 - exit);
    c.story.style.opacity = textOpacity;
    c.story.style.visibility = textOpacity > .001 ? 'visible' : 'hidden';
    c.story.setAttribute('aria-hidden', textOpacity <= .001 ? 'true' : 'false');
    // Quiet line clipping, independent of the much larger optical approach.
    c.story.querySelectorAll('.line span').forEach(el => {
      el.style.transform = mobile.matches ? 'none' : 'translateY(' + ((1 - entry) * 12 - exit * 10) + 'px)';
    });
  }
  note.style.opacity = 1 - smooth(range(p, .02, .1));
  indicator.style.transform = 'scaleX(' + p + ')';
}
function seek(c, now) {
  if (!c.ready || c.failed || c.video.seeking) return false;
  const fps = c.model.fps;
  const desired = Math.round(clamp(c.target, 0, frameEnd(c)) * fps) / fps;
  if (Math.abs(c.video.currentTime - desired) < .75 / fps) return false;
  // Keep the existing outstanding-seek gate; a fast encode now permits one seek per paint.
  if (now - c.lastSeek < 1000 / 60 - 1) return true;
  c.lastSeek = now;
  c.started = now;
  c.seeks++;
  c.video.currentTime = desired;
  return true;
}
function captureStill(c) {
  if (c.still || c.makingStill || !c.ready || c.video.seeking ||
      Math.abs(c.video.currentTime - c.target) > 1 / c.model.fps) return;
  c.makingStill = true;
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = Math.round(canvas.width * c.video.videoHeight / c.video.videoWidth);
  canvas.getContext('2d').drawImage(c.video, 0, 0, canvas.width, canvas.height);
  canvas.toBlob(blob => {
    if (blob) {
      c.still = document.createElement('img');
      c.still.className = 'still';
      c.still.alt = c.model.name + ', mechanical watch detail';
      c.still.src = URL.createObjectURL(blob);
      c.story.append(c.still);
    }
    c.makingStill = false;
  }, 'image/jpeg', .9);
}
function tick(now) {
  raf = 0;
  const dt = previous ? Math.min(64, now - previous) : 16;
  previous = now;
  let pending = false;
  if (reduced.matches) {
    progress = target = 0;
    for (const c of channels) {
      c.story.style.opacity = '1';
      c.story.style.visibility = 'visible';
      c.story.removeAttribute('aria-hidden');
      c.story.querySelectorAll('.line span').forEach(el => el.style.transform = 'none');
      c.target = Math.min(c.model.stillTime, frameEnd(c));
      pending = seek(c, now) || pending;
      captureStill(c);
    }
  } else {
    const delta = target - progress;
    progress = Math.abs(delta) < .00006 ? target : progress + delta * (1 - Math.exp(-dt / 55));
    if (progress !== lastComposition) { composition(progress); lastComposition = progress; }
    clocks(progress * total);
    for (const c of channels) pending = seek(c, now) || pending;
    pending ||= progress !== target;
  }
  if (pending) wake();
  else previous = 0;
}
document.querySelectorAll('.masthead a[href^="#"], .legal-line a[href="#watch-01"]').forEach(link => {
  link.addEventListener('click', event => {
    const id = link.getAttribute('href').slice(1);
    if (id === 'craft') return;
    event.preventDefault();
    if (reduced.matches) {
      const destination = id === 'craft' ? channels[0].story : document.getElementById(id);
      destination?.scrollIntoView();
    } else {
      const index = models.findIndex(m => m.id === id);
      const u = id === 'craft' ? sequence.dwell + sequence.bridge * .2 : starts[Math.max(index, 0)];
      scrollTo({ top:origin + travel * u / total, behavior:'instant' });
    }
  });
});
const heritageButton = document.querySelector('nav button');
const heritageNote = document.querySelector('#heritage-note');
heritageButton.addEventListener('click', () => {
  heritageNote.hidden = !heritageNote.hidden;
  heritageButton.setAttribute('aria-expanded', String(!heritageNote.hidden));
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { heritageNote.hidden = true; heritageButton.setAttribute('aria-expanded', 'false'); }
});
addEventListener('scroll', readScroll, { passive:true });
addEventListener('resize', measure, { passive:true });
new ResizeObserver(measure).observe(stage);
reduced.addEventListener('change', measure);
mobile.addEventListener('change', measure);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(raf); raf = 0; previous = 0; }
  else measure();
});
measure();
updateStatus();
window.watchScene = {
  get state() {
    return { target, progress, travel, handoff, total, reducedMotion:reduced.matches,
      channels:channels.map(c => ({ id:c.model.id, source:c.video.getAttribute('src'), duration:c.video.duration,
        time:c.video.currentTime, target:c.target, ready:c.ready, seeking:c.video.seeking, paused:c.video.paused,
        seeks:c.seeks, meanSeekMs:c.completed ? c.totalLatency / c.completed : 0, maxSeekMs:c.maxLatency })) };
  }
};

initCampaign();
