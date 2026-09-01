import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Keyboard, Modal, TextInput } from 'react-native';
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
    ...overrides,
  };
  return { screen: render(<ColourAllocationPicker {...props} />), props };
}

describe('ColourAllocationPicker modal behaviour', () => {
  beforeEach(() => {
    jest.spyOn(Keyboard, 'dismiss').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('selects a colour and closes without moving the parent calculator', () => {
    const { screen, props } = renderPicker();
    const firstColour = searchTintColours('')[0];

    fireEvent.press(screen.getByLabelText('Choose colour 1'));
    expect(screen.UNSAFE_getByType(Modal).props.visible).toBe(true);

    fireEvent.press(screen.getByLabelText(`${firstColour.name}, ${firstColour.code}`));
    expect(props.onSelectColour).toHaveBeenCalledWith('colour-1', firstColour.id);
    expect(screen.UNSAFE_getByType(Modal).props.visible).toBe(false);
    expect(Keyboard.dismiss).toHaveBeenCalledTimes(2);
  });

  it('uses a full-screen fade and does not auto-open the search keyboard', () => {
    const { screen, props } = renderPicker();

    fireEvent.press(screen.getByLabelText('Choose colour 1'));

    const modal = screen.UNSAFE_getByType(Modal);
    const searchInput = screen.UNSAFE_getAllByType(TextInput)
      .find((input) => input.props.placeholder === 'Search colour name or code...');

    expect(modal.props.presentationStyle).toBe('fullScreen');
    expect(modal.props.animationType).toBe('fade');
    expect(searchInput?.props.autoFocus).toBe(false);

    fireEvent.press(screen.getByLabelText('Close colour picker'));

    expect(props.onSelectColour).not.toHaveBeenCalled();
    expect(screen.UNSAFE_getByType(Modal).props.visible).toBe(false);
  });
});
