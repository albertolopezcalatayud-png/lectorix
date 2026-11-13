# English quick challenges (id: retos_rapidos)
M = 'retos_rapidos'

SYN = {  # word: (synonym, wrong)
1: [("big", "large", ["small", "red", "slow"]), ("happy", "glad", ["sad", "cold", "late"]), ("fast", "quick", ["slow", "tall", "wet"]),
    ("little", "small", ["huge", "loud", "old"]), ("shut", "close", ["open", "jump", "sing"]), ("kind", "nice", ["mean", "cold", "loud"])],
2: [("begin", "start", ["finish", "stop", "sleep"]), ("shout", "yell", ["whisper", "sing", "smile"]), ("scared", "afraid", ["brave", "happy", "bored"]),
    ("tired", "sleepy", ["lively", "angry", "hungry"]), ("look", "see", ["hear", "eat", "run"]), ("easy", "simple", ["hard", "long", "dark"])],
3: [("enormous", "huge", ["tiny", "quiet", "early"]), ("silent", "quiet", ["noisy", "sunny", "funny"]), ("brave", "fearless", ["timid", "lazy", "rude"]),
    ("difficult", "hard", ["easy", "soft", "light"]), ("tidy", "neat", ["messy", "dirty", "busy"]), ("wealthy", "rich", ["poor", "weak", "thin"])],
4: [("ancient", "very old", ["brand new", "very fast", "very small"]), ("furious", "very angry", ["very calm", "very cold", "very tired"]),
    ("fragile", "easily broken", ["very strong", "very heavy", "very bright"]), ("exhausted", "very tired", ["very awake", "very excited", "very hungry"]),
    ("delighted", "very pleased", ["very upset", "very bored", "very scared"]), ("gigantic", "enormous", ["minute", "average", "narrow"])],
5: [("reluctant", "unwilling", ["eager", "careless", "honest"]), ("cautious", "careful", ["reckless", "cheerful", "curious"]),
    ("abundant", "plentiful", ["scarce", "fragile", "silent"]), ("vivid", "bright", ["dull", "slow", "rough"]),
    ("frequently", "often", ["rarely", "never", "slowly"]), ("conceal", "hide", ["reveal", "build", "follow"])],
}
ANT = {
1: [("hot", "cold", ["warm", "red", "big"]), ("up", "down", ["over", "top", "on"]), ("day", "night", ["sun", "week", "noon"]),
    ("old", "new", ["big", "tall", "slow"]), ("wet", "dry", ["cold", "soft", "full"]), ("happy", "sad", ["glad", "kind", "fast"])],
2: [("open", "closed", ["empty", "full", "wide"]), ("early", "late", ["fast", "soon", "first"]), ("heavy", "light", ["big", "strong", "thick"]),
    ("loud", "quiet", ["noisy", "sharp", "deep"]), ("push", "pull", ["press", "kick", "hold"]), ("win", "lose", ["play", "beat", "score"])],
3: [("brave", "cowardly", ["bold", "strong", "proud"]), ("generous", "selfish", ["kind", "friendly", "polite"]), ("arrive", "leave", ["reach", "enter", "stay"]),
    ("ancient", "modern", ["old", "historic", "dusty"]), ("shallow", "deep", ["narrow", "short", "flat"]), ("rough", "smooth", ["hard", "bumpy", "dry"])],
4: [("victory", "defeat", ["triumph", "success", "prize"]), ("expand", "shrink", ["grow", "stretch", "widen"]), ("permanent", "temporary", ["lasting", "stable", "fixed"]),
    ("innocent", "guilty", ["honest", "pure", "calm"]), ("include", "exclude", ["contain", "add", "involve"]), ("maximum", "minimum", ["most", "biggest", "total"])],
5: [("transparent", "opaque", ["clear", "glassy", "bright"]), ("optimistic", "pessimistic", ["hopeful", "cheerful", "positive"]),
    ("scarce", "plentiful", ["rare", "limited", "short"]), ("praise", "criticise", ["admire", "applaud", "thank"]),
    ("voluntary", "compulsory", ["optional", "free", "willing"]), ("ascend", "descend", ["climb", "rise", "mount"])],
}
ODD = {
1: [(["cat", "dog", "cow"], "apple", "apple is a fruit; the others are animals."), (["red", "blue", "green"], "chair", "chair is furniture; the others are colours."),
    (["one", "two", "three"], "cake", "cake is food; the others are numbers.")],
2: [(["banana", "pear", "grape"], "carrot", "carrot is a vegetable; the others are fruits."), (["Monday", "Friday", "Sunday"], "March", "March is a month; the others are days."),
    (["car", "bus", "train"], "bridge", "a bridge is not a vehicle.")],
3: [(["shark", "whale", "dolphin"], "eagle", "an eagle flies; the others live in the sea."), (["violin", "guitar", "piano"], "hammer", "a hammer is a tool, not an instrument."),
    (["spring", "summer", "autumn"], "Tuesday", "Tuesday is a day; the others are seasons.")],
4: [(["Mars", "Venus", "Jupiter"], "Moon", "the Moon is not a planet."), (["triangle", "square", "circle"], "cube", "a cube is 3D; the others are flat shapes."),
    (["run", "jump", "swim"], "happy", "happy is an adjective; the others are verbs.")],
5: [(["quickly", "slowly", "loudly"], "lovely", "lovely is an adjective; the others are adverbs."), (["Paris", "Madrid", "Rome"], "France", "France is a country; the others are capital cities."),
    (["liquid", "solid", "gas"], "metal", "metal is a material; the others are states of matter.")],
}
CLASS = {
1: [("Which word is an animal?", "horse", ["table", "blue", "jump"], "A horse is an animal."),
    ("Which word is a colour?", "pink", ["pig", "pen", "pot"], "Pink is a colour.")],
2: [("Which word is a verb (an action)?", "run", ["red", "dog", "box"], "'run' is something you do: a verb."),
    ("Which word is a noun (a thing)?", "chair", ["sing", "happy", "quickly"], "A chair is a thing: a noun.")],
3: [("Which word is an adjective (it describes)?", "fluffy", ["jump", "garden", "slowly"], "'fluffy' describes something: an adjective."),
    ("Which word is a verb?", "whisper", ["silent", "pillow", "soft"], "'whisper' is an action: a verb.")],
4: [("Which word is an adverb?", "carefully", ["careful", "care", "careless"], "'carefully' tells us how: an adverb."),
    ("Which word is a pronoun?", "they", ["table", "under", "quick"], "'they' replaces a noun: a pronoun.")],
5: [("Which word is a preposition?", "beneath", ["beautiful", "believe", "because"], "'beneath' tells us where: a preposition."),
    ("Which word is a conjunction?", "although", ["always", "already", "almost"], "'although' joins two ideas: a conjunction.")],
}
FIRST_ABC = {
1: [["ant", "cat", "dog", "pig"], ["bed", "hat", "map", "sun"]],
2: [["apple", "banana", "lemon", "orange"], ["chair", "door", "lamp", "table"]],
3: [["bat", "bed", "big", "box"], ["cake", "coat", "cup", "kite"]],
4: [["sand", "seed", "sock", "sun"], ["ship", "shoe", "shop", "shut"]],
5: [["plain", "plan", "plant", "play"], ["stair", "star", "start", "stay"]],
}
PLURAL = {
1: [("cat", "cats", ["cates", "catz", "cat's"]), ("box", "boxes", ["boxs", "boxies", "box's"])],
2: [("baby", "babies", ["babys", "babyes", "babis"]), ("bush", "bushes", ["bushs", "bushies", "bush's"])],
3: [("mouse", "mice", ["mouses", "mices", "mousies"]), ("leaf", "leaves", ["leafs", "leafes", "leavs"])],
4: [("knife", "knives", ["knifes", "knivs", "knifies"]), ("tooth", "teeth", ["tooths", "teeths", "toothes"])],
5: [("woman", "women", ["womans", "womens", "womanes"]), ("crisis", "crises", ["crisises", "crisiss", "crisi"])],
}
SERIES = {
1: [("Monday, Tuesday, ___", "Wednesday", ["Friday", "Sunday", "Monday"]), ("one, two, three, ___", "four", ["five", "six", "ten"])],
2: [("January, February, ___", "March", ["April", "May", "June"]), ("spring, summer, ___", "autumn", ["winter", "spring", "May"])],
3: [("Thursday, Friday, ___", "Saturday", ["Sunday", "Monday", "Tuesday"]), ("ten, twenty, thirty, ___", "forty", ["fourty", "fifty", "thirteen"])],
4: [("October, November, ___", "December", ["January", "September", "August"]), ("first, second, third, ___", "fourth", ["forth", "fifth", "fourteenth"])],
5: [("past, present, ___", "future", ["future tense", "present perfect", "history"]), ("solid, liquid, ___", "gas", ["water", "ice", "steam"])],
}
LETTERS = {1: ["cat", "frog", "sun", "bird"], 2: ["chair", "shell", "thank", "queen"], 3: ["elephant", "rainbow", "teacher", "flower"],
           4: ["butterfly", "chocolate", "important", "dinosaur"], 5: ["Wednesday", "necessary", "neighbour", "environment"]}
SPELL_ORDER = {1: ["d", "o", "g"], 2: ["f", "i", "s", "h"], 3: ["p", "l", "a", "n", "t"], 4: ["s", "p", "i", "d", "e", "r"],
               5: ["c", "a", "s", "t", "l", "e"]}
SPELL_ORDER2 = {1: ["b", "e", "d"], 2: ["d", "u", "c", "k"], 3: ["t", "r", "a", "i", "n"], 4: ["g", "a", "r", "d", "e", "n"],
                5: ["k", "n", "i", "g", "h", "t"]}
COMPOUND = {
1: [("sun", "flower", ["shoe", "cup", "red"]), ("foot", "ball", ["dog", "hat", "milk"])],
2: [("rain", "bow", ["cat", "pen", "fish"]), ("tooth", "brush", ["chair", "lamp", "bird"])],
3: [("butter", "fly", ["cup", "ten", "sun"]), ("snow", "man", ["pig", "jam", "box"])],
4: [("light", "house", ["pencil", "river", "apple"]), ("week", "end", ["cake", "hill", "door"])],
5: [("every", "thing", ["table", "garden", "window"]), ("some", "times", ["chairs", "rivers", "pencils"])],
}


def _mix(words):
    """Shows the group in a fixed but varied order, so the odd word is not always the last one."""
    import hashlib
    return sorted(words, key=lambda w: hashlib.md5(w.encode('utf-8')).hexdigest())


def build(b):
    for level in range(1, 6):
        for w, s, wrong in SYN[level]:
            b.mc(M, level, f"Which word means the same as '{w}'?", s, wrong, f"'{w}' and '{s}' mean the same.")
        for w, a, wrong in ANT[level]:
            b.mc(M, level, f"What is the opposite of '{w}'?", a, wrong, f"The opposite of '{w}' is '{a}'.")
        for group, odd, expl in ODD[level]:
            b.mc(M, level, f"Which word is the odd one out? {', '.join(_mix(group + [odd]))}", odd, group, expl.capitalize())
        for prompt, ans, wrong, expl in CLASS[level]:
            b.mc(M, level, prompt, ans, wrong, expl)
        for words in FIRST_ABC[level]:
            b.mc(M, level, "Which word comes first in the dictionary?", words[0], words[1:], f"Alphabetical order: {', '.join(words)}.")
        for one, many, wrong in PLURAL[level]:
            b.mc(M, level, f"What is the plural of '{one}'?", many, wrong, f"one {one}, two {many}.")
        for seq, ans, wrong in SERIES[level]:
            b.mc(M, level, f"Complete the series: {seq}", ans, wrong, f"The next one is '{ans}'.")
        for w in LETTERS[level]:
            n = len(w)
            b.mc(M, level, f"How many letters are there in '{w}'?", str(n), [str(n - 1), str(n + 1), str(n + 2)], f"{'-'.join(w)} = {n} letters.")
        for first, second, wrong in COMPOUND[level]:
            b.mc(M, level, f"Which word makes a new word with '{first}'?", second, wrong, f"{first} + {second} = {first}{second}.")
        for letters in (SPELL_ORDER[level], SPELL_ORDER2[level]):
            word = ''.join(letters)
            b.order(M, level, f"Put the letters in order to spell '{word.upper()}'", [l.upper() for l in letters], f"{'-'.join(letters).upper()} = {word.upper()}")
