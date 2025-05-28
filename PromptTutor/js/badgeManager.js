// Badge Manager Module
const BadgeManager = {
    // Badge definitions
    badges: {
        // Prompt Quality Badges
        'Clarity Master': {
            name: 'Clarity Master',
            description: 'Achieved a perfect score in Clarity criteria',
            icon: '🎯',
            category: 'Quality',
            condition: (history) => history.some(entry => entry.criteria && entry.criteria.Clarity === 5)
        },
        'Specificity Expert': {
            name: 'Specificity Expert',
            description: 'Achieved a perfect score in Specificity criteria',
            icon: '🎯',
            category: 'Quality',
            condition: (history) => history.some(entry => entry.criteria && entry.criteria.Specificity === 5)
        },
        'Structure Pro': {
            name: 'Structure Pro',
            description: 'Achieved a perfect score in Structure criteria',
            icon: '🎯',
            category: 'Quality',
            condition: (history) => history.some(entry => entry.criteria && entry.criteria.Structure === 5)
        },
        'Completeness Champion': {
            name: 'Completeness Champion',
            description: 'Achieved a perfect score in Completeness criteria',
            icon: '🎯',
            category: 'Quality',
            condition: (history) => history.some(entry => entry.criteria && entry.criteria.Completeness === 5)
        },
        'Complexity Wizard': {
            name: 'Complexity Wizard',
            description: 'Achieved a perfect score in Complexity Management criteria',
            icon: '🎯',
            category: 'Quality',
            condition: (history) => history.some(entry => entry.criteria && entry.criteria['Complexity Management'] === 5)
        },

        // Use Case Badges
        'Chatbot Expert': {
            name: 'Chatbot Expert',
            description: 'Submitted 5 high-quality chatbot prompts',
            icon: '🤖',
            category: 'Use Case',
            condition: (history) => {
                const chatbotPrompts = history.filter(entry => 
                    entry.type === 'Chatbot' && entry.score >= 80
                );
                return chatbotPrompts.length >= 5;
            }
        },
        'Code Master': {
            name: 'Code Master',
            description: 'Submitted 5 high-quality coding prompts',
            icon: '💻',
            category: 'Use Case',
            condition: (history) => {
                const codingPrompts = history.filter(entry => 
                    entry.type === 'Coding' && entry.score >= 80
                );
                return codingPrompts.length >= 5;
            }
        },
        'Image Artist': {
            name: 'Image Artist',
            description: 'Submitted 5 high-quality image prompts',
            icon: '🎨',
            category: 'Use Case',
            condition: (history) => {
                const imagePrompts = history.filter(entry => 
                    entry.type === 'Image' && entry.score >= 80
                );
                return imagePrompts.length >= 5;
            }
        },
        'Research Scholar': {
            name: 'Research Scholar',
            description: 'Submitted 5 high-quality research prompts',
            icon: '📚',
            category: 'Use Case',
            condition: (history) => {
                const researchPrompts = history.filter(entry => 
                    entry.type === 'Research' && entry.score >= 80
                );
                return researchPrompts.length >= 5;
            }
        },

        // Achievement Badges
        'Perfect Score': {
            name: 'Perfect Score',
            description: 'Achieved a perfect score (100) on any prompt',
            icon: '🏆',
            category: 'Achievement',
            condition: (history) => history.some(entry => entry.score === 100)
        },
        'Consistent Excellence': {
            name: 'Consistent Excellence',
            description: 'Achieved scores above 90 for 5 consecutive prompts',
            icon: '🔥',
            category: 'Achievement',
            condition: (history) => {
                if (history.length < 5) return false;
                const lastFive = history.slice(-5);
                return lastFive.every(entry => entry.score >= 90);
            }
        },
        'Quick Learner': {
            name: 'Quick Learner',
            description: 'Improved score by 20 points between consecutive prompts',
            icon: '📈',
            category: 'Achievement',
            condition: (history) => {
                if (history.length < 2) return false;
                const lastTwo = history.slice(-2);
                return lastTwo[1].score - lastTwo[0].score >= 20;
            }
        },

        // Style Badges
        'Bullet Point Pro': {
            name: 'Bullet Point Pro',
            description: 'Used bullet points effectively in 3 prompts',
            icon: '•',
            category: 'Style',
            condition: (history) => {
                const bulletPointPrompts = history.filter(entry => Array.isArray(entry.styles) && entry.styles.includes('uses_bullet_points'));
                return bulletPointPrompts.length >= 3;
            }
        },
        'Step-by-Step Master': {
            name: 'Step-by-Step Master',
            description: 'Used numbered steps effectively in 3 prompts',
            icon: '1️⃣',
            category: 'Style',
            condition: (history) => {
                const stepPrompts = history.filter(entry => Array.isArray(entry.styles) && entry.styles.includes('uses_numbered_steps'));
                return stepPrompts.length >= 3;
            }
        },
        'Role Player': {
            name: 'Role Player',
            description: 'Specified AI role effectively in 3 prompts',
            icon: '🎭',
            category: 'Style',
            condition: (history) => {
                const rolePrompts = history.filter(entry => Array.isArray(entry.styles) && entry.styles.includes('specifies_role'));
                return rolePrompts.length >= 3;
            }
        },
        'Example Expert': {
            name: 'Example Expert',
            description: 'Provided examples effectively in 3 prompts',
            icon: '💡',
            category: 'Style',
            condition: (history) => {
                const examplePrompts = history.filter(entry => Array.isArray(entry.styles) && entry.styles.includes('provides_examples'));
                return examplePrompts.length >= 3;
            }
        },
        'Prompt Pioneer': {
            name: 'Prompt Pioneer',
            description: 'Submitted your very first prompt!',
            icon: '🚀',
            category: 'Milestone',
            condition: (history) => history.length >= 1
        },
        'Prompt Marathoner': {
            name: 'Prompt Marathoner',
            description: 'Submitted 25 prompts in total',
            icon: '🏃‍♂️',
            category: 'Consistency',
            condition: (history) => history.length >= 25
        },
        'Prompt Century': {
            name: 'Prompt Century',
            description: 'Submitted 100 prompts in total',
            icon: '💯',
            category: 'Consistency',
            condition: (history) => history.length >= 100
        },
        'All-Rounder': {
            name: 'All-Rounder',
            description: 'Submitted at least one prompt in every use case',
            icon: '🧩',
            category: 'Diversity',
            condition: (history) => {
                const types = new Set(history.map(e => e.type));
                return ['Chatbot','Coding','Image','Research'].every(t => types.has(t));
            }
        },
        'Streak Starter': {
            name: 'Streak Starter',
            description: 'Improved your score for 3 prompts in a row',
            icon: '🔗',
            category: 'Consistency',
            condition: (history) => {
                if (history.length < 3) return false;
                let streak = 1;
                for (let i = history.length - 2; i >= 0; i--) {
                    if (history[i+1].score > history[i].score) streak++;
                    else streak = 1;
                    if (streak >= 3) return true;
                }
                return false;
            }
        },
        'Streak Master': {
            name: 'Streak Master',
            description: 'Improved your score for 7 prompts in a row',
            icon: '🏅',
            category: 'Consistency',
            condition: (history) => {
                if (history.length < 7) return false;
                let streak = 1;
                for (let i = history.length - 2; i >= 0; i--) {
                    if (history[i+1].score > history[i].score) streak++;
                    else streak = 1;
                    if (streak >= 7) return true;
                }
                return false;
            }
        },
        'Feedback Follower': {
            name: 'Feedback Follower',
            description: 'Submitted a prompt that directly implements a previous suggestion',
            icon: '🔁',
            category: 'Growth',
            condition: (history) => history.some(e => e.prompt && e.prompt.includes('[Emphasize]:'))
        },
        'Revisionist': {
            name: 'Revisionist',
            description: 'Submitted 5 improved versions of the same base prompt',
            icon: '📝',
            category: 'Growth',
            condition: (history) => {
                const map = {};
                history.forEach(e => {
                    const base = (e.prompt || '').slice(0, 40);
                    map[base] = (map[base] || 0) + 1;
                });
                return Object.values(map).some(count => count >= 5);
            }
        },
        'Night Owl': {
            name: 'Night Owl',
            description: 'Submitted a prompt between midnight and 5am',
            icon: '🦉',
            category: 'Milestone',
            condition: (history) => history.some(e => {
                const d = new Date(e.timestamp);
                return d.getHours() >= 0 && d.getHours() < 5;
            })
        },
        'Early Bird': {
            name: 'Early Bird',
            description: 'Submitted a prompt between 5am and 8am',
            icon: '🌅',
            category: 'Milestone',
            condition: (history) => history.some(e => {
                const d = new Date(e.timestamp);
                return d.getHours() >= 5 && d.getHours() < 8;
            })
        },
        'Weekend Warrior': {
            name: 'Weekend Warrior',
            description: 'Submitted a prompt on a Saturday or Sunday',
            icon: '🛡️',
            category: 'Milestone',
            condition: (history) => history.some(e => {
                const d = new Date(e.timestamp);
                return d.getDay() === 0 || d.getDay() === 6;
            })
        },
        'Detail Detective': {
            name: 'Detail Detective',
            description: 'Scored 5/5 in Specificity on any prompt',
            icon: '🔍',
            category: 'Quality',
            condition: (history) => history.some(e => e.criteria && e.criteria.Specificity === 5)
        },
        'Structure Sage': {
            name: 'Structure Sage',
            description: 'Scored 5/5 in Structure on 3 different prompts',
            icon: '📐',
            category: 'Quality',
            condition: (history) => history.filter(e => e.criteria && e.criteria.Structure === 5).length >= 3
        },
        'Completeness Guru': {
            name: 'Completeness Guru',
            description: 'Scored 5/5 in Completeness on 3 different prompts',
            icon: '🧘',
            category: 'Quality',
            condition: (history) => history.filter(e => e.criteria && e.criteria.Completeness === 5).length >= 3
        },
        'Complexity Tamer': {
            name: 'Complexity Tamer',
            description: 'Scored 5/5 in Complexity Management on 3 different prompts',
            icon: '🦾',
            category: 'Quality',
            condition: (history) => history.filter(e => e.criteria && e.criteria['Complexity Management'] === 5).length >= 3
        },
        'Instruction Emphasis Ace': {
            name: 'Instruction Emphasis Ace',
            description: 'Scored 5/5 in Instruction Emphasis on any prompt',
            icon: '📢',
            category: 'Quality',
            condition: (history) => history.some(e => e.criteria && e.criteria['Instruction Emphasis'] === 5)
        },
        'Prompt Polisher': {
            name: 'Prompt Polisher',
            description: 'Improved a prompt to increase its score by at least 30 points',
            icon: '✨',
            category: 'Growth',
            condition: (history) => {
                for (let i = 1; i < history.length; i++) {
                    if (history[i].prompt && history[i-1].prompt && history[i].prompt !== history[i-1].prompt && (history[i].score - history[i-1].score) >= 30) {
                        return true;
                    }
                }
                return false;
            }
        },
        'Prompt Streaker': {
            name: 'Prompt Streaker',
            description: 'Submitted prompts 7 days in a row',
            icon: '📅',
            category: 'Consistency',
            condition: (history) => {
                if (history.length < 7) return false;
                const days = new Set(history.map(e => new Date(e.timestamp).toDateString()));
                return days.size >= 7;
            }
        },
        'Prompt Addict': {
            name: 'Prompt Addict',
            description: 'Submitted prompts on 30 different days',
            icon: '🗓️',
            category: 'Consistency',
            condition: (history) => {
                const days = new Set(history.map(e => new Date(e.timestamp).toDateString()));
                return days.size >= 30;
            }
        },
        'Prompt Socialite': {
            name: 'Prompt Socialite',
            description: 'Included a contact (email or LinkedIn) in your profile',
            icon: '📧',
            category: 'Community',
            condition: (history) => {
                return history.some(e => e.contact && e.contact.length > 0);
            }
        },
        'Continent Explorer': {
            name: 'Continent Explorer',
            description: 'Submitted prompts from 3 different continents',
            icon: '🌍',
            category: 'Diversity',
            condition: (history) => {
                const continents = new Set(history.map(e => e.continent).filter(Boolean));
                return continents.size >= 3;
            }
        },
        'Prompt Collaborator': {
            name: 'Prompt Collaborator',
            description: 'Used "we" or "our" in a prompt, showing collaboration',
            icon: '🤝',
            category: 'Community',
            condition: (history) => history.some(e => e.prompt && (/\bwe\b|\bour\b/i).test(e.prompt))
        },
        'Persona Crafter': {
            name: 'Persona Crafter',
            description: 'Specified a unique AI persona in a prompt',
            icon: '🦸',
            category: 'Creativity',
            condition: (history) => history.some(e => e.prompt && /as an? [a-z ]+/i.test(e.prompt))
        },
        'Prompt Minimalist': {
            name: 'Prompt Minimalist',
            description: 'Submitted a prompt under 30 characters',
            icon: '🥷',
            category: 'Creativity',
            condition: (history) => history.some(e => e.prompt && e.prompt.length < 30)
        },
        'Prompt Maximalist': {
            name: 'Prompt Maximalist',
            description: 'Submitted a prompt over 500 characters',
            icon: '🦑',
            category: 'Creativity',
            condition: (history) => history.some(e => e.prompt && e.prompt.length > 500)
        },
        'Emoji Enthusiast': {
            name: 'Emoji Enthusiast',
            description: 'Used 3 or more emojis in a single prompt',
            icon: '😃',
            category: 'Creativity',
            condition: (history) => history.some(e => e.prompt && (e.prompt.match(/\p{Emoji}/gu) || []).length >= 3)
        },
        'Question Master': {
            name: 'Question Master',
            description: 'Submitted 10 prompts that end with a question mark',
            icon: '❓',
            category: 'Style',
            condition: (history) => history.filter(e => e.prompt && e.prompt.trim().endsWith('?')).length >= 10
        },
        'Output Specifier': {
            name: 'Output Specifier',
            description: 'Explicitly specified the desired output format in a prompt',
            icon: '📄',
            category: 'Style',
            condition: (history) => history.some(e => e.prompt && /output|format|as a|in the form of/i.test(e.prompt))
        },
        'Prompt Teacher': {
            name: 'Prompt Teacher',
            description: 'Wrote a prompt that asks the AI to explain or teach something',
            icon: '👩‍🏫',
            category: 'Use Case',
            condition: (history) => history.some(e => e.prompt && /explain|teach|instruct/i.test(e.prompt))
        },
        'Prompt Challenger': {
            name: 'Prompt Challenger',
            description: 'Wrote a prompt that asks the AI to critique or challenge an idea',
            icon: '⚔️',
            category: 'Use Case',
            condition: (history) => history.some(e => e.prompt && /critique|challenge|argue|debate/i.test(e.prompt))
        },
        'Prompt Storyteller': {
            name: 'Prompt Storyteller',
            description: 'Wrote a prompt that asks for a story or narrative',
            icon: '📖',
            category: 'Use Case',
            condition: (history) => history.some(e => e.prompt && /story|narrative|tale|once upon a time/i.test(e.prompt))
        },
        'Prompt Visualizer': {
            name: 'Prompt Visualizer',
            description: 'Wrote a prompt that asks for a visual or image',
            icon: '🖼️',
            category: 'Use Case',
            condition: (history) => history.some(e => e.prompt && /draw|image|visual|picture|diagram/i.test(e.prompt))
        },
        'Prompt Researcher': {
            name: 'Prompt Researcher',
            description: 'Wrote a prompt that asks for research or references',
            icon: '🔬',
            category: 'Use Case',
            condition: (history) => history.some(e => e.prompt && /research|reference|cite|source/i.test(e.prompt))
        },
        'Prompt Summarizer': {
            name: 'Prompt Summarizer',
            description: 'Wrote a prompt that asks for a summary or TL;DR',
            icon: '📝',
            category: 'Use Case',
            condition: (history) => history.some(e => e.prompt && /summarize|summary|tl;dr|recap/i.test(e.prompt))
        },
        'Prompt Translator': {
            name: 'Prompt Translator',
            description: 'Wrote a prompt that asks for translation',
            icon: '🌐',
            category: 'Use Case',
            condition: (history) => history.some(e => e.prompt && /translate|translation|in [a-z]+/i.test(e.prompt))
        },
        'Prompt Debugger': {
            name: 'Prompt Debugger',
            description: 'Wrote a prompt that asks for code debugging or review',
            icon: '🐞',
            category: 'Use Case',
            condition: (history) => history.some(e => e.prompt && /debug|fix|review|error/i.test(e.prompt))
        },
        'Prompt Optimizer': {
            name: 'Prompt Optimizer',
            description: 'Wrote a prompt that asks for optimization or improvement',
            icon: '⚡',
            category: 'Use Case',
            condition: (history) => history.some(e => e.prompt && /optimize|improve|make better|enhance/i.test(e.prompt))
        },
        'Prompt Analyzer': {
            name: 'Prompt Analyzer',
            description: 'Wrote a prompt that asks for analysis or breakdown',
            icon: '🔎',
            category: 'Use Case',
            condition: (history) => history.some(e => e.prompt && /analyze|analysis|breakdown|decompose/i.test(e.prompt))
        },
        'Prompt Comparator': {
            name: 'Prompt Comparator',
            description: 'Wrote a prompt that asks for a comparison',
            icon: '⚖️',
            category: 'Use Case',
            condition: (history) => history.some(e => e.prompt && /compare|comparison|vs\.|versus/i.test(e.prompt))
        },
        'Prompt Customizer': {
            name: 'Prompt Customizer',
            description: 'Wrote a prompt that asks for customization or personalization',
            icon: '🛠️',
            category: 'Use Case',
            condition: (history) => history.some(e => e.prompt && /customize|personalize|tailor|adapt/i.test(e.prompt))
        },
        'Prompt Explorer': {
            name: 'Prompt Explorer',
            description: 'Tried all four main prompt types at least twice each',
            icon: '🌏',
            category: 'Diversity',
            condition: (history) => {
                const typeCounts = {Chatbot:0, Coding:0, Image:0, Research:0};
                history.forEach(e => { if (typeCounts[e.type] !== undefined) typeCounts[e.type]++; });
                return Object.values(typeCounts).every(count => count >= 2);
            }
        },
        'Prompt Veteran': {
            name: 'Prompt Veteran',
            description: 'Submitted prompts for 6 months (180 days) since first prompt',
            icon: '🎖️',
            category: 'Consistency',
            condition: (history) => {
                if (history.length < 2) return false;
                const first = Math.min(...history.map(e => e.timestamp));
                const last = Math.max(...history.map(e => e.timestamp));
                return (last - first) >= 1000*60*60*24*180;
            }
        },
        'Prompt Legend': {
            name: 'Prompt Legend',
            description: 'Unlocked 30 different badges',
            icon: '🏆',
            category: 'Mastery',
            condition: (history) => {
                if (!this || !this.unlockedBadges) return false;
                return this.unlockedBadges.size >= 30;
            }
        }
    },

    // Initialize badge tracking
    init() {
        // Load previously unlocked badges from localStorage (with timestamps)
        this.unlockedBadges = new Set();
        this.unlockedTimestamps = {};
        const savedBadges = localStorage.getItem('PRT_Badges');
        if (savedBadges) {
            let parsed = JSON.parse(savedBadges);
            // If it's an array (old format), treat as unlocked set; if object, treat as {id: timestamp}
            if (Array.isArray(parsed)) {
                this.unlockedBadges = new Set(parsed);
            } else if (parsed && typeof parsed === 'object') {
                this.unlockedBadges = new Set(Object.keys(parsed));
                this.unlockedTimestamps = parsed;
            }
        }
    },

    // Check for newly unlocked badges
    checkBadges(history) {
        if (!Array.isArray(history)) {
            console.error('History must be an array');
            return [];
        }

        const newlyUnlocked = [];
        
        for (const [badgeId, badge] of Object.entries(this.badges)) {
            try {
                if (!this.unlockedBadges.has(badgeId) && badge.condition(history)) {
                    this.unlockedBadges.add(badgeId);
                    this.unlockedTimestamps[badgeId] = Date.now();
                    newlyUnlocked.push({
                        id: badgeId,
                        ...badge
                    });
                }
            } catch (error) {
                console.error(`Error checking badge ${badgeId}:`, error);
            }
        }

        // Save updated badges to localStorage (with timestamps)
        if (newlyUnlocked.length > 0) {
            localStorage.setItem('PRT_Badges', JSON.stringify(this.unlockedTimestamps));
        }

        return newlyUnlocked;
    },

    // Get all unlocked badges (with timestamps)
    getUnlockedBadges() {
        return Array.from(this.unlockedBadges).map(badgeId => ({
            id: badgeId,
            ...this.badges[badgeId],
            unlockedAt: this.unlockedTimestamps[badgeId] || null
        }));
    },

    // Get all badge statuses (for UI: unlocked/locked)
    getAllBadgeStatuses() {
        const all = {};
        for (const badgeId of Object.keys(this.badges)) {
            all[badgeId] = this.unlockedBadges.has(badgeId) ? (this.unlockedTimestamps[badgeId] || true) : false;
        }
        return all;
    },

    // Get badges by category
    getBadgesByCategory() {
        const categories = {};
        
        for (const [badgeId, badge] of Object.entries(this.badges)) {
            if (!categories[badge.category]) {
                categories[badge.category] = [];
            }
            
            categories[badge.category].push({
                id: badgeId,
                ...badge,
                unlocked: this.unlockedBadges.has(badgeId)
            });
        }

        return categories;
    },

    // Get progress towards a specific badge
    getBadgeProgress(badgeId, history) {
        if (!Array.isArray(history)) {
            console.error('History must be an array');
            return null;
        }

        const badge = this.badges[badgeId];
        if (!badge) return null;

        try {
            // For badges that track counts
            if (badgeId.includes('Expert') || badgeId.includes('Master') || badgeId.includes('Pro')) {
                const target = badgeId.includes('Quality') ? 1 : 5;
                const current = history.filter(entry => {
                    if (!entry || !entry.criteria) return false;
                    if (badgeId.includes('Quality')) {
                        const criterion = badge.name.split(' ')[0];
                        return entry.criteria[criterion] === 5;
                    } else {
                        return entry.type === badge.name.split(' ')[0] && entry.score >= 80;
                    }
                }).length;
                return { current, target };
            }

            // For style badges
            if (badge.category === 'Style') {
                const style = badge.name.toLowerCase().replace(/\s+/g, '_');
                const current = history.filter(entry => 
                    entry && entry.styles && Array.isArray(entry.styles) && 
                    entry.styles.includes(style)
                ).length;
                return { current, target: 3 };
            }

            // For achievement badges
            if (badge.category === 'Achievement') {
                if (badgeId === 'Perfect Score') {
                    return { 
                        current: history.some(entry => entry && entry.score === 100) ? 1 : 0, 
                        target: 1 
                    };
                }
                if (badgeId === 'Consistent Excellence') {
                    if (history.length < 5) return { current: 0, target: 5 };
                    const lastFive = history.slice(-5);
                    const current = lastFive.filter(entry => entry && entry.score >= 90).length;
                    return { current, target: 5 };
                }
                if (badgeId === 'Quick Learner') {
                    if (history.length < 2) return { current: 0, target: 1 };
                    const lastTwo = history.slice(-2);
                    if (!lastTwo[0] || !lastTwo[1]) return { current: 0, target: 1 };
                    return { 
                        current: lastTwo[1].score - lastTwo[0].score >= 20 ? 1 : 0, 
                        target: 1 
                    };
                }
            }

            return null;
        } catch (error) {
            console.error(`Error calculating progress for badge ${badgeId}:`, error);
            return null;
        }
    },

    // Add getBadgeDefinitions for compatibility
    getBadgeDefinitions() {
        return this.badges;
    }
};
