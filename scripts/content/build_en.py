import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from builder import Bank
import en_fonologia, en_memoria, en_comprension, en_escritura, en_retos, en_readings
b = Bank('en', seed=2026)
for mod in (en_fonologia, en_memoria, en_comprension, en_escritura, en_retos, en_readings):
    mod.build(b)
b.save('readings.en.json')
