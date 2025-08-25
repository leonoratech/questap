import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Chip,
  Divider,
  Modal,
  Portal,
  Snackbar,
  Surface,
  Text,
  useTheme
} from "react-native-paper";
import AuthGuard from "../../components/AuthGuard";
import { getCourseTopics } from "../../lib/course-learning-service";
import { CourseTopic } from "../../types/learning";

interface TopicFilters {
  searchQuery: string;
  sortBy: "order" | "title" | "duration";
  sortOrder: "asc" | "desc";
  showCompletedOnly: boolean;
}

const SORT_OPTIONS = [
  { value: "order", label: "Order" },
  { value: "title", label: "Title" },
  { value: "duration", label: "Duration" },
];

export default function CourseTopicsListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [topics, setTopics] = useState<CourseTopic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<CourseTopic[]>([]);

  const [filters, setFilters] = useState<TopicFilters>({
    searchQuery: "",
    sortBy: "order",
    sortOrder: "asc",
    showCompletedOnly: false,
  });

  const [showFiltersModal, setShowFiltersModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadTopicsData();
  }, [id]);

  useEffect(() => {
    applyFilters();
  }, [topics, filters]);

  const loadTopicsData = async () => {
    try {
      setError(null);
      console.log("🔄 Loading topics for course:", id);

      if (!id) {
        console.error("❌ No course ID provided");
        setError("No course ID provided");
        return;
      }

      const topicsData = await getCourseTopics(id);
      console.log("📊 Topics loaded:", topicsData.length);

      if (topicsData.length === 0) {
        console.log("⚠️ No topics found for course:", id);
        // Instead of setting an error, we'll just show the empty state
        // setError('No topics found for this course');
      }

      setTopics(topicsData);
    } catch (err) {
      console.error("❌ Error loading topics:", err);
      let errorMessage = "Failed to load topics";

      if (err instanceof Error) {
        if (
          err.message.includes("logged in") ||
          err.message.includes("authenticate")
        ) {
          errorMessage = "Please log in to view course topics";
        } else if (err.message.includes("permission")) {
          errorMessage = "You don't have permission to view these topics";
        } else {
          errorMessage = `Failed to load topics: ${err.message}`;
        }
      }

      setError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTopicsData();
  };

  const applyFilters = () => {
    let filtered = [...topics];

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (topic) =>
          topic.title.toLowerCase().includes(query) ||
          topic.description?.toLowerCase().includes(query) ||
          topic.learningObjectives?.some((obj) =>
            obj.toLowerCase().includes(query)
          ) ||
          topic.summary?.toLowerCase().includes(query)
      );
    }

    // Apply completion filter (this would need actual progress data)
    // For now, we'll just show all topics
    // if (filters.showCompletedOnly) {
    //   filtered = filtered.filter(topic => topic.isCompleted);
    // }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "duration":
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        case "order":
        default:
          aValue = a.order || 0;
          bValue = b.order || 0;
          break;
      }

      if (filters.sortOrder === "desc") {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    setFilteredTopics(filtered);
  };

  const updateFilter = <K extends keyof TopicFilters>(
    key: K,
    value: TopicFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      sortBy: "order",
      sortOrder: "asc",
      showCompletedOnly: false,
    });
  };

  const formatDuration = (duration: number | undefined) => {
    if (!duration) return "N/A";
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const navigateToTopicDetails = (topicId: string) => {
    // Navigate to topic details or learning screen
    router.push({
      pathname: "/course-learning/[id]",
      params: { id: String(id), topicId },
    });
  };

  const renderTopicItem = ({
    item,
    index,
  }: {
    item: CourseTopic;
    index: number;
  }) => (
    <Card
      style={styles.topicCard}
      onPress={() => navigateToTopicDetails(item.id!)}
    >
      <Card.Content>
        <View style={styles.topicHeader}>
          <View style={styles.topicOrder}>
            <Text variant="bodyLarge" style={styles.orderNumber}>
              {item.order || index + 1}
            </Text>
          </View>
          <View style={styles.topicInfo}>
            <Text variant="titleMedium" style={styles.topicTitle}>
              {item.title}
            </Text>
            {item.description && (
              <Text
                variant="bodyMedium"
                style={styles.topicDescription}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.topicMetadata}>
          <View style={styles.metadataRow}>
            {item.duration && (
              <Chip mode="outlined" compact style={styles.metadataChip}>
                ⏱️ {formatDuration(item.duration)}
              </Chip>
            )}
            {item.videoLength && (
              <Chip mode="outlined" compact style={styles.metadataChip}>
                🎥 {formatDuration(item.videoLength)}
              </Chip>
            )}
            {item.isFree && (
              <Chip
                mode="flat"
                compact
                style={[
                  styles.metadataChip,
                  { backgroundColor: theme.colors.primaryContainer },
                ]}
                textStyle={{ color: theme.colors.primary }}
              >
                Free
              </Chip>
            )}
            {item.materials && item.materials.length > 0 && (
              <Chip mode="outlined" compact style={styles.metadataChip}>
                📄 {item.materials.length} materials
              </Chip>
            )}
          </View>
        </View>

        {/* Learning Objectives */}
        {item.learningObjectives && item.learningObjectives.length > 0 && (
          <View style={styles.objectivesContainer}>
            <Text variant="bodySmall" style={styles.objectivesLabel}>
              Learning Objectives:
            </Text>
            <View style={styles.objectivesList}>
              {item.learningObjectives.slice(0, 2).map((objective, index) => (
                <Text
                  key={index}
                  variant="bodySmall"
                  style={styles.objectiveText}
                >
                  • {objective}
                </Text>
              ))}
              {item.learningObjectives.length > 2 && (
                <Text variant="bodySmall" style={styles.moreObjectivesText}>
                  +{item.learningObjectives.length - 2} more objectives
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Progress Bar (placeholder - would need actual progress data) */}
        {/* <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text variant="bodySmall" style={styles.progressLabel}>
              Progress
            </Text>
            <Text variant="bodySmall" style={styles.progressPercentage}>
              {item.completionRate || 0}%
            </Text>
          </View>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${item.completionRate || 0}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
        </View> */}

        {/* Topic Stats */}
        {(item.viewCount || item.averageWatchTime) && (
          <View style={styles.statsContainer}>
            {item.viewCount && (
              <Text variant="bodySmall" style={styles.statText}>
                👁️ {item.viewCount} views
              </Text>
            )}
            {item.averageWatchTime && (
              <Text variant="bodySmall" style={styles.statText}>
                ⏱️ Avg watch: {formatDuration(item.averageWatchTime)}
              </Text>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.sortBy !== "order" || filters.sortOrder !== "asc") count++;
    if (filters.showCompletedOnly) count++;
    return count;
  };

  if (loading) {
    return (
      <AuthGuard>
        <View
          style={[
            styles.container,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Appbar.Header>
            <Appbar.BackAction onPress={() => router.back()} />
            <Appbar.Content title="Course Topics" />
          </Appbar.Header>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" animating={true} />
            <Text style={styles.loadingText}>Loading topics...</Text>
          </View>
        </View>
      </AuthGuard>
    );
  }

  if (error || (!loading && topics.length === 0)) {
    return (
      <AuthGuard>
        <View
          style={[
            styles.container,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Appbar.Header>
            <Appbar.BackAction onPress={() => router.back()} />
            <Appbar.Content title="Course Topics" />
          </Appbar.Header>
          <View style={styles.centerContainer}>
            <Text variant="headlineSmall" style={styles.errorTitle}>
              {error ? "Error Loading Topics" : "No Topics Available"}
            </Text>
            <Text variant="bodyMedium" style={styles.errorMessage}>
              {error || "This course doesn't have any topics yet."}
            </Text>
            <Button
              mode="outlined"
              onPress={() => router.back()}
              style={styles.backButton}
            >
              Back to Course
            </Button>
          </View>
        </View>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Course Topics" />
          {/* <Appbar.Action
            icon="sort"
            onPress={() => setShowFiltersModal(true)}
          /> */}
        </Appbar.Header>

        {/* Search Bar */}
        {/* <Surface style={styles.searchContainer}>
          <Searchbar
            placeholder="Search topics..."
            value={filters.searchQuery}
            onChangeText={(query) => updateFilter("searchQuery", query)}
            style={styles.searchBar}
          />
        </Surface> */}

        {/* Active Filters */}
        {getActiveFiltersCount() > 0 && (
          <Surface style={styles.filtersContainer}>
            <View style={styles.activeFiltersRow}>
              <Text variant="bodySmall" style={styles.filtersLabel}>
                {getActiveFiltersCount()} filter
                {getActiveFiltersCount() > 1 ? "s" : ""} active
              </Text>
              <Button
                mode="text"
                compact
                onPress={clearFilters}
                style={styles.clearFiltersButton}
              >
                Clear All
              </Button>
            </View>
            <View style={styles.activeFiltersChips}>
              {filters.sortBy !== "order" && (
                <Chip
                  mode="flat"
                  onClose={() => updateFilter("sortBy", "order")}
                  style={styles.activeFilterChip}
                >
                  Sort:{" "}
                  {
                    SORT_OPTIONS.find((opt) => opt.value === filters.sortBy)
                      ?.label
                  }
                </Chip>
              )}
              {filters.sortOrder !== "asc" && (
                <Chip
                  mode="flat"
                  onClose={() => updateFilter("sortOrder", "asc")}
                  style={styles.activeFilterChip}
                >
                  Order:{" "}
                  {filters.sortOrder === "desc" ? "Descending" : "Ascending"}
                </Chip>
              )}
            </View>
          </Surface>
        )}

        {/* Topics List */}
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <Text variant="titleMedium">
              {filteredTopics.length} topic
              {filteredTopics.length !== 1 ? "s" : ""}
            </Text>
          </View>

          <FlatList
            data={filteredTopics}
            renderItem={renderTopicItem}
            keyExtractor={(item) => item.id!}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Floating Action Button */}
        {/* <FAB
          icon="play"
          label="Start Learning"
          style={styles.fab}
          onPress={() => router.push({ 
            pathname: '/course-learning/[id]', 
            params: { id: String(id) } 
          })}
          disabled={filteredTopics.length === 0}
        /> */}

        {/* Filters Modal */}
        <Portal>
          <Modal
            visible={showFiltersModal}
            onDismiss={() => setShowFiltersModal(false)}
            contentContainerStyle={[
              styles.modalContainer,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Sort Topics
            </Text>

            <Divider style={styles.modalDivider} />

            {/* Sort By */}
            <Text variant="titleMedium" style={styles.filterSectionTitle}>
              Sort By
            </Text>
            <View style={styles.filterOptionsContainer}>
              {SORT_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  mode={filters.sortBy === option.value ? "flat" : "outlined"}
                  selected={filters.sortBy === option.value}
                  onPress={() => updateFilter("sortBy", option.value as any)}
                  style={styles.filterChip}
                >
                  {option.label}
                </Chip>
              ))}
            </View>

            {/* Sort Order */}
            <Text variant="titleMedium" style={styles.filterSectionTitle}>
              Order
            </Text>
            <View style={styles.filterOptionsContainer}>
              <Chip
                mode={filters.sortOrder === "asc" ? "flat" : "outlined"}
                selected={filters.sortOrder === "asc"}
                onPress={() => updateFilter("sortOrder", "asc")}
                style={styles.filterChip}
              >
                Ascending
              </Chip>
              <Chip
                mode={filters.sortOrder === "desc" ? "flat" : "outlined"}
                selected={filters.sortOrder === "desc"}
                onPress={() => updateFilter("sortOrder", "desc")}
                style={styles.filterChip}
              >
                Descending
              </Chip>
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={clearFilters}
                style={styles.modalButton}
              >
                Reset
              </Button>
              <Button
                mode="contained"
                onPress={() => setShowFiltersModal(false)}
                style={styles.modalButton}
              >
                Apply
              </Button>
            </View>
          </Modal>
        </Portal>

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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
  },
  errorTitle: {
    textAlign: "center",
    marginBottom: 8,
  },
  errorMessage: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  backButton: {
    marginTop: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 2,
  },
  searchBar: {
    elevation: 0,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 1,
  },
  activeFiltersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  filtersLabel: {
    opacity: 0.7,
  },
  clearFiltersButton: {
    marginRight: -8,
  },
  activeFiltersChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  activeFilterChip: {
    marginBottom: 4,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Account for FAB
  },
  topicCard: {
    marginBottom: 16,
    elevation: 2,
  },
  topicHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  topicOrder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  orderNumber: {
    fontWeight: "bold",
    color: "#1976D2",
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  topicDescription: {
    opacity: 0.7,
    lineHeight: 20,
  },
  topicMetadata: {
    marginBottom: 12,
  },
  metadataRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metadataChip: {
    marginBottom: 4,
  },
  objectivesContainer: {
    marginBottom: 12,
  },
  objectivesLabel: {
    fontWeight: "600",
    marginBottom: 4,
  },
  objectivesList: {
    paddingLeft: 8,
  },
  objectiveText: {
    opacity: 0.8,
    marginBottom: 2,
  },
  moreObjectivesText: {
    opacity: 0.6,
    fontStyle: "italic",
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  progressLabel: {
    opacity: 0.7,
  },
  progressPercentage: {
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statText: {
    opacity: 0.6,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: "70%",
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  modalDivider: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    marginBottom: 12,
    marginTop: 16,
  },
  filterOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});
