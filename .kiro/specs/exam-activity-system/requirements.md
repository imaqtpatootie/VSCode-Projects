# Requirements Document

## Introduction

The Exam and Activity System is a web-based platform that enables teachers to create, post, and manage educational activities and exams, while allowing students to access, complete, and submit their responses directly through the student portal. This system facilitates seamless interaction between teachers and students for academic assessments and learning activities.

## Glossary

- **Activity_System**: The web-based platform that manages educational activities and exams
- **Teacher_Interface**: The administrative interface used by teachers to create and manage activities
- **Student_Interface**: The student-facing interface for accessing and completing activities
- **Activity**: Any educational task, assignment, quiz, or exam posted by teachers
- **Response**: Student's answer or submission to an activity
- **Activity_Status**: The current state of an activity (draft, published, closed, graded)
- **Submission_Status**: The state of a student's response (not_started, in_progress, submitted, graded)

## Requirements

### Requirement 1

**User Story:** As a teacher, I want to create and post activities so that students can access and complete them online.

#### Acceptance Criteria

1. WHEN a teacher accesses the teacher interface, THE Activity_System SHALL display an activity creation form
2. THE Activity_System SHALL allow teachers to input activity title, description, instructions, and due date
3. WHEN a teacher saves an activity, THE Activity_System SHALL store the activity with draft status
4. WHEN a teacher publishes an activity, THE Activity_System SHALL change the activity status to published and make it visible to students
5. THE Activity_System SHALL allow teachers to edit activities while in draft status

### Requirement 2

**User Story:** As a teacher, I want to create different types of questions so that I can assess students comprehensively.

#### Acceptance Criteria

1. THE Activity_System SHALL support multiple choice questions with up to 6 options
2. THE Activity_System SHALL support short answer questions with text input
3. THE Activity_System SHALL support essay questions with rich text input
4. THE Activity_System SHALL support true/false questions
5. WHEN a teacher creates a question, THE Activity_System SHALL allow setting point values for each question

### Requirement 3

**User Story:** As a student, I want to view available activities so that I can complete my assignments and exams.

#### Acceptance Criteria

1. WHEN a student accesses the student interface, THE Activity_System SHALL display all published activities assigned to their class
2. THE Activity_System SHALL show activity title, description, due date, and submission status for each activity
3. WHEN a student clicks on an activity, THE Activity_System SHALL display the activity details and questions
4. THE Activity_System SHALL prevent students from accessing activities not assigned to their class
5. THE Activity_System SHALL display activities in chronological order by due date

### Requirement 4

**User Story:** As a student, I want to answer questions and submit my responses so that I can complete my assignments.

#### Acceptance Criteria

1. WHEN a student opens an activity, THE Activity_System SHALL display all questions in sequential order
2. THE Activity_System SHALL allow students to input answers for each question type
3. THE Activity_System SHALL save student responses automatically as they type
4. WHEN a student submits an activity, THE Activity_System SHALL change the submission status to submitted
5. THE Activity_System SHALL prevent students from modifying responses after submission

### Requirement 5

**User Story:** As a teacher, I want to view student submissions so that I can grade and provide feedback.

#### Acceptance Criteria

1. WHEN a teacher views an activity, THE Activity_System SHALL display a list of all student submissions
2. THE Activity_System SHALL show student name, submission time, and submission status for each response
3. WHEN a teacher clicks on a submission, THE Activity_System SHALL display the student's answers
4. THE Activity_System SHALL allow teachers to assign grades and add feedback comments
5. WHEN a teacher saves grades, THE Activity_System SHALL update the submission status to graded

### Requirement 6

**User Story:** As a student, I want to see my grades and feedback so that I can track my academic progress.

#### Acceptance Criteria

1. WHEN a student views completed activities, THE Activity_System SHALL display their grade if available
2. THE Activity_System SHALL show teacher feedback comments for graded submissions
3. THE Activity_System SHALL display the total points earned and maximum possible points
4. THE Activity_System SHALL calculate and display percentage scores for graded activities
5. THE Activity_System SHALL maintain a history of all completed activities with grades

### Requirement 7

**User Story:** As a teacher, I want to set time limits and access controls so that I can ensure fair assessment conditions.

#### Acceptance Criteria

1. THE Activity_System SHALL allow teachers to set start and end dates for activity availability
2. THE Activity_System SHALL allow teachers to set time limits for activity completion
3. WHEN an activity time limit is reached, THE Activity_System SHALL automatically submit the student's current responses
4. THE Activity_System SHALL prevent students from accessing activities outside the specified date range
5. THE Activity_System SHALL display remaining time to students during timed activities