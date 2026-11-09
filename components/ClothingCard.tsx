import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ClothingItem } from '../db/clothing';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface Props {
  item: ClothingItem;
  selected?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  size?: 'normal' | 'small';
}

export default function ClothingCard({
  item,
  selected = false,
  onPress,
  onLongPress,
  size = 'normal',
}: Props) {
  const cardWidth = size === 'small' ? 100 : CARD_WIDTH;
  const cardHeight = size === 'small' ? 120 : CARD_WIDTH * 1.25;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { width: cardWidth, height: cardHeight },
        selected && styles.selected,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: item.image_uri }}
        style={styles.image}
        resizeMode="cover"
      />
      {selected && <View style={styles.selectedOverlay} />}
      {selected && (
        <View style={styles.checkBadge}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
      )}
      {item.label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label} numberOfLines={1}>
            {item.label}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F0EFED',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#FF69B4',
  },
  image: {
    flex: 1,
    width: '100%',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 105, 180, 0.12)',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FF69B4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  labelRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});
