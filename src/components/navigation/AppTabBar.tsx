import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Layout, TAP_TARGET_MIN } from '@/constants/theme';
import { lightImpactHaptic, mediumImpactHaptic, selectionHaptic } from '@/utils/haptics';

type RouteName = 'dashboard' | 'projects' | 'add' | 'library' | 'more';

const TABS: {
  name: RouteName;
  label: string;
  href: string;
  active: React.ComponentProps<typeof Ionicons>['name'];
  inactive: React.ComponentProps<typeof Ionicons>['name'];
}[] = [
  { name: 'dashboard', label: 'Home', href: '/dashboard', active: 'home', inactive: 'home-outline' },
  { name: 'projects', label: 'Projects', href: '/projects', active: 'folder-open', inactive: 'folder-open-outline' },
  { name: 'add', label: 'Add', href: '/add', active: 'add', inactive: 'add' },
  { name: 'library', label: 'Library', href: '/library', active: 'book', inactive: 'book-outline' },
  { name: 'more', label: 'More', href: '/more', active: 'ellipsis-horizontal-circle', inactive: 'ellipsis-horizontal-circle-outline' },
];

function getActiveTab(pathname: string): RouteName {
  if (pathname.startsWith('/projects')) return 'projects';
  if (pathname.startsWith('/add') || pathname.startsWith('/orders')) return 'add';
  if (
    pathname.startsWith('/library') ||
    pathname.startsWith('/assistant') ||
    pathname.startsWith('/calculator') ||
    pathname.startsWith('/colors') ||
    pathname.startsWith('/products')
  ) {
    return 'library';
  }
  if (
    pathname.startsWith('/more') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/rewards') ||
    pathname.startsWith('/receipts')
  ) return 'more';
  return 'dashboard';
}

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const routeByName = new Map(state.routes.map((route, index) => [route.name, { route, index }]));
  const activeRoute = getActiveTab(pathname);

  if (pathname.startsWith('/assistant')) return null;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.shell}>
        {TABS.map((tab) => {
          const match = routeByName.get(tab.name);
          const route = match?.route;
          const isFocused = activeRoute === tab.name;
          const isAdd = tab.name === 'add';
          const descriptor = route ? descriptors[route.key] : undefined;
          const title = descriptor?.options.title ?? tab.label;

          const onPress = () => {
            if (isAdd) {
              mediumImpactHaptic();
            } else if (!isFocused) {
              selectionHaptic();
            } else {
              lightImpactHaptic();
            }

            const event = route
              ? navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
              : { defaultPrevented: false };

            if (event.defaultPrevented) return;

            if (route) {
              navigation.navigate(route.name as never);
            } else {
              router.replace(tab.href as any);
            }
          };

          return (
            <TouchableOpacity
              key={tab.name}
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
                <View style={[styles.tabWrap, isFocused && styles.tabWrapActive]}>
                  <Ionicons
                    name={isFocused ? tab.active : tab.inactive}
                    size={isFocused ? 25 : 24}
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
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: Colors.white,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 8,
    minHeight: 78,
    flexShrink: 0,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -8 },
    elevation: 10,
  },
  shell: {
    width: '100%',
    maxWidth: Layout.tabBarMaxWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TAP_TARGET_MIN + 14,
  },
  addItem: {
    marginTop: -18,
  },
  tabWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 52,
    minHeight: TAP_TARGET_MIN + 2,
    paddingHorizontal: 6,
    borderRadius: 18,
    gap: 4,
  },
  tabWrapActive: {
    backgroundColor: Colors.accentMuted,
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
