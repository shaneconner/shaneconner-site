# Primordial 100k-tick Narrative Arc

Notes on the emerging story as the simulation runs (seed 42, natural population dynamics).
These observations will inform the final website prose and clip selection.

---

## Raw Data Summary (through tick 64k)

| Tick | Pop | Species | Gen | Events | t/s |
|------|-----|---------|-----|--------|-----|
| 1k   | 11  | 1       | 2   | 3      | 65  |
| 3k   | 20  | 3       | 6   | 11     | 49  |
| 5k   | 231 | 32      | 11  | 94     | 20  |
| 6k   | 283 | 36      | 13  | 194    | 13  |
| 7k   | 209 | 27      | 15  | 264    | 11  |
| 10k  | 277 | 21      | 21  | 436    | 9   |
| 15k  | 263 | 21      | 29  | 646    | 8   |
| 20k  | 281 | 25      | 36  | 888    | 8   |
| 25k  | 293 | 31      | 45  | 1105   | 8   |
| 30k  | 261 | 21      | 52  | 1307   | 8   |
| 32k  | 258 | 13      | 53  | 1384   | 8   |
| 40k  | 301 | 32      | 63  | 1733   | 7   |
| 45k  | 301 | 27      | 72  | 1913   | 7   |
| 48k  | 249 | 20      | 66  | 2048   | 7   |
| 55k  | 277 | 29      | 78  | 2333   | 7   |
| 60k  | 267 | 15      | 88  | 2553   | 7   |
| 64k  | 268 | 18      | 87  | 2731   | 7   |

---

## Phase 1: The Struggle (Ticks 0-3000)

Population crashes from 50 to ~10 within the first 400 ticks. Most founding organisms have random neural networks that can't coordinate muscles into purposeful movement. They wander aimlessly, burning energy faster than they find food. The anti-extinction floor (min_population=10) keeps the simulation alive.

A handful of survivors — organisms whose random weights happen to produce net movement toward food — cling to existence. Over the next 2500 ticks, the population hovers at 10-20. These are the founders. Every organism that will ever live descends from them.

This phase is the simulation's answer to the question of whether intelligence can bootstrap itself from random noise. The answer is yes, but barely. Out of 50 random neural networks, only a few produce behavior that happens to correlate with food-seeking. Everything that follows is refinement of those accidental strategies.

**Clip: Genesis** — The founding population. Random brains, uncoordinated movement. Most will die within hundreds of ticks.

---

## Phase 2: The Bloom (Ticks 3000-6000)

Around tick 3000, something breaks open. Enough generations have passed (gen 6) that foraging strategies have been refined through pure selection. Organisms that find food reliably start reproducing. The population explodes: 20 → 75 → 231 → 283 in 3000 ticks.

Speciation events cascade — 36 distinct species at peak diversity (tick 6k). This is adaptive radiation: a successful strategy fragments into dozens of variants as mutations explore the space. Each new species represents a slightly different body plan or neural configuration that found a niche.

The speed of this bloom is remarkable. In biological terms, it mirrors the Cambrian Explosion — a long period of low-diversity survival followed by an explosive diversification once key innovations emerge. Here, the "key innovation" is reliable food-seeking: once organisms can consistently find and eat plants, energy becomes abundant enough to sustain reproduction, and reproduction creates the variation that drives speciation.

**Clip: First Divergence** — The first speciation event, early in the bloom.
**Clip: The Bloom** — Population explosion as foraging strategies propagate.
**Clip: Radiation** — Peak diversity at 36 species coexisting.

---

## Phase 3: The First Crash (Ticks 6000-7500)

The bloom overshoots. 283 organisms compete for finite food. Plant spawn rate (2.5/tick × 25 energy = 62.5 energy/tick) can't sustain 283 organisms each burning ~0.2 energy/tick (56.6 energy/tick total). Resources deplete. The population crashes: 283 → 209.

Species diversity drops from 36 to 27. The weakest strategies — organisms too large, too metabolically expensive, or too slow — go extinct. What remains are the leaner, more efficient lineages. This is the first real selection event driven by resource scarcity rather than inability to function.

**Clip: Collapse** — Population crash from resource depletion.

---

## Phase 4: Oscillation & Refinement (Ticks 7500-25000)

The ecosystem enters a dynamic equilibrium. Population oscillates between 250-310 in irregular, quasi-periodic cycles. Each cycle is a miniature boom-bust: a successful mutation spreads, the population grows, resources tighten, weaker organisms starve, the population contracts.

The cycles aren't regular — they vary in amplitude and period. This matches real ecological dynamics: populations oscillate around carrying capacity in complex patterns influenced by lag effects, spatial distribution, and the evolutionary state of the competing species.

Generations advance rapidly — gen 21 at tick 10k, gen 36 at tick 20k, gen 45 at tick 25k. Neural networks are being refined across dozens of generations. Each generation inherits its parent's weights plus small Gaussian perturbations; the mutation scale itself is an evolvable parameter. Organisms that have tuned their own mutation rate — not too high (destructive), not too low (stagnant) — leave more descendants.

Senescence (metabolic cost increase after age 3000, death at age 5000) forces generational turnover. No organism can dominate indefinitely by simply living longer. Even the most successful forager eventually dies of old age, making room for its offspring — who carry the refined genome forward with new variations.

**Clip: Recovery** — Population rebounds after the first crash.
**Clip: Equilibrium** — Dynamic stability with boom/bust oscillations.

---

## Phase 5: The First Consolidation (Ticks 25000-35000)

A notable shift around tick 25k: species diversity drops from 31 to 13 at tick 32k. This isn't a population crash — the population stays at 250-270. Instead, a few dominant species outcompete and absorb the ecological niches of their rivals.

This is competitive exclusion in action: generalist strategies that work across a range of conditions squeeze out specialists. When the environment is relatively uniform (food distributed evenly, no extreme local conditions), there's no advantage to specialization. The generalists win everywhere.

Generation reaches 54 by tick 33k. Body plans and neural architectures have been refined through 50+ generations of selection. The organisms alive now are profoundly different from the random-brained founders — their neural networks encode food-seeking behavior discovered entirely through evolutionary search.

**Clip: Deep Time** — Highly evolved organisms with refined neural networks.

---

## Phase 6: Second Radiation (Ticks 35000-45000)

After the consolidation bottleneck, diversity recovers dramatically. By tick 39k species jumps back to 27, and at tick 40k it hits 32 with population at 301. This is a second adaptive radiation — the dominant generalists have fragmented into new specialists as mutations explore the space opened up by the consolidation.

This mirrors real evolutionary patterns: periods of low diversity followed by explosive speciation when environmental conditions shift or key innovations emerge. The consolidation removed the "old guard" of species, creating ecological vacancies that new variants rush to fill.

**Clip: Second Radiation** — A second wave of speciation after the consolidation.

---

## Key Observation: The Generation Paradox (Ticks 45000-52000)

One of the most interesting phenomena: the max generation doesn't monotonically increase. At tick 45k, max generation hit 72. By tick 48k it dropped to 66. This means a species with 72 generations of evolutionary refinement went extinct, and the oldest surviving lineage was only gen 66.

This tells a compelling story: evolutionary "success" measured by generational depth doesn't guarantee survival. A younger species (fewer generations) can outcompete an older, more refined one. The older species may have over-specialized for conditions that shifted, while the younger species stumbled into a better body plan through a lucky mutation. It's the biological equivalent of the innovator's dilemma — incumbents optimized for the current environment lose to disruptors with less refinement but better foundational strategies.

This pattern recurs throughout the simulation. Generation count oscillates: 72→66→70→72→73→78→81→83→85→88→87→85→86→87. Each dip represents an extinction event where a deep lineage dies and a shallower one takes its place.

**Clip: Generation Milestone** — A new generation milestone marks ongoing evolution.

---

## Phase 7: The Second Consolidation (Ticks 55000-64000+)

History repeats. Between ticks 55k-60k, species diversity drops from 29 to 15 while population remains stable at ~270. A second competitive exclusion event. At tick 60k, generation reaches 88 — the highest yet — suggesting the surviving species are highly refined.

A brief diversity spike at tick 61k (back to 27 species) collapses immediately back to 16-18. The ecosystem seems to be cycling between two states: diverse (20-30 species) and consolidated (13-18 species). This oscillation between radiation and consolidation is itself an emergent pattern — nobody programmed it.

The answer: the pattern continues, with one dramatic twist.

---

## Phase 8: The Lowest Point (Ticks 65000-72000)

Species diversity plummets to **9 at tick 70k** — the absolute lowest in the entire 100,000-tick simulation. This is a near-monopoly: just 9 species share a world that once held 36. Population briefly spikes to 309 at tick 71k as the dominant species exploit their lack of competition, then contracts again.

This bottleneck is severe but not catastrophic. Unlike the early crash (which threatened total extinction), this is competitive exclusion taken to its logical extreme. A few hyper-efficient lineages have crowded out everything else. Generation count hits 97 — these are the most evolved organisms yet, with neural networks refined across nearly 100 generations of selection.

The 9-species bottleneck is the simulation's darkest moment from a diversity standpoint. It's also the most biologically fascinating: it demonstrates that evolutionary "fitness" at the individual level can reduce diversity at the ecosystem level. The fittest organisms don't create the richest ecosystems — they simplify them.

---

## Phase 9: Third Radiation (Ticks 72000-80000)

From the diversity nadir of 9, species count rebounds to 23 by tick 74k and 26 by tick 76k. This is the third adaptive radiation cycle, and by now the pattern is unmistakable: **consolidation → bottleneck → radiation → consolidation**. Each cycle operates on a different timescale and amplitude, but the structure repeats.

Generation hits **100 at tick 75k** — a symbolic milestone. One hundred generations of neural networks refined purely through survival pressure. No human ever looked at these networks. No gradient was ever computed. These are optimization products of pure evolutionary search across 100 generational iterations.

---

## Phase 10: Mature Ecosystem (Ticks 80000-100000)

The final 20k ticks show a stabilized but still dynamic ecosystem. Population oscillates 255-305, species count 17-35. Generation advances from 106 to 128. The system has found a complex attractor — not a fixed point, but a bounded orbit in the space of population × diversity × generation.

A diversity spike to **35 species at tick 99k** — just before the simulation ends — suggests the ecosystem remains fundamentally creative. New species are still being born, new body plans still being tested, new neural architectures still being explored. 100,000 ticks wasn't enough to exhaust the evolutionary potential of this simple system.

**Final state at tick 100,000**: 282 organisms, 22 species, generation 128, 4345 distinct events.

---

## Emergent Phenomena Worth Highlighting on the Website

### 1. Natural Population Regulation
The simulation has no hard population cap acting as the primary limiter. Population self-regulates through energy costs (4x baseline), senescence (metabolic cost rises after 60% of max age), and finite food supply. The result: genuine boom-bust cycles with population oscillating 249-310.

### 2. Radiation-Consolidation Cycles
The ecosystem repeatedly cycles between high diversity (30+ species during radiation) and low diversity (13-15 during consolidation). This mirrors real paleontological patterns — the Cambrian Explosion followed by Ordovician consolidation, the Mesozoic radiation followed by end-Cretaceous extinction.

### 3. The Generational Non-Monotonicity
Max generation oscillates rather than climbing steadily. Highly evolved lineages go extinct and are replaced by younger ones. This is a direct challenge to the intuition that "more evolution = better."

### 4. Bootstrapping Intelligence from Noise
The founding population has completely random neural networks. Within 3000 ticks (~6 generations), selection alone produces organisms that can reliably seek and consume food. No reward engineering, no gradient descent, no human-designed fitness function — just survival.

### 5. Meta-Evolution
Mutation rates are themselves evolvable. The simulation doesn't just evolve organisms — it evolves the evolutionary process itself. Organisms that have "tuned" their mutation rate to the right level (enough variation to discover improvements, not so much that it destroys working strategies) leave more descendants.

### 6. The Radiation-Consolidation Oscillator
The most unexpected emergent behavior: the ecosystem cycles between high diversity (30+ species) and low diversity (9-15) on irregular but repeating timescales. Three full cycles complete in 100k ticks. This isn't programmed — it arises from the interaction between mutation (which creates diversity), competition (which reduces it), and resource dynamics (which modulate the competitive landscape).

### 7. Senescence as an Evolutionary Driver
Without aging, the first successful organism could theoretically live forever and dominate the gene pool indefinitely. Senescence (rising metabolic costs after 60% of max age, death at max age) forces generational turnover. This means even the "best" organisms eventually die, making room for their mutated offspring to test new strategies. The result: 128 generations in 100k ticks, compared to ~10 generations in the old cap-limited system.

---

## Complete Data Table

| Tick | Pop | Species | Gen | Events | t/s | Phase |
|------|-----|---------|-----|--------|-----|-------|
| 1k   | 11  | 1       | 2   | 3      | 65  | Struggle |
| 2k   | 15  | 1       | 2   | 6      | 59  | Struggle |
| 3k   | 20  | 3       | 6   | 11     | 49  | Bloom begins |
| 4k   | 75  | 7       | 6   | 36     | 35  | Bloom |
| 5k   | 231 | 32      | 11  | 94     | 20  | Bloom peak |
| 6k   | 283 | 36      | 13  | 194    | 13  | Peak diversity |
| 7k   | 209 | 27      | 15  | 264    | 11  | First crash |
| 10k  | 277 | 21      | 21  | 436    | 9   | Oscillation |
| 15k  | 263 | 21      | 29  | 646    | 8   | Refinement |
| 20k  | 281 | 25      | 36  | 888    | 8   | Refinement |
| 25k  | 293 | 31      | 45  | 1105   | 8   | Radiation 2 ramp |
| 30k  | 261 | 21      | 52  | 1307   | 8   | Consolidation 1 |
| 32k  | 258 | 13      | 53  | 1384   | 8   | Consolidation trough |
| 40k  | 301 | 32      | 63  | 1733   | 7   | Radiation 2 peak |
| 45k  | 301 | 27      | 72  | 1913   | 7   | Gen paradox |
| 48k  | 249 | 20      | 66  | 2048   | 7   | Gen rollback |
| 55k  | 277 | 29      | 78  | 2333   | 7   | Consolidation 2 ramp |
| 60k  | 267 | 15      | 88  | 2553   | 7   | Consolidation 2 |
| 64k  | 268 | 18      | 87  | 2731   | 7   | Plateau |
| 70k  | 254 | 9       | 95  | 2990   | 7   | Diversity nadir |
| 75k  | 285 | 24      | 100 | 3234   | 7   | Gen 100, radiation 3 |
| 80k  | 305 | 18      | 106 | 3434   | 7   | Mature ecosystem |
| 90k  | 292 | 26      | 117 | 3889   | 7   | Late stability |
| 95k  | 255 | 26      | 122 | 4123   | 7   | Late oscillation |
| 99k  | 270 | 35      | 126 | 4299   | 7   | Final radiation |
| 100k | 282 | 22      | 128 | 4345   | 7   | End state |

---

## Re-running simulation with improved clip selection
Pass 1 data is deterministic (same seed). Re-running to capture more narrative clips (improved overlap logic). Expected clips: genesis, first-split, boom, crash, diversity, recovery, body-evolution, mass-extinction, generation-milestone, late-diversity, equilibrium, deep-time.
