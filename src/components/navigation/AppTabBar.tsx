import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

type RouteName = 'dashboard' | 'projects' | 'add' | 'library' | 'more';

const ICONS: Record<RouteName, { active: React.ComponentProps<typeof Ionicons>['name']; inactive: React.ComponentProps<typeof Ionicons>['name'] }> = {
  dashboard: { active: 'home', inactive: 'home-outline' },
  projects: { active: 'folder-open', inactive: 'folder-open-outline' },
  add: { active: 'add', inactive: 'add' },
  library: { active: 'layers', inactive: 'layers-outline' },
  more: { active: 'ellipsis-horizontal-circle', inactive: 'ellipsis-horizontal-circle-outline' },
};

const LABELS: Record<RouteName, string> = {
  dashboard: 'Home',
  projects: 'Projects',
  add: '',
  library: 'Batches',
  more: 'More',
};

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.shell, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const isAdd = route.name === 'add';
        const routeName = route.name as RouteName;
        const iconSet = ICONS[routeName] ?? ICONS.dashboard;
        const title = LABELS[routeName] ?? descriptors[route.key].options.title ?? route.name;

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
            accessibilityLabel={title || route.name}
            onPress={onPress}
            style={[styles.item, isAdd && styles.addItem]}
            activeOpacity={0.82}
          >
            {isAdd ? (
              <View style={styles.addWrap}>
                <View style={[styles.addButton, isFocused && styles.addButtonActive]}>
                  <Ionicons name={iconSet.active} size={31} color={Colors.textPrimary} />
                </View>
              </View>
            ) : (
              <View style={styles.tabWrap}>
                <View style={[styles.iconShell, isFocused && styles.iconShellActive]}>
                  <Ionicons
                    name={isFocused ? iconSet.active : iconSet.inactive}
                    size={24}
                    color={isFocused ? '#E65B2E' : '#7C8C91'}
                  />
                </View>
                <View style={[styles.activeDot, isFocused ? styles.activeDotVisible : styles.activeDotHidden]} />
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
    backgroundColor: 'rgba(13, 18, 20, 0.98)',
    borderTopWidth: 0,
    paddingTop: 12,
    paddingHorizontal: 14,
    gap: 2,
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 18,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 62,
  },
  addItem: {
    marginTop: -24,
  },
  tabWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 54,
    paddingTop: 3,
  },
  iconShell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconShellActive: {
    backgroundColor: 'rgba(230, 91, 46, 0.1)',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    backgroundColor: '#E65B2E',
  },
  activeDotVisible: {
    opacity: 1,
  },
  activeDotHidden: {
    opacity: 0,
  },
  addWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#E65B2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: 'rgba(13, 18, 20, 0.98)',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 8,
  },
  addButtonActive: {
    backgroundColor: '#D84F25',
  },
});
