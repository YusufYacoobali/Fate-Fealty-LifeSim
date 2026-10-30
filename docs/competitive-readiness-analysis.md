# Competitive readiness assessment

Reviewed 21 September 2026 against the current working tree, including uncommitted changes. This is a product and implementation assessment, not a measured player review or a prediction of store ranking. The existing 21 September browser export was inspected briefly; a full native playthrough and retention study were not performed.

Verification during this review: TypeScript passed, and the regular Jest suite passed all 491 tests across 54 suites. The separate release-scale soak command was not rerun. No gameplay code was changed.

## Verdict

Fate & Fealty has a substantial pre-release indie foundation. It has enough systems to support a compelling medieval life simulator. Its distance from a leading mobile title is now primarily about distinct experiences, coherent consequences, presentation, and evidence from real players.

A strong release is plausibly months away with focused work. A category-leading result requires repeated player validation and successful distribution; there is no reliable percentage-complete figure or guaranteed launch date for that outcome.

The most promising positioning is: **a medieval village remembers what your family did, across generations**. Persistent people, family memory, secrets, succession, and delayed consequences already support that promise.

## Appropriate comparisons

- BitLife is relevant to the annual choice loop, breadth of life options, and ease of interaction: https://bitlifeapp.com/help/
- Citizen of Rome is relevant to historical identity, family development, and succession: https://store.steampowered.com/app/1063790/Citizen_of_Rome__Dynasty_Ascendant/
- Medieval Dynasty is relevant to the fantasy of survival, work, settlement, and legacy, but its first-person open-world production is a different product category: https://store.steampowered.com/app/1129580/Medieval_Dynasty/

These are reference products, not a claim that they occupy particular current chart positions.

## Existing strengths

The runtime content registry contains 419 event definitions, of which 216 are selectable ambient events, and 29 persistent story templates. Those totals include linked story nodes and should not be described as 419 separate stories.

The RPG layer contains 12 contract templates, three expeditions, three career branches with three chapters each, 12 recipes, and 14 equipment definitions. This is a coherent supporting loop, though its modest number of situations creates a replayability question.

The engineering includes deterministic world RNG, stable character identities, persistent households and relationships, succession, story recovery, serialized saves, migration, and combat phase persistence. These are valuable foundations that should be retained.

The writing has an identifiable voice. Turnips, village gossip, and the goose provide accessible humour; the stronger vocation stories also use concrete medieval dilemmas involving rents, guild standards, ecclesiastical duties, and communal obligations.

## Highest-impact gaps

### 1. Life paths need different definitions of success

`src/data/ranks.ts` defines a shared Peasant → Squire → Knight → Noble → Baron → Monarch ladder. Other work can contribute to progression, but the visible success structure still privileges one social fantasy.

A merchant should pursue a trading concern, apprentices, guild influence, and a commercial legacy. Clergy should have religious responsibilities and offices. An outlaw should have a network, territory, enemies, and a succession problem. Each needs a satisfying ending without requiring the same aristocratic promotion ladder.

### 2. Major story claims must match simulation changes

The clergy ending in `src/content/stories/roles.ts` describes forty years in a parish and the character's burial, while its effects grant stats, reputation, world-condition changes, and a memory. It does not advance those decades or end the life. Other passages use fixed future years, including 1359 and 1390, inside a continuing generational world.

Audit promises in the prose against actual outcomes. Death, relocation, lost businesses, inherited enemies, and decades passing should either be enacted or rewritten to describe what actually happened. This is more valuable than increasing the event count.

### 3. Autonomous people need legible intentions and actions

The game does have autonomous social events and persistent relationships. However, `performNpcAmbition` currently maps its ambition choices largely to changes in gold, experience, food security, health, and public order.

Extend selected ambitions into concrete actions: seeking a particular office, competing for a tenancy, recruiting an ally, collecting an old debt, or interfering with a marriage. Give the player a clear reason rooted in the person's history. Existing systems make this feasible without replacing the engine.

### 4. Feedback and narrative focus need tightening

The main event modal renders choice labels and optional hints but does not render the structured forecast field. Players therefore do not consistently receive the decision support already present in the data.

The inspected saved life also contained numerous NPC promotion and arrival notices, and repeated the same goose-bonding line at ages one and five. This is a limited observation, not a frequency study, but it illustrates the need to prioritise personally relevant developments and track repetition across complete lives.

Show who matters, what changed, why it changed, and what the player can do next. Retain uncertainty where it makes the story better; expose costs and known requirements consistently.

### 5. Commercial prompts and progression balance need validation

The onboarding sequence ends with a paywall. The review logic can ask in the first life at age five. Daily gifts and other return prompts are also implemented. Premium changes the yearly action allowance from 24 to 50.

These are potential friction and balance risks, not demonstrated causes of churn. Test a version that delivers a meaningful choice and consequence before commercial prompts. Evaluate free and paid progression separately; doubling actions changes the amount a player can accomplish before aging.

### 6. Long-term save trust and native release quality remain unfinished

`src/state/persistence.ts` logs save failures without propagating a player-visible failure. Load exceptions return a null state without blocking subsequent saving; the persistence hook can then save the newly created life. A corrupt or temporarily unreadable save therefore needs a safer recovery path.

Add a recoverable previous save, protect unreadable data, and communicate unsuccessful saving. Consider export/import or cloud recovery based on platform scope. The existing implementation audit explicitly leaves physical iOS and Android release-build testing outstanding.

## Recommended sequence

1. **Coherence and trust:** fix narrative/state contradictions, save recovery, choice feedback, and repeated opening material.
2. **Three excellent life paths:** develop contrasting careers with exclusive decisions, relationships, milestones, and endings. Improve existing systems before expanding the feature list.
3. **Make the dynasty visible:** surface inherited relationships, debts, feuds, property, and customs at succession, with later encounters that clearly refer back to them.
4. **External playtesting:** begin with roughly 20–30 unfamiliar players, then a larger beta. Observe first meaningful choice, understanding of consequences, voluntary next-life starts, repetition, and return behaviour.
5. **Release validation:** physical devices, purchase/restore flows, interruption handling, accessibility, and long-session responsiveness.

Suggested planning ranges, assuming a small experienced team, existing assets, and fixed scope: 4–8 weeks for a substantially improved beta, 3–6 months for a strong niche release, and 6–12+ months of continued content and player-led iteration to pursue category-leading quality. These are estimates, not commitments; staffing and player feedback can change them materially.

Do not use automated test counts as proof of enjoyment. Useful playtest exit criteria include players independently understanding an important consequence, remembering a named villager, choosing another life voluntarily, and finding a second vocation meaningfully different from the first.
