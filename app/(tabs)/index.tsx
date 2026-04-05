import { RouteCard } from "@/components/RouteCard";
import { StudentCard } from "@/components/StudentCard";
import { Button } from "@/components/ui/Button";
import { Colors, FontSizes, Spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const {
    students,
    currentRoute,
    startRoute,
    endRoute,
    updateStudentStatus,
    unreadCount,
  } = useApp();

  // Si no está autenticado
  if (!user) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <View style={styles.centeredContent}>
          <Ionicons name="bus" size={64} color={colors.primary} />
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            Bienvenido a BustSystem
          </Text>
          <Text
            style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}
          >
            Inicia sesión para continuar
          </Text>
          <Button
            title="Iniciar sesión"
            onPress={() => router.push("/(auth)/login")}
            size="lg"
            style={{ marginTop: Spacing.lg }}
          />
        </View>
      </View>
    );
  }

  // Vista de padre
  if (user.role === "parent") {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top },
        ]}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Bienvenido de nuevo,
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user.name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/notifications")}
            style={[
              styles.notifButton,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.text}
            />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.error }]}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Tus hijos
        </Text>

        {students
          .filter((s) => s.parentId === user.id)
          .map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onPress={() => router.push(`/(tabs)/map`)}
            />
          ))}

        <Button
          title="Rastrear vehículo"
          onPress={() => router.push("/(tabs)/map")}
          fullWidth
          icon={<Ionicons name="location" size={20} color="#FFFFFF" />}
        />
      </ScrollView>
    );
  }

  // Funciones del driver
  const handlePickup = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    if (student.status === "home") {
      updateStudentStatus(studentId, "picked_up");
    } else if (student.status === "at_school") {
      updateStudentStatus(studentId, "returning");
    }
  };

  const handleDropoff = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    if (student.status === "picked_up") {
      updateStudentStatus(studentId, "at_school");
    } else if (student.status === "returning") {
      updateStudentStatus(studentId, "delivered");
    }
  };

  // Vista de conductor
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            Bienvenido de nuevo,
          </Text>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user.name}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/notifications")}
            style={[
              styles.notifButton,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.text}
            />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.error }]}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={logout}
            style={[
              styles.notifButton,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Ruta */}
      <RouteCard
        route={currentRoute}
        onStartMorning={() => startRoute("morning")}
        onStartAfternoon={() => startRoute("afternoon")}
        onEndRoute={endRoute}
        studentsCount={students.length}
      />

      {/* Estudiantes */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Estudiantes ({students.length})
        </Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/students")}>
          <Text style={{ color: colors.primary, fontWeight: "500" }}>
            Ver todos
          </Text>
        </TouchableOpacity>
      </View>

      {students.slice(0, 3).map((student) => (
        <StudentCard
          key={student.id}
          student={student}
          showActions={!!currentRoute && currentRoute.status !== "completed"}
          onPickup={() => handlePickup(student.id)}
          onDropoff={() => handleDropoff(student.id)}
        />
      ))}

      {students.length > 3 && (
        <Button
          title={`Ver los ${students.length} estudiantes`}
          onPress={() => router.push("/(tabs)/students")}
          variant="outline"
          fullWidth
        />
      )}
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
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  welcomeTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: "700",
    marginTop: Spacing.lg,
  },
  welcomeSubtitle: {
    fontSize: FontSizes.md,
    marginTop: Spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSizes.sm,
  },
  userName: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
  },
});
