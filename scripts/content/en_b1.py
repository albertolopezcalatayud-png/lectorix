# English (British) — levels 6 (B1) and 7 (B1+), written for learners whose first language is Spanish or Valencian.
# Explanations that mention "Spanish speakers" mark typical transfer mistakes (they feed the skill map).

# ── PHONOLOGY ─────────────────────────────────────────────
F = 'fonologia'

SIL = {
6: [("telephone", ["tel", "e", "phone"]), ("biology", ["bi", "ol", "o", "gy"]), ("geography", ["ge", "og", "ra", "phy"]),
    ("intelligent", ["in", "tel", "li", "gent"]), ("population", ["pop", "u", "la", "tion"]), ("photography", ["pho", "tog", "ra", "phy"])],
7: [("responsibility", ["re", "spon", "si", "bil", "i", "ty"]), ("Mediterranean", ["Med", "i", "ter", "ra", "ne", "an"]), ("disability", ["dis", "a", "bil", "i", "ty"]),
    ("curiosity", ["cu", "ri", "os", "i", "ty"]), ("possibility", ["pos", "si", "bil", "i", "ty"]), ("enthusiastic", ["en", "thu", "si", "as", "tic"])],
}

# Word stress: (word, syllables, stressed index)
STRESS = {
6: [("photograph", ["pho", "to", "graph"], 0), ("photographer", ["pho", "tog", "ra", "pher"], 1), ("hotel", ["ho", "tel"], 1),
    ("potato", ["po", "ta", "to"], 1), ("computer", ["com", "pu", "ter"], 1), ("Saturday", ["Sat", "ur", "day"], 0)],
7: [("economy", ["e", "con", "o", "my"], 1), ("economic", ["e", "co", "nom", "ic"], 2), ("advertisement", ["ad", "ver", "tise", "ment"], 1),
    ("development", ["de", "vel", "op", "ment"], 1), ("technology", ["tech", "nol", "o", "gy"], 1), ("photographic", ["pho", "to", "graph", "ic"], 2)],
}

# Same vowel sound (minimal pairs that Spanish speakers often mix up)
SAME = {
6: [("ship", "lip", ["sheep", "leap", "seat"], "ship and lip have the short /ɪ/ sound; sheep has the long /iː/. Spanish speakers often say them the same."),
    ("sheep", "leaf", ["ship", "lip", "sit"], "sheep and leaf have the long /iː/ sound."),
    ("full", "push", ["fool", "food", "moon"], "full and push have the short /ʊ/; fool has the long /uː/."),
    ("cat", "black", ["cut", "cup", "bus"], "cat and black have /æ/; cut has /ʌ/."),
    ("cut", "love", ["cat", "cap", "bat"], "cut and love have /ʌ/ (like a short, relaxed 'a').")],
7: [("work", "bird", ["walk", "short", "warm"], "work and bird have /ɜː/; walk has /ɔː/."),
    ("walk", "door", ["work", "word", "bird"], "walk and door have /ɔː/; the l in walk is silent."),
    ("hat", "map", ["heart", "hut", "hot"], "hat and map have /æ/; heart has /ɑː/."),
    ("heart", "car", ["hat", "hurt", "hot"], "heart and car have the long /ɑː/ sound."),
    ("boat", "phone", ["bought", "but", "bat"], "boat and phone have /əʊ/; bought has /ɔː/.")],
}

# Silent letters
SILENT = {
6: [("Which word has a silent letter?", "knife", ["kite", "nice", "fine"], "In knife, the k is silent: /naɪf/."),
    ("Which letter is silent in 'island'?", "s", ["i", "l", "d"], "island is pronounced /ˈaɪlənd/: the s is silent."),
    ("Which letter is silent in 'listen'?", "t", ["l", "s", "n"], "listen is pronounced /ˈlɪsn/: the t is silent."),
    ("Which word has a silent 'w'?", "write", ["word", "west", "want"], "In write, the w is silent: /raɪt/.")],
7: [("Which letter is silent in 'Wednesday'?", "the first d", ["the w", "the s", "the y"], "Wednesday is pronounced /ˈwenzdeɪ/: the first d is silent."),
    ("Which word has a silent 'b'?", "climb", ["club", "black", "bubble"], "In climb, the b is silent: /klaɪm/."),
    ("Which letter is silent in 'receipt'?", "p", ["r", "c", "t"], "receipt is pronounced /rɪˈsiːt/: the p is silent."),
    ("Which word has a silent 'h'?", "honest", ["house", "happy", "hotel"], "In honest, the h is silent: we say 'an honest person'.")],
}

# Pronunciation of -ed
ED = {
6: [("walked", "/t/"), ("played", "/d/"), ("wanted", "/ɪd/"), ("watched", "/t/"), ("needed", "/ɪd/")],
7: [("laughed", "/t/"), ("decided", "/ɪd/"), ("cleaned", "/d/"), ("fixed", "/t/"), ("started", "/ɪd/")],
}
ED_WHY = {
    "/t/": "after voiceless sounds like /k/, /tʃ/, /f/, /s/ the -ed sounds /t/: one syllable.",
    "/d/": "after voiced sounds the -ed sounds /d/: one syllable.",
    "/ɪd/": "after /t/ or /d/ the -ed is an extra syllable /ɪd/.",
}

DICT = {
6: [("I have lived in Valencia since I was six.", "lived, since"),
    ("We were watching a film when the lights went out.", "watching, lights"),
    ("If it rains tomorrow, we will stay at home.", "tomorrow, will"),
    ("My brother is taller than me, but I am faster.", "taller, faster"),
    ("Have you ever been to London?", "ever, been"),
    ("She enjoys reading books about science.", "enjoys, science")],
7: [("The museum was built more than a hundred years ago.", "museum, built"),
    ("If I had more time, I would learn to play the guitar.", "would, guitar"),
    ("She told me that she had already finished her homework.", "already, finished"),
    ("You mustn't use your phone during the exam.", "mustn't, during"),
    ("The people who live next door are very friendly.", "people, friendly"),
    ("I'm looking forward to seeing you next weekend.", "forward, seeing")],
}


def build_fon(b):
    for level in (6, 7):
        for w, s in SIL[level]:
            n = len(s)
            wrong = sorted([str(x) for x in range(max(1, n - 2), n + 3) if x != n], key=lambda o: abs(int(o) - n))[:3]
            b.mc(F, level, f"How many syllables are there in '{w}'?", str(n), wrong, f"{'-'.join(s)} = {n} syllables", word=w, syllables=s)
        for w, s in SIL[level][:4]:
            b.order(F, level, "Put the syllables in order to make the word", s, f"{'-'.join(s)} = {w}", word=w)
        for w, s, i in STRESS[level]:
            b.mc(F, level, f"Which syllable is stressed in '{w}'?", s[i], [x for j, x in enumerate(s) if j != i][:3],
                 f"We say {'-'.join(x.upper() if j == i else x for j, x in enumerate(s))}.", word=w)
        for w, same, wrong, expl in SAME[level]:
            b.mc(F, level, f"Which word has the same vowel sound as '{w}'?", same, wrong, expl, word=w)
        for prompt, a, wrong, expl in SILENT[level]:
            b.mc(F, level, prompt, a, wrong, expl)
        for w, snd in ED[level]:
            b.mc(F, level, f"How do you say the -ed at the end of '{w}'?", snd, [x for x in ("/t/", "/d/", "/ɪd/") if x != snd],
                 f"'{w}': {ED_WHY[snd]}", word=w)
        for sentence, hint in DICT[level]:
            b.write(F, level, "Listen and write the sentence", sentence, f"Careful with: {hint}", "Check capital letters, apostrophes and the full stop.", dictation=True)


# ── VISUAL MEMORY ─────────────────────────────────────────
MV = 'memoria_visual'
SPELL = {
6: [("neighbour", ["nieghbour", "neighbur", "naighbour"]), ("beautiful", ["beatifull", "bueatiful", "beautyful"]), ("different", ["diferent", "differant", "diffrent"]),
    ("believe", ["beleive", "belive", "bilieve"]), ("friend", ["freind", "frend", "friendd"]), ("business", ["bussiness", "busness", "buisness"]),
    ("tomorrow", ["tommorow", "tomorow", "tommorrow"]), ("favourite", ["favorit", "favourit", "faverite"]), ("because", ["becuase", "becouse", "beacause"]),
    ("Wednesday", ["Wensday", "Wendsday", "Wednsday"]), ("February", ["Febuary", "Februry", "Febrary"]), ("restaurant", ["restaurent", "resturant", "restorant"]),
    ("separate", ["seperate", "separete", "seprate"]), ("library", ["libary", "librery", "liberry"]), ("government", ["goverment", "govermant", "governmant"]),
    ("environment", ["enviroment", "environmant", "envirnment"])],
7: [("accommodation", ["accomodation", "acommodation", "acomodation"]), ("definitely", ["definately", "definitly", "defenitely"]), ("weird", ["wierd", "weerd", "wyrd"]),
    ("embarrassed", ["embarassed", "embarrassd", "emberrassed"]), ("occasionally", ["ocassionally", "occasionaly", "occassionally"]), ("immediately", ["imediately", "immediatly", "immedietly"]),
    ("disappear", ["dissapear", "disapear", "dissappear"]), ("rhythm", ["rythm", "rhythym", "ryhthm"]), ("conscious", ["concious", "consious", "conscous"]),
    ("existence", ["existance", "existense", "exsistence"]), ("pronunciation", ["pronounciation", "pronunsiation", "prononciation"]), ("successful", ["succesful", "sucessful", "successfull"]),
    ("address", ["adress", "addres", "adresse"]), ("professional", ["proffesional", "professionnal", "profesional"]), ("vegetable", ["vegtable", "vegetabel", "vejetable"]),
    ("knowledge", ["knowlege", "knoledge", "nowledge"])],
}
SPELL_NOTES = {
    "neighbour": "British spelling keeps the u: neigh-bour.", "different": "Double f.", "believe": "i before e: bel-ie-ve.", "friend": "fri-end: the i comes first.",
    "business": "bus-i-ness.", "tomorrow": "One m, double r.", "favourite": "British spelling keeps the u.", "Wednesday": "Wed-nes-day: the d is silent.",
    "February": "Feb-ru-ary: don't forget the r.", "separate": "There is 'a rat' in separate.", "library": "li-brar-y: two r's.",
    "government": "govern + ment: keep the n.", "environment": "environ + ment: keep the n.", "accommodation": "Double c and double m.",
    "definitely": "defin-ite-ly: think of 'finite'.", "weird": "weird breaks the rule: e before i.", "embarrassed": "Double r and double s.",
    "disappear": "dis + appear: one s, double p.", "rhythm": "No vowels except y: r-h-y-t-h-m.", "pronunciation": "pronounce → pronunciation: the o goes.",
    "successful": "Double c, double s, one l at the end.", "address": "Double d, double s.", "knowledge": "know + ledge: silent k.",
}
PARON = {
6: [("their", ["there", "they're", "theirs"]), ("quite", ["quiet", "quit", "quiets"]), ("lose", ["loose", "lost", "loss"]),
    ("advice", ["advise", "advices", "device"]), ("though", ["through", "thought", "tough"])],
7: [("affect", ["effect", "afect", "infect"]), ("accept", ["except", "expect", "access"]), ("principal", ["principle", "principally", "princely"]),
    ("desert", ["dessert", "deserve", "desserts"]), ("stationary", ["stationery", "station", "nationary"])],
}
ALPHA = {6: [["thank", "think", "though", "through"], ["weather", "Wednesday", "weight", "weird"]],
         7: [["accept", "access", "accident", "accommodation"], ["principal", "principle", "prison", "private"]]}
ORD = ["1st", "2nd", "3rd", "4th", "5th"]


def build_mem(b):
    prompts = ["Which word is spelled correctly?", "Choose the word that is spelled right:", "Which one has no mistakes?", "Find the correct spelling:"]
    for level in (6, 7):
        for i, (w, wrong) in enumerate(SPELL[level]):
            b.mc(MV, level, prompts[i % 4], w, wrong, (f"It is spelled '{w}'. {SPELL_NOTES.get(w, '')}").strip())
        for w, wrong in PARON[level]:
            b.mc(MV, level, f"Find the word '{w}'", w, wrong, f"Look carefully: {'-'.join(w)}.")
        for k, (w, wrong) in enumerate(PARON[level]):
            pos = (k * 2 + level) % 5
            seq = [w] * 5
            seq[pos] = wrong[0]
            b.mc(MV, level, f"Which one is different: {', '.join(seq)}?", ORD[pos], [o for o in ORD if o != ORD[pos]][:3], f"The {ORD[pos]} is '{wrong[0]}', not '{w}'.")
        for items in ALPHA[level]:
            b.order(MV, level, "Put the words in alphabetical order", items, f"Alphabetical order: {', '.join(items)}.")


# ── READING COMPREHENSION ─────────────────────────────────
C = 'comprension_lectora'
P = {
6: [
 ("Hi Jake, thanks for your email! I've been in Bristol for two weeks now and I really like it. My host family is very kind and they've already taken me to the harbour and to a football match. The only problem is the weather: it has rained almost every day. Classes start at nine, so I have to get up early. Write soon! Lucía",
  [("Why is Lucía in Bristol?", "She is staying with a host family and going to classes", ["She lives there with her parents", "She is on a football team", "She works at the harbour"], "She mentions her host family and her classes."),
   ("How long has she been in Bristol?", "Two weeks", ["Two days", "Two months", "A year"], "'I've been in Bristol for two weeks now.'"),
   ("What does she NOT like?", "The rainy weather", ["Her host family", "The football match", "The harbour"], "'The only problem is the weather.'"),
   ("What kind of text is this?", "An informal email", ["A news report", "A recipe", "A formal letter"], "It starts with 'Hi Jake' and ends 'Write soon!'.")]),
 ("Our school is organising a charity run on Saturday 14th March. Students can choose a 2 km or a 5 km route around the park. Each runner pays £3, and all the money will go to the local animal shelter. Sign up with Mr Hughes before Friday. Don't forget to bring water and a hat!",
  [("What is the purpose of this text?", "To invite students to a charity event", ["To sell a hat", "To describe a park", "To explain how to run faster"], "It gives information about a charity run."),
   ("Who will receive the money?", "The local animal shelter", ["The school", "Mr Hughes", "The park"], "'all the money will go to the local animal shelter.'"),
   ("What is the latest day to sign up?", "Before Friday", ["Saturday", "14th March", "Any time"], "'Sign up with Mr Hughes before Friday.'"),
   ("How much does each runner pay?", "£3", ["£2", "£5", "Nothing"], "'Each runner pays £3.'")]),
 ("When Maya opened the box, she couldn't believe her eyes. Inside was the old camera that her grandfather had used for forty years. Next to it there was a note: 'Now it's your turn to capture the world.' Maya smiled, put the strap around her neck and went outside to take her first photo.",
  [("What was in the box?", "An old camera", ["A new phone", "A photo album", "A watch"], "'Inside was the old camera.'"),
   ("Who did the camera belong to?", "Her grandfather", ["Her father", "Her teacher", "Her friend"], "'that her grandfather had used for forty years.'"),
   ("What does 'capture the world' mean here?", "Take photos of the world", ["Travel around the world", "Catch animals", "Win a competition"], "With a camera, to capture means to take a picture."),
   ("How does Maya feel at the end?", "Happy and excited", ["Angry", "Bored", "Scared"], "She smiles and goes out to take her first photo.")]),
 ("Many teenagers say they feel tired at school. Experts recommend that people aged 13 to 18 sleep between eight and ten hours a night. However, phones and late homework often keep them awake. A simple tip is to switch off screens an hour before bed.",
  [("How many hours should teenagers sleep?", "Between eight and ten", ["Five or six", "Exactly seven", "More than twelve"], "'between eight and ten hours a night.'"),
   ("Which word could replace 'However'?", "But", ["Because", "So", "And"], "'However' introduces a contrast, like 'but'."),
   ("What keeps teenagers awake, according to the text?", "Phones and late homework", ["Noisy neighbours", "Hunger", "Sports"], "'phones and late homework often keep them awake.'"),
   ("What advice does the text give?", "Switch off screens an hour before bed", ["Drink coffee", "Do homework at night", "Sleep at school"], "'switch off screens an hour before bed.'")]),
 ("The London Underground, or 'the Tube', opened in 1863. It was the first underground railway in the world. Today it has eleven lines and carries millions of passengers every day. Its famous map, with straight lines and bright colours, was designed by Harry Beck in 1931.",
  [("When did the London Underground open?", "In 1863", ["In 1931", "In 1963", "In 1836"], "'opened in 1863.'"),
   ("What makes it special in history?", "It was the first underground railway in the world", ["It was the longest", "It was free", "It had no trains"], "'It was the first underground railway in the world.'"),
   ("Who designed the famous map?", "Harry Beck", ["The Queen", "A train driver", "Nobody knows"], "'was designed by Harry Beck in 1931.'"),
   ("What is 'the Tube'?", "Another name for the London Underground", ["A type of bus", "A London river", "A famous map"], "The text says 'or the Tube'.")]),
],
7: [
 ("Some people believe that homework should be banned. They argue that students already spend many hours at school and need time to rest and do other activities. On the other hand, supporters say homework helps students to practise and become more independent. In my opinion, a small amount of useful homework is better than none at all.",
  [("What is the writer's opinion?", "A little useful homework is better than none", ["Homework should be banned", "Students need more homework", "Homework is always useless"], "'In my opinion, a small amount of useful homework is better than none at all.'"),
   ("What does 'On the other hand' introduce?", "The opposite point of view", ["An example", "The conclusion", "A question"], "It introduces the arguments of the other side."),
   ("Which is an argument AGAINST homework?", "Students need time to rest", ["It helps them practise", "It makes them independent", "It is useful"], "'need time to rest and do other activities.'"),
   ("What type of text is this?", "An opinion essay", ["A story", "An advert", "An email"], "It presents both sides and gives an opinion.")]),
 ("Plastic waste in the ocean is one of the biggest environmental problems today. Every year, millions of tonnes of plastic end up in the sea, where they harm fish, birds and turtles. Although recycling helps, scientists say the most effective solution is to use less plastic in the first place.",
  [("What is the main problem described?", "Plastic waste in the ocean", ["Too many fish", "Hot weather", "Expensive recycling"], "The first sentence says it."),
   ("Which animals are mentioned?", "Fish, birds and turtles", ["Dogs, cats and horses", "Whales only", "Insects"], "'they harm fish, birds and turtles.'"),
   ("What does 'Although' show here?", "A contrast between two ideas", ["A reason", "A time", "A place"], "Recycling helps, but it is not the best solution."),
   ("What is the best solution, according to scientists?", "Use less plastic", ["Recycle everything", "Clean the beaches once a year", "Stop fishing"], "'use less plastic in the first place.'")]),
 ("I used to hate reading. Books felt long and boring, and the words seemed to move on the page. Then my teacher gave me a graphic novel about a girl who travelled through time. I read it in one evening! Since then, I've read more than twenty books. I've learnt that the right book can change everything.",
  [("How did the writer feel about reading in the past?", "They didn't like it", ["They loved it", "They read every day", "They wrote books"], "'I used to hate reading.'"),
   ("What changed their mind?", "A graphic novel from their teacher", ["A film", "A new phone", "A trip"], "'my teacher gave me a graphic novel.'"),
   ("What does 'used to' express?", "Something that was true in the past but not now", ["Something happening now", "A plan for the future", "An order"], "'used to' + verb talks about past habits or states."),
   ("What is the main message?", "The right book can make you enjoy reading", ["Graphic novels are bad", "Time travel is possible", "Reading is always boring"], "'the right book can change everything.'")]),
 ("WANTED: Volunteers for the summer reading club at Hillside Library. Do you love books and enjoy working with children? We need young people aged 15 or over to help children aged 6–10 choose books and play reading games. Volunteers must be available on Tuesday or Thursday afternoons in July. Experience is not necessary, but patience is essential!",
  [("Who can volunteer?", "Young people aged 15 or over", ["Children aged 6–10", "Only teachers", "Anyone under 15"], "'young people aged 15 or over.'"),
   ("What will volunteers do?", "Help children choose books and play reading games", ["Clean the library", "Teach maths", "Sell books"], "It is explained in the third sentence."),
   ("What does 'essential' mean?", "Absolutely necessary", ["Not important", "Expensive", "Optional"], "Experience is not necessary, but patience IS necessary."),
   ("When must volunteers be available?", "Tuesday or Thursday afternoons in July", ["Every weekend", "Mornings in June", "Every day"], "'available on Tuesday or Thursday afternoons in July.'")]),
 ("'Why didn't you tell me?' asked Sam. Leo looked at the floor. He had broken his brother's headphones that morning and had hidden them under the bed. 'I was scared you'd be angry,' he whispered. Sam sighed, then smiled. 'Next time, just tell me. Things can be fixed — but lies are harder to repair.'",
  [("What had Leo done?", "He had broken Sam's headphones and hidden them", ["He had lost Sam's phone", "He had told a joke", "He had cleaned the room"], "He broke the headphones and hid them under the bed."),
   ("Why didn't Leo tell Sam?", "He was afraid Sam would be angry", ["He forgot", "He didn't care", "Sam was away"], "'I was scared you'd be angry.'"),
   ("What does Sam mean by 'lies are harder to repair'?", "It is worse to lie than to break something", ["Lies are expensive", "Headphones can't be repaired", "Sam is angry"], "Broken things can be fixed, but lost trust is harder to recover."),
   ("Which word describes Sam at the end?", "Understanding", ["Furious", "Jealous", "Bored"], "He sighs, smiles and gives advice.")]),
],
}
FILL = {
6: [("I have lived here ___ 2019.", ["since"], ["for"], "Use 'since' with a point in time."),
    ("We have been friends ___ five years.", ["for"], ["since"], "Use 'for' with a period of time."),
    ("If it ___ tomorrow, we will stay at home.", ["rains"], ["will rain"], "First conditional: if + present, will + verb."),
    ("She is ___ than her sister.", ["taller"], ["more tall"], "Short adjectives add -er."),
    ("This is the ___ film I have ever seen.", ["best"], ["better"], "The superlative of good is best."),
    ("I'm interested ___ learning languages.", ["in"], ["on"], "interested in.")],
7: [("If I ___ rich, I would travel the world.", ["were"], ["will be"], "Second conditional: if + past, would + verb."),
    ("The bridge ___ built in 1890.", ["was"], ["did"], "Passive: was/were + past participle."),
    ("She said that she ___ tired.", ["was"], ["is"], "Reported speech moves the verb back: is → was."),
    ("The girl ___ won the prize is my cousin.", ["who"], ["which"], "Use 'who' for people."),
    ("You ___ wear a uniform; it's optional.", ["don't have to"], ["mustn't"], "'don't have to' = it is not necessary."),
    ("I'm looking forward to ___ you.", ["seeing"], ["see"], "After 'looking forward to' we use -ing.")],
}


def build_comp(b):
    for level in (6, 7):
        for passage, qs in P[level]:
            for prompt, a, wrong, expl in qs:
                b.mc(C, level, prompt, a, wrong, expl, passage=passage)
        for sentence, blanks, distr, expl in FILL[level]:
            b.fill(C, level, "Complete the sentence with the right words", sentence, blanks, distr, expl)


# ── WRITING (grammar and spelling, with typical mistakes of Spanish speakers) ──
E = 'escritura'
MC = {
6: [("Which sentence is correct?", "I am fourteen years old.", ["I have fourteen years.", "I have fourteen years old.", "I am fourteen years."], "In English we use 'be' for age. Spanish speakers often say 'I have 14 years' (tengo 14 años)."),
    ("Which sentence is correct?", "People are very friendly here.", ["People is very friendly here.", "The people is very friendly here.", "Peoples are very friendly here."], "'People' is plural: people are. Spanish speakers often say 'people is' (la gente es)."),
    ("Which sentence is correct?", "I agree with you.", ["I am agree with you.", "I'm agree with you.", "I agreed with you now."], "'agree' is a verb: I agree. Spanish speakers often say 'I am agree' (estoy de acuerdo)."),
    ("Which sentence is correct?", "Can you explain it to me?", ["Can you explain me it?", "Can you explain me?", "Can you explain to me it?"], "We explain something TO someone. Spanish speakers often say 'explain me' (explícame)."),
    ("Which sentence is correct?", "It is important to study.", ["Is important to study.", "It important to study.", "Is it important study."], "English sentences need a subject: It is important. Spanish speakers often drop it (es importante)."),
    ("Which sentence is correct?", "I have lived here since 2020.", ["I live here since 2020.", "I am living here since 2020.", "I lived here since 2020."], "Present perfect + since for something that started in the past and continues."),
    ("Choose the right word: 'I've known her ___ three years.'", "for", ["since", "during", "ago"], "for + a period of time."),
    ("Choose the right word: 'I saw that film two days ___.'", "ago", ["before", "for", "since"], "ago = in the past, counted back from now."),
    ("Which sentence is correct?", "Have you ever been to Scotland?", ["Did you ever go to Scotland yesterday?", "Have you ever went to Scotland?", "Are you ever been to Scotland?"], "Present perfect with 'ever': have + been."),
    ("Which sentence is correct?", "She is better than me at maths.", ["She is more better than me at maths.", "She is more good than me at maths.", "She is gooder than me at maths."], "The comparative of good is better (never 'more better')."),
    ("Which sentence is correct?", "This is the most interesting book.", ["This is the more interesting book of all.", "This is the interestingest book.", "This is the most interestingest book."], "Long adjectives: the most + adjective."),
    ("Choose the right word: 'If you heat ice, it ___.'", "melts", ["will melting", "melted", "melt"], "Zero conditional: facts that are always true."),
    ("Which sentence is correct?", "If it rains, we will stay at home.", ["If it will rain, we will stay at home.", "If it rains, we stay at home tomorrow will.", "If it rain, we will stay at home."], "First conditional: if + present simple, will + verb."),
    ("Which sentence is correct?", "We were playing when it started to rain.", ["We played when it was starting to rain yesterday all day.", "We were play when it started to rain.", "We was playing when it started to rain."], "Past continuous (were playing) for the longer action; past simple for the short one."),
    ("Which word means 'actualmente'?", "currently", ["actually", "actual", "really"], "False friend: 'actually' means 'en realidad'. 'Actualmente' is 'currently' or 'nowadays'. Spanish speakers often confuse them."),
    ("What does 'library' mean?", "biblioteca", ["librería", "libro", "libreta"], "False friend: a library is a biblioteca; a librería is a bookshop. Spanish speakers often confuse them."),
    ("Which sentence is correct?", "I'm good at drawing.", ["I'm good in drawing.", "I'm good on drawing.", "I'm good for drawing."], "We say 'good at' something."),
    ("Which sentence is correct?", "It depends on the weather.", ["It depends of the weather.", "It depends from the weather.", "It depends in the weather."], "'depend on'. Spanish speakers often say 'depend of' (depende de)."),
    ("Which sentence is correct?", "I enjoy playing football.", ["I enjoy to play football.", "I enjoy play football.", "I enjoy to playing football."], "After 'enjoy' we use -ing."),
    ("Which sentence is correct?", "She decided to leave early.", ["She decided leaving early.", "She decided leave early.", "She decided to leaving early."], "After 'decide' we use 'to' + verb."),
    ("Choose the right word: 'I need to ___ my homework.'", "do", ["make", "doing", "made"], "We DO homework (and exercise, the shopping). We MAKE a cake, a mistake, a noise."),
    ("Choose the right word: 'Don't ___ so much noise!'", "make", ["do", "doing", "makes"], "We MAKE a noise.")],
7: [("Which sentence is correct?", "If I were you, I would apologise.", ["If I was you, I will apologise.", "If I am you, I would apologise.", "If I were you, I will apologise."], "Second conditional: if + past (were), would + verb."),
    ("Which sentence is correct?", "The castle was built in 1270.", ["The castle built in 1270.", "The castle was build in 1270.", "The castle is built in 1270 years ago."], "Passive: was + past participle (built)."),
    ("Which sentence is correct?", "English is spoken in many countries.", ["English speaks in many countries.", "English is speak in many countries.", "In many countries is spoken English."], "Passive present: is + past participle."),
    ("Report this: 'I am tired,' she said.", "She said that she was tired.", ["She said that I am tired.", "She said me that she was tired.", "She told that she is tired."], "Reported speech: am → was; we 'say' something, or 'tell' someone."),
    ("Which sentence is correct?", "He told me the truth.", ["He said me the truth.", "He told to me the truth.", "He said to me the truth that."], "We TELL someone something; we SAY something."),
    ("Choose the right word: 'The book ___ I bought is great.'", "that", ["who", "what", "whose"], "Use 'that' or 'which' for things."),
    ("Choose the right word: 'That's the boy ___ dog bit me.'", "whose", ["who", "which", "who's"], "'whose' shows possession."),
    ("Which sentence means 'it is not allowed'?", "You mustn't use your phone in the exam.", ["You don't have to use your phone in the exam.", "You needn't use your phone.", "You must to use your phone."], "mustn't = prohibited; don't have to = not necessary."),
    ("Which sentence means 'it is not necessary'?", "You don't have to come if you're busy.", ["You mustn't come if you're busy.", "You must come if you're busy.", "You have not to come."], "'don't have to' = it is not necessary."),
    ("Which sentence is correct?", "I used to live in a small village.", ["I use to live in a small village.", "I used to living in a small village.", "I was used to live in a small village."], "'used to' + verb for past habits or states."),
    ("Which sentence is correct?", "I'm looking forward to meeting you.", ["I'm looking forward to meet you.", "I look forward meet you.", "I'm looking forward for meeting you."], "'look forward to' + -ing."),
    ("Which sentence is correct?", "She has just finished her project.", ["She has finished just her project yesterday.", "She just has finished her project yesterday.", "She has just finish her project."], "'just' goes between have/has and the participle."),
    ("Which sentence is correct?", "How long have you been learning English?", ["How long are you learning English?", "How long do you learn English?", "How much time you are learning English?"], "Present perfect continuous for actions that started in the past and continue."),
    ("What does 'embarrassed' mean?", "avergonzado", ["embarazada", "enfadado", "aburrido"], "False friend: embarazada is 'pregnant'. Spanish speakers often confuse them."),
    ("What does 'sensible' mean?", "sensato", ["sensible (que se emociona)", "sensitivo", "sencillo"], "False friend: 'sensible' means sensato. 'Sensible' in Spanish is 'sensitive'. Spanish speakers often confuse them."),
    ("What does 'career' mean?", "carrera profesional", ["carrera (de coches)", "carretera", "carro"], "A career is your professional life; a race is a 'carrera' you run. Spanish speakers often confuse them."),
    ("Which sentence is correct?", "Although it was cold, we went out.", ["Although it was cold, but we went out.", "Despite it was cold, we went out.", "Although of the cold, we went out."], "Don't use 'although' and 'but' together; 'despite' needs a noun or -ing."),
    ("Choose the right word: 'She was late ___ the traffic.'", "because of", ["because", "so", "although"], "'because of' + noun; 'because' + clause."),
    ("Which sentence is correct?", "I'm used to getting up early.", ["I'm used to get up early.", "I used to getting up early.", "I'm use to getting up early."], "'be used to' + -ing = be accustomed to."),
    ("Which sentence is correct?", "There were a lot of people at the concert.", ["There was a lot of peoples at the concert.", "It had a lot of people at the concert.", "There were much people at the concert."], "'There were' with plurals. Spanish speakers often say 'it had' (había)."),
    ("Which sentence is correct?", "I'd rather stay at home tonight.", ["I'd rather to stay at home tonight.", "I'd prefer stay at home tonight.", "I rather stay at home tonight."], "'would rather' + verb without 'to'."),
    ("Which sentence is correct?", "Neither of my friends likes horror films.", ["Neither of my friends don't like horror films.", "None my friends like horror films.", "Neither my friends likes horror films."], "'Neither of' + singular verb; no double negative.")],
}
ORDER = {
6: [["I", "have", "never", "been", "to", "London."], ["If", "it", "rains,", "we", "will", "stay", "at", "home."], ["She", "is", "taller", "than", "her", "brother."],
    ["We", "were", "walking", "home", "when", "it", "started", "to", "rain."], ["Can", "you", "explain", "it", "to", "me?"]],
7: [["The", "bridge", "was", "built", "in", "1890."], ["If", "I", "were", "you,", "I", "would", "say", "sorry."], ["She", "told", "me", "that", "she", "was", "tired."],
    ["The", "girl", "who", "lives", "next", "door", "is", "Italian."], ["I", "used", "to", "play", "the", "piano."]],
}
WRITE = {
6: [("Correct the sentence: 'I have 13 years.'", "I am 13 years old.", "Use the verb 'be'", "In English, age goes with 'be'. Spanish speakers often say 'I have 13 years'.", ["I am 13.", "I'm 13 years old.", "I'm 13."]),
    ("Correct the sentence: 'People is happy.'", "People are happy.", "'People' is plural", "'People' takes a plural verb. Spanish speakers often say 'people is'.", None),
    ("Write the past simple of 'buy'", "bought", "Irregular verb", "buy → bought → bought.", None),
    ("Write the comparative of 'big'", "bigger", "Double the consonant", "big → bigger: one vowel + one consonant, double it.", None)],
7: [("Make it passive: 'Someone stole my bike.'", "My bike was stolen.", "was + past participle", "Passive: was + stolen.", None),
    ("Report it: 'I like pizza,' he said.", "He said that he liked pizza.", "Move the verb back", "like → liked in reported speech.", ["He said he liked pizza."]),
    ("Correct the sentence: 'He said me the answer.'", "He told me the answer.", "say or tell?", "We tell someone something.", None),
    ("Write the past participle of 'write'", "written", "Irregular verb", "write → wrote → written.", None)],
}
DICT_E = {
6: ["I have never eaten sushi.", "She is the tallest girl in the class.", "We were reading when the bell rang.", "If you study, you will pass."],
7: ["The letter was sent last week.", "If I were you, I would go.", "He told me he had seen the film.", "I'm used to waking up early."],
}


def build_esc(b):
    for level in (6, 7):
        for prompt, a, wrong, expl in MC[level]:
            b.mc(E, level, prompt, a, wrong, expl)
        for words in ORDER[level]:
            b.order(E, level, "Put the words in order to make a sentence", words, ' '.join(words))
        for prompt, ans, hint, expl, acc in WRITE[level]:
            b.write(E, level, prompt, ans, hint, expl, acceptable=acc)
        for s in DICT_E[level]:
            b.write(E, level, "Listen and write the sentence", s, f"It has {len(s.split())} words", "Remember the capital letter and the full stop.", dictation=True)


# ── QUICK CHALLENGES ──────────────────────────────────────
R = 'retos_rapidos'
SYN = {6: [("huge", "enormous", ["tiny", "quiet", "late"]), ("begin", "start", ["finish", "stop", "wait"]), ("quickly", "fast", ["slowly", "badly", "late"]),
           ("angry", "cross", ["calm", "glad", "proud"]), ("choose", "pick", ["lose", "drop", "forget"])],
       7: [("brave", "courageous", ["cowardly", "lazy", "shy"]), ("improve", "get better", ["get worse", "give up", "break"]), ("obvious", "clear", ["hidden", "strange", "boring"]),
           ("ancient", "very old", ["modern", "young", "recent"]), ("reluctant", "unwilling", ["eager", "keen", "ready"])]}
ANT = {6: [("cheap", "expensive", ["free", "low", "small"]), ("polite", "rude", ["kind", "nice", "quiet"]), ("borrow", "lend", ["take", "buy", "keep"]),
           ("forget", "remember", ["lose", "leave", "miss"]), ("tidy", "messy", ["clean", "neat", "small"])],
       7: [("generous", "mean", ["kind", "rich", "friendly"]), ("increase", "decrease", ["grow", "raise", "rise"]), ("ancient", "modern", ["old", "historic", "classic"]),
           ("guilty", "innocent", ["sorry", "bad", "sad"]), ("accept", "refuse", ["agree", "take", "allow"])]}
PHRASAL = {6: [("What does 'give up' mean?", "stop trying", ["give a present", "get up early", "pick up"], "To give up = to stop trying."),
               ("What does 'look after' mean?", "take care of", ["look behind", "search for", "look at later"], "To look after a pet = to take care of it."),
               ("What does 'find out' mean?", "discover information", ["lose something", "go outside", "find a seat"], "To find out = to discover.")],
           7: [("What does 'get on with' someone mean?", "have a good relationship", ["get on a bus", "argue", "get up"], "I get on well with my sister = we have a good relationship."),
               ("What does 'put off' mean?", "postpone", ["put on clothes", "switch off", "take away"], "They put off the match = they postponed it."),
               ("What does 'run out of' mean?", "have no more left", ["run away", "go for a run", "find more"], "We've run out of milk = there is no milk left.")]}
FORM = {6: [("Which word is the noun of 'decide'?", "decision", ["decided", "decisive", "decidely"], "decide → decision."),
            ("Which prefix makes the opposite of 'happy'?", "un-", ["dis-", "in-", "im-"], "happy → unhappy."),
            ("Which word is the adjective of 'danger'?", "dangerous", ["dangerly", "dangered", "dangerful"], "danger → dangerous.")],
        7: [("Which prefix makes the opposite of 'agree'?", "dis-", ["un-", "in-", "non-"], "agree → disagree."),
            ("Which word is the noun of 'develop'?", "development", ["developing", "developer's", "developed"], "develop → development."),
            ("Which word is the adverb of 'careful'?", "carefully", ["carefuly", "carefull", "carelessly"], "careful → carefully (keep both l's).")]}
FALSE = {6: [("Which English word means 'éxito'?", "success", ["exit", "excite", "excess"], "False friend: an exit is a 'salida'. Spanish speakers often confuse them."),
             ("What does 'assist' usually mean?", "help", ["attend", "sit", "arrive"], "False friend: 'asistir a clase' is 'attend class'. Spanish speakers often confuse them.")],
         7: [("How do you say 'estoy constipado' in English?", "I have a cold", ["I am constipated", "I am constant", "I am consistent"], "False friend: 'constipated' means estreñido. Spanish speakers often confuse them."),
             ("What does 'eventually' mean?", "finally, in the end", ["maybe, possibly", "every day", "suddenly"], "False friend: 'eventualmente' means possibly; 'eventually' means finally. Spanish speakers often confuse them.")]}
ODD = {6: [(["cousin", "uncle", "niece"], "neighbour", "A neighbour is not a family member."),
           (["although", "however", "but"], "because", "'because' gives a reason; the others show contrast.")],
       7: [(["metaphor", "simile", "alliteration"], "paragraph", "A paragraph is not a literary device."),
           (["must", "should", "might"], "want", "'want' is an ordinary verb; the others are modal verbs.")]}


def build_ret(b):
    for level in (6, 7):
        for w, s, wrong in SYN[level]:
            b.mc(R, level, f"Which word means the same as '{w}'?", s, wrong, f"'{w}' and '{s}' mean the same.")
        for w, a, wrong in ANT[level]:
            b.mc(R, level, f"What is the opposite of '{w}'?", a, wrong, f"The opposite of '{w}' is '{a}'.")
        for prompt, a, wrong, expl in PHRASAL[level] + FORM[level] + FALSE[level]:
            b.mc(R, level, prompt, a, wrong, expl)
        for group, odd, expl in ODD[level]:
            b.mc(R, level, f"Which word does NOT belong: {', '.join(group)}, {odd}?", odd, group, expl)


# ── LONGER READINGS ───────────────────────────────────────
READINGS = {
6: [
 ("reading_l6_foodbank", "Saturday at the food bank", "🥫",
  "Every Saturday morning, Ellie, who is fifteen, volunteers at the food bank in her town in the north of England. She sorts tins and packets, checks the dates and helps to pack bags for families who need them.\n\nAt first she was nervous. She didn't know anybody, and she was worried about making mistakes. But the other volunteers were friendly, and after a few weeks she felt part of the team. Now she even shows new volunteers what to do.\n\n'The best part is when a family says thank you,' she says. 'You realise that a small thing, like two hours on a Saturday, can really help someone.'\n\nEllie has also learnt a lot. She is better at organising things, she is more confident when she talks to adults, and she has made new friends of all ages. Next year she wants to start a collection point at her school.",
  [("How old is Ellie?", "Fifteen", ["Twelve", "Eighteen", "Twenty"], "'Ellie, who is fifteen'"),
   ("Why was she nervous at first?", "She didn't know anybody and was worried about making mistakes", ["She was ill", "The food bank was far away", "She didn't like food"], "Second paragraph."),
   ("What does she like most?", "When a family says thank you", ["Checking dates", "Saturday mornings", "Talking to adults"], "'The best part is when a family says thank you.'"),
   ("Which skill has she improved?", "Organising things", ["Cooking", "Driving", "Swimming"], "'She is better at organising things.'"),
   ("What is her plan for next year?", "To start a collection point at her school", ["To leave the food bank", "To work in a shop", "To move to London"], "Last sentence.")]),
 ("reading_l6_beck", "The map that changed travel", "🗺️",
  "In the early 1930s, the map of the London Underground was a mess. It showed the exact position of every station, so the lines in the city centre were squeezed together and the stations far away were spread out. Passengers found it very hard to read.\n\nHarry Beck, an engineer who drew electrical circuits, had an idea. Passengers underground, he thought, don't need to know exact distances. They only need to know the order of the stations and where to change lines. So he drew the lines straight, only at 90 or 45 degrees, and put the same space between all the stations.\n\nAt first, the managers thought the design was too strange. But when it was printed in 1933, passengers loved it. Today, cities all over the world use maps that follow Beck's idea.\n\nBeck's story shows that sometimes the best solution is not to show more information, but to show the right information.",
  [("What was the problem with the old map?", "It was hard to read because it showed exact positions", ["It was too small", "It had no stations", "It was only in colour"], "First paragraph."),
   ("What was Harry Beck's job?", "An engineer who drew electrical circuits", ["A train driver", "A painter", "A teacher"], "Second paragraph."),
   ("What do passengers really need, according to Beck?", "The order of stations and where to change", ["Exact distances", "Pictures of streets", "Ticket prices"], "'They only need to know the order of the stations and where to change lines.'"),
   ("How did the managers react at first?", "They thought it was too strange", ["They loved it immediately", "They printed it in 1931", "They ignored it"], "'the managers thought the design was too strange.'"),
   ("What is the main lesson of the text?", "The best solution is to show the right information", ["Maps should show everything", "Engineers are bad designers", "London is confusing"], "Last sentence.")]),
],
7: [
 ("reading_l7_gapyear", "Is a gap year worth it?", "🎒",
  "In the UK, some students take a 'gap year' between finishing school and starting university. They might work, travel or volunteer abroad. But is it a good idea?\n\nSupporters say that a gap year helps young people to become more independent and to discover what they really want to study. Students who have worked for a year often appreciate the value of money and arrive at university more motivated.\n\nOn the other hand, critics point out that a gap year can be expensive, especially if it involves travelling. Some students also find it difficult to return to studying after a long break, and a few never go back at all.\n\nIn my view, a gap year is worth it only if it is planned. A year spent learning a skill, saving money or helping others can be one of the most valuable experiences of your life. A year spent doing nothing, however, is simply a year lost.",
  [("What is a gap year?", "A year between school and university", ["The last year of school", "A year at university abroad", "A holiday in August"], "First paragraph."),
   ("Which is an argument FOR a gap year?", "It helps young people become more independent", ["It is expensive", "It is hard to return to study", "Some never go back"], "Second paragraph."),
   ("Which is an argument AGAINST it?", "It can be expensive", ["You discover what you want to study", "You arrive more motivated", "You value money more"], "Third paragraph."),
   ("What is the writer's opinion?", "It is worth it only if it is planned", ["It is always a waste of time", "Everybody should take one", "Only rich students should take one"], "'In my view, a gap year is worth it only if it is planned.'"),
   ("What does 'however' show in the last sentence?", "A contrast with the previous idea", ["An example", "A cause", "A time order"], "It contrasts a planned year with a year doing nothing.")]),
 ("reading_l7_turing", "Alan Turing and the code breakers", "💻",
  "During the Second World War, the German army sent secret messages using a machine called Enigma. The messages were in code, and the settings of the machine changed every day, so breaking the code seemed impossible.\n\nAt Bletchley Park, a country house north of London, thousands of people worked in secret to read those messages. One of them was Alan Turing, a brilliant mathematician. Together with other code breakers, he designed a machine called the Bombe, which helped to discover the Enigma settings much faster than people could by hand.\n\nHistorians believe that the work done at Bletchley Park shortened the war and saved many lives. However, it was kept secret for decades, so the people who did it received little recognition at the time.\n\nTuring is also remembered as one of the fathers of computer science. His ideas about machines that can follow instructions — and even 'think' — are still discussed today. Since 2021, his face has appeared on the Bank of England's £50 note.",
  [("What was Enigma?", "A machine used to send secret messages", ["A secret army", "A country house", "A computer game"], "First paragraph."),
   ("Why did breaking the code seem impossible?", "The settings changed every day", ["The messages were in English", "Nobody wanted to try", "The machine was lost"], "'the settings of the machine changed every day'"),
   ("What did the Bombe do?", "It helped to find the Enigma settings faster", ["It sent German messages", "It exploded bridges", "It printed money"], "Second paragraph."),
   ("Why did the code breakers receive little recognition at the time?", "Their work was kept secret for decades", ["They failed", "They were paid a lot", "They left the country"], "Third paragraph."),
   ("Where can you see Turing's face today?", "On the £50 note", ["On a stamp only", "On the Enigma machine", "On the £5 note"], "Last sentence.")]),
],
}


def build_readings(b):
    for level in (6, 7):
        for rid, title, emoji, text, qs in READINGS[level]:
            b.reading(rid, level, title, emoji, text, qs)
