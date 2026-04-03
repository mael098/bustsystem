import { NotificationItem } from "@/components/NotificationItem";
import { Button } from "@/components/ui/Button";
import { BorderRadius, Colors, FontSizes, Spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { NotificationType } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const {
    notifications,
    markNotificationRead,
    clearNotifications,
    unreadCount,
    addNotification,
  } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleNotificationPress = (id: string) => {
    markNotificationRead(id);
  };

  const markAllAsRead = () => {
    notifications.forEach((n) => {
      if (!n.read) markNotificationRead(n.id);
    });
  };

  // Demo: agregar notificación de prueba
  const addSampleNotification = () => {
    const messages = [
      {
        type: "pickup",
        title: "Niño recogido",
        message: "Sofía ha sido recogida de casa.",
      },
      {
        type: "dropoff",
        title: "Niño dejado",
        message: "James ha sido dejado en la escuela.",
      },
      {
        type: "arrival_school",
        title: "Llegada a la escuela",
        message: "Todos los estudiantes llegaron con seguridad.",
      },
      {
        type: "arrival_home",
        title: "Llegada a casa",
        message: "Emma ha sido entregada en casa.",
      },
      {
        type: "info",
        title: "Actualización de ruta",
        message: "El conductor inició la ruta de la tarde.",
      },
    ];

    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    addNotification({
      type: randomMsg.type as NotificationType,
      title: randomMsg.title,
      message: randomMsg.message,
    });
  };

  const todayNotifications = notifications.filter((n) => {
    const today = new Date();
    const notifDate = new Date(n.timestamp);
    return notifDate.toDateString() === today.toDateString();
  });

  const olderNotifications = notifications.filter((n) => {
    const today = new Date();
    const notifDate = new Date(n.timestamp);
    return notifDate.toDateString() !== today.toDateString();
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Notificaciones
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={{ color: colors.primary, fontWeight: "500" }}>
              Marcar todas como leídas
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Demo */}
        <View
          style={[
            styles.demoControls,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <Ionicons name="flask" size={18} color={colors.warning} />
          <Text style={[styles.demoText, { color: colors.textSecondary }]}>
            Modo demo
          </Text>
          <Button
            title="Agregar notificación"
            onPress={addSampleNotification}
            variant="outline"
            size="sm"
          />
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-off-outline"
              size={64}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Sin notificaciones
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Recibirás notificaciones sobre el transporte de tus hijos aquí.
            </Text>
          </View>
        ) : (
          <>
            {/* Hoy */}
            {todayNotifications.length > 0 && (
              <>
                <Text
                  style={[styles.sectionTitle, { color: colors.textSecondary }]}
                >
                  Hoy
                </Text>
                {todayNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onPress={() => handleNotificationPress(notification.id)}
                  />
                ))}
              </>
            )}

            {/* Anteriores */}
            {olderNotifications.length > 0 && (
              <>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: colors.textSecondary, marginTop: Spacing.lg },
                  ]}
                >
                  Anteriores
                </Text>
                {olderNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onPress={() => handleNotificationPress(notification.id)}
                  />
                ))}
              </>
            )}

            {/* Limpiar */}
            <Button
              title="Eliminar todas las notificaciones"
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: "700",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  demoControls: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl * 2,
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "600",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSizes.md,
    textAlign: "center",
    lineHeight: 22,
  },
});
