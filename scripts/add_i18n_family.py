# Adds weekly-summary / home-tips keys to src/i18n/{es,ca,en}.ts (idempotent)
NEW = {
 'wk_title': ('Resumen de la semana', 'Resum de la setmana', 'This week at a glance'),
 'wk_none': ('{name} todavía no ha practicado esta semana. Con unos minutos al día es suficiente para empezar.', '{name} encara no ha practicat esta setmana. Amb uns minuts al dia n’hi ha prou per a començar.', "{name} hasn't practised yet this week. A few minutes a day is enough to get started."),
 'wk_days': ('{name} ha practicado {days} de los últimos 7 días ({min} min en total).', '{name} ha practicat {days} dels últims 7 dies ({min} min en total).', '{name} practised on {days} of the last 7 days ({min} min in total).'),
 'wk_accuracy': ('Ha respondido {n} preguntas y ha acertado el {pct} %.', 'Ha respost {n} preguntes i n’ha encertat el {pct} %.', 'They answered {n} questions and got {pct}% right.'),
 'wk_more': ('Son {d} días más que la semana anterior. ¡Buen ritmo!', 'Són {d} dies més que la setmana anterior. Bon ritme!', "That's {d} more days than the week before. Great rhythm!"),
 'wk_less': ('La semana anterior practicó {d} días: intentad volver a ese ritmo.', 'La setmana anterior va practicar {d} dies: intenteu tornar a eixe ritme.', 'The week before they practised on {d} days: try to get back to that rhythm.'),
 'wk_same': ('Mantiene el mismo ritmo que la semana anterior.', 'Manté el mateix ritme que la setmana anterior.', 'Same rhythm as the week before.'),
 'wk_best': ('Lo que mejor se le da ahora: {area} ({pct} % de aciertos).', 'El que millor se li dona ara: {area} ({pct} % d’encerts).', 'Going best right now: {area} ({pct}% correct).'),
 'wk_weak': ('Lo que más le cuesta ahora: {area} ({pct} %). Es lo que más le conviene practicar; abajo tenéis ideas para casa.', 'El que més li costa ara: {area} ({pct} %). És el que més li convé practicar; ací baix teniu idees per a casa.', 'Hardest right now: {area} ({pct}%). This is what will help most; there are ideas for home below.'),
 'wk_extra': ('Esta semana: {r} lecturas guiadas y {d} dictados.', 'Esta setmana: {r} lectures guiades i {d} dictats.', 'This week: {r} guided readings and {d} dictations.'),
 'wk_words': ('Palabras para repasar juntos: {words}.', 'Paraules per a repassar junts: {words}.', 'Words to practise together: {words}.'),
 'wk_copy': ('Copiar resumen', 'Copiar el resum', 'Copy summary'),
 'wk_copied': ('¡Copiado!', 'Copiat!', 'Copied!'),
 'wk_local': ('El resumen se calcula en este dispositivo con la actividad guardada en él.', 'El resum es calcula en este dispositiu amb l’activitat guardada en ell.', 'The summary is worked out on this device from the activity saved on it.'),
 'tips_title': ('Ideas para casa (sin pantallas)', 'Idees per a casa (sense pantalles)', 'Ideas for home (no screens)'),
 'tips_for': ('Para reforzar: {area}', 'Per a reforçar: {area}', 'To strengthen: {area}'),
 'tips_general': ('Para cualquier día', 'Per a qualsevol dia', 'For any day'),
 'tips_other': ('Ideas de otras áreas', 'Idees d’altres àrees', 'Ideas for other areas'),
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
    s = s[:idx] + "\n  // Family panel: weekly summary and home tips\n" + add + s[idx:]
    open(p, 'w', encoding='utf-8').write(s)
print('ok')
