import React from 'react';
import { render } from '@testing-library/react-native';
import { MaterialRetailEstimateCard } from '@/components/calculator/MaterialRetailEstimateCard';
import {
  INNOVATIVE_FINISHES_WEST_DEALER,
  MODERN_ARC_DEALER,
} from '@/constants/dealers';
import { calculate } from '@/services/calculator';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

describe('MaterialRetailEstimateCard Natural Shield pricing', () => {
  it.each([MODERN_ARC_DEALER, INNOVATIVE_FINISHES_WEST_DEALER])(
    'shows correct pool pail quantities and the same retail prices for $dealerName',
    (dealerContext) => {
      const result = calculate({
        areaSqft: 9800,
        substrateType: 'pool',
        wastePct: 0,
        fabricRolls: 5,
      });
      const screen = render(
        <MaterialRetailEstimateCard result={result} dealerContext={dealerContext} />,
      );

      expect(screen.getByText(`${dealerContext.dealerName} estimate`)).toBeTruthy();
      expect(screen.getByText('SEMCO Natural Shield')).toBeTruthy();
      expect(screen.getByText('12 x 5 gallon pail @ $838.55')).toBeTruthy();
      expect(screen.getByText('$10,062.60')).toBeTruthy();
      // Complete material subtotal before any separately selected pigment tint.
      expect(screen.getByText('$97,072.67')).toBeTruthy();
      expect(screen.getByText(dealerContext.orderRoutingLabel)).toBeTruthy();
      expect(screen.queryByText('60 x NATURAL-SHIELD')).toBeNull();
      expect(screen.queryByText('Dealer price pending')).toBeNull();
      expect(screen.queryByText('Pending')).toBeNull();
      expect(screen.queryByText(/need retail pricing before final review/)).toBeNull();
    },
  );

  it('shows a priced 1-gallon Natural Shield pail for a small job', () => {
    const result = calculate({
      areaSqft: 100,
      substrateType: 'concrete',
      wastePct: 0,
      sealerSku: 'NATURAL-SHIELD',
    });
    const screen = render(<MaterialRetailEstimateCard result={result} />);

    expect(screen.getByText('1 x 1 gallon pail @ $211.70')).toBeTruthy();
    expect(screen.getByText('$211.70')).toBeTruthy();
    expect(screen.queryByText('Dealer price pending')).toBeNull();
  });

  it('still marks the estimate pending when a genuinely unpriced product is present', () => {
    const result = calculate({
      areaSqft: 100,
      substrateType: 'concrete',
      wastePct: 0,
      sealerSku: 'NATURAL-SHIELD',
    });
    const naturalShield = result.layers.find((layer) => layer.productSku === 'NATURAL-SHIELD')!;
    const screen = render(
      <MaterialRetailEstimateCard result={{
        ...result,
        layers: [{
          ...naturalShield,
          productId: 'unpriced-product',
          productSku: 'UNPRICED-PRODUCT',
          productName: 'Unpriced product',
        }],
      }} />,
    );

    expect(screen.getByText('Unpriced product')).toBeTruthy();
    expect(screen.getByText('Pending')).toBeTruthy();
    expect(screen.getByText('Dealer price pending')).toBeTruthy();
    expect(screen.getByText('1 item need retail pricing before final review.')).toBeTruthy();
  });
});
