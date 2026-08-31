import React from 'react';
import { render } from '@testing-library/react-native';
import { ColourTintPlanCard } from '@/components/calculator/ColourTintPlanCard';
import { calculate } from '@/services/calculator';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

function plywoodWetAreaPlan(includeColourSamples: boolean) {
  return calculate({
    areaSqft: 150,
    substrateType: 'plywood',
    wastePct: 10,
    installationScope: 'wet_area',
    colourAllocations: [{ colourId: 'col-xbond-2053t', areaSqft: 150 }],
    includeColourSamples,
  }).colourTintPlan!;
}

describe('ColourTintPlanCard sample policy', () => {
  it('shows the uncharged $40 sample offer when no sample was selected', () => {
    const screen = render(<ColourTintPlanCard plan={plywoodWetAreaPlan(false)} />);

    expect(screen.getByText('No colour sample added')).toBeTruthy();
    expect(screen.getByText(
      'Optional prepared 1-quart X-Bond Liquid sample: $40 flat rate with pigment included. FREE at 500+ sq ft.',
    )).toBeTruthy();
  });

  it('shows the selected prepared sample at the current flat rate', () => {
    const screen = render(<ColourTintPlanCard plan={plywoodWetAreaPlan(true)} />);

    expect(screen.getByText('Prepared colour samples')).toBeTruthy();
    expect(screen.getByText('$40 flat rate · X-Bond Liquid + pigment included')).toBeTruthy();
    expect(screen.queryByText('No colour sample added')).toBeNull();
  });
});
