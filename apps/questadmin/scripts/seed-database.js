#!/usr/bin/env node

/**
 * Database Seed Script for QuestAdmin
 * 
 * This script populates the database with comprehensive mock data including:
 * 0. Mock master data for colleges
 * 1. Mock users (superadmin, admin, students, instructors) 
 * 2. Mock courses against the instructors created
 * 3. Mock topics against the courses created
 * 4. Mock questions and answers for the courses created
 * 6. Mock activities against all entities
 * 
 * Usage: node scripts/seed-database.js [--clear-first]
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Remove client SDK imports
// const { initializeApp } = require('firebase/app');
// const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
// const { getFirestore, collection, doc, setDoc, addDoc, writeBatch, serverTimestamp, getDocs, query, where } = require('firebase/firestore');

// Import firebase-admin
let admin;
try {
  admin = require('firebase-admin');
} catch (error) {
  console.error('❌ Firebase Admin SDK not installed. Please run `npm install firebase-admin` in your questadmin directory.');
  process.exit(1);
}

// Load service account from environment variables (as in clear-database-auto.js)
let serviceAccount;
if (process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL && process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY) {
  serviceAccount = {
    type: 'service_account',
    project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    client_email: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
    private_key: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // Will use application default credentials
  serviceAccount = null;
} else {
  console.error('❌ No service account credentials found in environment variables.');
  process.exit(1);
}

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'leonora-c9f8b',
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'leonora-c9f8b',
    });
  }
}

const db = admin.firestore();
const auth = admin.auth();
const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;
const writeBatch = (...args) => db.batch(...args);
const collection = (...args) => db.collection(...args);
const doc = (dbOrCollection, ...pathSegments) => {
  // If first argument is db, treat as db.collection(...).doc(...)
  if (typeof dbOrCollection.collection === 'function') {
    if (pathSegments.length === 2) {
      // e.g. doc(db, 'colleges', 'mit')
      return dbOrCollection.collection(pathSegments[0]).doc(pathSegments[1]);
    } else if (pathSegments.length === 1) {
      // e.g. doc(db, 'colleges')
      return dbOrCollection.collection(pathSegments[0]);
    } else {
      throw new Error('doc() expects db, collection, id or db, collection');
    }
  } else if (typeof dbOrCollection.doc === 'function') {
    // If first argument is a collection, treat as collection.doc(id)
    return dbOrCollection.doc(pathSegments[0]);
  } else {
    throw new Error('Invalid argument to doc()');
  }
};
const setDoc = (ref, data) => ref.set(data);

// Track created data for relationships
const createdData = {
  appMaster: {},
  programs: [],
  subjects: [],
  categories: [],  
  users: {
    superadmins: [],
    instructors: [],
    students: []
  },
  courses: [],
  topics: [],
  questions: [],
  activities: []
};

// ==================== MASTER DATA DEFINITIONS ====================
// Course-> Groups -> Subjects (year, medium)

// const COURSE_CATEGORIES = [
const DEPARTMENTS = [
  {
    id: 'arts',
    name: 'Arts',
    description: 'Civics, History, Economics and humanities',
    isActive: true,
    order: 1
  },
  {
    id: 'science',
    name: 'Science',
    description: 'Maths, Physics, Chemistry and Biology',
    isActive: true,
    order: 2
  },
  {
    id: 'vocational',
    name: 'Vocational',
    description: 'Vocational courses like MPT, Phisiotherapy',
    isActive: true,
    order: 3
  }
];


const MOCK_PROGRAMS = [
  {
    id: 'mpc',
    categoryId: 'science',
    name: 'MPC',
    yearsOrSemesters: 2,
    semesterType: 'years',
    description: 'Maths, Physics, Chemistry',
    isActive: true
  },
  {
    id: 'cec',
    name: 'CEC',
    categoryId: 'arts',
    yearsOrSemesters: 2,
    semesterType: 'years',
    description: 'Civics, Economics, Commerce',
    isActive: true
  },
  {
    id: 'mpt',
    name: 'MPT',
    categoryId: 'vocational',
    yearsOrSemesters: 2,
    semesterType: 'years',
    description: 'Physical education',
    isActive: true
  }
];

const MOCK_SUBJECTS = [
  {
    id: 'math1',
    name: 'Maths 1',    
    description: 'Introduction to differential calculus and its applications in computer science.',
    prerequisites: []
  },
  {
    id: 'civics1',
    name: 'Civics 1',
    description: 'Fundamental programming concepts using Python and Java.',
    prerequisites: []
  }
];

const MOCK_USERS = {
  superadmins: [
    {
      email: 'superadmin@questedu.com',
      password: 'SuperAdmin123!',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'superadmin',
      department: 'Administration',
      bio: 'System administrator with full access to all features.',
      collegeId: 'mit'
    }
  ],
  instructors: [
    {
      email: 'prof.smith@questedu.com',
      password: 'Instructor123!',
      firstName: 'John',
      lastName: 'Smith',
      role: 'instructor',
      department: 'Computer Science',
      bio: 'Experienced software engineer and educator with 10+ years in industry.',
      collegeId: 'mit',
      coreTeachingSkills: ['JavaScript', 'React', 'Node.js', 'Database Design'],
      additionalTeachingSkills: ['Project Management', 'Agile Methodology', 'Technical Writing']
    },
    {
      email: 'dr.johnson@questedu.com',
      password: 'Instructor123!',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'instructor',
      department: 'Data Science',
      bio: 'Data scientist and machine learning expert with PhD in Statistics.',
      collegeId: 'stanford',
      coreTeachingSkills: ['Python', 'Machine Learning', 'Statistics', 'Data Visualization'],
      additionalTeachingSkills: ['Research Methodology', 'Academic Writing', 'Mentoring']
    },
    {
      email: 'prof.patel@questedu.com',
      password: 'Instructor123!',
      firstName: 'Raj',
      lastName: 'Patel',
      role: 'instructor',
      department: 'Engineering',
      bio: 'Mechanical engineer with expertise in CAD design and manufacturing.',
      collegeId: 'iit-bombay',
      coreTeachingSkills: ['CAD Design', 'Manufacturing', 'Engineering Mathematics', 'Project Design'],
      additionalTeachingSkills: ['Industry Collaboration', 'Innovation Management']
    },
    {
      email: 'dr.brown@questedu.com',
      password: 'Instructor123!',
      firstName: 'Emily',
      lastName: 'Brown',
      role: 'instructor',
      department: 'Business',
      bio: 'Business consultant and entrepreneur teaching business strategy.',
      collegeId: 'university-cambridge',
      coreTeachingSkills: ['Business Strategy', 'Marketing', 'Finance', 'Leadership'],
      additionalTeachingSkills: ['Consulting', 'Entrepreneurship', 'Public Speaking']
    }
  ],
  students: [
    {
      email: 'alice.wilson@student.com',
      password: 'Student123!',
      firstName: 'Alice',
      lastName: 'Wilson',
      role: 'student',
      department: 'Computer Science',
      bio: 'Aspiring software developer interested in web technologies.',
      collegeId: 'mit',
      mainSubjects: ['Computer Science', 'Mathematics', 'Web Development'],
      class: 'Sophomore'
    },
    {
      email: 'bob.davis@student.com',
      password: 'Student123!',
      firstName: 'Bob',
      lastName: 'Davis',
      role: 'student',
      department: 'Data Science',
      bio: 'Data enthusiast learning machine learning and analytics.',
      collegeId: 'stanford',
      mainSubjects: ['Data Science', 'Statistics', 'Machine Learning'],
      class: 'Junior'
    },
    {
      email: 'carol.martinez@student.com',
      password: 'Student123!',
      firstName: 'Carol',
      lastName: 'Martinez',
      role: 'student',
      department: 'Engineering',
      bio: 'Engineering student focused on sustainable design.',
      collegeId: 'iit-bombay',
      mainSubjects: ['Mechanical Engineering', 'Sustainability', 'Design'],
      class: 'Senior'
    },
    {
      email: 'david.lee@student.com',
      password: 'Student123!',
      firstName: 'David',
      lastName: 'Lee',
      role: 'student',
      department: 'Business',
      bio: 'Business student with entrepreneurial aspirations.',
      collegeId: 'university-cambridge',
      mainSubjects: ['Business Administration', 'Marketing', 'Finance'],
      class: 'Freshman'
    },
    {
      email: 'eva.garcia@student.com',
      password: 'Student123!',
      firstName: 'Eva',
      lastName: 'Garcia',
      role: 'student',
      department: 'General Studies',
      bio: 'Exploring different fields to find my passion.',
      collegeId: 'community-college',
      mainSubjects: ['General Studies', 'Liberal Arts'],
      class: 'Freshman'
    },
    {
      email: 'frank.taylor@student.com',
      password: 'Student123!',
      firstName: 'Frank',
      lastName: 'Taylor',
      role: 'student',
      department: 'Computer Science',
      bio: 'Part-time student working in tech industry.',
      collegeId: 'community-college',
      mainSubjects: ['Computer Programming', 'Web Development'],
      class: 'Sophomore'
    }
  ]
};

const COURSE_TEMPLATES = [
  {
    title: 'Mathematics for Intermediate Students',
    description: 'Deepen your understanding of mathematical concepts and their applications',
    duration: 12, // weeks converted to duration number
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=1200&h=800&fit=crop&crop=center',
    imageFileName: 'mathematics-course.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=300&h=200&fit=crop&crop=center',
    tags: ['Mathematics', 'Algebra', 'Geometry', 'Calculus'],
    skills: ['Mathematical Reasoning', 'Problem Solving', 'Analytical Thinking'],
    prerequisites: ['Basic arithmetic and algebra'],
    objectives: [
      'Understand key mathematical concepts and their applications',
      'Solve complex mathematical problems',
      'Apply mathematical reasoning to real-world scenarios',
      'Develop critical thinking skills through mathematics',
      'Deploy applications to production'
    ],
    associations: [
      {
        categoryId: 'science',
        programId: 'mpc',
        subjectId: 'math1'
      }      
    ]
  }
];

// ==================== HELPER FUNCTIONS ====================

function generateRandomId() {
  return Math.random().toString(36).substr(2, 9);
}

function getRandomElements(array, count) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateMockTopics(courseTitle, instructorName, topicCount = 6) {
  const topicTemplates = [
    'Introduction and Overview',
    'Fundamentals and Basic Concepts', 
    'Practical Applications',
    'Advanced Techniques',
    'Project Development',
    'Best Practices and Review'
  ];
  
  return topicTemplates.slice(0, topicCount).map((template, index) => ({
    title: `${template} - ${courseTitle}`,
    description: `Comprehensive coverage of ${template.toLowerCase()} in ${courseTitle}`,
    order: index + 1,
    duration: 45 + Math.floor(Math.random() * 30), // 45-75 minutes
    isPublished: true,
    isFree: index === 0, // First topic is free
    prerequisites: index > 0 ? [`Topic ${index}`] : [],
    learningObjectives: [
      `Understand key concepts of ${template.toLowerCase()}`,
      `Apply knowledge in practical scenarios`,
      `Complete hands-on exercises`
    ],
    summary: `This topic covers ${template.toLowerCase()} essential for mastering ${courseTitle}.`,
    materials: [
      {
        id: generateRandomId(),
        type: 'video',
        title: `${template} Video Lecture`,
        url: `https://example.com/videos/${generateRandomId()}`,
        description: `Video lecture covering ${template.toLowerCase()}`,
        duration: 30,
        downloadable: false,
        order: 1
      },
      {
        id: generateRandomId(),
        type: 'pdf',
        title: `${template} Study Guide`,
        url: `https://example.com/pdfs/${generateRandomId()}`,
        description: `Comprehensive study guide for ${template.toLowerCase()}`,
        size: 1024 * 1024 * 2, // 2MB
        downloadable: true,
        order: 2
      }
    ],
    completionRate: Math.floor(Math.random() * 40) + 60, // 60-100%
    viewCount: Math.floor(Math.random() * 500) + 100
  }));
}

function generateMockQuestions(topicTitle, questionCount = 5, multilingualMode = false, DEFAULT_LANGUAGE = 'en') {
  // Helper for multilingual text
  function createMultilingualText(text) {
    return { en: text };
  }
  function getCompatibleText(multilingualText, lang) {
    return multilingualText && multilingualText[lang] ? multilingualText[lang] : '';
  }

  const questionTypes = ['multiple_choice', 'true_false', 'short_essay', 'long_essay'];
  const questions = [];

  for (let i = 0; i < questionCount; i++) {
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    let question = {
      questionText: `Question ${i + 1}: What is an important concept in ${topicTitle}?`,
      questionType,
      points: 5,
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
      tags: ['concept', 'understanding'],
      correctAnswer: `This answer for the given question and the key concepts in ${topicTitle}.`,
      explanation: `This question tests understanding of key concepts in ${topicTitle}.`,
      order: i + 1,
      isActive: true,
      flags: {
        important: Math.random() < 0.3,
        frequently_asked: Math.random() < 0.2,
        practical: Math.random() < 0.2,
        conceptual: Math.random() < 0.5
      }
    };

    // Add questionRichText and richtextanswer for essay types
    if (questionType === 'short_essay' || questionType === 'long_essay') {
      const baseText = `Rich text for ${questionType} in ${topicTitle}`;
      question.questionRichText = multilingualMode
        ? createMultilingualText(baseText)
        : baseText;
      question.correctAnswerRichText = multilingualMode
        ? createMultilingualText(`Sample answer for ${questionType} in ${topicTitle}`)
        : `Sample answer for ${questionType} in ${topicTitle}`;
    }

    if (questionType === 'multiple_choice') {
      question.options = [
        { text: 'Correct answer option', isCorrect: true },
        { text: 'Incorrect option 1', isCorrect: false },
        { text: 'Incorrect option 2', isCorrect: false },
        { text: 'Incorrect option 3', isCorrect: false }
      ];
    } else if (questionType === 'true_false') {
      question.options = [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false }
      ];
    } else if (questionType === 'short_essay' || questionType === 'long_essay') {
      // Ensure questionRichText and richtextanswer are set as per logic
      question.questionRichText = (questionType === 'short_essay' || questionType === 'long_essay')
        ? (multilingualMode
            ? (typeof question.questionRichText === 'string'
                ? createMultilingualText(question.questionRichText)
                : question.questionRichText || createMultilingualText(''))
            : (typeof question.questionRichText === 'string'
                ? question.questionRichText
                : getCompatibleText(question.questionRichText || createMultilingualText(''), DEFAULT_LANGUAGE)))
        : (multilingualMode ? createMultilingualText('') : '');
      question.correctAnswerRichText = (questionType === 'short_essay' || questionType === 'long_essay')
        ? (multilingualMode
            ? (typeof question.correctAnswerRichText === 'string'
                ? createMultilingualText(question.correctAnswerRichText)
                : question.correctAnswerRichText || createMultilingualText(''))
            : (typeof question.correctAnswerRichText === 'string'
                ? question.correctAnswerRichText
                : getCompatibleText(question.correctAnswerRichText || createMultilingualText(''), DEFAULT_LANGUAGE)))
        : (multilingualMode ? createMultilingualText('') : '');
    } else {
      question.acceptableAnswers = [`Key concept from ${topicTitle}`, 'Alternative answer'];
      question.caseSensitive = false;
    }

    questions.push(question);
  }

  return questions;
}

async function seedPrograms() {
  console.log('🎓 Seeding academic programs...');
  
  const batch = writeBatch(db);
  
  for (const program of MOCK_PROGRAMS) {
    const programData = {
      ...program,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: 'seed-script'
    };
    
    const programRef = doc(db, 'programs', program.id);
    batch.set(programRef, programData);
    
    createdData.programs.push({
      id: program.id,
      name: program.name,
      collegeId: program.collegeId,
      ...programData
    });
  }
  
  await batch.commit();
  console.log(`✅ Created ${MOCK_PROGRAMS.length} academic programs`);
}

async function seedSubjects() {
  console.log('📚 Seeding program subjects...');

  const batch = writeBatch(db);

  // We need to resolve instructor emails to UIDs first
  const instructorEmailToUid = {};

  // Get all users to map emails to UIDs
  const usersSnapshot = await db.collection('users').get();
  usersSnapshot.forEach((userDoc) => {
    const userData = userDoc.data();
    if (userData.email) {
      instructorEmailToUid[userData.email] = userDoc.id;
    }
  });

  for (const subject of MOCK_SUBJECTS) {
    // Resolve instructor email to UID
    const instructorUid = instructorEmailToUid[subject.instructorId] || 'unknown-instructor';

    const subjectData = {
      ...subject,
      instructorId: instructorUid,
      instructorName: subject.instructorId.includes('prof.')
        ? subject.instructorId.split('@')[0].replace('prof.', 'Prof. ').replace('.', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : subject.instructorId.includes('dr.')
        ? subject.instructorId.split('@')[0].replace('dr.', 'Dr. ').replace('.', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : 'Unknown Instructor',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: 'seed-script'
    };

    const subjectRef = db.collection('subjects').doc(subject.id);
    batch.set(subjectRef, subjectData);

    createdData.subjects.push({
      id: subject.id,
      name: subject.name,
      programId: subject.programId,
      collegeId: subject.collegeId,
      ...subjectData
    });
  }

  await batch.commit();
  console.log(`✅ Created ${MOCK_SUBJECTS.length} program subjects`);
}

async function seedUsers() {
  console.log('👥 Seeding users...');
  
  // Seed superadmins
  for (const userData of MOCK_USERS.superadmins) {
    try {
      const userRecord = await auth.createUser({ email: userData.email, password: userData.password, displayName: `${userData.firstName} ${userData.lastName}` });
      await auth.updateUser(userRecord.uid, { displayName: `${userData.firstName} ${userData.lastName}` });
      
      const userProfile = {
        uid: userRecord.uid,
        email: userRecord.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: `${userData.firstName} ${userData.lastName}`,
        role: userData.role,
        isActive: true,
        profileCompleted: true,
        department: userData.department,
        bio: userData.bio,
        collegeId: userData.collegeId,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', userRecord.uid), userProfile);
      createdData.users.superadmins.push({ uid: userRecord.uid, ...userProfile });
      
      console.log(`   ✅ Created superadmin: ${userData.email}`);
    } catch (error) {
      console.log(`   ⚠️  Skipped ${userData.email}: ${error.message}`);
    }
  }
  
  // Seed instructors
  for (const userData of MOCK_USERS.instructors) {
    try {
      const userRecord = await auth.createUser({ email: userData.email, password: userData.password, displayName: `${userData.firstName} ${userData.lastName}` });
      await auth.updateUser(userRecord.uid, { displayName: `${userData.firstName} ${userData.lastName}` });
      
      const userProfile = {
        uid: userRecord.uid,
        email: userRecord.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: `${userData.firstName} ${userData.lastName}`,
        role: userData.role,
        isActive: true,
        profileCompleted: true,
        department: userData.department,
        bio: userData.bio,
        collegeId: userData.collegeId,
        coreTeachingSkills: userData.coreTeachingSkills,
        additionalTeachingSkills: userData.additionalTeachingSkills,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', userRecord.uid), userProfile);
      createdData.users.instructors.push({ uid: userRecord.uid, ...userProfile });
      
      console.log(`   ✅ Created instructor: ${userData.email}`);
    } catch (error) {
      console.log(`   ⚠️  Skipped ${userData.email}: ${error.message}`);
    }
  }
  
  // Seed students
  for (const userData of MOCK_USERS.students) {
    try {
      const userRecord = await auth.createUser({ email: userData.email, password: userData.password, displayName: `${userData.firstName} ${userData.lastName}` });
      await auth.updateUser(userRecord.uid, { displayName: `${userData.firstName} ${userData.lastName}` });
      
      const userProfile = {
        uid: userRecord.uid,
        email: userRecord.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: `${userData.firstName} ${userData.lastName}`,
        role: userData.role,
        isActive: true,
        profileCompleted: true,
        department: userData.department,
        bio: userData.bio,
        collegeId: userData.collegeId,
        mainSubjects: userData.mainSubjects,
        class: userData.class,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', userRecord.uid), userProfile);
      createdData.users.students.push({ uid: userRecord.uid, ...userProfile });
      
      console.log(`   ✅ Created student: ${userData.email}`);
    } catch (error) {
      console.log(`   ⚠️  Skipped ${userData.email}: ${error.message}`);
    }
  }
  
  console.log(`✅ Created ${createdData.users.superadmins.length + createdData.users.instructors.length + createdData.users.students.length} users total`);
}

async function seedSuperAdminUsers() {
  console.log('👥 Seeding users...');
  
  // Seed superadmins
  for (const userData of MOCK_USERS.superadmins) {
    try {
      const userRecord = await auth.createUser({ email: userData.email, password: userData.password, displayName: `${userData.firstName} ${userData.lastName}` });
      await auth.updateUser(userRecord.uid, { displayName: `${userData.firstName} ${userData.lastName}` });
      
      const userProfile = {
        uid: userRecord.uid,
        email: userRecord.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: `${userData.firstName} ${userData.lastName}`,
        role: userData.role,
        isActive: true,
        profileCompleted: true,
        department: userData.department,
        bio: userData.bio,
        collegeId: userData.collegeId,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', userRecord.uid), userProfile);
      createdData.users.superadmins.push({ uid: userRecord.uid, ...userProfile });
      
      console.log(`   ✅ Created superadmin: ${userData.email}`);
    } catch (error) {
      console.log(`   ⚠️  Skipped ${userData.email}: ${error.message}`);
    }
  }
}

async function seedCourses() {
  console.log('📚 Seeding courses...');

  const instructors = createdData.users.instructors;

  for (let i = 0; i < COURSE_TEMPLATES.length && i < instructors.length; i++) {
    const courseTemplate = COURSE_TEMPLATES[i];
    const instructor = instructors[i];

    const courseData = {
      title: courseTemplate.title,
      description: courseTemplate.description,
      instructor: instructor.displayName,
      instructorId: instructor.uid,
      duration: courseTemplate.duration,
      status: 'published',
      isPublished: true,
      featured: Math.random() > 0.5,
      rating: 4.0 + Math.random() * 1.0, // 4.0-5.0
      ratingCount: Math.floor(Math.random() * 100) + 20,
      tags: courseTemplate.tags,
      skills: courseTemplate.skills,
      prerequisites: courseTemplate.prerequisites,
      objectives: courseTemplate.objectives,
      // Image fields from template
      image: courseTemplate.image,
      imageFileName: courseTemplate.imageFileName,
      thumbnailUrl: courseTemplate.thumbnailUrl,
      imageStoragePath: courseTemplate.imageStoragePath || `courses/${instructor.uid}/images/${courseTemplate.imageFileName}`,
      // Association fields from template (if provided)
      associations: Array.isArray(courseTemplate.associations)
        ? courseTemplate.associations.map(assoc => ({
            ...assoc,
            programName: createdData.programs.find(p => p.id === assoc.programId)?.name,
            subjectName: createdData.subjects.find(s => s.id === assoc.subjectId)?.name,
            yearOrSemester: createdData.subjects.find(s => s.id === assoc.subjectId)?.yearOrSemester,
            medium: createdData.subjects.find(s => s.id === assoc.subjectId)?.medium
          }))
        : courseTemplate.associations
        ? [{
            ...courseTemplate.associations,
            programName: createdData.programs.find(p => p.id === courseTemplate.associations.programId)?.name,
            subjectName: createdData.subjects.find(s => s.id === courseTemplate.associations.subjectId)?.name,
            yearOrSemester: createdData.subjects.find(s => s.id === courseTemplate.associations.subjectId)?.yearOrSemester,
            medium: createdData.subjects.find(s => s.id === courseTemplate.associations.subjectId)?.medium  
          }]
        : [],
      subtitles: ['English'],
      certificates: true,
      lifetimeAccess: true,
      mobileAccess: true,
      downloadableResources: true,
      articlesCount: 10,
      videosCount: 25,
      totalVideoLength: 600 + Math.floor(Math.random() * 400), // 600-1000 minutes
      lastModifiedBy: instructor.uid,
      publishedAt: new Date(),
      seoTitle: `${courseTemplate.title} - Learn ${courseTemplate.categoryId}`,
      seoDescription: courseTemplate.description,
      seoKeywords: courseTemplate.tags,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const courseRef = await db.collection('courses').add(courseData);
    const courseWithId = { id: courseRef.id, ...courseData };
    createdData.courses.push(courseWithId);

    console.log(`   ✅ Created course: ${courseTemplate.title}`);
  }

  console.log(`✅ Created ${createdData.courses.length} courses`);
}

async function seedTopics() {
  console.log('📝 Seeding course topics...');

  let totalTopics = 0;

  for (const course of createdData.courses) {
    const instructor = createdData.users.instructors.find(i => i.uid === course.instructorId);
    const topics = generateMockTopics(course.title, instructor.displayName);

    for (const topicData of topics) {
      const topicDoc = {
        courseId: course.id,
        ...topicData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: course.instructorId
      };

      const topicRef = await db.collection('courseTopics').add(topicDoc);
      const topicWithId = { id: topicRef.id, ...topicDoc };
      createdData.topics.push(topicWithId);
      totalTopics++;
    }
  }

  console.log(`✅ Created ${totalTopics} course topics`);
}

async function seedQuestions() {
  console.log('❓ Seeding course questions...');

  let totalQuestions = 0;

  for (const topic of createdData.topics) {
    const questions = generateMockQuestions(topic.title);

    for (const questionData of questions) {
      const questionDoc = {
        courseId: topic.courseId,
        topicId: topic.id,
        ...questionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'seed-script'
      };

      const questionRef = await db.collection('courseQuestions').add(questionDoc);
      const questionWithId = { id: questionRef.id, ...questionDoc };
      createdData.questions.push(questionWithId);
      totalQuestions++;
    }
  }

  console.log(`✅ Created ${totalQuestions} course questions`);
}

async function seedActivities() {
  console.log('📊 Seeding instructor activities...');

  const activities = [
    'course_created',
    'course_updated',
    'topic_added',
    'question_added',
    'course_published'
  ];

  let totalActivities = 0;

  // Create activities for instructors
  for (const instructor of createdData.users.instructors) {
    const instructorCourses = createdData.courses.filter(c => c.instructorId === instructor.uid);

    for (const course of instructorCourses) {
      // Create course creation activity
      const courseCreatedActivity = {
        userId: instructor.uid || '',
        userRole: 'instructor',
        action: 'course_created',
        entityType: 'course',
        entityId: course.id || '',
        entityTitle: course.title || '',
        description: `Created course "${course.title || 'Untitled Course'}"`,
        metadata: {
          courseId: course.id || '',
          courseTitle: course.title || '',
          category: course.categoryId || 'uncategorized'
        },
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      await db.collection('activities').add(courseCreatedActivity);
      totalActivities++;

      // Create topic activities
      const courseTopics = createdData.topics.filter(t => t.courseId === course.id);
      for (const topic of courseTopics.slice(0, 2)) { // Limit activities
        const topicActivity = {
          userId: instructor.uid || '',
          userRole: 'instructor',
          action: 'topic_added',
          entityType: 'topic',
          entityId: topic.id || '',
          entityTitle: topic.title || '',
          description: `Added topic "${topic.title || 'Untitled Topic'}" to course "${course.title || 'Untitled Course'}"`,
          metadata: {
            courseId: course.id || '',
            topicId: topic.id || '',
            topicTitle: topic.title || ''
          },
          timestamp: serverTimestamp(),
          createdAt: serverTimestamp()
        };

        await db.collection('activities').add(topicActivity);
        totalActivities++;
      }
    }
  }
  
  console.log(`✅ Created ${totalActivities} activities`);
}

async function seedDepartments() {
  console.log('📚 Seeding departments...');

  for (const departmentData of DEPARTMENTS) {
    try {
      const departmentDoc = {
        ...departmentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'departments', departmentData.id), departmentDoc);
      createdData.departments = createdData.departments || [];
      createdData.departments.push(departmentDoc);

      console.log(`   ✅ Created department: ${departmentData.name}`);
    } catch (error) {
      console.log(`   ⚠️  Failed to create department ${departmentData.name}: ${error.message}`);
    }
  }

  console.log(`✅ Created ${DEPARTMENTS.length} departments`);
}

// ==================== APP MASTER DATA ====================

const APP_MASTER_DOC_ID = 'college';
const AP_COLLEGE = {
    name: 'Government Junior College',
    accreditation: 'BIE',
    affiliation: 'Board of Intermediate Education',
    address: {
      street: 'Board of Intermediate Education',
      city: 'visakhapatnam',
      state: 'AndhraPradesh',
      country: 'India',
      postalCode: '530001'
    },
    contact: {
      phone: '+91-0000000000',
      email: 'info@au.edu',
      website: 'https://web.auc.edu'
    },
    website: 'https://web.auc.edu',
    principalName: 'Vice Chancellor',
    description: ''
};

async function seedAppMaster() {
  const appMasterRef = db.collection('appMaster').doc(APP_MASTER_DOC_ID);
  await appMasterRef.set({ college: AP_COLLEGE });
  console.log('✅ Seeded appMaster.college with Government Junior College');
}

// ==================== MAIN SEEDING FUNCTION ====================

async function seedDatabase() {
  console.log('🌱 QuestAdmin Database Seed Script');
  console.log('=' .repeat(50));
  
  const startTime = Date.now();
  
  try {
    
    // Step 1: Seed app master
    await seedAppMaster()

    // Step 2: Seed academic programs for colleges
    await seedPrograms();
    
    // Step 3: Seed course master data
    await seedDepartments();    
    
    // Step 4: Seed users (superadmin, instructors, students)
    await seedUsers();
    
    // Step 5: Seed program subjects (requires users to be created first)
    await seedSubjects();
    
    // Step 7: Seed courses linked to instructors
    await seedCourses();
    
    // Step 8: Seed topics for courses
    await seedTopics();
    
    // Step 9: Seed questions and answers for courses
    await seedQuestions();
    
    // Step 11: Seed instructor activities
    await seedActivities();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   • App Master: ${createdData.appMaster.length || 0}`);
    console.log(`   • Programs: ${createdData.programs.length}`);
    console.log(`   • Subjects: ${createdData.subjects.length}`);
    console.log(`   • Departments: ${createdData.departments?.length || 0}`);
    console.log(`   • Users: ${Object.values(createdData.users).flat().length}`);
    console.log(`     - Superadmins: ${createdData.users.superadmins.length}`);
    console.log(`     - Instructors: ${createdData.users.instructors.length}`);
    console.log(`     - Students: ${createdData.users.students.length}`);
    console.log(`   • Courses: ${createdData.courses.length}`);
    console.log(`   • Topics: ${createdData.topics.length}`);
    console.log(`   • Questions: ${createdData.questions.length}`);
    console.log(`   • Activities: ${createdData.activities.length}`);
    console.log(`   • Time taken: ${duration} seconds`);
    
    console.log('\n👤 Test User Credentials:');
    console.log('Superadmin:');
    console.log('  Email: superadmin@questedu.com');
    console.log('  Password: SuperAdmin123!');
    console.log('\nSample Instructor:');
    console.log('  Email: prof.smith@questedu.com');
    console.log('  Password: Instructor123!');
    console.log('\nSample Student:');
    console.log('  Email: alice.wilson@student.com');
    console.log('  Password: Student123!');
    
    console.log('\n🚀 Next steps:');
    console.log('   1. Login with any of the test accounts');
    console.log('   2. Explore the seeded courses');
    console.log('   3. Test college management as superadmin');
    console.log('   4. Verify all functionality works correctly');
    
  } catch (error) {
    console.error('\n💥 Database seeding failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   • Check your Firebase configuration');
    console.error('   • Ensure you have proper database permissions');
    console.error('   • Verify network connectivity');
    console.error('   • Check if user emails already exist');
    throw error;
  }
}

async function main() {
  const clearFirst = process.argv.includes('--clear-first');
  if (clearFirst) {
    console.log('Clearing old Colleges and collegeAdministrators collections...');
    // await clearOldCollections();
    console.log('✅ Cleared old collections');
  }
  await seedDatabase();
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { 
  seedDatabase, 
  seedPrograms,
  seedSubjects, 
  seedUsers,
  seedCourses, 
  seedTopics, 
  seedQuestions,  
  seedActivities,
  seedSuperAdminUsers,
  seedDepartments 
};
