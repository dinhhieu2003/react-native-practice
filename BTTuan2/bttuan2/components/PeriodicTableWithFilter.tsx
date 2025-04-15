import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView, GestureDetector, Gesture, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import Element from '@/components/Element';
import * as api from '@/api/api';
import { ElementType } from '@/utils/types/type';
import { getElementColor } from '@/utils/colors';

const cellSize = 50; // Kích thước ô
const spacing = 1;   // Khoảng cách giữa các ô - Adjusted to match podcasts.tsx
const elements: ElementType[] = api.getElements();

interface PeriodicTableWithFilterProps {
  onElementPress: (element: ElementType) => void;
  selectedElementId?: number | null; // Optional: To highlight the selected element
}

const PeriodicTableWithFilter: React.FC<PeriodicTableWithFilterProps> = ({
  onElementPress,
  selectedElementId,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const scale = useSharedValue(1); // Zoom state is internal to the component

  // Zoom gesture handling
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = event.scale;
    })
    .onEnd(() => {
      scale.value = withSpring(Math.max(1, Math.min(scale.value, 3)));
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Filter toggle functions
  const toggleGroup = (group: number) => {
    setSelectedGroup(selectedGroup === group ? null : group);
  };

  const togglePeriod = (period: number) => {
    setSelectedPeriod(selectedPeriod === period ? null : period);
  };

  return (
    // Note: GestureHandlerRootView should be provided by the parent screen
    <View style={styles.container}>
      {/* Filter buttons */}
      <View style={styles.filterContainer}>
         <View style={styles.groupFilter}>
            <Text style={styles.filterLabel}>Group: </Text>
            {[...Array(18)].map((_, index) => {
                const group = index + 1;
                const isSelected = selectedGroup === group;
                return (
                    <TouchableOpacity
                    key={`group-${group}`}
                    style={[
                        styles.groupButton,
                        { backgroundColor: isSelected ? getElementColor(`Group ${group}`) : '#ccc' },
                    ]}
                    onPress={() => toggleGroup(group)}>
                    <Text style={styles.groupText}>{group}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
         <View style={styles.groupFilter}>
            <Text style={styles.filterLabel}>Period: </Text>
            {[...Array(7)].map((_, index) => {
            const period = index + 1;
            const isSelected = selectedPeriod === period;
            return (
                <TouchableOpacity
                key={`period-${period}`}
                style={[styles.groupButton, { backgroundColor: isSelected ? '#007BFF' : '#ccc' }]}
                onPress={() => togglePeriod(period)}>
                <Text style={styles.groupText}>{period}</Text>
                </TouchableOpacity>
            );
            })}
        </View>
      </View>

      {/* Periodic table */}
      <GestureDetector gesture={pinchGesture}>
        <Animated.View style={[styles.animatedContainer, animatedStyle]}>
          <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <View style={styles.table}>
                {elements.map((el) => {
                  // Dimming logic based on internal filter state
                  let isDimmed =
                    (selectedGroup !== null && el.group !== selectedGroup) ||
                    (selectedPeriod !== null && el.period !== selectedPeriod);

                  if ((el.type === 'Actinide' || el.type === 'Lanthanide') && (selectedGroup !== null || selectedPeriod !== null)) {
                    isDimmed = true;
                  }

                  // Selection highlighting based on prop
                  const isSelected = selectedElementId === el.atomic_number;

                  // Determine color: Highlight if selected externally, dim if filtered internally, otherwise standard color
                  const color = isSelected
                    ? '#3498db' // Highlight color for selected element (passed via prop)
                    : isDimmed
                    ? '#ccc' // Dim color if filtered out by internal state
                    : getElementColor(el.type); // Standard color

                  return (
                    <TouchableWithoutFeedback
                      key={el.atomic_number}
                      onPress={() => onElementPress(el)} // Use the passed callback
                    >
                      <Element
                        symbol={el.symbol}
                        row={el.period}
                        col={el.group}
                        color={color}
                        atomic_number={el.atomic_number}
                      />
                    </TouchableWithoutFeedback>
                  );
                })}
              </View>
            </ScrollView>
          </ScrollView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

// Styles moved from index.tsx/podcasts.tsx (ensure consistency)
const styles = StyleSheet.create({
    container: {
        flex: 1, // Take available space in parent
        flexDirection: 'column',
    },
    filterContainer: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    filterLabel: {
        marginRight: 5,
        fontWeight: 'bold',
        fontSize: 12,
    },
    groupFilter: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: 5,
    },
    groupButton: {
        width: 22,
        height: 22,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    groupText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: 'black',
    },
    // Table container styles
    animatedContainer: {
        flex: 1, // Allow table area to grow
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden', // Hide parts of the table zoomed out of view
    },
    scrollContainer: {
        width: 18 * (cellSize + spacing) + 100,
        height: 10 * (cellSize + spacing) + 40,
        paddingVertical: 20,
        paddingHorizontal: 50,
    },
    table: {
        width: 18 * (cellSize + spacing),
        height: 10 * (cellSize + spacing),
        position: 'relative',
    },
});

export default PeriodicTableWithFilter; 