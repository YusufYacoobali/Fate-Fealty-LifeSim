# Final narrative balance: editorial audit

31 October 2026 · Baseline `49f5501`

The targeted pass changes 52 outcome passages in 48 existing events, including older peasant, education, faith, crime, family, romance, career and noble content. Their effects are unchanged and were compared with the baseline registry snapshot. Graded hazards and hearing mechanics are separate changes; they are not counted as text-only edits. Nine court/legal outcomes also change with their handlers. Sincere care, bereavement and tense illness passages were retained.

## Existing event revisions

| Event | Choice | Branch |
| --- | --- | --- |
| `life_will_bed` | `saw` | outcome |
| `life_lovers_witness` | `warn` | outcome |
| `life_wrong_serenade` | `encore` | outcome |
| `life_shadow_rent` | `challenge` | outcome |
| `life_evidence_laundry` | `wash` | success |
| `life_missing_constable_boot` | `conceal` | success |
| `life_barrel_false_bottom` | `refuse` | outcome |
| `life_wool_moths` | `conceal` | outcome |
| `life_lawyer_missing_not` | `witness` | outcome |
| `life_poet_treason` | `perform` | failure |
| `life_poet_treason` | `rewrite` | outcome |
| `life_soldier_boot_contract` | `certify` | outcome |
| `life_portrait_kneel` | `praise` | outcome |
| `life_council_chair_sale` | `buy` | outcome |
| `life_ambassador_blank` | `wait` | outcome |
| `life_noble_hunting_altar` | `withdraw` | outcome |
| `life_court_whisper_price` | `buy` | outcome |
| `life_retinue_armour` | `alter` | outcome |
| `life_regency_signature` | `verify` | outcome |
| `life_noble_ransom_guest` | `refuse` | outcome |
| `life_court_map` | `survey` | outcome |
| `life_banner_reverse` | `replace` | outcome |
| `life_banner_reverse` | `provoke` | outcome |
| `life_muster_old_men` | `correct` | outcome |
| `life_rival_empty_toast` | `peace` | outcome |
| `life_rival_empty_toast` | `answer` | outcome |
| `life_saint_two_skulls` | `question` | outcome |
| `life_chapel_key` | `donate` | outcome |
| `life_silent_brother` | `observe` | outcome |
| `life_eye_cure` | `refuse` | outcome |
| `life_fever_work` | `help` | outcome |
| `life_boat_fare` | `board` | success |
| `life_boat_fare` | `unload` | outcome |
| `life_sickroom_witness` | `truth` | outcome |
| `life_bandage_promise` | `remember` | outcome |
| `life_whale_bone_house` | `study` | outcome |
| `life_escaped_pageant` | `blame` | outcome |
| `life_paper_castle` | `admire` | outcome |
| `origin_child_artisan` | `origin_child_artisan_choice_1` | outcome |
| `origin_child_military` | `origin_child_military_choice_1` | outcome |
| `origin_child_noble_extra_11` | `origin_child_noble_extra_11_choice_1` | outcome |
| `origin_child_artisan_extra_3` | `origin_child_artisan_extra_3_choice_1` | outcome |
| `origin_child_royal_extra_13` | `origin_child_royal_extra_13_choice_1` | outcome |
| `peasant_rat_granary` | `peasant_rat_granary_choice_1` | outcome |
| `peasant_lords_tourney` | `peasant_lords_tourney_choice_1` | success |
| `peasant_confession` | `peasant_confession_choice_1` | outcome |
| `young_market_change` | `keep` | outcome |
| `young_military_ration` | `collect` | outcome |
| `single_chain_founder_mark` | `flatter` | outcome |
| `single_story_role_commoner` | `poach_labour` | outcome |
| `single_chain_apprentice_revolt` | `break` | outcome |
| `single_story_role_landed_noble` | `collect` | outcome |

## 25 added scenes

Each scene has two to four complete current-year choices, a living canonical cast and actual consequences. The complete bodies, conditions, effects and forecasts are in [added-events.json](validation/balance/added-events.json). The new-scene branch test checks every choice, including the optional practice duel.

| Event | Premise | Actual response menu |
| --- | --- | --- |
| `comic_accidental_champion` | THE KNIGHT WHO WON BY ACCIDENT | Ask the champion what surrender pays; Invite the previous opponents to demonstrate; Insist on a real practice bout (injury risk) |
| `comic_escaped_letter` | THE LOVE LETTER THAT ESCAPED | Read the original aloud, including the intended name; Claim it was an exercise for a travelling poet; Dedicate the entire disastrous poem to your spouse |
| `comic_ordinary_john` | THE NOBLE’S BRILLIANT DISGUISE | Give Ordinary John an ordinary load to carry; Describe exactly what the households complain about; Remark how handsome the disguised lord must be |
| `comic_wedding_hiccup` | THE WEDDING SPEECH THAT WILL NOT END | Offer the shortest possible blessing; Make the interruption part of a song; Refuse to surrender the rest of your magnificent speech |
| `comic_wrong_balcony` | THE LADDER AT THE WRONG WINDOW | Move the admirer before the bucket tips; Announce the serenade to its actual audience; Take the first verse yourself |
| `comic_borrowed_sleeves` | THE SLEEVES THAT ARRIVED BEFORE YOU | Roll them up and admit the loan; Continue the magnificent gestures; Ask your neighbour to hold the spare fabric |
| `comic_proud_minstral` | THE HERO WITH A RHYME MISSING | Become the hero under a less musical name; Suggest the embarrassing incident yourself; Demand that courage rhyme with your name |
| `comic_cherry_stone` | THE CHAMPION’S VERY SMALL WEAPON | Compete with suitable respect; Judge the distances instead; Kick your stone farther while everyone watches hers |
| `comic_peacock_step` | THE DANCE WITH ONE INSTRUCTION TOO MANY | Offer a simpler village measure; Invent names for the mistakes; Stop before taking anyone else with you |
| `comic_soup_proof` | THE MERCHANT’S FABULOUSLY EMPTY FEAST | Turn it into a shared supper; Praise the remarkable lightness of every course; Leave hungry without exposing the host |
| `comic_fierce_hat` | THE HAT THAT FRIGHTENS ITS OWNER | Catch the hat before the second attack; Bow solemnly to the victorious feather; Offer to tame the creature yourself |
| `comic_hermit_guest` | THE HERMIT WHO ENJOYS VISITORS | Let the lonely host talk; Invite the hermit to your next supper; Ask whether the wilderness requires a waiting room |
| `comic_bravery_pig` | THE NOBLE’S PROOF OF COURAGE | Declare the beast subdued before waking it; Wake the pig and let courage take its course; Show how its owner actually handles it |
| `comic_rival_saddle` | THE RIVAL WHO ARRIVED SIDEWAYS | Hold the reins before the speech falls off; Ask the crowd to admire the new riding style; Offer a private lesson in checking the girth |
| `comic_jealous_mirror` | THE PERSON YOUR SPOUSE KEEPS PRAISING | Admit the resemblance before demanding an apology; Agree that the stranger seems delightful; Insist this proves something suspicious anyway |
| `comic_proposal_pear` | THE PROPOSAL THAT STUCK | Start again after you can speak; Pretend the coughing was an elaborate bow; Retreat with what remains of your dignity |
| `comic_secret_footprints` | THE ROMANCE WITH VERY CLEAR FOOTPRINTS | Fetch the kettle and its owner; Explain that many people own feet; Admit the broken handle before anything else |
| `comic_borrowed_baby` | THE BABY WHO CHOSE THE IMPORTANT GUEST | Offer a wooden toy in exchange; Congratulate the baby on excellent judgement; Take the baby and the responsibility |
| `comic_honourable_coward` | THE HERO HIDING BEHIND THE RIGHT DOOR | Praise the dog’s contribution; Help improve the story; Get the frightened neighbour away from the crowd |
| `comic_lofty_bed` | THE BED MADE FOR A MUCH BETTER PERSON | Build a small step and name nobody in particular; Admire the view from the floor; Suggest returning the legs to ordinary length |
| `comic_feud_tune` | THE FAMILY FEUD LEARNS A TUNE | Supply an embarrassingly affectionate new verse; Sing the insulting verse back (family feud); Ask what the quarrel is actually about |
| `comic_rival_praise` | THE COMPLIMENT YOUR RIVAL BELIEVED | Let the compliment become true; Explain the joke at full volume; Suggest a more modest first attempt |
| `comic_suitor_rehearsal` | THE SUITOR WHO BROUGHT A PROPMAN | Ask the hedge whether it wishes to join the conversation; Teach the suitor to ask a real question; Leave before the hedge proposes marriage |
| `comic_triumphal_return` | THE TRIUMPH THAT REACHED THE WRONG HOUSE | Offer the hero a seat and water; Lead the procession to the actual destination; Accept the applause yourself |
| `comic_false_wake` | THE WAKE THAT STARTED TOO EARLY | Make the introduction before the speech improves; Let your parent hear the affectionate part; Correct the praise as well as the identity |

The subjects broaden social embarrassment, disastrous courtship, vain displays, rivalry and accidental heroism. The noble disguise, peacock dance, enormous sleeves, empty feast and turning saddle get their jokes from people and physical situations. Romance uses actual spouse or mutually eligible adult suitor relationships. Deliberate family provocation can still start a feud, and the dishonest champion can still lead to a real practice fight. Ordinary humiliations cost reputation, trust or small amounts of health rather than routinely killing the character.

## Twelve exact outcome examples

### `life_will_bed` · `saw`

Before: {{sibling}} refuses the proposal and the relationship deteriorates. You keep the goods, together with the saw’s excellent negotiating reputation.

After: {{sibling}} sits on the bed to end the demonstration. You are left holding a saw and the much smaller half of the conversation.

### `life_lovers_witness` · `warn`

Before: You publicly challenge the scheme. Your reputation rises while {{other}} acquires a specific grievance against you.

After: {{other}} spends supper explaining why nobody should believe you. The explanation repeats your warning to everyone who missed it.

### `life_wrong_serenade` · `encore`

Before: {{other}} discovers the error in public. Your reputation for wit rises slightly; your reputation with the singer falls considerably.

After: The street demands the refrain. {{other}} discovers that a love song can carry a name much farther when the person named wishes it would stop.

### `life_poet_treason` · `perform`

Before: The accusation is treated as a deliberate falsehood. You lose your employment and are imprisoned for the performance.

After: The patron stops knowing you halfway through the last verse. You lose the post and gain a cell, where the audience is smaller and the acoustics regrettably good.

### `life_portrait_kneel` · `praise`

Before: The compliment reaches {{other}} a moment late. You gain charm and lose a little trust in the room.

After: {{other}} smiles before understanding the compliment. The smile retreats very carefully, as though nobody has seen where it was standing.

### `life_court_whisper_price` · `buy`

Before: You pay five gold for an unverified rumour. No actual secret is revealed merely because someone priced it as one.

After: For five gold, {{other}} leans close enough to repeat something you heard yesterday. The improved intimacy appears to be the expensive part.

### `life_retinue_armour` · `alter`

Before: You pay for alteration rather than for endurance. {{other}} admires the result without admitting it needed work.

After: The armourer releases the extra inch. {{other}} praises your noble bearing without asking why it has suddenly become possible to sit down.

### `life_rival_empty_toast` · `peace`

Before: You improve trust with {{other}}. The households do not acquire an alliance merely because the drinking is less hostile.

After: {{other}} finally drinks without waiting to see whether you do first. The cups have accomplished a modest amount of work for such small objects.

### `life_saint_two_skulls` · `question`

Before: You expose the weak account without inventing a miracle. Your reputation improves and {{other}} becomes less welcoming to questions.

After: {{other}} moves the smaller skull behind the larger one. The saint has become considerably older in the time it takes to ask one question.

### `life_escaped_pageant` · `blame`

Before: You damage {{other}}’s trust and lose public standing for turning an unpaid wage into a moral failing.

After: The crowd asks why the devil should work for nothing. {{other}} has to defend a play in which the villain has become the most reasonable person present.

### `peasant_lords_tourney` · `peasant_lords_tourney_choice_1`

Before: You unhorse the opponent and earn a net eight gold after the entry fee. The steward objects only to how many people saw the small horse win.

After: The small horse wins. The steward hands over your net eight gold while studying the animal for evidence of a more respectable size.

### `young_market_change` · `keep`

Before: You gain two gold. {{peer}} learns exactly which sort of mistake you prefer not to correct.

After: You pocket the extra coins. {{peer}} asks whether your arithmetic always improves when someone else is paying.

## System presentation

The legal introduction uses the actual offence family, named charges, evidence, witnesses, injured households and known convictions. It does not invent a charge to select a comic variation. The actual verdict and sentence are recorded separately from the short choice outcome. Court incidents vary the official’s behaviour and the office-specific misuse of funds: dogs presented as guards, an ostentatious vestment, a private feast or ornamental horses. An incident ID ties the decision to the correct existing scandal.

The pixel EventModal, fonts, colours, borders, narration animation, navigation and sound/haptic components are unchanged. Court and legal details remain within the existing scrollable passage and warning rows.
