import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    Appbar,
    Avatar,
    Button,
    Card,
    Chip,
    Divider,
    List,
    Switch,
    Text,
    useTheme
} from 'react-native-paper';
import AuthGuard from '../components/AuthGuard';
import { useAuth } from '../contexts/AuthContext';
import { AppMasterCollege, getCollegeFromAppMaster } from '../lib/app-master-service';
import { getAllPrograms, Program } from '../lib/college-data-service';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const theme = useTheme();
  const { user, userProfile, signOut, loading } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Profile data state
  const [college, setCollege] = useState<AppMasterCollege | null>(null);
  const [userProgram, setUserProgram] = useState<Program | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Load profile data when component mounts
  useEffect(() => {
    if (userProfile) {
      loadProfileData();
    }
  }, [userProfile]);

  const loadProfileData = async () => {
    setLoadingProfile(true);
    try {
      // Load college information
      const collegeData = await getCollegeFromAppMaster();
      setCollege(collegeData);

      // Load user's program if they have one
      if (userProfile?.programId) {
        const programs = await getAllPrograms();
        const program = programs.find(p => p.id === userProfile.programId);
        setUserProgram(program || null);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation will be handled by AuthGuard when user becomes null
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getDisplayName = () => {
    if (userProfile) {
      return `${userProfile.firstName} ${userProfile.lastName}`.trim() || userProfile.displayName;
    }
    return user?.displayName || user?.email?.split('@')[0] || 'User';
  };

  const getUserRole = () => {
    if (userProfile?.role) {
      return userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1).toLowerCase();
    }
    return (user as any)?.role?.charAt(0).toUpperCase() + (user as any)?.role?.slice(1).toLowerCase() || 'Student';
  };
  
  return (
    <AuthGuard>
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.Action 
            icon="menu" 
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())} 
          />
          <Appbar.Content title="Profile" />
          <Appbar.Action 
            icon="logout" 
            onPress={handleSignOut}
            disabled={loading}
          />
        </Appbar.Header>
        
        <ScrollView style={styles.content}>
          <Card style={styles.profileCard}>
            <Card.Content style={styles.profileHeader}>
              <Avatar.Text 
                size={100} 
                label={getDisplayName().charAt(0).toUpperCase()}
                style={{ backgroundColor: theme.colors.primary }}
              />
              <View style={styles.profileInfo}>
                <Text variant="headlineMedium">{getDisplayName()}</Text>
                <Text variant="bodyMedium">{user?.email}</Text>
                <View style={styles.chipContainer}>
                  <Chip icon="school" style={styles.chip}>{getUserRole()}</Chip>
                  {user?.emailVerified && (
                    <Chip icon="check-circle" style={[styles.chip, { backgroundColor: theme.colors.primaryContainer }]}>
                      Verified
                    </Chip>
                  )}
                  {userProfile?.profileCompleted && (
                    <Chip icon="check-circle-outline" style={[styles.chip, { backgroundColor: theme.colors.secondaryContainer }]}>
                      Complete
                    </Chip>
                  )}
                </View>
              </View>
            </Card.Content>

            {/* Academic Information Section */}
            {(college || userProgram || (!loadingProfile && userProfile)) && (
              <Card.Content style={styles.academicInfo}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Academic Information</Text>
                
                {college && (
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={styles.infoLabel}>College:</Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>{college.name}</Text>
                  </View>
                )}
                
                {userProgram ? (
                  <>
                    <View style={styles.infoRow}>
                      <Text variant="bodyMedium" style={styles.infoLabel}>Program:</Text>
                      <Text variant="bodyMedium" style={styles.infoValue}>{userProgram.name}</Text>
                    </View>
                    
                    {userProgram.subjects && userProgram.subjects.length > 0 && (
                      <View style={styles.infoRow}>
                        <Text variant="bodyMedium" style={styles.infoLabel}>Subjects:</Text>
                        <Text variant="bodySmall" style={styles.subjectsText}>
                          {userProgram.subjects.map(subject => subject.name).join(', ')}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (!loadingProfile && userProfile && !userProfile.programId) && (
                  <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.incompleteText}>
                      No program selected. Complete your profile to add academic information.
                    </Text>
                  </View>
                )}
                
                {loadingProfile && (
                  <Text variant="bodySmall" style={styles.loadingText}>Loading academic information...</Text>
                )}
              </Card.Content>
            )}

            <Card.Actions>
              <Button 
                mode="contained" 
                onPress={() => router.push('/profile-edit' as any)}
              >
                Edit Profile
              </Button>
              <Button onPress={handleSignOut} disabled={loading}>
                Sign Out
              </Button>
            </Card.Actions>
          </Card>

          <Card style={styles.settingsCard}>
            <Card.Title title="Settings" />
            <Card.Content>
              <List.Section>
                <List.Item 
                  title="Notifications"
                  description="Receive notifications about updates"
                  left={props => <List.Icon {...props} icon="bell" />}
                  right={props => <Switch value={notifications} onValueChange={setNotifications} />}
                />
                <Divider />
                <List.Item 
                  title="Dark Mode"
                  description="Toggle dark theme"
                  left={props => <List.Icon {...props} icon="theme-light-dark" />}
                  right={props => <Switch value={darkMode} onValueChange={setDarkMode} />}
                />
                <Divider />
                <List.Item 
                  title="Privacy Settings"
                  description="Manage your privacy options"
                  left={props => <List.Icon {...props} icon="shield-account" />}
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                />
              </List.Section>
            </Card.Content>
          </Card>
        </ScrollView>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
  },
  academicInfo: {
    paddingTop: 0,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1976d2',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontWeight: '600',
    minWidth: 80,
    marginRight: 8,
  },
  infoValue: {
    flex: 1,
    color: '#424242',
  },
  subjectsText: {
    flex: 1,
    color: '#666666',
    lineHeight: 18,
  },
  loadingText: {
    fontStyle: 'italic',
    color: '#999999',
  },
  incompleteText: {
    fontStyle: 'italic',
    color: '#ff9800',
    textAlign: 'center',
    padding: 8,
  },
  settingsCard: {
    marginBottom: 16,
  }
});
    
