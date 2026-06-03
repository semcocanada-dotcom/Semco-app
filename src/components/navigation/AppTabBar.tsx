import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts } from '@/constants/theme';

type RouteName = 'dashboard' | 'projects' | 'add' | 'library' | 'more';

const TABS: {
  name: RouteName;
  label: string;
  active: React.ComponentProps<typeof Ionicons>['name'];
  inactive: React.ComponentProps<typeof Ionicons>['name'];
}[] = [
  { name: 'dashboard', label: 'Home', active: 'home', inactive: 'home-outline' },
  { name: 'projects', label: 'Projects', active: 'folder-open', inactive: 'folder-open-outline' },
  { name: 'add', label: 'Add', active: 'add', inactive: 'add' },
  { name: 'library', label: 'Library', active: 'book', inactive: 'book-outline' },
  { name: 'more', label: 'More', active: 'ellipsis-horizontal-circle', inactive: 'ellipsis-horizontal-circle-outline' },
];

const ACTIVE_PARENT: Record<string, RouteName> = {
  assistant: 'library',
  calculator: 'library',
  colors: 'library',
  orders: 'add',
  products: 'library',
  takeoff: 'add',
};

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const routeByName = new Map(state.routes.map((route, index) => [route.name, { route, index }]));
  const focusedRoute = state.routes[state.index]?.name;
  const activeRoute = ACTIVE_PARENT[focusedRoute] ?? focusedRoute;

  return (
    <View style={[styles.shell, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map((tab) => {
        const match = routeByName.get(tab.name);
        if (!match) return null;

        const { route } = match;
        const isFocused = activeRoute === tab.name;
        const isAdd = tab.name === 'add';
        const descriptor = descriptors[route.key];
        const title = descriptor?.options.title ?? tab.label;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name as never);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={title}
            onPress={onPress}
            style={[styles.item, isAdd && styles.addItem]}
            activeOpacity={0.82}
          >
            {isAdd ? (
              <View style={styles.addWrap}>
                <View style={[styles.addButton, isFocused && styles.addButtonActive]}>
                  <Ionicons name={tab.active} size={34} color={Colors.white} />
                </View>
              </View>
            ) : (
              <View style={styles.tabWrap}>
                <Ionicons
                  name={isFocused ? tab.active : tab.inactive}
                  size={24}
                  color={isFocused ? Colors.semcoOrange : Colors.navy}
                />
                <Text style={[styles.label, isFocused && styles.labelActive]} numberOfLines={1}>
                  {tab.label}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -8 },
    elevation: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 62,
  },
  addItem: {
    marginTop: -18,
  },
  tabWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 52,
    gap: 4,
  },
  addWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.semcoOrange,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },
  addButtonActive: {
    backgroundColor: Colors.semcoOrange,
  },
  label: {
    color: Colors.navy,
    fontSize: 11,
    fontFamily: Fonts.semibold,
    fontWeight: '600',
    lineHeight: 13,
  },
  labelActive: {
    color: Colors.semcoOrange,
  },
});
