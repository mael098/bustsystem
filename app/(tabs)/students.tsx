import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/context/AppContext';
import { StudentCard } from '@/components/StudentCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Student } from '@/types';

export default function StudentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { students, addStudent, updateStudent, deleteStudent, updateStudentStatus, currentRoute } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    schoolName: '',
    schoolAddress: '',
    homeAddress: '',
    parentPhone: '',
    notes: '',
  });

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.school.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      schoolName: '',
      schoolAddress: '',
      homeAddress: '',
      parentPhone: '',
      notes: '',
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
        homeAddress: student.homeAddress,
        parentPhone: student.parentPhone,
        notes: student.notes || '',
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

  const handleSave = () => {
    if (!formData.name.trim() || !formData.age || !formData.homeAddress.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const studentData = {
      name: formData.name.trim(),
      age: parseInt(formData.age, 10),
      school: {
        name: formData.schoolName.trim() || 'Not specified',
        address: formData.schoolAddress.trim() || 'Not specified',
        location: { latitude: 40.7282, longitude: -73.9942 }, // Default location
      },
      homeAddress: formData.homeAddress.trim(),
      homeLocation: { latitude: 40.7128, longitude: -74.006 }, // Default location
      parentId: 'parent-1',
      parentPhone: formData.parentPhone.trim() || 'Not provided',
      notes: formData.notes.trim() || undefined,
    };

    if (editingStudent) {
      updateStudent(editingStudent.id, studentData);
    } else {
      addStudent(studentData);
    }

    handleCloseModal();
  };

  const handleDelete = (student: Student) => {
    Alert.alert(
      'Delete Student',
      `Are you sure you want to remove ${student.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteStudent(student.id),
        },
      ]
    );
  };

  const handlePickup = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    if (student.status === 'home') {
      updateStudentStatus(studentId, 'picked_up');
    } else if (student.status === 'at_school') {
      updateStudentStatus(studentId, 'returning');
    }
  };

  const handleDropoff = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    if (student.status === 'picked_up') {
      updateStudentStatus(studentId, 'at_school');
    } else if (student.status === 'returning') {
      updateStudentStatus(studentId, 'delivered');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Students</Text>
        <TouchableOpacity
          onPress={() => handleOpenModal()}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          placeholder="Search students..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { color: colors.text }]}
          placeholderTextColor={colors.textMuted}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
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
            <Ionicons name="people-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {searchQuery ? 'No students found' : 'No students added yet'}
            </Text>
          </View>
        ) : (
          filteredStudents.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              showActions={!!currentRoute && currentRoute.status !== 'completed'}
              onPress={() => handleOpenModal(student)}
              onPickup={() => handlePickup(student.id)}
              onDropoff={() => handleDropoff(student.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseModal}>
              <Text style={{ color: colors.primary, fontSize: FontSizes.md }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingStudent ? 'Edit Student' : 'Add Student'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={{ color: colors.primary, fontSize: FontSizes.md, fontWeight: '600' }}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Input
              label="Full Name *"
              placeholder="Enter student name"
              value={formData.name}
              onChangeText={v => setFormData({ ...formData, name: v })}
              leftIcon="person-outline"
            />
            <Input
              label="Age *"
              placeholder="Enter age"
              value={formData.age}
              onChangeText={v => setFormData({ ...formData, age: v })}
              keyboardType="number-pad"
              leftIcon="calendar-outline"
            />
            <Input
              label="School Name"
              placeholder="Enter school name"
              value={formData.schoolName}
              onChangeText={v => setFormData({ ...formData, schoolName: v })}
              leftIcon="school-outline"
            />
            <Input
              label="School Address"
              placeholder="Enter school address"
              value={formData.schoolAddress}
              onChangeText={v => setFormData({ ...formData, schoolAddress: v })}
              leftIcon="location-outline"
            />
            <Input
              label="Home Address *"
              placeholder="Enter home address"
              value={formData.homeAddress}
              onChangeText={v => setFormData({ ...formData, homeAddress: v })}
              leftIcon="home-outline"
            />
            <Input
              label="Parent Phone"
              placeholder="Enter parent phone"
              value={formData.parentPhone}
              onChangeText={v => setFormData({ ...formData, parentPhone: v })}
              keyboardType="phone-pad"
              leftIcon="call-outline"
            />
            <Input
              label="Notes"
              placeholder="Any special notes (allergies, etc.)"
              value={formData.notes}
              onChangeText={v => setFormData({ ...formData, notes: v })}
              leftIcon="document-text-outline"
              multiline
            />

            {editingStudent && (
              <Button
                title="Delete Student"
                onPress={() => {
                  handleCloseModal();
                  handleDelete(editingStudent);
                }}
                variant="danger"
                fullWidth
                style={{ marginTop: Spacing.lg }}
              />
            )}
          </ScrollView>
        </View>
      </Modal>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.md,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: Spacing.md,
  },
});
