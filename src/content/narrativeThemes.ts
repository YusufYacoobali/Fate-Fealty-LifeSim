/** Shared premises in older banks. Continuity retains its own chain identity. */
export function legacyNarrativeTheme(id:string): string | undefined {
  if (/^(quality_|story_|education_|practice_|profession_|origin_)/.test(id)) return;
  if (/^(taxman|noble_reeve_petition|baron_tax_season|base_miller_toll|noble_petition)$/.test(id)) return 'corrupt_taxes';
  if (/relic_vendor|spare_toe|holy_bathwater|rusty_relic|own_relic/.test(id)) return 'false_relics';
  if (/base_goose_witness|goose_court_news/.test(id)) return 'goose_mishaps';
  if (/marriage_offer|court_proposal/.test(id)) return 'courtship_bargains';
  if (/court_rivalry|court_forged_lineage/.test(id)) return id==='court_rivalry'?'court_intrigue':'false_lineage';
  if (/bad_portrait|bad_herald|stained_glass|court_flatterer|court_poet/.test(id)) return 'public_vanity';
  if (/peasant_jealous_rival/.test(id)) return 'workplace_sabotage';
  if (/quack_doctor|leeches_for_rent/.test(id)) return 'false_cures';
  if (/friar_pudding|bishop_fish|pardoner_sale/.test(id)) return 'religious_hypocrisy';
  if (/war_arrow_inventory|war_backwards_banner|war_cowardly_drum/.test(id)) return 'military_supply';
}
