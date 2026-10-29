import { buildMathAnswer } from './assistant-math';
import { extractJobContext, type AssistantJobContext } from './job-context';

const dryConcrete: AssistantJobContext = {
  substrate: 'concrete',
  application: 'floor',
  exposure: 'dry',
  system: 'x_bond',
  finish: 'satin_stone',
  missingInputs: [],
};

describe('Semco Guide calculator quantities', () => {
  it.each(['1,500 sq ft', '1500 sq. ft.', '1,500 ft²'])('preserves thousands in %s', (area) => {
    const answer = buildMathAnswer(dryConcrete, `How much material for ${area}?`);
    expect(answer?.kind).toBe('quantity');
    expect(answer?.content).toContain('**1500 sq ft**');
  });

  it.each(['500 sq ft + 300 sq ft', '500 plus 300 sq ft', '500 and 300 square feet', '20 by 30 ft + 10 by 20 ft'])('adds clear separate areas: %s', (area) => {
    const answer = buildMathAnswer(dryConcrete, `How much material for ${area}?`);
    expect(answer?.kind).toBe('quantity');
    expect(answer?.content).toContain('**800 sq ft**');
  });

  it.each(['-500 sq ft', '−500 sq ft', '0 sq ft', '1,50 sq ft', '1 500 sq ft', '-20 by 30 ft', 'minus 20 by 30 ft'])('rejects invalid measurement %s', (area) => {
    const answer = buildMathAnswer(dryConcrete, `How much material for ${area}?`, [{ role: 'user', content: 'Earlier it was 600 sq ft' }]);
    expect(answer?.kind).toBe('quantity_input');
    expect(answer?.content).toContain('positive number');
    expect(answer?.content).not.toContain('**600 sq ft**');
  });

  it.each(['500 sq ft or 300 sq ft', '500 sq ft includes 100 sq ft', '500 sq ft plus 20 sq m', '500 sq ft plus 10 by 20 ft', '500 sq ft plus 300'])('asks rather than guessing %s', (area) => {
    const answer = buildMathAnswer(dryConcrete, `How much material for ${area}?`);
    expect(answer?.kind).toBe('quantity_input');
    expect(answer?.content).toContain('more than one measurement');
  });

  it('converts an explicitly metric area', () => {
    const answer = buildMathAnswer(dryConcrete, 'How much material for 100 m²?');
    expect(answer?.content).toContain('**1076 sq ft**');
  });

  it('does not replace an area estimate with a generic coverage fact', () => {
    const answer = buildMathAnswer(dryConcrete, 'How many bags do I need to cover 1,500 sq ft?');
    expect(answer?.kind).toBe('quantity');
    expect(answer?.content).toContain('**1500 sq ft**');
  });

  it('does not reuse the previous job area after a reset', () => {
    const answer = buildMathAnswer(dryConcrete, 'New project: how much material do I need?', [
      { role: 'user', content: 'Concrete pool 1500 sq ft' },
    ]);
    expect(answer?.kind).toBe('quantity_input');
    expect(answer?.content).toContain('What area are we covering?');
  });

  it('uses described oil contamination for the calculator prep selection', () => {
    const question = 'How much material for 500 sq ft of concrete with oil and grease?';
    const answer = buildMathAnswer(extractJobContext([], question), question);
    expect(answer?.kind).toBe('quantity');
    expect(answer?.content).toContain('Step 1: SEMCO Power Cleaner');
    expect(answer?.content).toContain('Step 2: SEMCO Stone Soap');
  });

  it('takes dry drywall coverage and allowance from the calculator', () => {
    const question = 'How much material for 500 sq ft on dry non-wet drywall?';
    const answer = buildMathAnswer(extractJobContext([], question), question);
    expect(answer?.content).toContain('500 sq ft ÷ 100 sq ft per bag = 5');
    expect(answer?.content).toContain('Stone rate already includes the wall allowance');
    const coverageQuestion = 'How much does one bag cover on dry drywall?';
    const coverage = buildMathAnswer(extractJobContext([], coverageQuestion), coverageQuestion);
    expect(coverage?.content).toContain('**100 sq ft of dry, non-wet drywall**');
  });

  it('states the shared four-coat submerged membrane coverage', () => {
    const answer = buildMathAnswer(dryConcrete, 'How far does a gallon of liquid membrane go?');
    expect(answer?.kind).toBe('coverage_fact');
    expect(answer?.content).toContain('50-75 sq ft per gallon for the complete 4-coat application');
  });

  it('keeps Liquid Membrane optional for a wall in a non-wet area', () => {
    const dryWall: AssistantJobContext = {
      ...dryConcrete,
      application: 'wall',
      exposure: 'dry',
    };
    const answer = buildMathAnswer(dryWall, 'How much material for 500 sq ft?', []);

    expect(answer?.kind).toBe('quantity');
    expect(answer?.content).toContain('SIP preparation plan');
    expect(answer?.content).toContain('Stone Soap');
    expect(answer?.content).toContain('1:4 cleaner to water');
    expect(answer?.content).not.toContain('SEMCO Liquid Membrane');
  });

  it('includes Liquid Membrane for a wet shower calculation', () => {
    const shower: AssistantJobContext = {
      ...dryConcrete,
      substrate: 'glasroc_board',
      application: 'shower',
      exposure: 'wet',
    };
    const answer = buildMathAnswer(shower, 'How much material for 200 sq ft?', []);

    expect(answer?.kind).toBe('quantity');
    expect(answer?.content).toContain('SEMCO Liquid Membrane');
    expect(answer?.content).toMatch(/\*\*SEMCO Liquid Membrane\*\*[\s\S]*?Applied in 2 coats/);
    expect(answer?.content).toContain('**SEMCO Fabric Reinforcement** — Buy 1 x 6 in x 75 ft roll');
    expect(answer?.content).toContain('Installer-selected: 1 roll × 75 linear ft = 75 linear ft total.');
    expect(answer?.content).not.toMatch(/sq ft per 6 in x 75 ft roll/);
  });

  it('uses priceable Type C cleaner quantities for a pool calculation', () => {
    const pool: AssistantJobContext = {
      ...dryConcrete,
      substrate: 'pool_shell',
      application: 'pool',
      exposure: 'submerged',
      finish: 'natural_shield',
    };
    const answer = buildMathAnswer(pool, 'How much material for 500 sq ft?', []);

    expect(answer?.kind).toBe('quantity');
    expect(answer?.content).toContain('Power Cleaner');
    expect(answer?.content).toContain('Nu-Lift');
    expect(answer?.content).toContain('1:9 cleaner to water');
    expect(answer?.content).toContain('SEMCO Liquid Membrane');
    expect(answer?.content).toMatch(/\*\*SEMCO Liquid Membrane\*\*[\s\S]*?Applied in 4 coats/);
  });

  it('fails safely instead of estimating a wet area over regular drywall', () => {
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const wetDrywall: AssistantJobContext = {
      ...dryConcrete,
      substrate: 'drywall',
      application: 'shower',
      exposure: 'wet',
    };

    try {
      expect(buildMathAnswer(wetDrywall, 'How much material for 100 sq ft?', [])).toBeNull();
      expect(warning).toHaveBeenCalledWith(
        '[assistant-math] calculate failed:',
        expect.objectContaining({
          message: expect.stringContaining('Regular drywall/gypsum board is not supported in wet areas'),
        }),
      );
    } finally {
      warning.mockRestore();
    }
  });
});
