/**
 * Compatibility facade. World responsibilities live in focused modules so
 * callers can migrate without a flag-day import rewrite.
 */
export { tickWorldConditions, strongestConditionReasons } from './worldConditions';
export { resolveScheduledConsequences } from './consequenceScheduler';
export { tickPersistentSociety } from './npcDirector';
export { repairWorldIntegrity, validateWorldIntegrity, worldIntegrityIssues } from './worldIntegrity';
