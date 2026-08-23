import {
  applyActivityDiminishingReturns,
  captureActivityRewards,
  MAX_ROUTINE_ACTIVITY_USES,
  routineActivityAvailable,
} from '@/engine/activityVariety';
import { captureCareerActionRewards, reinforceCareerIdentity } from '@/engine/careerIdentity';
import { promote, standingContributions, tickProgression } from '@/engine/pathProgression';
import { gameReducer } from '@/state/gameReducer';
import { makeState } from './helpers';

describe('existing-system polish', () => {
  it('diminishes repeated routine rewards after two uses without softening costs', () => {
    const s = makeState({ age: 20, gold: 20 });

    const gain = () => {
      const before = captureActivityRewards(s);
      s.gold += 8;
      s.income += 8;
      s.stats.wits += 8;
      applyActivityDiminishingReturns(s, 'train', before);
    };

    gain();
    expect(s.gold).toBe(28);
    expect(s.stats.wits).toBe(58);
    gain();
    expect(s.gold).toBe(36);
    expect(s.stats.wits).toBe(66);
    gain();
    expect(s.gold).toBe(42); // third use keeps 75% of the positive gain
    expect(s.stats.wits).toBe(72);

    const beforeCost = captureActivityRewards(s);
    s.gold -= 4;
    s.stats.health -= 6;
    applyActivityDiminishingReturns(s, 'train', beforeCost);
    expect(s.gold).toBe(38);
    expect(s.stats.health).toBe(54);
  });

  it('diminishes connected rewards too and exhausts one routine after five uses', () => {
    const s = makeState({ age: 20 });
    const child = s.world.characters.elswyth;
    const relationship = Object.values(s.world.relationships).find((item) => item.aId === s.playerCharacterId && item.bId === child.id)!;
    s.playerRun.roleProgress.commoner = 0;
    s.world.factions.commons.playerStanding = 0;

    const gain = () => {
      const before = captureActivityRewards(s);
      s.playerRun.roleProgress.commoner = (s.playerRun.roleProgress.commoner ?? 0) + 8;
      s.world.factions.commons.playerStanding += 4;
      child.stats.wits += 4;
      child.childDevelopment!.investment += 8;
      relationship.aToB.affinity += 8;
      applyActivityDiminishingReturns(s, 'village_service', before);
    };

    gain();
    gain();
    const beforeThirdRole = s.playerRun.roleProgress.commoner ?? 0;
    const beforeThirdFaction = s.world.factions.commons.playerStanding;
    const beforeThirdWits = child.stats.wits;
    const beforeThirdInvestment = child.childDevelopment!.investment;
    const beforeThirdAffinity = relationship.aToB.affinity;
    gain();

    expect((s.playerRun.roleProgress.commoner ?? 0) - beforeThirdRole).toBe(6);
    expect(s.world.factions.commons.playerStanding - beforeThirdFaction).toBe(3);
    expect(child.stats.wits - beforeThirdWits).toBe(3);
    expect(child.childDevelopment!.investment - beforeThirdInvestment).toBe(6);
    expect(relationship.aToB.affinity - beforeThirdAffinity).toBe(6);

    gain();
    gain();
    expect(s.world.repetitionLedger['activity-year:20:village_service']).toBe(MAX_ROUTINE_ACTIVITY_USES);
    expect(routineActivityAvailable(s, 'village_service')).toBe(false);
  });

  it('checks ambitions after diminished rewards, not before', () => {
    const s = makeState({ age: 20 });
    s.goalId = 'scholar';
    s.goalDone = false;
    s.stats.wits = 80;
    s.world.repetitionLedger['activity-year:20:train'] = 2;

    const after = gameReducer(s, { type: 'DO_ACTIVITY', id: 'train' });

    expect(after.stats.wits).toBe(84); // +5 becomes +4 on the third identical use
    expect(after.goalId).toBe('scholar');
    expect(after.tags).not.toContain('goal_done_scholar');
  });

  it('makes clergy work respond to the existing religious world', () => {
    const s = makeState({ age: 24, reputation: 0 });
    s.occupation = { careerId: 'cleric', experience: 30, performance: 60, workedThisYear: 1 };
    s.world.conditions.religiousTension = 70;
    const faithBefore = s.stats.faith;
    const before = captureCareerActionRewards(s);
    s.gold += 8;
    s.income += 8;
    s.occupation.performance += 2;

    reinforceCareerIdentity(s, 'work', before);

    expect(s.stats.faith).toBe(faithBefore + 1);
    expect(s.reputation).toBe(1);
    expect(s.world.factions.church.playerStanding).toBe(1);
    expect(s.occupation.performance).toBeGreaterThan(62);
    expect(s.feed.at(-1)?.tag).toBe('A DIVIDED PARISH');

    const secondBefore = captureCareerActionRewards(s);
    s.gold += 8;
    s.income += 8;
    reinforceCareerIdentity(s, 'work', secondBefore);
    expect(s.world.factions.church.playerStanding).toBe(1); // yearly identity beat, not a spam engine
  });

  it('makes the same trade pay very differently in a strong or weak market', () => {
    const strong = makeState({ age: 28, gold: 20 });
    strong.occupation = { careerId: 'trader', experience: 40, performance: 60, workedThisYear: 1, guildStanding: 80 };
    strong.world.conditions.prosperity = 80;
    strong.world.factions.guilds.playerStanding = 40;
    const strongBefore = captureCareerActionRewards(strong);
    strong.gold += 10;
    strong.income += 10;
    strong.occupation.performance += 2;
    reinforceCareerIdentity(strong, 'work', strongBefore);

    const weak = makeState({ age: 28, gold: 20 });
    weak.occupation = { careerId: 'trader', experience: 40, performance: 60, workedThisYear: 1, guildStanding: 5 };
    weak.world.conditions.prosperity = 20;
    weak.world.factions.guilds.playerStanding = -40;
    const weakBefore = captureCareerActionRewards(weak);
    weak.gold += 10;
    weak.income += 10;
    weak.occupation.performance += 2;
    reinforceCareerIdentity(weak, 'work', weakBefore);

    expect(strong.gold - 20).toBeGreaterThan(weak.gold - 20);
    expect(strong.occupation.performance).toBeGreaterThan(weak.occupation.performance);
  });

  it('makes career training reinforce the profession instead of only generic wits', () => {
    const s = makeState({ age: 22 });
    s.occupation = { careerId: 'guard', experience: 20, performance: 55, workedThisYear: 0 };
    const healthBefore = s.stats.health;

    reinforceCareerIdentity(s, 'train');
    reinforceCareerIdentity(s, 'train');
    reinforceCareerIdentity(s, 'train');

    expect(s.stats.health).toBe(healthBefore + 2);
  });

  it('does not let a regent-run childhood holding raise standing before age six', () => {
    const child = makeState({ age: 5 });
    child.holding = { ...child.holding, stores: 90, security: 90, loyalty: 90 };

    expect(standingContributions(child).some((item) => item.label.includes('holding'))).toBe(false);

    child.age = 6;
    expect(standingContributions(child).some((item) => item.label === 'a flourishing holding')).toBe(true);
  });

  it('surfaces when the holding is materially helping the climb', () => {
    const s = makeState({ age: 25, rankProgress: 20 });
    s.holding = { ...s.holding, stores: 80, security: 80, loyalty: 80 };
    s.paths = { martial: 0, court: 10, church: 0, labour: 0, outlaw: 0 };

    tickProgression(s);

    const standing = [...s.feed].reverse().find((entry) => entry.tag.startsWith('STANDING'));
    expect(standing?.text).toContain('flourishing holding');
    expect(standing?.text).toContain('lifting thy station');
  });

  it('still explains a strong holding when its effect is cancelled by other pressures', () => {
    const s = makeState({ age: 25, rankProgress: 20, gold: 20 });
    s.paths = { martial: 0, court: 0, church: 0, labour: 10, outlaw: 0 };
    s.holding = { ...s.holding, stores: 80, security: 80, loyalty: 80 };
    s.debts = [{ id: 'large_debt', principal: 60, interestRate: 0.1 }];

    tickProgression(s);

    const standing = s.feed.at(-1);
    expect(standing?.tag).toBe('STANDING ↔');
    expect(standing?.text).toContain('flourishing holding');
  });

  it('stores the real promotion rationale for both feed and celebration UI', () => {
    const s = makeState({
      age: 20,
      gold: 220,
      rankProgress: 100,
      reputation: 65,
      stats: { health: 70, charm: 75, wits: 70, faith: 50 },
    });
    s.holding = { ...s.holding, stores: 80, security: 80, loyalty: 80 };
    s.paths = { martial: 0, court: 20, church: 0, labour: 0, outlaw: 0 };

    expect(promote(s)).toBe(true);
    const promotion = s.feed.at(-1);
    const memory = s.memories.at(-1);
    expect(promotion?.tag).toContain('PROMOTED');
    expect(promotion?.text).toContain('Swineford can argue no longer');
    expect(promotion?.text).toMatch(/holding|wealth|name|court/);
    expect(memory?.tag).toBe('promoted_squire');
    expect(memory?.note).toMatch(/holding|wealth|name|court/);
  });
});
