const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const routes=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
function read(url){return fs.readFileSync(path.join(root,new URL(url).pathname,'index.html'),'utf8');}
function jsonld(html){return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>JSON.parse(m[1]));}
test('all 54 canonical pages have indexable metadata, social images and exactly one analytics loader',()=>{
 assert.equal(routes.length,54);assert.equal(new Set(routes).size,54);
 for(const url of routes){const html=read(url);
  assert.ok(html.includes(`rel="canonical" href="${url}"`),url);
  assert.ok(html.includes(`property="og:url" content="${url}"`),url);
  assert.match(html,/<meta name="description" content="[^"]+"/);
  assert.match(html,/<meta name="twitter:image" content="https:\/\/ivosart.com\//);
  assert.match(html,/max-image-preview:large/);
  assert.doesNotMatch(html,/<meta[^>]+content="[^"]*noindex/i);
  assert.equal((html.match(/src="\/assets\/analytics.js"/g)||[]).length,1,url);
  assert.ok(jsonld(html).every(x=>typeof x==='object'));
  for(const m of html.matchAll(/(?:property="og:image"|name="twitter:image") content="https:\/\/ivosart.com([^"?]+)"/g)){assert.ok(fs.existsSync(path.join(root,m[1])),m[1]);}
 }
});
test('all 49 artwork pages have accurate ordered breadcrumbs, artwork schema and image sitemap entries',()=>{
 const artworkRoutes=routes.filter(url=>url.includes('/artworks/'));assert.equal(artworkRoutes.length,49);
 assert.equal((sitemap.match(/<image:image>/g)||[]).length,49);
 for(const url of artworkRoutes){const data=jsonld(read(url));const art=data.find(x=>x['@type']==='VisualArtwork');const crumbs=data.find(x=>x['@type']==='BreadcrumbList');
  assert.equal(art.url,url);assert.equal(art.creator['@id'],'https://ivosart.com/#artist');assert.ok(!art.offers);
  assert.deepEqual(crumbs.itemListElement.map(x=>x.position),[1,2,3]);assert.equal(crumbs.itemListElement[2].item,url);
  assert.ok(sitemap.includes(`<image:loc>${art.image}</image:loc>`));
 }
});
test('homepage establishes the website and artist identities without invented business claims',()=>{
 const data=jsonld(read('https://ivosart.com/'))[0]['@graph'];
 assert.equal(data.find(x=>x['@type']==='WebSite').url,'https://ivosart.com/');
 assert.equal(data.find(x=>x['@type']==='Person')['@id'],'https://ivosart.com/#artist');
});

test('homepage exposes six featured artwork links and a main landmark before JavaScript',()=>{
 const html=read('https://ivosart.com/');
 const featured=html.match(/<!-- FEATURED_WORKS_START -->([\s\S]*?)<!-- FEATURED_WORKS_END -->/)[1];
 assert.equal((featured.match(/<article\b/g)||[]).length,6);
 for(const work of require('../assets/original-works').slice(0,6)){
  assert.ok(featured.includes(`href="/artworks/${work.slug}/"`),work.slug);
  assert.ok(featured.includes(work.title));
 }
 assert.equal((html.match(/<main\b/g)||[]).length,1);
 assert.equal((html.match(/<\/main>/g)||[]).length,1);
 assert.match(html,/<title>[^<]*Original Paintings/);
});

test('collection pages describe their visible artwork lists without invented commercial data',()=>{
 for(const [route,count,title] of [['/gallery/',49,'Original Paintings'],['/collections/art-statements/',16,'Framed Art Statements']]){
  const html=read('https://ivosart.com'+route);
  assert.ok(html.match(/<title>(.*?)<\/title>/)[1].includes(title));
  const graph=jsonld(html)[0]['@graph'];
  const page=graph.find(x=>x['@type']==='CollectionPage');
  const list=graph.find(x=>x['@type']==='ItemList');
  assert.equal(page.url,'https://ivosart.com'+route);
  assert.equal(page.mainEntity['@id'],list['@id']);
  assert.equal(list.numberOfItems,count);
  assert.equal(list.itemListElement.length,count);
  assert.deepEqual(list.itemListElement.map(x=>x.position),Array.from({length:count},(_,i)=>i+1));
  for(const item of list.itemListElement){
   assert.ok(routes.includes(item.url));
   assert.ok(html.includes(`href="${new URL(item.url).pathname}"`));
  }
  assert.doesNotMatch(JSON.stringify(graph),/"(?:offers|aggregateRating|review)"/);
 }
 const gallery=read('https://ivosart.com/gallery/');
 assert.equal((gallery.match(/<h2><a href="\/artworks\//g)||[]).length,49);
});

test('generated catalogue imagery has verified intrinsic dimensions and social descriptions',()=>{
 const {imageSize}=require('../scripts/image-size');
 for(const url of routes.filter(url=>!url.endsWith('/books/the-quiet-between-us/')&&url!=='https://ivosart.com/')){
  const html=read(url);
  assert.match(html,/<meta property="og:image:alt" content="[^"]+"/);
  assert.match(html,/<meta name="twitter:image:alt" content="[^"]+"/);
  for(const match of html.matchAll(/<img\b([^>]+)>/g)){
   const attrs=match[1];const src=attrs.match(/src="([^"]+)"/)[1];
   const actual=imageSize(path.join(root,src));
   assert.equal(Number(attrs.match(/width="(\d+)"/)?.[1]),actual.width,`${url} ${src} width`);
   assert.equal(Number(attrs.match(/height="(\d+)"/)?.[1]),actual.height,`${url} ${src} height`);
  }
 }
});

test('canonical redirects preserve the homepage and legacy entrypoint without changing artwork URLs',()=>{
 const config=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
 assert.ok(config.redirects.some(r=>r.source==='/index.html'&&r.destination==='/'&&r.permanent));
 assert.ok(config.redirects.some(r=>r.source.includes('legacy')&&r.destination==='/'&&r.permanent));
 assert.ok(config.redirects.every(r=>!r.source.includes('artworks')));
 assert.match(fs.readFileSync(path.join(root,'robots.txt'),'utf8'),/Sitemap: https:\/\/ivosart.com\/sitemap.xml/);
});
