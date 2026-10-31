import { CAREER_SPECIALIZATIONS } from '@/data/careerSpecializations';
import { PRACTICE_DECISIONS, PRACTICE_PROBLEMS, PRACTICE_RESPONSES } from '@/data/practiceDecisions';
import type { GameEvent } from '@/types/game';
import { PROFESSIONAL_STORIES } from '@/data/professionalStories';
export const CAREER_SPECIALIZATION_EVENTS: GameEvent[] = PROFESSIONAL_STORIES.flatMap(story => [
  {
    id: `profession_${story.id}`, title: story.title, text: story.text, category: 'peasant', domain: 'career', arcNodeOnly: true, actorRoles: {},
    choices: story.choices.map((label, i) => ({
      id: `approach_${i}`, label, costGold: i === 2 ? 8 : undefined,
      outcome: { text: story.ending[i],
        effects: { gold: i === 2 ? -8 : 0, professional: { family: story.family, caseId: story.id, stage: 'approach', choice: i } }, tone: i === 1 ? 'bad' as const : 'plain' as const },
    })),
  },
  {
    legacyNarrative:true, id: `profession_${story.id}_verdict`, title: `${story.title} · THE RECKONING`, text: story.followup, category: 'peasant', domain: 'career', arcNodeOnly: true, actorRoles: {},
    choices: [
      { id: 'honour', label: 'Stand by the agreement', outcome: { text: 'The hearing records your decision and its consequences.', effects: { professional: { family: story.family, caseId: story.id, stage: 'finish', choice: 0 } }, tone: 'plain' } },
      { id: 'reconsider', label: 'Retract the shortcut and make restitution (6g)', costGold: 6, outcome: { text: 'You pay restitution and place the evidence before the hearing.', effects: { professional: { family: story.family, caseId: story.id, stage: 'finish', choice: 1 } }, tone: 'plain' } },
    ],
  },
]);

const ACCOUNTS: Record<string, [string, string, string, string, string]> = {
  dyer_debt: ['You test the cloth in clean water and retain the sample. The contract now names the dye.', 'You sell the cloth without a rain clause. The counting house keeps an unusually thin copy of the warranty.', 'Eight gold retains a dyer to fix the cloth before delivery.', 'Defend the cloth contract', 'Refund the disputed dye charges'],
  wool_mark: ['You record the shepherd’s testimony beside the wool marks before the bales leave the yard.', 'You pay for silence about the wool marks. Your rival keeps the original receipt.', 'Eight gold retains a clerk to trace the flock and its sales.', 'Present the wool title', 'Settle the wool claim openly'],
  bell_crack: ['You break the faulty mould and begin a sound casting. The parish witnesses the decision.', 'You order the crack painted beneath the inscription. The painter keeps a charcoal rubbing.', 'Eight gold retains an apprentice to help cast the bell again.', 'Answer for the bell’s casting', 'Compensate the parish for the bell'],
  guild_widow: ['You bring the widow’s charter before the guild before its officers seize the tools.', 'You take the widow’s commissions. The guild clerk records who collected them.', 'Eight gold retains a clerk to establish the workshop’s succession.', 'Submit to the workshop hearing', 'Restore the disputed workshop fees'],
  noble_fever: ['You accept the difficult patients and record their symptoms before proposing a treatment.', 'You promise every household a visit. Your treatment ledger fills faster than your days.', 'Eight gold retains an apprentice for dressings and routine attendance.', 'Present your treatment record', 'Pay the patients and correct the record'],
  well_fever: ['You inspect the well, record the privy’s position and separate the fever beds.', 'You sell the fashionable treatment. Your patient keeps the bottle and its contents.', 'Eight gold pays an assistant to boil water and prepare clean cloth.', 'Give evidence about the fever well', 'Refund the fever treatment and publish the evidence'],
  tithe_bones: ['You suspend the duplicate burial fees while the parish records are checked.', 'You collect the disputed tithes. The households retain the burial tallies.', 'Eight gold pays a clerk to reconcile each burial against the parish roll.', 'Answer for the burial tithe', 'Repay the duplicate burial fees'],
  relic_hearing: ['You seal the relic until an open inquiry establishes its provenance.', 'You permit the horse tooth’s veneration to continue. The stable boy declines to pray.', 'Eight gold retains a scholar to compare the reliquary account with the stable inventory.', 'Report to the relic inquiry', 'Compensate the petitioners at the relic hearing'],
  bridge_company: ['You scout the ford before ordering the levy forward. The company waits under cover.', 'You order the crossing despite the split timbers. The muster clerk records the order.', 'Eight gold pays engineers to shore the bridge before the convoy arrives.', 'Accept responsibility for the crossing', 'Pay restitution and revise the crossing report'],
  captives_ransom: ['You send the prisoners’ names with an exchange proposal before anyone sets a price.', 'You demand ransom from the prisoners’ households. The messenger keeps the demand.', 'Eight gold retains a clerk to verify the names before the exchange.', 'Answer for the prisoners’ exchange', 'Return the disputed ransom'],
  salt_decree: ['You amend the levy around actual cargoes and circulate a corrected draft.', 'You sell exemptions from the camel levy. The port keeps the exemption register.', 'Eight gold pays a clerk to survey the ports before the decree is sealed.', 'Defend your salt-levy advice', 'Repay the exemption fees before the council'],
  dead_falconer: ['You submit the falconer’s burial entry beside the nine years of wages.', 'You sell your silence to the account’s beneficiary. A second copy of the burial entry survives.', 'Eight gold retains an auditor to follow the falconer’s payments.', 'Submit the falconer audit', 'Return the hush money and publish the audit'],
};
for (const story of PROFESSIONAL_STORIES) {
  const texts = ACCOUNTS[story.id];
  const verdict = CAREER_SPECIALIZATION_EVENTS.find(e => e.id === `profession_${story.id}_verdict`)!;
  verdict.choices[0].label = texts[3]; verdict.choices[1].label = `${texts[4]} (6g)`;
  verdict.choices[0].outcome!.text = `Your account enters the record: ${story.title.toLowerCase()}. The recorded agreement determines who pays and who is believed.`;
  verdict.choices[1].outcome!.text = `You pay six gold in restitution over ${story.title.toLowerCase()}. The record includes the correction.`;
}

for (const action of CAREER_SPECIALIZATIONS.filter(a => !a.story)) CAREER_SPECIALIZATION_EVENTS.push({
  id: `practice_${action.id}`, title: action.name.toUpperCase(),
  text: action.id === 'find_patron' ? '{{client}} is considering a place for a performer at their table. Supper, a deposit and the patron’s right to request encores all remain negotiable.' : PRACTICE_PROBLEMS[action.mechanism],
  category: 'peasant', domain: 'career', arcNodeOnly: true, actorRoles: {},
  choices: PRACTICE_DECISIONS[action.mechanism].map((label, choice) => ({
    id: `method_${choice}`, label, forecast: { risk: choice === 1 ? 'high' : 'medium', positive: ['Professional progress and standing'], negative: ['Preparation costs', 'Setbacks or client complaints'] }, costGold: choice === 2 ? 2 : undefined,
    outcome: { text: PRACTICE_RESPONSES[action.mechanism][choice],
      effects: { professionalPractice: { id: action.id, choice } }, tone: 'plain' },
  })),
});
