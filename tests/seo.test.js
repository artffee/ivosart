const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const routes=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
function read(url){return fs.readFileSync(path.join(root,new URL(url).pathname,'index.html'),'utf8');}
function jsonld(html){return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>JSON.parse(m[1]));}
test('all 51 canonical pages have indexable metadata, social images and exactly one analytics loader',()=>{
 assert.equal(routes.length,51);assert.equal(new Set(routes).size,51);
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
test('all 46 artwork pages have accurate ordered breadcrumbs, artwork schema and image sitemap entries',()=>{
 const artworkRoutes=routes.filter(url=>url.includes('/artworks/'));assert.equal(artworkRoutes.length,46);
 assert.equal((sitemap.match(/<image:image>/g)||[]).length,46);
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
