(() => {
  'use strict';
  const data = JSON.parse(document.getElementById('book-data').textContent);
  const reader = document.getElementById('reader');
  const book = document.getElementById('book');
  const stage = document.getElementById('stage');
  const prev = document.getElementById('previous');
  const next = document.getElementById('next');
  const jump = document.getElementById('jump');
  const status = document.getElementById('page-status');
  const note = document.getElementById('reader-note');
  const zoom = document.getElementById('zoom-dialog');
  const zoomImage = document.getElementById('zoom-image');
  const zoomJump = document.getElementById('zoom-jump');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'ivosart.quiet-book.page.v1';
  let flip, current = 0, zoomScale = 1, turning = false;

  function clampPage(value) { return Math.max(0, Math.min(data.length - 1, Number(value) || 0)); }
  function desiredPage() {
    const hash = location.hash.match(/^#page=(\d+)$/);
    if (hash) return clampPage(Number(hash[1]) - 1);
    try { return clampPage(localStorage.getItem(storageKey)); } catch { return 0; }
  }
  function imageURL(page) { return data[page].image; }
  function update() {
    current = clampPage(flip.getCurrentPageIndex());
    const spread = flip.getOrientation() === 'landscape' && current > 0;
    const last = Math.min(data.length, current + (spread ? 2 : 1));
    status.textContent = (last > current + 1 ? `Pages ${current + 1}–${last}` : `Page ${current + 1}`) + ` of ${data.length}`;
    prev.disabled = current === 0 || turning;
    next.disabled = last >= data.length || turning;
    jump.value = String(current);
    try { localStorage.setItem(storageKey, String(current)); } catch {}
    try { history.replaceState(null, '', `#page=${current + 1}`); } catch {}
  }
  function go(page) {
    if (!flip || turning) return;
    flip.turnToPage(clampPage(page));
    update();
  }
  function turn(direction) {
    if (!flip || turning || (direction < 0 ? prev.disabled : next.disabled)) return;
    if (reduced.matches) {
      direction > 0 ? flip.turnToNextPage() : flip.turnToPrevPage();
      update();
    } else direction > 0 ? flip.flipNext('bottom') : flip.flipPrev('bottom');
  }
  function setZoomPage(page) {
    page = clampPage(page);
    zoomJump.value = String(page);
    zoomImage.src = imageURL(page);
    zoomImage.alt = `Page ${page + 1}: ${data[page].title}`;
    document.getElementById('zoom-scroll').scrollTo(0, 0);
  }
  function setScale(value) {
    zoomScale = Math.max(1, Math.min(3, value));
    zoomImage.style.width = `${zoomScale * 100}%`;
    document.getElementById('zoom-percent').textContent = `${Math.round(zoomScale * 100)}%`;
    document.getElementById('zoom-out').disabled = zoomScale <= 1;
    document.getElementById('zoom-in').disabled = zoomScale >= 3;
  }
  document.getElementById('open-zoom').addEventListener('click', () => {
    setZoomPage(current); setScale(1); zoom.showModal();
  });
  document.getElementById('close-zoom').addEventListener('click', () => zoom.close());
  document.getElementById('zoom-in').addEventListener('click', () => setScale(zoomScale + .5));
  document.getElementById('zoom-out').addEventListener('click', () => setScale(zoomScale - .5));
  zoomJump.addEventListener('change', () => setZoomPage(zoomJump.value));
  zoom.addEventListener('click', e => { if (e.target === zoom) { const r=zoom.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) zoom.close(); } });
  prev.addEventListener('click', () => turn(-1));
  next.addEventListener('click', () => turn(1));
  jump.addEventListener('change', () => go(jump.value));
  document.getElementById('restart').addEventListener('click', () => go(0));
  document.getElementById('single-page').addEventListener('click', e => {
    const on = stage.classList.toggle('single');
    e.currentTarget.setAttribute('aria-pressed', String(on));
    requestAnimationFrame(() => { flip.update(); update(); });
  });
  document.addEventListener('keydown', e => {
    if (!flip || zoom.open || /INPUT|SELECT|TEXTAREA|BUTTON|SUMMARY/.test(e.target.tagName) || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); turn(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); turn(1); }
    if (e.key === 'Home') { e.preventDefault(); go(0); }
    if (e.key === 'End') { e.preventDefault(); go(data.length - 1); }
  });
  window.addEventListener('hashchange', () => go(desiredPage()));
  try {
    if (!window.St || !window.St.PageFlip) throw new Error('Reader unavailable');
    const start = desiredPage();
    flip = new St.PageFlip(book, {
      width: 360, height: 504, size: 'stretch', minWidth: 220, maxWidth: 460,
      minHeight: 308, maxHeight: 644, showCover: true, usePortrait: true,
      autoSize: true, drawShadow: true, maxShadowOpacity: .28,
      flippingTime: reduced.matches ? 1 : 750, mobileScrollSupport: true,
      swipeDistance: 30, showPageCorners: !reduced.matches, disableFlipByClick: reduced.matches
    });
    flip.on('init', () => { go(start); update(); });
    flip.on('flip', update);
    flip.on('changeOrientation', () => requestAnimationFrame(update));
    flip.on('changeState', e => { turning = e.data !== 'read'; update(); });
    reader.classList.add('ready');
    flip.loadFromHTML(book.querySelectorAll('.page'));
    document.querySelectorAll('[data-reader-control]').forEach(el => { el.hidden = false; });
    update();
  } catch (error) {
    reader.classList.remove('ready');
    note.textContent = 'You can scroll through the pages below, open the text version, or download the PDF.';
    document.querySelectorAll('[data-reader-control]').forEach(el => { el.hidden = true; });
  }
})();
