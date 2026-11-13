"""Validate static navigation, assets, identifiers, and inline JavaScript."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json, subprocess, tempfile
class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(); self.ids=set(); self.duplicates=[]; self.links=[]; self.scripts=[]; self.active=False; self.feed(source)
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if 'id' in attrs:
            if attrs['id'] in self.ids: self.duplicates.append(attrs['id'])
            self.ids.add(attrs['id'])
        self.links.extend(attrs[k] for k in ['src','href'] if k in attrs)
        if tag=='script' and 'src' not in attrs:
            self.active=True; self.scripts.append('')
    def handle_endtag(self, tag):
        if tag=='script': self.active=False
    def handle_data(self, text):
        if self.active: self.scripts[-1]+=text
pages={p.name:Page(p.read_text()) for p in Path('.').glob('*.html')}
errors=[]
for name,page in pages.items():
    errors.extend((name,'duplicate ID',i) for i in page.duplicates)
    for link in page.links:
        url=urlsplit(link)
        if url.scheme or url.netloc: continue
        target=unquote(url.path) or name
        if not Path(target).exists(): errors.append((name,'missing file',link))
        elif url.fragment and target in pages and url.fragment not in pages[target].ids: errors.append((name,'missing anchor',link))
assert not errors, errors
scripts=[s for page in pages.values() for s in page.scripts]
with tempfile.NamedTemporaryFile(mode='w',suffix='.json') as temp:
    json.dump(scripts,temp);temp.flush()
    subprocess.run(['node','-e',"const vm=require('vm'),fs=require('fs');JSON.parse(fs.readFileSync(process.argv[1])).forEach(s=>new vm.Script(s));",temp.name],check=True)
for name in ['common.js','globe.js','newsletter.js','donation.js']:
    subprocess.run(['node','--check',name],check=True)
for p in Path('documents').glob('*.pdf'):
    assert p.read_bytes().startswith(b'%PDF'),p
print(f'{len(pages)} pages, {len(scripts)} inline scripts, all local links/anchors/assets valid.')
