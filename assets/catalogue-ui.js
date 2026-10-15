(() => {
  const viewer = document.getElementById('artViewer');
  if (viewer) {
    document.querySelector('[data-open-image]').addEventListener('click', () => { viewer.showModal(); document.body.style.overflow='hidden'; });
    document.querySelector('[data-close-image]').addEventListener('click', () => viewer.close());
    viewer.addEventListener('close', () => { document.body.style.overflow=''; });
  }
  const copy = document.querySelector('[data-copy-link]');
  if (copy) copy.addEventListener('click', async () => {
    const status = document.querySelector('[data-copy-status]');
    try { await navigator.clipboard.writeText(document.querySelector('link[rel=canonical]').href); status.textContent='Artwork link copied.'; }
    catch { status.textContent='Copy the address from your browser to share this artwork.'; }
  });
  const cards = [...document.querySelectorAll('#catalogueGrid .art-card')];
  if (!cards.length) return;
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const search = document.getElementById('artSearch');
  let filter = 'all';
  function render() {
    const term = search.value.trim().toLowerCase(); let count=0;
    for (const card of cards) { card.hidden= !((filter==='all'||card.dataset.collection===filter) && card.dataset.title.includes(term)); if (!card.hidden) count++; }
    for (const button of buttons) button.setAttribute('aria-pressed',String(button.dataset.filter===filter));
    document.getElementById('galleryCount').textContent=count+' '+(count===1?'work':'works');
    document.getElementById('galleryEmpty').hidden= count>0;
  }
  function fromHash() { const value=location.hash.slice(1);filter=buttons.some(b=>b.dataset.filter===value)?value:'all';render(); }
  for (const button of buttons) button.addEventListener('click',()=>{filter=button.dataset.filter;history.replaceState(null,'',filter==='all'?location.pathname:'#'+filter);render();});
  search.addEventListener('input',render);addEventListener('hashchange',fromHash);fromHash();
})();
