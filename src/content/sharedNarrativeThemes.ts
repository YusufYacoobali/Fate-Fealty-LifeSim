/** Whole words matter: a parent is not a rent demand, nor is apparently a tax. */
export function sharedNarrativeTheme(id:string,text:string):string|undefined {
 const source=(id+' '+text).replaceAll('_',' ');
 if(/\brelics?\b|\bsaint\b.*\b(?:bones?|skulls?|toes?)\b|\bangel\b.*\bfeathers?\b/i.test(source))return 'false_relics';
 if(/\b(?:tax|taxed|taxes|levy|levies|tithe|tithes|collector|assessment|rent|rents)\b/i.test(source))return 'corrupt_taxes';
 if(/\b(?:goose|geese|quackbeard|honks)\b/i.test(source))return 'goose_mishaps';
 if(/\b(?:wedding|weddings|betrothal|betrothed|banns|bride|groom)\b/i.test(source))return 'weddings';
 if(/\b(?:forged|forgery|forgeries)\b|\bfalse\b.*\b(?:seal|document|deed|witness)\b/i.test(source))return 'forged_documents';
 if(/\b(?:inheritance|inherited|ancestor|ancestors|pedigree|lineage)\b/i.test(source))return 'suspicious_inheritances';
 if(/\b(?:pudding|glutton|fast|fasting|friar)\b/i.test(source))return 'religious_hypocrisy';
 if(/\b(?:poem|poet|portrait|herald|flattery|flatterer)\b/i.test(source))return 'public_vanity';
 return undefined;
}
