import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadow, getStatusColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import type { Student } from '@/types';

// For web/preview, we'll create a simulated map view
// In a real app, you would use react-native-maps with MapView

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Map center (New York area)
const initialRegion = {
  latitude: 40.7178,
  longitude: -74.0031,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { students, driverLocation, currentRoute, isSimulating, startLocationSimulation, stopLocationSimulation } = useApp();

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  const isDriverOnRoute = !!currentRoute && currentRoute.status !== 'completed' && currentRoute.status !== 'not_started';

  // Filter students for parent view
  const visibleStudents = user?.role === 'parent' 
    ? students.filter(s => s.parentId === user.id)
    : students;

  // Convert lat/lng to percentage position on map
  const locationToPosition = (lat: number, lng: number) => {
    const mapBounds = {
      minLat: 40.705,
      maxLat: 40.740,
      minLng: -74.015,
      maxLng: -73.990,
    };
    
    const x = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
    const y = ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
    
    return { x: Math.min(Math.max(x, 5), 95), y: Math.min(Math.max(y, 5), 95) };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Map Container */}
      <View style={[styles.mapContainer, { backgroundColor: colors.backgroundSecondary }]}>
        {/* Simulated Map Background */}
        <View style={styles.mapBackground}>
          {/* Grid lines to simulate map */}
          {[...Array(10)].map((_, i) => (
            <View
              key={`h-${i}`}
              style={[
                styles.gridLineH,
                { top: `${i * 10}%`, backgroundColor: colors.border },
              ]}
            />
          ))}
          {[...Array(10)].map((_, i) => (
            <View
              key={`v-${i}`}
              style={[
                styles.gridLineV,
                { left: `${i * 10}%`, backgroundColor: colors.border },
              ]}
            />
          ))}

          {/* Student Markers */}
          {visibleStudents.map(student => {
            const pos = locationToPosition(student.homeLocation.latitude, student.homeLocation.longitude);
            const isSelected = selectedStudent?.id === student.id;
            const statusColor = getStatusColor(student.status, colorScheme === 'dark');

            return (
              <TouchableOpacity
                key={student.id}
                onPress={() => setSelectedStudent(isSelected ? null : student)}
                style={[
                  styles.marker,
                  {
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    backgroundColor: statusColor,
                    transform: [{ scale: isSelected ? 1.3 : 1 }],
                  },
                  isSelected && styles.markerSelected,
                ]}
              >
                <Ionicons name="person" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            );
          })}

          {/* School Markers */}
          {[...new Set(visibleStudents.map(s => s.school.name))].map((schoolName, idx) => {
            const student = visibleStudents.find(s => s.school.name === schoolName);
            if (!student) return null;
            const pos = locationToPosition(student.school.location.latitude, student.school.location.longitude);
            
            return (
              <View
                key={`school-${idx}`}
                style={[
                  styles.schoolMarker,
                  {
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    backgroundColor: colors.success,
                  },
                ]}
              >
                <Ionicons name="school" size={18} color="#FFFFFF" />
              </View>
            );
          })}

          {/* Driver/Bus Marker */}
          {driverLocation && isDriverOnRoute && (
            <View
              style={[
                styles.busMarker,
                {
                  left: `${locationToPosition(driverLocation.latitude, driverLocation.longitude).x}%`,
                  top: `${locationToPosition(driverLocation.latitude, driverLocation.longitude).y}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <Ionicons name="bus" size={20} color="#FFFFFF" />
            </View>
          )}

          {/* Map Label */}
          <View style={[styles.mapLabel, { backgroundColor: `${colors.background}CC` }]}>
            <Ionicons name="map" size={16} color={colors.textMuted} />
            <Text style={[styles.mapLabelText, { color: colors.textMuted }]}>
              Interactive Map View
            </Text>
          </View>
        </View>

        {/* Top Controls */}
        <View style={[styles.topControls, { top: insets.top + Spacing.md }]}>
          <TouchableOpacity
            onPress={() => setShowLegend(!showLegend)}
            style={[styles.controlButton, { backgroundColor: colors.card }, Shadow.light]}
          >
            <Ionicons name="information-circle-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Legend */}
      {showLegend && (
        <View style={[styles.legend, { backgroundColor: colors.card }, Shadow.medium]}>
          <Text style={[styles.legendTitle, { color: colors.text }]}>Legend</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendMarker, { backgroundColor: colors.primary }]}>
                <Ionicons name="bus" size={12} color="#FFFFFF" />
              </View>
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Bus</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendMarker, { backgroundColor: colors.success }]}>
                <Ionicons name="school" size={12} color="#FFFFFF" />
              </View>
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>School</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendMarker, { backgroundColor: colors.statusHome }]}>
                <Ionicons name="person" size={12} color="#FFFFFF" />
              </View>
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Student</Text>
            </View>
          </View>
        </View>
      )}

      {/* Bottom Sheet */}
      <View style={[styles.bottomSheet, { backgroundColor: colors.card }, Shadow.heavy]}>
        {selectedStudent ? (
          <View>
            <View style={styles.bottomSheetHeader}>
              <View style={[styles.studentAvatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.studentAvatarText}>
                  {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={[styles.studentName, { color: colors.text }]}>
                  {selectedStudent.name}
                </Text>
                <Text style={[styles.studentSchool, { color: colors.textSecondary }]}>
                  {selectedStudent.school.name}
                </Text>
              </View>
              <StatusBadge status={selectedStudent.status} />
            </View>
            <View style={styles.studentDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="home-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {selectedStudent.homeAddress}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  {selectedStudent.parentPhone}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              {isDriverOnRoute ? 'Route Active' : 'Route Overview'}
            </Text>
            <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
              {visibleStudents.length} students on route
            </Text>
            
            {/* Simulation Controls */}
            <View style={styles.simRow}>
              <Button
                title={isSimulating ? 'Stop Simulation' : 'Simulate Route'}
                onPress={isSimulating ? stopLocationSimulation : startLocationSimulation}
                variant={isSimulating ? 'danger' : 'primary'}
                size="sm"
                icon={<Ionicons name={isSimulating ? 'stop' : 'play'} size={16} color="#FFFFFF" />}
                fullWidth
              />
            </View>
            
            {/* Quick Student List */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickList}>
              {visibleStudents.map(student => (
                <TouchableOpacity
                  key={student.id}
                  onPress={() => setSelectedStudent(student)}
                  style={[styles.quickItem, { backgroundColor: colors.backgroundSecondary }]}
                >
                  <View style={[styles.quickAvatar, { backgroundColor: getStatusColor(student.status, colorScheme === 'dark') }]}>
                    <Text style={styles.quickAvatarText}>{student.name[0]}</Text>
                  </View>
                  <Text style={[styles.quickName, { color: colors.text }]} numberOfLines={1}>
                    {student.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.3,
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    opacity: 0.3,
  },
  marker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -16,
    marginTop: -16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerSelected: {
    borderWidth: 3,
    zIndex: 10,
  },
  schoolMarker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -20,
    marginTop: -20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  busMarker: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -22,
    marginTop: -22,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    zIndex: 20,
  },
  mapLabel: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  mapLabelText: {
    fontSize: FontSizes.xs,
  },
  topControls: {
    position: 'absolute',
    right: Spacing.md,
    zIndex: 10,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    position: 'absolute',
    top: 100,
    right: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    minWidth: 120,
  },
  legendTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  legendItems: {
    gap: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legendMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendText: {
    fontSize: FontSizes.xs,
  },
  bottomSheet: {
    padding: Spacing.lg,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: Spacing.xxl,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  studentInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  studentName: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  studentSchool: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  studentDetails: {
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    flex: 1,
    fontSize: FontSizes.sm,
  },
  sheetTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  sheetSubtitle: {
    fontSize: FontSizes.sm,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  simRow: {
    marginBottom: Spacing.md,
  },
  quickList: {
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  quickItem: {
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.sm,
    minWidth: 70,
  },
  quickAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  quickAvatarText: {
    color: '#FFFFFF',
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  quickName: {
    fontSize: FontSizes.xs,
  },
});
