#!/bin/bash
# Copies the dictation clips (slow and 🐢 of every published voice) from the "audio" branch into the
# install-time asset pack, and writes audio/dictation.json with the voices that came with the app.
set -e
D=android/audio_pack/src/main/assets/public/audio
mkdir -p $D
git fetch -q --depth 1 origin audio
python3 - "$D" <<'PY'
import json, os, subprocess, sys
d = sys.argv[1]; idx = {}
voices = json.loads(subprocess.run(['git', 'show', 'FETCH_HEAD:voices.json'], capture_output=True, text=True, check=True).stdout)
for lang, vs in voices.items():
    for v in vs:
        paths = [f"{lang}/{v['id']}/{p}" for p in ('slow', 'slower')]
        have = subprocess.run(['git', 'ls-tree', '-d', '--name-only', 'FETCH_HEAD', *paths], capture_output=True, text=True).stdout.split()
        if len(have) < 2: print('no dictation clips for', lang, v['id']); continue
        subprocess.run(f"git archive FETCH_HEAD {' '.join(paths)} | tar -x -C {d}", shell=True, check=True)
        idx.setdefault(lang, []).append(v['id'])
json.dump(idx, open(os.path.join(d, 'dictation.json'), 'w'))
print('bundled dictation voices', idx)
PY
du -sh $D; echo "$(find $D -name '*.mp3' | wc -l) clips"
