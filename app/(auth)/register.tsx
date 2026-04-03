import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  BorderRadius,
  Colors,
  FontSizes,
  Spacing
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type UserRole = "driver" | "parent";

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { register, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("parent");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    const result = await register(name, email, password, role);

    if (result.success) {
      router.replace("/(tabs)");
    } else {
      Alert.alert(
        "Registration Failed",
        result.error || "Something went wrong",
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Create Account
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Join BustSystem to manage school transportation
          </Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleSection}>
          <Text style={[styles.roleLabel, { color: colors.text }]}>
            I am a:
          </Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              onPress={() => setRole("parent")}
              style={[
                styles.roleButton,
                {
                  backgroundColor:
                    role === "parent"
                      ? colors.primary
                      : colors.backgroundSecondary,
                  borderColor:
                    role === "parent" ? colors.primary : colors.border,
                },
              ]}
            >
              <Ionicons
                name="people-outline"
                size={24}
                color={role === "parent" ? "#FFFFFF" : colors.textSecondary}
              />
              <Text
                style={[
                  styles.roleButtonText,
                  {
                    color: role === "parent" ? "#FFFFFF" : colors.textSecondary,
                  },
                ]}
              >
                Parent
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setRole("driver")}
              style={[
                styles.roleButton,
                {
                  backgroundColor:
                    role === "driver"
                      ? colors.primary
                      : colors.backgroundSecondary,
                  borderColor:
                    role === "driver" ? colors.primary : colors.border,
                },
              ]}
            >
              <Ionicons
                name="car-outline"
                size={24}
                color={role === "driver" ? "#FFFFFF" : colors.textSecondary}
              />
              <Text
                style={[
                  styles.roleButtonText,
                  {
                    color: role === "driver" ? "#FFFFFF" : colors.textSecondary,
                  },
                ]}
              >
                Driver
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            leftIcon="person-outline"
            error={errors.name}
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon="mail-outline"
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            isPassword
            autoCapitalize="none"
            leftIcon="lock-closed-outline"
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            isPassword
            autoCapitalize="none"
            leftIcon="lock-closed-outline"
            error={errors.confirmPassword}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
            size="lg"
          />

          <View style={styles.loginLink}>
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>
              Already have an account?{" "}
            </Text>
            <Link href="/(auth)/login" style={styles.link}>
              <Text style={{ color: colors.primary, fontWeight: "600" }}>
                Sign In
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
  },
  roleSection: {
    marginBottom: Spacing.lg,
  },
  roleLabel: {
    fontSize: FontSizes.md,
    fontWeight: "500",
    marginBottom: Spacing.md,
  },
  roleButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    gap: Spacing.sm,
  },
  roleButtonText: {
    fontSize: FontSizes.md,
    fontWeight: "600",
  },
  form: {
    gap: Spacing.sm,
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  loginText: {
    fontSize: FontSizes.sm,
  },
  link: {
    marginLeft: 4,
  },
});
