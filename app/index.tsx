import { Redirect } from 'expo-router';

const appMode = process.env.EXPO_PUBLIC_APP_MODE;

export default function Index() {
  if (appMode === 'business') {
    return <Redirect href="/(business-tabs)/dashboard" />;
  }
  return <Redirect href="/(tabs)" />;
}
