import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from builder import Bank
import ca_fonologia, ca_memoria, ca_comprension, ca_escritura, ca_retos, ca_readings
b = Bank('ca', seed=2026)
for mod in (ca_fonologia, ca_memoria, ca_comprension, ca_escritura, ca_retos, ca_readings):
    mod.build(b)
b.save('lectures.ca.json')
