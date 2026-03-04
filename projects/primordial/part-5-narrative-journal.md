# Part 5 Narrative Journal

Simulation: 500,000 ticks, seed 628, Part 5 config
Started: 2026-03-03
Key features: corpse drops, lethal threshold (30%), moving food superpatches (4), quadratic metabolic scaling (0.7), fat nerf (30 energy/node, 25% recharge rate), no pop cap, memory nodes

**Node type mapping (viz.js authoritative):**
0=Core, 1=Bone, 2=Muscle, 3=Sensor, 4=Mouth, 5=Fat, 6=Armor, 7=Signal, 8=Stomach, 9=Claw, 10=Memory

---

## Entry 1 — Tick 3,726 — Genesis

**Snapshot:** pop=387, species=57, gen=12, avg_energy=34.5, max_energy=91.2, avg_nodes=5.9 (range 4–9)

Part 5 launched. Simulation running at `C:/Users/shane/shaneconner-site/data/full-frames-p5/`.

Default genome: 1 Core + 2 Muscle + 1 Sensor + 1 Mouth = 5 nodes. Organisms start with mouths and can eat. Population grew from 60 to 387 in 3,726 ticks — fast early expansion into an empty world.

**Node composition:**
Muscle 34.0%, Mouth 27.4%, Core 16.9%, Sensor 16.9%, Signal 1.9%, Stomach 1.1%, Bone 0.6%, Fat 0.4%, Armor 0.4%, Claw 0.3%

Muscle dominates — 2 muscle anchors per default organism. Mouth is 27%, growing as feeding nodes are selected for. The exotic types (Signal 1.9%, Stomach 1.1%) are already beginning to appear. No Fat or Armor to speak of yet.

Memory nodes: 0 at this snapshot. They appeared briefly at tick 402 but appear to have not taken hold yet. The big question is whether memory nodes will establish themselves before the body plan locks in.

Food at 901 — moderate. Corpse drops are enabled; organisms dying would be leaving energy in the world. At gen 12 with 57 species, the lineage is diversifying rapidly from the single founding genome.

Watching for: memory node appearance, first fat/armor nodes, corpse drop events visible as energy spikes when large organisms die.

---

## Entry 2 — Tick 26,148 — Post-Boom Crash, Mouth Takeover

**Snapshot:** pop=277, species=38, gen=36, avg_energy=35.7, max_energy=110.6, avg_nodes=6.2 (range 4–10)

Population peaked somewhere above 400 in the opening empty-world expansion, then crashed back to 277. This is exactly the resource-competition pressure working. The ecology is self-limiting even without a hard cap — organisms ate through the initial food surplus and now face genuine scarcity (food=820, down from 901 at tick 3,726 despite a much larger map).

**Node composition:**
Mouth 38.7%, Muscle 25.9%, Core 16.1%, Sensor 15.6%, Stomach 1.3%, Bone 1.0%, Memory 0.3%, Fat 0.6%, Signal 0.2%, Claw 0.1%, Armor 0.1%

Evolution's answer to resource scarcity: stack mouths. The default genome had 1 mouth; average organisms now carry 2.4. Muscle anchors are being replaced by feeding nodes — a direct trade of locomotion capacity for intake throughput. The short-term logic is sound: in an empty world with abundant food, more mouths = more energy. Whether this trades off too much mobility will show up in the predation era.

**Memory nodes present**: 5 organisms (1.8% adoption), 0.3% of nodes. Memory has survived the early crash. That's meaningful — the initial population boom-bust would have wiped out any trait that didn't confer real advantage. 5 memory-carriers still alive at gen 36 suggests memory is pulling its weight, possibly in patch-tracking.

**Claw at 2 organisms**: Predation hasn't launched. The math isn't there yet: targets average 35.7 energy, corpse drop would yield ~25 energy. When organisms get larger and fatter, the payoff will scale up. Watching for the first claw expansion.

~22,422 ticks/hour rate. Will check again in 1 hour (~48k ticks).

---

## Entry 3 — Tick 181,076 — Miniaturization and the Claw Boom

**Snapshot:** pop=286, species=37, gen=127, avg_energy=38.5, max_energy=119.2, avg_nodes=3.8 (range 3–8)

155,000 ticks since Entry 2. The simulation has been running at ~20k ticks/hour — fast, because bodies are small.

**Node composition:**
Mouth 27.2%, Muscle 26.4%, Core 26.5%, Stomach 7.8%, Claw 7.2%, Armor 1.8%, Sensor 1.0%, Signal 0.6%, Memory 0.5%, Fat 0.6%, Bone 0.5%

Three stories:

**1. Bodies are shrinking.** Average nodes dropped from 6.2 at tick 26k to 3.8 here. The quadratic metabolic scaling at (n/10)^0.7 is selecting hard against size. At 3.8 nodes, organisms pay roughly half the linear metabolic rate. Evolution found the minimum: core + mouth + muscle is the cheapest viable organism (3 nodes). Most bodies are 3-4 nodes, a few reach 8. This is a world of miniatures — the total opposite of Part 4's 29-node armored giants.

**2. Predation ignited.** Claw went from 2 organisms (0.7% adoption) to 75 organisms (26.2% adoption), from 0.1% to 7.2% of nodes. With the lethal threshold at 30% and tiny bodies, combat is fast and fatal. A 3-node organism at 40 energy dies from a 12-damage hit. Corpse drops make killing profitable: a 40-energy corpse yields ~28 energy (70% of total), delivered as food right where the predator is standing. The economics of murder now work because bodies are small enough that the payoff exceeds the cost of carrying the claw.

**3. Sensors collapsed.** From 15.6% to 1.0%. Nearly blind. Evolution decided that in a world of tiny bodies and scarce food, the metabolic cost of a sensor isn't justified by the information it provides. Organisms find food by random walk and encounter, not directed search. The moving superpatches were designed to reward sensing, but apparently random motion intersects patches often enough.

**Memory holding at 5 organisms** (1.7% adoption, 0.5% nodes). The same 5-organism count as Entry 2 — could be a single persistent lineage threading through 127 generations. 5 out of 286 is marginal, but survival through the entire post-crash era means memory is at least neutral.

**Armor emerging** (1.8%) in response to the claw boom. The arms race is starting — this time at miniature scale. Population stable at 286. Food at 420, down from 820 at tick 26k — resources are genuinely scarce. No intervention needed.

---
