# Holding redesign and writing verification

4 November 2026 · `v5` · baseline `5964644fcab4359441950c39f7bc0083141bb160`.

HOLD now opens Estate, with separate Royal Court and Swineford sections. The layout follows the approved artwork, parchment, pixel typography, blue section headings and yellow selection hierarchy. No bottom tab, new art package, entitlement bypass or gameplay cost was introduced. Ninety-five existing events and eight annual observations received a deliberate writing pass with canonical NPC context.

## Holding changes

Estate contains its actual title, station, dynasty, population/capacity, prosperity and yearly payout information; the existing best-next-move recommendation; a grouped Stores/Security/Loyalty ledger; all eight estate orders; and expandable buildings/upgrades. Available orders sort first, while unavailable ones retain their real requirements. All eight permanent improvements, RPG construction/materials and stewardship remain accessible. The one-order-per-year rule and original reducers/costs remain.

Royal Court shows the real ruler, heir/regent, treasury, legitimacy, player influence and the three-per-year court action allowance. Four vertical office rows show actual incumbents using existing portrait assets. Office details sit beside the roster on tablets and follow it on phones. The five public actions open a focused detail view with only relevant inputs. Monarch decisions are grouped into Kingdom Affairs, Military & Justice, and Nobility & Succession; all 20 original court actions remain represented, including appointment, succession, regency and opposition controls.

Petitions use shared engine requirements: court education or professional court standing 20+, influence 15+, and Crown support 5+. Existing conditional career-standing eligibility and other availability checks remain. The mockup’s illustrative learning/influence figures were not copied. The real candidate selector and reducer handle the chosen office and resulting contest/status.

Section selection is local UI state retained while temporarily leaving HOLD; a new controlled life resets it to Estate. Selection spends no action and draws no RNG. Do → Court opens Royal Court directly. Swineford has its own village-status panel and explains how village conditions differ from estate resources. At narrow widths or high native font scale, the visual section labels shorten to ESTATE / COURT / VILLAGE while full accessible labels remain ESTATE / ROYAL COURT / SWINEFORD.

## Before/after screenshots

These are Chromium screenshots of production web exports, with actual fixture saves and fonts/artwork. Baseline is frozen at the reviewed commit; final screenshots use the new production export. They show visible scroll positions, rather than pretending the whole responsive page fits into one viewport. The tablet images are the closest comparison to the supplied mockups’ side-by-side council layout. After-workflow court screenshots follow a real estate order and improvement purchase, so their resource totals reflect those costs.

| View | Before, 390px | After, 390px | Before, 768px | After, 768px |
| --- | --- | --- | --- | --- |
| Estate | [Before](validation/holding-writing/before-estate-390.png) | [After](validation/holding-writing/after-estate-390.png) | [Before](validation/holding-writing/before-estate-768.png) | [After](validation/holding-writing/after-estate-768.png) |
| Royal Court | [Before](validation/holding-writing/before-court-390.png) | [After](validation/holding-writing/after-court-390.png) | [Before](validation/holding-writing/before-court-768.png) | [After](validation/holding-writing/after-court-768.png) |
| Chancellor detail | [Before](validation/holding-writing/before-chancellor-390.png) | [After](validation/holding-writing/after-chancellor-390.png) | [Before](validation/holding-writing/before-chancellor-768.png) | [After](validation/holding-writing/after-chancellor-768.png) |
| Petition | [Before](validation/holding-writing/before-petition-390.png) | [Requirements](validation/holding-writing/after-petition-390.png) | [Before](validation/holding-writing/before-petition-768.png) | [Requirements](validation/holding-writing/after-petition-768.png) |

Petition workflow continues through the [real event choice](validation/holding-writing/after-petition-decision-390.png) to [recorded petition status](validation/holding-writing/after-petition-status-390.png). Additional evidence: [expanded buildings](validation/holding-writing/after-buildings-390.png), [estate orders](validation/holding-writing/after-estate-orders-390.png), [Swineford](validation/holding-writing/after-swineford-390.png), [monarch decisions](validation/holding-writing/after-monarch-decision-768.png), [blocked petition](validation/holding-writing/after-locked-petition-320.png), [child/regency](validation/holding-writing/after-child-petition-280.png).

280px with enlarged text: [Estate](validation/holding-writing/after-estate-280-large.png), [Court](validation/holding-writing/after-court-280-large.png), [Village](validation/holding-writing/after-swineford-280-large.png), [petition](validation/holding-writing/after-court-petition-280-large.png). Normal 280/320/390/768 screenshots are retained alongside them.

## Narrative changes and examples

The [mandatory editorial audit](narrative-writing-polish-audit.md) contains the complete rewritten file/event-ID list, eighteen before/after introduction + choice + outcome examples, vocabulary counts, retained good content, truthful relationship examples, and returning NPCs from seven childhood histories. The [95 full rendered scenes and 237 choices](validation/holding-writing/actor-binding-audit.json) include every rewritten scene and education route. The optional INVOLVED PEOPLE label fits the existing EventModal and uses existing pixel/parchment components.

Education scenes now use the actual current mentor and primary classmate targeted by their consequences. Narrow canonical reference selectors and factual descriptions cover carers, guardians, current/former learners, professional contacts/rivals, court offices and strangers. The loader deterministically repairs incompatible saved casts or clears an impossible pending scene, retaining history and RNG. Legacy adults carrying a childhood lesson receive a proper adult course peer with reciprocal records; historical classmates remain. No schema/key/content-ID migration or new authored multi-year storyline was needed.

## Verification results

| Check | Result |
| --- | --- |
| Full Jest | 100 suites, 1,009 tests passed |
| Final actor/birth copy regression | Two targeted suites / 26 tests passed |
| TypeScript | `tsc --noEmit` passed |
| Holding/court focused tests | 51 tests passed during UI stage; all included in final full Jest |
| Registry/prose compatibility | 902 IDs retained, 545 current; 95 event / eight annual rewrites; effects, conditions, choices, forecasts and cooldowns preserved |
| Binding/content audit | 95 scenes, 237 choices/branches, zero findings; all 545 current events statically validated |
| Natural childhood review | Seven origins, seeds 843010–843016, ages 0–18 and settled at 19; normal mortality, all seven survived |
| Deterministic life cohort | 420 completed lives, seven cohorts × 60, 105 free / 315 Premium, normal mortality; zero stalls or unfinished lives |
| Save/reload checks in cohort | 1,222 checkpoints, zero inconsistencies |
| Authored story schedules | Zero created or open; no new multi-year stories |
| Dynasty test | Existing 100 three-generation dynasties passed; eight-year segments and two heir transfers per dynasty, not 300 full natural lives |
| Baseline browser reference | Two viewport workflows, 390 / 768px, passed |
| New Holding browser | 12 workflows passed across 280 / 320 / 390 / 768px and 280px enlarged text; zero page errors/width overflow |
| Narrative browser | Ten scenes passed at 280px enlarged text / 390px, including legacy reload |
| Production exports | Web, iOS and Android export completed |
| Native release check | Blocked by existing unpublished Android `TERMS_OF_USE_URL`; manual dashboard/store/signed-device gates remain |

The 420-life cohort uses the existing deterministic balanced controller: occupational/royal role assigned once at adulthood, two work actions, rest below 75 health, natural mortality, peaceful RPG resolution, reloads at 12/30/50 where survived. It reached 410 unique events and 171 annual messages. The cohort was run twice after the legacy peer repair, producing identical rows. Subsequent changes were display-only parent-introduction grammar and an adult-martial plagiarism label/outcome correction. A final-source 14-life replay exactly matches the first 14 original rows; these sampled replays do not substitute for a claim that all 420 final rendered histories were reread. Final Jest, binding audits and platform exports include the formatting corrections. The last royal-title copy fix additionally passed targeted actor/birth tests and export.

Browser checks execute a real estate order and permanent upgrade, verify navigation has no gold/action/RNG effect, select Marshal and resolve its petition, preserve selection on return, and enter court through DO. Monarch checks execute Forgive Arrears and verify its 20-treasury / one ordinary action / one court action costs without changing estate resources. Ineligible adult/child submissions remain disabled. The browser uses controlled local saves and cached fixture entitlement state; it does not test real purchases or grant production access.

Enlarged web text is a 1.35× CSS emulation, not an OS accessibility setting on a physical phone. No physical-device claim is made. Native text scaling, safe areas, keyboard/scroll behaviour, haptics, signed builds, store billing and live Meta/RevenueCat integration still require their existing release acceptance checks. No signing, submission or deployment was performed.

## Evidence and reproduction

All new evidence is under [docs/validation/holding-writing](validation/holding-writing). Earlier family, balance and milestone validation folders were left intact. [Manifest](validation/holding-writing/manifest.json) records the implementation commit and artifact/source hashes. Raw logs: [Jest](validation/holding-writing/jest.txt), [final actor/birth regression](validation/holding-writing/actor-birth-regression.txt), [TypeScript](validation/holding-writing/typecheck.txt), [exports](validation/holding-writing/production-export.txt), [dynasties](validation/holding-writing/dynasties.txt), and [release gate](validation/holding-writing/release-check.txt). Other browser/audit logs accompany the structured outputs; no credentials or build bundles are committed.

```sh
npm test -- --runInBand
npm run typecheck
# Use a tsx installation available in the review environment:
tsx scripts/auditWriting.ts
tsx scripts/auditActorBindings.ts
npm test -- --runInBand src/__tests__/persistentWorldFullSoak.test.ts -t 'three-generation dynasties'
node node_modules/expo/bin/cli export --platform all --output-dir /tmp/fate-holding-production
npm run release:check
```

The existing deterministic cohort controller invocation and final replay evidence are recorded in the manifest. Browser harnesses are `scripts/createHoldingUiFixtures.ts`, `scripts/verifyHoldingUi.cjs`, `scripts/createWritingUiFixtures.ts`, and `scripts/verifyWritingUi.cjs`; set their URL variables to the locally served production export. Playwright/Chromium and tsx were review tooling installed outside the repository; application dependencies and lockfile did not change.

## Changed implementation files

The UI stage is commit `e34a6bf`; narrative, actor recovery, responsive follow-up and audit tooling form a separate implementation commit. Documentation/evidence is committed separately. The manifest identifies the code commit before documentation. Files changed relative to baseline:

- `scripts/auditActorBindings.ts`
- `scripts/auditWriting.ts`
- `scripts/createHoldingUiFixtures.ts`
- `scripts/createWritingUiFixtures.ts`
- `scripts/verifyHoldingUi.cjs`
- `scripts/verifyWritingUi.cjs`
- `src/__tests__/content.test.ts`
- `src/__tests__/editorialActors.test.ts`
- `src/__tests__/holdingCourtUi.test.tsx`
- `src/__tests__/singleYearFixtures.ts`
- `src/components/modals/EventModal.tsx`
- `src/components/tabs/CourtPanel.tsx`
- `src/components/tabs/DoTab.tsx`
- `src/components/tabs/HoldingPanel.tsx`
- `src/components/tabs/HoldingTab.tsx`
- `src/components/ui/PixelButton.tsx`
- `src/content/annualContextMessages.ts`
- `src/content/annualMessages.ts`
- `src/content/childEvents.ts`
- `src/content/childhoodDepthEvents.ts`
- `src/content/circumstanceEvents.ts`
- `src/content/companionEvents.ts`
- `src/content/editorialContinuity.ts`
- `src/content/educationEvents.ts`
- `src/content/index.ts`
- `src/content/narrativeFamilyEvents.ts`
- `src/content/persistentWorldEvents.ts`
- `src/content/singleYearStories.ts`
- `src/content/singleYearVillage.ts`
- `src/data/birthOrigins.ts`
- `src/engine/birthOriginEngine.ts`
- `src/engine/courtEngine.ts`
- `src/engine/director/index.ts`
- `src/engine/educationEngine.ts`
- `src/engine/eventActors.ts`
- `src/engine/eventPicker.ts`
- `src/screens/GameScreen.tsx`
- `src/state/persistence.ts`
- `src/types/game.ts`
