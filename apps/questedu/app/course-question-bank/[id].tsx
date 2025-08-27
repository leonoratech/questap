import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';
import AuthGuard from '../../components/AuthGuard';
import { LearningSlideViewer } from '../../components/learning';
import { getCourseQuestions, getCourseTopics } from '../../lib/course-learning-service';
import { LearningSlide, SlideType } from '../../types/learning';

export default function CourseQuestionBankScreen() {
  const params = useLocalSearchParams<{ id: string; questionId?: string; topic?: string; marks?: string; type?: string; searchQuery?: string }>();
  const id = String(params.id);
  const questionId = params.questionId as string | undefined;
  const incomingTopic = params.topic as string | undefined;
  const incomingMarks = params.marks as string | undefined;
  const incomingType = params.type as string | undefined;
  const incomingSearch = params.searchQuery as string | undefined;
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slides, setSlides] = useState<LearningSlide[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    loadQuestions();
  }, [id, incomingTopic, incomingMarks, incomingType, incomingSearch]);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all topics for the course
      const topics = await getCourseTopics(id);

      const questions = await getCourseQuestions(id);

      // Apply incoming filters (same logic as questions list)
      let filtered = [...questions];

      // Topic filter
      if (incomingTopic && incomingTopic !== 'all') {
        filtered = filtered.filter((q) => q.topicId === incomingTopic);
      }

      // Type filter
      if (incomingType && incomingType !== 'all') {
        filtered = filtered.filter((q) => q.type === incomingType);
      }

      // Marks filter
      if (incomingMarks && incomingMarks !== 'all') {
        if (incomingMarks === '1') {
          filtered = filtered.filter((q) => q.marks === 1);
        } else if (incomingMarks === '2') {
          filtered = filtered.filter((q) => q.marks === 2);
        } else if (incomingMarks === '3-5') {
          filtered = filtered.filter((q) => q.marks >= 3 && q.marks <= 5);
        } else if (incomingMarks === '6+') {
          filtered = filtered.filter((q) => q.marks >= 6);
        }
      }

      // Search filter
      if (incomingSearch && String(incomingSearch).trim() !== '') {
        const query = String(incomingSearch).toLowerCase();
        filtered = filtered.filter(
          (q) =>
            q.questionText.toLowerCase().includes(query) ||
            q.tags.some((tag) => tag.toLowerCase().includes(query)) ||
            topics.find((t) => t.id === q.topicId)?.title?.toLowerCase().includes(query)
        );
      }

      // Build slides for filtered questions
      const questionSlides: LearningSlide[] = filtered.map((question, idx) => ({
        id: `question-${question.id}`,
        type: SlideType.QUESTION,
        order: idx,
        question,
        topicTitle: topics.find(t => t.id === question.topicId)?.title || 'General'
      }));

      setSlides(questionSlides);

      // Find initial index if questionId is provided (relative to filtered slides)
      if (questionId) {
        const targetIndex = questionSlides.findIndex(slide => {
          if (slide.type === SlideType.QUESTION && slide.question) {
            return slide.question.id === questionId;
          }
          return false;
        });
        if (targetIndex !== -1) {
          setInitialIndex(targetIndex);
        } else {
          // If the requested question is not in filtered set, start at 0
          setInitialIndex(0);
        }
      } else {
        setInitialIndex(0);
      }
    } catch (err) {
      setError('Failed to load question bank');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" animating={true} />
          <Text>Loading question bank...</Text>
        </View>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <View style={styles.centerContainer}>
          <Text>{error}</Text>
        </View>
      </AuthGuard>
    );
  }

  if (slides.length === 0) {
    return (
      <AuthGuard>
        <View style={styles.centerContainer}>
          <Text>No questions available for this course.</Text>
          <Button
            mode="outlined"
            style={{ marginTop: 24 }}
            onPress={() =>
              router.replace({
                pathname: '/course-questions-list/[id]',
                params: {
                  id: String(id),
                  topic: incomingTopic,
                  marks: incomingMarks,
                  type: incomingType,
                  searchQuery: incomingSearch,
                },
              })
            }
          >
            Back to Questions List
          </Button>
        </View>
      </AuthGuard>
    );
  }

  // For question bank, show all questions, answers, and explanations immediately
  return (
    <AuthGuard>
      <View style={styles.container}>
        <LearningSlideViewer
          slides={slides}
          currentIndex={initialIndex}
          session={{ completedSlides: slides.map(s => s.id), userAnswers: {}, currentSlideIndex: initialIndex, totalSlides: slides.length, courseId: id, userId: '', startedAt: new Date(), lastAccessed: new Date(), topicsProgress: {}, timeSpent: 0, completionPercentage: 100 }}
          onSlideChange={() => {}}
          onSlideComplete={() => {}}
          onExit={() =>
            router.replace({
              pathname: '/course-questions-list/[id]',
              params: {
                id: String(id),
                topic: incomingTopic,
                marks: incomingMarks,
                type: incomingType,
                searchQuery: incomingSearch,
              },
            })
          }
          readOnly={true}
        />
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
