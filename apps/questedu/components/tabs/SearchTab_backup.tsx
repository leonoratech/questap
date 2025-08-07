import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Button,
    Card,
    Searchbar,
    Text,
    useTheme
} from 'react-native-paper';
import { useCoursesSearch } from '../../hooks/useCourses';
import { Course } from '../../lib/course-service';

export default function SearchTab() {
  const theme = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use Firestore search hook
  const { searchResults, searching, searchCoursesByQuery } = useCoursesSearch();

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchCoursesByQuery(query);
    }
  };

  const handleCourseDetails = (courseId: string) => {
    router.push(`/course-details/${courseId}`);
  };

  const handleContinueCourse = (courseId: string) => {
    // TODO: Navigate to course learning screen
    console.log('Continue course:', courseId);
  };

  const renderCourseItem = ({ item }: { item: Course }) => (
    <Card style={styles.courseCard}>
      <Card.Cover source={{ uri: item.image }} />
      <Card.Title
        title={item.title}
        subtitle={`Instructor: ${item.instructor}`}
      />
      <Card.Content>
        {/* Course Details: Subject and Language */}
        <View style={styles.courseDetailsContainer}>
          {item.associations && item.associations.length > 0 && item.associations[0].subjectName && (
            <Text variant="bodySmall" style={styles.courseDetail}>
              Subject: {item.associations[0].subjectName}
            </Text>
          )}
          {item.language && (
            <Text variant="bodySmall" style={styles.courseDetail}>
              Language: {item.language}
            </Text>
          )}
        </View>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => handleCourseDetails(item.id!)}>
          Details
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search courses"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      {searching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text>Searching courses...</Text>
        </View>
      ) : searchQuery.trim() === '' ? (
        <View style={styles.emptyContainer}>
          <Text variant="titleMedium" style={styles.emptyTitle}>Search for Courses</Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Enter keywords to find courses that match your interests
          </Text>
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="titleMedium" style={styles.emptyTitle}>No Results Found</Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Try searching with different keywords
          </Text>
        </View>
      ) : (
        <>
          <Text variant="titleMedium" style={styles.resultsTitle}>
            Search Results ({searchResults.length})
          </Text>
          <FlatList
            data={searchResults}
            renderItem={renderCourseItem}
            keyExtractor={item => item.id || ''}
            contentContainerStyle={styles.coursesList}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
  resultsTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
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
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
