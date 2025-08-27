import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Appbar,
    Button,
    Card,
    Chip,
    Divider,
    Text,
    useTheme
} from 'react-native-paper';
import AuthGuard from '../../../components/AuthGuard';
import { getTopicById } from '../../../lib/course-learning-service';
import { getCourseById } from '../../../lib/course-service';
import { CourseTopic, formatLearningTime } from '../../../types/learning';

const MARKS_RANGES = [
  { value: 'all', label: 'All Marks' },
  { value: '1', label: '1 Mark' },
  { value: '2', label: '2 Marks' },
  { value: '3-5', label: '3-5 Marks' },
  { value: '6+', label: '6+ Marks' },
];

export default function TopicDetailsScreen() {
  const { courseId, topicId, courseTitle: courseTitleParam, subjectName: subjectNameParam } = useLocalSearchParams<{ courseId: string; topicId: string; courseTitle?: string; subjectName?: string }>();
  const router = useRouter();
  const theme = useTheme();

  const [topic, setTopic] = useState<CourseTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState<string | null>(courseTitleParam || null);
  const [subjectName, setSubjectName] = useState<string | null>(subjectNameParam || null);

  const formatDate = (value?: Date | any) => {
    if (!value) return 'N/A';
    // Firestore Timestamp has toDate()
    try {
      if (typeof value.toDate === 'function') {
        return value.toDate().toLocaleString();
      }
    } catch {
      // ignore
    }
    if (value instanceof Date) return value.toLocaleString();
    return String(value);
  };

  useEffect(() => {
    if (!courseId || !topicId) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Load topic
        const found = await getTopicById(String(courseId), String(topicId));
        if (!found) {
          setError('Topic not found');
          setTopic(null);
        } else {
          setTopic(found);
        }

        // Load course title/subject if not provided via params
        if (!courseTitleParam && !subjectNameParam) {
          try {
            const course = await getCourseById(String(courseId));
            if (course) {
              setCourseTitle(course.title || null);
              // try to get subject name from association or subjectName
              const subject = course.association?.subjectName || course.associations?.[0]?.subjectName;
              setSubjectName(subject || null);
            }
          } catch (err) {
            // ignore course fetch errors — not critical
            console.warn('Could not load course info for topic details:', err);
          }
        } else {
          if (courseTitleParam) setCourseTitle(String(courseTitleParam));
          if (subjectNameParam) setSubjectName(String(subjectNameParam));
        }
      } catch (err) {
        console.error('Error loading topic details:', err);
        setError('Failed to load topic details');
        setTopic(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, topicId, courseTitleParam, subjectNameParam]);

  if (loading) {
    return (
      <AuthGuard>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
          <Appbar.Header>
            <Appbar.BackAction onPress={() => router.back()} />
            <Appbar.Content title="Topic" subtitle={courseTitle ? `${courseTitle}${subjectName ? ` • ${subjectName}` : ''}` : undefined} />
          </Appbar.Header>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" animating />
            <Text style={styles.loadingText}>Loading topic...</Text>
          </View>
        </View>
      </AuthGuard>
    );
  }

  if (error || !topic) {
    return (
      <AuthGuard>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
          <Appbar.Header>
            <Appbar.BackAction onPress={() => router.push(`/course-topics-list/${courseId}`)} />
            <Appbar.Content title="Topic" subtitle={courseTitle ? `${courseTitle}${subjectName ? ` • ${subjectName}` : ''}` : undefined} />
          </Appbar.Header>
          <View style={styles.centerContainer}>
            <Text variant="headlineSmall">{error ? 'Error' : 'Topic not available'}</Text>
            <Text variant="bodyMedium" style={{ marginTop: 8 }}>{error || 'This topic could not be loaded.'}</Text>
            <Button mode="outlined" onPress={() => router.push(`/course-topics-list/${courseId}`)} style={{ marginTop: 16 }}>Back to Topics</Button>
          </View>
        </View>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.push(`/course-topics-list/${courseId}`)} />
          <Appbar.Content title={topic.title} subtitle={courseTitle ? `${courseTitle}${subjectName ? ` • ${subjectName}` : ''}` : undefined} />
        </Appbar.Header>

        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              {/* Show full topic title inside content so it's visible even if appbar truncates */}
              <Text variant="headlineSmall" style={styles.topicTitle}>{topic.title}</Text>

              {topic.description && (
                <Text variant="bodyMedium" style={styles.description}>{topic.description}</Text>
              )}

              {topic.summary && (
                <Text variant="bodyMedium" style={styles.description}>{topic.summary}</Text>
              )}

              <Divider style={{ marginVertical: 12 }} />

              {topic.learningObjectives && topic.learningObjectives.length > 0 && (
                <View style={{ marginBottom: 12 }}>
                  <Text variant="titleMedium">Learning Objectives</Text>
                  {topic.learningObjectives.map((obj, i) => (
                    <Text key={i} variant="bodySmall">• {obj}</Text>
                  ))}
                </View>
              )}

              {/* Metadata chips */}
              <View style={styles.metadataRow}>
                {topic.duration != null && (
                  <Chip mode="outlined">⏱️ {formatLearningTime(topic.duration)}</Chip>
                )}
                {topic.videoLength != null && (
                  <Chip mode="outlined">🎥 {formatLearningTime(topic.videoLength)}</Chip>
                )}
                {topic.isFree && <Chip mode="flat">Free</Chip>}
                <Chip mode="outlined">Published: {topic.isPublished ? 'Yes' : 'No'}</Chip>
                <Chip mode="outlined">Order: {topic.order ?? '-'}</Chip>
                {/* <Chip mode="outlined">Views: {topic.viewCount ?? 0}</Chip> */}
              </View>

              {/* Materials */}
              {topic.materials && topic.materials.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text variant="titleMedium">Materials</Text>
                  {topic.materials.map((m, i) => (
                    <View key={i} style={{ marginTop: 6 }}>
                      <Text variant="bodySmall">• {m.title}</Text>
                      {m.url && (
                        <Text variant="bodySmall" style={{ color: theme.colors.primary }}>{m.url}</Text>
                      )}
                      {m.description && (
                        <Text variant="bodySmall" style={{ opacity: 0.8 }}>{m.description}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Prerequisites */}
              {topic.prerequisites && topic.prerequisites.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text variant="titleMedium">Prerequisites</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                    {topic.prerequisites.map((p, i) => (
                      <Chip key={i} mode="outlined">{p}</Chip>
                    ))}
                  </View>
                </View>
              )}

              {/* Additional info */}
              {topic.transcription && (
                <View style={{ marginTop: 12 }}>
                  <Text variant="titleMedium">Transcription</Text>
                  <Text variant="bodySmall" style={{ marginTop: 6 }}>{topic.transcription}</Text>
                </View>
              )}

              {topic.notes && (
                <View style={{ marginTop: 12 }}>
                  <Text variant="titleMedium">Notes</Text>
                  <Text variant="bodySmall" style={{ marginTop: 6 }}>{topic.notes}</Text>
                </View>
              )}

              <View style={{ marginTop: 12 }}>
                {/* <Text variant="bodySmall">Completion Rate: {Math.round((topic.completionRate || 0) * 100) / 100}%</Text> */}
                {topic.averageWatchTime != null && (
                  <Text variant="bodySmall">Average Watch Time: {formatLearningTime(topic.averageWatchTime)}</Text>
                )}
                <Text variant="bodySmall">Last updated: {formatDate(topic.updatedAt)}</Text>
                <Text variant="bodySmall">Created: {formatDate(topic.createdAt)}</Text>
              </View>

              <View style={{ marginTop: 20 }}>
                <Text variant="titleMedium" style={{ marginBottom: 8 }}>Question Bank Filters</Text>
                <View style={styles.filterChipsRow}>
                  {MARKS_RANGES.map((r) => (
                    <Chip
                      key={r.value}
                      mode={r.value === 'all' ? 'outlined' : 'outlined'}
                      onPress={() => router.push({ pathname: '/course-questions-list/[id]', params: { id: String(courseId), topic: String(topicId), marks: String(r.value) } })}
                      style={{ marginRight: 8, marginBottom: 8 }}
                    >
                      {r.label}
                    </Chip>
                  ))}
                </View>

                <Button mode="text" onPress={() => router.push(`/course-topics-list/${courseId}`)} style={{ marginTop: 8 }}>
                  Back to Topics
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12 },
  content: { padding: 16 },
  card: { elevation: 2 },
  description: { marginBottom: 8 },
  topicTitle: { marginBottom: 8 },
  filterChipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  metadataRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 }
});
