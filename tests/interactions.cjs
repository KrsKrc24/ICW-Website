/* Run with node --test tests/interactions.cjs. No network requests are made. */
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const vm = require('node:vm');
function element() {
  const classes = new Set(), attrs = new Map();
  return {value: 'person@example.com', textContent: '', disabled: false, hidden: false,
    classList: {add:x=>classes.add(x), contains:x=>classes.has(x)},
    setAttribute:(k,v)=>attrs.set(k,v), getAttribute:k=>attrs.get(k), removeAttribute:k=>attrs.delete(k),
    addEventListener(type,fn){this[type]=fn;}, focus(){this.focused=true;}};
}
for(const mode of ['success','rejected','offline','timeout','invalid']) test('Newsletter: '+mode,async()=>{
  const ids=Object.fromEntries(['nlForm','nlEmail','nlBtn','nlError','nlNote','nlSuccess'].map(k=>[k,element()]));
  ids.nlForm.action='https://formspree.io/f/xlgaldkr';
  if(mode==='invalid')ids.nlEmail.value='not-an-email';
  let calls=0, timer;
  const context={document:{getElementById:id=>ids[id]},AbortController,
    setTimeout:fn=>{timer=fn;return 1;},clearTimeout:()=>{},
    fetch:async(url,options)=>{
      calls++; assert.equal(url,ids.nlForm.action);assert.equal(options.method,'POST');
      assert.equal(JSON.parse(options.body).email,'person@example.com');
      if(mode==='offline')throw new Error('offline');
      if(mode==='timeout')return new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('timeout'))));
      return {ok:mode==='success'};
    }};
  vm.runInNewContext(readFileSync('newsletter.js','utf8'),context);
  const pending=ids.nlForm.submit({preventDefault(){}});
  if(mode==='timeout')timer();
  await pending;
  if(mode==='invalid'){assert.equal(calls,0);assert.equal(ids.nlEmail.getAttribute('aria-invalid'),'true');return;}
  assert.equal(calls,1);assert.equal(ids.nlBtn.disabled,false);assert.equal(ids.nlForm.getAttribute('aria-busy'),'false');
  if(mode==='success'){assert(ids.nlForm.classList.contains('hidden'));assert(ids.nlSuccess.classList.contains('show'));assert(ids.nlNote.hidden);}
  else{assert.match(ids.nlError.textContent,/try again/);assert(!ids.nlForm.classList.contains('hidden'));}
});
for(const mode of ['success','sdk-failure','render-failure','timeout']) test('PayPal: '+mode,async()=>{
  const container=element(),status=element();let script,timer;
  const context={document:{getElementById:id=>id==='payment-status'?status:container,createElement:()=>({}),head:{appendChild:s=>{script=s;}}},
    setTimeout:fn=>{timer=fn;return 1;},clearTimeout:()=>{},
    paypal:{HostedButtons:()=>({render:async()=>{if(mode==='render-failure')throw new Error('unavailable');}})}};
  vm.runInNewContext(readFileSync('donation.js','utf8'),context);
  if(mode==='sdk-failure')script.onerror();else if(mode==='timeout')timer();else await script.onload();
  assert.equal(container.getAttribute('aria-busy'),'false');
  if(mode==='success')assert(status.hidden);else assert.match(status.innerHTML,/could not load/);
});
for(const mode of ['missing-library','map-unavailable']) test('Globe fallback: '+mode,async()=>{
  const container={innerHTML:''};
  const context={document:{querySelectorAll:()=>[container]},AbortController,setTimeout:()=>1,clearTimeout:()=>{}};
  if(mode==='map-unavailable'){context.d3={};context.topojson={};context.fetch=async()=>{throw new Error('offline');};}
  vm.runInNewContext(readFileSync('globe.js','utf8'),context);
  await new Promise(resolve=>setImmediate(resolve));
  assert.match(container.innerHTML,/Browse the chapter directory/);
});
test('Local map topology contains renderable land',()=>{
  const topojson=require('../vendor/topojson-client.min.js');
  const d3=require('../vendor/d3.v7.min.js');
  const world=JSON.parse(readFileSync('data/countries-110m.json','utf8'));
  const land=topojson.feature(world,world.objects.land);
  const shape=d3.geoPath(d3.geoOrthographic())(land);
  assert(shape.length>1000);assert(!shape.includes('NaN'));
});
