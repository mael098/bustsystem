import {
  mockNotifications,
  mockStudents,
  simulatedRoutePath,
} from "@/data/mock-data";
import type {
  Location,
  Notification,
  Route,
  RouteStatus,
  Student,
  StudentStatus,
} from "@/types";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AppContextType {
  // Students
  students: Student[];
  addStudent: (student: Omit<Student, "id" | "status">) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  updateStudentStatus: (id: string, status: StudentStatus) => void;
  getStudentsByParent: (parentId: string) => Student[];

  // Route
  currentRoute: Route | null;
  startRoute: (type: "morning" | "afternoon") => void;
  completeRoutePoint: (pointId: string) => void;
  endRoute: () => void;

  // Driver Location
  driverLocation: Location | null;
  updateDriverLocation: (location: Location) => void;
  isSimulating: boolean;
  startLocationSimulation: () => void;
  stopLocationSimulation: () => void;

  // Notifications
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [driverLocation, setDriverLocation] = useState<Location | null>(null);
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationIndex, setSimulationIndex] = useState(0);

  // Student functions
  const addStudent = useCallback(
    (studentData: Omit<Student, "id" | "status">) => {
      const newStudent: Student = {
        ...studentData,
        id: `student-${Date.now()}`,
        status: "home",
      };
      setStudents((prev) => [...prev, newStudent]);
    },
    [],
  );

  const updateStudent = useCallback((id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    );
  }, []);

  const deleteStudent = useCallback((id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateStudentStatus = useCallback(
    (id: string, status: StudentStatus) => {
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s)),
      );

      // Add notification for status change
      const student = students.find((s) => s.id === id);
      if (student) {
        let notifType: Notification["type"] = "info";
        let title = "";
        let message = "";

        switch (status) {
          case "picked_up":
            notifType = "pickup";
            title = "Child Picked Up";
            message = `${student.name} has been picked up from home.`;
            break;
          case "at_school":
            notifType = "arrival_school";
            title = "Arrived at School";
            message = `${student.name} has arrived at ${student.school.name}.`;
            break;
          case "returning":
            notifType = "pickup";
            title = "Leaving School";
            message = `${student.name} has been picked up from school.`;
            break;
          case "delivered":
            notifType = "arrival_home";
            title = "Arrived Home";
            message = `${student.name} has been safely delivered home.`;
            break;
        }

        if (title) {
          addNotification({ type: notifType, title, message, studentId: id });
        }
      }
    },
    [students],
  );

  const getStudentsByParent = useCallback(
    (parentId: string) => {
      return students.filter((s) => s.parentId === parentId);
    },
    [students],
  );

  // Route functions
  const startRoute = useCallback(
    (type: "morning" | "afternoon") => {
      const routeStatus: RouteStatus =
        type === "morning" ? "morning_pickup" : "afternoon_pickup";
      const pointType = type === "morning" ? "pickup" : "pickup";

      const newRoute: Route = {
        id: `route-${Date.now()}`,
        driverId: "driver-1",
        date: new Date().toISOString().split("T")[0],
        status: routeStatus,
        points: students.map((student, index) => ({
          id: `point-${index + 1}`,
          type: pointType,
          studentId: student.id,
          location:
            type === "morning" ? student.homeLocation : student.school.location,
          address:
            type === "morning" ? student.homeAddress : student.school.address,
          completed: false,
        })),
        startTime: new Date(),
      };

      setCurrentRoute(newRoute);

      // Reset all student statuses
      students.forEach((s) => {
        updateStudentStatus(s.id, type === "morning" ? "home" : "at_school");
      });
    },
    [students, updateStudentStatus],
  );

  const completeRoutePoint = useCallback(
    (pointId: string) => {
      if (!currentRoute) return;

      setCurrentRoute((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          points: prev.points.map((p) =>
            p.id === pointId ? { ...p, completed: true } : p,
          ),
        };
      });

      // Update student status based on route type
      const point = currentRoute.points.find((p) => p.id === pointId);
      if (point) {
        const newStatus: StudentStatus =
          currentRoute.status === "morning_pickup"
            ? "picked_up"
            : currentRoute.status === "to_school"
              ? "at_school"
              : currentRoute.status === "afternoon_pickup"
                ? "returning"
                : "delivered";

        updateStudentStatus(point.studentId, newStatus);
      }
    },
    [currentRoute, updateStudentStatus],
  );

  const endRoute = useCallback(() => {
    if (!currentRoute) return;

    setCurrentRoute((prev) =>
      prev ? { ...prev, status: "completed", endTime: new Date() } : null,
    );

    // Mark all students as delivered/at school based on route type
    const finalStatus: StudentStatus =
      currentRoute.status === "morning_pickup" ||
      currentRoute.status === "to_school"
        ? "at_school"
        : "delivered";

    students.forEach((s) => updateStudentStatus(s.id, finalStatus));

    setTimeout(() => setCurrentRoute(null), 2000);
  }, [currentRoute, students, updateStudentStatus]);

  // Driver location functions
  const updateDriverLocation = useCallback((location: Location) => {
    setDriverLocation(location);
  }, []);

  const startLocationSimulation = useCallback(() => {
    setIsSimulating(true);
    setSimulationIndex(0);
    setDriverLocation(simulatedRoutePath[0]);
  }, []);

  const stopLocationSimulation = useCallback(() => {
    setIsSimulating(false);
    setSimulationIndex(0);
  }, []);

  // Location simulation effect
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSimulationIndex((prev) => {
        const nextIndex = (prev + 1) % simulatedRoutePath.length;
        setDriverLocation(simulatedRoutePath[nextIndex]);
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Notification functions
  const addNotification = useCallback(
    (notifData: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotification: Notification = {
        ...notifData,
        id: `notif-${Date.now()}`,
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    [],
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        updateStudentStatus,
        getStudentsByParent,
        currentRoute,
        startRoute,
        completeRoutePoint,
        endRoute,
        driverLocation,
        updateDriverLocation,
        isSimulating,
        startLocationSimulation,
        stopLocationSimulation,
        notifications,
        addNotification,
        markNotificationRead,
        clearNotifications,
        unreadCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
