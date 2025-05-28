// Leaderboard Manager Module
const LeaderboardManager = {
    // Leaderboard data structure
    leaderboard: {
        entries: [], // Array of { userId, username, continent, scores, badges, stats }
        nextId: 1
    },

    // Continent definitions
    CONTINENTS: {
        NORTH_AMERICA: 'North America',
        SOUTH_AMERICA: 'South America',
        EUROPE: 'Europe',
        AFRICA: 'Africa',
        ASIA: 'Asia',
        OCEANIA: 'Oceania'
    },

    // Initialize the leaderboard
    init() {
        this.leaderboard.entries = [];
        this.leaderboard.nextId = 1;
    },

    // Add or update a user's entry
    updateEntry(userId, username, continent, score, promptType) {
        let entry = this.leaderboard.entries.find(e => e.userId === userId);
        
        if (!entry) {
            // Create new entry
            entry = {
                id: this.leaderboard.nextId++,
                userId,
                username,
                continent,
                scores: {
                    total: 0,
                    count: 0,
                    byType: {},
                    highest: 0
                },
                badges: {
                    total: 0,
                    byCategory: {}
                },
                stats: {
                    promptsSubmitted: 0,
                    averageScore: 0,
                    improvementRate: 0,
                    lastUpdated: new Date().toISOString()
                }
            };
            this.leaderboard.entries.push(entry);
        }

        // Update scores
        entry.scores.total += score;
        entry.scores.count++;
        entry.scores.byType[promptType] = (entry.scores.byType[promptType] || 0) + score;
        entry.scores.highest = Math.max(entry.scores.highest, score);

        // Update stats
        entry.stats.promptsSubmitted++;
        entry.stats.averageScore = entry.scores.total / entry.scores.count;
        entry.stats.lastUpdated = new Date().toISOString();

        // Calculate improvement rate (if we have enough data)
        if (entry.stats.promptsSubmitted > 1) {
            const recentScores = this.getRecentScores(userId, 5);
            if (recentScores.length > 1) {
                const improvements = recentScores.slice(1).map((score, i) => 
                    score - recentScores[i]
                );
                entry.stats.improvementRate = improvements.reduce((a, b) => a + b, 0) / improvements.length;
            }
        }

        return entry;
    },

    // Update badges for a user
    updateBadges(userId, badges) {
        const entry = this.leaderboard.entries.find(e => e.userId === userId);
        if (!entry) return;

        entry.badges.total = badges.length;
        entry.badges.byCategory = badges.reduce((acc, badge) => {
            acc[badge.category] = (acc[badge.category] || 0) + 1;
            return acc;
        }, {});
    },

    // Get recent scores for a user
    getRecentScores(userId, limit = 5) {
        const entry = this.leaderboard.entries.find(e => e.userId === userId);
        if (!entry) return [];

        // In a real implementation, this would come from the user's history
        // For now, we'll simulate with the average score
        return Array(limit).fill(entry.stats.averageScore);
    },

    // Get leaderboard entries with filtering
    getEntries(options = {}) {
        let entries = [...this.leaderboard.entries];

        // Filter by continent
        if (options.continent) {
            entries = entries.filter(entry => entry.continent === options.continent);
        }

        // Filter by prompt type
        if (options.promptType) {
            entries = entries.filter(entry => entry.scores.byType[options.promptType] > 0);
        }

        // Sort by criteria
        const sortCriteria = {
            score: (a, b) => b.scores.highest - a.scores.highest,
            average: (a, b) => b.stats.averageScore - a.stats.averageScore,
            improvement: (a, b) => b.stats.improvementRate - a.stats.improvementRate,
            badges: (a, b) => b.badges.total - a.badges.total
        };

        if (options.sortBy && sortCriteria[options.sortBy]) {
            entries.sort(sortCriteria[options.sortBy]);
        } else {
            entries.sort(sortCriteria.score); // Default sort by highest score
        }

        // Apply limit
        if (options.limit) {
            entries = entries.slice(0, options.limit);
        }

        return entries;
    },

    // Get user's rank
    getUserRank(userId, options = {}) {
        const entries = this.getEntries(options);
        const index = entries.findIndex(entry => entry.userId === userId);
        return index === -1 ? null : index + 1;
    },

    // Get continent statistics
    getContinentStats() {
        const stats = {};
        
        // Initialize stats for each continent
        Object.values(this.CONTINENTS).forEach(continent => {
            stats[continent] = {
                totalUsers: 0,
                averageScore: 0,
                totalPrompts: 0,
                topScorer: null,
                mostImproved: null
            };
        });

        // Calculate stats
        this.leaderboard.entries.forEach(entry => {
            const continentStats = stats[entry.continent];
            continentStats.totalUsers++;
            continentStats.totalPrompts += entry.stats.promptsSubmitted;
            continentStats.averageScore = 
                (continentStats.averageScore * (continentStats.totalUsers - 1) + 
                 entry.stats.averageScore) / continentStats.totalUsers;

            // Update top scorer
            if (!continentStats.topScorer || 
                entry.scores.highest > continentStats.topScorer.scores.highest) {
                continentStats.topScorer = entry;
            }

            // Update most improved
            if (!continentStats.mostImproved || 
                entry.stats.improvementRate > continentStats.mostImproved.stats.improvementRate) {
                continentStats.mostImproved = entry;
            }
        });

        return stats;
    },

    // Get type statistics
    getTypeStats() {
        const stats = {
            total: 0,
            byType: {},
            averageScores: {},
            mostCommon: null
        };

        // Calculate stats
        this.leaderboard.entries.forEach(entry => {
            Object.entries(entry.scores.byType).forEach(([type, score]) => {
                if (!stats.byType[type]) {
                    stats.byType[type] = {
                        count: 0,
                        totalScore: 0,
                        users: new Set()
                    };
                }

                stats.byType[type].count++;
                stats.byType[type].totalScore += score;
                stats.byType[type].users.add(entry.userId);
                stats.total++;
            });
        });

        // Calculate averages and find most common type
        let maxCount = 0;
        Object.entries(stats.byType).forEach(([type, data]) => {
            stats.averageScores[type] = data.totalScore / data.count;
            if (data.count > maxCount) {
                maxCount = data.count;
                stats.mostCommon = type;
            }
        });

        return stats;
    },

    // Export leaderboard data
    exportData() {
        return {
            entries: this.leaderboard.entries,
            nextId: this.leaderboard.nextId
        };
    },

    // Import leaderboard data
    importData(data) {
        this.leaderboard.entries = data.entries;
        this.leaderboard.nextId = data.nextId;
    }
}; 