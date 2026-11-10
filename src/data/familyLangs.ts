/**
 * Extra languages for the family panel (weekly summary + ideas for home), for
 * families who read Spanish/Valencian/English with difficulty.
 * Written with AI help: shown with a notice until a native speaker reviews them.
 */
import type { ModuleId } from '@/types';

export type FamLang = 'ar' | 'ro' | 'uk' | 'zh' | 'ur';
export const FAM_LANGS: { id: FamLang; label: string; bcp47: string; rtl?: boolean }[] = [
  { id: 'ar', label: 'العربية', bcp47: 'ar', rtl: true },
  { id: 'ro', label: 'Română', bcp47: 'ro-RO' },
  { id: 'uk', label: 'Українська', bcp47: 'uk-UA' },
  { id: 'zh', label: '中文', bcp47: 'zh-CN' },
  { id: 'ur', label: 'اردو', bcp47: 'ur-PK', rtl: true },
];

type S = Record<string, string>;
export const FAM_STR: Record<FamLang, S> = {
  ro: {
    ai_note: 'Traducere făcută cu ajutorul inteligenței artificiale; nu a fost încă revizuită de un vorbitor nativ.',
    listen: 'Ascultă',
    stop: 'Oprește',
    wk_title: 'Rezumatul săptămânii',
    wk_none: '{name} nu a exersat încă săptămâna aceasta. Câteva minute pe zi sunt suficiente pentru a începe.',
    wk_days: '{name} a exersat în {days} din ultimele 7 zile ({min} min în total).',
    wk_accuracy: 'A răspuns la {n} întrebări și {pct}% dintre răspunsuri au fost corecte.',
    wk_more: 'A exersat mai multe zile decât săptămâna trecută ({prev} → {now}). Ritm foarte bun!',
    wk_less: 'Săptămâna trecută a exersat mai multe zile ({prev} → {now}). Încercați să reveniți la acel ritm.',
    wk_same: 'Păstrează același ritm ca săptămâna trecută.',
    wk_best: 'Ce îi iese cel mai bine acum: {area} ({pct}% corecte).',
    wk_weak: 'Ce îi este cel mai greu acum: {area} ({pct}%). Aici exersarea ajută cel mai mult; mai jos găsiți idei pentru acasă.',
    wk_extra: 'Lecturi ghidate: {r} · Dictări: {d}.',
    wk_words: 'Cuvinte de exersat împreună: {words}.',
    wk_fluency: 'Fluența citirii: {now} cuvinte corecte pe minut (data trecută: {prev}).',
    wk_fluency_first: 'Fluența citirii: {now} cuvinte corecte pe minut.',
    tips_title: 'Idei pentru acasă (fără ecrane)',
    tips_for: 'Pentru a consolida: {area}',
    tips_general: 'Pentru orice zi',
    tips_other: 'Idei pentru alte domenii',
    student: 'Copilul',
    area_fonologia: 'Fonologie (sunetele cuvintelor)',
    area_memoria_visual: 'Memorie vizuală (cum se scriu cuvintele)',
    area_comprension_lectora: 'Înțelegerea textului',
    area_escritura: 'Scriere',
    area_retos_rapidos: 'Provocări rapide',
  },
  uk: {
    ai_note: 'Переклад зроблено за допомогою штучного інтелекту; носій мови його ще не перевірив.',
    listen: 'Прослухати',
    stop: 'Зупинити',
    wk_title: 'Підсумок тижня',
    wk_none: 'Цього тижня ще не було жодного заняття. Для початку достатньо кількох хвилин на день.',
    wk_days: 'Днів із заняттями за останні 7 днів: {days} (усього {min} хв).',
    wk_accuracy: 'Відповідей на запитання: {n}, з них правильних — {pct}%.',
    wk_more: 'Днів із заняттями більше, ніж минулого тижня ({prev} → {now}). Чудовий ритм!',
    wk_less: 'Минулого тижня днів із заняттями було більше ({prev} → {now}). Спробуйте повернутися до того ритму.',
    wk_same: 'Ритм такий самий, як минулого тижня.',
    wk_best: 'Найкраще зараз виходить: {area} ({pct}% правильних).',
    wk_weak: 'Найважче зараз: {area} ({pct}%). Саме це найкорисніше тренувати; нижче є ідеї для дому.',
    wk_extra: 'Читання з підтримкою: {r} · Диктанти: {d}.',
    wk_words: 'Слова, які варто повторити разом: {words}.',
    wk_fluency: 'Швидкість читання: {now} правильно прочитаних слів за хвилину (минулого разу — {prev}).',
    wk_fluency_first: 'Швидкість читання: {now} правильно прочитаних слів за хвилину.',
    tips_title: 'Ідеї для дому (без екранів)',
    tips_for: 'Щоб підтягнути: {area}',
    tips_general: 'На будь-який день',
    tips_other: 'Ідеї для інших напрямів',
    student: 'Дитина',
    area_fonologia: 'Фонологія (звуки слів)',
    area_memoria_visual: 'Зорова пам’ять (як пишуться слова)',
    area_comprension_lectora: 'Розуміння прочитаного',
    area_escritura: 'Письмо',
    area_retos_rapidos: 'Швидкі завдання',
  },
  ar: {
    ai_note: 'تُرجم هذا النص بمساعدة الذكاء الاصطناعي، ولم يراجعه بعدُ متحدّث أصلي.',
    listen: 'استمع',
    stop: 'إيقاف',
    wk_title: 'ملخّص الأسبوع',
    wk_none: 'لا توجد أيام تدريب بعد في هذا الأسبوع. تكفي بضع دقائق يوميًا للبدء.',
    wk_days: 'أيام التدريب خلال آخر 7 أيام: {days} (المجموع {min} دقيقة).',
    wk_accuracy: 'عدد الأسئلة التي تمّت الإجابة عنها: {n}، ونسبة الإجابات الصحيحة: {pct}٪.',
    wk_more: 'أيام التدريب أكثر من الأسبوع الماضي (الأسبوع الماضي: {prev}، هذا الأسبوع: {now}). إيقاع رائع!',
    wk_less: 'كانت أيام التدريب في الأسبوع الماضي أكثر (الأسبوع الماضي: {prev}، هذا الأسبوع: {now}). حاولوا العودة إلى ذلك الإيقاع.',
    wk_same: 'الإيقاع نفسه كما في الأسبوع الماضي.',
    wk_best: 'الأفضل حاليًا: {area} ({pct}٪ إجابات صحيحة).',
    wk_weak: 'الأصعب حاليًا: {area} ({pct}٪). هذا ما يفيد التدرّب عليه أكثر؛ ستجدون أدناه أفكارًا للبيت.',
    wk_extra: 'قراءات موجَّهة: {r} · إملاءات: {d}.',
    wk_words: 'كلمات للتدرّب عليها معًا: {words}.',
    wk_fluency: 'طلاقة القراءة: {now} كلمة صحيحة في الدقيقة (في المرة السابقة: {prev}).',
    wk_fluency_first: 'طلاقة القراءة: {now} كلمة صحيحة في الدقيقة.',
    tips_title: 'أفكار للبيت (بدون شاشات)',
    tips_for: 'لتقوية: {area}',
    tips_general: 'لأي يوم',
    tips_other: 'أفكار لمجالات أخرى',
    student: 'الطفل',
    area_fonologia: 'الوعي الصوتي (أصوات الكلمات)',
    area_memoria_visual: 'الذاكرة البصرية (كيف تُكتب الكلمات)',
    area_comprension_lectora: 'فهم المقروء',
    area_escritura: 'الكتابة',
    area_retos_rapidos: 'تحديات سريعة',
  },
  zh: {
    ai_note: '本译文借助人工智能完成，尚未经母语人士审校。',
    listen: '朗读',
    stop: '停止',
    wk_title: '本周小结',
    wk_none: '本周还没有练习。每天几分钟就足以开始。',
    wk_days: '{name}在过去7天中有{days}天进行了练习（共{min}分钟）。',
    wk_accuracy: '共回答了{n}道题，正确率为{pct}%。',
    wk_more: '练习天数比上周多（{prev} → {now}）。节奏很好！',
    wk_less: '上周练习的天数更多（{prev} → {now}），请尽量恢复之前的节奏。',
    wk_same: '与上周保持相同的节奏。',
    wk_best: '目前表现最好的是：{area}（正确率{pct}%）。',
    wk_weak: '目前最困难的是：{area}（{pct}%）。这是最值得练习的部分，下面有在家可做的活动建议。',
    wk_extra: '引导阅读：{r} · 听写：{d}。',
    wk_words: '可以一起复习的词语：{words}。',
    wk_fluency: '朗读流利度：每分钟正确读出{now}个词（上次为{prev}）。',
    wk_fluency_first: '朗读流利度：每分钟正确读出{now}个词。',
    tips_title: '在家可做的活动（不用屏幕）',
    tips_for: '加强：{area}',
    tips_general: '适合任何一天',
    tips_other: '其他方面的活动建议',
    student: '孩子',
    area_fonologia: '语音意识（词语的发音）',
    area_memoria_visual: '视觉记忆（词语的写法）',
    area_comprension_lectora: '阅读理解',
    area_escritura: '写作',
    area_retos_rapidos: '快速挑战',
  },
  ur: {
    ai_note: 'یہ ترجمہ مصنوعی ذہانت کی مدد سے کیا گیا ہے اور ابھی کسی اہلِ زبان نے اس کا جائزہ نہیں لیا۔',
    listen: 'سنیں',
    stop: 'روکیں',
    wk_title: 'ہفتے کا خلاصہ',
    wk_none: 'اس ہفتے ابھی تک کوئی مشق نہیں ہوئی۔ شروع کرنے کے لیے روزانہ چند منٹ کافی ہیں۔',
    wk_days: 'پچھلے 7 دنوں میں مشق والے دن: {days} (کل {min} منٹ)۔',
    wk_accuracy: 'جواب دیے گئے سوالات: {n}، درست جوابات: {pct}٪۔',
    wk_more: 'مشق کے دن پچھلے ہفتے سے زیادہ ہیں (پچھلا ہفتہ: {prev}، یہ ہفتہ: {now})۔ بہت اچھی رفتار!',
    wk_less: 'پچھلے ہفتے مشق کے دن زیادہ تھے (پچھلا ہفتہ: {prev}، یہ ہفتہ: {now})۔ اسی رفتار پر واپس آنے کی کوشش کریں۔',
    wk_same: 'رفتار پچھلے ہفتے جیسی ہی ہے۔',
    wk_best: 'اس وقت سب سے بہتر: {area} ({pct}٪ درست)۔',
    wk_weak: 'اس وقت سب سے مشکل: {area} ({pct}٪)۔ اسی کی مشق سب سے زیادہ فائدہ دے گی؛ نیچے گھر کے لیے کچھ خیالات ہیں۔',
    wk_extra: 'رہنمائی کے ساتھ پڑھائی: {r} · املا: {d}۔',
    wk_words: 'مل کر دہرانے کے لیے الفاظ: {words}۔',
    wk_fluency: 'پڑھنے کی روانی: فی منٹ {now} درست الفاظ (پچھلی بار: {prev})۔',
    wk_fluency_first: 'پڑھنے کی روانی: فی منٹ {now} درست الفاظ۔',
    tips_title: 'گھر کے لیے خیالات (اسکرین کے بغیر)',
    tips_for: 'مضبوط کرنے کے لیے: {area}',
    tips_general: 'کسی بھی دن کے لیے',
    tips_other: 'دوسرے شعبوں کے خیالات',
    student: 'بچہ',
    area_fonologia: 'صوتی آگہی (الفاظ کی آوازیں)',
    area_memoria_visual: 'بصری یادداشت (الفاظ کیسے لکھے جاتے ہیں)',
    area_comprension_lectora: 'پڑھ کر سمجھنا',
    area_escritura: 'لکھائی',
    area_retos_rapidos: 'فوری چیلنج',
  },
};

type Tip = [string, string];
type Tips = Record<ModuleId | 'general', Tip[]>;

/** Same order as HOME_TIPS, plus a 4th general tip about the home language */
export const FAM_TIPS: Record<FamLang, Tips> = {
  ro: {
    fonologia: [
      ['Bătăi din palme pe silabe', 'Spuneți un cuvânt și bateți o dată din palme pentru fiecare silabă. Apoi alege copilul cuvântul. Merge și în limba voastră.'],
      ['Văd, văd… cu sunete', 'În loc de numele literei, spuneți sunetul: „Văd ceva care începe cu /mmm/”. Merge în mașină sau la cumpărături.'],
      ['Lanțul rimelor', 'Unul spune un cuvânt, celălalt caută unul care rimează. Pierde cine rămâne fără idei. Și cuvintele inventate amuzante sunt valabile!'],
    ],
    memoria_visual: [
      ['Cuvinte pe frigider', 'Scrieți pe bilețele 3 cuvinte din „Cuvintele mele dificile” și lipiți-le pe frigider. Citiți-le împreună de fiecare dată când îl deschideți.'],
      ['Litere pe spate', 'Scrieți cu degetul o literă pe spatele copilului (b, d, p, q…) și lăsați-l să ghicească. Apoi invers.'],
      ['Vânătoare de cuvinte', 'Într-un pliant de supermarket sau un ziar, căutați de câte ori apare un cuvânt sau o silabă.'],
    ],
    comprension_lectora: [
      ['Citit împreună', 'Citiți împreună 10 minute, câte o pagină fiecare. La final, rugați copilul să povestească cu cuvintele lui ce s-a întâmplat.'],
      ['Întrebări „de ce”', 'În loc de întrebări despre detalii („ce culoare avea?”), întrebați „de ce crezi că a făcut asta?” sau „tu ce ai face?”.'],
      ['Ghicește înainte de citit', 'Înainte de a deschide o carte, priviți titlul și imaginile și ghiciți despre ce va fi povestea. La final, vedeți cine a avut dreptate.'],
    ],
    escritura: [
      ['Lista de cumpărături', 'Lăsați copilul să scrie lista de cumpărături în timp ce i-o dictați. Dacă nu știe un cuvânt, căutați-l împreună pe ambalaj.'],
      ['Un bilețel pe zi', 'O propoziție scurtă pe o hârtie: pentru bunica, pentru frigider sau pentru ghiozdan. Important este să scrie ceva adevărat pentru cineva.'],
      ['Dictare distractivă', 'Dictați 3 cuvinte și lăsați-l să le scrie cu litere magnetice, plastilină sau cu degetul în nisip sau făină. Greșelile se corectează jucându-vă.'],
    ],
    retos_rapidos: [
      ['Cuvinte în lanț', 'Fiecare cuvânt începe cu ultima silabă a celui de dinainte. Câte puteți lega?'],
      ['Contrarii rapide', 'Tu spui „rece” și copilul răspunde „cald” cât mai repede. Apoi schimbați rolurile.'],
      ['Familia în ordine', 'Scrieți numele celor din familie (sau ale prietenilor) și ordonați-le alfabetic împreună.'],
    ],
    general: [
      ['Puțin și des', 'Câteva minute în fiecare zi funcționează de obicei mai bine decât o sesiune lungă în weekend. Opriți-vă înainte să obosească.'],
      ['Lăudați efortul', 'Observați ce a încercat și ce a îmbunătățit, nu doar răspunsurile corecte. Greșelile fac parte din învățare.'],
      ['Și cititul cu voce tare contează', 'Când îi citiți povești care îi plac, copilul se bucură de cărți și aude cum sună o citire fluentă.'],
      ['Limba voastră ajută', 'Să vorbiți, să povestiți și să citiți acasă în limba voastră ajută și la învățarea cititului. Nu e nevoie să renunțați la ea.'],
    ],
  },
  uk: {
    fonologia: [
      ['Оплески за складами', 'Скажіть слово й плесніть у долоні на кожен склад. Потім слово обирає дитина. Можна гратися й рідною мовою.'],
      ['«Бачу-бачу» зі звуками', 'Замість назви літери називайте звук: «Бачу щось, що починається на /ммм/». Підходить для поїздки в авто чи в магазині.'],
      ['Ланцюжок рим', 'Один каже слово, інший шукає риму. Програє той, хто не може нічого придумати. Смішні вигадані слова теж рахуються!'],
    ],
    memoria_visual: [
      ['Слова на холодильнику', 'Напишіть на папірцях 3 слова з розділу «Мої складні слова» й приліпіть до холодильника. Читайте їх разом щоразу, коли його відчиняєте.'],
      ['Літери на спині', 'Напишіть пальцем літеру на спині дитини (b, d, p, q…), а вона нехай вгадає. Потім навпаки.'],
      ['Полювання на слова', 'У рекламній листівці чи газеті шукайте, скільки разів трапляється певне слово або склад.'],
    ],
    comprension_lectora: [
      ['Читаємо разом', 'Читайте разом 10 хвилин, по сторінці по черзі. Наприкінці попросіть дитину своїми словами розповісти, що сталося.'],
      ['Запитання «чому»', 'Замість запитань про деталі («якого кольору було?») питайте «як ти думаєш, чому він так зробив?» або «а що зробив(-ла) би ти?».'],
      ['Вгадай до читання', 'Перш ніж розгорнути книжку, подивіться на назву й малюнки та вгадайте, про що буде історія. Наприкінці перевірте, хто мав рацію.'],
    ],
    escritura: [
      ['Список покупок', 'Нехай дитина записує список покупок, поки ви його диктуєте. Якщо не знає, як пишеться слово, знайдіть його разом на упаковці.'],
      ['Записка щодня', 'Одне коротке речення на папірці: для бабусі, на холодильник чи в рюкзак. Головне — написати щось справжнє для когось.'],
      ['Веселий диктант', 'Продиктуйте 3 слова, а дитина нехай складе їх із магнітних літер, пластиліну чи напише пальцем на піску або борошні. Помилки виправляємо граючись.'],
    ],
    retos_rapidos: [
      ['Слова-ланцюжок', 'Кожне слово починається з останнього складу попереднього. Скільки слів вдасться поєднати?'],
      ['Швидкі протилежності', 'Ви кажете «холодний», а дитина якомога швидше відповідає «гарячий». Потім міняйтеся ролями.'],
      ['Родина за абеткою', 'Напишіть імена членів родини (або друзів) і разом розставте їх за абеткою.'],
    ],
    general: [
      ['Потроху, але часто', 'Кілька хвилин щодня зазвичай дають більше, ніж одне довге заняття у вихідні. Краще зупинитися, поки дитина не втомилася.'],
      ['Хваліть зусилля', 'Помічайте, що дитина спробувала й у чому покращилася, а не лише правильні відповіді. Помилки — частина навчання.'],
      ['Читання вголос теж важливе', 'Коли ви читаєте дитині улюблені історії, вона отримує задоволення від книжок і чує, як звучить плавне читання.'],
      ['Рідна мова допомагає', 'Розмови, розповіді й читання вдома рідною мовою теж допомагають навчитися читати. Відмовлятися від неї не потрібно.'],
    ],
  },
  ar: {
    fonologia: [
      ['التصفيق على المقاطع', 'قولوا كلمة وصفّقوا مرة واحدة لكل مقطع صوتي. ثم يختار الطفل الكلمة التالية. يمكن اللعب بلغتكم أيضًا.'],
      ['أرى أرى… بالأصوات', 'بدلًا من اسم الحرف، قولوا صوته: «أرى شيئًا يبدأ بـ /مممم/». تصلح في السيارة أو أثناء التسوّق.'],
      ['سلسلة القوافي', 'يقول أحدكم كلمة ويبحث الآخر عن كلمة على وزنها. يخسر من لا يجد كلمة. والكلمات المخترعة المضحكة مقبولة أيضًا!'],
    ],
    memoria_visual: [
      ['كلمات على الثلاجة', 'اكتبوا 3 كلمات من «كلماتي الصعبة» على أوراق لاصقة وضعوها على الثلاجة. اقرؤوها معًا كلّما فتحتموها هذا الأسبوع.'],
      ['حروف على الظهر', 'اكتبوا بإصبعكم حرفًا على ظهر الطفل (b، d، p، q…) ودعوه يخمّن ما هو. ثم بالعكس.'],
      ['صيد الكلمات', 'في نشرة إعلانات أو جريدة، ابحثوا عن كل مرة تظهر فيها كلمة أو مقطع معيّن.'],
    ],
    comprension_lectora: [
      ['القراءة معًا', 'اقرؤوا معًا 10 دقائق، صفحة لكل واحد بالتناوب. وفي النهاية اطلبوا من الطفل أن يحكي بكلماته ما حدث.'],
      ['أسئلة «لماذا»', 'بدلًا من أسئلة التفاصيل («ما لونه؟»)، اسألوا «لماذا تظنّ أنه فعل ذلك؟» أو «ماذا كنت ستفعل أنت؟».'],
      ['خمّن قبل القراءة', 'قبل فتح الكتاب، انظروا إلى العنوان والصور وخمّنوا عمّا ستكون القصة. وفي النهاية تحقّقوا من صاحب التخمين الصحيح.'],
    ],
    escritura: [
      ['قائمة المشتريات', 'دعوا الطفل يكتب قائمة المشتريات وأنتم تُملونها عليه. وإذا تردّد في كلمة، ابحثوا عنها معًا على العبوة.'],
      ['رسالة كل يوم', 'جملة قصيرة على ورقة: للجدّة، أو على الثلاجة، أو في الحقيبة. المهم أن يكتب شيئًا حقيقيًا لشخص ما.'],
      ['إملاء ممتع', 'أملوا 3 كلمات ودعوه يكتبها بحروف مغناطيسية أو بالصلصال أو بإصبعه على الرمل أو الطحين. نصحّح الأخطاء ونحن نلعب.'],
    ],
    retos_rapidos: [
      ['الكلمات المتسلسلة', 'تبدأ كل كلمة بآخر مقطع من الكلمة السابقة. كم كلمة تستطيعون أن تربطوا؟'],
      ['الأضداد السريعة', 'تقولون «بارد» فيجيب الطفل «حار» بأسرع ما يمكن. ثم تبادلوا الأدوار.'],
      ['العائلة بالترتيب', 'اكتبوا أسماء أفراد العائلة (أو الأصدقاء) ورتّبوها أبجديًا معًا.'],
    ],
    general: [
      ['قليل ومتكرّر', 'بضع دقائق كل يوم تنفع عادةً أكثر من جلسة طويلة في عطلة نهاية الأسبوع. توقّفوا قبل أن يتعب الطفل.'],
      ['امدحوا الجهد', 'لاحظوا ما حاوله الطفل وما تحسّن فيه، لا الإجابات الصحيحة فقط. الأخطاء جزء من التعلّم.'],
      ['القراءة له مهمّة أيضًا', 'عندما تقرؤون له قصصًا يحبّها، يستمتع بالكتب ويسمع كيف تبدو القراءة السلسة.'],
      ['لغتكم تساعد', 'الحديث والحكايات والقراءة في البيت بلغتكم تساعد أيضًا على تعلّم القراءة. لا حاجة إلى التخلّي عنها.'],
    ],
  },
  zh: {
    fonologia: [
      ['拍手数音节', '说一个词，每个音节拍一次手。然后让孩子来选下一个词。用你们的母语玩也可以。'],
      ['“我看见”声音版', '不说字母的名称，而是说它的发音：“我看见一样东西，它以 /mmm/ 开头。”在车上或购物时都可以玩。'],
      ['押韵接龙', '一个人说一个词，另一个人找一个押韵的词。想不出来的人就输了。好笑的编造词也算！'],
    ],
    memoria_visual: [
      ['冰箱上的词语', '从“我的难词”里选3个词写在便利贴上，贴在冰箱上。这一周每次开冰箱时一起读一读。'],
      ['背上写字母', '用手指在孩子背上写一个字母（b、d、p、q…），让孩子猜是哪个。然后交换。'],
      ['找词游戏', '在超市宣传单或报纸上，找出某个词或某个音节出现了多少次。'],
    ],
    comprension_lectora: [
      ['一起阅读', '一起读10分钟，每人轮流读一页。读完后，请孩子用自己的话讲讲发生了什么。'],
      ['问“为什么”', '不要只问细节（“它是什么颜色的？”），可以问“你觉得他为什么这样做？”或“如果是你，你会怎么做？”。'],
      ['读前猜一猜', '打开书之前，看看书名和图画，猜猜故事讲什么。读完后看看谁猜对了。'],
    ],
    escritura: [
      ['购物清单', '你口述，让孩子写购物清单。如果不会写某个词，就一起在包装上找。'],
      ['每天一张小纸条', '在纸上写一句短短的话：给奶奶、贴在冰箱上或放进书包里。重要的是为某个人写一些真实的东西。'],
      ['有趣的听写', '听写3个词，让孩子用磁性字母、橡皮泥或用手指在沙子、面粉上写出来。在游戏中改正错误。'],
    ],
    retos_rapidos: [
      ['词语接龙', '每个词都以上一个词的最后一个音节开头。你们能接多少个？'],
      ['快速说反义词', '你说“冷”，孩子尽快回答“热”。然后交换角色。'],
      ['家人按顺序排', '写下家人（或朋友）的名字，一起按字母顺序排列。'],
    ],
    general: [
      ['少量多次', '每天几分钟通常比周末一次长时间练习效果更好。在孩子累之前停下来。'],
      ['表扬努力', '关注孩子尝试了什么、进步了什么，而不仅仅是答对了多少。犯错是学习的一部分。'],
      ['给孩子朗读也有用', '给孩子读他喜欢的故事，能让他享受阅读，并听到流利的朗读是什么样子。'],
      ['母语也有帮助', '在家用你们的母语聊天、讲故事和阅读，同样有助于孩子学会阅读。不需要放弃母语。'],
    ],
  },
  ur: {
    fonologia: [
      ['ہجوں پر تالیاں', 'کوئی لفظ بولیں اور ہر ہجے پر ایک تالی بجائیں۔ پھر بچہ اگلا لفظ چنے۔ یہ اپنی زبان میں بھی کھیلا جا سکتا ہے۔'],
      ['آوازوں والا «میں دیکھ رہا ہوں»', 'حرف کا نام لینے کے بجائے اس کی آواز بولیں: «مجھے ایک چیز نظر آ رہی ہے جو /مممم/ سے شروع ہوتی ہے»۔ گاڑی میں یا خریداری کے دوران کھیلیں۔'],
      ['قافیوں کی زنجیر', 'ایک شخص لفظ بولے اور دوسرا اس کا ہم قافیہ لفظ ڈھونڈے۔ جو کچھ نہ سوچ سکے وہ ہار جائے۔ مزاحیہ بنائے ہوئے الفاظ بھی چلتے ہیں!'],
    ],
    memoria_visual: [
      ['فریج پر الفاظ', '«میرے مشکل الفاظ» میں سے 3 الفاظ پرچیوں پر لکھ کر فریج پر لگائیں۔ اس ہفتے جب بھی فریج کھولیں، انہیں مل کر پڑھیں۔'],
      ['کمر پر حروف', 'انگلی سے بچے کی کمر پر کوئی حرف لکھیں (b، d، p، q…) اور اسے پہچاننے دیں۔ پھر باری بدلیں۔'],
      ['الفاظ کی تلاش', 'سپر مارکیٹ کے اشتہار یا اخبار میں دیکھیں کہ کوئی خاص لفظ یا ہجا کتنی بار آتا ہے۔'],
    ],
    comprension_lectora: [
      ['مل کر پڑھنا', '10 منٹ مل کر پڑھیں، باری باری ایک ایک صفحہ۔ آخر میں بچے سے کہیں کہ اپنے الفاظ میں بتائے کہ کیا ہوا۔'],
      ['«کیوں» والے سوال', 'تفصیل کے سوالوں («اس کا رنگ کیا تھا؟») کے بجائے پوچھیں «تمہارے خیال میں اس نے ایسا کیوں کیا؟» یا «تم ہوتے تو کیا کرتے؟»۔'],
      ['پڑھنے سے پہلے اندازہ', 'کتاب کھولنے سے پہلے عنوان اور تصویریں دیکھ کر اندازہ لگائیں کہ کہانی کس بارے میں ہوگی۔ آخر میں دیکھیں کس کا اندازہ درست تھا۔'],
    ],
    escritura: [
      ['خریداری کی فہرست', 'آپ بولیں اور بچہ خریداری کی فہرست لکھے۔ اگر کسی لفظ میں شک ہو تو اسے مل کر پیکنگ پر ڈھونڈیں۔'],
      ['روز ایک پرچی', 'کاغذ پر ایک چھوٹا سا جملہ: دادی/نانی کے لیے، فریج پر یا بستے میں۔ اہم بات یہ ہے کہ کسی کے لیے کوئی سچی بات لکھی جائے۔'],
      ['مزے دار املا', '3 الفاظ لکھوائیں اور بچہ انہیں مقناطیسی حروف، مٹی یا انگلی سے ریت یا آٹے پر بنائے۔ غلطیاں کھیل کھیل میں درست کریں۔'],
    ],
    retos_rapidos: [
      ['الفاظ کی زنجیر', 'ہر لفظ پچھلے لفظ کے آخری ہجے سے شروع ہو۔ آپ کتنے الفاظ جوڑ سکتے ہیں؟'],
      ['فوری متضاد الفاظ', 'آپ «ٹھنڈا» کہیں اور بچہ جتنی جلدی ہو سکے «گرم» کہے۔ پھر باری بدلیں۔'],
      ['خاندان ترتیب سے', 'گھر والوں (یا دوستوں) کے نام لکھیں اور مل کر انہیں حروفِ تہجی کی ترتیب میں لگائیں۔'],
    ],
    general: [
      ['تھوڑا مگر روزانہ', 'روزانہ چند منٹ عام طور پر ہفتے کے آخر میں ایک لمبی نشست سے بہتر کام کرتے ہیں۔ بچہ تھکنے سے پہلے رک جائیں۔'],
      ['کوشش کی تعریف کریں', 'دیکھیں کہ بچے نے کیا کوشش کی اور کس چیز میں بہتری آئی، صرف درست جوابات نہیں۔ غلطیاں سیکھنے کا حصہ ہیں۔'],
      ['اسے پڑھ کر سنانا بھی اہم ہے', 'جب آپ اسے پسندیدہ کہانیاں پڑھ کر سناتے ہیں تو وہ کتابوں سے لطف لیتا ہے اور سنتا ہے کہ روانی سے پڑھنا کیسا ہوتا ہے۔'],
      ['آپ کی زبان مدد کرتی ہے', 'گھر میں اپنی زبان میں بات چیت، کہانیاں اور پڑھائی بھی پڑھنا سیکھنے میں مدد دیتی ہے۔ اسے چھوڑنے کی ضرورت نہیں۔'],
    ],
  },
};

export function famT(lang: FamLang) {
  return (key: string, vars?: Record<string, string | number>) => {
    let s = FAM_STR[lang][key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  };
}
