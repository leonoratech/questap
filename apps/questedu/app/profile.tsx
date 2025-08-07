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
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
        
        <ScrollView style={[styles.content, { backgroundColor: theme.colors.background }]}>
          <Card style={styles.profileCard}>
            <Card.Content style={styles.profileHeader}>
              <Avatar.Text 
                size={100} 
                label={getDisplayName().charAt(0).toUpperCase()}
                style={{ backgroundColor: theme.colors.primary }}
              />
              <View style={styles.profileInfo}>
                <Text variant="headlineMedium" style={{ color: theme.colors.onSurface }}>{getDisplayName()}</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{user?.email}</Text>
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
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>Academic Information</Text>
                
                {college && (
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurface }]}>College Name:</Text>
                    <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurfaceVariant }]}>{college.name}</Text>
                  </View>
                )}

                {userProfile?.departmentName && (
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurface }]}>Department:</Text>
                    <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurfaceVariant }]}>{userProfile.departmentName}</Text>
                  </View>
                )}
                
                {userProgram ? (
                  <>
                    <View style={styles.infoRow}>
                      <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurface }]}>Group:</Text>
                      <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurfaceVariant }]}>{userProgram.name}</Text>
                    </View>
                    
                    {userProgram.subjects && userProgram.subjects.length > 0 && (
                      <View style={styles.infoRow}>
                        <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurface }]}>Subjects:</Text>
                        <Text variant="bodySmall" style={[styles.subjectsText, { color: theme.colors.onSurfaceVariant }]}>
                          {userProgram.subjects.map(subject => subject.name).join(', ')}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (!loadingProfile && userProfile && !userProfile.programId) && (
                  <View style={styles.incompleteContainer}>
                    <Text variant="bodySmall" style={[styles.incompleteText, { color: theme.colors.error }]}>
                      No group was selected. Complete your profile to add academic information.
                    </Text>
                  </View>
                )}
                
                {loadingProfile && (
                  <View style={styles.loadingContainer}>
                    <Text variant="bodySmall" style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>Loading academic information...</Text>
                  </View>
                )}
              </Card.Content>
            )}

            {/* Contact Information Section */}
            {(userProfile?.phone || userProfile?.districtName) && (
              <Card.Content style={styles.contactInfo}>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>Contact Information</Text>
                
                {userProfile?.phone && (
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurface }]}>Phone:</Text>
                    <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurfaceVariant }]}>{userProfile.phone}</Text>
                  </View>
                )}

                {userProfile?.districtName && (
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurface }]}>District:</Text>
                    <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurfaceVariant }]}>{userProfile.districtName}</Text>
                  </View>
                )}
              </Card.Content>
            )}

            {/* About Me Section */}
            {(userProfile?.description || userProfile?.bio) && (
              <Card.Content style={styles.aboutInfo}>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>About Me</Text>
                
                {userProfile?.description && (
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurface }]}>Description:</Text>
                    <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurfaceVariant }]}>{userProfile.description}</Text>
                  </View>
                )}

                {userProfile?.bio && (
                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurface }]}>Bio:</Text>
                    <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurfaceVariant }]}>{userProfile.bio}</Text>
                  </View>
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

          {/* <Card style={styles.settingsCard}>
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
          </Card> */}
        </ScrollView>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
  },
  academicInfo: {
    paddingTop: 0,
    paddingBottom: 16,
    paddingHorizontal: 4,
  },
  contactInfo: {
    paddingTop: 0,
    paddingBottom: 16,
    paddingHorizontal: 4,
  },
  aboutInfo: {
    paddingTop: 0,
    paddingBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
    fontSize: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
    paddingHorizontal: 2,
  },
  infoLabel: {
    fontWeight: '600',
    minWidth: 90,
    marginRight: 12,
    fontSize: 14,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  subjectsText: {
    flex: 1,
    lineHeight: 18,
    fontSize: 13,
  },
  loadingText: {
    fontStyle: 'italic',
    fontSize: 13,
  },
  loadingContainer: {
    marginVertical: 8,
    alignItems: 'center',
  },
  incompleteText: {
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 8,
    fontSize: 13,
    lineHeight: 18,
  },
  incompleteContainer: {
    marginVertical: 8,
    alignItems: 'center',
  },
  settingsCard: {
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  }
});
    
