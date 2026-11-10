# Adds reading-aid keys to src/i18n/{es,ca,en}.ts (idempotent)
NEW = {
 'set_font_dyslexic_desc': ('La fuente OpenDyslexic puede facilitar la lectura a algunas personas con dislexia.', 'La lletra OpenDyslexic pot facilitar la lectura a algunes persones amb dislèxia.', 'The OpenDyslexic font can make reading easier for some people with dyslexia.'),
 'aid_title': ('Ayudas de lectura', 'Ajudes de lectura', 'Reading aids'),
 'aid_desc': ('Prueba cuáles te ayudan a leer mejor. Puedes cambiarlas cuando quieras.', 'Prova quines t’ajuden a llegir millor. Pots canviar-les quan vulgues.', 'Try which ones help you read better. You can change them at any time.'),
 'aid_syllables': ('Colorear las sílabas', 'Acolorir les síl·labes', 'Colour the syllables'),
 'aid_syllables_desc': ('En las lecturas y los textos, cada sílaba se pinta de un color distinto.', 'En les lectures i els textos, cada síl·laba es pinta d’un color diferent.', 'In readings and texts, each syllable is shown in a different colour.'),
 'aid_syllables_no_en': ('Disponible para castellano y valenciano. En inglés la división en sílabas no sigue reglas fijas y no se colorea.', 'Disponible per a castellà i valencià. En anglés la divisió en síl·labes no seguix regles fixes i no s’acolorix.', 'Available for Spanish and Valencian. English syllable division does not follow fixed rules, so it is not coloured.'),
 'aid_letter_spacing': ('Espacio entre letras', 'Espai entre lletres', 'Letter spacing'),
 'aid_line_spacing': ('Espacio entre líneas', 'Espai entre línies', 'Line spacing'),
 'aid_normal': ('Normal', 'Normal', 'Normal'),
 'aid_wide': ('Amplio', 'Ampli', 'Wide'),
 'aid_wider': ('Muy amplio', 'Molt ampli', 'Extra wide'),
 'aid_ruler': ('Regla de lectura', 'Regle de lectura', 'Reading ruler'),
 'aid_ruler_desc': ('Una franja clara que oscurece el resto de la pantalla para seguir la línea. Muévela con el asa amarilla.', 'Una franja clara que enfosquix la resta de la pantalla per a seguir la línia. Mou-la amb l’ansa groga.', 'A clear band that darkens the rest of the screen so you can follow the line. Move it with the yellow handle.'),
 'ruler_up': ('Subir la regla', 'Pujar el regle', 'Move ruler up'),
 'ruler_down': ('Bajar la regla', 'Baixar el regle', 'Move ruler down'),
 'ruler_drag': ('Arrastra para mover la regla', 'Arrossega per a moure el regle', 'Drag to move the ruler'),
 'ruler_size': ('Cambiar la altura de la regla', 'Canviar l’altura del regle', 'Change the ruler height'),
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
    s = s[:idx] + "\n  // Reading aids\n" + add + s[idx:]
    open(p, 'w', encoding='utf-8').write(s)
print('ok')
