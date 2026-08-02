import { GameEvent, GameState } from '@/types/game';

interface BeatCopy { title: string; text: string }

const COPY: Record<string, BeatCopy[]> = {
  rivals_rise: [
    { title: 'A RIVAL TAKES NOTICE', text: '{{rival.name}} turns a village contest into a public challenge. The look in their eyes promises this will not be forgotten.' },
    { title: 'THE RIVAL RETURNS', text: '{{rival.name}} has found favour with {{patron.name}} and makes certain you hear of it.' },
    { title: 'WHISPERS AND WITNESSES', text: 'A damaging rumour circles Swineford. Every trail seems to bend toward {{rival.name}}.' },
    { title: 'A HAND OFFERED', text: '{{rival.name}} offers cooperation against a shared problem. It may be peace, necessity, or a better trap.' },
    { title: 'THE PUBLIC RECKONING', text: 'Before {{patron.name}} and half the village, {{rival.name}} calls your honour into question.' },
    { title: 'WHAT RIVALRY MADE', text: 'Years of rivalry have shaped two lives. {{rival.name}} waits to learn whether the final word is mercy, friendship, or ruin.' },
  ],
  lean_harvest: [
    { title: 'THE THIN HARVEST', text: 'The grain comes in sparse and damp. {{merchant.name}} raises prices before the church bell finishes announcing the shortage.' },
    { title: 'EMPTY BOWLS', text: 'Poor households skip meals while {{reeve.name}} insists the stores are being managed fairly.' },
    { title: 'GRAIN IN THE NIGHT', text: 'A storehouse is robbed. Hungry neighbours look away, and {{merchant.name}} demands punishment.' },
    { title: 'THE PRICE OF BREAD', text: 'The crisis deepens. Charity, profit and order can no longer all be protected.' },
    { title: 'SWINEFORD IN THE STREET', text: 'An angry crowd gathers outside {{reeve.name}}’s door with empty sacks and farm tools.' },
    { title: 'AFTER THE HUNGER', text: 'The barns slowly fill again. Swineford remembers who fed it, who profited and who sent armed men.' },
  ],
  disputed_inheritance: [
    { title: 'A QUESTION OF INHERITANCE', text: '{{claimant.name}} produces a claim to family property and asks {{witness.name}} to support it.' },
    { title: 'THE OLD PROMISE', text: 'A forgotten promise is repeated as though repetition makes it law.' },
    { title: 'INK, WAX AND DOUBT', text: 'A document appears with a convincing seal and an inconvenient date.' },
    { title: 'THE FAMILY DIVIDES', text: 'Kin choose sides. Meals grow quiet; old injuries suddenly acquire legal importance.' },
    { title: 'JUDGMENT DAY', text: '{{claimant.name}} demands a settlement before family and village witnesses.' },
    { title: 'WHAT THE HEIRS RECEIVE', text: 'The property can be divided. The memory of the dispute cannot.' },
  ],
  war_swineford: [
    { title: 'BANNERS ON THE ROAD', text: '{{commander.name}} arrives beneath a war banner. Levies, coin and grain are demanded from Swineford.' },
    { title: 'THE MUSTER', text: '{{companion.name}} prepares to march and asks whether you will stand beside them.' },
    { title: 'WAR TAX', text: 'Collectors empty barns for the campaign while frightened families count what remains.' },
    { title: 'NEWS FROM THE FRONT', text: 'A mud-stained messenger brings a list of losses and one uncertain opportunity.' },
    { title: 'BATTLE NEAR SWINEFORD', text: 'Smoke darkens the horizon. {{commander.name}} must hold the road or abandon the village.' },
    { title: 'THE RETURNING BANNERS', text: 'The survivors come home changed. Swineford counts graves, debts and reputations.' },
  ],
  ambitious_child: [
    { title: 'A CHILD WANTS MORE', text: '{{child.name}} confesses an ambition too large for the household and asks for your blessing.' },
    { title: 'THE MENTOR', text: '{{mentor.name}} offers to guide {{child.name}}, though no favour in Swineford is entirely free.' },
    { title: 'A SIBLING’S COMPLAINT', text: 'Attention given to {{child.name}} has not gone unnoticed by the rest of the family.' },
    { title: 'THE SECRET STEP', text: '{{child.name}} acts without permission and returns with consequences already in motion.' },
    { title: 'CHILD AGAINST PARENT', text: '{{child.name}} refuses the future chosen for them and demands to shape their own.' },
    { title: 'THE PERSON THEY BECAME', text: 'The child who once reached for more now stands before you as an adult shaped by ambition and upbringing.' },
  ],
};

export function renderBoundText(state: GameState, source: string): string {
  const bindings = state.pendingEvent?.bindings ?? {};
  return source.replace(/\{\{(\w+)\.(name|role)\}\}/g, (_match, role: string, field: 'name' | 'role') => {
    const character = state.world.characters[bindings[role]];
    return character?.[field] ?? 'someone once known in Swineford';
  });
}

/* Historical linear-event prototype retained here only as migration documentation.
const MAJOR_STORY_EVENTS: GameEvent[] = Object.entries(COPY).flatMap(([templateId, beats]) =>
  beats.map((copy, index): GameEvent => ({
    id: `story_${templateId === 'rivals_rise' ? 'rival' : templateId === 'lean_harvest' ? 'harvest' : templateId === 'disputed_inheritance' ? 'inheritance' : templateId === 'war_swineford' ? 'war' : 'child'}_${index + 1}`,
    category: 'arc',
    arc: templateId,
    arcNodeOnly: true,
    title: copy.title,
    text: (state) => renderBoundText(state, copy.text),
    choices: [
      {
        label: 'Act openly and boldly',
        outcome: {
          text: 'You make your choice where all can see it. The decision will be remembered.',
          effects: { charm: 2, reputation: 2, storyVariables: { bold: true, support: index + 1 } },
          tone: 'good',
        },
      },
      {
        label: 'Proceed carefully',
        outcome: {
          text: 'You choose caution, gathering knowledge before committing more than words.',
          effects: { wits: 3, storyVariables: { cautious: true, evidence: index >= 2 } },
          tone: 'plain',
        },
      },
      {
        label: 'Protect thy household first',
        outcome: {
          text: 'Whatever the wider cost, you place your own household before Swineford’s demands.',
          effects: { faith: -1, holding: { loyalty: -2 }, storyVariables: { familyFirst: true } },
          tone: 'plain',
        },
      },
    ],
  })),
);
*/

const PREFIX: Record<string, string> = {
  rivals_rise: 'rival', lean_harvest: 'harvest', disputed_inheritance: 'inheritance', war_swineford: 'war', ambitious_child: 'child',
};

const STRATEGIES: Record<string, { bold: string; cautious: string; family: string }> = {
  rivals_rise: { bold: 'Challenge the rival publicly', cautious: 'Trace every alliance and rumour', family: 'Keep thy household outside the feud' },
  lean_harvest: { bold: 'Open stores to the hungry', cautious: 'Audit every sack and price', family: 'Reserve grain for thy household' },
  disputed_inheritance: { bold: 'Assert the claim before witnesses', cautious: 'Search seals, wills and old promises', family: 'Seek a settlement within the family' },
  war_swineford: { bold: 'Answer the muster in person', cautious: 'Fortify Swineford and gather intelligence', family: 'Move thy household away from the road' },
  ambitious_child: { bold: 'Sponsor the child without apology', cautious: 'Set terms and test the mentor', family: 'Balance the needs of every child' },
};

const BRANCH_COPY: Record<string, Record<'bold' | 'cautious' | 'family', BeatCopy>> = {
  rivals_rise: {
    bold: { title: 'THE FEUD IN DAYLIGHT', text: '{{rival.name}} answers your public defiance, and all Swineford begins choosing sides.' },
    cautious: { title: 'THREADS OF THE PLOT', text: 'Patient inquiry reveals who carries {{rival.name}} messages and what {{patron.name}} truly wants.' },
    family: { title: 'THE FEUD AT THY DOOR', text: 'Avoiding the contest has not kept it away: {{rival.name}} now pressures those closest to you.' },
  },
  lean_harvest: {
    bold: { title: 'THE GRANARY OPENS', text: 'The hungry surge forward as grain is released. Mercy now requires order as much as courage.' },
    cautious: { title: 'FALSE MEASURES', text: 'The ledgers expose hidden stores and false weights, with {{merchant.name}} mark beside both.' },
    family: { title: 'BOLTED DOORS', text: 'Your household eats, but neighbours notice the smoke from your chimney and the silence at your door.' },
  },
  disputed_inheritance: {
    bold: { title: 'CLAIM AGAINST CLAIM', text: '{{claimant.name}} meets your declaration with witnesses, anger and a second document.' },
    cautious: { title: 'THE BROKEN SEAL', text: '{{witness.name}} finds a flaw in the evidence that changes who appears truthful.' },
    family: { title: 'A TABLE BETWEEN HEIRS', text: 'The family gathers without lawyers. Old affection proves useful, but so do old grievances.' },
  },
  war_swineford: {
    bold: { title: 'BENEATH THE BANNER', text: 'You stand beside {{companion.name}} as {{commander.name}} prepares a dangerous defence.' },
    cautious: { title: 'DITCH, WALL AND SPY', text: 'Defences rise while scouts uncover the road by which the enemy intends to approach.' },
    family: { title: 'THE REFUGEE ROAD', text: 'Protecting the household means joining a frightened column while Swineford remains behind.' },
  },
  ambitious_child: {
    bold: { title: 'A DOOR THROWN OPEN', text: '{{child.name}} seizes the opportunity and quickly attracts admiration, envy and expectation.' },
    cautious: { title: 'THE MENTOR TESTED', text: '{{mentor.name}} submits to your conditions, though {{child.name}} resents every delay.' },
    family: { title: 'THE OTHER CHILDREN', text: 'Fairness steadies the household, but {{child.name}} fears their great chance is slipping away.' },
  },
};

function approachChoices(templateId: string, finalDecision = false): GameEvent['choices'] {
  if (finalDecision) return [
    { id: 'reconcile', label: 'Seek a settlement that can endure', outcome: { text: 'You accept less than triumph in exchange for an ending people can live with.', effects: { faith: 2, reputation: 2, storyVariables: { resolution: 'reconcile' } }, tone: 'good' } },
    { id: 'hardline', label: 'Press for complete victory', outcome: { text: 'You pursue victory without softening its cost.', effects: { charm: -1, reputation: 4, storyVariables: { resolution: 'hardline' } }, tone: 'plain' } },
    { id: 'withdraw', label: 'Withdraw and protect what remains', outcome: { text: 'You surrender the wider contest to preserve what is still yours.', effects: { holding: { loyalty: -2 }, storyVariables: { resolution: 'withdraw' } }, tone: 'plain' } },
  ];
  const strategy = STRATEGIES[templateId];
  return [
    { id: 'bold', label: strategy.bold, outcome: { text: 'You choose visible action and accept that others will answer it.', effects: { charm: 2, reputation: 2, storyVariables: { approach: 'bold' } }, tone: 'good' } },
    { id: 'cautious', label: strategy.cautious, outcome: { text: 'You trade speed for knowledge and keep several paths open.', effects: { wits: 3, storyVariables: { approach: 'cautious' } }, tone: 'plain' } },
    { id: 'family', label: strategy.family, outcome: { text: 'You judge the crisis first by what it may do to those under your roof.', effects: { faith: 1, storyVariables: { approach: 'family' } }, tone: 'plain' } },
  ];
}

const BRANCHING_MAJOR_STORY_EVENTS: GameEvent[] = Object.entries(COPY).flatMap(([templateId, beats]) => {
  const prefix = PREFIX[templateId];
  const standard = [0, 1, 2, 4].map((copyIndex, listIndex): GameEvent => ({
    id: `story_${prefix}_${listIndex < 3 ? listIndex + 1 : 5}`,
    category: 'arc', arc: templateId, arcNodeOnly: true,
    title: beats[copyIndex].title,
    text: (state) => renderBoundText(state, beats[copyIndex].text),
    choices: approachChoices(templateId, listIndex === 3),
  }));
  const branches = (['bold', 'cautious', 'family'] as const).map((route): GameEvent => ({
    id: `story_${prefix}_4_${route}`, category: 'arc', arc: templateId, arcNodeOnly: true,
    title: BRANCH_COPY[templateId][route].title,
    text: (state) => renderBoundText(state, BRANCH_COPY[templateId][route].text),
    choices: approachChoices(templateId),
  }));
  const endings = (['reconciled', 'hard'] as const).map((ending): GameEvent => ({
    id: `story_${prefix}_6_${ending}`, category: 'arc', arc: templateId, arcNodeOnly: true,
    title: ending === 'reconciled' ? `A PEACE AFTER ${beats[5].title}` : beats[5].title,
    text: (state) => renderBoundText(state, ending === 'reconciled'
      ? `${beats[5].text} Because compromise was chosen, former opponents must now live beside one another.`
      : `${beats[5].text} The contest ends decisively, and its losers will remember the cost.`),
    choices: [{ id: 'accept_ending', label: 'Accept what this choice has made', outcome: { text: ending === 'reconciled' ? 'The ending is imperfect, but it leaves room for another generation.' : 'The matter is decided. Its scars become part of the family chronicle.', effects: { familyReputation: { delta: ending === 'reconciled' ? 3 : -1 } }, tone: ending === 'reconciled' ? 'good' : 'plain' } }],
  }));
  return [...standard, ...branches, ...endings];
});

const ROLE_LABELS: Record<string, string> = {
  commoner: 'THE VILLAGE COMPACT', artisan_merchant: 'THE GUILD BARGAIN', clergy: 'A TROUBLED CONFESSION',
  martial: 'THE CAPTAIN’S TEST', landed_noble: 'A MATTER OF JUSTICE', monarch: 'THE WEIGHT OF THE CROWN', outlaw: 'HONOUR AMONG THIEVES',
};

const ROLE_CHOICES: Record<string, GameEvent['choices']> = {
  commoner: [
    { id: 'commons', label: 'Organise the village together', outcome: { text: 'Shared labour turns weak hands into a durable compact.', effects: { charm: 2, worldConditions: { foodSecurity: 2, publicOrder: 1 }, storyVariables: { vocation: 'commons' } }, tone: 'good' } },
    { id: 'independence', label: 'Secure thine own holding', outcome: { text: 'Your household becomes less dependent on uncertain neighbours.', effects: { holding: { stores: 5 }, storyVariables: { vocation: 'independence' } }, tone: 'plain' } },
  ],
  artisan_merchant: [
    { id: 'quality', label: 'Defend the quality of the craft', outcome: { text: 'Your mark becomes a promise buyers recognise.', effects: { wits: 2, reputation: 3, worldConditions: { prosperity: 2 }, storyVariables: { vocation: 'quality' } }, tone: 'good' } },
    { id: 'monopoly', label: 'Control the profitable trade', outcome: { text: 'Coin accumulates while competitors learn to resent your seal.', effects: { gold: 10, worldConditions: { prosperity: 1, publicOrder: -1 }, storyVariables: { vocation: 'monopoly' } }, tone: 'plain' } },
  ],
  clergy: [
    { id: 'mercy', label: 'Preach mercy and reconciliation', outcome: { text: 'The parish quiets as old accusations lose their heat.', effects: { faith: 3, worldConditions: { religiousTension: -3 }, storyVariables: { vocation: 'mercy' } }, tone: 'good' } },
    { id: 'orthodoxy', label: 'Enforce strict orthodoxy', outcome: { text: 'Obedience rises beside fear and whispered dissent.', effects: { reputation: 3, worldConditions: { religiousTension: 3 }, storyVariables: { vocation: 'orthodoxy' } }, tone: 'plain' } },
  ],
  martial: [
    { id: 'defend', label: 'Train to defend the village', outcome: { text: 'The levy learns to hold a line without abandoning its neighbours.', effects: { rankProgress: 4, worldConditions: { publicOrder: 2, warThreat: -1 }, storyVariables: { vocation: 'defence' } }, tone: 'good' } },
    { id: 'glory', label: 'Pursue glory beyond Swineford', outcome: { text: 'Your name travels farther than the comfort of those left behind.', effects: { reputation: 5, health: -2, storyVariables: { vocation: 'glory' } }, tone: 'plain' } },
  ],
  landed_noble: [
    { id: 'justice', label: 'Judge according to custom', outcome: { text: 'Predictable justice strengthens the hall and the fields around it.', effects: { reputation: 3, holding: { loyalty: 4 }, worldConditions: { publicOrder: 2 }, storyVariables: { vocation: 'justice' } }, tone: 'good' } },
    { id: 'privilege', label: 'Protect noble privilege', outcome: { text: 'Your authority hardens while petitioners leave unsatisfied.', effects: { gold: 8, holding: { loyalty: -3 }, storyVariables: { vocation: 'privilege' } }, tone: 'plain' } },
  ],
  monarch: [
    { id: 'counsel', label: 'Rule through broad counsel', outcome: { text: 'Competing voices slow the decree but strengthen its acceptance.', effects: { wits: 3, worldConditions: { publicOrder: 3, religiousTension: -1 }, storyVariables: { vocation: 'counsel' } }, tone: 'good' } },
    { id: 'decree', label: 'Rule by unanswerable decree', outcome: { text: 'The realm obeys quickly and remembers the manner of the command.', effects: { charm: 2, reputation: 4, worldConditions: { publicOrder: -1 }, storyVariables: { vocation: 'decree' } }, tone: 'plain' } },
  ],
  outlaw: [
    { id: 'code', label: 'Bind the gang to a strict code', outcome: { text: 'Discipline keeps cruelty from consuming the band.', effects: { charm: 3, worldConditions: { publicOrder: -1 }, storyVariables: { vocation: 'code' } }, tone: 'good' } },
    { id: 'terror', label: 'Rule the roads through fear', outcome: { text: 'Travellers pay quickly; every household begins barring its door.', effects: { gold: 10, faith: -2, worldConditions: { publicOrder: -4 }, storyVariables: { vocation: 'terror' } }, tone: 'bad' } },
  ],
};

const ROLE_STORY_EVENTS: GameEvent[] = Object.entries(ROLE_LABELS).flatMap(([role, title]) => {
  const chapters = [1, 2, 3].map((beat): GameEvent => ({
    id: `story_role_${role}_${beat}`, category: 'arc', arc: `role_${role}`, arcNodeOnly: true,
    title: `${title} · ${beat}`,
    text: (state) => renderBoundText(state, beat === 1
      ? '{{contact.name}} offers an opportunity suited to the life you have chosen.'
      : beat === 2 ? 'The work deepens, and its cost becomes clearer than its promised reward.'
        : '{{contact.name}} reveals who has profited from your labour and who has quietly paid for it.'),
    choices: ROLE_CHOICES[role],
  }));
  const reckoning: GameEvent = {
    id: `story_role_${role}_4`, category: 'arc', arc: `role_${role}`, arcNodeOnly: true,
    title: `${title} · THE RECKONING`,
    text: (state) => renderBoundText(state, '{{contact.name}} asks whether duty or ambition should decide the final course of this work.'),
    choices: [
      { id: 'duty', label: 'Keep faith with those who depend on thee', outcome: { text: 'You place duty above the brighter prize.', effects: { faith: 2, boundKinRel: { role: 'contact', delta: 5 }, storyVariables: { resolution: 'duty' } }, tone: 'good' } },
      { id: 'ambition', label: 'Take the chance to rise', outcome: { text: 'You accept the cost of becoming harder to overlook.', effects: { reputation: 4, faith: -1, storyVariables: { resolution: 'ambition' } }, tone: 'plain' } },
    ],
  };
  const endings = (['duty', 'ambition'] as const).map((ending): GameEvent => ({
    id: `story_role_${role}_5_${ending}`, category: 'arc', arc: `role_${role}`, arcNodeOnly: true,
    title: ending === 'duty' ? `${title} · A TRUST KEPT` : `${title} · A NAME ADVANCED`,
    text: ending === 'duty' ? 'The work endures because people believe your word has weight.' : 'The opportunity carries you forward, leaving both admirers and resentments behind.',
    choices: [{ id: 'accept_ending', label: 'Carry this chapter forward', outcome: { text: 'Your vocation has changed both your place and your name in Swineford.', effects: { reputation: ending === 'duty' ? 2 : 4, familyReputation: { delta: ending === 'duty' ? 2 : 1 } }, tone: 'good' } }],
  }));
  return [...chapters, reckoning, ...endings];
});

const RELATIONSHIP_LABELS: Record<string, string> = {
  friendship_test: 'A FRIENDSHIP TESTED', rival_reckoning: 'A RIVAL RECKONING', marriage_strain: 'STRAIN IN THE MARRIAGE',
  blood_between_siblings: 'BLOOD BETWEEN SIBLINGS', parent_and_child: 'PARENT AND CHILD', hidden_affair: 'THE HIDDEN AFFAIR',
};

const RELATIONSHIP_EVENTS: GameEvent[] = Object.entries(RELATIONSHIP_LABELS).flatMap(([id, title]) => {
  const chapters = [1, 2, 3].map((beat): GameEvent => ({
    id: `story_${id}_${beat}`, category: 'arc', arc: id, arcNodeOnly: true, title: `${title} · ${beat}`,
    text: (state) => renderBoundText(state, beat === 1 ? '{{other.name}} asks something difficult of you.' : beat === 2 ? 'What was left unsaid has grown heavier with time.' : '{{other.name}} reveals the earlier hurt that still shapes every conversation.'),
    choices: [
      { id: 'loyalty', label: 'Answer with loyalty', outcome: { text: 'You choose loyalty even where it carries a price.', effects: { charm: 2, boundKinRel: { role: 'other', delta: 5 }, storyVariables: { loyal: true } }, tone: 'good' } },
      { id: 'honesty', label: 'Demand honesty', outcome: { text: 'You refuse comfortable lies and ask for the whole truth.', effects: { wits: 2, storyVariables: { honest: true } }, tone: 'plain' } },
      { id: 'pride', label: 'Protect thy pride', outcome: { text: 'Pride wins the moment. Whether it wins the years remains uncertain.', effects: { charm: -1, boundKinRel: { role: 'other', delta: -3 }, storyVariables: { proud: true } }, tone: 'bad' } },
    ],
  }));
  const decision: GameEvent = {
    id: `story_${id}_4`, category: 'arc', arc: id, arcNodeOnly: true, title: `${title} · THE CHOICE`,
    text: (state) => renderBoundText(state, '{{other.name}} asks whether this bond can be repaired or must finally be broken.'),
    choices: [
      { id: 'mend', label: 'Mend what remains', outcome: { text: 'Repair begins with an honest accounting of the hurt.', effects: { boundKinRel: { role: 'other', delta: 8 }, storyVariables: { resolution: 'mend' } }, tone: 'good' } },
      { id: 'break', label: 'End the bond', outcome: { text: 'You decide that a clean ending is kinder than another false beginning.', effects: { boundKinRel: { role: 'other', delta: -10 }, storyVariables: { resolution: 'break' } }, tone: 'bad' } },
    ],
  };
  const endings = (['mend', 'break'] as const).map((ending): GameEvent => ({
    id: `story_${id}_5_${ending}`, category: 'arc', arc: id, arcNodeOnly: true,
    title: ending === 'mend' ? `${title} · A BOND REMADE` : `${title} · THE LAST WORD`,
    text: ending === 'mend' ? 'Trust returns slowly, made stronger by knowing what nearly destroyed it.' : 'The relationship ends, but its memories continue to shape both households.',
    choices: [{ id: 'accept_ending', label: 'Remember what happened', outcome: { text: 'This bond becomes part of the family history.', effects: { memory: { tag: 'relationship_reckoning', weight: 4, note: ending === 'mend' ? 'A damaged relationship was repaired.' : 'An important relationship ended.' } }, tone: ending === 'mend' ? 'good' : 'plain' } }],
  }));
  return [...chapters, decision, ...endings];
});

const DOMAIN_STORY_LABELS: Record<string, string> = {
  pestilence_year: 'THE PESTILENCE YEAR', charter_swineford: 'THE CHARTER OF SWINEFORD', empty_throne: 'THE EMPTY THRONE',
  the_accused: 'THE ACCUSED', healers_burden: "THE HEALER'S BURDEN", ashes_household: 'ASHES OF THE HOUSEHOLD',
  divided_parish: 'THE DIVIDED PARISH', guild_election: 'THE GUILD ELECTION', royal_bastard: 'THE ROYAL BASTARD',
  relic_hunter: 'THE RELIC HUNTER', secret_brotherhood: 'THE SECRET BROTHERHOOD',
};
const PREMIUM_STORIES = new Set(['royal_bastard', 'relic_hunter', 'secret_brotherhood']);

const DOMAIN_STORY_EVENTS: GameEvent[] = Object.entries(DOMAIN_STORY_LABELS).flatMap(([id, title]) => {
  const common = { category: 'arc' as const, arc: id, arcNodeOnly: true, premium: PREMIUM_STORIES.has(id) };
  const chapters = [1, 2, 3].map((beat): GameEvent => ({
    ...common, id: `story_${id}_${beat}`, title: `${title} · ${beat}`,
    text: (state) => renderBoundText(state, beat === 1
      ? `{{other.name}} draws you into ${title.toLowerCase()}, where public duty and private loyalty cannot both remain simple.`
      : beat === 2 ? 'The first decision has changed who trusts you, and the danger now reaches a household that expected protection.'
        : '{{other.name}} returns with evidence that an earlier promise has consequences no one can ignore.'),
    choices: [
      { id: 'protect_people', label: 'Protect the people most exposed', outcome: { text: 'You accept a personal cost to shelter those with the least power.', effects: { faith: 2, boundKinRel: { role: 'other', delta: 4 }, faction: { factionId: 'commons', playerStanding: 3 }, storyVariables: { approach: 'mercy' } }, tone: 'good' } },
      { id: 'secure_truth', label: 'Find proof before acting', outcome: { text: 'You refuse to let urgency make the decision blind.', effects: { wits: 3, legal: { suspicion: -2 }, storyVariables: { approach: 'evidence' } }, tone: 'plain' } },
      { id: 'take_advantage', label: 'Use the crisis to gain influence', outcome: { text: 'The opening is real, as is the resentment it creates.', effects: { reputation: 4, faction: { factionId: 'guilds', playerStanding: 2 }, boundKinRel: { role: 'other', delta: -3 }, storyVariables: { approach: 'advantage' } }, tone: 'plain' } },
    ],
  }));
  const decision: GameEvent = {
    ...common, id: `story_${id}_4`, title: `${title} · THE RECKONING`,
    text: (state) => renderBoundText(state, '{{other.name}} demands a final answer before the matter passes beyond anyone’s control.'),
    choices: [
      { id: 'reconcile', label: 'Build a settlement all sides can survive', outcome: { text: 'No one receives everything, but the settlement may outlive the crisis.', effects: { worldConditions: { publicOrder: 3 }, storyVariables: { resolution: 'reconcile' } }, tone: 'good' } },
      { id: 'hardline', label: 'Choose a side and enforce its victory', outcome: { text: 'The contest ends decisively and creates enemies just as decisively.', effects: { reputation: 5, worldConditions: { publicOrder: -2 }, storyVariables: { resolution: 'hardline' } }, tone: 'plain' } },
    ],
  };
  const endings = (['reconciled', 'hard'] as const).map((ending): GameEvent => ({
    ...common, id: `story_${id}_5_${ending}`, title: ending === 'reconciled' ? `${title} · AN UNEASY PEACE` : `${title} · THE PRICE OF VICTORY`,
    text: ending === 'reconciled' ? 'The settlement holds because every side has something left to protect.' : 'Victory settles the immediate question while planting the next generation’s grievance.',
    choices: [{ id: 'accept_ending', label: 'Let history record the outcome', outcome: { text: 'Swineford will remember both what was saved and what was spent.', effects: { familyReputation: { delta: ending === 'reconciled' ? 3 : 1 }, memory: { tag: 'story_reckoning', weight: 5, note: `The outcome of ${title.toLowerCase()} changed Swineford.` } }, tone: ending === 'reconciled' ? 'good' : 'plain' } }],
  }));
  return [...chapters, decision, ...endings];
});

export const PERSISTENT_WORLD_EVENTS: GameEvent[] = [...BRANCHING_MAJOR_STORY_EVENTS, ...ROLE_STORY_EVENTS, ...RELATIONSHIP_EVENTS, ...DOMAIN_STORY_EVENTS];
