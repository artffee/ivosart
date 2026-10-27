const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
test('artist portrait is responsive and confined to the About story',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const about=html.match(/<section class="about" id="artist">([\s\S]*?)<\/section>/)[1];
 assert.match(about,/alt="Black-and-white portrait of Ivaylo Peytchev against a dark background"/);
 assert.match(about,/width="960" height="1440"/);
 assert.match(about,/portrait-480.webp 480w, images\/ivaylo-peytchev-portrait-960.webp 960w/);
 assert.match(html,/\.about-port\{aspect-ratio:2\/3;/);
 assert.match(about,/loading="lazy"/);
 assert.ok(html.indexOf('id="works"')<html.indexOf('id="artist"'));
 for(const width of [480,960])assert.ok(fs.existsSync(path.join(root,`images/ivaylo-peytchev-portrait-${width}.webp`)));
 assert.doesNotMatch(fs.readFileSync(path.join(root,'gallery/index.html'),'utf8'),/ivaylo-peytchev-portrait-/);
});
