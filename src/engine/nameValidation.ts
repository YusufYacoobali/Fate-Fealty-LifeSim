/** Shared Unicode-aware rules for personal names and optional nicknames. */
export const PERSONAL_NAME_MAX_LENGTH=20;
export const NICKNAME_MAX_LENGTH=32;
export function personalNameError(value:string,options:{optional?:boolean;max?:number;emptyMessage?:string}={}):string|null {
 if(typeof value!=='string')return options.emptyMessage??'Enter a name.';
 if(/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u.test(value))return 'Use one line without control characters.';
 if(!options.optional&&!value.trim())return options.emptyMessage??'Enter a name.';
 const max=options.max??PERSONAL_NAME_MAX_LENGTH;
 return Array.from(value.trim()).length>max?`Use ${max} characters or fewer.`:null;
}
export function displayName(first:string,nickname:string):string{return [first.trim(),nickname.trim()].filter(Boolean).join(' ');}
