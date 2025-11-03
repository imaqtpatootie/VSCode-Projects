// ===== SAMPLE ACTIVITIES DATA =====

/**
 * Sample data generator for testing the Activities system
 */
class SampleActivitiesData {
    constructor() {
        this.activityManager = null;
    }

    /**
     * Initialize and create sample data
     */
    async init() {
        // Wait for ActivityManager to be available
        if (typeof ActivityManager === 'undefined') {
            console.log('ActivityManager not available, skipping sample data creation');
            return;
        }

        this.activityManager = new ActivityManager();
        await this.createSampleActivities();
    }

    /**
     * Create sample activities for testing
     */
    async createSampleActivities() {
        try {
            // Sample Activity 1: Math Quiz
            const mathQuiz = {
                title: 'Chapter 5 Math Quiz - Algebra',
                description: 'Test your understanding of algebraic equations and problem-solving techniques.',
                instructions: 'Answer all questions carefully. You have 30 minutes to complete this quiz. Show your work where applicable.',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                timeLimit: 30,
                assignedClasses: ['class_101', 'class_102'],
                questions: [
                    {
                        type: ActivitySystem.QuestionType.MULTIPLE_CHOICE,
                        question: 'What is the value of x in the equation 2x + 5 = 13?',
                        points: 5,
                        options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
                        correctAnswer: 'x = 4'
                    },
                    {
                        type: ActivitySystem.QuestionType.SHORT_ANSWER,
                        question: 'Solve for y: 3y - 7 = 14',
                        points: 5,
                        maxLength: 100,
                        correctAnswer: 'y = 7'
                    },
                    {
                        type: ActivitySystem.QuestionType.TRUE_FALSE,
                        question: 'The equation x² = 16 has only one solution.',
                        points: 3,
                        correctAnswer: 'False'
                    }
                ]
            };

            const mathResult = await this.activityManager.createActivity(mathQuiz);
            if (mathResult.success) {
                await this.activityManager.publishActivity(mathResult.activity.id);
                console.log('Created sample Math Quiz:', mathResult.activity.id);
            }

            // Sample Activity 2: Science Essay
            const scienceEssay = {
                title: 'Climate Change Impact Essay',
                description: 'Write a comprehensive essay about the impacts of climate change on local ecosystems.',
                instructions: 'Write a well-structured essay of 500-800 words discussing the various impacts of climate change on ecosystems in your region. Include specific examples and potential solutions.',
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
                timeLimit: 60,
                assignedClasses: ['class_101'],
                questions: [
                    {
                        type: ActivitySystem.QuestionType.ESSAY,
                        question: 'Discuss the major impacts of climate change on local ecosystems in your region. Provide specific examples and explain how these changes affect biodiversity, food chains, and human communities.',
                        points: 25,
                        minLength: 500,
                        maxLength: 800
                    },
                    {
                        type: ActivitySystem.QuestionType.SHORT_ANSWER,
                        question: 'List three specific actions that individuals can take to help mitigate climate change impacts on local ecosystems.',
                        points: 10,
                        maxLength: 300
                    }
                ]
            };

            const scienceResult = await this.activityManager.createActivity(scienceEssay);
            if (scienceResult.success) {
                await this.activityManager.publishActivity(scienceResult.activity.id);
                console.log('Created sample Science Essay:', scienceResult.activity.id);
            }

            // Sample Activity 3: History Quiz (Draft)
            const historyQuiz = {
                title: 'World War II Timeline Quiz',
                description: 'Test your knowledge of major events during World War II.',
                instructions: 'Answer all questions about the chronology and key events of World War II.',
                dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
                timeLimit: 25,
                assignedClasses: ['class_101', 'class_102', 'class_103'],
                questions: [
                    {
                        type: ActivitySystem.QuestionType.MULTIPLE_CHOICE,
                        question: 'In which year did World War II begin?',
                        points: 2,
                        options: ['1938', '1939', '1940', '1941'],
                        correctAnswer: '1939'
                    },
                    {
                        type: ActivitySystem.QuestionType.MULTIPLE_CHOICE,
                        question: 'Which event led to the United States entering World War II?',
                        points: 3,
                        options: ['Invasion of Poland', 'Battle of Britain', 'Pearl Harbor Attack', 'D-Day Invasion'],
                        correctAnswer: 'Pearl Harbor Attack'
                    },
                    {
                        type: ActivitySystem.QuestionType.TRUE_FALSE,
                        question: 'The Battle of Stalingrad was a turning point in the war on the Eastern Front.',
                        points: 2,
                        correctAnswer: 'True'
                    },
                    {
                        type: ActivitySystem.QuestionType.SHORT_ANSWER,
                        question: 'Name two major Allied powers during World War II.',
                        points: 3,
                        maxLength: 100,
                        correctAnswer: 'United States, United Kingdom, Soviet Union (any two)'
                    }
                ]
            };

            const historyResult = await this.activityManager.createActivity(historyQuiz);
            if (historyResult.success) {
                // Keep this as draft for testing
                console.log('Created sample History Quiz (Draft):', historyResult.activity.id);
            }

            // Sample Activity 4: English Literature Analysis
            const literatureAnalysis = {
                title: 'Shakespeare Character Analysis',
                description: 'Analyze the character development in Romeo and Juliet.',
                instructions: 'Choose one main character from Romeo and Juliet and provide a detailed analysis of their development throughout the play.',
                dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
                assignedClasses: ['class_102'],
                questions: [
                    {
                        type: ActivitySystem.QuestionType.MULTIPLE_CHOICE,
                        question: 'Which character serves as the primary antagonist in Romeo and Juliet?',
                        points: 5,
                        options: ['Tybalt', 'Capulet', 'The Feud itself', 'Paris'],
                        correctAnswer: 'The Feud itself'
                    },
                    {
                        type: ActivitySystem.QuestionType.ESSAY,
                        question: 'Choose either Romeo or Juliet and analyze how their character develops throughout the play. Discuss their motivations, key decisions, and how they change from the beginning to the end of the story.',
                        points: 20,
                        minLength: 400,
                        maxLength: 600
                    }
                ]
            };

            const literatureResult = await this.activityManager.createActivity(literatureAnalysis);
            if (literatureResult.success) {
                await this.activityManager.publishActivity(literatureResult.activity.id);
                console.log('Created sample Literature Analysis:', literatureResult.activity.id);
            }

            // Sample Activity 5: Overdue Activity
            const overdueActivity = {
                title: 'Basic Computer Skills Assessment',
                description: 'Assessment of fundamental computer and digital literacy skills.',
                instructions: 'Complete all questions about basic computer operations and digital safety.',
                dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (overdue)
                timeLimit: 20,
                assignedClasses: ['class_101'],
                questions: [
                    {
                        type: ActivitySystem.QuestionType.MULTIPLE_CHOICE,
                        question: 'Which of the following is the best practice for creating a strong password?',
                        points: 3,
                        options: [
                            'Use your name and birthday',
                            'Use a combination of letters, numbers, and symbols',
                            'Use the same password for all accounts',
                            'Use only lowercase letters'
                        ],
                        correctAnswer: 'Use a combination of letters, numbers, and symbols'
                    },
                    {
                        type: ActivitySystem.QuestionType.TRUE_FALSE,
                        question: 'It is safe to click on links in emails from unknown senders.',
                        points: 2,
                        correctAnswer: 'False'
                    },
                    {
                        type: ActivitySystem.QuestionType.SHORT_ANSWER,
                        question: 'What does "URL" stand for?',
                        points: 2,
                        maxLength: 100,
                        correctAnswer: 'Uniform Resource Locator'
                    }
                ]
            };

            const overdueResult = await this.activityManager.createActivity(overdueActivity);
            if (overdueResult.success) {
                await this.activityManager.publishActivity(overdueResult.activity.id);
                console.log('Created sample Overdue Activity:', overdueResult.activity.id);
            }

            console.log('✅ Sample activities created successfully!');

        } catch (error) {
            console.error('Error creating sample activities:', error);
        }
    }

    /**
     * Create sample student responses for testing
     */
    async createSampleResponses() {
        try {
            // Get all published activities
            const activities = Array.from(this.activityManager.activities.values())
                .filter(activity => activity.status === ActivitySystem.ActivityStatus.PUBLISHED);

            // Create sample responses for student_123
            const studentId = 'student_123';

            for (const activity of activities.slice(0, 2)) { // Only first 2 activities
                const responses = {};
                
                // Generate sample answers based on question types
                activity.questions.forEach(question => {
                    switch (question.type) {
                        case ActivitySystem.QuestionType.MULTIPLE_CHOICE:
                            responses[question.id] = question.correctAnswer; // Correct answer
                            break;
                        case ActivitySystem.QuestionType.TRUE_FALSE:
                            responses[question.id] = question.correctAnswer; // Correct answer
                            break;
                        case ActivitySystem.QuestionType.SHORT_ANSWER:
                            responses[question.id] = question.correctAnswer || 'Sample short answer';
                            break;
                        case ActivitySystem.QuestionType.ESSAY:
                            responses[question.id] = 'This is a sample essay response that demonstrates the student\'s understanding of the topic. The response includes relevant examples and shows critical thinking skills.';
                            break;
                    }
                });

                // Submit the response
                await this.activityManager.submitResponse(activity.id, studentId, responses);
            }

            console.log('✅ Sample student responses created!');

        } catch (error) {
            console.error('Error creating sample responses:', error);
        }
    }

    /**
     * Clear all sample data
     */
    clearSampleData() {
        if (this.activityManager) {
            this.activityManager.clearAllData();
            console.log('✅ Sample data cleared!');
        }
    }
}

// Auto-initialize sample data when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for all activity system components to load
    setTimeout(async () => {
        if (window.ActivityManager) {
            const sampleData = new SampleActivitiesData();
            await sampleData.init();
            
            // Also create sample responses
            setTimeout(async () => {
                await sampleData.createSampleResponses();
            }, 1000);
            
            // Store reference for manual testing
            window.sampleActivitiesData = sampleData;
        }
    }, 2000);
});

// Export for manual use
window.SampleActivitiesData = SampleActivitiesData;