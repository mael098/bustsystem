// User Types
export type UserRole = "driver" | "parent";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  avatar?: string;
}

export interface Driver extends User {
  role: "driver";
  vehicleInfo: {
    model: string;
    plateNumber: string;
    capacity: number;
  };
  currentLocation?: Location;
  isOnRoute: boolean;
}

export interface Parent extends User {
  role: "parent";
  childrenIds: string[];
}

// Student Types
export type StudentStatus =
  | "home"
  | "picked_up"
  | "in_transit"
  | "at_school"
  | "returning"
  | "delivered";

export interface Student {
  id: string;
  name: string;
  age: number;
  school: {
    name: string;
    address: string;
    location: Location;
  };
  homeAddress: string;
  homeLocation: Location;
  parentId: string;
  parentPhone: string;
  status: StudentStatus;
  photo?: string;
  notes?: string;
}

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
}

export interface RoutePoint {
  id: string;
  type: "pickup" | "dropoff" | "school";
  studentId: string;
  location: Location;
  address: string;
  estimatedTime?: Date;
  completed: boolean;
}

// Route Types
export type RouteStatus =
  | "not_started"
  | "morning_pickup"
  | "to_school"
  | "afternoon_pickup"
  | "returning_home"
  | "completed";

export interface Route {
  id: string;
  driverId: string;
  date: string;
  status: RouteStatus;
  points: RoutePoint[];
  startTime?: Date;
  endTime?: Date;
}

// Notification Types
export type NotificationType =
  | "pickup"
  | "dropoff"
  | "arrival_school"
  | "arrival_home"
  | "delay"
  | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  studentId?: string;
}

// Auth Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
