import React from 'react';

const renderer = require('react-test-renderer');

const mockUseAuth = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('expo-router', () => {
  const React = require('react');

  const Stack = ({ children }: { children: React.ReactNode }) =>
    React.createElement('Stack', null, children);
  const StackScreen: React.FC<{ name: string }> = ({ name }) => React.createElement('StackScreen', { name });
  Stack.Screen = StackScreen;
  Stack.displayName = 'MockStack';
  StackScreen.displayName = 'MockStackScreen';

  const Tabs = ({ children }: { children: React.ReactNode }) =>
    React.createElement('Tabs', null, children);
  const TabsScreen: React.FC<{ name: string }> = ({ name }) => React.createElement('TabsScreen', { name });
  Tabs.Screen = TabsScreen;
  Tabs.displayName = 'MockTabs';
  TabsScreen.displayName = 'MockTabsScreen';

  return {
    Redirect: ({ href }: { href: string }) => React.createElement('Redirect', { href }),
    Stack,
    Tabs,
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
  MaterialCommunityIcons: () => null,
}));

const AuthLayout = require('../app/(auth)/_layout').default;
const TabsLayout = require('../app/(tabs)/_layout').default;

describe('authentication route guards', () => {
  it('moves authenticated users away from the login group', () => {
    mockUseAuth.mockReturnValue({ session: { user: { id: 'reviewer' } }, loading: false });

    const tree = renderer.create(React.createElement(AuthLayout));

    expect(tree.root.findByType('Redirect').props.href).toBe('/(tabs)');
  });

  it('keeps signed-out users in the login group', () => {
    mockUseAuth.mockReturnValue({ session: null, loading: false });

    const tree = renderer.create(React.createElement(AuthLayout));

    expect(tree.root.findAllByType('Redirect')).toHaveLength(0);
    expect(tree.root.findByType('Stack')).toBeTruthy();
  });

  it('moves signed-out users away from protected tabs', () => {
    mockUseAuth.mockReturnValue({ session: null, loading: false });

    const tree = renderer.create(React.createElement(TabsLayout));

    expect(tree.root.findByType('Redirect').props.href).toBe('/(auth)/login');
  });
});
