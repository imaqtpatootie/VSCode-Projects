# Requirements Document

## Introduction

The Student Portal Dashboard is a comprehensive post-login system for Sagay National High School that provides students with access to community features, voting capabilities for school elections, and personalized academic resources. This system will enhance student engagement and provide a centralized platform for school-related activities and communications.

## Glossary

- **Student Portal**: The authenticated area of the website accessible only to logged-in students
- **Community Forum**: A discussion platform where students can create topics, post messages, and interact with peers
- **Voting System**: An electronic voting platform for school elections and polls
- **Dashboard**: The main landing page after login showing personalized information and quick access to features
- **Election**: A formal voting process for student government positions or school-related decisions
- **Poll**: A simple voting mechanism for gathering student opinions on various topics
- **User Session**: The authenticated state of a logged-in student with associated permissions and data

## Requirements

### Requirement 1

**User Story:** As a student, I want to access a personalized dashboard after logging in, so that I can quickly view my information and navigate to different portal features.

#### Acceptance Criteria

1. WHEN a student successfully logs in, THE Student Portal SHALL display a personalized dashboard with the student's name and basic information
2. THE Student Portal SHALL provide navigation links to community forum, voting system, and academic resources
3. THE Student Portal SHALL display recent announcements and upcoming events relevant to the student
4. THE Student Portal SHALL show quick stats like unread forum messages and active elections
5. THE Student Portal SHALL maintain the student's session for 2 hours of inactivity before requiring re-authentication

### Requirement 2

**User Story:** As a student, I want to participate in a community forum, so that I can discuss topics with my classmates and share information about school activities.

#### Acceptance Criteria

1. THE Student Portal SHALL provide access to a community forum with different categories for academic subjects, school events, and general discussions
2. WHEN a student creates a new forum topic, THE Student Portal SHALL require a title, category selection, and message content
3. THE Student Portal SHALL allow students to reply to existing forum topics with text messages
4. THE Student Portal SHALL display forum topics in chronological order with the most recent activity first
5. THE Student Portal SHALL show the author's name, grade level, and timestamp for each forum post and reply

### Requirement 3

**User Story:** As a student, I want to vote in school elections, so that I can participate in the democratic process of selecting student government representatives.

#### Acceptance Criteria

1. THE Student Portal SHALL display active elections with candidate information and voting instructions
2. WHEN a student casts a vote, THE Student Portal SHALL record the vote securely and prevent duplicate voting by the same student
3. THE Student Portal SHALL show election results only after the voting period has ended
4. THE Student Portal SHALL allow students to view their voting history for transparency
5. IF an election is not currently active, THEN THE Student Portal SHALL display a message indicating no active elections

### Requirement 4

**User Story:** As a student, I want to participate in school polls, so that I can share my opinion on various school-related topics and decisions.

#### Acceptance Criteria

1. THE Student Portal SHALL display active polls with clear questions and answer options
2. WHEN a student submits a poll response, THE Student Portal SHALL record the response and show real-time results
3. THE Student Portal SHALL allow students to change their poll responses before the poll closes
4. THE Student Portal SHALL display poll results as percentages and vote counts
5. THE Student Portal SHALL show the poll creation date and closing date for each active poll

### Requirement 5

**User Story:** As a student, I want to receive notifications about new forum activity and elections, so that I can stay informed about important discussions and voting opportunities.

#### Acceptance Criteria

1. THE Student Portal SHALL display a notification counter showing unread forum replies and new elections
2. WHEN a student receives a reply to their forum post, THE Student Portal SHALL mark it as a new notification
3. THE Student Portal SHALL highlight new elections and polls that the student has not yet participated in
4. THE Student Portal SHALL allow students to mark notifications as read to clear the notification counter
5. THE Student Portal SHALL automatically mark notifications as read when the student views the related content

### Requirement 6

**User Story:** As a student, I want to manage my profile information, so that I can keep my details current and control how I appear in the community forum.

#### Acceptance Criteria

1. THE Student Portal SHALL provide a profile management section where students can view their basic information
2. THE Student Portal SHALL allow students to update their display name and add a brief bio for forum interactions
3. THE Student Portal SHALL display the student's grade level and track (STEM, ABM, HUMSS, TVL) in their profile
4. THE Student Portal SHALL prevent students from modifying core academic information like student ID and official name
5. THE Student Portal SHALL save profile changes immediately and confirm successful updates to the student