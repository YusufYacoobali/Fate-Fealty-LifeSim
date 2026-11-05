import type {DeathOrigin,GameState} from '@/types/game';
/** Call immediately after damage. The first fatal transition owns the explanation. */
export function captureFatalHealth(s:GameState,before:number,origin:DeathOrigin,cause='Died after a fatal collapse in health.'):void {
 if(before>0&&s.stats.health<=0&&!s.settings.liveForever&&!s.deathContext&&!s.dead)
  s.deathContext={...origin,actorIds:[...new Set(origin.actorIds??[])],cause,year:s.world.currentYear};
}
export function eventDeathOrigin(s:GameState):DeathOrigin {
 return {category:'event',sourceType:s.pendingEvent?'event':'system',sourceId:s.pendingEvent?.eventId,actorIds:Object.values(s.pendingEvent?.bindings??{})};
}
