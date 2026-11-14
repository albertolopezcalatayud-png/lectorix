# Test only: fake clips (tones) for the texts of one reading, with even word timings
import json,subprocess,os,sys,re
texts=json.load(open(sys.argv[1])); out=sys.argv[2]
want=json.load(open('/home/claude/lectorix/src/data/lecturas.json'))['readings']
gato=[r for r in want if r['id']=='lectura_l1_gato'][0]['text']
os.makedirs(out+'/es',exist_ok=True)
items={}
for k,t in texts['es'].items():
    if t in gato or len(t.split())==1 and t.lower() in gato.lower():
        words=[m.start() for m in re.finditer(r'\S+',t)]
        dur=max(0.4,0.32*len(words))
        subprocess.run(['ffmpeg','-loglevel','error','-y','-f','lavfi','-i',f'sine=frequency=440:duration={dur}','-ac','1','-b:a','32k',f'{out}/es/{k}.mp3'],check=True)
        json.dump({'ms':int(dur*1000),'w':[[c,int(i*dur*1000/len(words))] for i,c in enumerate(words)]},open(f'{out}/es/{k}.json','w'))
        items[k]=1
json.dump({'voice':'mock','items':items},open(out+'/es/manifest.json','w'))
print('clips',len(items))
