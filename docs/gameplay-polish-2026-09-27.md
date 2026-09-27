# Gameplay polish — 27 September 2026

## Player-facing changes

- Quests has its own navigation tab: Contracts, Explore, Craft and Careers. These panels no longer appear above every Do category. Trade career chapters live under Quests → Careers.
- Do → Practice contains skill levels, milestones, exercises and sparring. Skills, quests, equipment and new sections use the existing pixel-art icon library.
- Every recipe explains its actual equipment bonuses or consumable effect. Relevant current contracts appear beside recipes, and delivery contracts offer a shortcut to prepare their required item. Crafting exposes Equip/Use immediately, including after the anvil result. Masterpieces explain their mastery-commission purpose.
- Expeditions reserve all remaining actions at departure and open the next decision automatically. Three-stage caravans also continue directly. The preceding result remains visible on the next page. Choices still belong to the player; retreat keeps earned goods but does not refund reserved actions.
- Anvil lessons open at age 10, once per year until Craftsmanship 3. A living father introduces the lesson when available; otherwise the village smith does. Each lesson costs one action and grants 6 XP after five strikes or Quick finish. Paid anvil opportunities disappear when their three yearly bonus attempts are used.
- Combat lasts at most four exchanges, with stronger attacks, a shorter timing lead-in and seven original pixel Lottie scenes matching the anvil palette. During timing, a touch anywhere on the modal/backdrop commits the move. Keyboard/accessibility activation remains available. Backgrounding pauses play; reduced-motion preferences suppress decorative animation.
- Two events launch playable duels: a rival's public wager and a challenger blocking a grain cart. Gold, stores, injury and reputation have explicit stakes; peaceful alternatives are available. Rewards/losses settle once, including after reloading.
- The rival storyline now states who did what and why, with specific comic details instead of vague references. Several inheritance, famine and child-event outcomes received the same treatment.
- Gold already printed in a choice label is not repeated below it. An unaffordable 6g choice shows only “You have 3g.” Timing Assist and background music are removed, including their settings and the music asset. Sound effects remain separately controlled.

## Save and integration handling

- Existing partly completed expeditions pay only for their remaining stages when resumed. An already-open legacy stage can finish before switching to the new continuation flow.
- Legacy timing-assistance values are discarded. Old free anvil practice is cleared without rewards; paid forge work remains recoverable. Lesson rewards, craft outputs and combat stakes survive reloads without double settlement.
- The reducer's existing merge conflict was reconciled, retaining career identity, routine-activity limits, caravan routing and property bonuses. Paid anvil shifts now receive the same career adjustments as ordinary shifts.
- A web-specific Meta service prevents the browser build from loading native tracking-transparency code. Mobile tracking continues through the native service.

## Verification

- Browser checks at a 390px layout covered quest navigation, recipe preparation, crafting/using a repair kit, father-led anvil lessons and their yearly limit, gold-shortage copy, rendered combat animation and a timing tap on the title outside the bar.
- Automated regressions cover exact crafted quality, action accounting, legacy journeys, once-only consumable/duel settlement, unavailable challenges and removal of old assistance settings.
- Full suite, type-check and final export results are recorded in the [release-readiness report](release-readiness-2026-09-27.md).

These checks do not replace signed iOS/Android device testing of gestures, animation performance, audio, lifecycle, purchases or attribution. No release was published.
