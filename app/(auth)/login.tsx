import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BorderRadius, Colors, FontSizes, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { mockCredentials } from "@/data/mock-data";
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
  View,
} from "react-native";

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    const result = await login(email, password);

    if (result.success) {
      router.replace("/(tabs)");
    } else {
      Alert.alert("Login Failed", result.error || "Invalid credentials");
    }
  };

  const fillDriverCredentials = () => {
    setEmail(mockCredentials.driver.email);
    setPassword(mockCredentials.driver.password);
  };

  const fillParentCredentials = () => {
    setEmail(mockCredentials.parent.email);
    setPassword(mockCredentials.parent.password);
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
        {/* Logo & Header */}
        <View style={styles.header}>
          <View
            style={[styles.logoContainer, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="bus" size={48} color="#FFFFFF" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>BustSystem</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            School Transportation Management
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
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
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            isPassword
            autoCapitalize="none"
            leftIcon="lock-closed-outline"
            error={errors.password}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            size="lg"
          />

          <View style={styles.registerLink}>
            <Text
              style={[styles.registerText, { color: colors.textSecondary }]}
            >
              {"Don't have an account? "}
            </Text>
            <Link href="/(auth)/register" style={styles.link}>
              <Text style={{ color: colors.primary, fontWeight: "600" }}>
                Sign Up
              </Text>
            </Link>
          </View>
        </View>

        {/* Demo Credentials */}
        <View style={[styles.demoSection, { borderTopColor: colors.border }]}>
          <Text style={[styles.demoTitle, { color: colors.textMuted }]}>
            Demo Credentials
          </Text>
          <View style={styles.demoButtons}>
            <Button
              title="Driver Demo"
              onPress={fillDriverCredentials}
              variant="outline"
              size="sm"
              icon={
                <Ionicons name="car-outline" size={16} color={colors.primary} />
              }
            />
            <Button
              title="Parent Demo"
              onPress={fillParentCredentials}
              variant="outline"
              size="sm"
              icon={
                <Ionicons
                  name="people-outline"
                  size={16}
                  color={colors.primary}
                />
              }
            />
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
    justifyContent: "center",
    padding: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
  },
  form: {
    gap: Spacing.sm,
  },
  registerLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  registerText: {
    fontSize: FontSizes.sm,
  },
  link: {
    marginLeft: 4,
  },
  demoSection: {
    marginTop: Spacing.xxl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    alignItems: "center",
  },
  demoTitle: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.md,
  },
  demoButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
});
