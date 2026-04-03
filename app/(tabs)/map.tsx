import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Colors, getStatusColor } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Student } from "@/types";

const initialRegion = {
  //22.4062998,-97.9300608
  latitude: 22.4062998,
  longitude: -97.9300608,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();

  const { user } = useAuth();
  const {
    students,
    driverLocation,
    updateDriverLocation,
    currentRoute,
    isSimulating,
    startLocationSimulation,
    stopLocationSimulation,
  } = useApp();

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  const isDriverOnRoute =
    !!currentRoute &&
    currentRoute.status !== "completed" &&
    currentRoute.status !== "not_started";

  const visibleStudents =
    user?.role === "parent"
      ? students.filter((s) => s.parentId === user.id)
      : students;

  // 📍 TRACKING REAL DEL DISPOSITIVO
  useEffect(() => {
    let subscription: any;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (location) => {
          updateDriverLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        },
      );
    };

    startTracking();

    return () => subscription?.remove();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* MAPA REAL */}
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation
      >
        {/* 👦 ESTUDIANTES */}
        {visibleStudents.map((student) => (
          <Marker
            key={student.id}
            coordinate={{
              latitude: student.homeLocation.latitude,
              longitude: student.homeLocation.longitude,
            }}
            onPress={() =>
              setSelectedStudent(
                selectedStudent?.id === student.id ? null : student,
              )
            }
          >
            <View
              style={[
                styles.marker,
                {
                  backgroundColor: getStatusColor(
                    student.status,
                    colorScheme === "dark",
                  ),
                },
              ]}
            >
              <Ionicons name="person" size={16} color="#fff" />
            </View>
          </Marker>
        ))}

        {/* 🏫 ESCUELAS */}
        {[...new Set(visibleStudents.map((s) => s.school.name))].map(
          (schoolName, idx) => {
            const student = visibleStudents.find(
              (s) => s.school.name === schoolName,
            );
            if (!student) return null;

            return (
              <Marker
                key={`school-${idx}`}
                coordinate={{
                  latitude: student.school.location.latitude,
                  longitude: student.school.location.longitude,
                }}
              >
                <View
                  style={[
                    styles.schoolMarker,
                    { backgroundColor: colors.success },
                  ]}
                >
                  <Ionicons name="school" size={18} color="#fff" />
                </View>
              </Marker>
            );
          },
        )}

        {/* 🚍 BUS */}
        {driverLocation && isDriverOnRoute && (
          <Marker
            coordinate={{
              latitude: driverLocation.latitude,
              longitude: driverLocation.longitude,
            }}
          >
            <View
              style={[styles.busMarker, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="bus" size={20} color="#fff" />
            </View>
          </Marker>
        )}

        {/* 🛣️ RUTA */}
        {currentRoute && (
          <Polyline
            coordinates={currentRoute.points.map((p) => ({
              latitude: p.location.latitude,
              longitude: p.location.longitude,
            }))}
            strokeWidth={4}
            strokeColor={colors.primary}
          />
        )}
      </MapView>

      {/* BOTÓN INFO */}
      <View style={[styles.topControls, { top: insets.top + 20 }]}>
        <TouchableOpacity
          onPress={() => setShowLegend(!showLegend)}
          style={[styles.controlButton, { backgroundColor: colors.card }]}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* LEYENDA */}
      {showLegend && (
        <View style={[styles.legend, { backgroundColor: colors.card }]}>
          <Text style={[styles.legendTitle, { color: colors.text }]}>
            Legend
          </Text>

          <Text style={{ color: colors.textSecondary }}>🟢 Bus</Text>
          <Text style={{ color: colors.textSecondary }}>🏫 School</Text>
          <Text style={{ color: colors.textSecondary }}>👦 Student</Text>
        </View>
      )}

      {/* BOTTOM SHEET */}
      <View style={[styles.bottomSheet, { backgroundColor: colors.card }]}>
        {selectedStudent ? (
          <View>
            <Text style={[styles.studentName, { color: colors.text }]}>
              {selectedStudent.name}
            </Text>

            <StatusBadge status={selectedStudent.status} />

            <Text style={{ color: colors.textSecondary }}>
              {selectedStudent.homeAddress}
            </Text>
          </View>
        ) : (
          <View>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              Route Overview
            </Text>

            <Button
              title={isSimulating ? "Stop" : "Simulate"}
              onPress={
                isSimulating ? stopLocationSimulation : startLocationSimulation
              }
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  schoolMarker: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  busMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },

  topControls: {
    position: "absolute",
    right: 20,
  },

  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  legend: {
    position: "absolute",
    top: 100,
    right: 20,
    padding: 12,
    borderRadius: 12,
  },

  legendTitle: {
    fontWeight: "600",
    marginBottom: 8,
  },

  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  studentName: {
    fontSize: 18,
    fontWeight: "600",
  },

  sheetTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
});
