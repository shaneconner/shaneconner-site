# Part 3 Narrative Notes — Observations from 235k ticks (analysis ongoing, export at ~74%)

## The Big Picture

Part 3 is a fundamentally different story from Parts 1 and 2. The body diversity problem is solved. All 7 node types persist through the entire run, and organisms grow to 24+ nodes on average. The convergence-to-minimalism that defined Parts 1 and 2 does not happen here.

## Key Metrics Arc

| Tick | Pop | Species | Gen | Avg Nodes | Avg Types | Composition |
|------|-----|---------|-----|-----------|-----------|-------------|
| 0 | 50 | 1 | 0 | 5.0 | 4.0 | Starter body: 20% each core/sensor/mouth, 40% muscle |
| 5k | 268 | 127 | 31 | 6.9 | 4.7 | Early radiation, all types emerging |
| 10k | 226 | 104 | 76 | 8.0 | 4.8 | Armor starts rising (18%), sensors declining |
| 25k | 253 | 96 | 80 | 15.1 | 6.0 | Bodies doubled. Armor dominant (36%), sensors cratered (2%) |
| 50k | 121 | 29 | 118 | 19.0 | 6.9 | Population crash. Survivors have all 7 types. Sensors recovering (9%) |
| 75k | 182 | 31 | 133 | 19.6 | 7.0 | Full diversity: every organism has all 7 node types |
| 100k | 176 | 23 | 136 | 21.5 | 7.0 | Bodies still growing. Sensors now 17%. Composition stabilizing |
| 150k | 154 | 27 | 174 | 23.3 | 7.0 | Bone rising (17%), muscle declining (13%), balanced ecosystem |
| 200k | 79 | 16 | 166 | 24.5 | 7.0 | Population dip but composition rock-solid. All 7 types maintained |
| 225k | 99 | 23 | 181 | 24.1 | 7.0 | Recovery. Composition unchanged despite population volatility |

## Five Narrative Threads

### 1. The Sensor Resurrection (the most surprising finding)
- Tick 0-5k: Sensors present in 98% of organisms (starter body includes one)
- Tick 25k: **Sensors crater to 2% of all nodes, only 23% of organisms have any**
- Tick 50k: Sensors recover to 9%, 90% of organisms
- Tick 75k onwards: **100% of organisms have sensors, averaging 2-4 per organism**
- By tick 200k: sensors are 16-18% of all nodes

This is the exact opposite of Parts 1 and 2 where sensors went extinct permanently. In Part 3, they dipped hard during the early "armor rush" era, then came back stronger than ever. The Part 3 environment actually rewards sensing: scarcer food with spatial gradients means finding food matters, and the combat system means detecting predators matters.

### 2. The Armor Era and Its Decline
- Tick 10k: Armor starts rising fast, hits 36% at tick 25k
- This is the "armor rush" — stronger predation (15 dmg/mouth) and damage reflection make armor extremely valuable early on
- By tick 50k, armor settles to ~27% and slowly declines to ~21% by 200k
- Interpretation: early armor dominance was driven by frequent combat in crowded populations. As populations spread out and organisms got better at foraging (sensors!), avoiding fights became more viable than tanking them

### 3. Bone's Late Rise
- Tick 5k: bone is only 5% of composition
- Tick 50k: 14%
- Tick 150k+: **17-18%, second only to armor and mouth**
- Bone's value comes from two mechanics: drag reduction (speed) and reach scaling (mouths far from COM eat at longer range)
- Bone is the structural scaffold that makes large bodies functional rather than just big

### 4. Bodies That Never Stop Growing
- Avg nodes: 5 → 8 → 15 → 19 → 22 → 24
- Body size distribution narrowed dramatically: stdev went from 3.8 at tick 10k to 1.0 at tick 150k
- By tick 50k, the minimum body size is 17 nodes. There are no minimal organisms left.
- The growth-biased mutations (13:1 add:remove ratio) and energy-per-node scaling worked exactly as intended: bigger bodies have more energy reserves to survive food shocks and seasonal droughts

### 5. Species Turnover Is Real but Slower
- 4,178 unique species across 235k ticks (vs Part 2's similar count over 300k)
- Dominant species hold longer: sp_7799 controls 50-60% of population from tick 130k to 200k+
- But challengers keep appearing at the margins (species at tick 200k include sp_9972, sp_10063)
- The population crashes are population-level, not composition-level: the body plan stays the same even when population drops 50%

## Composition Convergence (the key narrative)

Unlike Parts 1 and 2, Part 3 doesn't converge to minimalism. It converges to a *balanced* body plan:

**Late-game equilibrium (~tick 150k+):**
- Armor: 21-22% — defense layer
- Mouth: 17-18% — foraging apparatus
- Bone: 15-18% — structural scaffold + drag reduction + reach
- Sensor: 15-18% — environmental awareness
- Muscle: 12-13% — locomotion (diminishing returns prevent stacking)
- Fat: 9-10% — energy reserves for seasonal droughts
- Core: 4% — mandatory anchor point

Every node type earns its metabolic cost. This is exactly what the tuning was designed to produce, but the *path* to this equilibrium is the story: the armor rush, the sensor dip-and-recovery, bone's slow structural ascent.

## Events

- Tick 0-1600: Cambrian explosion. Population 50 → 230, species 1 → 91 in 1600 ticks
- Tick 25k: Armor dominance peaks (36%). Sensors at historic low (2%)
- Tick 50k: Population crash to 121. Composition shifts: sensors recovering, armor declining
- Tick 80k: Species radiation (27 → 47 species)
- Tick 128k: Extinction event (41 → 24 species)
- Tick 170k: New radiation (16 → 26 species)
- Tick 200k: Population dip to 79, but body composition completely stable

## Comparison to Parts 1 & 2

| Metric | Part 1 | Part 2 | Part 3 |
|--------|--------|--------|--------|
| Avg nodes (late) | 3 | 3-4 | 24 |
| Types per org | 2-3 | 2-3 | 7.0 (all types) |
| Sensors surviving | No | No | Yes (17%) |
| Muscle surviving | No | No | Yes (13%) |
| Armor surviving | No | Barely | Yes (21%) |
| Body convergence | Mouth+core | Mouth+core | Balanced 7-type |
