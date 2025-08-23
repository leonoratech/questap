import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Text,
  useTheme,
} from "react-native-paper";
import { useEnrollment } from "../../hooks/useEnrollment";
import { Course } from "../../lib/course-service";

export default function MyLearningTab() {
  const theme = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState("All");

  // Use enrollment hook instead of courses hook
  const {
    enrollments,
    loading,
    error,
    refreshEnrollments,
    getEnrollmentProgress,
  } = useEnrollment();

  // Extract courses from enrollments
  const enrolledCourses: Course[] = enrollments
    .filter((enrollment) => enrollment.course) // Only include enrollments with course data
    .map((enrollment) => ({
      ...enrollment.course,
      id: enrollment.courseId,
      progress: enrollment.progress?.completionPercentage || 0,
    }));

  const onRefresh = async () => {
    try {
      await refreshEnrollments();
    } catch (err) {
      console.error("Failed to refresh enrollments:", err);
    }
  };

  const handleCourseDetails = (courseId: string) => {
    router.push(`/course-details/${courseId}`);
  };

  const handleContinueCourse = (courseId: string) => {
    // TODO: Navigate to course learning screen
    console.log("Continue course:", courseId);
  };

  // Filter courses based on progress
  const filteredCourses = enrolledCourses.filter((course) => {
    if (filter === "All") return true;
    if (filter === "In Progress")
      return course.progress > 0 && course.progress < 100;
    if (filter === "Completed") return course.progress === 100;
    if (filter === "Not Started") return course.progress === 0;
    return true;
  });

  const renderCourseItem = ({ item }: { item: Course }) => (
    <Card style={styles.courseCard}>
      <Card.Cover source={{ uri: item.image }} />
      <Card.Content>
        <View style={styles.titleRow}>
          <Text variant="titleMedium" style={styles.courseTitle}>
            {item.title}
          </Text>
          {item.associations &&
            item.associations.length > 0 &&
            item.associations[0].subjectName && (
              <Text style={styles.subjectChip}>
                {item.associations[0].subjectName}
              </Text>
            )}
          {item.language && (
            <Text style={styles.languageChip}>{item.language}</Text>
          )}
        </View>
        <Text variant="bodySmall" style={styles.instructorText}>
          Instructor: {item.instructor}
        </Text>
      </Card.Content>
      <Card.Actions>
        <Card.Actions>
          <Button
            mode="outlined"
            onPress={() =>
              item?.id &&
              router.push({
                pathname: "/course-topics-list/[id]",
                params: { id: String(item.id) },
              })
            }
          >
            Topics
          </Button>
          {/* Question Bank Button */}
          <Button
            mode="outlined"
            onPress={() =>
              item?.id &&
              router.push({
                pathname: "/course-questions-list/[id]",
                params: { id: String(item.id) },
              })
            }
          >
            Question Bank
          </Button>
        </Card.Actions>
      </Card.Actions>
    </Card>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text variant="titleMedium" style={styles.sectionTitle}>
        My Learning ({filteredCourses.length})
      </Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text>Loading Subjects...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
          <Button onPress={onRefresh}>Retry</Button>
        </View>
      ) : filteredCourses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="titleMedium" style={styles.emptyTitle}>
            No Subjects Found
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            {filter === "All"
              ? "You haven't enrolled in any courses yet. Browse courses to get started!"
              : `No courses match the "${filter}" filter`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id || ""}
          contentContainerStyle={styles.coursesList}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  courseTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#fff",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  subjectChip: {
    backgroundColor: "#1976D2",
    color: "#fff",
    fontWeight: "bold",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    fontSize: 13,
    overflow: "hidden",
  },
  languageChip: {
    backgroundColor: "#43A047",
    color: "#fff",
    fontWeight: "bold",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    fontSize: 13,
    overflow: "hidden",
  },
  instructorText: {
    color: "#666",
    marginBottom: 4,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: "bold",
  },
  filterList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  coursesList: {
    paddingBottom: 80,
  },
  courseCard: {
    marginBottom: 16,
  },
  courseDetailsContainer: {
    marginVertical: 8,
  },
  courseDetail: {
    marginBottom: 4,
    color: "#666",
  },
  statusContainer: {
    marginTop: 10,
  },
  statusChip: {
    alignSelf: "flex-start",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.7,
  },
});
