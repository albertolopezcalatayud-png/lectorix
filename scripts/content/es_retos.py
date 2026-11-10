# Castellano — retos rápidos
M = 'retos_rapidos'

SYN = {
1: [("grande", "enorme", ["pequeño", "rojo", "lento"]), ("contento", "alegre", ["triste", "frío", "tarde"]), ("rápido", "veloz", ["lento", "alto", "mojado"]),
    ("pequeño", "chiquito", ["gigante", "ruidoso", "viejo"]), ("cerrar", "tapar", ["abrir", "saltar", "cantar"]), ("bonito", "precioso", ["feo", "frío", "fuerte"])],
2: [("empezar", "comenzar", ["acabar", "parar", "dormir"]), ("gritar", "chillar", ["susurrar", "cantar", "sonreír"]), ("asustado", "atemorizado", ["valiente", "contento", "aburrido"]),
    ("cansado", "agotado", ["descansado", "enfadado", "hambriento"]), ("mirar", "observar", ["escuchar", "comer", "correr"]), ("fácil", "sencillo", ["difícil", "largo", "oscuro"])],
3: [("enorme", "inmenso", ["diminuto", "silencioso", "temprano"]), ("silencioso", "callado", ["ruidoso", "soleado", "divertido"]), ("valiente", "valeroso", ["miedoso", "vago", "maleducado"]),
    ("difícil", "complicado", ["fácil", "suave", "ligero"]), ("ordenado", "recogido", ["desordenado", "sucio", "ocupado"]), ("rico", "adinerado", ["pobre", "débil", "delgado"])],
4: [("antiguo", "muy viejo", ["nuevo a estrenar", "muy rápido", "muy pequeño"]), ("furioso", "muy enfadado", ["muy tranquilo", "muy frío", "muy cansado"]),
    ("frágil", "que se rompe fácilmente", ["muy fuerte", "muy pesado", "muy brillante"]), ("agotado", "muy cansado", ["muy despierto", "muy emocionado", "muy hambriento"]),
    ("encantado", "muy contento", ["muy molesto", "muy aburrido", "muy asustado"]), ("gigantesco", "enorme", ["minúsculo", "normal", "estrecho"])],
5: [("reacio", "poco dispuesto", ["entusiasta", "descuidado", "sincero"]), ("prudente", "cauteloso", ["imprudente", "alegre", "curioso"]),
    ("abundante", "copioso", ["escaso", "frágil", "silencioso"]), ("vívido", "intenso", ["apagado", "lento", "áspero"]),
    ("a menudo", "frecuentemente", ["raramente", "nunca", "lentamente"]), ("esconder", "ocultar", ["mostrar", "construir", "seguir"])],
}
ANT = {
1: [("caliente", "frío", ["templado", "rojo", "grande"]), ("arriba", "abajo", ["encima", "alto", "aquí"]), ("día", "noche", ["sol", "semana", "mediodía"]),
    ("viejo", "nuevo", ["grande", "alto", "lento"]), ("mojado", "seco", ["frío", "suave", "lleno"]), ("contento", "triste", ["alegre", "amable", "rápido"])],
2: [("abierto", "cerrado", ["vacío", "lleno", "ancho"]), ("temprano", "tarde", ["rápido", "antes", "primero"]), ("pesado", "ligero", ["grande", "fuerte", "gordo"]),
    ("ruidoso", "silencioso", ["fuerte", "agudo", "hondo"]), ("empujar", "tirar", ["apretar", "chutar", "coger"]), ("ganar", "perder", ["jugar", "vencer", "marcar"])],
3: [("valiente", "miedoso", ["atrevido", "fuerte", "orgulloso"]), ("generoso", "egoísta", ["amable", "simpático", "educado"]), ("llegar", "irse", ["alcanzar", "entrar", "quedarse"]),
    ("antiguo", "moderno", ["viejo", "histórico", "polvoriento"]), ("superficial", "profundo", ["estrecho", "corto", "plano"]), ("áspero", "suave", ["duro", "irregular", "seco"])],
4: [("victoria", "derrota", ["triunfo", "éxito", "premio"]), ("ensanchar", "estrechar", ["crecer", "estirar", "alargar"]), ("permanente", "temporal", ["duradero", "estable", "fijo"]),
    ("inocente", "culpable", ["sincero", "puro", "tranquilo"]), ("incluir", "excluir", ["contener", "añadir", "implicar"]), ("máximo", "mínimo", ["mayor", "total", "superior"])],
5: [("transparente", "opaco", ["claro", "cristalino", "brillante"]), ("optimista", "pesimista", ["esperanzado", "alegre", "positivo"]),
    ("escaso", "abundante", ["raro", "limitado", "corto"]), ("elogiar", "criticar", ["admirar", "aplaudir", "agradecer"]),
    ("voluntario", "obligatorio", ["opcional", "libre", "dispuesto"]), ("subir", "bajar", ["escalar", "alzar", "trepar"])],
}
ODD = {
1: [(["gato", "perro", "vaca"], "manzana", "La manzana es una fruta; los demás son animales."), (["rojo", "azul", "verde"], "silla", "La silla es un mueble; los demás son colores."),
    (["uno", "dos", "tres"], "tarta", "La tarta es comida; los demás son números.")],
2: [(["plátano", "pera", "uva"], "zanahoria", "La zanahoria es una hortaliza; las demás son frutas."), (["lunes", "viernes", "domingo"], "marzo", "Marzo es un mes; los demás son días."),
    (["coche", "autobús", "tren"], "puente", "Un puente no es un vehículo.")],
3: [(["tiburón", "ballena", "delfín"], "águila", "El águila vuela; los demás viven en el mar."), (["violín", "guitarra", "piano"], "martillo", "El martillo es una herramienta, no un instrumento."),
    (["primavera", "verano", "otoño"], "martes", "Martes es un día; los demás son estaciones.")],
4: [(["Marte", "Venus", "Júpiter"], "Luna", "La Luna no es un planeta."), (["triángulo", "cuadrado", "círculo"], "cubo", "El cubo tiene tres dimensiones; los demás son figuras planas."),
    (["correr", "saltar", "nadar"], "contento", "«contento» es un adjetivo; los demás son verbos.")],
5: [(["rápidamente", "lentamente", "fuertemente"], "valiente", "«valiente» es un adjetivo; los demás son adverbios."), (["París", "Madrid", "Roma"], "Francia", "Francia es un país; los demás son capitales."),
    (["líquido", "sólido", "gas"], "metal", "El metal es un material; los demás son estados de la materia.")],
}
CLASS = {
1: [("¿Qué palabra es un animal?", "caballo", ["mesa", "azul", "saltar"], "El caballo es un animal."),
    ("¿Qué palabra es un color?", "rosa", ["cerdo", "lápiz", "bote"], "Rosa es un color.")],
2: [("¿Qué palabra es un verbo (una acción)?", "correr", ["rojo", "perro", "caja"], "«correr» es una acción: un verbo."),
    ("¿Qué palabra es un sustantivo (una cosa)?", "silla", ["cantar", "contento", "rápidamente"], "Una silla es una cosa: un sustantivo.")],
3: [("¿Qué palabra es un adjetivo (describe)?", "suave", ["saltar", "jardín", "lentamente"], "«suave» describe: un adjetivo."),
    ("¿Qué palabra es un verbo?", "susurrar", ["silencioso", "almohada", "suave"], "«susurrar» es una acción: un verbo.")],
4: [("¿Qué palabra es un adverbio?", "cuidadosamente", ["cuidadoso", "cuidado", "descuidado"], "«cuidadosamente» dice cómo: un adverbio."),
    ("¿Qué palabra es un pronombre?", "ellos", ["mesa", "debajo", "rápido"], "«ellos» sustituye a un nombre: un pronombre.")],
5: [("¿Qué palabra es una preposición?", "entre", ["bonito", "creer", "porque"], "«entre» es una preposición: une palabras e indica una relación."),
    ("¿Qué palabra es una conjunción?", "aunque", ["siempre", "ya", "casi"], "«aunque» une dos ideas: una conjunción.")],
}
SERIES = {
1: [("lunes, martes, ___", "miércoles", ["viernes", "domingo", "lunes"]), ("uno, dos, tres, ___", "cuatro", ["cinco", "seis", "diez"])],
2: [("enero, febrero, ___", "marzo", ["abril", "mayo", "junio"]), ("primavera, verano, ___", "otoño", ["invierno", "primavera", "mayo"])],
3: [("jueves, viernes, ___", "sábado", ["domingo", "lunes", "martes"]), ("diez, veinte, treinta, ___", "cuarenta", ["cincuenta", "trece", "cuatro"])],
4: [("octubre, noviembre, ___", "diciembre", ["enero", "septiembre", "agosto"]), ("primero, segundo, tercero, ___", "cuarto", ["quinto", "cuatro", "catorce"])],
5: [("pasado, presente, ___", "futuro", ["historia", "ayer", "pretérito"]), ("sólido, líquido, ___", "gaseoso", ["agua", "hielo", "vapor de agua"])],
}
LETTERS = {1: ["gato", "sol", "mesa", "pato"], 2: ["ventana", "conejo", "playa", "montaña"], 3: ["elefante", "naranja", "tortuga", "canción"],
           4: ["mariposa", "dinosaurio", "importante", "bicicleta"], 5: ["miércoles", "necesidad", "biblioteca", "ayuntamiento"]}
FIRST_ABC = {
1: [["abeja", "gato", "oso", "pato"], ["cama", "mar", "nariz", "sol"]],
2: [["melón", "pera", "piña", "plátano"], ["luz", "puerta", "silla", "taza"]],
3: [["bota", "buey", "bufanda", "caja"], ["coche", "cola", "cubo", "gorro"]],
4: [["sal", "sed", "sol", "sur"], ["pan", "pana", "pañal", "papel"]],
5: [["plato", "playa", "plaza", "pluma"], ["estación", "estrella", "estuche", "estufa"]],
}
PLURAL = {
1: [("gato", "gatos", ["gatoes", "gatoz", "gatus"]), ("flor", "flores", ["flors", "floras", "floris"])],
2: [("pez", "peces", ["pezes", "pezs", "pezos"]), ("camión", "camiones", ["camións", "camiónes", "camions"])],
3: [("lápiz", "lápices", ["lápizes", "lápizs", "lapices"]), ("luz", "luces", ["luzes", "luzs", "lucez"])],
4: [("examen", "exámenes", ["examenes", "exámens", "examens"]), ("joven", "jóvenes", ["jovenes", "jóvens", "jovens"])],
5: [("lunes", "lunes", ["luneses", "lunés", "luness"]), ("sofá", "sofás", ["sofaes", "sofases", "sofáses"])],
}
COMPOUND = {
1: [("saca", "puntas", ["gatos", "mesas", "nubes"]), ("gira", "sol", ["pan", "mar", "pie"])],
2: [("para", "caídas", ["mesas", "libros", "perros"]), ("abre", "latas", ["sillas", "nubes", "flores"])],
3: [("lava", "platos", ["sillas", "libros", "perros"]), ("cumple", "años", ["lunas", "flores", "casas"])],
4: [("rasca", "cielos", ["mares", "soles", "pies"]), ("salva", "vidas", ["peces", "libros", "mesas"])],
5: [("pasa", "montañas", ["ventanas", "lápices", "sillas"]), ("casca", "nueces", ["puertas", "libros", "ojos"])],
}
ORD_LETTERS = {1: ["g", "a", "t", "o"], 2: ["p", "e", "r", "a"], 3: ["p", "l", "a", "n", "t", "a"], 4: ["a", "r", "a", "ñ", "a"],
               5: ["c", "a", "s", "t", "i", "l", "l", "o"]}
ORD_LETTERS2 = {1: ["s", "o", "l"], 2: ["m", "e", "s", "a"], 3: ["t", "r", "e", "n"], 4: ["j", "a", "r", "d", "í", "n"],
                5: ["v", "e", "n", "t", "a", "n", "a"]}

FEM = {"flor", "luz"}


def build(b):
    for level in range(1, 6):
        for w, s, wrong in SYN[level]:
            b.mc(M, level, f"¿Qué palabra significa lo mismo que «{w}»?", s, wrong, f"«{w}» y «{s}» significan lo mismo.")
        for w, a, wrong in ANT[level]:
            b.mc(M, level, f"¿Cuál es lo contrario de «{w}»?", a, wrong, f"Lo contrario de «{w}» es «{a}».")
        for group, odd, expl in ODD[level]:
            b.mc(M, level, f"¿Qué palabra NO es del grupo: {', '.join(group)} o {odd}?", odd, group, expl)
        for prompt, ans, wrong, expl in CLASS[level]:
            b.mc(M, level, prompt, ans, wrong, expl)
        for seq, ans, wrong in SERIES[level]:
            b.mc(M, level, f"Completa la serie: {seq}", ans, wrong, f"El siguiente es «{ans}».")
        for w in LETTERS[level]:
            n = len(w)
            b.mc(M, level, f"¿Cuántas letras tiene «{w}»?", str(n), [str(n - 1), str(n + 1), str(n + 2)], f"{'-'.join(w)} = {n} letras.")
        for words in FIRST_ABC[level]:
            b.mc(M, level, "¿Qué palabra va primero en el diccionario?", words[0], words[1:], f"Orden alfabético: {', '.join(words)}.")
        for one, many, wrong in PLURAL[level]:
            art = ("una", "dos") if one in FEM else ("un", "dos")
            expl = f"el {one}, los {many}: no cambia." if one == many else f"{art[0]} {one}, {art[1]} {many}."
            b.mc(M, level, f"¿Cuál es el plural de «{one}»?", many, wrong, expl)
        for first, second, wrong in COMPOUND[level]:
            b.mc(M, level, f"¿Qué palabra forma una palabra nueva con «{first}»?", second, wrong, f"{first} + {second} = {first}{second}.")
        for letters in (ORD_LETTERS[level], ORD_LETTERS2[level]):
            word = ''.join(letters)
            b.order(M, level, f"Ordena las letras para escribir «{word.upper()}»", [l.upper() for l in letters], f"{'-'.join(letters).upper()} = {word.upper()}")
