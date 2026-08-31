import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { FabricRollSelector } from '@/components/calculator/FabricRollSelector';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
  MaterialCommunityIcons: () => null,
}));

describe('FabricRollSelector', () => {
  it('lets the installer add and remove optional fabric rolls', () => {
    let rolls = 0;
    const onChange = jest.fn((next: number) => { rolls = next; });
    const screen = render(<FabricRollSelector rolls={rolls} required={false} onChange={onChange} />);

    expect(screen.getByText('No rolls selected')).toBeTruthy();
    expect(screen.getByText('$92.14 per roll')).toBeTruthy();
    expect(screen.getByLabelText('Decrease fabric rolls').props.accessibilityState.disabled).toBe(true);

    fireEvent.press(screen.getByLabelText('Increase fabric rolls'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('keeps one required roll as the wet-area minimum', () => {
    const onChange = jest.fn();
    const screen = render(<FabricRollSelector rolls={1} required onChange={onChange} />);

    expect(screen.getByText('75 linear ft selected')).toBeTruthy();
    expect(screen.getByLabelText('Decrease fabric rolls').props.accessibilityState.disabled).toBe(true);
    fireEvent.press(screen.getByLabelText('Increase fabric rolls'));
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
