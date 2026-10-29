import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import DecisionInboxScreen from '../../app/(app)/board/inbox';
import { TENDER_STUB_COPY, TENDER_STUB_IDS, tenderReviewStub } from '@/services/tender-review';

const mockAuth: { userId: string } = { userId: '00000000-0000-4000-8000-000000000199' };
const mockReplace = jest.fn();

jest.mock('@/store/auth', () => ({
  useAuthStore: (selector: (state: { user: { id: string } | null }) => unknown) =>
    selector({ user: { id: mockAuth.userId } }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}));

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

jest.mock('@/utils/haptics', () => ({
  lightImpactHaptic: jest.fn(),
  mediumImpactHaptic: jest.fn(),
  selectionHaptic: jest.fn(),
}));

const OWNER_ID = '00000000-0000-4000-8000-000000000901';

describe('decision inbox screen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    tenderReviewStub.resetForTests();
    mockAuth.userId = '00000000-0000-4000-8000-000000000199';
  });

  it('redirects profiles that are not the owner and does not render decisions', () => {
    const screen = render(<DecisionInboxScreen />);

    expect(mockReplace).toHaveBeenCalledWith('/board');
    expect(screen.queryByText('Decision inbox')).toBeNull();
    expect(screen.queryByLabelText('Approve')).toBeNull();
    expect(() => tenderReviewStub.listInbox(TENDER_STUB_IDS.installerUserId)).toThrow();
  });

  it('writes an approve decision into the local stub for the owner', () => {
    tenderReviewStub.grantOwnerForTests(OWNER_ID);
    mockAuth.userId = OWNER_ID;
    const screen = render(<DecisionInboxScreen />);

    expect(screen.getByText('Decision inbox')).toBeTruthy();
    expect(screen.getByText(TENDER_STUB_COPY.packTitle)).toBeTruthy();
    fireEvent.changeText(screen.getByLabelText(`Note for ${TENDER_STUB_COPY.packTitle}`), 'Use satin at the entry.');
    fireEvent.press(screen.getAllByLabelText('Approve')[0]);

    const [decision] = tenderReviewStub.listDecisions(OWNER_ID);
    expect(decision).toMatchObject({
      action: 'approve',
      note: 'Use satin at the entry.',
      actorId: OWNER_ID,
      subjectId: TENDER_STUB_IDS.packId,
    });
    expect(screen.getByText(/Use satin at the entry/)).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
