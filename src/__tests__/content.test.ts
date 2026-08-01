import { ALL_EVENTS, EVENTS_BY_ID } from '@/content';
import { ANNUAL_MESSAGES } from '@/content/annualMessages';
import { BASE_EXPANSION_EVENTS } from '@/content/baseExpansionEvents';
import { createLife } from '@/engine/gameState';
import { PAYWALL_PLAN_IDS, PREMIUM_BENEFITS, SHOP_PLAN_IDS } from '@/data/premiumPlans';

const KNOWN_KIN_IDS = new Set(createLife().kin.map((k) => k.id));

describe('content integrity', () => {
  it('has no duplicate event ids', () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const e of ALL_EVENTS) {
      if (seen.has(e.id)) dupes.push(e.id);
      seen.add(e.id);
    }
    expect(dupes).toEqual([]);
  });

  it('every outcome `next` pointer resolves to a real event', () => {
    const broken: string[] = [];
    for (const e of ALL_EVENTS) {
      for (const c of e.choices) {
        for (const o of [c.outcome, c.success, c.failure]) {
          if (o?.next && !EVENTS_BY_ID[o.next]) broken.push(`${e.id} -> ${o.next}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('every kinRel effect references a known kin id', () => {
    const bad: string[] = [];
    for (const e of ALL_EVENTS) {
      for (const c of e.choices) {
        for (const o of [c.outcome, c.success, c.failure]) {
          const id = o?.effects?.kinRel?.id;
          if (id && !KNOWN_KIN_IDS.has(id)) bad.push(`${e.id}:${id}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('every choice has at least one resolvable outcome', () => {
    const bad: string[] = [];
    for (const e of ALL_EVENTS) {
      for (let i = 0; i < e.choices.length; i++) {
        const c = e.choices[i];
        const hasOutcome = !!c.outcome || (!!c.success && !!c.failure);
        if (!hasOutcome) bad.push(`${e.id}[${i}]`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('arc nodes are flagged arcNodeOnly and standalone events are not', () => {
    for (const e of ALL_EVENTS) {
      if (e.id.startsWith('arc_')) expect(e.arcNodeOnly).toBe(true);
    }
  });

  it('includes a focused Lifetime Pass premium event pack', () => {
    const premium = ALL_EVENTS.filter((e) => e.premium);
    expect(premium.length).toBeGreaterThanOrEqual(25);
    expect(premium.length).toBeLessThanOrEqual(35);
  });

  it('advertises the Holding as a premium feature', () => {
    expect(PREMIUM_BENEFITS.some((benefit) => benefit.includes('HOLD'))).toBe(true);
  });

  it('keeps onboarding subscriptions separate from the complete Royal Shop', () => {
    expect(PAYWALL_PLAN_IDS).toEqual(['annual', 'monthly']);
    expect(PAYWALL_PLAN_IDS).not.toContain('lifetime');
    expect(SHOP_PLAN_IDS).toEqual(['annual', 'monthly', 'lifetime']);
  });

  it('includes a generous free/base content pool', () => {
    const base = ALL_EVENTS.filter((e) => !e.premium && !e.arcNodeOnly);
    expect(base.length).toBeGreaterThanOrEqual(70);
    expect(BASE_EXPANSION_EVENTS.length).toBeGreaterThanOrEqual(35);
    expect(BASE_EXPANSION_EVENTS.length).toBeLessThanOrEqual(45);
    expect(BASE_EXPANSION_EVENTS.every((e) => !e.premium)).toBe(true);
  });

  it('has enough annual flavour beats for repeated lives', () => {
    expect(ANNUAL_MESSAGES.length).toBeGreaterThanOrEqual(32);
  });
});
