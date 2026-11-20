import re, pathlib
base = pathlib.Path('/home/claude/work/calc')
model = (base / 'model.js').read_text(encoding='utf-8')
tpl = (base / 'template.html').read_text(encoding='utf-8')
assert '/*__MODEL__*/' in tpl
out = tpl.replace('/*__MODEL__*/', model)
(base / 'index.html').write_text(out, encoding='utf-8')
print('index.html', len(out), 'bytes')
