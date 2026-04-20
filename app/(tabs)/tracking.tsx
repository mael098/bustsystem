import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { TrackingInfo } from '@/components/TrackingInfo';
import { Button } from '@/components/ui/Button';

export default function TrackingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { students, driverLocation, isSimulating, startLocationSimulation, stopLocationSimulation, currentRoute } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);

  const myChildren = students.filter(s => s.parentId === user?.id);
  const isDriverOnRoute = !!currentRoute && currentRoute.status !== 'completed' && currentRoute.status !== 'not_started';

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.centeredContent}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Please sign in to track your children
          </Text>
          <Button
            title="Sign In"
            onPress={() => router.push('/(auth)/login')}
            style={{ marginTop: Spacing.lg }}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Live Tracking</Text>
        {isDriverOnRoute && (
          <View style={[styles.liveIndicator, { backgroundColor: colors.success }]}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      {/* Driver Status Card */}
      <View style={[styles.driverCard, { backgroundColor: colors.card }, Shadow.light]}>
        <View style={styles.driverInfo}>
          <View style={[styles.driverAvatar, { backgroundColor: colors.primary }]}>
            <Ionicons name="car" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.driverDetails}>
            <Text style={[styles.driverName, { color: colors.text }]}>Carlos Rodriguez</Text>
            <Text style={[styles.driverVehicle, { color: colors.textSecondary }]}>
              Ford Transit - ABC-1234
            </Text>
          </View>
        </View>
        <View style={[styles.driverStatus, { backgroundColor: isDriverOnRoute ? `${colors.success}20` : `${colors.textMuted}20` }]}>
          <View style={[styles.statusDot, { backgroundColor: isDriverOnRoute ? colors.success : colors.textMuted }]} />
          <Text style={{ color: isDriverOnRoute ? colors.success : colors.textMuted, fontSize: FontSizes.sm, fontWeight: '500' }}>
            {isDriverOnRoute ? 'On Route' : 'Not Active'}
          </Text>
        </View>
      </View>

      {/* Simulation Controls (for demo) */}
      <View style={[styles.simControls, { backgroundColor: colors.backgroundSecondary }]}>
        <Ionicons name="flask" size={20} color={colors.warning} />
        <Text style={[styles.simText, { color: colors.textSecondary }]}>
          Demo Mode
        </Text>
        <Button
          title={isSimulating ? 'Stop Simulation' : 'Start Simulation'}
          onPress={isSimulating ? stopLocationSimulation : startLocationSimulation}
          variant={isSimulating ? 'danger' : 'primary'}
          size="sm"
        />
      </View>

      {/* Children Tracking */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Your Children ({myChildren.length})
      </Text>

      {myChildren.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No children registered yet
          </Text>
        </View>
      ) : (
        myChildren.map(child => (
          <TrackingInfo
            key={child.id}
            student={child}
            driverLocation={driverLocation}
            isDriverOnRoute={isDriverOnRoute}
          />
        ))
      )}

      {/* View Map Button */}
      <Button
        title="View on Map"
        onPress={() => router.push('/(tabs)/map')}
        fullWidth
        size="lg"
        icon={<Ionicons name="map" size={20} color="#FFFFFF" />}
        style={{ marginTop: Spacing.md }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  driverCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverDetails: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  driverName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  driverVehicle: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  driverStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  simControls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  simText: {
    flex: 1,
    fontSize: FontSizes.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.md,
    textAlign: 'center',
  },
});
