import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { useAuth, UserRole } from '../contexts/AuthContext';
import LoginScreen from './auth/LoginScreen';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole,
  fallback 
}) => {
  const { user, userProfile, loading, isAuthenticated } = useAuth();

  console.log('🛡️ AuthGuard state:', {
    loading,
    isAuthenticated,
    hasUser: !!user,
    hasProfile: !!userProfile,
    profileCompleted: userProfile?.profileCompleted
  });

  // Show loading spinner while checking authentication
  if (loading) {
    console.log('🛡️ AuthGuard: Showing loading screen');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If not authenticated, show login screen or fallback
  if (!isAuthenticated || !user) {
    console.log('🛡️ AuthGuard: User not authenticated, showing login');
    return fallback || <LoginScreen />;
  }

  // If authenticated but user profile not loaded yet, wait a bit more
  if (user && !userProfile) {
    console.log('🛡️ AuthGuard: User authenticated but profile not loaded');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Check role requirements
  if (requiredRole && userProfile) {
    const hasRequiredRole = userProfile.role === UserRole.ADMIN || userProfile.role === requiredRole;
    
    if (!hasRequiredRole) {
      console.log('🛡️ AuthGuard: User lacks required role');
      return (
        <View style={styles.unauthorizedContainer}>
          <Card style={styles.unauthorizedCard}>
            <Card.Title title="Access Denied" />
            <Card.Content>
              <Text>You don't have permission to access this content.</Text>
              <Text style={styles.roleText}>
                Required role: {requiredRole}
              </Text>
              <Text style={styles.roleText}>
                Your role: {userProfile.role}
              </Text>
            </Card.Content>
          </Card>
        </View>
      );
    }
  }

  // If all checks pass, render children
  console.log('🛡️ AuthGuard: All checks passed, rendering children');
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  unauthorizedCard: {
    padding: 16,
  },
  roleText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});

export default AuthGuard;