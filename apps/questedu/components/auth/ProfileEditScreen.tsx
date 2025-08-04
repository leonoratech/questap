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
  Program
} from '../../lib/college-data-service';
import { Dropdown, DropdownOption } from '../ui/Dropdown';

interface FormData {
  firstName: string;
  lastName: string;
  bio: string;
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
    programId: '',
    description: '',
    mainSubjects: ''
  });
  
  const [college, setCollege] = useState<AppMasterCollege | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [loadingCollege, setLoadingCollege] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
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
        programId: userProfile.programId || '',
        description: userProfile.description || '',
        mainSubjects: userProfile.mainSubjects?.join(', ') || ''
      };
      
      console.log('📋 Initializing profile form data:', newFormData);
      setFormData(newFormData);
      setIsInitialLoad(false);
    }
  }, [userProfile]);

  // Load college and programs on component mount
  useEffect(() => {
    if (user && userProfile) {
      loadCollege();
      loadPrograms();
    }
  }, [user, userProfile]);

  // Update subjects when program is selected
  useEffect(() => {
    if (formData.programId && programs.length > 0) {
      const program = programs.find(p => p.id === formData.programId);
      setSelectedProgram(program || null);
      
      if (program && program.subjects) {
        // Auto-populate main subjects from program
        const subjectNames = program.subjects.map(subject => subject.name).join(', ');
        setFormData(prev => ({ ...prev, mainSubjects: subjectNames }));
        console.log(`✅ Auto-populated subjects for program ${program.name}:`, subjectNames);
      } else {
        setFormData(prev => ({ ...prev, mainSubjects: '' }));
        console.log('⚠️ No subjects found for selected program');
      }
    } else {
      setSelectedProgram(null);
      if (!isInitialLoad) {
        setFormData(prev => ({ ...prev, mainSubjects: '' }));
      }
    }
  }, [formData.programId, programs, isInitialLoad]);

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
    value: program.id || ''
  }));

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

            {/* Main Subjects - Auto-populated from program */}
            <View style={styles.input}>
              <Text variant="bodySmall" style={{ marginBottom: 8, color: theme.colors.onSurfaceVariant }}>
                Main Subjects
              </Text>
              {formData.mainSubjects ? (
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
