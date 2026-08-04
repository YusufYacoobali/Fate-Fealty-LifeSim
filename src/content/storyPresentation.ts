/**
 * Human-readable faces for the persistent story templates.
 *
 * The templates themselves are generated in bulk (`beat_1`, `beat_4_bold`,
 * `story_rival_2`), which is right for the engine and wrong for the player.
 * This module turns those ids into a title and ONE short line describing where
 * the tale currently stands — a different line for each chapter, so the header
 * tells the player something new every time rather than repeating a premise.
 *
 * The chapter number is deliberately not shown. Knowing a tale is "3 of 6"
 * tells the player how much rope is left, which drains the tension out of it.
 */

import { GameState, StoryInstance } from '@/types/game';
import { STORY_TEMPLATE_BY_ID } from './persistentStories';

export interface StoryPresentation {
  /** Display name of the whole tale. */
  title: string;
  /** One short line per chapter, in order. The last line covers any overrun. */
  beats: string[];
}

const FALLBACK: StoryPresentation = {
  title: 'An Unfinished Tale',
  beats: ['Something begun in an earlier year has come back for an answer.'],
};

export const STORY_PRESENTATION: Record<string, StoryPresentation> = {
  rivals_rise: {
    title: "The Rival's Rise",
    beats: [
      'Someone thy own age has decided to be measured against thee.',
      'They are ahead now, and enjoying it audibly.',
      'A patron is watching which of you is the better bet.',
      'The rivalry has stopped being about pride and started costing.',
      'One of you is about to be finished as a rival.',
      'Whatever is settled here will be told for years.',
    ],
  },
  lean_harvest: {
    title: 'The Lean Harvest',
    beats: [
      'The granaries came up short, and everyone knows it.',
      'Grain has a price now, and it is not paid in coin.',
      'The reeve is counting sacks and looking at neighbours.',
      'Someone must go without, and the choosing has begun.',
      'Hunger has made the village capable of anything.',
      'The winter ends. What thou did in it does not.',
    ],
  },
  disputed_inheritance: {
    title: 'The Disputed Inheritance',
    beats: [
      'A claim has fallen open, and thy kin have begun counting.',
      'Old promises are being remembered very selectively.',
      'A witness could settle it, if a witness could be trusted.',
      'The family has split, and both halves want thee.',
      'The claim will be decided, fairly or otherwise.',
      'The land has an owner. The family has a wound.',
    ],
  },
  war_swineford: {
    title: 'War Comes to Swineford',
    beats: [
      'Banners are moving, and Swineford lies on their road.',
      'The levy is being raised, and names are being taken.',
      'A commander wants something from thee specifically.',
      'The fighting is close enough to hear.',
      'This is the day the war decides what thou art.',
      'The banners move on. Swineford counts what is left.',
    ],
  },
  ambitious_child: {
    title: 'An Ambitious Child',
    beats: [
      'A child of thy house wants more than the house can give.',
      'They have found someone willing to promise it.',
      'The ambition is real now, and it costs money.',
      'They must choose thy road or their own.',
      'What they become is being decided this year.',
      'The child is grown. The choosing is over.',
    ],
  },

  role_commoner: {
    title: 'The Common Round',
    beats: [
      'An ordinary village duty has turned awkward.',
      'Neighbours have taken sides over it.',
      'It has reached someone with authority.',
      'Duty and self-interest have finally parted ways.',
      'The matter closes, one way or the other.',
    ],
  },
  role_artisan_merchant: {
    title: 'The Contested Trade',
    beats: [
      'Thy trade has drawn attention it did not ask for.',
      'A competitor is moving against thee quietly.',
      'The guild has opinions, and they cost.',
      'Undercut, or be undercut.',
      'The trade settles into its new shape.',
    ],
  },
  role_clergy: {
    title: 'The Cure of Souls',
    beats: [
      'The parish asks more of thee than prayer.',
      'A confession has put thee in an impossible place.',
      'The Church and the village want different answers.',
      'Conscience and obedience will not both survive.',
      'Thy answer is given, and remembered.',
    ],
  },
  role_martial: {
    title: "The Soldier's Road",
    beats: [
      'Service under arms is calling in what it is owed.',
      'An order has been given that sits badly.',
      'Thy men are watching what thou do about it.',
      'Obey or refuse — both cost something now.',
      'The road ends where thy choices led it.',
    ],
  },
  role_landed_noble: {
    title: "The Lord's Burden",
    beats: [
      'Thy tenants bring a matter thou cannot delegate.',
      'Mercy and good order are pulling apart.',
      'A neighbouring lord is taking an interest.',
      'Judgement can be delayed no further.',
      'The lands remember how thou ruled them.',
    ],
  },
  role_monarch: {
    title: 'The Weight of the Crown',
    beats: [
      'The realm brings a demand only a sovereign may answer.',
      'The council is divided, and both halves are armed.',
      'A decision made in thy name has gone badly.',
      'The crown must choose, and be seen choosing.',
      'The realm settles. The reign is judged.',
    ],
  },
  role_outlaw: {
    title: "The Outlaw's Reckoning",
    beats: [
      'Life outside the law is presenting its bill.',
      'Someone in the band is talking to someone else.',
      'The law has a name now, and it may be thine.',
      'Run, or finish it.',
      'The reckoning comes due.',
    ],
  },

  friendship_test: {
    title: 'A Friendship Tested',
    beats: [
      'A friendship is asked to carry real weight.',
      'They needed thee, and noticed what thou did.',
      'Others have begun commenting on the friendship.',
      'One of you must give something up for it.',
      'The friendship holds, or it does not.',
    ],
  },
  rival_reckoning: {
    title: 'A Reckoning with a Rival',
    beats: [
      'An old grudge has stopped waiting its turn.',
      'They have moved first, and publicly.',
      'Others are choosing which of you to stand near.',
      'This ends in ruin for one of you.',
      'The reckoning is had.',
    ],
  },
  marriage_strain: {
    title: 'Strain in the Marriage',
    beats: [
      'The marriage has reached the year of unsaid things.',
      'A small resentment has found a name.',
      'The household has noticed, and taken sides.',
      'Mend it now, or stop pretending.',
      'The marriage becomes what it will be.',
    ],
  },
  blood_between_siblings: {
    title: 'Blood Between Siblings',
    beats: [
      'Something between thee and thy sibling is long overdue.',
      'One of you has done well, and it shows.',
      'The parents are being asked to choose.',
      'Blood is not going to be enough this time.',
      'What is left of the bond is settled.',
    ],
  },
  parent_and_child: {
    title: 'Parent and Child',
    beats: [
      'Duty is running in both directions at once.',
      'The younger one wants a life the elder did not plan.',
      'Money, land or pride has entered it.',
      'One generation must yield to the other.',
      'The house finds its new order.',
    ],
  },
  hidden_affair: {
    title: 'The Hidden Affair',
    beats: [
      'A secret of the heart is getting harder to keep.',
      'Someone else has begun to suspect.',
      'The lie now needs other lies to stand up.',
      'It comes out, or thou end it.',
      'The truth arrives, on whosever terms.',
    ],
  },

  pestilence_year: {
    title: 'The Pestilence Year',
    beats: [
      'Sickness is loose in Swineford.',
      'The dying has reached streets thou know.',
      'The parish wants the sick shut away.',
      'Care for them or save thyself.',
      'The pestilence passes. The village does not forget.',
    ],
  },
  charter_swineford: {
    title: 'The Charter of Swineford',
    beats: [
      'The village is bargaining for rights it never held.',
      'The lord has named his price for them.',
      'The commons and the guilds want different charters.',
      'The charter is signed or it is lost.',
      'Swineford lives under what was agreed.',
    ],
  },
  empty_throne: {
    title: 'The Empty Throne',
    beats: [
      'Order is fraying, and rule is an open question.',
      'Armed men are answering to nobody.',
      'Several claimants want thy name on their side.',
      'Back someone, or be counted against all of them.',
      'A throne is filled. The cost is counted.',
    ],
  },
  the_accused: {
    title: 'The Accused',
    beats: [
      'An accusation has been made, and belief matters more than truth.',
      'Witnesses are being found, or made.',
      'The court has taken an interest.',
      'Confess, defend, or run.',
      'The verdict lands.',
    ],
  },
  healers_burden: {
    title: "The Healer's Burden",
    beats: [
      'More need tending than one pair of hands can tend.',
      'A remedy has failed, and someone blames thee.',
      'The apothecary and the priest disagree loudly.',
      'Thou must choose who gets the last of it.',
      'The sick recover or they do not.',
    ],
  },
  ashes_household: {
    title: 'Ashes in the Household',
    beats: [
      'A loss in the household is forcing everyone to choose.',
      'The grief has turned into an argument about property.',
      'Someone has left, or is threatening to.',
      'The household breaks or is rebuilt.',
      'What remains of the family settles.',
    ],
  },
  divided_parish: {
    title: 'The Divided Parish',
    beats: [
      'The parish has split over matters of faith.',
      'Neutrality is being noticed and resented.',
      'The Church has sent someone to look into it.',
      'Stand with one side, or be counted with neither.',
      'The parish reassembles, minus a few.',
    ],
  },
  guild_election: {
    title: 'The Guild Election',
    beats: [
      'The guild is choosing its next voice.',
      'Votes are being bought in the usual way.',
      'A candidate wants thy support and will pay for it.',
      'The vote is called.',
      'The guild has a master. Debts are collected.',
    ],
  },
  royal_bastard: {
    title: 'The Royal Bastard',
    beats: [
      'A dangerous piece of royal parentage is within reach.',
      'Others know, and are moving faster.',
      'Protecting the secret is becoming expensive.',
      'Reveal it, sell it, or bury it.',
      'The blood is claimed, or it is not.',
    ],
  },
  relic_hunter: {
    title: 'The Relic Hunter',
    beats: [
      'A relic is worth more than most lives around it.',
      'Its provenance is not surviving inspection.',
      'Pilgrims and profiteers have both arrived.',
      'Authenticate it, or expose it.',
      'The relic finds its final owner.',
    ],
  },
  secret_brotherhood: {
    title: 'The Secret Brotherhood',
    beats: [
      'A society that does not advertise has noticed thee.',
      'The first favour has been asked.',
      'The second favour is not one thou can refuse cleanly.',
      'Join fully, or get out while there is a way out.',
      'The brotherhood keeps or discards thee.',
    ],
  },
};

export function storyPresentation(templateId: string): StoryPresentation {
  return STORY_PRESENTATION[templateId] ?? FALLBACK;
}

/** 1-based chapter index derived from the generated `beat_N[_branch]` ids. */
export function storyChapterIndex(beatId: string): number {
  return Number(/beat_(\d+)/.exec(beatId)?.[1] ?? 1);
}

/** How many chapters the template can run to. Used for pacing, not for display. */
export function storyChapterCount(templateId: string): number {
  const template = STORY_TEMPLATE_BY_ID[templateId];
  if (!template) return 1;
  return Object.keys(template.beats).reduce((highest, id) => Math.max(highest, storyChapterIndex(id)), 1);
}

/**
 * The one short line shown under an event title. Distinct per chapter, so the
 * header advances with the tale instead of restating the premise.
 */
export function storyBeatLine(templateId: string, beatId: string): string {
  const { beats } = storyPresentation(templateId);
  const index = Math.max(1, storyChapterIndex(beatId));
  return beats[Math.min(index, beats.length) - 1];
}

/** Whether this is the opening chapter, which the header marks as a beginning. */
export function isOpeningChapter(beatId: string): boolean {
  return storyChapterIndex(beatId) <= 1;
}

/** The named cast currently bound to the tale, as a readable list. */
export function storyCast(state: GameState, story: StoryInstance): string {
  const names = Object.values(story.bindings)
    .map((id) => state.world.characters[id]?.name)
    .filter((name): name is string => Boolean(name));
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}
