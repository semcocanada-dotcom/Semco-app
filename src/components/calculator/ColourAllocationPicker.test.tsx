import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Modal } from 'react-native';
import { ColourAllocationPicker } from '@/components/calculator/ColourAllocationPicker';
import { searchTintColours } from '@/knowledge/colour-charges';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

function renderPicker(overrides: Partial<React.ComponentProps<typeof ColourAllocationPicker>> = {}) {
  const props: React.ComponentProps<typeof ColourAllocationPicker> = {
    mode: 'single',
    selections: [{ slotId: 'colour-1', colourId: null, areaSqft: '' }],
    totalAreaSqft: '100',
    onModeChange: jest.fn(),
    onSelectColour: jest.fn(),
    onAreaChange: jest.fn(),
    onAddColour: jest.fn(),
    onRemoveColour: jest.fn(),
    includeSamples: false,
    onIncludeSamplesChange: jest.fn(),
    onPickerOpen: jest.fn(),
    onPickerWillClose: jest.fn(),
    onPickerDismiss: jest.fn(),
    ...overrides,
  };
  return { screen: render(<ColourAllocationPicker {...props} />), props };
}

describe('ColourAllocationPicker modal position callbacks', () => {
  beforeEach(() => {
    jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('captures before opening and restores after a colour is selected', () => {
    const { screen, props } = renderPicker();
    const firstColour = searchTintColours('')[0];

    fireEvent.press(screen.getByLabelText('Choose colour 1'));
    expect(props.onPickerOpen).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByLabelText(`${firstColour.name}, ${firstColour.code}`));
    expect(props.onSelectColour).toHaveBeenCalledWith('colour-1', firstColour.id);
    expect(props.onPickerWillClose).toHaveBeenCalledTimes(1);
    expect(props.onPickerDismiss).not.toHaveBeenCalled();

    act(() => screen.UNSAFE_getByType(Modal).props.onDismiss());
    expect(props.onPickerDismiss).toHaveBeenCalledTimes(1);
  });

  it('restores after the picker is closed without choosing a colour', () => {
    const { screen, props } = renderPicker();

    fireEvent.press(screen.getByLabelText('Choose colour 1'));
    fireEvent.press(screen.getByLabelText('Close colour picker'));

    expect(props.onSelectColour).not.toHaveBeenCalled();
    expect(props.onPickerWillClose).toHaveBeenCalledTimes(1);
  });
});
