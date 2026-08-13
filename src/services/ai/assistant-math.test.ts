import { buildMathAnswer } from './assistant-math';
import type { AssistantJobContext } from './job-context';

const dryConcrete: AssistantJobContext = {
  substrate: 'concrete',
  application: 'floor',
  exposure: 'dry',
  system: 'x_bond',
  finish: 'satin_stone',
  missingInputs: [],
};

describe('Semco Guide calculator quantities', () => {
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
