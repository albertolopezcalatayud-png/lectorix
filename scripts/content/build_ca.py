import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from builder import Bank
import ca_fonologia, ca_memoria, ca_comprension, ca_escritura, ca_retos, ca_readings
import ca_eso_fon_mem, ca_eso_comp, ca_eso_esc_ret
b = Bank('ca', seed=2026)
for mod in (ca_fonologia, ca_memoria, ca_comprension, ca_escritura, ca_retos, ca_readings):
    mod.build(b)
# ESO levels (6-9) go last so the ids and option order of levels 1-5 never change
ca_eso_fon_mem.build_fon(b)
ca_eso_fon_mem.build_mem(b)
ca_eso_comp.build_comp(b)
ca_eso_esc_ret.build_esc(b)
ca_eso_esc_ret.build_ret(b)
ca_eso_comp.build_readings(b)
b.save('lectures.ca.json')

# Skill and step (difficulty inside the level) for every exercise
import tag_items
tag_items.tag_lang('ca')
