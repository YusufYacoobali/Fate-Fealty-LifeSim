import { createLife, syncPlayerToWorld } from '@/engine/gameState';
import { gameReducer } from '@/state/gameReducer';
import { eventById } from '@/engine/eventPicker';
import { professionalClientContext } from '@/engine/professionalClients';
import { beginPatientCare, provideMedicalCare, reviewPatientCare } from '@/engine/medicalPractice';
import { professionalRecord, tickProfessionalStanding } from '@/engine/careerSpecializationEngine';
import { normalizeGameState } from '@/state/persistence';
import { careerById } from '@/data/careers';
import { spawnKin } from '@/engine/kinFactory';
import { worldIntegrityIssues } from '@/engine/worldIntegrity';
import { runWithWorldRng } from '@/engine/random';

function clinic(seed = 301) {
  const s = createLife({ worldSeed: seed,birthOrigin: 'peasant' });
  s.age = 35; s.gold = 100; s.stats.wits = 90;
  s.occupation = { careerId: 'herb_gatherer',experience: 150,performance: 80,workedThisYear: 0 };
  s.world.characters[s.playerCharacterId].skills!.scholarship.level = 5;
  for (const c of Object.values(s.world.characters)) { c.stats.health = 90; c.healthConditions = []; }
  return s;
}
function ill(s: ReturnType<typeof clinic>, id: string, health = 35) {
  const p = s.world.characters[id]; p.stats.health = health;
  p.healthConditions = [{ id: `fever_${id}`,conditionId: 'winter_fever',kind: 'illness',severity: 40,diagnosed: false,startedYear: s.world.currentYear,nextReviewYear: s.world.currentYear + 1 }];
  return p;
}
function choose(s: ReturnType<typeof clinic>, method = 0) { return gameReducer(s,{ type: 'CHOOSE',choice: eventById(s.pendingEvent!.eventId)!.choices[method] }); }

test('a named patient can be selected and reloaded without extra costs, RNG draws or preview rewards', () => {
  let s = clinic(); ill(s,'edwin'); ill(s,'elswyth');
  s = gameReducer(s,{ type: 'CAREER_ACTION',action: 'specialize',careerId: 'diagnose_patient' });
  const context = professionalClientContext(s)!;
  expect(context.people.map(p => p.id)).toEqual(expect.arrayContaining(['edwin','elswyth']));
  expect(context.people.some(p => p.id === 'beatrice')).toBe(false);
  const target = context.matter.actorId === 'edwin' ? 'elswyth' : 'edwin';
  const before = { rng: s.world.rngState,gold: s.gold,clock: s.actionClock.used,nextId: s.nextId,feed: s.feed.length,contacts: [...context.record.contactIds] };
  s = gameReducer(s,{ type: 'PROFESSIONAL_CLIENT',characterId: target });
  expect(s.world.rngState).toEqual(before.rng); expect(s.gold).toBe(before.gold);
  expect(s.actionClock.used).toBe(before.clock); expect(s.nextId).toBe(before.nextId); expect(s.feed).toHaveLength(before.feed);
  expect(professionalClientContext(s)!.record.contactIds).toEqual(before.contacts);
  syncPlayerToWorld(s); s = normalizeGameState(JSON.parse(JSON.stringify(s)));
  expect(s.pendingEvent!.bindings!.client).toBe(target); expect(professionalClientContext(s)!.matter.actorId).toBe(target);
  s = choose(s);
  const r = s.world.characters[s.playerCharacterId].professionalHistory!.medicine!;
  expect(r.contactIds).toContain(target); expect(r.matters[0].actorId).toBe(target);
  expect(s.actionClock.used).toBe(before.clock);
  expect(gameReducer(s,{ type: 'PROFESSIONAL_CLIENT',characterId: 'beatrice' })).toBe(s);
});
test('ill children are real patients and healthy consultations never fabricate a condition', () => {
  let s = clinic(); ill(s,'elswyth');
  s = gameReducer(s,{ type: 'CAREER_ACTION',action: 'specialize',careerId: 'diagnose_patient' });
  expect(professionalClientContext(s)!.selected.id).toBe('elswyth');
  s = clinic(); s = gameReducer(s,{ type: 'CAREER_ACTION',action: 'specialize',careerId: 'diagnose_patient' });
  const id = professionalClientContext(s)!.selected.id, health = s.world.characters[id].stats.health;
  s = choose(s); expect(s.world.characters[id].stats.health).toBe(health); expect(s.world.characters[id].healthConditions).toEqual([]);
});
test('trading partners must be eligible adults and the chosen counterparty owns the actual payment', () => {
  let s = clinic(); s.occupation.careerId = 'trader';
  s.world.characters.edwin.occupation.careerId = 'trader'; s.world.characters.edwin.age = 30; s.world.characters.edwin.gold = 30;
  s.world.characters.elswyth.occupation.careerId = 'trader'; s.world.characters.elswyth.age = 9;
  s = gameReducer(s,{ type: 'CAREER_ACTION',action: 'specialize',careerId: 'negotiate_deal' });
  expect(professionalClientContext(s)!.people.some(c => c.id === 'elswyth')).toBe(false);
  const before = s.gold; s.world.characters.edwin.legalState!.status = 'imprisoned';
  expect(gameReducer(s,{ type: 'PROFESSIONAL_CLIENT',characterId: 'edwin' })).toBe(s);
  s.world.characters.edwin.legalState!.status = 'free'; s = gameReducer(s,{ type: 'PROFESSIONAL_CLIENT',characterId: 'edwin' });
  s = choose(s); const success = s.world.characters[s.playerCharacterId].professionalHistory!.trade!.matters[0].success;
  expect(s.world.characters.edwin.gold).toBe(success ? 25 : 30); expect(s.gold).toBe(before + (success ? 5 : 0)); expect(s.actionClock.used).toBe(1);
});
test('second opinions pay a qualified named adult physician and do not give the player their credentials', () => {
  let s = clinic(); ill(s,'edwin');
  const adviser = s.world.characters.beatrice; adviser.occupation.careerId = 'physician'; adviser.age = 38; adviser.gold = 20;
  professionalRecord(s.world.characters[s.playerCharacterId],'medicine').adviserId = adviser.id;
  s = gameReducer(s,{ type: 'CAREER_ACTION',action: 'specialize',careerId: 'treat_household' });
  const gold = s.gold, qualifications = [...s.world.characters[s.playerCharacterId].education!.qualifications];
  s = choose(s,2); const r = s.world.characters[s.playerCharacterId].professionalHistory!.medicine!;
  expect(r.adviserId).toBe(adviser.id); expect(careerById(s.world.characters[adviser.id].occupation.careerId)!.family).toBe('medicine');
  expect(s.world.characters[adviser.id].gold).toBe(22); expect(s.gold).toBe(gold - 2);
  expect(s.world.characters[s.playerCharacterId].education!.qualifications).toEqual(qualifications);
  expect(r.patientCare![0].adviserId).toBe(adviser.id); expect(s.actionClock.used).toBe(1);
});
test('actual recovery is reviewed once after a reload and a career change', () => {
  let s = clinic(); const patient = ill(s,'edwin',60);
  patient.healthConditions![0].severity = 10;
  const r = professionalRecord(s.world.characters[s.playerCharacterId],'medicine');
  r.lastWorkedYear = s.world.currentYear; r.reputation = 10;
  beginPatientCare(s,r,patient,true); provideMedicalCare(patient,9);
  expect(patient.healthConditions).toEqual([]); expect(patient.stats.health).toBe(69);
  syncPlayerToWorld(s); s = normalizeGameState(JSON.parse(JSON.stringify(s)));
  s.occupation.careerId = 'trader'; s.world.currentYear++;
  const record = s.world.characters[s.playerCharacterId].professionalHistory!.medicine!;
  runWithWorldRng(s.world,() => tickProfessionalStanding(s));
  expect(record.patientCare![0].status).toBe('recovered'); expect(record.reputation).toBe(14);
  const feed = s.feed.length, gold = s.gold, rng = JSON.stringify(s.world.rngState);
  reviewPatientCare(s,record); expect(record.reputation).toBe(14); expect(s.feed).toHaveLength(feed); expect(s.gold).toBe(gold); expect(JSON.stringify(s.world.rngState)).toBe(rng);
  expect(worldIntegrityIssues(s)).toEqual([]);
});
test('supportive care can ease pain and heal an injury without curing a permanent disability', () => {
  const s = clinic(), patient = ill(s,'edwin',55);
  patient.healthConditions = [
    { ...patient.healthConditions![0],id: 'sight',conditionId: 'failing_sight',kind: 'disability',severity: 30 },
    { ...patient.healthConditions![0],id: 'pain',conditionId: 'chronic_pain',kind: 'disability',severity: 20 },
    { ...patient.healthConditions![0],id: 'bone',conditionId: 'broken_bone',kind: 'injury',severity: 10 },
  ];
  const r = professionalRecord(s.world.characters[s.playerCharacterId],'medicine'); beginPatientCare(s,r,patient,true);
  provideMedicalCare(patient,9); expect(patient.healthConditions.map(c => c.id)).toEqual(['sight','pain']);
  expect(patient.healthConditions.find(c => c.id === 'sight')!.severity).toBe(30); expect(patient.healthConditions.find(c => c.id === 'pain')!.severity).toBe(16);
  s.world.currentYear++; reviewPatientCare(s,r); expect(r.patientCare![0].status).toBe('improved');
});
test('a death is reported without manufacturing malpractice or awarding a recovery', () => {
  const s = clinic(), patient = ill(s,'edwin'), r = professionalRecord(s.world.characters[s.playerCharacterId],'medicine'); r.reputation = 20;
  beginPatientCare(s,r,patient,true); patient.alive = false; patient.deathYear = s.world.currentYear;
  s.world.currentYear++; reviewPatientCare(s,r);
  expect(r.patientCare![0].status).toBe('deceased'); expect(r.reputation).toBe(20);
  expect(s.world.characters[s.playerCharacterId].legalState!.charges).toEqual([]);
});
test('an heir inherits open patient records without receiving the deceased clinician’s recovery reward', () => {
  let s = clinic(); const patient = ill(s,'edwin'), parentId = s.playerCharacterId;
  const r = professionalRecord(s.world.characters[parentId],'medicine'); r.reputation = 20; beginPatientCare(s,r,patient,true);
  const heir = spawnKin(s,{ kind: 'child',age: 18 }); s.dead = true;
  s = gameReducer(s,{ type: 'CONTINUE_AS_HEIR',heirId: heir.id,lifetimeUnlocked: false });
  const inherited = s.world.characters[heir.id].professionalHistory!.medicine!;
  expect(inherited.patientCare![0].clinicianId).toBe(parentId); expect(inherited.reputation).toBe(10);
  s.world.characters[patient.id].healthConditions = []; s.world.characters[patient.id].stats.health = 90; s.world.currentYear++;
  reviewPatientCare(s,inherited); expect(inherited.patientCare![0].status).toBe('recovered'); expect(inherited.reputation).toBe(10);
  expect(s.world.characters[parentId].professionalHistory!.medicine!.patientCare![0].status).toBe('awaiting_review');
  expect(worldIntegrityIssues(s)).toEqual([]);
});
test('retaining a new consulting physician creates a qualified canonical person instead of borrowing patient competence', () => {
  let s = clinic(); ill(s,'edwin');
  for (const c of Object.values(s.world.characters)) if (c.id !== s.playerCharacterId && careerById(c.occupation.careerId)?.family === 'medicine') c.occupation.careerId = 'farmhand';
  s = gameReducer(s,{ type: 'CAREER_ACTION',action: 'specialize',careerId: 'treat_household' });
  const ids = new Set(Object.keys(s.world.characters)); s = choose(s,2);
  const adviser = s.world.characters[s.world.characters[s.playerCharacterId].professionalHistory!.medicine!.adviserId!];
  expect(ids.has(adviser.id)).toBe(false); expect(adviser.age).toBeGreaterThanOrEqual(18);
  expect(adviser.education!.qualifications).toContain('clerical_learning'); expect(adviser.skills!.scholarship.level).toBeGreaterThanOrEqual(4);
  expect(s.feed.some(f => f.text.includes(`consulted ${adviser.name}`))).toBe(true);
  expect(worldIntegrityIssues(s)).toEqual([]);
});
test('reckless harm to a noble patient produces a real legal complaint and a persistent family grievance', () => {
  let checked = false;
  for (let seed = 1; seed <= 20; seed++) {
    let s = clinic(seed); s.stats.wits = 10; s.world.characters[s.playerCharacterId].skills!.scholarship.level = 1; s.occupation.experience = 0;
    const patient = ill(s,'beatrice'); patient.rankIdx = 3;
    s = gameReducer(s,{ type: 'CAREER_ACTION',action: 'specialize',careerId: 'treat_household' }); s = choose(s,1);
    if (s.world.characters[s.playerCharacterId].professionalHistory!.medicine!.matters[0].success) continue;
    const own = s.world.families[s.world.characters[s.playerCharacterId].birthFamilyId!], other = s.world.families[patient.birthFamilyId!];
    expect(own.enemyFamilyIds).toContain(other.id); expect(other.enemyFamilyIds).toContain(own.id);
    expect(other.inheritedMemories.some(m => m.type === 'medical_grievance' && m.summary.includes(patient.name))).toBe(true);
    expect(s.world.characters[s.playerCharacterId].legalState!.charges.some(c => c.offence === 'harmful treatment' && c.victimIds.includes(patient.id))).toBe(true);
    checked = true; break;
  }
  expect(checked).toBe(true);
});
test('an inherited Premium commission cannot yield free rewards after access expires', () => {
  let s = clinic(); s.occupation.careerId = 'trade_magnate'; s.lifetimeUnlocked = true;
  s = gameReducer(s,{ type: 'CAREER_ACTION',action: 'specialize',careerId: 'negotiate_deal' });
  const heir = spawnKin(s,{ kind: 'child',age: 18 }); s.dead = true;
  s = gameReducer(s,{ type: 'CONTINUE_AS_HEIR',heirId: heir.id,lifetimeUnlocked: false });
  const r = s.world.characters[heir.id].professionalHistory!.trade!, matter = r.matters[0];
  expect(matter.requiredPremium).toBe(true);
  s.pendingEvent = { eventId: 'practice_negotiate_deal',bindings: { client: matter.actorId } };
  expect(professionalClientContext(s)).toBeUndefined();
  const gold = s.gold, rep = r.reputation;
  s = choose(s);
  expect(s.gold).toBe(gold); expect(s.world.characters[heir.id].professionalHistory!.trade!.reputation).toBe(rep);
  expect(s.world.characters[heir.id].professionalHistory!.trade!.matters[0].resolved).toBe(true);
});
test('a new illness prevents a full-recovery claim and a serious health decline takes precedence over resolved old symptoms', () => {
  for (const health of [80,15]) {
    const s = clinic(), patient = ill(s,'edwin'), r = professionalRecord(s.world.characters[s.playerCharacterId],'medicine'); r.reputation = 10;
    beginPatientCare(s,r,patient,true);
    patient.stats.health = health; patient.healthConditions = [{ ...patient.healthConditions![0],id: 'new_pox',conditionId: 'pox',severity: 30 }];
    s.world.currentYear++; reviewPatientCare(s,r);
    expect(r.patientCare![0].status).toBe(health === 15 ? 'declined' : 'improved');
    expect(r.reputation).toBe(health === 15 ? 10 : 12);
    expect(s.feed.at(-1)!.text).toContain('other active condition(s) need examination');
  }
});
test('the annual review allowance survives reload and deferred patients are handled the following year', () => {
  let s = clinic(); const r = professionalRecord(s.world.characters[s.playerCharacterId],'medicine');
  for (const id of ['edwin','beatrice','joan']) { const p = ill(s,id); beginPatientCare(s,r,p,true); provideMedicalCare(p,30); }
  s.world.currentYear++; reviewPatientCare(s,r);
  expect(r.patientCare!.filter(c => c.status === 'recovered')).toHaveLength(2);
  syncPlayerToWorld(s); s = normalizeGameState(JSON.parse(JSON.stringify(s)));
  const saved = s.world.characters[s.playerCharacterId].professionalHistory!.medicine!;
  const before = JSON.stringify(saved); reviewPatientCare(s,saved); expect(JSON.stringify(saved)).toBe(before);
  s.world.currentYear++; reviewPatientCare(s,saved);
  expect(saved.patientCare!.every(c => c.status === 'recovered')).toBe(true);
});
test('an heir’s own treatment starts a separate care episode and earns only their own recovery credit', () => {
  let s = clinic(); const patient = ill(s,'edwin'), parentId = s.playerCharacterId;
  const original = professionalRecord(s.world.characters[parentId],'medicine'); original.reputation = 20; beginPatientCare(s,original,patient,true);
  const heir = spawnKin(s,{ kind: 'child',age: 18 }); s.dead = true;
  s = gameReducer(s,{ type: 'CONTINUE_AS_HEIR',heirId: heir.id,lifetimeUnlocked: false });
  const record = s.world.characters[heir.id].professionalHistory!.medicine!, currentPatient = s.world.characters[patient.id];
  beginPatientCare(s,record,currentPatient,true); provideMedicalCare(currentPatient,30);
  expect(record.patientCare).toHaveLength(2); expect(new Set(record.patientCare!.map(c => c.clinicianId))).toEqual(new Set([parentId,heir.id]));
  s.world.currentYear++; reviewPatientCare(s,record);
  expect(record.patientCare!.every(c => c.status === 'recovered')).toBe(true); expect(record.reputation).toBe(14);
  expect(s.world.characters[parentId].professionalHistory!.medicine!.reputation).toBe(20);
});
