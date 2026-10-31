# Fate & Fealty: single-year narrative conversion audit

31 October 2026 · Base `v5` at `d5506a0` · Content version 9 · Save schema 7

Every row identifies a separate rewritten conflict and its actual response menu. All choices in the 114 conversions and 48 new childhood scenes are exercised in `singleYearNarrative.test.ts`, including both chance branches. The full premises, outcomes, eligibility, effects and forecasts are in [conversion-catalogue.json](validation/single-year/conversion-catalogue.json).

The source snapshot is [before-content.json](validation/single-year/before-content.json). Old IDs remain read-only lookup entries for an already-visible saved passage; they cannot enter the lottery or resume an authored schedule.

## 29 persistent templates

| Original source | Complete encounter | Decisions and trade-offs |
| --- | --- | --- |
| `rivals_rise` | THE VICTORY BOW BEFORE THE RACE | Accept the challenge; Make the rules public before agreeing; Carry the load together instead |
| `lean_harvest` | THE BUSHEL WITH A SECOND PRICE | Fund a shared grain reserve (12g); Sell your stored grain at the new price; Check the merchant’s measure in public |
| `disputed_inheritance` | THE WILL WITH ROOM FOR ANOTHER SIGNATURE | Contest the claim before witnesses (9g); Negotiate a division now; Fill the blank yourself; Surrender the disputed goods |
| `war_swineford` | THE CART THAT HAS ALREADY ENLISTED | Pay for supplies in place of bodies (18g); Help make the muster fair; List a dead man in your household’s place |
| `ambitious_child` | THE FUTURE THAT DOES NOT FIT THE HOUSE | Fund a first practical lesson (10g); Help test the idea before promising money; Order the child to take your place instead |
| `role_commoner` | THE LORD’S THREE DRIEST DAYS | Arrange a shared labour rota; Buy out your service (8g); Take a neighbour’s paid work instead |
| `role_artisan_merchant` | THE PRICE CHANGED WHILE YOU WERE WORKING | Correct the price and publish the weights; Keep the old price and shorten the measure; Sell honestly at a loss to keep the customers |
| `role_clergy` | THE CHILD BEFORE THE PEDIGREE | Attend to the child before the argument; Pay for the midwife’s attendance (7g); Insist the household settle the paperwork first |
| `role_martial` | SIX ARCHERS SHORT OF AN ARMY | Train the volunteers and report their limits; Supply six magnificent names on paper; Pay a veteran to run the drill (8g) |
| `role_landed_noble` | THE CHARGE NOBODY HAS READ | Read every charge and hear the answers; Collect the proposed fines without a hearing; Hire an independent clerk (10g) |
| `role_monarch` | THE ELEVENTH ITEM IS THE COINAGE | Hear the coinage accounts first; Sell exemptions before discussing the standard; Fund a public assay (15 treasury) |
| `role_outlaw` | THE BAND’S LIST OF THINGS NOT TO STEAL | Keep the rule and divide your own supplies; Limit the plan to a wealthy target; Sell the band’s intended route |
| `friendship_test` | THE DEBT DISCUSSED IN A DOORWAY | Lend from your own purse instead (8g); Accept the debt openly; Refuse kindly and keep the friendship separate |
| `rival_reckoning` | HALF A FURROW, ALL OF YOUR ENEMITY | Pay for a witnessed survey (7g); Trade the strip for an end to the personal quarrel; Move the fence at night |
| `marriage_strain` | THE SILENCE HAS JOINED YOU FOR SUPPER | Agree new terms and hear the whole list; Agree to end the marriage; Insist the matter is already settled |
| `blood_between_siblings` | SEVEN NIGHTS YOU DID NOT SIT UP | Acknowledge the burden without an excuse; Contribute to the costs (10g); Describe the care as a duty owed anyway |
| `parent_and_child` | THE LIFE YOU HAD ALREADY ARRANGED | Hear the alternative before signing; Pay for a short trial in the chosen work (8g); Insist on your plan |
| `hidden_affair` | THREE SMALL THINGS AND A VERY LARGE QUESTION | Ask plainly without claiming proof; Pay for private inquiries (9g); End a marriage you no longer trust |
| `pestilence_year` | THE ROAD BY THE FEVER HOUSES | Fund separate supplies and a temporary cordon (12g); Sell a reassuring account to the traders; Organise bearers and food without inventing a cure |
| `charter_swineford` | THE MARKET THAT FORGOT TO BE LAWFUL | Fund a proper petition (18g); Produce an impressively aged charter; Negotiate shared market rights |
| `empty_throne` | TWO GREAT SEALS, ONE TAX DEMAND | Publish both orders and refuse duplicate payment; Sell your support to the richer messenger; Pay to verify the warrants (6g) |
| `the_accused` | THE ACCUSATION ALREADY IN INK | Question the witnesses openly; Pay to settle the civil claim (8g); Commission an equally certain alibi |
| `healers_burden` | THIRTEEN DOORS, FOUR PAIRS OF HANDS | Prioritise need and publish the list; Fund extra help (12g); Give priority to those who can pay you |
| `ashes_household` | THE HOUSEHOLD THAT FITS IN THE YARD | Borrow for the repair; Patch a smaller room together; Pay for the repair outright (24g) |
| `divided_parish` | THE NAVE HAS ACQUIRED A BORDER | Make both sides state the practical complaint; Sell a useful account to the richer side; Fund parish food instead of another sermon (8g) |
| `guild_election` | THE CELLAR WITH A CANDIDATE ATTACHED | Demand a written, witnessed vote; Sell your vote and keep the cup; Put forward an honest working candidate |
| `royal_bastard` | THE PRIORY’S NAMELESS PAYMENT | Pay the child’s immediate board without claiming a pedigree (12g); Publish the account as evidence, not proof of parentage; Accept payment to hide the account |
| `relic_hunter` | FIFTEEN MISSING HOLY OBJECTS | Record where the objects actually are; Pay to return the disputed object (10g); Sell the object to a discreet collector |
| `secret_brotherhood` | THE FRATERNITY’S LOCKED POOR BOX | Pay this year’s dues after reading the accounts (8g); Challenge the missing relief money publicly; Take a share for keeping quiet |

## 21 ambient chains

| Original source | Complete encounter | Decisions and trade-offs |
| --- | --- | --- |
| `chain:broken_betrothal` | THE MATCH WITH FOUR COPIES AND NO AGREEMENT | Count the goods and renegotiate; Withdraw the promise openly; Add your own imaginary livestock |
| `chain:foster_oath` | THE CHILD AT THE THRESHOLD | Register a placement and set aside food; Fund the child’s immediate care (8g); Admit that your household cannot provide care |
| `chain:siblings_share` | THE BED THAT HAS BECOME A PEDIGREE | Agree a witnessed division; Give the bed and keep the relationship; Produce a more convenient family inventory |
| `chain:millers_fever` | THE MILLRACE’S BAD AIR | Fund rest and clean supplies (9g); Take the dangerous shift yourself; Sell a reassuring report to keep the mill open |
| `chain:wounded_midwife` | THE MIDWIFE’S INCONVENIENT HAND | Pay for skilled assistance (8g); Ask the midwife to choose the safest arrangement; Insist on the name you were promised |
| `chain:bellmakers_sight` | THE BELL FOUNDER CANNOT READ HIS MARK | Read the marks without taking the credit; Take the credit for the whole casting; Pay for an assistant named on the commission (10g) |
| `chain:stolen_chalice` | THE CHALICE AND THE VERY ORDINARY METAL | Have the metal tested before accusing anyone (5g); Place the evidence before the proper court; Sell your silence about the witness’s new hens |
| `chain:forest_gang` | THE SNARE HAS CAUGHT A FORESTER | Cut the snare and give an honest account; Take the catch and leave the evidence; Pay for help and surrender the poaching gear (8g) |
| `chain:false_witness` | THE ALIBI WITH TOO MUCH DETAIL | Give the part you actually know; Swear to the whole polished account; Refuse to give evidence you cannot support |
| `chain:masterpiece` | THE COPE-CHEST HAS ACQUIRED A DEADLINE | Use the apprentice’s joint and name the work honestly; Use cheap timber and conceal the split; Return the advance rather than the promise (8g) |
| `chain:caravan_partnership` | FOUR CARTS, ONE QUESTIONABLE GUARANTEE | Pay for a clear shared contract (9g); Borrow for the unguarded shipment (30g debt); Keep your goods and refuse the guarantee |
| `chain:apprentice_revolt` | THE WORKDAY THAT RAN INTO TOMORROW | Uphold the hours and take the smaller commission; Take the cheap work and break the agreed hours; Pay for food while the dispute is settled (8g) |
| `chain:tithe_dispute` | THE BUSHEL WITH LESS INSIDE THAN OUT | Compare the measure before witnesses; Pay to exempt your household alone (9g); Pay for an independent standard (6g) |
| `chain:crown_levy` | THE LOTS ARE DRAWN BEFORE THE DRAWING | Demand a public drawing with exemptions read aloud; Pay for a lawful household exemption (14g); Remove your household’s name secretly |
| `chain:guild_seal` | TWO SEALS, NO CONFIDENCE | Compare the charter and lodge one public standard; Pay for a proper verification (12g); Sell a third impression |
| `chain:winter_roof` | THE THATCH HAS LEARNED THE WEATHER | Pay for sound timber (14g); Patch it with your own labour; Move the bowls and leave the repair |
| `chain:granary_rats` | THE RATS HAVE ACQUIRED A KEY | Count the sacks and change the lock (5g); Record an honest food allowance instead; Sell your silence about the missing sacks |
| `chain:neighbours_fire` | THE FIRE HAS NO RESPECT FOR BOUNDARIES | Help the people before the property; Protect your household’s roof first; Pay for a bucket crew (10g) |
| `chain:strangers_map` | THE TREASURE MAP ENDS UNDER A BED | Ask permission and share any proceeds; Pay to inspect the survey (4g); Dig without permission |
| `chain:saints_bone` | THE BONE BOTH CHURCHES REMEMBER | Require provenance before public claims; Sell the shrine’s display rights to both churches; Fund a quiet public inventory (8g) |
| `chain:prophetic_child` | THE PROPHECY THAT HAS MET THE RENT | Stop the paying audience and hear the child quietly; Take a share of the prophecy takings; Pay for quiet care and food (8g) |

## 16 distinct later conflicts salvaged

These are optional independent situations. Their eligibility reads current circumstances, never progress in the former chain. Necessary context is established in the current scene.

| Source | Independent later conflict |
| --- | --- |
| `chain:siblings_share` | THE CHRISTENING SPOON IN THE WRONG SLEEVE |
| `chain:foster_oath` | THE CARE AGREEMENT EVERYONE HAS HEARD ABOUT |
| `chain:wounded_midwife` | THE MIDWIFE ASKS FOR A HEARTH |
| `chain:bellmakers_sight` | WHOSE NAME FITS ROUND THE BELL |
| `chain:forest_gang` | THE AMNESTY WITH A PRICE BESIDE EACH NAME |
| `chain:false_witness` | THE FIRST DRAFT IS STILL WET |
| `chain:masterpiece` | THE OAK HAS ARRIVED IN TWO OPINIONS |
| `chain:caravan_partnership` | THE DRIVER RETURNS WITHOUT THE CART |
| `chain:apprentice_revolt` | THE CONTRACT UNDER THE SUPPER BOWL |
| `chain:tithe_dispute` | THE ACCOUNT WITH TWO BURIALS FOR ONE MAN |
| `chain:crown_levy` | THE WITNESS HAS THREE NEW HENS |
| `chain:guild_seal` | THE CHARTER IN THE FAMILY CHEST |
| `chain:winter_roof` | THE LORD HAS BORROWED YOUR REPAIR TIMBER |
| `chain:granary_rats` | THE WALL THAT HID THE DAMP GRAIN |
| `chain:neighbours_fire` | THE BOX THE FIRE DID NOT OPEN |
| `chain:saints_bone` | THE SCHOLAR’S VERY CAREFUL SILENCE |

## 48 callbacks replaced by current circumstances

| Original source | Complete encounter | Decisions and trade-offs |
| --- | --- | --- |
| `callback:echo_cooling_stone` | THE PRICE OF THE FIRE | Decline the heating fee; Show the customers how it is warmed |
| `callback:echo_rival_higher_price` | SILENCE AT THE MARKET RATE | Refuse the bargain; Describe the demand publicly |
| `callback:echo_wet_ancestor` | THE ANCESTOR WITH TWO EXCLUSIVE FAMILIES | Withdraw the doubtful claim; Defend the descent under oath |
| `callback:echo_millers_measure` | THE MEASURE AT THE HEARING | Describe only what you can inspect; Keep out of the dispute |
| `callback:echo_feather_seller` | QUILLS WITH AN HONEST PARENTAGE | Welcome the honest description; Mock the expensive claims |
| `callback:echo_betrayed_plot` | THE INFORMANT’S WELL-KEPT COPY | Refuse another secret bargain; Buy one copy, without trusting it is unique (12g) |
| `callback:echo_saint_donations` | THE MIRACLE’S EXPENSE ACCOUNT | Fund food for distribution (8g); Argue that collecting is enough |
| `callback:echo_child_collector` | THE LUNCH COLLECTOR HAS LOST THE BADGE | Agree to stop the collection; Demand lunch as repayment |
| `callback:echo_mother_treatment` | THE CARE THAT IS NOT AN INVOICE | Say care is not a debt between you; Explain every sacrifice you have made |
| `callback:echo_roderick_words` | THE GRIEVANCE WITHOUT THE GLOVE | Hear him without an audience; Give your best answer publicly |
| `callback:echo_alive_witness` | THE LIVING PERSON ON THE DEAD LIST | Explain without inventing an exemption; Help with the assessment (6g) |
| `callback:echo_false_death_fee` | THE FEE FOR NOT HAVING DIED | Reject the storage demand; Read the demand publicly |
| `callback:echo_salt_weight` | THE HOUSEHOLD’S EMERGENCY RESERVE | Add to the reserve (12g); Ask to count it together |
| `callback:echo_sibling_guarantee` | THE SIGNATURE YOU DID NOT WRITE | Refuse the false guarantee publicly; Help without endorsing the forgery (8g) |
| `callback:echo_child_silence` | THE CHILD WHO SAW THE HIDDEN GOODS | Answer honestly; Threaten the child into silence |
| `callback:echo_soap_seal` | THE FAMILY SEAL SMELLS OF SOAP | Correct the false impression; Use the impression on another paper |
| `callback:echo_inventory_division` | TWO PEOPLE, ONE HOUSEHOLD LIST | Divide the goods together; Claim every advantage on the list |
| `callback:echo_jealous_joke` | THE JOKE YOUR SPOUSE DID NOT ENJOY | Apologise without repeating the punchline; Explain that everybody else laughed |
| `callback:echo_wedding_reserve` | THE UNCOUNTED WEDDING EXPENSE | Help settle the bill (10g); Refuse to finance the display |
| `callback:echo_wrong_serenade` | THE SINGER AND THE NUMBERED WINDOWS | Correct the mistake quietly; Tell the street what happened |
| `callback:echo_shadow_household` | THE RENT ON YOUR OWN SHADE | Offer a witnessed settlement (11g); Keep the quarrel public |
| `callback:echo_blank_pardon` | THE PARDON HAS LEFT ROOM FOR EVERYONE | Refuse the doubtful pardon; Show the blank to the clerk |
| `callback:echo_juror_pie` | THE PIE COMES WITH INSTRUCTIONS | Refuse to carry the suggestion; Correct the approach openly (10g) |
| `callback:echo_brand_paid` | THE PRICE OFFERED FOR YOUR SKIN | Refuse and expose the bargain; Listen without accepting the injury |
| `callback:echo_coffin_toll` | THE COFFIN NEEDS ANOTHER RECEIPT | Demand the written authority; Pay for the cart’s passage (6g) |
| `callback:echo_court_lie` | THE OATH REHEARSED TOO WELL | Refuse another doubtful statement; Disclose the proposed account |
| `callback:echo_barrel_mark` | THE BARREL HAS MOSTLY CARRIED AIR | Correct the delivery account (10g); Stand by the inflated account |
| `callback:echo_master_recall` | THE CUSTOMER KEPT THE BROKEN PART | Replace the fault at your expense (10g); Blame the customer |
| `callback:echo_shipment_loan` | THE CREDITOR HAS NEVER BEEN TO SEA | Review the terms without promising payment; Borrow against another promise |
| `callback:echo_silent_partner` | THE SILENT PARTNER HAS A SPEECH | Agree clear limits before taking money; Decline the partnership |
| `callback:echo_missing_not` | THE WORD THAT CHANGES THE TESTIMONY | Correct the missing word; Destroy the inconvenient original |
| `callback:echo_false_certificate` | THE CERTIFICATE’S INCONVENIENT DATE | Acknowledge the false date; Deny changing the date |
| `callback:echo_poet_refusal` | THE PATRON’S ALMOST HARMLESS VERSE | Keep the point and remove the target; Refuse the commission |
| `callback:echo_honest_muster` | THE MEN WHO FIT THE MUSTER | Support the true numbers; Mock the imaginary ranks |
| `callback:echo_falcon_house` | THE DINNER QUARREL BETWEEN TWO HOUSES | Admit your household’s mistake; Repeat the family accusation |
| `callback:echo_shadow_map` | THE RIVER REFUSES THE DRAWING | Accept a proper survey quietly; Explain the first drawing’s advantages publicly |
| `callback:echo_coin_weight` | THE FACE IS SOUND, THE SILVER IS LIGHT | Fund an assay and correction (18g); Blame the people weighing the coins |
| `callback:echo_private_execution` | THE VERDICT ARRIVES BEFORE THE WITNESSES | Hear the evidence first; Require an ordinary hearing |
| `callback:echo_relic_skulls` | THE SAINT HAS TWO CHILDHOODS | Support an honest revised label; Tell the crowd the original explanation |
| `callback:echo_ordeal_hand` | THE OVEN’S EVIDENCE IS ON YOUR HAND | Explain what pain does not prove; Accept practical help instead |
| `callback:echo_charity_names` | THE DONORS SPEAK BEFORE THE BREAD | Serve food while reading the names; Make the hungry wait for important names |
| `callback:echo_bandage_favour` | THE BANDAGE AND THE SMALL REQUEST | Offer help you can safely give; Reject the obligation |
| `callback:echo_scaffold_peg` | THE SMALLEST PART OF THE SCAFFOLD | Explain and fit the support; Explain mostly your own good sense |
| `callback:echo_tonic_guarantee` | THE GUARANTEE FITS IN THE BOTTLE | Welcome the limited honest claim; Decline without another argument |
| `callback:echo_foreign_advance` | THE FORTUNE CHARGES IN ADVANCE | Refuse to finance the claim; Take the demands to the clerk |
| `callback:echo_pageant_worker` | THE DEVIL WANTS AN HONEST WAGE | Help settle the accounts fairly; Decline without insulting the work |
| `callback:echo_family_boundary` | THE BOUNDARY STONE HAS AN AUDIENCE | Stand by the witnessed position; Keep out of the quarrel |
| `callback:echo_old_family_goods` | THE KEEPSAKE WITHOUT A NEW PRICE | Accept without making a debt of the gift; List what your help has cost |

## Professional matters

These 12 player-initiated cases now deliver the chosen branch and milestone in the same popup. Fees, hired assistants, patient care, actual complaints, family resentment and rival evidence still take effect. Medical follow-up remains medical simulation; no narrative verdict is scheduled. Old verdict IDs are available only for a visible legacy save.

| Case | Current conflict | Decisions |
| --- | --- | --- |
| `dyer_debt` | THE DYER’S BLUE DEBT | Test the dye before signing; Sell it before the weather turns; Pay a dyer to fix the cloth |
| `wool_mark` | THE RIVAL’S LAST BALE | Call the shepherd as witness; Buy the rival’s silence; Hire a clerk to trace the sales |
| `bell_crack` | THE FUNERAL BELL WARRANTY | Recast the faulty bell; Conceal the crack beneath the inscription; Hire an apprentice for a second casting |
| `guild_widow` | THE WIDOW’S WORKSHOP | Defend the household’s charter; Take the disputed commissions yourself; Pay a clerk to establish the succession |
| `noble_fever` | THE PHYSICIAN’S GREAT SUCCESS | Select the difficult cases; Accept every patient and every fee; Hire a medical apprentice |
| `well_fever` | THE WELL OF SAINT ITCH | Inspect the well and separate the sick; Sell the fashionable treatment; Pay an assistant to boil cloth and water |
| `tithe_bones` | THE TITHE OF THE DEAD | Seek restitution for the households; Defend the abbey’s profitable custom; Pay a clerk to reconcile the burial roll |
| `relic_hearing` | THE SAINT’S HORSE TOOTH | Submit the relic to an honest inquiry; Protect the priory’s profitable reputation; Hire a scholar to examine its provenance |
| `bridge_company` | THE COMPANY AT THE BROKEN BRIDGE | Find a ford and protect the levy; Force the crossing before the enemy arrives; Pay engineers to shore the bridge |
| `captives_ransom` | THE CAPTIVES’ EMPTY PURSES | Exchange them for your missing soldiers; Extort a ransom from their families; Hire a clerk to verify their names |
| `salt_decree` | THE CHANCELLOR’S SALTED CAMEL | Rewrite the levy around actual trade; Sell exemptions before anyone notices; Hire a clerk to survey the ports |
| `dead_falconer` | THE DEAD FALCONER’S WAGES | Expose the accounts to the council; Sell your silence to the beneficiary; Hire an auditor to follow the payments |

## Workshop commissions

The explicit next-year gate and new delayed reward timers are removed. Four independently eligible work orders can be settled in any order once their real work prerequisites are earned; the Workshop recommends the next unfinished commission. The forge remains optional. Completed commission IDs preserve old completion counts, and old saved real payments still settle.

| Commission | Work prerequisite | Decisions |
| --- | --- | --- |
| A mark of your own | 0 paid shifts/contracts | Fit and test every joint; Arrange a dependable supplier |
| The faulty batch | 2 paid shifts/contracts | Replace the faulty batch; Refund the affected customer; Dispute your responsibility |
| Room to grow | 4 paid shifts/contracts | Reserve work for local households; Accept the larger private order |
| What your mark will mean | 6 paid shifts/contracts | Build a reputation others can trust; Secure a profitable partnership; Settle accounts and stay independent |

## 48 childhood scenes

Ten scenes focus on ages 0–4, twelve on ages 5–9, twelve on ages 10–13, ten on ages 14–17, and four additional household/errand scenes span 5–13. Three younger-child conflicts also remain suitable through thirteen. Peers and carers are actual living characters, not names invented during eligibility. From five onward, a child without a nearby peer can meet one persistent neighbourhood child during the world update, including outside formal schooling. This uses the world RNG and is covered by deterministic reload checks.

| Ages | ID | Encounter |
| --- | --- | --- |
| 0–4 | `young_spoon_office` | THE SPOON’S NEW OFFICE |
| 0–4 | `young_sleep_inspection` | THE NIGHT INSPECTOR |
| 0–4 | `young_soup_fort` | THE FORTIFICATION OF SUPPER |
| 0–4 | `young_boot_harbour` | THE BOOT WITH A PASSENGER |
| 0–4 | `young_name_the_cat` | THE CAT’S NEW NAME |
| 0–4 | `young_washing_judge` | THE LAUNDRY HEARING |
| 0–4 | `young_bread_shape` | THE UNRECOGNISED ANIMAL |
| 0–4 | `young_blanket_trade` | THE BLANKET EXCHANGE |
| 0–4 | `young_candle_shadow` | THE EXTRA PERSON ON THE WALL |
| 0–4 | `young_small_mending` | THE THREAD YOU CAN REACH |
| 5–9 | `young_goat_headmaster` | THE NEW HEADMASTER |
| 5–9 | `young_ink_finger` | THE FINGER THAT GAVE EVIDENCE |
| 5–9 | `young_stool_court` | THE COURT WITHOUT A SECOND STOOL |
| 5–9 | `young_river_boat` | THE BOAT THAT HAS NO INTEREST IN COMMAND |
| 5–9 | `young_saint_cake` | THE CAKE RESERVED FOR A SAINT |
| 5–13 | `young_lost_button` | THE BUTTON AT THE CENTRE OF THE WORLD |
| 5–9 | `young_market_math` | THE APPLE THAT DISPROVES THE SUM |
| 5–9 | `young_family_whisper` | THE WORD YOU WERE NOT MEANT TO LEARN |
| 5–9 | `young_hedge_crown` | THE CROWN MADE OF THE WRONG HEDGE |
| 5–13 | `young_mud_toll` | THE TOLL AT THE VERY SMALL BRIDGE |
| 5–13 | `young_borrowed_bell` | THE BELL THAT RINGS FOR BISCUITS |
| 5–13 | `young_pocket_inventory` | THE INSPECTION OF THE IMPORTANT POCKET |
| 5–13 | `young_loaf_errand` | THE LOAF WITH A JOURNEY MISSING |
| 5–13 | `young_measuring_door` | THE DOOR THAT RECORDS YOUR HEIGHT |
| 5–13 | `young_errand_receipt` | THE ERRAND THAT NEEDS A RECEIPT |
| 5–9 | `young_window_visitor` | THE VISITOR WHO GETS THE WARM PLACE |
| 10–13 | `young_rent_signature` | THE SIGNATURE BIGGER THAN THE RENT |
| 10–13 | `young_apprentice_model` | THE MASTERPIECE SMALL ENOUGH TO HIDE |
| 10–13 | `young_exam_margin` | THE ANSWER IN THE WRONG MARGIN |
| 10–13 | `young_hens_argument` | THE HEN HAS TWO OWNERS AND NO ALLEGIANCE |
| 10–13 | `young_road_message` | THE MESSAGE THAT SOUNDS BETTER SHORTENED |
| 10–13 | `young_borrowed_sword` | THE SWORD THAT REQUIRES TWO HANDS AND PERMISSION |
| 10–13 | `young_holy_gloss` | THE TRANSLATION THAT IMPROVES THE COOK |
| 10–13 | `young_market_change` | THE EXTRA COIN NOBODY HAS CLAIMED |
| 10–13 | `young_fence_dare` | THE DARE WITH A WITNESS IN EVERY WINDOW |
| 10–13 | `young_rival_nickname` | THE NICKNAME THAT HAS OUTLIVED THE JOKE |
| 10–13 | `young_family_tally` | THE HOUSEHOLD’S FIRST REAL ACCOUNT |
| 10–13 | `young_flood_slate` | THE BRIDGE PLAN DRAWN AFTER THE RAIN |
| 14–17 | `young_love_note` | THE LETTER THAT HAS MET ITS READER |
| 14–17 | `young_first_wage` | THE WAGE WITH AN INVISIBLE DEDUCTION |
| 14–17 | `young_forbidden_chapter` | THE BOOK THAT SHOULD NOT BE THIS INTERESTING |
| 14–17 | `young_dangerous_shortcut` | THE SHORT WAY PAST THE QUARRY |
| 14–17 | `young_borrowed_reference` | THE REFERENCE WRITTEN BY ITS BENEFICIARY |
| 14–17 | `young_leaving_supplies` | THE BAG FOR THE LIFE BEYOND HOME |
| 14–17 | `young_peasant_seed` | THE SEED THAT IS ALSO SUPPER |
| 14–17 | `young_merchant_sample` | THE SAMPLE BETTER THAN THE GOODS |
| 14–17 | `young_military_ration` | THE RATION RETURN COUNTS YOU TWICE |
| 14–17 | `young_noble_precedence` | THE CHAIR THAT OUTRANKS ITS OWNER |

## Boundaries retained

Education duration, pregnancy/adoption arrivals, illness and disability progression, clinical follow-up, debt interest, legal proceedings, career advancement and autonomous NPC resentment remain simulation systems. The optional caravan and combat activities remain same-year gameplay, as do independent RPG career assignments gated by earned work and skill. These do not reopen authored narrative chapters. The levy can lead directly to the Rout, the one permitted immediate extra EventModal scene.

Migration marks unfinished story metadata `retired`, adds a neutral history record, clears threads/arcs and retires unresolved professional chapters without rewards or assumed verdicts. Only empty authored history reminders (`delayed_story_consequence`, `story_legacy`) are removed. Real effects, conditions and relationships are retained, even when their records carry an old story ID. Completed history, genealogies, purchases and RNG are preserved. Missing legacy actors cause withdrawal rather than resurrection or silent substitution.

## Outcome writing revisions

The separate [writing-revisions.json](validation/single-year/writing-revisions.json) records 88 exact before/after outcomes across family, romance, crime, work, politics, faith, health and rare events. These are targeted text edits; the associated effects are retained. Sincere death, bereavement and affectionate family passages were left intact. Counts alone do not assess humour: the examples below show the actual revised outcomes.

### `life_sibling_guarantor` · `settle`

Before: You pay to retire the claim before it spreads. {{sibling}} is relieved; your trust in that relief is sharply reduced.

After: The lender cancels the claim. {{sibling}} offers to sign a note of gratitude; you suggest leaving the pen where it is.

### `life_wet_mattress` · `repair`

Before: You pay for the roof repair. The household’s shelter improves and supper no longer requires moving the bowls between drops.

After: The bowls return to holding supper instead of rain. The repairer leaves with your money and, at last, the household’s weather.

### `life_lovers_witness` · `truth`

Before: You refuse the false testimony. {{other}} loses trust in your usefulness; your own legal record remains untouched.

After: {{other}} folds the proposed testimony. Your memory has failed to become useful, an imperfection they find very difficult to forgive.

### `life_chaperone_bill` · `pay`

Before: You pay for discretion and dubious eyesight. {{other}} is pleased to find affection has a solvent friend.

After: {{other}} accepts payment for having seen less. The bill is exceptionally legible for work conducted in such poor light.

### `life_shadow_rent` · `pay`

Before: You pay seven gold for sunlight you were not using. {{other}} accepts the money without conceding the existence of clouds.

After: {{other}} accepts seven gold for the shade. A cloud passes over the transaction without paying anything.

### `life_branding_substitute` · `refuse`

Before: You keep your arm unmarked and disappoint {{other}}. It is an exceptionally affordable disappointment.

After: {{other}} improves the offer, apparently believing your skin has failed to understand the first price. Your arm leaves the negotiation unchanged.

### `life_scaffold_blessing` · `secure`

Before: You spend the time securing the work and gain practical experience. {{other}} concedes that the blessing need not do every part of the job.

After: You fit the peg before climbing. {{other}} allows that a blessing need not be required to do the carpenter’s part as well.

### `life_crown_private_trial` · `hear`

Before: You refuse the execution and improve public order. {{other}} loses trust in your willingness to make justice convenient.

After: The petition must wait for evidence. {{other}} is distressed to discover that the witnesses have been invited to contribute something.

### `life_unclaimed_fortune` · `verify`

Before: You refuse the unsupported claim and improve your judgement. {{other}} is suddenly less certain which country contains the fortune.

After: You ask for the estate’s name before paying. {{other}} becomes less certain which country contains the fortune.

### `life_family_ladder` · `gift`

Before: You lose some household wealth but gain a grateful neighbour. The lower shelves produce fewer requests for help.

After: {{other}} takes the ladder home permanently. You lower the shelves and stop receiving requests to borrow your furniture’s only means of escape.

### `life_wrong_serenade` · `shelter`

Before: You pay for a little hospitality and the humiliation passes without an audience. {{other}} remembers the door that actually opened.

After: You pay for a dry place to wait and close the door on the audience. {{other}} discovers that a little hospitality travels farther than the verse.
