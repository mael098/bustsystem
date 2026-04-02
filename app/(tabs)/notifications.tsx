import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/context/AppContext';
import { NotificationItem } from '@/components/NotificationItem';
import { Button } from '@/components/ui/Button';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { notifications, markNotificationRead, clearNotifications, unreadCount, addNotification } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleNotificationPress = (id: string) => {
    markNotificationRead(id);
  };

  const markAllAsRead = () => {
    notifications.forEach(n => {
      if (!n.read) markNotificationRead(n.id);
    });
  };

  // Demo: Add a sample notification
  const addSampleNotification = () => {
    const types = ['pickup', 'dropoff', 'arrival_school', 'arrival_home', 'info'] as const;
    const messages = [
      { type: 'pickup', title: 'Child Picked Up', message: 'Sofia has been picked up from home.' },
      { type: 'dropoff', title: 'Child Dropped Off', message: 'James has been dropped off at school.' },
      { type: 'arrival_school', title: 'Arrived at School', message: 'All students have arrived safely at school.' },
      { type: 'arrival_home', title: 'Arrived Home', message: 'Emma has been delivered home safely.' },
      { type: 'info', title: 'Route Update', message: 'The driver has started the afternoon route.' },
    ];
    
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    addNotification({
      type: randomMsg.type,
      title: randomMsg.title,
      message: randomMsg.message,
    });
  };

  const todayNotifications = notifications.filter(n => {
    const today = new Date();
    const notifDate = new Date(n.timestamp);
    return notifDate.toDateString() === today.toDateString();
  });

  const olderNotifications = notifications.filter(n => {
    const today = new Date();
    const notifDate = new Date(n.timestamp);
    return notifDate.toDateString() !== today.toDateString();
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={{ color: colors.primary, fontWeight: '500' }}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Demo Controls */}
        <View style={[styles.demoControls, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="flask" size={18} color={colors.warning} />
          <Text style={[styles.demoText, { color: colors.textSecondary }]}>Demo Mode</Text>
          <Button
            title="Add Notification"
            onPress={addSampleNotification}
            variant="outline"
            size="sm"
          />
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Notifications
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {"You'll receive notifications about your children's transportation status here."}
            </Text>
          </View>
        ) : (
          <>
            {/* Today's Notifications */}
            {todayNotifications.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  Today
                </Text>
                {todayNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onPress={() => handleNotificationPress(notification.id)}
                  />
                ))}
              </>
            )}

            {/* Older Notifications */}
            {olderNotifications.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
                  Earlier
                </Text>
                {olderNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onPress={() => handleNotificationPress(notification.id)}
                  />
                ))}
              </>
            )}

            {/* Clear All Button */}
            <Button
              title="Clear All Notifications"
              onPress={clearNotifications}
              variant="ghost"
              fullWidth
              style={{ marginTop: Spacing.lg }}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  demoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  demoText: {
    flex: 1,
    fontSize: FontSizes.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },
});
