# Adds new UI keys to src/i18n/{es,ca,en}.ts (idempotent)
import re, sys, json
NEW = {
 'ex_correct': ('¡Correcto!', 'Correcte!', 'Correct!'),
 'ex_incorrect': ('Incorrecto', 'Incorrecte', 'Not quite'),
 'ex_listen': ('Escuchar', 'Escoltar', 'Listen'),
 'ex_stop': ('Detener', 'Parar', 'Stop'),
 'ex_listen_word': ('Escuchar la palabra', 'Escoltar la paraula', 'Listen to the word'),
 'ex_listen_passage': ('Escuchar el texto', 'Escoltar el text', 'Listen to the text'),
 'ex_stop_reading': ('Detener la lectura', 'Parar la lectura', 'Stop reading'),
 'ex_listen_question': ('Escuchar la pregunta', 'Escoltar la pregunta', 'Listen to the question'),
 'ex_drag_hint': ('Mantén pulsado y arrastra para ordenar', 'Mantín premut i arrossega per a ordenar', 'Press, hold and drag to put them in order'),
 'ex_tap_hint': ('Pulsa una palabra para colocarla', 'Prem una paraula per a col·locar-la', 'Tap a word to place it'),
 'mod_desc_fonologia': ('Reconocimiento de sonidos, sílabas y conciencia fonológica', 'Reconeixement de sons, síl·labes i consciència fonològica', 'Sounds, syllables and phonics'),
 'mod_desc_memoria_visual': ('Reconocimiento visual de palabras y patrones ortográficos', 'Reconeixement visual de paraules i patrons ortogràfics', 'Recognising words and spelling patterns by sight'),
 'mod_desc_comprension_lectora': ('Comprensión de textos, inferencias y vocabulario', 'Comprensió de textos, inferències i vocabulari', 'Understanding texts, inferences and vocabulary'),
 'mod_desc_escritura': ('Ortografía, acentuación y expresión escrita', 'Ortografia, accentuació i expressió escrita', 'Spelling, punctuation and writing'),
 'mod_desc_retos_rapidos': ('Ejercicios cronometrados multimódulo para agilidad', 'Exercicis ràpids de tots els mòduls per a guanyar agilitat', 'Quick mixed challenges to build speed'),
 'lvl_name_1': ('Iniciación', 'Iniciació', 'Starter'),
 'lvl_name_2': ('Consolidación', 'Consolidació', 'Building up'),
 'lvl_name_3': ('Desarrollo', 'Desenvolupament', 'Developing'),
 'lvl_name_4': ('Avanzado', 'Avançat', 'Advanced'),
 'lvl_name_5': ('Dominio', 'Domini', 'Mastery'),
 'onb_lang': ('Elige el idioma', 'Tria l’idioma', 'Choose your language'),
 'onb_s1_title': ('¡Bienvenido a Lectorix!', 'Benvingut a Lectorix!', 'Welcome to Lectorix!'),
 'onb_s1_desc': ('Tu compañero de lectura y escritura. Practica a tu ritmo con ejercicios divertidos diseñados para ti.', 'El teu company de lectura i escriptura. Practica al teu ritme amb exercicis divertits pensats per a tu.', 'Your reading and writing buddy. Practise at your own pace with fun activities made for you.'),
 'onb_s2_title': ('5 módulos de práctica', '5 mòduls de pràctica', '5 practice areas'),
 'onb_s2_desc': ('Fonología, Memoria Visual, Comprensión Lectora, Escritura y Retos Rápidos. Cada uno con 5 niveles de dificultad.', 'Fonologia, Memòria Visual, Comprensió Lectora, Escriptura i Reptes Ràpids. Cada un amb 5 nivells de dificultat.', 'Phonics, Visual Memory, Reading Comprehension, Writing and Quick Challenges. Each one has 5 levels.'),
 'onb_s3_title': ('Gana estrellas y XP', 'Guanya estreles i XP', 'Earn stars and XP'),
 'onb_s3_desc': ('Cada ejercicio te da puntos de experiencia. Consigue 3 estrellas para desbloquear el siguiente nivel.', 'Cada exercici et dona punts d’experiència. Aconseguix 3 estreles per a desbloquejar el nivell següent.', 'Every activity gives you experience points. Get 3 stars to unlock the next level.'),
 'onb_s4_title': ('Lee y escucha', 'Llig i escolta', 'Read and listen'),
 'onb_s4_desc': ('Pulsa el botón 🔊 para escuchar cualquier texto en voz alta. Ajusta la velocidad en Ajustes.', 'Prem el botó 🔊 per a escoltar qualsevol text en veu alta. Ajusta la velocitat en Configuració.', 'Tap the 🔊 button to hear any text read aloud. Change the speed in Settings.'),
 'onb_s5_title': ('Hecho para ti', 'Fet per a tu', 'Made for you'),
 'onb_s5_desc': ('Fuente OpenDyslexic, tamaño de texto ajustable y modo de alto contraste. Todo en Ajustes > Accesibilidad.', 'Lletra OpenDyslexic, grandària del text ajustable i mode d’alt contrast. Tot en Configuració > Accessibilitat.', 'OpenDyslexic font, adjustable text size and high-contrast mode. All in Settings > Accessibility.'),
 'onb_start': ('¡Empezar! 🚀', 'Comencem! 🚀', 'Let’s start! 🚀'),
 'onb_next': ('Siguiente →', 'Següent →', 'Next →'),
 'onb_skip': ('Saltar tutorial', 'Botar el tutorial', 'Skip tutorial'),
 'set_audio': ('Audio', 'Àudio', 'Audio'),
 'set_sound_effects': ('Efectos de sonido', 'Efectes de so', 'Sound effects'),
 'set_read_aloud': ('Leer en voz alta', 'Llegir en veu alta', 'Read aloud'),
 'set_read_speed': ('Velocidad de lectura', 'Velocitat de lectura', 'Reading speed'),
 'set_plan': ('Plan', 'Pla', 'Plan'),
 'set_plan_free': ('Gratuito', 'Gratuït', 'Free'),
 'set_danger': ('Zona peligrosa', 'Zona perillosa', 'Danger zone'),
 'set_reset': ('Borrar progreso', 'Esborrar el progrés', 'Delete progress'),
 'set_reset_confirm': ('¿Seguro que quieres borrar todo tu progreso? Esta acción no se puede deshacer.', 'Segur que vols esborrar tot el teu progrés? Esta acció no es pot desfer.', 'Are you sure you want to delete all your progress? This cannot be undone.'),
 'set_practice_lang': ('Idioma de práctica', 'Llengua de pràctica', 'Practice language'),
 'set_practice_desc': ('Idioma de los ejercicios, dictados, lecturas y la voz.', 'Llengua dels exercicis, dictats, lectures i la veu.', 'Language of the activities, dictations, readings and voice.'),
 'set_practice_auto': ('El mismo que los menús', 'La mateixa que els menús', 'Same as the menus'),
 'set_voice_missing': ('Este dispositivo no tiene voz en este idioma. Puedes instalarla en Ajustes del móvil → Idioma → Síntesis de voz.', 'Este dispositiu no té veu en esta llengua. Pots instal·lar-la en la configuració del mòbil → Idioma → Síntesi de veu.', 'This device has no voice for this language. You can install one in your phone settings → Language → Text-to-speech.'),
 'student_default': ('Estudiante', 'Estudiant', 'Student'),
 'notif_streak_title': ('🔥 ¡Racha de {n} días!', '🔥 Ratxa de {n} dies!', '🔥 {n}-day streak!'),
 'notif_streak_body': ('Sigue así, estás mejorando día a día.', 'Continua així, cada dia ho fas millor.', 'Keep it up, you are getting better every day.'),
 'notif_reminder_title': ('📚 ¡Hora de practicar!', '📚 Hora de practicar!', '📚 Time to practise!'),
 'notif_reminder_body': ('Solo 10 minutos al día marcan la diferencia. ¡Vamos!', 'Només 10 minuts al dia marquen la diferència. Som-hi!', 'Just 10 minutes a day makes a difference. Let’s go!'),
}
def esc(v): return v.replace('\\','\\\\').replace("'", "\\'")
for i, lang in enumerate(['es','ca','en']):
    p=f'src/i18n/{lang}.ts'
    s=open(p).read()
    add=''.join(f"  {k}: '{esc(v[i])}',\n" for k,v in NEW.items() if f"\n  {k}:" not in s)
    if not add: continue
    end = "} as const;" if lang=='es' else "};"
    idx = s.rindex(end)
    s = s[:idx] + "\n  // Practice languages & full localisation\n" + add + s[idx:]
    open(p,'w').write(s)
print('ok')
