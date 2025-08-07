import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Appbar,
  Snackbar,
  useTheme
} from 'react-native-paper';
import AuthGuard from '../components/AuthGuard';
import BottomNavigationTabs from '../components/BottomNavigationTabs';
import ProfileCompletionPrompt from '../components/auth/ProfileCompletionPrompt';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const theme = useTheme();
  const { userProfile } = useAuth();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  console.log('🏠 HomeScreen - Profile state:', {
    hasProfile: !!userProfile,
    profileCompleted: userProfile?.profileCompleted,
    email: userProfile?.email
  });

  // Show profile completion prompt for new users
  const shouldShowProfilePrompt = userProfile && userProfile.profileCompleted === false;

  if (shouldShowProfilePrompt) {
    console.log('🏠 HomeScreen: Showing profile completion prompt');
    return (
      <AuthGuard>
        <ProfileCompletionPrompt />
      </AuthGuard>
    );
  }

  console.log('🏠 HomeScreen: Showing main app');
  return (
    <AuthGuard>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.Action 
            icon="menu" 
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())} 
          />
          <Appbar.Content title="Leonora" />
          <Appbar.Action icon="bell" onPress={() => {}} />
        </Appbar.Header>

        <BottomNavigationTabs />

      {/* <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {}}
        label="New Course"
      /> */}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  testButtonContainer: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  testButton: {
    marginVertical: 8,
  },
});
