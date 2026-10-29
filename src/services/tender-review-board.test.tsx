import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import ProjectBoardDetailScreen from '../../app/(app)/board/[id]';
import { TENDER_STUB_COPY, TENDER_STUB_IDS, tenderReviewStub } from '@/services/tender-review';

const mockAuth: { userId: string } = { userId: TENDER_STUB_IDS.installerUserId };
const mockParams: { id: string } = { id: TENDER_STUB_IDS.sharedCardId };

jest.mock('@/store/auth', () => ({
  useAuthStore: (selector: (state: { user: { id: string } | null }) => unknown) =>
    selector({ user: { id: mockAuth.userId } }),
}));

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({ back: jest.fn(), replace: jest.fn(), push: jest.fn() }),
}));

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

jest.mock('@/utils/haptics', () => ({
  lightImpactHaptic: jest.fn(),
  mediumImpactHaptic: jest.fn(),
  selectionHaptic: jest.fn(),
}));

const OWNER_ID = '00000000-0000-4000-8000-000000000901';

describe('project board detail', () => {
  beforeEach(() => {
    tenderReviewStub.resetForTests();
    mockAuth.userId = TENDER_STUB_IDS.installerUserId;
    mockParams.id = TENDER_STUB_IDS.sharedCardId;
  });

  it('shows the select profiles placeholder only to the owner', () => {
    tenderReviewStub.grantOwnerForTests(OWNER_ID);
    mockAuth.userId = OWNER_ID;
    mockParams.id = TENDER_STUB_IDS.draftCardId;
    const screen = render(<ProjectBoardDetailScreen />);

    expect(screen.getByText('Select profiles')).toBeTruthy();
    expect(screen.getByText('Northline Installers')).toBeTruthy();
    expect(screen.getByText('Harbor General Contracting')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Harbor General Contracting, General contractor'));
    fireEvent.press(screen.getByLabelText('Save profile selection'));

    expect(tenderReviewStub.getVisibleCard(TENDER_STUB_IDS.generalContractorUserId, TENDER_STUB_IDS.draftCardId)?.status).toBe('shared');
    expect(screen.getByText(/Profile selection saved in this stub/)).toBeTruthy();
  });

  it('lets a granted profile open the board without the profile picker or inbox', () => {
    const screen = render(<ProjectBoardDetailScreen />);

    expect(screen.getByText(TENDER_STUB_COPY.sharedCardTitle)).toBeTruthy();
    expect(screen.queryByText('Select profiles')).toBeNull();
    expect(screen.queryByText('Decision inbox')).toBeNull();
    expect(screen.getByText(/Decision notes stay with the owner/)).toBeTruthy();
  });

  it('hides a board the profile was not granted', () => {
    mockAuth.userId = '00000000-0000-4000-8000-000000000199';
    const screen = render(<ProjectBoardDetailScreen />);

    expect(screen.getByText('This board is not available to this profile')).toBeTruthy();
    expect(screen.queryByText(TENDER_STUB_COPY.sharedCardTitle)).toBeNull();
  });
});
