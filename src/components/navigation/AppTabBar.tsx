import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
    <View style={[styles.shell, { paddingBottom: Math.max(insets.bottom, 8) }]}>
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
                <Ionicons
                  name={isFocused ? iconSet.active : iconSet.inactive}
                  size={23}
                  color={isFocused ? '#E65B2E' : '#7E8D92'}
                />
                <View style={{ height: 4 }} />
                <Text style={[styles.label, isFocused && styles.labelActive]} numberOfLines={1}>
                  {title}
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
    backgroundColor: Colors.textPrimary,
    borderTopColor: '#E4E1DB',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
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
  },
  addWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E65B2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.textPrimary,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },
  addButtonActive: {
    backgroundColor: '#D84F25',
  },
  label: {
    color: '#7E8D92',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 13,
  },
  labelActive: {
    color: '#E65B2E',
  },
});
