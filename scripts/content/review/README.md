# Revisión pedagógica de Primaria (niveles 1–5) — noviembre de 2026

Auditoría automática (respuesta correcta mucho más larga que las demás, opciones repetidas,
recuento de sílabas, enunciados negativos, frases largas por nivel, vocabulario poco frecuente con
`wordfreq`, posición de la respuesta correcta) y revisión manual de lo señalado.

Cambios:
- `distractors_*.py`: 130 preguntas de comprensión en las que la respuesta correcta era claramente la
  más larga (se podía acertar sin leer). Opciones incorrectas reescritas con longitud parecida y
  claramente falsas según el texto.
- `reading_distractors.py`: lo mismo en 61 preguntas de las lecturas guiadas.
- `split_sentences.py`: frases de más de 15–25 palabras (según el nivel) partidas en dos.
- «¿Qué palabra sobra?» en lugar de «¿Qué palabra NO es del grupo…?», y la palabra intrusa ya no
  aparece siempre la última del enunciado.
- Ejercicios de mayúsculas: fuera las opciones absurdas («pAblo», «eL gato»); ahora los errores son
  reales (minúscula, falta el punto, letras cambiadas de orden).
- Sinónimos más sencillos en 2.º («con miedo» en vez de «atemorizado»; «xisclar» en vez de «bramar»).
- Inglés: «cannot» en vez de «can not».

La posición de la respuesta correcta ya estaba equilibrada (20–31 % en cada posición) y el
recuento de sílabas en castellano coincide con las reglas en todos los ejercicios.
