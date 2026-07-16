import type { PigmentRatio } from '@/database/schema/colors';
import { getFormulaForBatch } from '@/services/color-scaler';

const coconutBisque: PigmentRatio[] = [
  {
    pigmentCode: 'I',
    pigmentName: 'Brown Oxide',
    mlPerQuart: 1.5,
    mlPerGallon: 6,
    mlPerFiveGallon: 29,
    y48PerQuart: 2,
    y48PerGallon: 8,
    y48PerFiveGallon: 40,
  },
  {
    pigmentCode: 'KX',
    pigmentName: 'Titanium White',
    mlPerQuart: 52.5,
    mlPerGallon: 263,
    mlPerFiveGallon: 1313,
    y48PerQuart: 72,
    y48PerGallon: 360,
    y48PerFiveGallon: 1800,
  },
];

describe('installer colour formulas', () => {
  it('shows only millilitres for every batch size', () => {
    expect(getFormulaForBatch(coconutBisque, 'quart').pigments.map((line) => line.displayAmount)).toEqual([
      '1.5 ml',
      '52.5 ml',
    ]);
    expect(getFormulaForBatch(coconutBisque, 'gallon').pigments.map((line) => line.displayAmount)).toEqual([
      '6 ml',
      '263 ml',
    ]);
    expect(getFormulaForBatch(coconutBisque, 'five_gallon').pigments.map((line) => line.displayAmount)).toEqual([
      '29 ml',
      '1313 ml',
    ]);
  });

  it('preserves the verified Brown Oxide name for tint code I', () => {
    const [line] = getFormulaForBatch(coconutBisque, 'gallon').pigments;

    expect(line.pigmentCode).toBe('I');
    expect(line.pigmentName).toBe('Brown Oxide');
  });
});
