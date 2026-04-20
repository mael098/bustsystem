import { BorderRadius, Colors, FontSizes, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Location, Student } from "@/types";
import * as ExpoLocation from "expo-location";
import React, { useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

const DEFAULT_HOME_LOCATION: Location = {
  latitude: 40.7128,
  longitude: -74.006,
};

export interface ChildFormData {
  name: string;
  age: string;
  schoolName: string;
  schoolAddress: string;
  schoolLocation: Location | null;
  homeAddress: string;
  homeLocation: Location | null;
  parentPhone: string;
  notes: string;
}

interface CreateChildModalProps {
  visible: boolean;
  editingStudent: Student | null;
  formData: ChildFormData;
  onFieldChange: (
    field: keyof ChildFormData,
    value: string | Location | null,
  ) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

export function CreateChildModal({
  visible,
  editingStudent,
  formData,
  onFieldChange,
  onClose,
  onSave,
  onDelete,
}: CreateChildModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [activeTarget, setActiveTarget] = useState<"home" | "school">("home");

  const mapCenter =
    activeTarget === "home"
      ? (formData.homeLocation ?? formData.schoolLocation ?? DEFAULT_HOME_LOCATION)
      : (formData.schoolLocation ?? formData.homeLocation ?? DEFAULT_HOME_LOCATION);

  const updateLocation = (target: "home" | "school", location: Location) => {
    if (target === "home") {
      onFieldChange("homeLocation", location);
      return;
    }

    onFieldChange("schoolLocation", location);
  };

  const reverseGeocodeAndFillAddress = async (
    target: "home" | "school",
    location: Location,
  ) => {
    try {
      const places = await ExpoLocation.reverseGeocodeAsync(location);
      const place = places[0];
      if (!place) return;

      const resolvedAddress = [
        place.street,
        place.streetNumber,
        place.city,
        place.region,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      if (!resolvedAddress) return;

      if (target === "home") {
        onFieldChange("homeAddress", resolvedAddress);
      } else {
        onFieldChange("schoolAddress", resolvedAddress);
      }
    } catch {
      // Keep manual address if reverse geocoding fails.
    }
  };

  const geocodeAddress = async (target: "home" | "school") => {
    const address =
      target === "home" ? formData.homeAddress : formData.schoolAddress;
    if (!address.trim()) {
      Alert.alert(
        "Dirección requerida",
        "Escribe una dirección antes de buscar.",
      );
      return;
    }

    try {
      const matches = await ExpoLocation.geocodeAsync(address.trim());
      if (!matches.length) {
        Alert.alert(
          "Sin resultados",
          "No se encontró la dirección en el mapa.",
        );
        return;
      }

      const location = {
        latitude: matches[0].latitude,
        longitude: matches[0].longitude,
      };

      updateLocation(target, location);
      setActiveTarget(target);
    } catch {
      Alert.alert("Error", "No se pudo buscar la dirección en este momento.");
    }
  };

  const handleMapPress = async (latitude: number, longitude: number) => {
    const location = { latitude, longitude };
    updateLocation(activeTarget, location);
    await reverseGeocodeAndFillAddress(activeTarget, location);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalContainer, { backgroundColor: colors.background }]}
      >
        <View
          style={[styles.modalHeader, { borderBottomColor: colors.border }]}
        >
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: colors.primary, fontSize: FontSizes.md }}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {editingStudent ? "Edit Child" : "Add Child"}
          </Text>
          <TouchableOpacity onPress={onSave}>
            <Text
              style={{
                color: colors.primary,
                fontSize: FontSizes.md,
                fontWeight: "600",
              }}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          <Input
            label="Nombre completo *"
            placeholder="Escribe el nombre del hijo"
            value={formData.name}
            onChangeText={(v) => onFieldChange("name", v)}
            leftIcon="person-outline"
          />
          <Input
            label="Edad *"
            placeholder="Escribe la edad"
            value={formData.age}
            onChangeText={(v) => onFieldChange("age", v)}
            keyboardType="number-pad"
            leftIcon="calendar-outline"
          />
          <Input
            label="Nombre de la escuela"
            placeholder="Escribe el nombre de la escuela"
            value={formData.schoolName}
            onChangeText={(v) => onFieldChange("schoolName", v)}
            leftIcon="school-outline"
          />

          <Input
            label="Dirección de la escuela *"
            placeholder="Escribe la dirección de la escuela"
            value={formData.schoolAddress}
            onChangeText={(v) => onFieldChange("schoolAddress", v)}
            leftIcon="location-outline"
          />
          <Button
            title="Buscar escuela en el mapa"
            onPress={() => {
              void geocodeAddress("school");
            }}
            variant="outline"
            size="sm"
            fullWidth
            style={styles.actionButton}
          />

          <Input
            label="Dirección de casa *"
            placeholder="Escribe la dirección de casa"
            value={formData.homeAddress}
            onChangeText={(v) => onFieldChange("homeAddress", v)}
            leftIcon="home-outline"
          />
          <Button
            title="Buscar casa en el mapa"
            onPress={() => {
              void geocodeAddress("home");
            }}
            variant="outline"
            size="sm"
            fullWidth
            style={styles.actionButton}
          />

          <View style={styles.targetRow}>
            <TouchableOpacity
              onPress={() => setActiveTarget("home")}
              style={[
                styles.targetPill,
                {
                  borderColor: colors.border,
                  backgroundColor:
                    activeTarget === "home"
                      ? colors.primary
                      : colors.backgroundSecondary,
                },
              ]}
            >
              <Text
                style={{
                  color: activeTarget === "home" ? "#FFFFFF" : colors.text,
                  fontWeight: "600",
                }}
              >
                Marcar casa
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTarget("school")}
              style={[
                styles.targetPill,
                {
                  borderColor: colors.border,
                  backgroundColor:
                    activeTarget === "school"
                      ? colors.primary
                      : colors.backgroundSecondary,
                },
              ]}
            >
              <Text
                style={{
                  color: activeTarget === "school" ? "#FFFFFF" : colors.text,
                  fontWeight: "600",
                }}
              >
                Marcar escuela
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.mapHint, { color: colors.textSecondary }]}>
            Toca el mapa para guardar coordenadas de{" "}
            {activeTarget === "home" ? "casa" : "escuela"}.
          </Text>

          <MapView
            style={styles.map}
            region={{
              latitude: mapCenter.latitude,
              longitude: mapCenter.longitude,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            }}
            onPress={(event) => {
              const { latitude, longitude } = event.nativeEvent.coordinate;
              void handleMapPress(latitude, longitude);
            }}
          >
            {formData.homeLocation && (
              <Marker
                coordinate={formData.homeLocation}
                pinColor="#2E7D32"
                title="Casa"
                description={formData.homeAddress || "Ubicación de casa"}
              />
            )}
            {formData.schoolLocation && (
              <Marker
                coordinate={formData.schoolLocation}
                pinColor="#C62828"
                title="Escuela"
                description={formData.schoolAddress || "Ubicación de escuela"}
              />
            )}
          </MapView>

          <Input
            label="Teléfono del padre"
            placeholder="Escribe teléfono del padre"
            value={formData.parentPhone}
            onChangeText={(v) => onFieldChange("parentPhone", v)}
            keyboardType="phone-pad"
            leftIcon="call-outline"
          />
          <Input
            label="Notas"
            placeholder="Alergias, observaciones, etc."
            value={formData.notes}
            onChangeText={(v) => onFieldChange("notes", v)}
            leftIcon="document-text-outline"
            multiline
          />

          {editingStudent && onDelete && (
            <Button
              title="Delete Child"
              onPress={onDelete}
              variant="danger"
              fullWidth
              style={{ marginTop: Spacing.lg }}
            />
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: Spacing.md,
  },
  actionButton: {
    marginTop: -Spacing.xs,
    marginBottom: Spacing.md,
  },
  targetRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  targetPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
  },
  mapHint: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.sm,
  },
  map: {
    height: 240,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
});
