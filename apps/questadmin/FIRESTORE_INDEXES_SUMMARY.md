# Firestore Indexes Summary for QuestAdmin App

This document provides a comprehensive overview of all the Firestore indexes configured for the QuestAdmin application based on the actual query patterns used in the codebase.

## Index Analysis Methodology

1. **Repository Analysis**: Examined all repository files in `/data/repository/` to identify query patterns
2. **Service Analysis**: Analyzed service files that make Firebase queries
3. **API Route Analysis**: Checked API routes for additional query patterns
4. **Cross-App Analysis**: Reviewed queries from the QuestEdu app that share collections

## Firestore Collections and Required Indexes

### 1. **courses** Collection

**Query Patterns Identified:**
- Search courses by instructor with ordering
- Filter by status, featured, category with ordering
- Association-based queries for programs and subjects
- Instructor permission checks with published status

**Indexes Added:**
```json
// Instructor + Status + Ordering
{ "instructorId": "ASC", "status": "ASC", "createdAt": "DESC" }
{ "instructorId": "ASC", "status": "ASC", "featured": "ASC", "createdAt": "DESC" }

// Published Status Filtering
{ "instructorId": "ASC", "isPublished": "ASC", "createdAt": "DESC" }
{ "status": "ASC", "isPublished": "ASC", "createdAt": "DESC" }

// Category-based Filtering
{ "categoryId": "ASC", "status": "ASC", "createdAt": "DESC" }

// Featured Courses
{ "featured": "ASC", "status": "ASC", "createdAt": "DESC" }

// Association-based Queries (existing)
{ "association.programId": "ASC", "createdAt": "DESC" }
{ "association.subjectId": "ASC", "createdAt": "DESC" }
{ "association.programId": "ASC", "association.yearOrSemester": "ASC", "createdAt": "DESC" }
{ "association.programId": "ASC", "association.subjectId": "ASC", "createdAt": "DESC" }
```

### 2. **courseTopics** Collection

**Query Patterns Identified:**
- Get topics by course with ordering
- Filter published/draft topics
- Topic management operations

**Indexes Added:**
```json
// Basic Course Topic Queries
{ "courseId": "ASC", "order": "ASC" }
{ "courseId": "ASC", "isPublished": "ASC" }

// Published Topics with Ordering (existing)
{ "courseId": "ASC", "isPublished": "ASC", "order": "ASC" }
```

### 3. **courseQuestions** Collection

**Query Patterns Identified:**
- Questions by course with ordering
- Questions by topic with ordering
- Difficulty and type-based filtering
- Published/draft status filtering
- Flag-based filtering (important, frequently_asked, practical, conceptual)

**Indexes Added:**
```json
// Basic Question Queries
{ "courseId": "ASC", "order": "ASC" }
{ "courseId": "ASC", "order": "ASC", "createdAt": "DESC" }

// Topic-based Queries
{ "courseId": "ASC", "topicId": "ASC", "order": "ASC" }
{ "topicId": "ASC", "order": "ASC" }
{ "topicId": "ASC", "createdAt": "ASC" }

// Published Status Filtering
{ "courseId": "ASC", "isPublished": "ASC", "order": "ASC" }
{ "courseId": "ASC", "topicId": "ASC", "isPublished": "ASC", "order": "ASC" }

// Difficulty and Type Filtering
{ "courseId": "ASC", "difficulty": "ASC", "order": "ASC" }
{ "courseId": "ASC", "type": "ASC", "order": "ASC" }
{ "courseId": "ASC", "questionType": "ASC", "order": "ASC" }

// Flag-based Filtering
{ "courseId": "ASC", "flags.important": "ASC", "order": "ASC" }
{ "courseId": "ASC", "flags.frequently_asked": "ASC", "order": "ASC" }
{ "courseId": "ASC", "flags.practical": "ASC", "order": "ASC" }
{ "courseId": "ASC", "flags.conceptual": "ASC", "order": "ASC" }

// Marks-based Filtering
{ "courseId": "ASC", "marks": "ASC", "order": "ASC" }
```

### 4. **activities** Collection

**Query Patterns Identified:**
- Recent activities with time filtering
- User-based activity filtering
- Resource and action type filtering
- College and program-based filtering

**Indexes Added:**
```json
// Basic Activity Queries
{ "instructorId": "ASC", "createdAt": "DESC" }
{ "userId": "ASC", "createdAt": "DESC" }

// Filtering by Activity Properties
{ "actionType": "ASC", "createdAt": "DESC" }
{ "resourceType": "ASC", "createdAt": "DESC" }
{ "resourceId": "ASC", "createdAt": "DESC" }

// Organizational Filtering
{ "collegeId": "ASC", "createdAt": "DESC" }
{ "programId": "ASC", "createdAt": "DESC" }

// Time-based Filtering
{ "timestamp": "ASC", "createdAt": "DESC" }
```

### 5. **instructorActivities** Collection

**Query Patterns Identified:**
- Activities by instructor with ordering
- Activities by course with ordering
- Complex filtering with multiple criteria
- Activity type and date range filtering

**Indexes Added:**
```json
// Basic Instructor Activity Queries
{ "instructorId": "ASC", "createdAt": "DESC" }
{ "courseId": "ASC", "createdAt": "DESC" }
{ "type": "ASC", "createdAt": "DESC" }

// Complex Multi-field Filtering
{ "instructorId": "ASC", "type": "ASC", "createdAt": "DESC" }
{ "instructorId": "ASC", "courseId": "ASC", "createdAt": "DESC" }
{ "instructorId": "ASC", "topicId": "ASC", "createdAt": "DESC" }
{ "instructorId": "ASC", "questionId": "ASC", "createdAt": "DESC" }
```

### 6. **users** Collection

**Query Patterns Identified:**
- User role and status filtering
- College-based user filtering
- Active status with display name ordering

**Indexes Added:**
```json
// User Management Queries
{ "role": "ASC", "isActive": "ASC", "displayName": "ASC" }
{ "role": "ASC", "createdAt": "DESC" }
{ "collegeId": "ASC", "createdAt": "DESC" }
```

### 7. **programs** Collection

**Query Patterns Identified:**
- Active programs with name ordering
- College-based program filtering

**Indexes Added:**
```json
// Program Management
{ "isActive": "ASC", "name": "ASC" }
{ "collegeId": "ASC", "isActive": "ASC", "name": "ASC" }
```

### 8. **subjects** Collection

**Query Patterns Identified:**
- Program and college-based filtering
- Year/semester-based filtering
- Name-based ordering

**Indexes Added:**
```json
// Subject Management
{ "programId": "ASC", "collegeId": "ASC", "name": "ASC" }
{ "programId": "ASC", "collegeId": "ASC", "yearOrSemester": "ASC", "name": "ASC" }
{ "programId": "ASC", "name": "ASC" }
```

### 9. **enrollments** Collection

**Query Patterns Identified:**
- User enrollment history
- Enrollment date ordering

**Indexes Added:**
```json
// Enrollment Queries
{ "userId": "ASC", "enrolledAt": "DESC" }
```

### 10. **colleges** Collection

**Query Patterns Identified:**
- Active colleges with name ordering

**Indexes Added:**
```json
// College Management
{ "isActive": "ASC", "name": "ASC" }
```

### 11. **courseCategories** Collection

**Query Patterns Identified:**
- Active categories with ordering
- Category lookup by name

**Indexes Added:**
```json
// Category Management
{ "isActive": "ASC", "order": "ASC" }
{ "name": "ASC" }
```

## Index Management Scripts

The following scripts are available for managing these indexes:

1. **Validate Indexes**: `node scripts/db-manager.js indexes-validate`
2. **Deploy Indexes**: `node scripts/db-manager.js indexes-deploy`
3. **Check Status**: `node scripts/db-manager.js indexes-status`
4. **Clear Indexes**: `node scripts/db-manager.js indexes-clear`

## Performance Considerations

1. **Query Optimization**: All indexes are designed to support the exact query patterns used in the application
2. **Composite Indexes**: Complex queries with multiple filters have dedicated composite indexes
3. **Ordering**: Indexes include proper ordering fields to avoid client-side sorting
4. **Firestore Limits**: All indexes respect Firestore's limitations (e.g., maximum 200 composite indexes per database)

## Maintenance Notes

1. **Query Updates**: When adding new query patterns, update this index configuration
2. **Index Monitoring**: Monitor index usage in Firebase Console
3. **Performance Testing**: Test query performance after index deployment
4. **Cost Optimization**: Remove unused indexes to optimize costs

## Related Files

- `/firestore.indexes.json` - Main index configuration
- `/scripts/manage-indexes.js` - Index management script
- `/scripts/db-manager.js` - Database management utilities
- `/data/repository/` - Repository files containing query patterns

---

**Last Updated**: January 2025
**Total Indexes**: 60+ composite indexes covering all query patterns
**Collections Covered**: 11 main collections
