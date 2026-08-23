import { applyActivityDiminishingReturns, captureActivityRewards } from '@/engine/activityVariety';
import { reinforceCareerIdentity } from '@/engine/careerIdentity';
import { promote, tickProgression } from '@/engine/pathProgression';
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

  it('makes clergy work respond to the existing religious world', () => {
    const s = makeState({ age: 24, reputation: 0 });
    s.occupation = { careerId: 'cleric', experience: 30, performance: 60, workedThisYear: 1 };
    s.world.conditions.religiousTension = 70;
    const faithBefore = s.stats.faith;

    reinforceCareerIdentity(s, 'work');

    expect(s.stats.faith).toBe(faithBefore + 1);
    expect(s.reputation).toBe(1);
    expect(s.world.factions.church.playerStanding).toBe(1);
    expect(s.feed.at(-1)?.tag).toBe('A DIVIDED PARISH');

    reinforceCareerIdentity(s, 'work');
    expect(s.world.factions.church.playerStanding).toBe(1); // yearly identity beat, not a spam engine
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

  it('surfaces when the holding is materially helping the climb', () => {
    const s = makeState({ age: 25, rankProgress: 20 });
    s.holding = { ...s.holding, stores: 80, security: 80, loyalty: 80 };
    s.paths = { martial: 0, court: 10, church: 0, labour: 0, outlaw: 0 };

    tickProgression(s);

    const standing = s.feed.findLast((entry) => entry.tag.startsWith('STANDING'));
    expect(standing?.text).toContain('flourishing holding');
    expect(standing?.text).toContain('lifting thy station');
  });

  it('explains a promotion using the life the player actually built', () => {
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
    expect(promotion?.tag).toContain('PROMOTED');
    expect(promotion?.text).toContain('Swineford can argue no longer');
    expect(promotion?.text).toMatch(/holding|wealth|name|court/);
  });
});
