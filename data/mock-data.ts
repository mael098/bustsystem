import type { Student, Driver, Parent, Route, Notification, Location } from '@/types';

// Mock Driver
export const mockDriver: Driver = {
  id: 'driver-1',
  email: 'driver@bustsystem.com',
  name: 'Carlos Rodriguez',
  role: 'driver',
  phone: '+1 555-0100',
  vehicleInfo: {
    model: 'Ford Transit 2023',
    plateNumber: 'ABC-1234',
    capacity: 15,
  },
  currentLocation: {
    latitude: 40.7128,
    longitude: -74.006,
  },
  isOnRoute: false,
};

// Mock Parents
export const mockParents: Parent[] = [
  {
    id: 'parent-1',
    email: 'parent1@email.com',
    name: 'Maria Garcia',
    role: 'parent',
    phone: '+1 555-0101',
    childrenIds: ['student-1'],
  },
  {
    id: 'parent-2',
    email: 'parent2@email.com',
    name: 'John Smith',
    role: 'parent',
    phone: '+1 555-0102',
    childrenIds: ['student-2', 'student-3'],
  },
  {
    id: 'parent-3',
    email: 'parent3@email.com',
    name: 'Ana Martinez',
    role: 'parent',
    phone: '+1 555-0103',
    childrenIds: ['student-4'],
  },
];

// Mock Schools
const schools = {
  lincoln: {
    name: 'Lincoln Elementary School',
    address: '123 Education St, New York, NY',
    location: { latitude: 40.7282, longitude: -73.9942 },
  },
  washington: {
    name: 'Washington Middle School',
    address: '456 Learning Ave, New York, NY',
    location: { latitude: 40.7352, longitude: -73.9911 },
  },
};

// Mock Students
export const mockStudents: Student[] = [
  {
    id: 'student-1',
    name: 'Sofia Garcia',
    age: 8,
    school: schools.lincoln,
    homeAddress: '789 Oak Street, New York, NY',
    homeLocation: { latitude: 40.7089, longitude: -74.0012 },
    parentId: 'parent-1',
    parentPhone: '+1 555-0101',
    status: 'home',
    notes: 'Allergic to peanuts',
  },
  {
    id: 'student-2',
    name: 'James Smith',
    age: 10,
    school: schools.lincoln,
    homeAddress: '321 Pine Avenue, New York, NY',
    homeLocation: { latitude: 40.7145, longitude: -74.0089 },
    parentId: 'parent-2',
    parentPhone: '+1 555-0102',
    status: 'home',
  },
  {
    id: 'student-3',
    name: 'Emma Smith',
    age: 12,
    school: schools.washington,
    homeAddress: '321 Pine Avenue, New York, NY',
    homeLocation: { latitude: 40.7145, longitude: -74.0089 },
    parentId: 'parent-2',
    parentPhone: '+1 555-0102',
    status: 'home',
  },
  {
    id: 'student-4',
    name: 'Lucas Martinez',
    age: 9,
    school: schools.lincoln,
    homeAddress: '654 Maple Drive, New York, NY',
    homeLocation: { latitude: 40.7201, longitude: -74.0056 },
    parentId: 'parent-3',
    parentPhone: '+1 555-0103',
    status: 'home',
    notes: 'Needs help with seatbelt',
  },
];

// Mock Route
export const mockRoute: Route = {
  id: 'route-1',
  driverId: 'driver-1',
  date: new Date().toISOString().split('T')[0],
  status: 'not_started',
  points: mockStudents.map((student, index) => ({
    id: `point-${index + 1}`,
    type: 'pickup' as const,
    studentId: student.id,
    location: student.homeLocation,
    address: student.homeAddress,
    completed: false,
  })),
};

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'info',
    title: 'Welcome to BustSystem',
    message: 'Track your child\'s school transportation in real-time.',
    timestamp: new Date(),
    read: false,
  },
];

// Driver location simulation path
export const simulatedRoutePath: Location[] = [
  { latitude: 40.7128, longitude: -74.006 },
  { latitude: 40.7089, longitude: -74.0012 },
  { latitude: 40.7145, longitude: -74.0089 },
  { latitude: 40.7201, longitude: -74.0056 },
  { latitude: 40.7282, longitude: -73.9942 },
];

// Mock user credentials for demo login
export const mockCredentials = {
  driver: {
    email: 'driver@bustsystem.com',
    password: 'driver123',
  },
  parent: {
    email: 'parent1@email.com',
    password: 'parent123',
  },
};
