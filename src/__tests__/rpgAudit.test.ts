import { createLife, syncPlayerToWorld } from '@/engine/gameState';
import { gameReducer } from '@/state/gameReducer';
import { normalizeGameState } from '@/state/persistence';
import { branchRequirement, chooseMission, contractPreview, missionDefinition, missionEvent, refreshWorkBoard } from '@/engine/rpgEngine';
import { BRANCH_MILESTONES, MASTERY_TITLES } from '@/data/rpg';
import { resolveCombatTiming, selectCombatMove, startDuel } from '@/engine/duelEngine';
import { resetRandomSource, setRandomSource } from '@/engine/random';
import { skillsOf } from '@/engine/rpgProgress';
import { performCareerAction } from '@/engine/careerEngine';
import { SkillId } from '@/types/rpg';
import { GameState } from '@/types/game';

function ready() {
  const s = createLife({ worldSeed: 96542 });
  s.age = 30; s.world.currentYear = s.bornYear + 30; s.gold = 200;
  s.stats = { health: 100, charm: 75, wits: 75, faith: 75 };
  s.rpg.materials = { timber: 30, stone: 30, iron: 30, herbs: 30 };
  syncPlayerToWorld(s); refreshWorkBoard(s); return s;
}
function choose(s: GameState, optionId = 'safe') {
  return gameReducer(s, { type: 'MISSION_CHOOSE', missionId: s.rpg.mission!.id, optionId });
}
function contract(s: GameState, templateId: string) {
  s.rpg.board.offers = [{ id: 'audit-offer', templateId, clientId: 'aldric', attempted: false }];
  return gameReducer(s, { type: 'RPG', command: { kind: 'contract', id: 'audit-offer' } });
}
afterEach(resetRandomSource);

describe('RPG acceptance audit regressions', () => {
  it('previews the actual contextual contract options without spending or rerolling', () => {
    const s = ready(); s.world.characters.aldric.rel = 80;
    s.world.conditions.diseasePressure = 80;
    const offer = { id: 'preview', templateId: 'fever_remedy', clientId: 'aldric', attempted: false };
    const before = JSON.stringify(s);
    const lines = contractPreview(s, offer);
    expect(JSON.stringify(s)).toBe(before);
    expect(lines.join(' ')).toContain('established trust');
    expect(lines.join(' ')).toContain('emergency relief');
    expect(lines.join(' ')).toContain('Scholarship 3');
    expect(lines.join(' ')).toContain('1 healing salve');
    expect(lines.join(' ')).toContain('failure:');
    s.rpg.board.offers = [offer];
    const opened = gameReducer(s, { type: 'RPG', command: { kind: 'contract', id: offer.id } });
    expect(missionEvent(opened)!.choices).toHaveLength(lines.length);
  });

  it.each([true, false])('carries early caravan check results into its saved final return (%s)', (success) => {
    let s = gameReducer(ready(), { type: 'RPG', command: { kind: 'caravan' } });
    setRandomSource({ next: () => success ? 0 : 0.999 });
    for (let stage = 0; stage < 2; stage++) chooseMission(s, s.rpg.mission!.id, 'skilled');
    expect(s.gold).toBe(192);
    s = normalizeGameState(JSON.parse(JSON.stringify(s)));
    expect(s.rpg.mission!.results).toEqual([success, success]);
    expect(missionDefinition(s)!.options[0].effects.gold).toBe(success ? 16 : 7);
    s = choose(s);
    expect(s.gold).toBe(success ? 208 : 199);
    expect(skillsOf(s).scholarship.xp).toBe(success ? 10 : 5);
    expect(s.actionClock.used).toBe(1);
  });

  it('makes caravan provisions unlock a buyer and consumes the goods once', () => {
    let s = ready(); s.rpg.goods.provisions = 1;
    s = gameReducer(s, { type: 'RPG', command: { kind: 'caravan' } }); s = choose(s);
    const input = { type: 'MISSION_CHOOSE' as const, missionId: s.rpg.mission!.id, optionId: 'deliver' };
    s = gameReducer(s, input); s = gameReducer(s, input);
    expect(s.rpg.goods.provisions).toBe(0);
    expect(missionDefinition(s)!.options.find((o) => o.id === 'community')?.effects.gold).toBe(16);
    s = choose(s, 'community'); expect(s.gold).toBe(208);
  });

  it('preserves the return of an older v5 caravan without recorded check results', () => {
    let s = gameReducer(ready(), { type: 'RPG', command: { kind: 'caravan' } });
    s = choose(s); s = choose(s);
    s.rpg.mission!.choices = ['skilled', 'skilled']; delete s.rpg.mission!.results;
    s = normalizeGameState(JSON.parse(JSON.stringify(s)));
    expect(missionDefinition(s)!.options[0].effects.gold).toBe(11);
  });

  it.each([['mercenary', 'guard', 'watch_duty', 'harvest_help'], ['caravan', 'trader', 'broken_cart', 'stray_sheep'], ['court', 'clerk', 'sealed_letter', 'quiet_package']] as const)('requires relevant work for the %s milestones', (branch, career, relevant, unrelated) => {
    let s = ready(); s.occupation.careerId = career; syncPlayerToWorld(s);
    s = choose(contract(s, unrelated)); expect(s.rpg.branches[branch].assignments).toBe(0);
    s = gameReducer(s, { type: 'RPG', command: { kind: 'career', id: branch } }); s = choose(s);
    const skill: SkillId = branch === 'mercenary' ? 'arms' : 'scholarship';
    skillsOf(s)[skill].level = 6;
    expect(branchRequirement(s, branch)).toContain('2 relevant assignments');
    s = choose(contract(s, relevant));
    s.world.factions[branch === 'caravan' ? 'guilds' : 'crown'].playerStanding = 10;
    expect(branchRequirement(s, branch)).toBeNull();
    s = gameReducer(s, { type: 'RPG', command: { kind: 'career', id: branch } }); s = choose(s);
    expect(s.rpg.branches[branch].chapter).toBe(2);
    expect(branchRequirement(s, branch)).toContain('4 relevant assignments');
    s = choose(contract(s, relevant));
    s = gameReducer(s, { type: 'RPG', command: { kind: 'career', id: branch } }); s = choose(s);
    expect(s.rpg.branches[branch].chapter).toBe(3);
    expect(s.feed.some((f) => f.text.includes(BRANCH_MILESTONES[branch][2]))).toBe(true);
    expect(gameReducer(s, { type: 'AGE_UP' }).age).toBe(s.age + 1);
  });

  it('gives each skill a distinct profession capstone and persistent mastery title', () => {
    const titles = new Set<string>();
    for (const skill of Object.keys(MASTERY_TITLES) as SkillId[]) {
      let s = ready(); skillsOf(s)[skill].level = 10;
      s = gameReducer(s, { type: 'RPG', command: { kind: 'mastery', id: skill } });
      titles.add(missionDefinition(s)!.title);
      expect(missionDefinition(s)!.text).toContain(MASTERY_TITLES[skill]);
      setRandomSource({ next: () => 0 }); chooseMission(s, s.rpg.mission!.id, 'master');
      s = normalizeGameState(JSON.parse(JSON.stringify(s)));
      expect(skillsOf(s)[skill].mastered).toBe(true);
      expect(s.tags).toContain(`master_${skill}`);
    }
    expect(titles.size).toBe(4);
  });

  it('awards half XP on a poor paid working day even when some wages are earned', () => {
    const s = ready(); s.occupation.careerId = 'trader';
    const draws = [0.5, 0, 0.99]; setRandomSource({ next: () => draws.shift() ?? 0.5 });
    performCareerAction(s, 'work');
    expect(s.gold).toBeGreaterThan(200);
    expect(skillsOf(s).scholarship.xp).toBe(3);
  });

  it('makes an exhausted opponent recover instead of attacking with empty stamina', () => {
    let s = ready(); startDuel(s, 'roderick', 'brawl');
    const c = s.duel!.combat!; c.phase = 'attack'; c.opponentStamina = 0;
    selectCombatMove(s, c.sequence, 'recover');
    expect(c.opponentStamina).toBe(40); expect(c.phase).toBe('attack'); expect(c.exposed).toBe(true);
    expect(s.duel!.round).toBe(2);
    s = normalizeGameState(JSON.parse(JSON.stringify(s)));
    expect(s.duel!.combat!.phase).toBe('attack');
    selectCombatMove(s, s.duel!.combat!.sequence, 'quick');
    resolveCombatTiming(s, s.duel!.combat!.sequence, 100);
    expect(s.duel!.playerVigour).toBe(100);
  });

  it('preserves veteran adaptation and the committed threat through reload', () => {
    let s = ready(); startDuel(s, 'roderick', 'brawl');
    const c = s.duel!.combat!; c.archetype = 'veteran'; c.phase = 'attack'; c.defence = 'parry';
    s.duel!.moveId = 'high_swing'; setRandomSource({ next: () => 0 });
    selectCombatMove(s, c.sequence, 'recover');
    expect(s.duel!.moveId).toBe('grapple');
    s = normalizeGameState(JSON.parse(JSON.stringify(s)));
    expect(s.duel!.moveId).toBe('grapple');
  });
});
