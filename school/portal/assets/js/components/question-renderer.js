// ===== QUESTION RENDERER COMPONENT =====

/**
 * QuestionRenderer Class
 * Handles rendering different question types with appropriate input controls
 */
class QuestionRenderer {
    constructor() {
        this.renderedQuestions = new Map();
        this.eventListeners = new Map();
        
        this.init();
    }

    /**
     * Initialize the Question Renderer
     */
    init() {
        console.log('QuestionRenderer initialized');
    }

    // ===== MAIN RENDERING METHODS =====

    /**
     * Render a question with appropriate input controls
     * @param {Object} question - Question object to render
     * @param {Object} options - Rendering options
     * @returns {HTMLElement} Rendered question element
     */
    renderQuestion(question, options = {}) {
        const {
            showCorrectAnswer = false,
            isReadOnly = false,
            currentAnswer = null,
            showFeedback = false,
            feedback = null,
            questionNumber = null
        } = options;

        // Create main question container
        const questionElement = document.createElement('div');
        questionElement.className = 'question-container';
        questionElement.setAttribute('data-question-id', question.id);
        questionElement.setAttribute('data-question-type', question.type);

        // Question header
        const header = this.createQuestionHeader(question, questionNumber);
        questionElement.appendChild(header);

        // Question content based on type
        const content = this.createQuestionContent(question, {
            showCorrectAnswer,
            isReadOnly,
            currentAnswer,
            showFeedback,
            feedback
        });
        questionElement.appendChild(content);

        // Store reference
        this.renderedQuestions.set(question.id, questionElement);

        return questionElement;
    }

    /**
     * Create question header with number, text, and points
     * @param {Object} question - Question object
     * @param {number} questionNumber - Question number
     * @returns {HTMLElement} Header element
     */
    createQuestionHeader(question, questionNumber) {
        const header = document.createElement('div');
        header.className = 'question-header';

        // Question number and points
        const meta = document.createElement('div');
        meta.className = 'question-meta';

        if (questionNumber) {
            const number = document.createElement('span');
            number.className = 'question-number';
            number.textContent = `${questionNumber}.`;
            meta.appendChild(number);
        }

        const points = document.createElement('span');
        points.className = 'question-points';
        points.textContent = `${question.points} point${question.points !== 1 ? 's' : ''}`;
        meta.appendChild(points);

        header.appendChild(meta);

        // Question text
        const questionText = document.createElement('div');
        questionText.className = 'question-text';
        questionText.innerHTML = this.sanitizeHTML(question.question);
        header.appendChild(questionText);

        // Required indicator
        if (question.required) {
            const required = document.createElement('span');
            required.className = 'question-required';
            required.textContent = '*';
            required.setAttribute('aria-label', 'Required question');
            questionText.appendChild(required);
        }

        return header;
    }

    /**
     * Create question content based on type
     * @param {Object} question - Question object
     * @param {Object} options - Rendering options
     * @returns {HTMLElement} Content element
     */
    createQuestionContent(question, options) {
        const content = document.createElement('div');
        content.className = 'question-content';

        switch (question.type) {
            case ActivitySystem.QuestionType.MULTIPLE_CHOICE:
                content.appendChild(this.renderMultipleChoice(question, options));
                break;

            case ActivitySystem.QuestionType.TRUE_FALSE:
                content.appendChild(this.renderTrueFalse(question, options));
                break;

            case ActivitySystem.QuestionType.SHORT_ANSWER:
                content.appendChild(this.renderShortAnswer(question, options));
                break;

            case ActivitySystem.QuestionType.ESSAY:
                content.appendChild(this.renderEssay(question, options));
                break;

            default:
                content.appendChild(this.renderUnsupportedType(question));
        }

        return content;
    }

    // ===== TYPE-SPECIFIC RENDERING METHODS =====

    /**
     * Render multiple choice question
     * @param {Object} question - Question object
     * @param {Object} options - Rendering options
     * @returns {HTMLElement} Multiple choice element
     */
    renderMultipleChoice(question, options) {
        const container = document.createElement('div');
        container.className = 'multiple-choice-container';

        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'multiple-choice-options';
        optionsContainer.setAttribute('role', 'radiogroup');
        optionsContainer.setAttribute('aria-labelledby', `question-${question.id}-text`);

        // Shuffle options if specified
        const optionsToRender = question.shuffleOptions && !options.showCorrectAnswer 
            ? this.shuffleArray([...question.options])
            : question.options;

        optionsToRender.forEach((option, index) => {
            const optionContainer = document.createElement('div');
            optionContainer.className = 'multiple-choice-option';

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `question-${question.id}`;
            input.value = option;
            input.id = `question-${question.id}-option-${index}`;
            input.disabled = options.isReadOnly;

            // Set current answer
            if (options.currentAnswer === option) {
                input.checked = true;
            }

            // Show correct answer styling
            if (options.showCorrectAnswer) {
                if (option === question.correctAnswer) {
                    optionContainer.classList.add('correct-answer');
                } else if (options.currentAnswer === option && option !== question.correctAnswer) {
                    optionContainer.classList.add('incorrect-answer');
                }
            }

            const label = document.createElement('label');
            label.htmlFor = input.id;
            label.className = 'multiple-choice-label';
            label.textContent = option;

            optionContainer.appendChild(input);
            optionContainer.appendChild(label);
            optionsContainer.appendChild(optionContainer);

            // Add event listener
            if (!options.isReadOnly) {
                input.addEventListener('change', (e) => {
                    this.handleAnswerChange(question.id, e.target.value);
                    this.updateSelectionVisuals(question.id, e.target);
                });
            }
        });

        container.appendChild(optionsContainer);
        return container;
    }

    /**
     * Render true/false question
     * @param {Object} question - Question object
     * @param {Object} options - Rendering options
     * @returns {HTMLElement} True/false element
     */
    renderTrueFalse(question, options) {
        const container = document.createElement('div');
        container.className = 'true-false-container';

        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'true-false-options';
        optionsContainer.setAttribute('role', 'radiogroup');

        const truefalseOptions = ['True', 'False'];

        truefalseOptions.forEach((option, index) => {
            const optionContainer = document.createElement('div');
            optionContainer.className = 'true-false-option';

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `question-${question.id}`;
            input.value = option;
            input.id = `question-${question.id}-${option.toLowerCase()}`;
            input.disabled = options.isReadOnly;

            // Set current answer
            if (options.currentAnswer === option || 
                (options.currentAnswer === true && option === 'True') ||
                (options.currentAnswer === false && option === 'False')) {
                input.checked = true;
            }

            // Show correct answer styling
            if (options.showCorrectAnswer) {
                const correctAnswer = question.correctAnswer === true || question.correctAnswer === 'True' ? 'True' : 'False';
                if (option === correctAnswer) {
                    optionContainer.classList.add('correct-answer');
                } else if (input.checked && option !== correctAnswer) {
                    optionContainer.classList.add('incorrect-answer');
                }
            }

            const label = document.createElement('label');
            label.htmlFor = input.id;
            label.className = 'true-false-label';
            label.textContent = option;

            optionContainer.appendChild(input);
            optionContainer.appendChild(label);
            optionsContainer.appendChild(optionContainer);

            // Add event listener
            if (!options.isReadOnly) {
                input.addEventListener('change', (e) => {
                    this.handleAnswerChange(question.id, e.target.value);
                    this.updateSelectionVisuals(question.id, e.target);
                });
            }
        });

        container.appendChild(optionsContainer);
        return container;
    }

    /**
     * Render short answer question
     * @param {Object} question - Question object
     * @param {Object} options - Rendering options
     * @returns {HTMLElement} Short answer element
     */
    renderShortAnswer(question, options) {
        const container = document.createElement('div');
        container.className = 'short-answer-container';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'short-answer-input';
        input.id = `question-${question.id}-input`;
        input.setAttribute('data-question-id', question.id);
        input.placeholder = 'Enter your answer...';
        input.disabled = options.isReadOnly;

        // Set character limit
        if (question.maxLength) {
            input.maxLength = question.maxLength;
        }

        // Set current answer
        if (options.currentAnswer) {
            input.value = options.currentAnswer;
        }

        // Show correct answer styling
        if (options.showCorrectAnswer && question.correctAnswer) {
            if (options.currentAnswer && 
                this.isAnswerCorrect(options.currentAnswer, question.correctAnswer, question.caseSensitive)) {
                container.classList.add('correct-answer');
            } else if (options.currentAnswer) {
                container.classList.add('incorrect-answer');
            }
        }

        container.appendChild(input);

        // Character counter
        if (question.maxLength) {
            const counter = document.createElement('div');
            counter.className = 'character-counter';
            counter.textContent = `${input.value.length}/${question.maxLength}`;
            container.appendChild(counter);

            // Update counter on input
            input.addEventListener('input', () => {
                counter.textContent = `${input.value.length}/${question.maxLength}`;
            });
        }

        // Add event listener
        if (!options.isReadOnly) {
            input.addEventListener('input', (e) => {
                this.handleAnswerChange(question.id, e.target.value);
            });
        }

        return container;
    }

    /**
     * Render essay question
     * @param {Object} question - Question object
     * @param {Object} options - Rendering options
     * @returns {HTMLElement} Essay element
     */
    renderEssay(question, options) {
        const container = document.createElement('div');
        container.className = 'essay-container';

        const textarea = document.createElement('textarea');
        textarea.className = 'essay-textarea';
        textarea.id = `question-${question.id}-textarea`;
        textarea.setAttribute('data-question-id', question.id);
        textarea.placeholder = 'Write your essay here...';
        textarea.disabled = options.isReadOnly;
        textarea.rows = 8;

        // Set character limits
        if (question.maxLength) {
            textarea.maxLength = question.maxLength;
        }

        // Set current answer
        if (options.currentAnswer) {
            textarea.value = options.currentAnswer;
        }

        container.appendChild(textarea);

        // Character counter
        if (question.maxLength) {
            const counter = document.createElement('div');
            counter.className = 'character-counter';
            counter.textContent = `${textarea.value.length}/${question.maxLength}`;
            container.appendChild(counter);

            // Update counter on input
            textarea.addEventListener('input', () => {
                counter.textContent = `${textarea.value.length}/${question.maxLength}`;
            });
        }

        // Minimum length indicator
        if (question.minLength) {
            const minIndicator = document.createElement('div');
            minIndicator.className = 'min-length-indicator';
            minIndicator.textContent = `Minimum ${question.minLength} characters required`;
            container.appendChild(minIndicator);
        }

        // Add event listener
        if (!options.isReadOnly) {
            textarea.addEventListener('input', (e) => {
                this.handleAnswerChange(question.id, e.target.value);
            });
        }

        return container;
    }

    /**
     * Render unsupported question type
     * @param {Object} question - Question object
     * @returns {HTMLElement} Unsupported type element
     */
    renderUnsupportedType(question) {
        const container = document.createElement('div');
        container.className = 'unsupported-type-container';

        const message = document.createElement('div');
        message.className = 'unsupported-type-message';
        message.textContent = `Unsupported question type: ${question.type}`;

        container.appendChild(message);
        return container;
    }

    // ===== UTILITY METHODS =====

    /**
     * Handle answer change events
     * @param {string} questionId - Question ID
     * @param {any} answer - New answer value
     */
    handleAnswerChange(questionId, answer) {
        // Dispatch custom event for answer changes
        const event = new CustomEvent('questionAnswerChanged', {
            detail: {
                questionId: questionId,
                answer: answer,
                timestamp: new Date()
            }
        });

        document.dispatchEvent(event);
    }

    /**
     * Update visual selection state for radio buttons
     * @param {string} questionId - Question ID
     * @param {HTMLElement} selectedInput - The selected radio input
     */
    updateSelectionVisuals(questionId, selectedInput) {
        // Find all radio buttons for this question
        const radioButtons = document.querySelectorAll(`input[name="question-${questionId}"]`);
        
        radioButtons.forEach(radio => {
            const optionContainer = radio.closest('.multiple-choice-option, .true-false-option');
            if (optionContainer) {
                if (radio === selectedInput && radio.checked) {
                    optionContainer.classList.add('selected');
                } else {
                    optionContainer.classList.remove('selected');
                }
            }
        });
    }

    /**
     * Get current answer for a question
     * @param {string} questionId - Question ID
     * @returns {any} Current answer value
     */
    getCurrentAnswer(questionId) {
        const questionElement = this.renderedQuestions.get(questionId);
        if (!questionElement) return null;

        const questionType = questionElement.getAttribute('data-question-type');

        switch (questionType) {
            case ActivitySystem.QuestionType.MULTIPLE_CHOICE:
            case ActivitySystem.QuestionType.TRUE_FALSE:
                const radioInput = questionElement.querySelector('input[type="radio"]:checked');
                return radioInput ? radioInput.value : null;

            case ActivitySystem.QuestionType.SHORT_ANSWER:
                const textInput = questionElement.querySelector('input[type="text"]');
                return textInput ? textInput.value : null;

            case ActivitySystem.QuestionType.ESSAY:
                const textarea = questionElement.querySelector('textarea');
                return textarea ? textarea.value : null;

            default:
                return null;
        }
    }

    /**
     * Set answer for a question
     * @param {string} questionId - Question ID
     * @param {any} answer - Answer to set
     */
    setAnswer(questionId, answer) {
        const questionElement = this.renderedQuestions.get(questionId);
        if (!questionElement) return;

        const questionType = questionElement.getAttribute('data-question-type');

        switch (questionType) {
            case ActivitySystem.QuestionType.MULTIPLE_CHOICE:
            case ActivitySystem.QuestionType.TRUE_FALSE:
                const radioInput = questionElement.querySelector(`input[type="radio"][value="${answer}"]`);
                if (radioInput) radioInput.checked = true;
                break;

            case ActivitySystem.QuestionType.SHORT_ANSWER:
                const textInput = questionElement.querySelector('input[type="text"]');
                if (textInput) textInput.value = answer || '';
                break;

            case ActivitySystem.QuestionType.ESSAY:
                const textarea = questionElement.querySelector('textarea');
                if (textarea) textarea.value = answer || '';
                break;
        }
    }

    /**
     * Check if an answer is correct
     * @param {string} studentAnswer - Student's answer
     * @param {string} correctAnswer - Correct answer
     * @param {boolean} caseSensitive - Whether comparison is case sensitive
     * @returns {boolean} Whether answer is correct
     */
    isAnswerCorrect(studentAnswer, correctAnswer, caseSensitive = false) {
        if (!studentAnswer || !correctAnswer) return false;

        const student = caseSensitive ? studentAnswer : studentAnswer.toLowerCase().trim();
        const correct = caseSensitive ? correctAnswer : correctAnswer.toLowerCase().trim();

        return student === correct;
    }

    /**
     * Shuffle array (for randomizing multiple choice options)
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Sanitize HTML content
     * @param {string} html - HTML string to sanitize
     * @returns {string} Sanitized HTML
     */
    sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    /**
     * Clear all rendered questions
     */
    clearAll() {
        this.renderedQuestions.clear();
        this.eventListeners.clear();
    }

    /**
     * Remove a specific rendered question
     * @param {string} questionId - Question ID to remove
     */
    removeQuestion(questionId) {
        this.renderedQuestions.delete(questionId);
        this.eventListeners.delete(questionId);
    }
}

// Export QuestionRenderer
window.QuestionRenderer = QuestionRenderer;

console.log('QuestionRenderer component loaded successfully');