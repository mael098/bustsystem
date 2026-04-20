import { Redirect } from "expo-router";

export default function LegacyTabsLoginRedirect() {
  return <Redirect href="/(auth)/login" />;
}
