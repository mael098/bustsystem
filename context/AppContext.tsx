import { useAuth } from "@/context/AuthContext";
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
  addStudent: (student: Omit<Student, "id" | "status">) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  updateStudentStatus: (id: string, status: StudentStatus) => Promise<void>;
  getStudentsByParent: (parentId: string) => Student[];

  // Route
  currentRoute: Route | null;
  startRoute: (type: "morning" | "afternoon") => void;
  completeRoutePoint: (pointId: string) => void;
  endRoute: () => void;

  // Driver Location
  driverLocation: Location | null;
  updateDriverLocation: (location: Location) => Promise<void>;
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

const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "https://z2ws6c1n-3000.usw3.devtunnels.ms";

const isLocation = (value: unknown): value is Location => {
  if (!value || typeof value !== "object") return false;
  const maybeLocation = value as Record<string, unknown>;
  return (
    typeof maybeLocation.latitude === "number" &&
    typeof maybeLocation.longitude === "number"
  );
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [driverLocation, setDriverLocation] = useState<Location | null>(null);
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationIndexRef = React.useRef(0);

  const getAuthHeader = useCallback(() => {
    if (!user?.token) return undefined;
    return { Authorization: `Bearer ${user.token}` };
  }, [user?.token]);

  const fetchStudents = useCallback(async () => {
    if (!user) {
      return;
    }

    const parentQuery =
      user.role === "parent" ? `?parentId=${encodeURIComponent(user.id)}` : "";
    const response = await fetch(
      `${API_URL}/api/Parent/children${parentQuery}`,
      {
        headers: {
          ...getAuthHeader(),
        },
      },
    );

    if (!response.ok) {
      throw new Error("Unable to fetch students");
    }

    const data = await response.json();
    if (!Array.isArray(data?.students)) {
      throw new Error("Invalid students response");
    }

    setStudents(data.students as Student[]);
  }, [getAuthHeader, user]);

  const fetchDriverLocation = useCallback(async () => {
    const response = await fetch(`${API_URL}/api/tracking/location`, {
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error("Unable to fetch tracking location");
    }

    const data = await response.json();
    if (!isLocation(data?.location)) {
      throw new Error("Invalid tracking payload");
    }

    setDriverLocation(data.location);
  }, [getAuthHeader]);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      setStudents(mockStudents);
      setCurrentRoute(null);
      setDriverLocation(null);
      return;
    }

    let cancelled = false;

    const loadStudents = async () => {
      try {
        await fetchStudents();
      } catch {
        if (!cancelled) {
          setStudents(mockStudents);
        }
      }
    };

    loadStudents();

    return () => {
      cancelled = true;
    };
  }, [fetchStudents, isAuthLoading, isAuthenticated]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !user || user.role !== "parent") {
      return;
    }

    const syncLocation = async () => {
      if (isSimulating) return;

      try {
        await fetchDriverLocation();
      } catch {}
    };

    syncLocation();
    const interval = setInterval(syncLocation, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchDriverLocation, isAuthLoading, isAuthenticated, isSimulating, user]);

  // Polling de estudiantes para padres — para que vean cambios de status del conductor en tiempo real
  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !user || user.role !== "parent") {
      return;
    }

    const syncStudents = async () => {
      try {
        await fetchStudents();
      } catch {}
    };

    const interval = setInterval(syncStudents, 7000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchStudents, isAuthLoading, isAuthenticated, user]);

  // Student functions
  const addStudent = useCallback(
    async (studentData: Omit<Student, "id" | "status">) => {
      const parentId = user?.role === "parent" ? user.id : studentData.parentId;

      if (!parentId) {
        throw new Error("No se pudo identificar el padre para crear el alumno");
      }

      const response = await fetch(`${API_URL}/api/Parent/children`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          name: studentData.name,
          age: studentData.age,
          parentId,
          homeAddress: studentData.homeAddress,
          homeLat: studentData.homeLocation.latitude,
          homeLng: studentData.homeLocation.longitude,
          parentPhone: studentData.parentPhone,
          notes: studentData.notes,
          schoolName: studentData.school.name,
          schoolAddress: studentData.school.address,
          schoolLat: studentData.school.location.latitude,
          schoolLng: studentData.school.location.longitude,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo crear el alumno en el servidor");
      }

      const data = await response.json();
      if (!data?.student) {
        throw new Error("Respuesta inválida al crear alumno");
      }

      setStudents((prev) => [...prev, data.student as Student]);
    },
    [getAuthHeader, user],
  );

  const updateStudent = useCallback(
    async (id: string, updates: Partial<Student>) => {
      try {
        const parentId = user?.id ?? updates.parentId ?? "";
        const response = await fetch(`${API_URL}/api/Parent/children`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify({
            id,
            parentId,
            name: updates.name,
            age: updates.age,
            homeAddress: updates.homeAddress,
            homeLat: updates.homeLocation?.latitude,
            homeLng: updates.homeLocation?.longitude,
            parentPhone: updates.parentPhone,
            notes: updates.notes,
            photoUrl: updates.photo,
            schoolName: updates.school?.name,
            schoolAddress: updates.school?.address,
            schoolLat: updates.school?.location?.latitude,
            schoolLng: updates.school?.location?.longitude,
          }),
        });

        if (!response.ok) throw new Error("Failed to update student");

        const data = await response.json();
        if (data?.student) {
          setStudents((prev) =>
            prev.map((s) => (s.id === id ? (data.student as Student) : s)),
          );
          return;
        }
      } catch {}

      // Fallback: update local state only
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      );
    },
    [getAuthHeader, user],
  );

  const deleteStudent = useCallback(
    async (id: string) => {
      try {
        const parentParam = user
          ? `&parentId=${encodeURIComponent(user.id)}`
          : "";
        await fetch(
          `${API_URL}/api/Parent/children?studentId=${encodeURIComponent(id)}${parentParam}`,
          {
            method: "DELETE",
            headers: {
              ...getAuthHeader(),
            },
          },
        );
      } catch {}

      setStudents((prev) => prev.filter((s) => s.id !== id));
    },
    [getAuthHeader, user],
  );

  const updateStudentStatus = useCallback(
    async (id: string, status: StudentStatus) => {
      // Optimistic update — UI reacciona de inmediato
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s)),
      );

      // Si es conductor, persistir en la BD (cada alumno puede ser de distinta escuela)
      if (user?.role === "driver") {
        try {
          await fetch(`${API_URL}/api/tracking/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify({ studentId: id, driverId: user.id, status }),
          });
        } catch {}
      }

      // Notificación según cambio de status
      const student = students.find((s) => s.id === id);
      if (student) {
        let notifType: Notification["type"] = "info";
        let title = "";
        let message = "";

        switch (status) {
          case "picked_up":
            notifType = "pickup";
            title = "Alumno recogido";
            message = `${student.name} fue recogido de casa.`;
            break;
          case "at_school":
            notifType = "arrival_school";
            title = "Llegó a la escuela";
            message = `${student.name} llegó a ${student.school.name}.`;
            break;
          case "returning":
            notifType = "pickup";
            title = "Saliendo de la escuela";
            message = `${student.name} está regresando a casa.`;
            break;
          case "delivered":
            notifType = "arrival_home";
            title = "Llegó a casa";
            message = `${student.name} fue entregado en casa.`;
            break;
        }

        if (title) {
          setNotifications((prev) => [
            {
              type: notifType,
              title,
              message,
              studentId: id,
              id: `notif-${Date.now()}`,
              timestamp: new Date(),
              read: false,
            },
            ...prev,
          ]);
        }
      }
    },
    [getAuthHeader, user, students],
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
  const updateDriverLocation = useCallback(
    async (location: Location) => {
      setDriverLocation(location);

      if (user?.role === "driver") {
        try {
          await fetch(`${API_URL}/api/tracking/location`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify({
              driverId: user.id,
              latitude: location.latitude,
              longitude: location.longitude,
            }),
          });
        } catch {}
      }
    },
    [getAuthHeader, user],
  );

  const startLocationSimulation = useCallback(() => {
    setIsSimulating(true);
    simulationIndexRef.current = 0;
    setDriverLocation(simulatedRoutePath[0]);
  }, []);

  const stopLocationSimulation = useCallback(() => {
    setIsSimulating(false);
    simulationIndexRef.current = 0;
  }, []);

  // Location simulation effect
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      simulationIndexRef.current =
        (simulationIndexRef.current + 1) % simulatedRoutePath.length;
      setDriverLocation(simulatedRoutePath[simulationIndexRef.current]);
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
