import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@constants/colors';
import type { Child } from '@lib/types';

interface ChildSelectorProps {
  children: Child[];
  activeChild: Child | null;
  onSelect: (child: Child) => void;
  onAddChild?: () => void;
}

export function ChildSelector({ children, activeChild, onSelect, onAddChild }: ChildSelectorProps) {
  if (children.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 8, flexDirection: 'row' }}
    >
      {children.map((child) => {
        const isActive = child.id === activeChild?.id;
        return (
          <Pressable key={child.id} onPress={() => onSelect(child)}>
            {isActive ? (
              <LinearGradient
                colors={Colors.gradients.purple}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14 }}>
                  {child.name}
                </Text>
              </LinearGradient>
            ) : (
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: Colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: Colors.border,
                }}
              >
                <Text style={{ color: Colors.textSecondary, fontWeight: '500', fontSize: 14 }}>
                  {child.name}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}

      {onAddChild && (
        <Pressable onPress={onAddChild}>
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: Colors.surfaceAlt,
              borderWidth: 1,
              borderColor: Colors.border,
              borderStyle: 'dashed',
            }}
          >
            <Text style={{ color: Colors.purple, fontWeight: '600', fontSize: 14 }}>+ Add</Text>
          </View>
        </Pressable>
      )}
    </ScrollView>
  );
}
