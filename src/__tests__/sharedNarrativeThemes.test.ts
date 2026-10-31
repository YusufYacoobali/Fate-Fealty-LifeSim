import {sharedNarrativeTheme} from '@/content/sharedNarrativeThemes';
import {EVENTS_BY_ID} from '@/content';
import {isEventPlayable} from '@/engine/eventPicker';
import {singleYearFixture} from './singleYearFixtures';

it.each(['A parent asks for help.','Apparently the child needs a coat.','A transparent explanation.'])('does not mistake ordinary family language for taxes: %s',text=>{
 expect(sharedNarrativeTheme('family_moment',text)).toBeUndefined();
});
it.each(['An assessment is due.','Your rent has doubled.','The levy is called.','The tax collector brings a demand.'])('groups actual fiscal demands: %s',text=>{
 expect(sharedNarrativeTheme('scene',text)).toBe('corrupt_taxes');
});
it('shares the actual cooldown across differently named levy and tax encounters',()=>{
 const scene=EVENTS_BY_ID.single_story_war_swineford,s=singleYearFixture(scene);
 expect(scene.repetitionGroup).toBe(EVENTS_BY_ID.war_levy.repetitionGroup);
 expect(isEventPlayable(s,scene)).toBe(true);
 s.world.repetitionLedger[EVENTS_BY_ID.war_levy.repetitionGroup!]=s.world.currentYear-2;
 expect(isEventPlayable(s,scene)).toBe(false);
 s.world.currentYear+=3;
 expect(isEventPlayable(s,scene)).toBe(true);
});
