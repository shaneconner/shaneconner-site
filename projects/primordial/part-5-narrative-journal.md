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

## Entry 4 — Tick 198,840 — The sp_652 Dynasty and Predator Economy

**Snapshot:** pop=226, species=39, gen=148, avg_energy=38.4, max_energy=124.8, avg_nodes=4.3 (range 3–7)

18,000 ticks since Entry 3. The claw boom has matured into a full predator economy, and one species is running the table.

**Node composition:**
Muscle 24.0%, Mouth 24.0%, Core 23.5%, Stomach 13.3%, Claw 10.3%, Bone 1.1%, Fat 0.9%, Armor 0.9%, Signal 0.9%, Sensor 0.6%, Memory 0.2%

**sp_652 controls 53.5% of the population** (121 of 226 organisms). This is the strongest single-species grip in Part 5 so far, and it appeared fast. sp_652 wasn't in the top 5 at tick 181k. Its rise from background noise to majority control in under 18,000 ticks is the kind of explosive succession that marks a real competitive advantage, not luck.

**Claw adoption at 43.4%**, up from 26.2%. Nearly half the population carries dedicated weapons. But stomach is the bigger story: **54% adoption**, up from scattered presence. sp_652 appears to be running a predator-forager hybrid: core + muscle + mouth + stomach + claw is a 5-node body that can eat efficiently AND kill. The stomach investment means every food item and every corpse yields more energy. Predation funded by digestion.

**Population dropped to 226**, down from 286. The claw boom is culling. **Food crashed to 260**, down from 420 at Entry 3 and 820 at Entry 2. Genuine famine. The combination of more predators (killing organisms, generating corpse food) and fewer food items means the ecosystem is transitioning from a plant-based economy to a corpse-based one. If corpse drops are feeding the predators more efficiently than the remaining plant food feeds the herbivores, we may see the population stabilize at this lower level with predators dominant.

**Bodies growing slightly**: 4.3 avg nodes, up from 3.8. The miniaturization may have bottomed out. The extra node is usually stomach or claw — functional additions, not bloat. The metabolic scaling still punishes size, but a 4-5 node body with stomach and claw earns enough from efficient predation to pay the cost.

**Memory down to 2 organisms** (0.9%), from 5. Nearly extinct. The moving superpatches weren't enough. In a world of 3-4 node bodies where lifespans are short and combat is lethal, there may simply not be enough time for memory to confer an advantage. The organism that remembers where food was 100 ticks ago doesn't survive long enough to use that information.

Watching for: sp_652 dominance — will it plateau or keep climbing? Predator-prey oscillation — if claws keep culling, food/prey may recover and create a cycle. Armor response to the 43% claw rate — armor is still only at 3.5%, which seems low given the predation pressure.

---

## Entry 5 — Tick 221,146 — The Miniature Arms Race

**Snapshot:** pop=179, species=52, gen=181, avg_energy=37.4, max_energy=124.3, avg_nodes=5.7 (range 3–9)

22,000 ticks since Entry 4. The arms race has arrived, and it looks nothing like Part 4's.

**Node composition:**
Mouth 18.6%, Claw 18.6%, Stomach 18.1%, Muscle 18.1%, Core 17.7%, Bone 5.8%, Armor 2.2%, Signal 0.5%, Fat 0.4%, Sensor 0.2%, Memory 0.0%

**Claw adoption hit 96%** (172 of 179). Up from 43% just 22,000 ticks ago. Nearly universal. The predator economy is no longer a niche — it's the default strategy. Every organism is both predator and prey.

**Stomach at 92% adoption** (165/179). Universal digestion efficiency. The hybrid predator-forager body plan from Entry 4 won, and now everyone runs it. The core template is: core + muscle + mouth + stomach + claw = 5 nodes. That's the minimum armed forager.

**Bodies growing: 5.7 avg nodes**, up from 4.3 at Entry 4 and 3.8 at Entry 3. The miniaturization has reversed. The extra nodes are bone (5.8%, up from 1.1%) and armor (2.2%, up from 0.9%). Structural and defensive investment is beginning. This is the same sequence as Part 4 — claws go universal, then armor appears in response, then bone scaffolds the armor — but at one-fifth the scale. Part 4's organisms grew from 8 to 28 nodes during the arms race. Part 5's are growing from 3.8 to 5.7. The metabolic scaling is doing its job: bodies grow, but slowly.

**sp_652 dropped from 53.5% to 33.5%.** The dynasty is weakening. Species diversity actually increased from 39 to 52 despite the population shrinking from 226 to 179. More species, fewer organisms per species. The arms race opened the design space: when everyone has claws and stomachs, the remaining degrees of freedom — how many bone nodes, where the armor goes, neural weights — create room for new lineages.

**Memory extinct.** Zero organisms. The experiment's hypothesis about memory nodes earning their cost through patch-tracking has been falsified. In a world of lethal combat and 5-node bodies, there is no room for a node that doesn't directly contribute to feeding or fighting. Memory was neutral at best, and neutral isn't good enough when every node must justify itself against a (n/10)^0.7 metabolic curve.

**Population at 179**, down from 226. Food at 227, still dropping. The ecosystem is running hotter and leaner. More predators, fewer survivors, less food. The question now is whether the miniature arms race follows Part 4's trajectory to completion (universal armor, universal fat, body size explosion) or whether the metabolic scaling creates a ceiling that Part 4 never hit.

---

## Entry 6 — Tick 250,684 — The Predator Crash

**Snapshot:** pop=183, species=39, gen=203, avg_energy=36.8, max_energy=75.6, avg_nodes=4.7 (range 3–8)

30,000 ticks since Entry 5. The miniature arms race didn't follow Part 4's trajectory. It reversed.

**Node composition:**
Mouth 22.6%, Muscle 21.7%, Stomach 21.4%, Core 21.3%, Claw 7.2%, Armor 3.3%, Fat 0.8%, Sensor 0.6%, Signal 0.5%, Memory 0.3%, Bone 0.3%

**Claw adoption crashed from 96% to 32%** (59 of 183). The most dramatic reversal in the simulation so far. At tick 221k, nearly every organism carried a claw. Now two-thirds don't. The predator economy overshot. When 96% of the population was armed, everyone was killing everyone. Corpse food was abundant but the prey population couldn't sustain the kill rate. Predators couldn't find enough targets to justify the claw's metabolic cost. The herbivore strategy — core + muscle + mouth + stomach, 4 nodes, no claw — became more efficient than the armed version. Evolution stripped the weapons back off.

This is the Lotka-Volterra dynamic that Part 5 was designed to test. Predators rise → prey crash → predators starve → predators crash → prey recover. The first half of the cycle played out between Entries 3 and 5 (claws rising from 0.7% to 96%). The second half played out between Entry 5 and now (claws crashing from 96% to 32%). Whether the cycle repeats — whether claws will rise again as the unarmed prey population recovers and presents soft targets — is the next question.

**Bodies shrank from 5.7 to 4.7 avg nodes.** The arms race infrastructure is dismantling. Bone collapsed from 5.8% to 0.3%. The defensive and structural investment that appeared during the claw boom is gone. Bodies are reverting toward the lean forager template.

**sp_3301 rose to 32.2%**, overtaking sp_652 (27.3%). A new dynasty challenger, likely an unarmed or lightly-armed forager lineage that thrives in the post-predator environment. The species succession tracks the strategy shift: when claws were universal, sp_652 dominated with its hybrid predator-forager body. Now a different body plan leads.

**Max energy dropped from 124 to 75.6.** Organisms are poorer. With fewer kills and less corpse food, the energy cycling through the ecosystem has declined. Food at 209, the lowest yet.

**Memory resurrected**: 2 organisms, back from zero. Probably a new mutation rather than a surviving lineage. Still marginal.

**Stomach still universal at 96%.** The one trait that survived the predator crash intact. Digestion efficiency is always valuable regardless of whether you're eating food or corpses. Stomach is the Part 5 winner so far — the only node type besides core, muscle, and mouth that achieved and maintained near-universal adoption through both the predator boom and the predator crash.

Watching for: Does the cycle repeat? As unarmed prey recover and fatten, will claws become profitable again? If so, this would be the first genuine predator-prey oscillation in the project's history.

---

## Entry 7 — Tick 278,138 — The Armor Pivot

**Snapshot:** pop=324, species=49, gen=222, avg_energy=35.1, max_energy=112.2, avg_nodes=4.3 (range 3–8)

27,000 ticks since Entry 6. The ecosystem did something none of the previous parts have done: it chose defense over offense.

**Node composition:**
Muscle 23.4%, Mouth 23.4%, Core 23.1%, Armor 15.5%, Stomach 8.0%, Sensor 1.6%, Claw 1.4%, Fat 1.3%, Bone 1.1%, Signal 0.8%, Memory 0.4%

The numbers tell the story of a complete strategic inversion:

| Trait | Entry 5 (tick 221k) | Entry 6 (tick 251k) | Entry 7 (tick 278k) |
|-------|---------------------|---------------------|---------------------|
| Claw | 96% | 32% | **5.6%** |
| Armor | 12% | 12% | **63.6%** |
| Stomach | 92% | 96% | **34.9%** |
| Population | 179 | 183 | **324** |

**Armor adoption exploded to 63.6%** (206 of 324). From 12% at Entry 6 to 64% now. Armor is 15.5% of all nodes — a larger proportional share than claw ever achieved at its peak (18.6% at Entry 5). The ecosystem didn't just strip its weapons. It put on shields.

**Claw collapsed to 5.6%** (18 organisms). From 96% at its peak. The predator economy is dead. The few remaining claw-carriers face a population where two-thirds carry armor that reflects 20% of incoming damage. The math that made predation profitable — small bodies, easy kills, rich corpses — no longer works when the target bounces damage back.

**sp_652 surged to 64.2%** (208 of 324). The strongest single-species grip in the entire Part 5 run. This species keeps reinventing itself: predator-forager hybrid at Entry 4 (53%), weakened during the arms race (27% at Entry 6), and now dominant again as an armored forager. sp_652 is the story of Part 5's adaptive capacity — the same lineage pivoting from offense to defense as the meta shifts.

**Population surged to 324**, up from 183. The highest since the genesis boom (387). Armor is keeping organisms alive. Fewer predators means less mortality. The carrying capacity is being tested from above for the first time since the opening expansion.

**Stomach dropped from 96% to 35%.** No longer universal. The body budget shifted from digestion to defense: organisms traded stomach nodes for armor nodes. When predators were everywhere, digestion efficiency maximized corpse income. When predators disappeared, the corpse economy dried up and armor's survival benefit outweighed stomach's income benefit.

**Food at 143** — the lowest in the simulation's history. 324 organisms competing for 143 food items. This is the density-dependent crisis that should trigger the next phase: either a population crash, a new predation cycle as the unarmed crowd becomes vulnerable, or both.

**Sensor recovered to 5.9%** (19 organisms), up from near-zero. In a world of 324 organisms and 143 food items, finding food before someone else does matters again. The information value of a sensor node increases when competition for food is intense.

**Memory at 6 organisms** (1.9%). The highest count in the simulation's history. Still marginal, but the pattern of memory appearing during transitions and dying during stable periods continues.

The Lotka-Volterra cycle didn't repeat cleanly. Instead of predators rising again, the ecosystem found a third state: armored herbivore. The cycle went offense → collapse → defense, not offense → collapse → offense. Whether the armored herbivore equilibrium holds depends on the food crisis. At 143 food items for 324 organisms, something has to give.

---

## Entry 8 — Tick 303,432 — The Cycle Repeats

**Snapshot:** pop=292, species=39, gen=247, avg_energy=39.7, max_energy=131.8, avg_nodes=4.6 (range 3–7)

25,000 ticks since Entry 7. The armored herbivore equilibrium didn't hold. The cycle is repeating.

**Node composition:**
Mouth 22.9%, Stomach 22.6%, Muscle 22.3%, Core 21.6%, Claw 6.7%, Armor 1.6%, Memory 1.0%, Bone 0.4%, Sensor 0.4%, Signal 0.3%, Fat 0.1%

**The oscillation in full:**

| Trait | E5 (221k) | E6 (251k) | E7 (278k) | E8 (303k) |
|-------|-----------|-----------|-----------|-----------|
| Claw | 96% | 32% | 5.6% | **29.8%** |
| Armor | 12% | 12% | 63.6% | **7.5%** |
| Stomach | 92% | 96% | 34.9% | **94.9%** |
| Pop | 179 | 183 | 324 | **292** |

Claws are rising again. Armor is falling. Stomach is back to near-universal. The ecosystem is cycling between offense and defense on a roughly 50,000-tick period: predator peak at tick 221k, defensive peak at tick 278k, and now heading back toward offense at tick 303k.

**Claw adoption at 29.8%** (87 of 292), up from 5.6% at Entry 7. The armored herbivores created exactly the conditions that make predation profitable again: a dense population (324 at Entry 7) of organisms investing in defense rather than fighting back. Armor reflects 20% of damage, but a claw-carrying predator against an armor-carrying non-predator still wins the encounter. The armor delayed the kill; it didn't prevent it. When the prey population is dense enough and armed organisms are rare enough, the math works again.

**Armor crashed from 63.6% to 7.5%.** The shields came off as fast as they went on. Armor's metabolic cost isn't justified when predator density is low. At 30% claw adoption, the probability of encountering a predator isn't high enough to make every organism carry armor. The defensive investment gets traded for stomach (digestion efficiency) as the meta shifts back toward foraging.

**sp_652 at 74.0%** (216 of 292). The strongest single-species grip in the entire simulation. sp_652 has dominated every phase of the cycle: predator-forager at Entry 4 (53%), armored forager at Entry 7 (64%), and now the cycling meta at 74%. Whatever sp_652's neural weights are doing, they adapt to the strategic environment faster than any competitor. The species is not locked into one strategy — it rides the oscillation.

**Memory at 14 organisms (4.8% adoption, 1.0% of nodes).** The highest count by a factor of two. This is the first time memory has exceeded noise levels. The oscillating meta may be creating conditions where memory confers a real advantage: organisms that remember which patches yielded food in the previous cycle, or which areas had high predator density, would have an edge during the transitional periods when the dominant strategy is shifting. Whether 14 organisms is the start of genuine adoption or another false start depends on the next 50,000 ticks.

Population at 292, down from 324. The food crisis corrected — food recovered slightly to 165 from 143. The density crash wasn't dramatic; it was a gentle deflation as the most food-stressed organisms died and the survivors spread out.

The simulation is past 300,000 ticks, 60% of the 500k target. The major finding so far: genuine strategic oscillation on a ~50k-tick cycle, driven by the economics of corpse drops and lethal thresholds. Part 4's arms race ran to completion and locked in. Part 5's oscillates. The difference is the metabolic scaling: bodies can't grow large enough to make the arms race permanent. When everyone is 4-5 nodes, every strategic shift costs only one node — cheap enough to reverse.

---

## Entry 9 — Tick 329,094 — Learning from the Last Cycle

**Snapshot:** pop=252, species=57, gen=273, avg_energy=39.7, max_energy=118.7, avg_nodes=5.0 (range 4–8)

26,000 ticks since Entry 8. The second predation cycle is building, but with a difference: the ecosystem is arming and armoring simultaneously.

**Node composition:**
Mouth 21.0%, Stomach 20.8%, Muscle 20.2%, Core 20.1%, Claw 9.1%, Armor 3.0%, Sensor 1.8%, Bone 1.6%, Fat 1.1%, Memory 0.8%, Signal 0.6%

**The second cycle is tracking the first, but faster:**

| Trait | Cycle 1 peak (E5, 221k) | Cycle 2 now (E9, 329k) |
|-------|-------------------------|------------------------|
| Claw | 96% | **41.7%** (rising) |
| Armor | 12% | **13.1%** (rising) |
| Bone | — | **6.7%** |
| Fat | — | **5.2%** |

In the first cycle, claws rose to 96% before armor appeared at all. This time, armor (13.1%), bone (6.7%), and fat (5.2%) are all rising alongside claws (41.7%). The ecosystem learned. Or more precisely: the lineages that carry defensive traits weren't completely eliminated during the trough, and the survivors are co-evolving with the new predators instead of lagging a full cycle behind.

**Sensors recovered to 8.7%** (22 of 252). The most meaningful sensor presence since genesis. With food at 143 (the lowest sustained level in the simulation), competition is fierce enough that directional information has real value. At 5.0 avg nodes, organisms can afford a sensor as a 5th node alongside the core/muscle/mouth/stomach template. The sensor collapse may have been specific to the miniaturization era when bodies were 3-4 nodes and couldn't spare a node for information. At 5 nodes, the budget is less tight.

**sp_652 at 53.6%**, down from 74%. Still dominant but weakening as the cycle intensifies and species diversity climbs to 57 (the highest since Entry 5's 52). The oscillating meta creates room for specialists: claw-heavy lineages that thrive during predator booms, armor-heavy lineages that thrive during defensive phases, and generalists that survive both.

**Memory at 8 organisms** (3.2%), down from 14 but still present. Memory has now survived three consecutive entries. It keeps appearing during transitions and declining during stable phases. The oscillating meta may be creating a permanent marginal niche for memory: organisms that track which parts of the map are safe during the current strategic phase.

Average body size has crossed 5.0 nodes for the first time since the miniaturization era ended. The minimum is now 4, not 3 — no more 3-node organisms. The floor has risen. Evolution has settled on a minimum viable body that includes core + muscle + mouth + stomach, and the 5th slot cycles between claw, armor, and sensor depending on the meta phase.

Food at 143, the same critical low as Entry 7. The ecosystem is running at capacity. The next 20,000 ticks should show whether claws peak again or whether the parallel armor buildup dampens the oscillation into something more stable.

---
