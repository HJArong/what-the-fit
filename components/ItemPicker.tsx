import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { ClothingItem, Category } from '../db/clothing';

interface Props {
  label: string;
  category: Category;
  items: ClothingItem[];
  selectedId: number | null;
  onSelect: (item: ClothingItem | null) => void;
  style?: ViewStyle;
}

function getDistance(t1: { pageX: number; pageY: number }, t2: { pageX: number; pageY: number }) {
  return Math.sqrt(Math.pow(t2.pageX - t1.pageX, 2) + Math.pow(t2.pageY - t1.pageY, 2));
}

export default function ItemPicker({ label, items, selectedId, onSelect, style }: Props) {
  const hasItems = items.length > 0;
  const currentIndex = hasItems ? items.findIndex((i) => i.id === selectedId) : -1;
  const selectedItem = currentIndex >= 0 ? items[currentIndex] : null;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const savedScale = useRef(1);
  const currentScale = useRef(1);
  const panOffset = useRef({ x: 0, y: 0 });
  const initialPinchDist = useRef(0);

  const [isDirty, setIsDirty] = useState(false);

  // Reset when selected item changes
  useEffect(() => {
    scaleAnim.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
    savedScale.current = 1;
    currentScale.current = 1;
    panOffset.current = { x: 0, y: 0 };
    setIsDirty(false);
  }, [selectedId]);

  const resetTransform = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 120, friction: 8 }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 120, friction: 8 }),
    ]).start();
    savedScale.current = 1;
    currentScale.current = 1;
    panOffset.current = { x: 0, y: 0 };
    setIsDirty(false);
  };

  const panResponder = useRef(
    PanResponder.create({
      // Capture 2-finger immediately; capture 1-finger only after noticeable movement
      onStartShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length === 2,
      onMoveShouldSetPanResponder: (evt, gs) =>
        evt.nativeEvent.touches.length === 2 ||
        Math.abs(gs.dx) > 6 ||
        Math.abs(gs.dy) > 6,

      onPanResponderGrant: (evt) => {
        if (evt.nativeEvent.touches.length === 2) {
          initialPinchDist.current = getDistance(
            evt.nativeEvent.touches[0],
            evt.nativeEvent.touches[1]
          );
        }
      },

      onPanResponderMove: (evt, gs) => {
        if (evt.nativeEvent.touches.length === 2) {
          // Pinch zoom
          const dist = getDistance(
            evt.nativeEvent.touches[0],
            evt.nativeEvent.touches[1]
          );
          const newScale = Math.min(3, Math.max(0.4, savedScale.current * (dist / initialPinchDist.current)));
          currentScale.current = newScale;
          scaleAnim.setValue(newScale);
        } else {
          // Single-finger pan
          translateX.setValue(panOffset.current.x + gs.dx);
          translateY.setValue(panOffset.current.y + gs.dy);
        }
      },

      onPanResponderRelease: (evt, gs) => {
        if (evt.nativeEvent.touches.length < 2) {
          panOffset.current.x += gs.dx;
          panOffset.current.y += gs.dy;
        }
        savedScale.current = currentScale.current;
        const dirty =
          Math.abs(currentScale.current - 1) > 0.05 ||
          Math.abs(panOffset.current.x) > 5 ||
          Math.abs(panOffset.current.y) > 5;
        setIsDirty(dirty);
      },
    })
  ).current;

  const handlePrev = () => {
    if (!hasItems) return;
    if (currentIndex <= 0) onSelect(items[items.length - 1]);
    else onSelect(items[currentIndex - 1]);
  };

  const handleNext = () => {
    if (!hasItems) return;
    if (currentIndex < 0 || currentIndex >= items.length - 1) onSelect(items[0]);
    else onSelect(items[currentIndex + 1]);
  };

  return (
    <View style={[styles.section, style]} {...panResponder.panHandlers}>
      {selectedItem ? (
        <Animated.Image
          source={{ uri: selectedItem.image_uri }}
          style={[
            styles.image,
            { transform: [{ translateX }, { translateY }, { scale: scaleAnim }] },
          ]}
          resizeMode="contain"
        />
      ) : !hasItems ? (
        <View style={styles.uploadBox}>
          <Text style={styles.plus}>+</Text>
          <Text style={styles.uploadText}>Upload {label}</Text>
        </View>
      ) : null}

      {/* Reset button — appears whenever position or scale has changed */}
      {isDirty && (
        <TouchableOpacity style={styles.resetBtn} onPress={resetTransform} activeOpacity={0.8}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      )}

      {/* Navigation arrows */}
      {hasItems && (
        <>
          <TouchableOpacity
            style={[styles.arrow, styles.arrowLeft]}
            onPress={handlePrev}
            activeOpacity={0.5}
            hitSlop={{ top: 20, bottom: 20, left: 8, right: 8 }}
          >
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.arrow, styles.arrowRight]}
            onPress={handleNext}
            activeOpacity={0.5}
            hitSlop={{ top: 20, bottom: 20, left: 8, right: 8 }}
          >
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  uploadBox: {
    width: '55%',
    aspectRatio: 1,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#A8C8E8',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  plus: {
    fontSize: 20,
    color: '#3C3C43',
    lineHeight: 24,
  },
  uploadText: {
    fontSize: 13,
    color: '#3C3C43',
    fontWeight: '400',
  },
  resetBtn: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  resetText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  arrow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLeft: {
    left: 0,
  },
  arrowRight: {
    right: 0,
  },
  arrowText: {
    fontSize: 28,
    color: '#3C3C43',
    fontWeight: '300',
    lineHeight: 32,
  },
});
