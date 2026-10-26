const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname,'../assets/analytics.js'),'utf8');
function harness(choice, active=true, hostname='ivosart.com') {
 const tags=[], writes=[], elements=[];
 const element=()=>({style:{},children:[],handlers:{},setAttribute(){},appendChild(n){this.children.push(n);},addEventListener(k,f){this.handlers[k]=f;},focus(){}});
 const body=element(); const head=element(); head.appendChild=n=>tags.push(n);
 const document={head,body,referrer:'https://example.com/path?email=private#secret',cookie:'',createElement(){const e=element();elements.push(e);return e;}};
 const window={}; const location={hostname,href:'https://'+hostname+'/?work=private#inquire'};
 const context={window,document,location,URL,Date,localStorage:{getItem(){return choice;},setItem(k,v){writes.push(v);}}};
 const code=active?source.replace("const measurementId = '';", "const measurementId = 'G-TEST123';"):source;
 vm.runInNewContext(code,context);
 return {window,document,tags,writes,elements,context,code};
}
test('unconfigured integration does nothing',()=>{ const h=harness(null,false);assert.equal(h.tags.length,0);assert.equal(h.elements.length,0);assert.equal(h.window.dataLayer,undefined); });
test('no analytics before consent or after rejection',()=>{for(const choice of [null,'rejected']) {const h=harness(choice);assert.equal(h.tags.length,0);assert.equal(h.window.dataLayer.length,0);}});
test('accept loads once with sanitized URLs and no ad features',()=>{const h=harness(null);h.elements.find(e=>e.textContent==='Accept analytics').handlers.click();assert.equal(h.tags.length,1);const cfg=h.window.dataLayer.find(a=>a[0]==='config')[2];assert.equal(cfg.page_location,'https://ivosart.com/');assert.equal(cfg.page_referrer,'https://example.com/path');assert.equal(cfg.allow_google_signals,false);assert.equal(cfg.allow_ad_personalization_signals,false);vm.runInNewContext(h.code,h.context);assert.equal(h.tags.length,1);});
test('reject disables an accepted session',()=>{const h=harness('accepted');assert.equal(h.tags.length,1);h.elements.find(e=>e.textContent==='Reject analytics').handlers.click();assert.equal(h.window['ga-disable-G-TEST123'],true);assert.deepEqual(h.writes,['rejected']);});
test('preview domains never collect',()=>{assert.equal(harness('accepted',true,'preview.vercel.app').tags.length,0);});
