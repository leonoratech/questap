import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  Avatar,
  Button,
  Card,
  Dialog,
  Portal,
  Snackbar,
  Text,
  useTheme
} from 'react-native-paper';
import AuthGuard from '../../components/AuthGuard';
import { useAuth } from '../../contexts/AuthContext';
import { useEnrollment } from '../../hooks/useEnrollment';
import { getCourseById } from '../../lib/course-service';
import type { Course } from '../../types/course';

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { userProfile } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);

  // Use enrollment hook
  const {
    isEnrolled,
    getEnrollmentProgress,
    handleEnrollment,
    enrolling,
    refreshEnrollments
  } = useEnrollment();

  const fetchCourseDetails = async () => {
    if (!id) return;
    
    try {
      setError(null);
      const courseData = await getCourseById(id);
      if (courseData) {
        setCourse(courseData);
      } else {
        setError('Course not found');
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchCourseDetails(),
      refreshEnrollments()
    ]);
  };

  const handleEnrollCourse = async () => {
    console.log('handleEnrollCourse called, course:', course?.id);
    
    if (!course?.id) {
      console.log('No course ID found');
      setSnackbarMessage('Course not found');
      setSnackbarVisible(true);
      return;
    }

    if (isEnrolled(course.id)) {
      console.log('User already enrolled');
      setSnackbarMessage('You are already enrolled in this course');
      setSnackbarVisible(true);
      return;
    }

    console.log('Showing enrollment confirmation dialog');
    // Show confirmation dialog
    setShowEnrollDialog(true);
  };

  const handleEnrollConfirm = async () => {
    if (!course) return;
    
    setShowEnrollDialog(false);
    console.log('User confirmed enrollment');
    
    try {
      const result = await handleEnrollment(course.id!);
      console.log('Enrollment completed with result:', result);
      
      if (result.success) {
        setSnackbarMessage('Successfully enrolled in the course!');
        setSnackbarVisible(true);
        // Refresh course data to update UI
        await fetchCourseDetails();
        // Navigate back to dashboard after successful enrollment
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setSnackbarMessage(result.error || 'Failed to enroll in course');
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('Unexpected error during enrollment:', error);
      setSnackbarMessage('An unexpected error occurred during enrollment');
      setSnackbarVisible(true);
    }
  };

  const handleEnrollCancel = () => {
    setShowEnrollDialog(false);
    console.log('Enrollment cancelled by user');
  };

  const handleContinueCourse = () => {
    if (!course?.id) {
      setSnackbarMessage('Unable to continue course');
      setSnackbarVisible(true);
      return;
    }
    
    console.log('Navigating to course learning:', course.id);
    router.push({
      pathname: '/course-learning/[id]',
      params: { id: course.id }
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <AuthGuard>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <Appbar.Header>
            <Appbar.BackAction onPress={() => router.back()} />
            <Appbar.Content title="Course Details" />
          </Appbar.Header>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Loading course details...</Text>
          </View>
        </View>
      </AuthGuard>
    );
  }

  if (error || !course) {
    return (
      <AuthGuard>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <Appbar.Header>
            <Appbar.BackAction onPress={() => router.back()} />
            <Appbar.Content title="Course Details" />
          </Appbar.Header>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error || 'Course not found'}</Text>
            <Button mode="outlined" onPress={() => router.back()}>
              Go Back
            </Button>
          </View>
        </View>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Course Details" />
          <Appbar.Action icon="share" onPress={() => {}} />
          <Appbar.Action icon="bookmark-outline" onPress={() => {}} />
        </Appbar.Header>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Course Header */}
          <Card style={styles.headerCard}>
            <View style={[styles.imageContainer, { backgroundColor: theme.colors.background }]}>
              <Image source={{ uri: course.image || course.courseImage }} style={styles.courseImage} resizeMode="contain" />
            </View>
            <Card.Content style={styles.headerContent}>
              {/* <View style={styles.chipContainer}>
                <Chip style={styles.chip} mode="outlined">
                  {course.category}
                </Chip>
                {course.level && (
                  <Chip style={styles.chip} mode="outlined">
                    {course.level}
                  </Chip>
                )}
                {course.featured && (
                  <Chip 
                    style={[styles.chip, { backgroundColor: theme.colors.primary }]} 
                    textStyle={{ color: theme.colors.onPrimary }}
                  >
                    Featured
                  </Chip>
                )}
              </View> */}
              
              <Text variant="headlineSmall" style={styles.title}>
                {course.title}
              </Text>
              
              <Text variant="bodyMedium" style={styles.description}>
                {course.description || 'No description available'}
              </Text>
            </Card.Content>
          </Card>

          {/* Course Stats */}
          <Card style={styles.statsCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Course Information
              </Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text variant="bodyLarge" style={styles.statValue}>
                    {course.duration || 'N/A'}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Duration
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="bodyLarge" style={styles.statValue}>
                    {course.rating ? course.rating.toFixed(1) : 'N/A'}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Rating ({course.ratingCount || 0})
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="bodyLarge" style={styles.statValue}>
                    {course.enrollmentCount || 0}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Students
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="bodyLarge" style={styles.statValue}>
                    {course.language || course.primaryLanguage || 'English'}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Language
                  </Text>
                </View>
              </View>
              
              {/* Additional course stats */}
              {/* {(course.videosCount || course.articlesCount) && (
                <View style={[styles.statsGrid, { marginTop: 12 }]}>
                  {course.videosCount && (
                    <View style={styles.statItem}>
                      <Text variant="bodyLarge" style={styles.statValue}>
                        {course.videosCount}
                      </Text>
                      <Text variant="bodySmall" style={styles.statLabel}>
                        Videos
                      </Text>
                    </View>
                  )}
                  {course.articlesCount && (
                    <View style={styles.statItem}>
                      <Text variant="bodyLarge" style={styles.statValue}>
                        {course.articlesCount}
                      </Text>
                      <Text variant="bodySmall" style={styles.statLabel}>
                        Articles
                      </Text>
                    </View>
                  )}
                  {course.totalVideoLength && (
                    <View style={styles.statItem}>
                      <Text variant="bodyLarge" style={styles.statValue}>
                        {Math.round(course.totalVideoLength / 60)}h
                      </Text>
                      <Text variant="bodySmall" style={styles.statLabel}>
                        Video Length
                      </Text>
                    </View>
                  )}
                  {course.subcategory && (
                    <View style={styles.statItem}>
                      <Text variant="bodyLarge" style={styles.statValue}>
                        {course.subcategory}
                      </Text>
                      <Text variant="bodySmall" style={styles.statLabel}>
                        Subcategory
                      </Text>
                    </View>
                  )}
                </View>
              )} */}
            </Card.Content>
          </Card>

          {/* Progress Card (if user is enrolled) */}
          {/* {course?.id && isEnrolled(course.id) && (
            <Card style={styles.progressCard}>
              <Card.Content>
                <View style={styles.progressHeader}>
                  <Text variant="titleMedium">Your Progress</Text>
                  <Text variant="bodyLarge" style={styles.progressPercentage}>
                    {getEnrollmentProgress(course.id)}%
                  </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${getEnrollmentProgress(course.id)}%`, 
                        backgroundColor: theme.colors.primary 
                      }
                    ]} 
                  />
                </View>
              </Card.Content>
            </Card>
          )} */}

          {/* What You'll Learn Section */}
          {/* {course.whatYouWillLearn?.length && (
            <Card style={styles.learningCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  What You'll Learn
                </Text>
                <View style={styles.learningList}>
                  {course.whatYouWillLearn.map((item, index) => (
                    <View key={index} style={styles.learningItem}>
                      <Text style={[styles.bulletPoint, { color: theme.colors.primary }]}>✓</Text>
                      <Text variant="bodyMedium" style={styles.learningText}>
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>
          )} */}

          {/* Target Audience Section */}
          {/* {course.targetAudience?.length && (
            <Card style={styles.audienceCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Who This Course Is For
                </Text>
                <View style={styles.audienceList}>
                  {course.targetAudience.map((audience, index) => (
                    <View key={index} style={styles.audienceItem}>
                      <Text style={[styles.bulletPoint, { color: theme.colors.primary }]}>•</Text>
                      <Text variant="bodyMedium" style={styles.audienceText}>
                        {audience}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>
          )} */}

          {/* Instructor */}
          <Card style={styles.instructorCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Instructor
              </Text>
              <View style={styles.instructorInfo}>
                <Avatar.Text 
                  size={50} 
                  label={getInitials(course.instructor)} 
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <View style={styles.instructorDetails}>
                  <Text variant="bodyLarge" style={styles.instructorName}>
                    {course.instructor}
                  </Text>
                  <Text variant="bodyMedium" style={styles.instructorTitle}>
                    Course Instructor
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Skills & Tags */}
          {/* {(course.skills?.length || course.tags?.length) && (
            <Card style={styles.skillsCard}>
              <Card.Content>
                {course.skills?.length && (
                  <>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                      What You'll Learn
                    </Text>
                    <View style={styles.chipContainer}>
                      {course.skills.map((skill, index) => (
                        <Chip key={index} style={styles.skillChip} mode="outlined">
                          {skill}
                        </Chip>
                      ))}
                    </View>
                  </>
                )}
                
                {course.tags?.length && (
                  <>
                    <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 16 }]}>
                      Tags
                    </Text>
                    <View style={styles.chipContainer}>
                      {course.tags.map((tag, index) => (
                        <Chip key={index} style={styles.skillChip} mode="outlined">
                          {tag}
                        </Chip>
                      ))}
                    </View>
                  </>
                )}
              </Card.Content>
            </Card>
          )} */}

          {/* Prerequisites */}
          {/* {course.prerequisites?.length && (
            <Card style={styles.prerequisitesCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Prerequisites
                </Text>
                {course.prerequisites.map((prerequisite, index) => (
                  <View key={index} style={styles.prerequisiteItem}>
                    <Text>• {prerequisite}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )} */}

          {/* Enrollment */}
          <Card style={styles.enrollmentCard}>
            <Card.Content>
              <View style={styles.enrollmentButtons}>
                {course?.id && !isEnrolled(course.id) && (
                  <Button
                    mode="contained"
                    style={styles.primaryButton}
                    onPress={handleEnrollCourse}
                    loading={enrolling}
                    disabled={enrolling}
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </Button>
                )}
                {/* Topics Button */}
                <Button
                  mode="outlined"
                  style={styles.secondaryButton}
                  onPress={() => course?.id && router.push({ pathname: '/course-topics-list/[id]', params: { id: String(course.id) } })}
                >
                  Topics
                </Button>
                {/* Question Bank Button */}
                <Button
                  mode="outlined"
                  style={styles.secondaryButton}
                  onPress={() => course?.id && router.push({ pathname: '/course-questions-list/[id]', params: { id: String(course.id) } })}
                >
                  Question Bank
                </Button>
                {/* <Button 
                  mode="outlined" 
                  style={styles.secondaryButton}
                  onPress={() => {}}
                >
                  Add to Wishlist
                </Button> */}
              </View>
            </Card.Content>
          </Card>

          <View style={styles.bottomSpacer} />
        </ScrollView>
        
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {snackbarMessage}
        </Snackbar>

        {/* Enrollment Confirmation Dialog */}
        <Portal>
          <Dialog visible={showEnrollDialog} onDismiss={handleEnrollCancel}>
            <Dialog.Title>Enroll in Course</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">
                Do you want to enroll in &quot;{course?.title}&quot;?                
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={handleEnrollCancel}>Cancel</Button>
              <Button onPress={handleEnrollConfirm} loading={enrolling} mode="contained">
                Enroll
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  headerCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  headerContent: {
    paddingTop: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    lineHeight: 22,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    minWidth: '22%',
    marginBottom: 8,
  },
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    opacity: 0.7,
    marginTop: 2,
  },
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressPercentage: {
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  instructorCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructorDetails: {
    marginLeft: 16,
    flex: 1,
  },
  instructorName: {
    fontWeight: 'bold',
  },
  instructorTitle: {
    opacity: 0.7,
    marginTop: 2,
  },
  skillsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  skillChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  prerequisitesCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  prerequisiteItem: {
    marginBottom: 4,
  },
  featuresCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  featuresList: {
    gap: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enrollmentCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontWeight: 'bold',
  },
  currency: {
    marginLeft: 8,
    opacity: 0.7,
  },
  enrollmentButtons: {
    gap: 8,
  },
  primaryButton: {
    marginBottom: 8,
  },
  secondaryButton: {
    marginBottom: 8,
  },
  bottomSpacer: {
    height: 20,
  },
  learningCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  learningList: {
    flexDirection: 'column',
    gap: 8,
  },
  learningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  learningText: {
    flex: 1,
    lineHeight: 20,
  },
  bulletPoint: {
    marginRight: 8,
    fontWeight: 'bold',
  },
  audienceCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  audienceList: {
    flexDirection: 'column',
    gap: 8,
  },
  audienceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  audienceText: {
    flex: 1,
    lineHeight: 20,
  },
});
