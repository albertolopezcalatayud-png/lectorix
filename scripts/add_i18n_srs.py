# Adds spaced-repetition / notebook / adaptive keys to src/i18n/{es,ca,en}.ts (idempotent)
NEW = {
 'srs_title': ('Repaso', 'Repàs', 'Review'),
 'srs_today': ('Repaso de hoy', 'Repàs de hui', "Today's review"),
 'srs_due': ('{n} ejercicios para repasar hoy', '{n} exercicis per a repassar hui', '{n} to review today'),
 'srs_up_to_date': ('¡Al día! Lo que falles volverá aquí para repasarlo.', 'Al dia! El que falles tornarà ací per a repassar-ho.', 'All caught up! Anything you get wrong comes back here to review.'),
 'srs_session_desc': ('Lo que te costó otros días', 'El que et va costar altres dies', 'Things you found hard before'),
 'srs_none_title': ('¡Nada que repasar hoy!', 'Res a repassar hui!', 'Nothing to review today!'),
 'srs_none_desc': ('Cuando falles un ejercicio, volverá aquí al día siguiente para que lo repases.', "Quan falles un exercici, tornarà ací l'endemà perquè el repasses.", 'When you get something wrong, it comes back here the next day so you can review it.'),
 'srs_how': ('Cada fallo vuelve al día siguiente. Si lo aciertas, vuelve a los 3 días, luego a los 7, y después queda dominado. Si lo fallas, empieza de nuevo.', "Cada errada torna l'endemà. Si l'encertes, torna als 3 dies, després als 7, i després queda dominada. Si la falles, comença de nou.", 'Each mistake comes back the next day. Get it right and it returns in 3 days, then in 7, and then it is mastered. Get it wrong and it starts again.'),
 'srs_added': ('Guardado para repasar mañana: {n}', 'Guardat per a repassar demà: {n}', 'Saved to review tomorrow: {n}'),
 'srs_promoted': ('Vas mejorando: {n}', 'Vas millorant: {n}', 'Getting better: {n}'),
 'srs_mastered': ('Dominados: {n}', 'Dominats: {n}', 'Mastered: {n}'),
 'nb_title': ('Mis palabras difíciles', 'Les meues paraules difícils', 'My tricky words'),
 'nb_desc': ('Aquí se guardan las palabras que has fallado. Escúchalas, repásalas y márcalas cuando ya te las sepas.', 'Ací es guarden les paraules que has fallat. Escolta-les, repassa-les i marca-les quan ja te les sàpies.', 'Words you got wrong are kept here. Listen to them, practise them and tick them off once you know them.'),
 'nb_empty_title': ('Tu cuaderno está vacío', 'El teu quadern està buit', 'Your notebook is empty'),
 'nb_empty_desc': ('Cuando falles una palabra, aparecerá aquí.', 'Quan falles una paraula, apareixerà ací.', 'When you get a word wrong, it will appear here.'),
 'nb_practise': ('Practicar ahora ({n})', 'Practicar ara ({n})', 'Practise now ({n})'),
 'nb_misses': ('fallos: {n}', 'errades: {n}', 'misses: {n}'),
 'nb_due_today': ('toca hoy', 'toca hui', 'due today'),
 'nb_due_tomorrow': ('vuelve mañana', 'torna demà', 'back tomorrow'),
 'nb_due_in': ('vuelve en {n} días', "torna d'ací a {n} dies", 'back in {n} days'),
 'nb_progress': ('Progreso: {n} de 3', 'Progrés: {n} de 3', 'Progress: {n} of 3'),
 'nb_know_it': ('Ya la sé', 'Ja la sé', 'I know it'),
 'nb_mastered': ('Palabras dominadas ({n})', 'Paraules dominades ({n})', 'Mastered words ({n})'),
 'adapt_recommended': ('RECOMENDADO', 'RECOMANAT', 'RECOMMENDED'),
 'adapt_easier_title': ('Este nivel todavía cuesta, y es normal', 'Este nivell encara costa, i és normal', "This level is still tricky, and that's OK"),
 'adapt_easier_desc': ('Los fallos se han guardado para repasarlos mañana. Si quieres, refuerza antes el nivel {level}.', "Les errades s'han guardat per a repassar-les demà. Si vols, reforça abans el nivell {level}.", 'Your mistakes are saved to review tomorrow. If you like, strengthen level {level} first.'),
 'adapt_easier_btn': ('Practicar el nivel {level}', 'Practicar el nivell {level}', 'Practise level {level}'),
}
def esc(v): return v.replace('\\', '\\\\').replace("'", "\\'")
for i, lang in enumerate(['es', 'ca', 'en']):
    p = f'src/i18n/{lang}.ts'
    s = open(p, encoding='utf-8').read()
    add = ''.join(f"  {k}: '{esc(v[i])}',\n" for k, v in NEW.items() if f"\n  {k}:" not in s)
    if not add:
        continue
    end = "} as const;" if lang == 'es' else "};"
    idx = s.rindex(end)
    s = s[:idx] + "\n  // Spaced review, notebook and adaptive difficulty\n" + add + s[idx:]
    open(p, 'w', encoding='utf-8').write(s)
print('ok')
