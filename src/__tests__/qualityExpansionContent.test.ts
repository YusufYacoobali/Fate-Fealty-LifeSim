import { validateContent } from '@/content/contentValidation';

describe('quality-first expansion content contract', () => {
  it('meets all hard release counts and integrity rules', () => {
    const errors = validateContent().filter((issue) => issue.level === 'error');
    expect(errors).toEqual([]);
  });
});
