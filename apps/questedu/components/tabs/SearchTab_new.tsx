import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Button,
    Card,
    Chip,
    IconButton,
    Menu,
    Searchbar,
    Text,
    useTheme
} from 'react-native-paper';
import { useAdvancedSearch } from '../../hooks/useAdvancedSearch';
import { Course } from '../../lib/course-service';

export default function SearchTab() {
  const theme = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Advanced search hook
  const {
    searchResults,
    searching,
    filterOptions,
    loadingFilters,
    currentFilters,
    searchWithFilters,
    clearSearch,
    clearFilters
  } = useAdvancedSearch();

  // Menu states for filter dropdowns
  const [programMenuVisible, setProgramMenuVisible] = useState(false);
  const [subjectMenuVisible, setSubjectMenuVisible] = useState(false);
  const [yearMenuVisible, setYearMenuVisible] = useState(false);

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    const newFilters = { ...currentFilters, query };
    searchWithFilters(newFilters);
  };

  const handleFilterChange = (filterType: 'programId' | 'subjectId' | 'yearOrSemester', value: string | number | undefined) => {
    const newFilters = { 
      ...currentFilters, 
      query: searchQuery,
      [filterType]: value 
    };
    searchWithFilters(newFilters);
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    clearSearch();
  };

  const handleCourseDetails = (courseId: string) => {
    router.push(`/course-details/${courseId}`);
  };

  const handleContinueCourse = (courseId: string) => {
    // TODO: Navigate to course learning screen
    console.log('Continue course:', courseId);
  };

  const getSelectedProgramName = () => {
    if (!currentFilters.programId) return 'All Programs';
    const program = filterOptions.programs.find(p => p.id === currentFilters.programId);
    return program ? program.name : 'Unknown Program';
  };

  const getSelectedSubjectName = () => {
    if (!currentFilters.subjectId) return 'All Subjects';
    const subject = filterOptions.subjects.find(s => s.id === currentFilters.subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  const getSelectedYearLabel = () => {
    if (!currentFilters.yearOrSemester) return 'All Years';
    const year = filterOptions.years.find(y => y.value === currentFilters.yearOrSemester);
    return year ? year.label : `Year ${currentFilters.yearOrSemester}`;
  };

  const hasActiveFilters = () => {
    return !!(currentFilters.programId || currentFilters.subjectId || currentFilters.yearOrSemester);
  };

  const renderCourseItem = ({ item }: { item: Course }) => (
    <Card style={styles.courseCard}>
      <Card.Cover source={{ uri: item.image }} />
      <Card.Title
        title={item.title}
        subtitle={`Instructor: ${item.instructor}`}
        right={(props: any) => (
          <IconButton 
            {...props} 
            icon={item.progress === 100 ? "check-circle" : "play-circle"} 
            onPress={() => handleContinueCourse(item.id!)} 
          />
        )}
      />
      <Card.Content>
        <View style={styles.progressContainer}>
          <Text variant="bodyMedium">Progress: {item.progress}%</Text>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View style={[styles.progressFill, { width: `${item.progress}%`, backgroundColor: theme.colors.primary }]} />
          </View>
        </View>
        
        {/* Show course associations if available */}
        {item.associations && item.associations.length > 0 && (
          <View style={styles.associationsContainer}>
            <Text variant="bodySmall" style={styles.associationsLabel}>Course Details:</Text>
            {item.associations.map((assoc, index) => (
              <View key={index} style={styles.associationChips}>
                {assoc.programName && (
                  <Chip mode="outlined" compact style={styles.chip}>
                    {assoc.programName}
                  </Chip>
                )}
                {assoc.subjectName && (
                  <Chip mode="outlined" compact style={styles.chip}>
                    {assoc.subjectName}
                  </Chip>
                )}
                {assoc.yearOrSemester && (
                  <Chip mode="outlined" compact style={styles.chip}>
                    Year {assoc.yearOrSemester}
                  </Chip>
                )}
              </View>
            ))}
          </View>
        )}
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => handleContinueCourse(item.id!)}>
          {item.progress > 0 ? 'Continue' : 'Start'}
        </Button>
        <Button onPress={() => handleCourseDetails(item.id!)}>
          Details
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search Bar */}
      <Searchbar
        placeholder="Search courses by title, instructor, tags..."
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      {/* Filter Pills */}
      {loadingFilters ? (
        <View style={styles.filterLoadingContainer}>
          <ActivityIndicator size="small" />
          <Text variant="bodySmall">Loading filters...</Text>
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {/* Program Filter */}
          <Menu
            visible={programMenuVisible}
            onDismiss={() => setProgramMenuVisible(false)}
            anchor={
              <Chip
                mode={currentFilters.programId ? 'flat' : 'outlined'}
                onPress={() => setProgramMenuVisible(true)}
                style={[styles.filterChip, currentFilters.programId && styles.activeFilterChip]}
              >
                {getSelectedProgramName()}
              </Chip>
            }
          >
            <Menu.Item 
              title="All Programs" 
              onPress={() => {
                handleFilterChange('programId', undefined);
                setProgramMenuVisible(false);
              }}
            />
            {filterOptions.programs.map(program => (
              <Menu.Item
                key={program.id}
                title={program.name}
                onPress={() => {
                  handleFilterChange('programId', program.id);
                  setProgramMenuVisible(false);
                }}
              />
            ))}
          </Menu>

          {/* Subject Filter */}
          <Menu
            visible={subjectMenuVisible}
            onDismiss={() => setSubjectMenuVisible(false)}
            anchor={
              <Chip
                mode={currentFilters.subjectId ? 'flat' : 'outlined'}
                onPress={() => setSubjectMenuVisible(true)}
                style={[styles.filterChip, currentFilters.subjectId && styles.activeFilterChip]}
              >
                {getSelectedSubjectName()}
              </Chip>
            }
          >
            <Menu.Item 
              title="All Subjects" 
              onPress={() => {
                handleFilterChange('subjectId', undefined);
                setSubjectMenuVisible(false);
              }}
            />
            {filterOptions.subjects.map(subject => (
              <Menu.Item
                key={subject.id}
                title={subject.name}
                onPress={() => {
                  handleFilterChange('subjectId', subject.id);
                  setSubjectMenuVisible(false);
                }}
              />
            ))}
          </Menu>

          {/* Year Filter */}
          <Menu
            visible={yearMenuVisible}
            onDismiss={() => setYearMenuVisible(false)}
            anchor={
              <Chip
                mode={currentFilters.yearOrSemester ? 'flat' : 'outlined'}
                onPress={() => setYearMenuVisible(true)}
                style={[styles.filterChip, currentFilters.yearOrSemester ? styles.activeFilterChip : null]}
              >
                {getSelectedYearLabel()}
              </Chip>
            }
          >
            <Menu.Item 
              title="All Years" 
              onPress={() => {
                handleFilterChange('yearOrSemester', undefined);
                setYearMenuVisible(false);
              }}
            />
            {filterOptions.years.map(year => (
              <Menu.Item
                key={year.value}
                title={year.label}
                onPress={() => {
                  handleFilterChange('yearOrSemester', year.value);
                  setYearMenuVisible(false);
                }}
              />
            ))}
          </Menu>

          {/* Clear Filters Button */}
          {hasActiveFilters() && (
            <Chip
              mode="outlined"
              icon="close"
              onPress={clearFilters}
              style={styles.clearFiltersChip}
            >
              Clear Filters
            </Chip>
          )}
        </ScrollView>
      )}
      
      {/* Search Results */}
      {searching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text>Searching courses...</Text>
        </View>
      ) : searchQuery.trim() === '' && !hasActiveFilters() ? (
        <View style={styles.emptyContainer}>
          <Text variant="titleMedium" style={styles.emptyTitle}>Advanced Course Search</Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Search for courses by keywords or use filters to find courses by program, subject, or year
          </Text>
          {!loadingFilters && (
            <View style={styles.statsContainer}>
              <Text variant="bodySmall" style={styles.statsText}>
                Available: {filterOptions.programs.length} programs, {filterOptions.subjects.length} subjects, {filterOptions.years.length} years
              </Text>
            </View>
          )}
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="titleMedium" style={styles.emptyTitle}>No Results Found</Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Try adjusting your search criteria or filters
          </Text>
          <Button mode="outlined" onPress={handleClearAllFilters} style={styles.clearAllButton}>
            Clear All Filters
          </Button>
        </View>
      ) : (
        <>
          <View style={styles.resultsHeader}>
            <Text variant="titleMedium" style={styles.resultsTitle}>
              Search Results ({searchResults.length})
            </Text>
            {(searchQuery.trim() || hasActiveFilters()) && (
              <Button mode="text" onPress={handleClearAllFilters}>
                Clear All
              </Button>
            )}
          </View>
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
  filtersContainer: {
    marginBottom: 16,
    maxHeight: 50,
  },
  filtersContent: {
    paddingHorizontal: 4,
  },
  filterLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  filterChip: {
    marginRight: 8,
    marginVertical: 4,
  },
  activeFilterChip: {
    backgroundColor: '#E3F2FD',
  },
  clearFiltersChip: {
    marginLeft: 8,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontWeight: 'bold',
  },
  coursesList: {
    paddingBottom: 80,
  },
  courseCard: {
    marginBottom: 16,
  },
  progressContainer: {
    marginVertical: 10,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  associationsContainer: {
    marginTop: 12,
  },
  associationsLabel: {
    marginBottom: 6,
    fontWeight: '600',
  },
  associationChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  chip: {
    marginRight: 4,
    marginBottom: 4,
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
    marginBottom: 16,
  },
  statsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  statsText: {
    textAlign: 'center',
    opacity: 0.8,
  },
  clearAllButton: {
    marginTop: 16,
  },
});
