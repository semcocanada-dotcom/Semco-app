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
  library: { active: 'grid', inactive: 'grid-outline' },
  more: { active: 'ellipsis-horizontal-circle', inactive: 'ellipsis-horizontal-circle-outline' },
};

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.shell, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const options = descriptors[route.key].options;
        const title = options.title ?? route.name;
        const isAdd = route.name === 'add';
        const iconSet = ICONS[route.name as RouteName] ?? ICONS.dashboard;

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
            accessibilityLabel={title}
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={[styles.item, isAdd && styles.addItem]}
            activeOpacity={0.82}
          >
            {isAdd ? (
              <View style={styles.addWrap}>
                <View style={[styles.addButton, isFocused && styles.addButtonActive]}>
                  <Ionicons name={iconSet.active} size={30} color={Colors.background} />
                </View>
              </View>
            ) : (
              <View style={[styles.tabButton, isFocused && styles.tabButtonActive]}>
                <Ionicons
                  name={isFocused ? iconSet.active : iconSet.inactive}
                  size={26}
                  color={isFocused ? Colors.primary : Colors.textDisabled}
                />
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
    backgroundColor: '#10171B',
    borderTopColor: '#202C31',
    borderTopWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
  },
  addItem: {
    marginTop: -20,
  },
  tabButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: '#0D1E21',
    borderColor: '#214145',
  },
  addWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#10171B',
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  addButtonActive: {
    backgroundColor: '#FF9A45',
  },
});
