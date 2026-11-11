"""Word-prediction lists for "Write and listen": the most frequent words of each language, ordered by
frequency, only if they are in the spelling dictionary, and never rude, sexual or insulting words.
Frequencies: FrequencyWords by Hermit Dave (OpenSubtitles 2018), CC BY-SA 4.0.
Usage: python3 scripts/spell/build_freq.py <dir with es.txt ca.txt en.txt>"""
import gzip, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'public', 'dict')
SRC = sys.argv[1]
KEEP = 20000

# Whole-word patterns (a trailing .* means "and words starting with this")
BLOCK = {
    'es': r'put[ao]s?|putad.*|putit.*|mierd.*|jod.*|coño.*|poll(a|as|ón|ones)|foll.*|cabr[oó]n.*|gilipoll.*|mari(ca|cas|cón|cones|conazo).*|mam(ón|ona|ada|adas)|cojon.*|cojón|chinga.*|verga.*|pendej.*|imb[eé]cil.*|idiota.*|estúpid.*|estupid.*|subnormal.*|retrasad[oa]s?|mongol.*|culo|culos|culito|sex.*|porn.*|desnud.*|viol(ar|ación|aciones|ador|adores|ada|adas|ado|ados|ó|aron|arla|arlo).*|orgasm.*|pene|penes|vagin.*|teta|tetas|suicid.*|droga.*|cocaína|zorras?|negrat.*|sudaca.*|moro|moros|maldit.*|carajo|hostia.*|ostia.*|cagar.*|cag(ó|ue|ando|ado).*|pedo|pedos|borrach.*|whisky|vodka|follón|prostitu.*|esperma|semen|condón|condones|erecci.*|burdel.*|orgía.*|ramera.*|pezón|pezones|cachond.*|bragas|tanga.*|nalga.*',
    'ca': r'esperma|put[ae]s?|putad.*|merd.*|collon.*|cony.*|poll(a|es)|fot(re|ut|uda|uts|udes).*|foll.*|cabr[oó].*|gilipoll.*|mari(ca|cón|cons).*|mamad.*|imb[eè]cil.*|idiota.*|estúpid.*|subnormal.*|cul|culs|sex.*|porn.*|nu|nua|nus|nues|despullat.*|viol(ar|ació|ador|ada|at|ats|ades).*|orgasm.*|penis|vagin.*|mamell.*|suïcid.*|droga.*|cocaïna|guarr.*|maleït.*|hòstia.*|cagar.*|cag(a|ue|ant|at).*|pet|pets|borratx.*|prostitu.*|orgia.*|semen|condó|condons|llepaculs|emmerd.*|erecci.*|mugr.*',
    'en': r'fuck.*|shit.*|bitch.*|bastard.*|damn.*|goddamn.*|crap.*|piss.*|dick.*|cock.*|puss(y|ies)|cunt.*|ass|asses|asshole.*|arse.*|wank.*|slut.*|whore.*|sex.*|porn.*|nude.*|naked|rap(e|ed|es|ing|ist|ists)|suicid.*|nigg.*|fag.*|retard.*|boob.*|tit|tits|titt.*|penis.*|vagin.*|horn(y|ier)|hell|bloody|bugger.*|bollock.*|drug.*|cocaine|heroin|vodka|whisk(e)?y|sexy|stupid.*|idiot.*|moron.*|dumb.*|weed|crack|booze|bullshit.*|motherfuck.*|jackass.*|badass.*|dipshit.*|horseshit.*|hellhole.*|blowjob.*|scum.*|suck|sucks|sucked|sucker|suckers|sucking|prostitut.*|hooker.*|pimp|pimps|pimping|stripper.*|striptease|condom.*|orgasm.*|erect|erection.*|nipple.*|sperm|semen|panties|thong|kinky|spank.*|butt|butts|buttock.*|hellish|hells|hellfire|crass|lass',
}

def load_dict(lang):
    data = gzip.decompress(open(os.path.join(OUT, f'{lang}.fcz'), 'rb').read()).decode().split('\n')
    out, prev = set(), ''
    for x in data:
        k = ord(x[0]) - 48; w = prev[:k] + x[1:]; out.add(w); prev = w
    return out

for lang in ('es', 'ca', 'en'):
    words = load_dict(lang)
    block = re.compile(rf'^(?:{BLOCK[lang]})$', re.I)
    kept = []
    seen = set()
    for line in open(os.path.join(SRC, f'{lang}.txt'), encoding='utf-8'):
        w = line.split(' ')[0].strip()
        if len(w) < 3 or w in seen or not re.fullmatch(r"[^\W\d_]+(?:·[^\W\d_]+)?", w):
            continue
        if w not in words or block.match(w):
            continue
        seen.add(w); kept.append(w)
        if len(kept) >= KEEP:
            break
    data = gzip.compress('\n'.join(kept).encode('utf-8'), 9, mtime=0)
    open(os.path.join(OUT, f'{lang}.frz'), 'wb').write(data)
    print(lang, len(kept), 'words', len(data), 'bytes; first:', ' '.join(kept[:12]))
