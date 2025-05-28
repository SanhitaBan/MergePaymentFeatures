// UI Renderer Module
const UIRenderer = {
    // Section Management
    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('main > section').forEach(section => {
            section.style.display = 'none';
        });
        // Show requested section
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
        }
    },

    // Form Handling
    getFormData() {
        return {
            prompt: document.getElementById('promptText').value,
            type: document.getElementById('promptType').value,
            username: document.getElementById('username').value,
            contact: document.getElementById('userContact').value,
            continent: document.getElementById('userContinent').value
        };
    },

    setFormData(data) {
        if (data.username) document.getElementById('username').value = data.username;
        if (data.contact) document.getElementById('userContact').value = data.contact;
        if (data.continent) document.getElementById('userContinent').value = data.continent;
    },

    // Review Section
    showPromptResult(result) {
        // Show original prompt
        const originalPromptDisplay = document.getElementById('originalPromptDisplay');
        if (originalPromptDisplay) {
            originalPromptDisplay.textContent = result.prompt;
        }

        // Show score
        const scoreDisplay = document.getElementById('scoreDisplay');
        if (scoreDisplay) {
            scoreDisplay.textContent = `Score: ${result.score}/100`;
        }

        // Show breakdown
        const breakdownDisplay = document.getElementById('breakdownDisplay');
        if (breakdownDisplay && result.criteria) {
            const breakdownHTML = Object.entries(result.criteria)
                .map(([criterion, rating]) => `
                    <div class="criterion">
                        <strong>${criterion}:</strong> ${rating}/5
                    </div>
                `).join('');
            breakdownDisplay.innerHTML = breakdownHTML;
        }

        // Show suggestions (make clickable)
        const suggestionsList = document.getElementById('suggestionsList');
        if (suggestionsList && result.suggestions) {
            suggestionsList.innerHTML = '';
            result.suggestions.forEach((suggestion, idx) => {
                const li = document.createElement('li');
                li.textContent = suggestion;
                li.className = 'clickable-suggestion';
                li.style.cursor = 'pointer';
                li.title = 'Click to emphasize this suggestion and auto-review';
                li.onclick = () => {
                    if (typeof window.handleSuggestionClick === 'function') {
                        window.handleSuggestionClick(suggestion, result);
                    }
                };
                suggestionsList.appendChild(li);
            });
        }

        // Show improved prompt
        const improvedPromptDisplay = document.getElementById('improvedPromptDisplay');
        if (improvedPromptDisplay) {
            improvedPromptDisplay.textContent = result.improvedPrompt || result.prompt || '';
        }

        // Show review section
        this.showSection('reviewSection');
    },

    // Leaderboard Section
    updateLeaderboardView(entries, filter = 'global') {
        const tbody = document.querySelector('#leaderboardTable tbody');
        if (!tbody) return;

        const userProfile = DataManager.loadProfile();
        
        // Sort entries by score (descending)
        entries.sort((a, b) => b.score - a.score);

        // Filter by continent if needed
        if (filter === 'regional' && userProfile.continent) {
            entries = entries.filter(entry => entry.continent === userProfile.continent);
        }

        // Get user's rank
        const userRank = entries.findIndex(entry => 
            entry.username === userProfile.username
        ) + 1;

        // Update rank text
        const userRankText = document.getElementById('userRankText');
        if (userRankText) {
            userRankText.textContent = 
                userRank > 0 
                    ? `Your rank: ${userRank} of ${entries.length}`
                    : 'You haven\'t submitted any prompts yet';
        }

        // Generate table rows
        const rowsHTML = entries
            .map((entry, index) => `
                <tr class="${entry.username === userProfile.username ? 'highlight' : ''}">
                    <td>${index + 1}</td>
                    <td>${entry.username}</td>
                    <td>${entry.score}</td>
                    <td>${entry.type}</td>
                    <td>${entry.continent}</td>
                </tr>
            `).join('');

        tbody.innerHTML = rowsHTML;
    },

    // Achievements Section
    updateProfileDisplay(profile) {
        const profileName = document.getElementById('profileName');
        const profileContinent = document.getElementById('profileContinent');
        const profileContact = document.getElementById('profileContact');

        if (profileName) profileName.textContent = profile.username || 'Not set';
        if (profileContinent) profileContinent.textContent = profile.continent || 'Not set';
        if (profileContact) profileContact.textContent = profile.contact || 'Not set';
    },

    updateBadgesDisplay() {
        const container = document.getElementById('badgesContainer');
        if (!container) return;

        const badgeDefinitions = BadgeManager.getBadgeDefinitions();
        const badgeStatuses = BadgeManager.getAllBadgeStatuses();

        const badgesHTML = Object.entries(badgeDefinitions)
            .map(([id, badge]) => {
                const isUnlocked = !!badgeStatuses[id];
                const unlockedAt = typeof badgeStatuses[id] === 'number' ? badgeStatuses[id] : null;
                return `
                    <div class="badge ${isUnlocked ? 'unlocked' : 'locked'}" id="badge_${id}" style="cursor:pointer;" title="Click to see progress">
                        <span class="badgeIcon">${badge.icon}</span>
                        <span class="badgeName">${badge.name}</span>
                        <span class="badgeDesc">${badge.description}</span>
                        ${isUnlocked && unlockedAt ? `<span class="badgeDate">Earned: ${new Date(unlockedAt).toLocaleDateString()}</span>` : ''}
                    </div>
                `;
            }).join('');

        container.innerHTML = badgesHTML;

        // Add click handlers for badge progress
        Object.entries(badgeDefinitions).forEach(([id, badge]) => {
            const badgeDiv = document.getElementById(`badge_${id}`);
            if (badgeDiv) {
                badgeDiv.onclick = () => {
                    const history = DataManager.loadHistory();
                    const progress = BadgeManager.getBadgeProgress(id, history);
                    let progressMsg = '';
                    if (progress && typeof progress.current !== 'undefined' && typeof progress.target !== 'undefined') {
                        progressMsg = `Progress: ${progress.current} / ${progress.target}`;
                    } else if (progress && typeof progress === 'object') {
                        progressMsg = JSON.stringify(progress);
                    } else {
                        progressMsg = 'No progress data available.';
                    }
                    UIRenderer.showNotification(`${badge.name}: ${badge.description}\n${progressMsg}`, 5000);
                };
            }
        });
    },

    // Notification System
    showNotification(message, duration = 3000) {
        const notification = document.getElementById('notification');
        if (!notification) return;

        notification.textContent = message;
        notification.classList.remove('hidden');

        setTimeout(() => {
            notification.classList.add('hidden');
        }, duration);
    },

    // Loading State
    setLoading(isLoading) {
        const submitBtn = document.getElementById('submitBtn');
        if (!submitBtn) return;

        if (isLoading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    },

    // Copy to Clipboard
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Copied to clipboard!');
        }).catch(() => {
            this.showNotification('Failed to copy to clipboard');
        });
    },

    // Download File
    downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    updateUserStats(username) {
        const progress = DataManager.getUserProgress(username);
        const statsContainer = document.getElementById('profileInfoDisplay');
        
        // Create stats display if it doesn't exist
        if (!document.getElementById('userStats')) {
            const statsDiv = document.createElement('div');
            statsDiv.id = 'userStats';
            statsContainer.appendChild(statsDiv);
        }

        const statsDiv = document.getElementById('userStats');
        statsDiv.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Level:</span>
                <span class="stat-value">${progress.level}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">XP:</span>
                <span class="stat-value">${progress.xp}/${UserProgress.XP_PER_LEVEL * progress.level}</span>
                <div class="xp-bar">
                    <div class="xp-progress" style="width: ${(progress.xp % UserProgress.XP_PER_LEVEL) / UserProgress.XP_PER_LEVEL * 100}%"></div>
                </div>
            </div>
            <div class="stat-item">
                <span class="stat-label">Streak:</span>
                <span class="stat-value">🔥 ${progress.streak} days</span>
            </div>
        `;
    },

    renderChallenges() {
        const challengesContainer = document.getElementById('achievementsSection');
        const dailyChallenges = DataManager.generateDailyChallenges();
        const weeklyChallenges = DataManager.generateWeeklyChallenges();

        // Create challenges section if it doesn't exist
        if (!document.getElementById('challengesContainer')) {
            const container = document.createElement('div');
            container.id = 'challengesContainer';
            challengesContainer.insertBefore(container, document.getElementById('backFromAchievements'));
        }

        const container = document.getElementById('challengesContainer');
        container.innerHTML = `
            <div class="challenges-section">
                <h3>Daily Challenges</h3>
                <div class="challenges-list">
                    ${this.renderChallengesList(dailyChallenges)}
                </div>
                <h3>Weekly Challenges</h3>
                <div class="challenges-list">
                    ${this.renderChallengesList(weeklyChallenges)}
                </div>
            </div>
        `;
    },

    renderChallengesList(challenges) {
        return challenges.map(challenge => `
            <div class="challenge-card">
                <h4>${challenge.title}</h4>
                <p>${challenge.description}</p>
                <div class="challenge-reward">
                    <span>Reward: ${challenge.xpReward} XP</span>
                    <span class="challenge-timer" data-end="${challenge.endDate}"></span>
                </div>
            </div>
        `).join('');
    },

    showLevelUpNotification(level) {
        const notification = document.getElementById('notification');
        notification.innerHTML = `
            <div class="level-up-notification">
                <h3>Level Up! 🎉</h3>
                <p>Congratulations! You've reached level ${level}!</p>
            </div>
        `;
        notification.classList.remove('hidden');
        setTimeout(() => notification.classList.add('hidden'), 3000);
    },

    renderScorecard(scores) {
        const scorecardHtml = `
            <p><strong>Clarity:</strong> ${scores.clarity}/5</p>
            <p><strong>Specificity:</strong> ${scores.specificity}/5</p>
            <p><strong>Structure:</strong> ${scores.structure}/5</p>
            <p><strong>Completeness:</strong> ${scores.completeness}/5</p>
            <p><strong>Complexity Management:</strong> ${scores.complexityManagement}/5</p>
            <p><strong>Correctness & Constraints:</strong> ${scores.correctnessConstraints}/5</p>
        `;
        document.getElementById('scorecard').innerHTML = scorecardHtml;
    }
};

// Event Listeners
window.addEventListener('userLevelUp', (event) => {
    const { level } = event.detail;
    UIRenderer.showLevelUpNotification(level);
});

// Update challenges timer
setInterval(() => {
    document.querySelectorAll('.challenge-timer').forEach(timer => {
        const endTime = new Date(timer.dataset.end);
        const now = new Date();
        const diff = endTime - now;
        
        if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            timer.textContent = `${hours}h ${minutes}m remaining`;
        } else {
            timer.textContent = 'Expired';
        }
    });
}, 60000);
