# English (British) phonics bank — Lectorix "Phonics" module (id: fonologia)
M = 'fonologia'

SYLLABLES = {
    1: [("cat", ["cat"]), ("frog", ["frog"]), ("rabbit", ["rab", "bit"]), ("sunset", ["sun", "set"]),
        ("picnic", ["pic", "nic"]), ("pencil", ["pen", "cil"]), ("tiger", ["ti", "ger"]), ("happy", ["hap", "py"]),
        ("lemon", ["lem", "on"]), ("button", ["but", "ton"]), ("bed", ["bed"]), ("sandwich", ["sand", "wich"])],
    2: [("monkey", ["mon", "key"]), ("carpet", ["car", "pet"]), ("window", ["win", "dow"]), ("robot", ["ro", "bot"]),
        ("basket", ["bas", "ket"]), ("garden", ["gar", "den"]), ("chicken", ["chick", "en"]), ("tennis", ["ten", "nis"]),
        ("dinosaur", ["di", "no", "saur"]), ("banana", ["ba", "na", "na"]), ("tomato", ["to", "ma", "to"]),
        ("animal", ["an", "i", "mal"])],
    3: [("elephant", ["el", "e", "phant"]), ("kangaroo", ["kan", "ga", "roo"]), ("umbrella", ["um", "brel", "la"]),
        ("computer", ["com", "pu", "ter"]), ("potato", ["po", "ta", "to"]), ("hospital", ["hos", "pi", "tal"]),
        ("yesterday", ["yes", "ter", "day"]), ("butterfly", ["but", "ter", "fly"]), ("octopus", ["oc", "to", "pus"]),
        ("volcano", ["vol", "ca", "no"]), ("important", ["im", "por", "tant"]), ("adventure", ["ad", "ven", "ture"])],
    4: [("helicopter", ["hel", "i", "cop", "ter"]), ("caterpillar", ["cat", "er", "pil", "lar"]),
        ("watermelon", ["wa", "ter", "mel", "on"]), ("supermarket", ["su", "per", "mar", "ket"]),
        ("calculator", ["cal", "cu", "la", "tor"]), ("alligator", ["al", "li", "ga", "tor"]),
        ("invisible", ["in", "vis", "i", "ble"]), ("activity", ["ac", "tiv", "i", "ty"]),
        ("celebration", ["cel", "e", "bra", "tion"]), ("information", ["in", "for", "ma", "tion"]),
        ("television", ["tel", "e", "vi", "sion"]), ("environment", ["en", "vi", "ron", "ment"])],
    5: [("hippopotamus", ["hip", "po", "pot", "a", "mus"]), ("refrigerator", ["re", "frig", "er", "a", "tor"]),
        ("electricity", ["e", "lec", "tric", "i", "ty"]), ("unbelievable", ["un", "be", "liev", "a", "ble"]),
        ("imagination", ["i", "mag", "i", "na", "tion"]), ("communication", ["com", "mu", "ni", "ca", "tion"]),
        ("vocabulary", ["vo", "cab", "u", "lar", "y"]), ("opportunity", ["op", "por", "tu", "ni", "ty"]),
        ("personality", ["per", "son", "al", "i", "ty"]), ("university", ["u", "ni", "ver", "si", "ty"]),
        ("independent", ["in", "de", "pen", "dent"]), ("photographer", ["pho", "tog", "ra", "pher"])],
}

RHYMES = {
    1: [("cat", "hat", ["car", "cup", "cot"]), ("dog", "log", ["dig", "door", "den"]), ("sun", "run", ["sit", "sea", "sad"]),
        ("bed", "red", ["bad", "bin", "bus"]), ("pig", "wig", ["pan", "pet", "peg"]), ("hen", "ten", ["hat", "hop", "him"]),
        ("fox", "box", ["fan", "fig", "fun"]), ("bug", "rug", ["bag", "big", "bat"])],
    2: [("ship", "chip", ["shop", "shed", "shell"]), ("fish", "dish", ["fist", "fill", "film"]),
        ("duck", "truck", ["dark", "desk", "dock"]), ("ring", "king", ["rang", "rain", "road"]),
        ("clock", "sock", ["click", "clap", "cloud"]), ("shell", "bell", ["shall", "shelf", "ship"]),
        ("bath", "path", ["bat", "bark", "bake"]), ("moth", "cloth", ["mud", "map", "mouth"])],
    3: [("cake", "lake", ["cave", "kick", "coat"]), ("bike", "like", ["bake", "bone", "book"]),
        ("rain", "train", ["rail", "ran", "rose"]), ("boat", "coat", ["boot", "bat", "bird"]),
        ("feet", "sheet", ["feed", "fat", "foot"]), ("night", "light", ["nice", "knot", "net"]),
        ("bone", "phone", ["bun", "bean", "bin"]), ("tree", "three", ["try", "toy", "train"])],
    4: [("star", "car", ["stair", "stay", "stop"]), ("horn", "corn", ["hair", "hand", "hen"]),
        ("bird", "third", ["bread", "bed", "burn"]), ("shirt", "skirt", ["short", "shark", "sheet"]),
        ("fur", "her", ["far", "fire", "four"]), ("burn", "turn", ["barn", "born", "bun"]),
        ("nurse", "purse", ["nose", "nest", "news"]), ("storm", "form", ["stem", "steam", "stamp"])],
    5: [("rough", "tough", ["road", "roof", "rock"]), ("through", "blue", ["though", "thought", "thumb"]),
        ("caught", "short", ["cough", "catch", "cot"]), ("weight", "late", ["white", "wheat", "wet"]),
        ("bear", "chair", ["beer", "bean", "burn"]), ("eight", "plate", ["eat", "egg", "edge"]),
        ("key", "sea", ["kite", "kick", "cake"]), ("shoe", "two", ["show", "shy", "she"])],
}

# (target, answer, distractors, explanation)
FIRST_SOUND = {
    1: [("sun", "sock", ["fish", "map", "hat"], "sun and sock both start with /s/."),
        ("mum", "milk", ["nut", "web", "dog"], "mum and milk both start with /m/."),
        ("bat", "bus", ["dig", "pan", "van"], "bat and bus both start with /b/. Careful: b and d look alike!"),
        ("dad", "duck", ["bed", "pot", "cat"], "dad and duck both start with /d/."),
        ("pen", "pig", ["bin", "dog", "fan"], "pen and pig both start with /p/."),
        ("leg", "lip", ["red", "nut", "yes"], "leg and lip both start with /l/.")],
    2: [("ship", "shoe", ["sock", "chip", "hip"], "ship and shoe both start with /sh/."),
        ("chair", "cheese", ["shoe", "cat", "hair"], "chair and cheese both start with /ch/."),
        ("thumb", "think", ["tent", "fun", "sun"], "thumb and think both start with /th/."),
        ("phone", "fish", ["pen", "hop", "pot"], "ph sounds like /f/: phone and fish start with the same sound."),
        ("whale", "window", ["hat", "hole", "van"], "wh sounds like /w/: whale and window start with the same sound."),
        ("queen", "quiet", ["cup", "green", "kite"], "qu sounds like /kw/: queen and quiet.")],
    3: [("knee", "nose", ["key", "king", "kite"], "In knee the k is silent, so it starts with /n/ like nose."),
        ("write", "rabbit", ["wet", "wind", "white"], "In write the w is silent, so it starts with /r/ like rabbit."),
        ("city", "seven", ["cat", "kite", "cup"], "c before i sounds /s/: city and seven."),
        ("giant", "jelly", ["goat", "girl", "gate"], "g before i can sound /j/: giant and jelly."),
        ("cent", "sand", ["cat", "cot", "cup"], "c before e sounds /s/: cent and sand."),
        ("gem", "jam", ["get", "gum", "gas"], "g before e can sound /j/: gem and jam.")],
    4: [("gnome", "night", ["goal", "game", "gate"], "In gnome the g is silent, so it starts with /n/."),
        ("wrist", "ring", ["wet", "wolf", "wish"], "In wrist the w is silent, so it starts with /r/."),
        ("chef", "shop", ["chin", "chop", "cheese"], "In chef, ch sounds /sh/ (it comes from French)."),
        ("chemist", "kitten", ["chair", "chin", "cherry"], "In chemist, ch sounds /k/."),
        ("honest", "orange", ["hat", "hot", "house"], "In honest the h is silent, so it starts with a vowel sound."),
        ("knock", "nest", ["kick", "kind", "kite"], "In knock the k is silent, so it starts with /n/.")],
    5: [("psychology", "sight", ["park", "pen", "pass"], "In psychology the p is silent: it starts with /s/."),
        ("wholesome", "hope", ["wet", "wall", "wish"], "In wholesome the w is silent: it starts with /h/."),
        ("character", "cartoon", ["cherry", "church", "cheap"], "In character, ch sounds /k/."),
        ("machine", "shine", ["match", "much", "march"], "In machine, ch sounds /sh/."),
        ("cereal", "silver", ["carrot", "cold", "cub"], "c before e sounds /s/: cereal and silver."),
        ("gymnastics", "jungle", ["goose", "gold", "gift"], "g before y sounds /j/: gymnastics and jungle.")],
}

# Same vowel sound
VOWEL_SOUND = {
    1: [("cat", "map", ["cup", "pen", "dog"], "cat and map have the short a sound."),
        ("pig", "fin", ["pen", "pan", "pot"], "pig and fin have the short i sound."),
        ("dog", "hot", ["dig", "cut", "hat"], "dog and hot have the short o sound."),
        ("bed", "leg", ["bad", "bid", "bud"], "bed and leg have the short e sound."),
        ("cup", "bus", ["cap", "cop", "kit"], "cup and bus have the short u sound."),
        ("sit", "lip", ["sat", "set", "sun"], "sit and lip have the short i sound.")],
    2: [("ship", "milk", ["shop", "shut", "shell"], "ship and milk have the short i sound."),
        ("chop", "frog", ["chip", "chin", "chat"], "chop and frog have the short o sound."),
        ("much", "duck", ["match", "mesh", "milk"], "much and duck have the short u sound."),
        ("thank", "black", ["think", "thump", "thick"], "thank and black have the short a sound."),
        ("bell", "dress", ["ball", "bill", "bull"], "bell and dress have the short e sound."),
        ("lunch", "drum", ["latch", "lamp", "lift"], "lunch and drum have the short u sound.")],
    3: [("rain", "cake", ["ran", "rice", "rope"], "ai in rain and a-e in cake make the same long a sound."),
        ("feet", "beach", ["fit", "fat", "foot"], "ee in feet and ea in beach make the same long e sound."),
        ("boat", "home", ["boot", "bat", "bite"], "oa in boat and o-e in home make the same long o sound."),
        ("night", "kite", ["nut", "net", "knot"], "igh in night and i-e in kite make the same long i sound."),
        ("play", "train", ["plan", "plum", "pull"], "ay in play and ai in train make the same long a sound."),
        ("snow", "goat", ["snap", "sniff", "snug"], "ow in snow and oa in goat make the same long o sound.")],
    4: [("star", "park", ["stair", "stir", "store"], "star and park have the ar sound."),
        ("bird", "fur", ["bored", "bed", "bud"], "ir in bird and ur in fur make the same sound."),
        ("horn", "door", ["hen", "hair", "hurt"], "or in horn and oor in door make the same sound."),
        ("coin", "boy", ["cone", "can", "corn"], "oi in coin and oy in boy make the same sound."),
        ("cloud", "cow", ["clue", "clap", "cold"], "ou in cloud and ow in cow make the same sound."),
        ("moon", "blue", ["moan", "man", "men"], "oo in moon and ue in blue make the same sound.")],
    5: [("bread", "head", ["bead", "bride", "breed"], "Careful: ea can sound like short e, as in bread and head."),
        ("great", "plate", ["greet", "grit", "grip"], "In great, ea sounds like long a, as in plate."),
        ("could", "wood", ["cloud", "cold", "cod"], "ou in could sounds like oo in wood."),
        ("friend", "bend", ["fried", "fiend", "find"], "In friend, ie sounds like short e."),
        ("touch", "much", ["torch", "teach", "couch"], "In touch, ou sounds like short u."),
        ("heart", "start", ["heard", "hurt", "hate"], "In heart, ea sounds like ar.")],
}

DICTATION = {
    1: ["cat", "dog", "sun", "bed", "pig", "hen", "cup", "fox", "jam", "web", "net", "mud"],
    2: ["ship", "chop", "thin", "duck", "frog", "crab", "shell", "lunch", "black", "swim", "sing", "moth"],
    3: ["cake", "bike", "home", "cube", "rain", "tree", "boat", "night", "play", "snow", "feet", "slide"],
    4: ["star", "horn", "bird", "shirt", "turn", "purple", "garden", "corner", "river", "chair", "cloud", "coin"],
    5: ["knife", "write", "lamb", "phone", "laugh", "station", "picture", "island", "school", "eight", "thumb", "castle"],
}
DICT_NOTES = {
    "night": "igh makes the long i sound.", "boat": "oa makes the long o sound.", "rain": "ai makes the long a sound.",
    "play": "ay at the end of a word.", "snow": "ow makes the long o sound.", "feet": "ee makes the long e sound.",
    "cake": "The magic e makes the a say its name.", "bike": "The magic e makes the i say its name.",
    "home": "The magic e makes the o say its name.", "cube": "The magic e makes the u say its name.",
    "slide": "The magic e makes the i say its name.", "tree": "ee makes the long e sound.",
    "knife": "The k is silent.", "write": "The w is silent.", "lamb": "The b is silent.", "phone": "ph sounds /f/.",
    "laugh": "gh sounds /f/ here.", "station": "tion sounds /shun/.", "picture": "ture sounds /cher/.",
    "island": "The s is silent.", "school": "ch sounds /k/.", "eight": "eigh makes the long a sound.",
    "thumb": "The b is silent.", "castle": "The t is silent.", "shell": "Double l at the end.",
    "duck": "ck at the end of a short word.", "black": "ck at the end of a short word.", "lunch": "nch at the end.",
    "moth": "th at the end.", "sing": "ng at the end.", "coin": "oi in the middle of the word.",
    "cloud": "ou makes the ow sound.", "chair": "air at the end.", "purple": "ur and then ple.",
}

ODD_SOUND = {
    2: [("Which word does NOT have the 'sh' sound?", "chip", ["shop", "fish", "shell"], "chip has the 'ch' sound, not 'sh'."),
        ("Which word does NOT have the 'th' sound?", "tent", ["thin", "bath", "three"], "tent starts with t, not th.")],
    3: [("Which word does NOT have a long a sound?", "cat", ["rain", "cake", "play"], "cat has a short a."),
        ("Which word does NOT have a long e sound?", "bed", ["tree", "leaf", "me"], "bed has a short e.")],
    4: [("Which word does NOT have the 'ar' sound?", "war", ["car", "farm", "star"], "In war, ar sounds like 'or'."),
        ("Which word does NOT have the 'ow' sound of 'cow'?", "snow", ["town", "brown", "owl"], "In snow, ow is a long o.")],
    5: [("Which word does NOT have a silent letter?", "plant", ["knot", "wrap", "comb"], "knot (k), wrap (w) and comb (b) have silent letters."),
        ("Which word does NOT have the 'f' sound?", "light", ["phone", "laugh", "graph"], "In light, gh is silent. In laugh it sounds /f/.")],
}


def build(b):
    for level in range(1, 6):
        count_opts = ["1", "2", "3", "4"] if level <= 3 else (["2", "3", "4", "5"] if level == 4 else ["3", "4", "5", "6"])
        for word, syl in SYLLABLES[level]:
            n = str(len(syl))
            b.mc(M, level, f"How many syllables are there in '{word}'?", n, [o for o in count_opts if o != n],
                 f"{'-'.join(syl)} = {n} syllable{'s' if n != '1' else ''}", word=word, syllables=syl)
        multi = [(w, s) for w, s in SYLLABLES[level] if len(s) > 1]
        for word, syl in multi[:9]:
            b.order(M, level, "Put the syllables in order to make the word", syl, f"{'-'.join(syl)} = {word}", word=word)
        for word, rhyme, wrong in RHYMES[level]:
            b.mc(M, level, f"Which word rhymes with '{word}'?", rhyme, wrong, f"'{word}' and '{rhyme}' rhyme: they end with the same sound.", word=word)
        for target, ans, wrong, expl in FIRST_SOUND[level]:
            b.mc(M, level, f"Which word starts with the same sound as '{target}'?", ans, wrong, expl, word=target)
        for target, ans, wrong, expl in VOWEL_SOUND[level]:
            b.mc(M, level, f"Which word has the same vowel sound as '{target}'?", ans, wrong, expl, word=target)
        for prompt, ans, wrong, expl in ODD_SOUND.get(level, []):
            b.mc(M, level, prompt, ans, wrong, expl)
        for w in DICTATION[level]:
            note = DICT_NOTES.get(w, '')
            b.write(M, level, "Listen and write the word", w, f"It has {len(w)} letters",
                    (f"{'-'.join(w)}. {note}").strip(), dictation=True)
