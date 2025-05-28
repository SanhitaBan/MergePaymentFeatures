// Prompt Evaluator Module
const PromptEvaluator = {
    // Configuration
    config: {
        useSimulation: true, // Set to false to use real API
        apiKey: null,
        apiEndpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-4-0613'
    },

    // Prompt type specific criteria weights
    criteriaWeights: {
        Chatbot: {
            Clarity: 2.0,
            Specificity: 1.5,
            Structure: 1.0,
            Completeness: 1.5,
            'Complexity Management': 1.0,
            'Instruction Emphasis': 1.0
        },
        Coding: {
            Clarity: 1.5,
            Specificity: 2.0,
            Structure: 1.5,
            Completeness: 2.0,
            'Complexity Management': 1.5,
            'Correctness & Constraints': 2.0
        },
        Image: {
            Clarity: 1.5,
            Specificity: 2.0,
            Structure: 1.0,
            Completeness: 1.5,
            'Complexity Management': 1.0,
            'Originality/Creativity': 2.0
        },
        Research: {
            Clarity: 1.5,
            Specificity: 1.5,
            Structure: 2.0,
            Completeness: 2.0,
            'Complexity Management': 2.0,
            'Use of Best Practices': 1.5
        }
    },

    // Initialize with API key if provided
    init(apiKey = null) {
        if (apiKey) {
            this.config.useSimulation = false;
            this.config.apiKey = apiKey;
        }
    },

    // Main evaluation function
    async reviewPrompt(prompt, type) {
        if (!prompt || !type) {
            throw new Error('Prompt and type are required');
        }

        if (this.config.useSimulation) {
            return this.simulateEvaluation(prompt, type);
        } else {
            return this.callGPTAPI(prompt, type);
        }
    },

    // Simulation mode for development/testing
    simulateEvaluation(prompt, type) {
        // Get criteria weights for this prompt type
        const weights = this.criteriaWeights[type] || this.criteriaWeights.Chatbot;
        
        // Generate scores based on weights
        const criteria = {};
        let totalWeight = 0;
        let weightedSum = 0;

        for (const [criterion, weight] of Object.entries(weights)) {
            // Generate a score between 1-5
            const score = Math.floor(Math.random() * 3) + 3; // Bias towards 3-5
            criteria[criterion] = score;
            
            // Add to weighted sum
            weightedSum += score * weight;
            totalWeight += weight;
        }

        // Calculate overall score (0-100)
        const score = Math.round((weightedSum / totalWeight) * 20);

        // Generate type-specific suggestions
        const suggestions = this.generateTypeSpecificSuggestions(prompt, type, criteria);

        // Generate an improved version
        const improvedPrompt = this.generateImprovedPrompt(prompt, type, criteria);

        // Extract topics and entities
        const { topics, entities, styles } = this.extractPromptFeatures(prompt, type);

        return {
            prompt,
            type,
            score,
            criteria,
            suggestions,
            improvedPrompt,
            topics,
            entities,
            styles
        };
    },

    // Generate type-specific suggestions
    generateTypeSpecificSuggestions(prompt, type, criteria) {
        const suggestions = [];
        
        switch (type) {
            case 'Chatbot':
                if (criteria.Clarity < 4) {
                    suggestions.push('Make your question more specific and clear about what you want to know.');
                }
                if (criteria.Specificity < 4) {
                    suggestions.push('Add context about your target audience or desired response style.');
                }
                break;
            
            case 'Coding':
                if (criteria['Correctness & Constraints'] < 4) {
                    suggestions.push('Specify any constraints or requirements for the code solution.');
                }
                if (criteria.Completeness < 4) {
                    suggestions.push('Include relevant code context or error messages if applicable.');
                }
                break;
            
            case 'Image':
                if (criteria['Originality/Creativity'] < 4) {
                    suggestions.push('Add more creative and specific details about the desired image style and mood.');
                }
                if (criteria.Specificity < 4) {
                    suggestions.push('Include specific details about composition, lighting, and artistic style.');
                }
                break;
            
            case 'Research':
                if (criteria.Structure < 4) {
                    suggestions.push('Organize your research request into clear sections (context, questions, desired format).');
                }
                if (criteria['Complexity Management'] < 4) {
                    suggestions.push('Break down complex research questions into smaller, manageable parts.');
                }
                break;
        }

        // Add general suggestions based on criteria scores
        if (criteria.Clarity < 3) {
            suggestions.push('Make your instructions clearer and more direct.');
        }
        if (criteria.Structure < 3) {
            suggestions.push('Use formatting (bullet points, sections) to better organize your prompt.');
        }
        if (criteria['Complexity Management'] < 3) {
            suggestions.push('Break down complex tasks into step-by-step instructions.');
        }

        return suggestions;
    },

    // Extract features from prompt
    extractPromptFeatures(prompt, type) {
        // Simple feature extraction for simulation mode
        const topics = ['AI', 'prompting', type.toLowerCase()];
        const entities = ['OpenAI', 'GPT'];
        const styles = [];

        // Check for common style features
        if (prompt.includes('•') || prompt.includes('-')) {
            styles.push('uses_bullet_points');
        }
        if (prompt.includes('Step') || prompt.includes('1.')) {
            styles.push('uses_numbered_steps');
        }
        if (prompt.includes('You are') || prompt.includes('Act as')) {
            styles.push('specifies_role');
        }
        if (prompt.includes('Example') || prompt.includes('For instance')) {
            styles.push('provides_examples');
        }

        return { topics, entities, styles };
    },

    // Helper to extract the first JSON object from a string
    extractFirstJson(str) {
        const firstBrace = str.indexOf('{');
        if (firstBrace === -1) throw new Error('No JSON object found in response');
        let depth = 0;
        for (let i = firstBrace; i < str.length; i++) {
            if (str[i] === '{') depth++;
            if (str[i] === '}') depth--;
            if (depth === 0) {
                const jsonString = str.slice(firstBrace, i + 1);
                return JSON.parse(jsonString);
            }
        }
        throw new Error('No complete JSON object found in response');
    },

    // Real API call to GPT-4.1
    async callGPTAPI(prompt, type) {
        if (!this.config.apiKey) {
            throw new Error('API key not set');
        }

        const weights = this.criteriaWeights[type] || this.criteriaWeights.Chatbot;
        const criteriaList = Object.keys(weights).join(', ');

        const messages = [
            {
                role: 'system',
                content: `You are an expert prompt analyst. You will receive a prompt and its intended use-case.
                Analyze the prompt based on these criteria: ${criteriaList}
                For each criterion, provide a rating from 1-5 and explain why.
                Follow OpenAI's best practices in your critique.
                Provide a score out of 10 and a revised improved prompt.
                Also identify key topics, entities, and style features used.
                Reply in JSON format with the following structure:
                {
                    "criteria": {
                        "Criterion1": { "rating": 1-5, "explanation": "..." },
                        "Criterion2": { "rating": 1-5, "explanation": "..." },
                        ...
                    },
                    "score": 1-10,
                    "suggestions": ["suggestion1", "suggestion2", ...],
                    "improvedPrompt": "improved version",
                    "topics": ["topic1", "topic2", ...],
                    "entities": ["entity1", "entity2", ...],
                    "styles": ["style1", "style2", ...]
                }`
            },
            {
                role: 'user',
                content: `PROMPT TYPE: ${type}\nPROMPT: ${prompt}\n\nAnalyze this prompt as per instructions.`
            }
        ];

        try {
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify({
                    model: this.config.model,
                    messages,
                    temperature: 0,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.statusText}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;
            const result = this.extractFirstJson(content);

            // Convert score to 0-100 scale
            result.score = Math.round(result.score * 10);

            // Extract just the ratings from criteria
            const criteria = {};
            for (const [criterion, data] of Object.entries(result.criteria)) {
                criteria[criterion] = data.rating;
            }
            result.criteria = criteria;

            return {
                prompt,
                type,
                ...result
            };
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Helper to generate improved prompt in simulation mode
    generateImprovedPrompt(prompt, type, criteria) {
        const improvements = {
            Chatbot: `You are a helpful AI assistant. Please respond to the following request in a clear and concise manner:

${prompt}

Please provide a detailed response that addresses all aspects of the request.`,
            Coding: `You are an expert programmer. Please help with the following coding task:

${prompt}

Please provide a solution with clear explanations and comments.`,
            Image: `You are an AI image generation expert. Please create an image based on the following description:

${prompt}

Please ensure the image matches the description in style, composition, and mood.`,
            Research: `You are a research assistant. Please analyze the following topic:

${prompt}

Please provide a comprehensive analysis with relevant examples and citations.`
        };

        return improvements[type] || prompt;
    }
};
