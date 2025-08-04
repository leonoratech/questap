import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Chip,
  HelperText,
  Snackbar,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { AppMasterCollege, getCollegeFromAppMaster } from '../../lib/app-master-service';
import {
  getAllPrograms,
  getSubjectsByProgramId,
  Program,
  Subject
} from '../../lib/college-data-service';
import { Dropdown, DropdownOption } from '../ui/Dropdown';

interface FormData {
  firstName: string;
  lastName: string;
  bio: string;
  collegeId: string;
  programId: string;
  description: string;
  mainSubjects: string;
}

const ProfileEditScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user, userProfile, updateProfile, loading } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    bio: '',
    collegeId: '',
    programId: '',
    description: '',
    mainSubjects: ''
  });
  
  const [college, setCollege] = useState<AppMasterCollege | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingCollege, setLoadingCollege] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Initialize form data from user profile
  useEffect(() => {
    if (userProfile) {
      const newFormData = {
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        bio: userProfile.bio || '',
        collegeId: userProfile.collegeId || '',
        programId: userProfile.programId || '',
        description: userProfile.description || '',
        mainSubjects: userProfile.mainSubjects?.join(', ') || ''
      };
      
      console.log('📋 Initializing profile form data:', newFormData);
      setFormData(newFormData);
      
      // If user has a saved programId, load the subjects for that program
      if (newFormData.programId && user) {
        console.log('📚 Profile loaded - Loading subjects for saved program:', newFormData.programId);
        loadSubjects(newFormData.programId).then(() => {
          console.log('✅ Initial subjects loading complete');
          setIsInitialLoad(false);
        });
      } else {
        console.log('✅ No saved program, marking initial load complete');
        setIsInitialLoad(false);
      }
    }
  }, [userProfile, user]);

  // Load college and programs on component mount
  useEffect(() => {
    if (user && userProfile) {
      loadCollege();
      loadPrograms();
    }
  }, [user, userProfile]);

  // Load subjects when program is selected (manual selection, not initial load)
  useEffect(() => {
    if (formData.programId && !isInitialLoad) {
      console.log('🔄 Manual program selection - loading subjects for:', formData.programId);
      loadSubjects(formData.programId);
    } else if (!formData.programId && !isInitialLoad) {
      console.log('🔄 No program selected, clearing subjects');
      setSubjects([]);
      setFormData(prev => ({ ...prev, mainSubjects: '' }));
    }
  }, [formData.programId, isInitialLoad]);

  const loadCollege = async () => {
    if (!user) {
      console.log('⚠️ User not authenticated, skipping college loading');
      return;
    }
    
    setLoadingCollege(true);
    try {
      console.log('🏫 Starting to load college from appMaster...');
      const collegeData = await getCollegeFromAppMaster();
      console.log(`✅ Successfully loaded college:`, collegeData?.name);
      setCollege(collegeData);
      
      if (!collegeData) {
        showMessage('No college information found. Please contact administrator.');
      }
    } catch (error: any) {
      console.error('❌ Error loading college:', error);
      
      if (error.message && error.message.includes('Authentication required')) {
        showMessage('Please sign in to access college information.');
      } else if (error.message && error.message.includes('Missing or insufficient permissions')) {
        showMessage('Access denied. Please ensure you are signed in with a valid account.');
      } else {
        showMessage('Failed to load college information. Please check your internet connection and try again.');
      }
      setCollege(null);
    } finally {
      setLoadingCollege(false);
    }
  };

  const loadPrograms = async () => {
    if (!user) {
      console.log('⚠️ User not authenticated, skipping program loading');
      return;
    }
    
    setLoadingPrograms(true);
    try {
      console.log(`🎓 Starting to load all programs...`);
      
      const programsData = await getAllPrograms();
      console.log(`✅ Successfully loaded ${programsData.length} programs`);
      setPrograms(programsData);
      
      if (programsData.length === 0) {
        showMessage('No programs found. Please contact administrator.');
      }
    } catch (error: any) {
      console.error('❌ Error loading programs:', error);
      
      if (error.message && error.message.includes('Authentication required')) {
        showMessage('Please sign in to access program information.');
      } else if (error.message && error.message.includes('Missing or insufficient permissions')) {
        showMessage('Access denied. Please ensure you are signed in with a valid account.');
      } else {
        showMessage('Failed to load programs. Please try again.');
      }
      setPrograms([]);
    } finally {
      setLoadingPrograms(false);
    }
  };

  const loadSubjects = async (programId: string) => {
    if (!user) {
      console.log('⚠️ User not authenticated, skipping subjects loading');
      return;
    }
    
    setLoadingSubjects(true);
    try {
      console.log(`📚 Starting to load subjects for program: ${programId}`);
      
      const subjectsData = await getSubjectsByProgramId(programId);
      console.log(`✅ Successfully loaded ${subjectsData.length} subjects for program ${programId}`);
      setSubjects(subjectsData);
      
      // Auto-populate main subjects
      const subjectNames = subjectsData.map(subject => subject.name).join(', ');
      setFormData(prev => ({ ...prev, mainSubjects: subjectNames }));
      
      if (subjectsData.length === 0) {
        showMessage('No subjects found for this program.');
        setFormData(prev => ({ ...prev, mainSubjects: '' }));
      }
    } catch (error: any) {
      console.error('❌ Error loading subjects:', error);
      
      if (error.message && error.message.includes('Authentication required')) {
        showMessage('Please sign in to access subject information.');
      } else if (error.message && error.message.includes('Missing or insufficient permissions')) {
        showMessage('Access denied. Please ensure you are signed in with a valid account.');
      } else {
        showMessage('Failed to load subjects. Please try again.');
      }
      setSubjects([]);
      setFormData(prev => ({ ...prev, mainSubjects: '' }));
    } finally {
      setLoadingSubjects(false);
    }
  };

  const showMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProgramSelect = (value: string, option: DropdownOption) => {
    setFormData(prev => ({ ...prev, programId: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      showMessage('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      showMessage('Last name is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const updates = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        bio: formData.bio.trim(),
        // Keep collegeId from existing profile or set to a default if using appMaster
        collegeId: userProfile?.collegeId || 'appmaster-college',
        programId: formData.programId,
        description: formData.description.trim(),
        mainSubjects: formData.mainSubjects
          .split(',')
          .map(subject => subject.trim())
          .filter(subject => subject.length > 0),
        profileCompleted: true,
      };

      const { error } = await updateProfile(updates);
      
      if (error) {
        showMessage(error);
      } else {
        showMessage('Profile updated successfully!');
        setTimeout(() => {
          router.back();
        }, 1500);
      }
    } catch (error) {
      showMessage('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Convert programs to dropdown options
  const programOptions: DropdownOption[] = programs.map(program => ({
    label: program.name,
    value: program.id
  }));

  // Debug: Log current selection state
  const selectedProgram = programOptions.find(p => p.value === formData.programId);
  
  // Enhanced debugging for programId binding issue
  React.useEffect(() => {
    if (formData.programId) {
      console.log('🎯 DETAILED SELECTION STATE:');
      console.log(`   College: ${college?.name || 'None'}`);
      console.log(`   Program: ${selectedProgram?.label || 'None'} (ID: ${formData.programId})`);
      console.log(`   Available programs: ${programOptions.length}`);
      console.log(`   Subjects loaded: ${subjects.length}`);
      
      if (formData.programId && programOptions.length > 0) {
        console.log(`🔍 PROGRAM BINDING DEBUG:`);
        console.log(`   Looking for programId: "${formData.programId}"`);
        console.log(`   Available program IDs: [${programOptions.map(p => `"${p.value}"`).join(', ')}]`);
        console.log(`   Match found: ${selectedProgram ? 'YES' : 'NO'}`);
        
        if (!selectedProgram) {
          console.log(`❌ BINDING ISSUE: programId "${formData.programId}" not found in programOptions`);
          programOptions.forEach((p, index) => {
            console.log(`     [${index}] ${p.label} = "${p.value}" (type: ${typeof p.value})`);
          });
        }
      }
    }
  }, [formData.programId, selectedProgram?.label, programOptions.length, subjects.length, college?.name]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleCancel} />
        <Appbar.Content title="Edit Profile" />
        <Appbar.Action 
          icon="check" 
          onPress={handleSave}
          disabled={saving || loading}
        />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Personal Information */}
        <Card style={styles.card}>
          <Card.Title title="Personal Information" />
          <Card.Content>
            <TextInput
              label="First Name *"
              value={formData.firstName}
              onChangeText={(text) => handleInputChange('firstName', text)}
              style={styles.input}
              disabled={saving}
            />

            <TextInput
              label="Last Name *"
              value={formData.lastName}
              onChangeText={(text) => handleInputChange('lastName', text)}
              style={styles.input}
              disabled={saving}
            />

            <TextInput
              label="Email"
              value={user?.email || ''}
              style={styles.input}
              disabled={true}
              right={<TextInput.Icon icon="lock" />}
            />
          </Card.Content>
        </Card>

        {/* Academic Information */}
        <Card style={styles.card}>
          <Card.Title title="Academic Information" />
          <Card.Content>
            {/* College Information - Display as label */}
            <View style={styles.input}>
              <Text variant="bodySmall" style={{ marginBottom: 8, color: theme.colors.onSurfaceVariant }}>
                College/Institution
              </Text>
              {loadingCollege ? (
                <Text variant="bodyMedium">Loading college information...</Text>
              ) : college ? (
                <Text variant="bodyLarge" style={{ fontWeight: '500', color: theme.colors.onSurface }}>
                  {college.name}
                </Text>
              ) : (
                <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
                  College information not available
                </Text>
              )}
            </View>

            <Dropdown
              label="Program/Field of Study"
              value={formData.programId}
              options={programOptions}
              onSelect={handleProgramSelect}
              placeholder="Select your program"
              disabled={saving}
              loading={loadingPrograms}
              style={styles.input}
            />
            
            {/* Debug info - remove in production */}
            {__DEV__ && formData.programId && programOptions.length > 0 && (
              <HelperText type="info">
                {`Debug: Program ${selectedProgram ? `"${selectedProgram.label}" found` : `"${formData.programId}" not found in ${programOptions.length} loaded programs`}`}
              </HelperText>
            )}

            {/* Main Subjects - Auto-populated from program */}
            <View style={styles.input}>
              <Text variant="bodySmall" style={{ marginBottom: 8, color: theme.colors.onSurfaceVariant }}>
                Main Subjects
              </Text>
              {loadingSubjects ? (
                <Text variant="bodyMedium">Loading subjects...</Text>
              ) : formData.mainSubjects ? (
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  {formData.mainSubjects}
                </Text>
              ) : (
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Select a program to view subjects
                </Text>
              )}
              <HelperText type="info">
                Subjects are automatically populated based on your selected program
              </HelperText>
            </View>
          </Card.Content>
        </Card>

        {/* About Me */}
        <Card style={styles.card}>
          <Card.Title title="About Me" />
          <Card.Content>
            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              style={styles.input}
              disabled={saving}
              placeholder="Tell us about your academic interests, goals, and what you hope to learn..."
              multiline
              numberOfLines={4}
            />

            <TextInput
              label="Short Bio"
              value={formData.bio}
              onChangeText={(text) => handleInputChange('bio', text)}
              style={styles.input}
              disabled={saving}
              placeholder="A brief summary about yourself"
              multiline
              numberOfLines={2}
            />
          </Card.Content>
        </Card>

        {/* Profile Status */}
        <Card style={styles.card}>
          <Card.Title title="Profile Status" />
          <Card.Content>
            <View style={styles.statusContainer}>
              <Text variant="bodyMedium">Role:</Text>
              <Chip icon="school" style={styles.roleChip}>Student</Chip>
            </View>
            <View style={styles.statusContainer}>
              <Text variant="bodyMedium">Profile Status:</Text>
              <Chip 
                icon={userProfile?.profileCompleted ? "check-circle" : "clock"} 
                style={[
                  styles.statusChip, 
                  { backgroundColor: userProfile?.profileCompleted ? theme.colors.primaryContainer : theme.colors.errorContainer }
                ]}
              >
                {userProfile?.profileCompleted ? 'Complete' : 'Incomplete'}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={handleSave}
            loading={saving}
            disabled={saving || loading}
            style={styles.saveButton}
          >
            Save Changes
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={handleCancel}
            disabled={saving}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  roleChip: {
    backgroundColor: '#e3f2fd',
  },
  statusChip: {
    marginLeft: 8,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 32,
    gap: 12,
  },
  saveButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 8,
  },
});

export default ProfileEditScreen;
