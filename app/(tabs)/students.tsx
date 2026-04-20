import { ChildFormData, CreateChildModal } from "@/components/CreateChildModal";
import { StudentCard } from "@/components/StudentCard";
import { BorderRadius, Colors, FontSizes, Spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Location, Student } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function StudentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    updateStudentStatus,
    currentRoute,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<ChildFormData>({
    name: "",
    age: "",
    schoolName: "",
    schoolAddress: "",
    schoolLocation: null,
    homeAddress: "",
    homeLocation: null,
    parentPhone: "",
    notes: "",
  });

  const isParent = user?.role === "parent";

  const visibleStudents = isParent
    ? students.filter((s) => s.parentId === user.id)
    : students;

  const filteredStudents = visibleStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.school.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      schoolName: "",
      schoolAddress: "",
      schoolLocation: null,
      homeAddress: "",
      homeLocation: null,
      parentPhone: "",
      notes: "",
    });
    setEditingStudent(null);
  };

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        age: student.age.toString(),
        schoolName: student.school.name,
        schoolAddress: student.school.address,
        schoolLocation: student.school.location,
        homeAddress: student.homeAddress,
        homeLocation: student.homeLocation,
        parentPhone: student.parentPhone,
        notes: student.notes || "",
      });
    } else {
      resetForm();
    }
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    resetForm();
  };

  const handleFormFieldChange = (
    field: keyof ChildFormData,
    value: string | Location | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (
      !formData.name.trim() ||
      !formData.age.trim() ||
      !formData.homeAddress.trim() ||
      !formData.schoolAddress.trim()
    ) {
      Alert.alert("Error", "Completa los campos obligatorios");
      return;
    }

    if (!formData.homeLocation || !formData.schoolLocation) {
      Alert.alert(
        "Ubicaciones requeridas",
        "Marca en el mapa la ubicación de la casa y de la escuela.",
      );
      return;
    }

    if (!isParent || !user?.id) {
      Alert.alert("Error", "Solo un padre puede crear hijos");
      return;
    }

    const parsedAge = Number.parseInt(formData.age, 10);
    if (!Number.isFinite(parsedAge) || parsedAge <= 0) {
      Alert.alert("Error", "La edad debe ser un número válido");
      return;
    }

    const studentData = {
      name: formData.name.trim(),
      age: parsedAge,
      school: {
        name: formData.schoolName.trim() || "Not specified",
        address: formData.schoolAddress.trim(),
        location: formData.schoolLocation,
      },
      homeAddress: formData.homeAddress.trim(),
      homeLocation: formData.homeLocation,
      parentId: user.id,
      parentPhone: formData.parentPhone.trim() || "Not provided",
      notes: formData.notes.trim() || undefined,
    };

    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, studentData);
      } else {
        await addStudent(studentData);
      }

      handleCloseModal();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo guardar el estudiante";
      Alert.alert("Error", message);
    }
  };

  const handleDelete = (student: Student) => {
    Alert.alert(
      "Delete Student",
      `Are you sure you want to remove ${student.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void deleteStudent(student.id);
          },
        },
      ],
    );
  };

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

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Students</Text>
        {isParent && (
          <TouchableOpacity
            onPress={() => handleOpenModal()}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: colors.backgroundSecondary },
        ]}
      >
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          placeholder="Search students..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { color: colors.text }]}
          placeholderTextColor={colors.textMuted}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Student List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredStudents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={48}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {searchQuery ? "No students found" : "No students added yet"}
            </Text>
          </View>
        ) : (
          filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              showActions={
                !!currentRoute && currentRoute.status !== "completed"
              }
              onPress={() => handleOpenModal(student)}
              onPickup={() => handlePickup(student.id)}
              onDropoff={() => handleDropoff(student.id)}
            />
          ))
        )}
      </ScrollView>

      <CreateChildModal
        visible={isModalVisible}
        editingStudent={editingStudent}
        formData={formData}
        onFieldChange={handleFormFieldChange}
        onClose={handleCloseModal}
        onSave={handleSave}
        onDelete={
          editingStudent
            ? () => {
                handleCloseModal();
                handleDelete(editingStudent);
              }
            : undefined
        }
      />
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    paddingVertical: Spacing.xs,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl * 2,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.md,
  },
});
