// Data Manager Module
const DataManager = {
    // Storage keys
    STORAGE_KEYS: {
        USER_PROFILE: 'PRT_UserProfile',
        HISTORY: 'PRT_History',
        LEADERBOARD: 'PRT_Leaderboard',
        BADGES: 'PRT_Badges',
        KNOWLEDGE_GRAPH: 'PRT_KnowledgeGraph',
        CSV: 'PRT_CSV'
    },

    // Initialize storage if empty
    init() {
        Object.values(this.STORAGE_KEYS).forEach(key => {
            if (!localStorage.getItem(key)) {
                switch (key) {
                    case this.STORAGE_KEYS.USER_PROFILE:
                        localStorage.setItem(key, JSON.stringify({}));
                        break;
                    case this.STORAGE_KEYS.HISTORY:
                        localStorage.setItem(key, JSON.stringify([]));
                        break;
                    case this.STORAGE_KEYS.LEADERBOARD:
                        localStorage.setItem(key, JSON.stringify([]));
                        break;
                    case this.STORAGE_KEYS.BADGES:
                        localStorage.setItem(key, JSON.stringify({}));
                        break;
                    case this.STORAGE_KEYS.KNOWLEDGE_GRAPH:
                        localStorage.setItem(key, JSON.stringify({
                            topics: {},
                            entities: {},
                            styles: {},
                            associations: []
                        }));
                        break;
                    case this.STORAGE_KEYS.CSV:
                        localStorage.setItem(key, 'Timestamp,Username,Continent,PromptType,Score,PromptSnippet\n');
                        break;
                }
            }
        });
    },

    // History Methods
    loadHistory() {
        try {
            const history = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.HISTORY));
            return Array.isArray(history) ? history : [];
        } catch (error) {
            console.error('Error loading history:', error);
            return [];
        }
    },

    addHistoryEntry(entry) {
        try {
            const history = this.loadHistory();
            
            // Validate required fields
            if (!entry || typeof entry !== 'object') {
                throw new Error('Invalid history entry: must be an object');
            }
            
            // Ensure required fields exist
            const validatedEntry = {
                ...entry,
                timestamp: entry.timestamp || Date.now(),
                score: typeof entry.score === 'number' ? entry.score : 0,
                criteria: entry.criteria || {},
                styles: Array.isArray(entry.styles) ? entry.styles : [],
                type: entry.type || 'Unknown',
                prompt: entry.prompt || ''
            };

            history.push(validatedEntry);
            localStorage.setItem(this.STORAGE_KEYS.HISTORY, JSON.stringify(history));

            // Also update CSV log
            this.appendToCSV(validatedEntry);
        } catch (error) {
            console.error('Error adding history entry:', error);
            throw error;
        }
    },

    appendToCSV(entry) {
        try {
            const csv = localStorage.getItem(this.STORAGE_KEYS.CSV) || 'Timestamp,Username,Continent,PromptType,Score,PromptSnippet\n';
            const timestamp = new Date(entry.timestamp).toISOString();
            const username = entry.username || 'Anonymous';
            const continent = entry.continent || 'Unknown';
            const promptType = entry.type || 'Unknown';
            const score = entry.score || 0;
            const promptSnippet = (entry.prompt || '').substring(0, 100).replace(/,/g, ';'); // Truncate and escape commas

            const newRow = `${timestamp},${username},${continent},${promptType},${score},"${promptSnippet}"\n`;
            localStorage.setItem(this.STORAGE_KEYS.CSV, csv + newRow);
        } catch (error) {
            console.error('Error appending to CSV:', error);
        }
    },

    // User Profile Methods
    loadProfile() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USER_PROFILE)) || {};
        } catch (error) {
            console.error('Error loading profile:', error);
            return {};
        }
    },

    saveProfile(profile) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
        } catch (error) {
            console.error('Error saving profile:', error);
            throw error;
        }
    },

    // Leaderboard Methods
    loadLeaderboardData() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.LEADERBOARD)) || [];
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            return [];
        }
    },

    saveLeaderboardData(data) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.LEADERBOARD, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving leaderboard:', error);
            throw error;
        }
    },

    // Badge Methods
    loadBadges() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.BADGES)) || {};
        } catch (error) {
            console.error('Error loading badges:', error);
            return {};
        }
    },

    saveBadges(badges) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.BADGES, JSON.stringify(badges));
        } catch (error) {
            console.error('Error saving badges:', error);
            throw error;
        }
    },

    // Knowledge Graph Methods
    loadKnowledgeGraph() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.KNOWLEDGE_GRAPH)) || {
                topics: {},
                entities: {},
                styles: {},
                associations: []
            };
        } catch (error) {
            console.error('Error loading knowledge graph:', error);
            return {
                topics: {},
                entities: {},
                styles: {},
                associations: []
            };
        }
    },

    saveKnowledgeGraph(graph) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.KNOWLEDGE_GRAPH, JSON.stringify(graph));
        } catch (error) {
            console.error('Error saving knowledge graph:', error);
            throw error;
        }
    },

    // Reset Methods
    resetAll() {
        try {
            Object.values(this.STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            this.init();
        } catch (error) {
            console.error('Error resetting data:', error);
            throw error;
        }
    },

    initializeUserProgress(username) {
        const progress = new UserProgress(username);
        localStorage.setItem(`progress_${username}`, JSON.stringify(progress));
        return progress;
    },

    getUserProgress(username) {
        const progress = localStorage.getItem(`progress_${username}`);
        return progress ? JSON.parse(progress) : this.initializeUserProgress(username);
    },

    updateUserXP(username, xpGained) {
        const progress = this.getUserProgress(username);
        progress.xp += xpGained;
        
        // Level up check
        const newLevel = Math.floor(progress.xp / UserProgress.XP_PER_LEVEL) + 1;
        if (newLevel > progress.level) {
            progress.level = newLevel;
            this.triggerLevelUpEvent(username, newLevel);
        }

        localStorage.setItem(`progress_${username}`, JSON.stringify(progress));
        return progress;
    },

    updateStreak(username) {
        const progress = this.getUserProgress(username);
        const today = new Date().toISOString().split('T')[0];
        const lastLogin = progress.lastLoginDate;

        if (lastLogin === today) {
            return progress.streak;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastLogin === yesterdayStr) {
            progress.streak += 1;
        } else {
            progress.streak = 1;
        }

        progress.lastLoginDate = today;
        localStorage.setItem(`progress_${username}`, JSON.stringify(progress));
        return progress.streak;
    },

    generateDailyChallenges() {
        const challenges = [
            new Challenge('d1', 'Prompt Master', 'Create 3 high-scoring prompts', 50, 'daily', this.getTodayEndTime()),
            new Challenge('d2', 'Diverse Thinker', 'Try prompts in 2 different categories', 30, 'daily', this.getTodayEndTime()),
            new Challenge('d3', 'Perfect Score', 'Get a 95+ score on any prompt', 100, 'daily', this.getTodayEndTime())
        ];
        return challenges;
    },

    generateWeeklyChallenges() {
        const challenges = [
            new Challenge('w1', 'Consistency King', 'Maintain a 5-day streak', 200, 'weekly', this.getWeekEndTime()),
            new Challenge('w2', 'Category Master', 'Try all prompt categories', 150, 'weekly', this.getWeekEndTime()),
            new Challenge('w3', 'Community Leader', 'Score in top 10 on leaderboard', 300, 'weekly', this.getWeekEndTime())
        ];
        return challenges;
    },

    getTodayEndTime() {
        const date = new Date();
        date.setHours(23, 59, 59, 999);
        return date.toISOString();
    },

    getWeekEndTime() {
        const date = new Date();
        date.setDate(date.getDate() + (7 - date.getDay()));
        date.setHours(23, 59, 59, 999);
        return date.toISOString();
    },

    triggerLevelUpEvent(username, newLevel) {
        const event = new CustomEvent('userLevelUp', {
            detail: { username, level: newLevel }
        });
        window.dispatchEvent(event);
    }
};

// Initialize storage on load
DataManager.init();

class UserProgress {
    constructor(username) {
        this.username = username;
        this.xp = 0;
        this.level = 1;
        this.streak = 0;
        this.lastLoginDate = new Date().toISOString().split('T')[0];
        this.completedChallenges = [];
        this.currentChallenges = [];
    }

    static XP_PER_LEVEL = 100;
}

class Challenge {
    constructor(id, title, description, xpReward, type, endDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.xpReward = xpReward;
        this.type = type; // 'daily' or 'weekly'
        this.endDate = endDate;
    }
}
