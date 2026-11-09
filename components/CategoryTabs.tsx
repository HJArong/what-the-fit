import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Category } from '../db/clothing';

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'top', label: 'Tops' },
  { key: 'bottom', label: 'Bottoms' },
  { key: 'shoes', label: 'Shoes' },
];

interface Props {
  active: Category;
  onChange: (category: Category) => void;
}

export default function CategoryTabs({ active, onChange }: Props) {
  return (
    <View style={styles.container}>
      {CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat.key}
          style={[styles.tab, active === cat.key && styles.activeTab]}
          onPress={() => onChange(cat.key)}
          activeOpacity={0.7}
        >
          <Text style={[styles.label, active === cat.key && styles.activeLabel]}>
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F0EFED',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 9,
  },
  activeTab: {
    backgroundColor: '#1C1C1E',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
