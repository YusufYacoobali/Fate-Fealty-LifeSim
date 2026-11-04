# Narrative writing polish audit

4 November 2026 · branch `v5` · baseline `5964644fcab4359441950c39f7bc0083141bb160`.

This pass rewrites 95 existing interactive events and eight annual observations. The registry still contains 545 current events, 357 retired passages and 178 annual messages. The game-wide automated review covers current event prose and annual-message sources; the intensive line edit concentrates on the requested childhood, education and recent narrative packs. This is not a claim that every existing passage was manually rewritten.

## Findings and editorial decisions

The weakest childhood scenes gave infants offices, inspections, jurisdictions and hearings, then explained what their actions symbolised. Education repeatedly used generic accusations and ledger trouble with interchangeable teachers. Other scenes called a newly selected classmate a rival before any rivalry existed, or supplied a bare name without explaining the person’s connection. Revisions replace those patterns with concrete actions, distinct responses and visible consequences: a caught spoon, a duck in a boot, a stolen lesson plan, a cake that must remain uneaten, a wet sleeve and a conspicuously false alibi.

Every relevant introduction, choice label and outcome in each revised scene was considered together. The choice effects, risk branches, event eligibility and identifiers are retained. Eleven weak or misleading titles are also revised, including the spoon, night-inspector and laundry-hearing jokes, and the inaccurate wandering-monk and smith’s-child labels. These are title changes, not event-ID changes. No new event IDs, story chapters, callbacks or deferred narrative schedules are added.

The new report script flags vocabulary and repeated constructions for human review. It does not ban normal words or fail content for containing them. Counts below are occurrences in current event introduction/choice/outcome prose plus the annual-message source snapshot; titles and retired passages are excluded. Functional court/legal language remains appropriate to court/legal scenes.

| Review signal | Before | After |
| --- | ---: | ---: |
| Office / jurisdiction / inspection / hearing / negotiation / administration | 43 | 34 |
| Ledger / seal / petition / account / fee / inspection / clerk | 363 | 334 |
| Announce / declare / suggest / insist / explain / opinion | 166 | 158 |
| Lesson / importance / cooperation / confidence / authority | 71 | 60 |

There are zero six-word phrases shared by three or more distinct passages in either snapshot. Five-word sentence-start groups rise from one to three: the existing professional “Hire a clerk to…” responses, three different requests to carry something, and education “Ask [mentor] to check…” choices. These were reviewed and retained: the latter explicitly identifies the same learning response across mechanically consistent education routes, while the situations and outcomes differ. These signals are not a quality score.

Raw evidence: [before](validation/holding-writing/writing-before.json), [after](validation/holding-writing/writing-after.json), [all 95 complete revisions](validation/holding-writing/writing-revisions.json), [eight annual revisions](validation/holding-writing/annual-revisions.json). The baseline event snapshot was captured before edits; annual mechanics were subsequently reconstructed from the baseline Git objects. The default audit command compares both event mechanics and annual AST fragments with prose removed.

## Existing content deliberately preserved

- The familiar blanket, frightening candle shadow, small acts of mending, safe wooden-sword lesson, saved winter seed and goodbye meal already express affection or vulnerability without explaining a moral. Their good writing remains.
- Illness, grief, child safety, miscarriage and genuine family care retain their serious tone. The absurdity belongs to foolish behaviour or institutions, not the suffering itself.
- Existing legal hearings, genuine fraud, employment and royal petitions need evidence, records and accounts. Their vocabulary is retained where it serves the situation.
- The existing professional director already binds its colleagues and rivals through career records; that path remains. The recent sincere major-life notice bank remains intact.

## Correct actors and truthful introductions

`EventActorRole.reference` now supports canonical education mentors, classmates, childhood peers, professional contacts/rivals and patrons. Casting probes remain pure: they do not spawn replacement teachers or advance RNG. For active courses, the mentor must be the recorded living adult with the track’s actual mentor occupation. The classmate must be the primary recorded current learner on the same track, in the correct age group; minor classmates must be within three years. This is the same primary person targeted by existing education consequences.

All 36 school/adult-course events declare these references. Childhood teacher/peer scenes use them when enrolled; unenrolled informal lessons require an actual adult cleric and an age-matched child. Carers remain real parents or recorded guardians. Generic childhood encounters use a child of an appropriate age. A first-friend encounter leaves its newly met child anonymous until the existing consequence creates that actual child, avoiding an unrelated adult binding.

`describeActorForPlayer()` reads canonical kinship, guardianship, education history, court offices, career records and bilateral relationship flags/values. Classmates are called friends only when an existing friendship and adequate mutual affinity/trust support it. A hostile old friend flag does not produce a warm companion description. Former teachers/classmates remain recognisable. An unknown merchant is described through occupation, without invented distrust or a history of bullying. The goose remains a goose.

Explicit `{{role.intro}}` placeholders give the first meaningful introduction; later tokens in that passage use the name. Existing passages with bare actor tokens can show a compact, deduplicated “INVOLVED PEOPLE” line for at most two relevant people. Annual messages introduce each named actor once per passage. Birth announcements now identify the actual parents. Appositive punctuation, sentence capitals and possessives are handled without changing names or rewriting stored history.

Controlled, rendered examples:

- Spoon scene: “You drop your spoon. Your mother, Emma, picks it up.” The actor ID is `mother`; choosing `again` gives Emma’s existing bond effect, not an arbitrary adult’s.
- Apprentice screenshot: Godwin is the enrolled mentor and Edmund the current classmate. The existing EventModal names both under INVOLVED PEOPLE. [Screenshot](validation/holding-writing/narrative-education_guild_1-390.png).
- Existing school rivalry: a controlled save adds an actual rivalry flag to its real current classmate, and the display says “classmate and rival”. [Screenshot](validation/holding-writing/narrative-young_rival_nickname-390.png). A different scene fixture with a real friendship correctly says friend; the event ID alone does not manufacture a rivalry.
- Tests cover a recorded guardian, real professional contact/rival, stranger occupation, former teacher/classmate, hostile former friendship, actor death/missing data, and the continuing heir’s actual mother. The heir case uses Alys, the heir’s biological mother, rather than the outgoing player’s mother.

### Returning people in natural childhood histories

These are seven separately seeded reducer-driven histories from birth through age 18, settled at age 19, with normal mortality and balanced decisions. The royal run explicitly has the entitlement needed for that origin; these are not physical-device sessions. Every run survives to 19. Full feeds and resolved choices are retained in [childhood-histories.json](validation/holding-writing/childhood-histories.json). The review followed the yearly personal feed, selected introductions, choices and results; routine upkeep/reputation lines remain in the raw evidence.

| History | Persistent person | Returning ages | Accurate relationship |
| --- | --- | --- | --- |
| Peasant, seed 843010 | `mother`, Edith | 2, 3, 18 | Mother |
| Artisan, seed 843011 | `father`, Osric | 1, 2, 7 | Father |
| Merchant, seed 843012 | `kin_69`, Aldric | 5, 7, 15 | Another child from Swineford; no automatic friendship |
| Church, seed 843013 | `mother`, Isolde | 1, 2, 7, 19 | Mother; age-19 encounter is recorded separately from the 0–18 feed |
| Military, seed 843014 | `father`, Edmund | 2, 4, 18 | Father; a different child also named Edmund has ID `kin_55` |
| Noble, seed 843015 | `mother`, Hilda | 1, 4, 10 | Mother |
| Royal, seed 843016 | `kin_4`, Bjorn | 5, 6, 8 | Brother |

The histories exposed a lowercase parent introduction after quoted dialogue and the royal “King your father” collision; those were corrected and replayed. They also show that a familiar returning person need not become a formal friend. Formal-course identity/effects are additionally covered by all 36 course routes and the controlled mentor/classmate tests, rather than inferred from unenrolled childhood runs.

## Save recovery and mechanical continuity

No content ID, save schema or storage key changes. Pending-event casts are checked at load. Valid participants are retained; invalid substitute roles use deterministic candidates without RNG. If a required deceased/missing participant cannot be retained under the event’s clear policy, the pending scene is withdrawn with the existing recovery notice. Recovery does not advance a year, spend an action, grant a reward or erase family history.

The existing legacy adult/childhood-lesson recovery now completes the chosen adult peer’s reciprocal course record. It prefers an already recorded compatible adult, then a real same-course learner, then an eligible household/unenrolled adult. Historical child classmates remain recorded. It does not steal a learner from a different active track. Tests verify idempotence, RNG preservation, actual pending identity and current/history records; the browser reopens an affected legacy save and verifies the same properties.

The mechanical snapshot comparison checks every event, choice, requirement, forecast, effect, cooldown and other metadata, excluding prose/title and the deliberately corrected actor-role definitions. It also checks annual-message mechanics. Five old text-derived repetition keys are pinned in `editorialContinuity.ts`, so a prose rewrite cannot accidentally change their pacing: `origin_child_peasant`, `single_chain_siblings_share`, `education_household_0`, `education_noble_1`, `education_adult_household_1`.

## Rewritten files and complete event ID list

| File | Rewritten events |
| --- | ---: |
| [src/content/childhoodDepthEvents.ts](../src/content/childhoodDepthEvents.ts) | 25 |
| [src/content/circumstanceEvents.ts](../src/content/circumstanceEvents.ts) | 5 |
| [src/content/singleYearStories.ts](../src/content/singleYearStories.ts) | 2 |
| [src/content/singleYearVillage.ts](../src/content/singleYearVillage.ts) | 3 |
| [src/content/narrativeFamilyEvents.ts](../src/content/narrativeFamilyEvents.ts) | 3 |
| [src/content/educationEvents.ts](../src/content/educationEvents.ts) | 53 |
| [src/content/childEvents.ts](../src/content/childEvents.ts) | 3 |
| [src/content/companionEvents.ts](../src/content/companionEvents.ts) | 1 |

### `childhoodDepthEvents.ts`

`young_spoon_office`, `young_sleep_inspection`, `young_soup_fort`, `young_boot_harbour`, `young_washing_judge`, `young_small_mending`, `young_goat_headmaster`, `young_ink_finger`, `young_stool_court`, `young_river_boat`, `young_saint_cake`, `young_lost_button`, `young_market_math`, `young_family_whisper`, `young_mud_toll`, `young_borrowed_bell`, `young_pocket_inventory`, `young_holy_gloss`, `young_rival_nickname`, `young_family_tally`, `young_flood_slate`, `young_love_note`, `young_first_wage`, `young_forbidden_chapter`, `young_borrowed_reference`.

### `circumstanceEvents.ts`

`circumstance_rival_higher_price`, `circumstance_wet_ancestor`, `circumstance_child_collector`, `circumstance_roderick_words`, `circumstance_tonic_guarantee`.

### `singleYearStories.ts`

`single_story_rivals_rise`, `single_story_disputed_inheritance`.

### `singleYearVillage.ts`

`single_chain_siblings_share`, `single_chain_masterpiece`, `single_chain_returned_driver`.

### `narrativeFamilyEvents.ts`

`life_child_bailiff`, `life_family_ladder`, `life_heir_grammar`.

### `educationEvents.ts`

`origin_child_peasant`, `origin_child_artisan`, `origin_child_merchant`, `origin_child_church`, `origin_child_military`, `origin_child_noble`, `origin_child_royal`, `origin_child_peasant_extra_0`, `origin_child_peasant_extra_1`, `origin_child_artisan_extra_2`, `origin_child_artisan_extra_3`, `origin_child_merchant_extra_4`, `origin_child_church_extra_6`, `origin_child_church_extra_7`, `origin_child_military_extra_9`, `origin_child_noble_extra_10`, `origin_child_royal_extra_12`, `education_household_0`, `education_household_1`, `education_household_2`, `education_household_3`, `education_parish_0`, `education_parish_1`, `education_parish_2`, `education_parish_3`, `education_guild_0`, `education_guild_1`, `education_guild_2`, `education_guild_3`, `education_cathedral_0`, `education_cathedral_1`, `education_cathedral_2`, `education_cathedral_3`, `education_martial_0`, `education_martial_1`, `education_martial_2`, `education_martial_3`, `education_noble_0`, `education_noble_1`, `education_noble_2`, `education_noble_3`, `education_adult_household_0`, `education_adult_household_1`, `education_adult_parish_0`, `education_adult_parish_1`, `education_adult_guild_0`, `education_adult_guild_1`, `education_adult_cathedral_0`, `education_adult_cathedral_1`, `education_adult_martial_0`, `education_adult_martial_1`, `education_adult_noble_0`, `education_adult_noble_1`.

### `childEvents.ts`

`child_first_lesson`, `child_chores`, `child_bully`.

### `companionEvents.ts`

`child_first_friend`.

### Annual observations and birth introduction

`child_ink_finger`, `child_shepherd`, `child_snow_lord`, `fortune_merchant`, `mishap_trough`, `nursery_measuring`, `nursery_spoon`, `plague_cough`.

The eight annual observations are in `annualMessages.ts` (three) and `annualContextMessages.ts` (five). A royal introduction in `data/birthOrigins.ts` moves “the King” after the father placeholder to accommodate the factual parent introduction. This changes rendered prose only.

## Eighteen before/after examples

Each example shows the introduction plus one matching choice and all its outcome branches. Raw template tokens are intentional here; the rendered audit and screenshots demonstrate their canonical NPC substitutions. Other choices and outcomes were also reviewed and are available in the complete revision JSON. Choice IDs and consequences are unchanged.

### 1. `young_spoon_office` — choice `again`

**Before introduction:** You discover that dropping a spoon makes {{carer}} fetch it. The office has no salary, but excellent powers.

**Before choice:** Drop it a second time

**Before outcome:** {{carer}} retrieves it, then moves the bowl beyond your jurisdiction.

**After introduction:** You drop your spoon. {{carer.intro}} picks it up. By the fifth time, the smile has gone and the spoon is being held very firmly.

**After choice:** Drop it once more

**After outcome:** {{carer}} catches the spoon before it lands. You squeal with delight. This was meant to discourage you.

### 2. `young_sleep_inspection` — choice `call`

**Before introduction:** {{carer}} has finally sat down. You open your eyes to check that the household remains properly staffed.

**Before choice:** Call for the night inspection

**Before outcome:** {{carer}} arrives with one shoe on the wrong foot. The inspection passes; the inspector remains unsatisfied.

**After introduction:** {{carer.intro}} has just fallen asleep in the chair beside you. One eye is still open. You would like the other one open too.

**After choice:** Shout until both eyes open

**After outcome:** {{carer}} lurches upright and bumps the table. You laugh so hard that a tired laugh comes back.

### 3. `young_washing_judge` — choice `object`

**Before introduction:** {{carer}} proposes washing your face. You have not been consulted about the status of the dirt.

**Before choice:** Object with your whole body

**Before outcome:** You preserve one muddy cheek through extraordinary effort. {{carer}} wins the other by negotiation.

**After introduction:** {{carer.intro}} approaches with a wet cloth. You clamp both hands over the patch of mud you have been saving on your cheek.

**After choice:** Wriggle like an eel

**After outcome:** {{carer}} catches one cheek, then the other. You get muddy fingerprints on the clean one and earn a helpless laugh.

### 4. `young_boot_harbour` — choice `retrieve`

**Before introduction:** You put a wooden toy inside {{carer}}’s boot. Departure now depends on a small creature accepting terms.

**Before choice:** Rescue the toy proudly

**Before outcome:** {{carer}} thanks you for solving a problem in which you have shown unusually complete expertise.

**After introduction:** A wooden duck fits neatly into {{carer.intro}}’s boot. You push it right down to the toe and wait to see what happens.

**After choice:** Fetch your duck when the hopping starts

**After outcome:** {{carer}} holds out the boot. You fish out the duck and get a grateful squeeze, though the hopping has stopped.

### 5. `young_goat_headmaster` — choice `teacher`

**Before introduction:** The children elect a goat after it eats the attendance register. {{teacher}} declares the election unlawful. {{peer}} says the goat already has a carrot and three votes of confidence.

**Before choice:** Support the teacher’s authority

**Before outcome:** {{teacher}} removes the carrot from the meeting. The new headmaster follows its principal source of legitimacy out of the yard.

**After introduction:** A goat eats the lesson sheet. {{peer}} puts a cap on it and seats it in {{teacher.intro}}’s chair. The goat immediately eats the cap.

**After choice:** Help {{teacher}} get the goat outside

**After outcome:** {{teacher}} holds out a carrot. The goat abandons its chair, while {{peer}} finds you a clean lesson sheet.

### 6. `young_ink_finger` — choice `admit`

**Before introduction:** {{teacher}} asks who touched the ink. {{peer}} recommends denying it before you remember which hand is black.

**Before choice:** Raise the guilty hand

**Before outcome:** {{teacher}} gives you a cleaning cloth. The lesson begins with a remarkably well-supported confession.

**After introduction:** {{teacher.intro}} finds an open inkpot. {{peer}} looks at your blackened hand, then at your face. “Put it in your pocket,” comes the whispered advice.

**After choice:** Hold up the inky hand

**After outcome:** {{teacher}} hands you a rag. You clean the spill together, and next time the inkpot is left within your reach.

### 7. `young_saint_cake` — choice `guard`

**Before introduction:** {{peer}} finds a cake set aside for the parish celebration. The saint has not yet arrived to object.

**Before choice:** Guard it until the feast

**Before outcome:** {{peer}} helps guard the cake. Both guards are paid in slices after the duty is over.

**After introduction:** {{peer.intro}} lifts the cloth over a cake saved for the parish feast. There is a great deal of cake and nobody in the room but you.

**After choice:** Cover it and wait for the feast

**After outcome:** You both wait. The first slices reach you warm, and {{peer}} nudges yours across with the larger corner.

### 8. `education_household_1` — choice `repair`

**Before introduction:** A rat has drowned in the pot of seed grain. Your cousin proposes burying the evidence in tomorrow’s bread.

**Before choice:** Sort the seed together

**Before outcome:** You save enough clean seed for a strip of field and share the credit.

**After introduction:** There is a drowned rat in the seed pot. {{classmate}} looks from the rat to the bread dough and says, “We need not mention it.”

**After choice:** Help {{classmate}} sort out clean seed

**After outcome:** You spread the grain to dry. {{mentor}} checks it with you, and {{classmate}} starts counting what can still be sown.

### 9. `education_parish_0` — choice `repair`

**Before introduction:** Your teacher asks you to copy the relic inventory. Saint Aelfric now possesses three elbows and no head.

**Before choice:** Check the older inventory

**Before outcome:** You restore one elbow to its rightful saint. Your teacher praises your care.

**After introduction:** {{mentor}} sets you to copy the relic list. You give Saint Aelfric three elbows. {{classmate}} peers over and asks whether he used all of them for praying.

**After choice:** Check the older list together

**After outcome:** {{classmate}} finds the missing saint. {{mentor}} watches you move one elbow to its proper owner and praises the correction.

### 10. `education_guild_3` — choice `repair`

**Before introduction:** A spark lands on your measured drawing. Your rival’s drawing is excellent, and unattended.

**Before choice:** Rebuild the measurements

**Before outcome:** Your teacher tests every line. The work is slow and yours.

**After introduction:** A spark burns through your measured drawing. {{classmate}}’s neat copy lies unattended beside it. {{mentor}} will want both pieces of work before supper.

**After choice:** Ask {{classmate}} to help rebuild the measurements

**After outcome:** {{classmate}} shares the figures while you redraw the lost lines. {{mentor}} checks the finished work and credits you both.

### 11. `education_cathedral_1` — choice `repair`

**Before introduction:** Your mentor’s prized Greek quotation is a laundry account in a merchant’s cipher.

**Before choice:** Translate it privately

**Before outcome:** The master changes his lecture. You receive access to a better manuscript.

**After introduction:** {{mentor}} proudly reads a Greek quotation. {{classmate}} turns it the right way up: it is a merchant’s laundry list, with a great deal to say about stained shirts.

**After choice:** Translate it quietly before the lecture

**After outcome:** You and {{classmate}} work through the list. {{mentor}} changes the quotation and gives you a better passage to study.

### 12. `education_martial_0` — choice `repair`

**Before introduction:** Your first watch is outside the lord’s privy. A visitor insists the password is a matter of terrible urgency.

**Before choice:** Fetch the watch sergeant

**Before outcome:** The visitor is admitted under escort. The sergeant trusts your judgement.

**After introduction:** Your watch is outside the lord’s privy. {{classmate}} has a desperate visitor by the elbow, and {{mentor}} has told you not to let anyone through.

**After choice:** Hear the visitor before enforcing the order

**After outcome:** You and {{classmate}} find a sensible way to help without abandoning the watch. {{mentor}} hears a clear account rather than a wet complaint.

### 13. `education_noble_2` — choice `repair`

**Before introduction:** An envoy’s chair is an inch lower than yours. His secretary calls it an insult to the whole coast.

**Before choice:** Offer equal stools

**Before outcome:** Everyone suffers equally. Your tutor calls this diplomacy.

**After introduction:** An envoy’s chair is an inch lower than yours. {{classmate}} notices first; {{mentor}} arrives just as the envoy’s secretary demands a ruler.

**After choice:** Change the seating without singling anyone out

**After outcome:** {{classmate}} helps swap the chairs. {{mentor}} watches the envoy sit down without having to defend anyone’s knees.

### 14. `education_adult_parish_1` — choice `repair`

**Before introduction:** {{classmate}} needs a letter to a relative who has left for work. The parish desk is finally quiet.

**Before choice:** Help compose an honest letter

**Before outcome:** Your colleague entrusts you with the reply.

**After introduction:** {{classmate}} needs a letter for a relative working away from home. The first attempt contains a great deal of weather and none of what they want to say. {{mentor}} leaves you a quiet corner.

**After choice:** Help write what they actually mean

**After outcome:** {{classmate}} reads it back slowly and folds it with care. {{mentor}} checks the difficult words without prying into the rest.

### 15. `origin_child_military` — choice `origin_child_military_choice_1`

**Before introduction:** The garrison refuses to feed a soldier’s child until the child can carry a spear. The spear is taller than the clerk.

**Before choice:** Ask {{contact}} to cite the service oath

**Before outcome:** Your household receives its bread. The stores clerk hands over each loaf as though personally surrendering a small fort.

**After introduction:** The garrison will not feed a soldier’s child until the child can carry a spear. {{guardian.intro}} brings you forward. The spear is taller than the man refusing the bread.

**After choice:** Ask {{contact}} to cite the service oath

**After outcome:** {{contact}} helps establish the household’s right to rations. {{guardian}} takes the bread while the clerk tries not to look at the spear.

### 16. `single_story_rivals_rise` — choice `race`

**Before introduction:** {{other}} has challenged you before witnesses, drawn the finish line and rehearsed a victory bow. The race has not yet acquired a second willing participant.

**Before choice:** Accept the challenge

**Before success:** You finish first. {{other}} delivers the rehearsed bow to entirely the wrong audience.

**Before failure:** You finish behind {{other}}, but well ahead of the sack you were supposed to carry. The crowd generously counts this as two competitions.

**After introduction:** {{other.intro}} draws a finish line and practises a victory bow. Then they invite you to race. Several people have stopped to see whether the bow was premature.

**After choice:** Race for it

**After success:** You finish first. {{other}} bows automatically, sees you beside them, and wishes they had not practised so thoroughly.

**After failure:** {{other}} beats you to the line. You arrive breathless with a sore leg, and the grin waiting for you is larger than the crowd.

### 17. `life_family_ladder` — choice `retrieve`

**Before introduction:** {{other}} has borrowed your household’s ladder so often that visitors now ask directions to it rather than to you.

**Before choice:** Retrieve it and help finish the repair

**Before outcome:** You bring the ladder home after helping with the roof. {{other}} owes you a kindness, and the household can reach its own rafters again.

**After introduction:** {{other.intro}} has your ladder again. Their roof is mended. Your ladder is now holding up a washing line.

**After choice:** Help finish up and carry it home

**After outcome:** You climb up to free the line, then carry the ladder home together. Your shoulders ache, but you can finally repair your own rafters.

### 18. `circumstance_roderick_words` — choice `hear`

**Before introduction:** Roderick arrives to state a grievance in words. {{other}} has left the glove at home and regards this as a considerable concession.

**Before choice:** Hear him without an audience

**Before outcome:** Roderick finishes without applause or a weapon. The grievance shrinks when nobody is performing it.

**After introduction:** {{other.intro}} arrives to tell you exactly what he thinks of you. He says he left his duelling glove at home and shows you both empty hands.

**After choice:** Hear Roderick without an audience

**After outcome:** Roderick gets through the complaint without reaching for a weapon. Once you answer quietly, he finds rather less to shout about.

## Verification

- Full Jest: 100 suites / 1,009 tests passed. Final royal-birth copy correction additionally passed the actor/birth-origin regression suites.
- TypeScript: passed.
- Mechanical/phrase audit: 95 rewrites, zero event/choice/effect/condition/cooldown changes; eight annual revisions with identical annual mechanics.
- Actor audit: 545 current events statically validated; 95 rendered scenes and 237 choices/branches, zero unknown actor placeholders or validation findings.
- Seven natural childhood histories; all reached 19 alive. All 36 education routes tested with their real participants and actual progress effects.
- Ten narrative browser checks: five scenes at 280px with 1.35 CSS text scaling and 390px. Includes actual mentor/classmate, a real rivalry, optional context labels, baby/carer and legacy adult recovery. No JavaScript errors or page-width overflow.
- See [Holding report](holding-redesign-report.md) for the deterministic full-life, dynasty, save/reload, platform export and release-gate results.
