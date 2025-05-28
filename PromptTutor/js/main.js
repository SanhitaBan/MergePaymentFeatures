// Global state management
const state = {
    isProcessing: false,
    hasShownCookieWarning: false,
    paypalSDKLoaded: false
};

// Main Application Module
document.addEventListener('DOMContentLoaded', () => {
    // --- OpenAI API Key Management ---
    function getStoredApiKey() {
        return localStorage.getItem('PRT_OpenAI_API_Key');
    }
    function setStoredApiKey(key) {
        localStorage.setItem('PRT_OpenAI_API_Key', key);
    }
    function clearStoredApiKey() {
        localStorage.removeItem('PRT_OpenAI_API_Key');
    }

    function askForApiKey(force = false) {
        let apiKey = getStoredApiKey();
        if (!apiKey || force) {
            apiKey = window.prompt(
                'Enter your OpenAI API key to enable real prompt reviews. Leave blank to use simulation mode.\n\n' +
                'WARNING: Your key is stored in your browser localStorage. Do not use a sensitive or production key.'
            );
            if (apiKey && apiKey.trim().length > 0) {
                setStoredApiKey(apiKey.trim());
                PromptEvaluator.init(apiKey.trim());
                UIRenderer.showNotification('OpenAI API key set. Real reviews enabled.', 3000);
            } else {
                clearStoredApiKey();
                PromptEvaluator.init(); // simulation mode
                UIRenderer.showNotification('Simulation mode enabled. No API key set.', 3000);
            }
        } else {
            PromptEvaluator.init(apiKey);
        }
    }

    // Add a button to nav for re-entering/clearing API key
    const nav = document.querySelector('header nav');
    if (nav && !document.getElementById('setApiKeyBtn')) {
        const btn = document.createElement('button');
        btn.id = 'setApiKeyBtn';
        btn.textContent = 'Set/Clear OpenAI API Key';
        btn.style.marginLeft = '1rem';
        btn.onclick = () => {
            clearStoredApiKey();
            askForApiKey(true);
        };
        nav.appendChild(btn);
    }

    // Ask for API key on first load (but only if not already stored)
    askForApiKey();

    // Initialize modules
    DataManager.init();
    KnowledgeGraph.init();
    BadgeManager.init();
    PromptEvaluator.init();

    // Set up event listeners
    setupEventListeners();

    // Show home section by default
    UIRenderer.showSection('homeSection');

    // --- Load and sync user profile data ---
    const profile = DataManager.loadProfile();
    const storedContact = localStorage.getItem('userContact');
    const storedContinent = localStorage.getItem('userContinent');
    const storedUsername = localStorage.getItem('username');

    // Update profile with any stored values
    if (storedContact) profile.contact = storedContact;
    if (storedContinent) profile.continent = storedContinent;
    if (storedUsername) profile.username = storedUsername;
    
    // Save the synchronized profile
    DataManager.saveProfile(profile);

    // Update UI with profile data
    const contactInput = document.getElementById('userContact');
    const continentSelect = document.getElementById('userContinent');
    const usernameInput = document.getElementById('username');

    if (contactInput && profile.contact) contactInput.value = profile.contact;
    if (continentSelect && profile.continent) continentSelect.value = profile.continent;
    if (usernameInput && profile.username) {
        usernameInput.value = profile.username;
        DataManager.updateStreak(profile.username);
        UIRenderer.updateUserStats(profile.username);
    }

    // Update profile display
    UIRenderer.updateProfileDisplay(profile);

    // Save on input/change
    if (contactInput) {
        contactInput.addEventListener('input', function() {
            localStorage.setItem('userContact', this.value);
            const profile = DataManager.loadProfile();
            profile.contact = this.value;
            DataManager.saveProfile(profile);
            UIRenderer.updateProfileDisplay(profile);
        });
    }
    if (continentSelect) {
        continentSelect.addEventListener('change', function() {
            localStorage.setItem('userContinent', this.value);
            const profile = DataManager.loadProfile();
            profile.continent = this.value;
            DataManager.saveProfile(profile);
            UIRenderer.updateProfileDisplay(profile);
        });
    }
    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            localStorage.setItem('username', this.value);
            const profile = DataManager.loadProfile();
            profile.username = this.value;
            DataManager.saveProfile(profile);
            UIRenderer.updateProfileDisplay(profile);
            if (this.value) {
                DataManager.updateStreak(this.value);
                UIRenderer.updateUserStats(this.value);
            }
        });
    }

    // Initialize user progress when logging in
    document.getElementById('username').addEventListener('change', (e) => {
        const username = e.target.value;
        if (username) {
            DataManager.updateStreak(username);
            UIRenderer.updateUserStats(username);
        }
    });

    // Update XP and check challenges when submitting a prompt
    document.getElementById('promptForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const promptText = document.getElementById('promptText').value;
        const promptType = document.getElementById('promptType').value;

        // Award XP based on prompt score
        const result = await PromptEvaluator.reviewPrompt(promptText, promptType);
        const score = result.score;
        const xpGained = Math.floor(score * 2); // 2 XP per score point
        DataManager.updateUserXP(username, xpGained);
        
        // Update UI
        UIRenderer.updateUserStats(username);
        UIRenderer.renderChallenges();

        // Check for completed challenges
        checkChallengeProgress(username, score, promptType);
    });

    initializeApp();
});

function initializeApp() {
    setupFormHandling();
    setupNavigation();
    setupCookieConsent();
    monitorPayPalSDK();
}

function setupFormHandling() {
    const promptForm = document.getElementById('promptForm');
    if (promptForm) {
        promptForm.addEventListener('submit', handleFormSubmit);
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();

    // Prevent multiple submissions
    if (state.isProcessing) {
        return;
    }

    try {
        state.isProcessing = true;
        showLoadingState();

        const formData = {
            prompt: document.getElementById('promptText').value,
            type: document.getElementById('promptType').value,
            username: document.getElementById('username').value,
            contact: document.getElementById('userContact').value,
            continent: document.getElementById('userContinent').value
        };

        // Validate form data
        if (!validateFormData(formData)) {
            throw new Error('Please fill in all required fields');
        }

        // Review the prompt using the correct method
        const result = await PromptEvaluator.reviewPrompt(formData.prompt, formData.type);
        
        // Display results
        displayResults(result);

        // Update user progress
        updateUserProgress(result.score);

    } catch (error) {
        handleError(error);
    } finally {
        state.isProcessing = false;
        hideLoadingState();
    }
}

function validateFormData(data) {
    return data.prompt && data.type && data.username && data.continent;
}

function displayResults(result) {
    // Show review section
    document.getElementById('homeSection').style.display = 'none';
    document.getElementById('reviewSection').style.display = 'block';

    // Display results
    document.getElementById('originalPromptDisplay').textContent = result.prompt || '';
    document.getElementById('scoreDisplay').textContent = `Score: ${result.score || 0}`;
    
    // Display breakdown (using criteria instead of breakdown)
    const breakdownHtml = result.criteria ? 
        Object.entries(result.criteria)
            .map(([criterion, score]) => `<strong>${criterion}</strong>: ${score}/5`)
            .join('<br>')
        : 'No criteria breakdown available';
    document.getElementById('breakdownDisplay').innerHTML = breakdownHtml;

    // Display suggestions (with null check)
    const suggestionsHtml = (result.suggestions || [])
        .map(suggestion => `<li>${suggestion}</li>`)
        .join('');
    document.getElementById('suggestionsList').innerHTML = suggestionsHtml || '<li>No suggestions available</li>';

    // Display improved prompt
    document.getElementById('improvedPromptDisplay').textContent = result.improvedPrompt || result.prompt || '';
}

function setupNavigation() {
    // Navigation button handlers
    document.getElementById('navHome')?.addEventListener('click', () => showSection('homeSection'));
    document.getElementById('navLeaderboard')?.addEventListener('click', () => showSection('leaderboardSection'));
    document.getElementById('navAchievements')?.addEventListener('click', () => showSection('achievementsSection'));
    
    // Back button handlers
    document.getElementById('backFromLeaderboard')?.addEventListener('click', () => showSection('homeSection'));
    document.getElementById('backFromAchievements')?.addEventListener('click', () => showSection('homeSection'));
    document.getElementById('newPromptBtn')?.addEventListener('click', () => showSection('homeSection'));
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('main > section').forEach(section => {
        section.style.display = 'none';
    });

    // Show requested section
    document.getElementById(sectionId).style.display = 'block';
}

function setupCookieConsent() {
    // Only show cookie consent once
    if (!localStorage.getItem('cookieConsent') && !state.hasShownCookieWarning) {
        state.hasShownCookieWarning = true;
        document.getElementById('cookieConsent').style.display = 'flex';
    }
}

function monitorPayPalSDK() {
    // Prevent multiple PayPal SDK error messages
    if (!state.paypalSDKLoaded) {
        const checkSDK = setInterval(() => {
            if (typeof paypal_sdk !== 'undefined') {
                state.paypalSDKLoaded = true;
                clearInterval(checkSDK);
            }
        }, 1000);

        // Clear interval after 10 seconds to prevent infinite checking
        setTimeout(() => {
            clearInterval(checkSDK);
            if (!state.paypalSDKLoaded) {
                console.warn('PayPal SDK failed to load after 10 seconds');
            }
        }, 10000);
    }
}

function showLoadingState() {
    document.getElementById('submitBtn').disabled = true;
    document.getElementById('submitBtn').classList.add('loading');
}

function hideLoadingState() {
    document.getElementById('submitBtn').disabled = false;
    document.getElementById('submitBtn').classList.remove('loading');
}

function handleError(error) {
    console.error('Error:', error);
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = error.message || 'An error occurred. Please try again.';
        notification.className = 'notification error';
        notification.classList.remove('hidden');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }
}

function updateUserProgress(score) {
    // Update user XP and level based on score
    const xp = Math.round(score * 2);
    const userStats = JSON.parse(localStorage.getItem('userStats') || '{"xp": 0, "level": 1}');
    userStats.xp += xp;
    
    // Check for level up
    const newLevel = Math.floor(userStats.xp / 1000) + 1;
    if (newLevel > userStats.level) {
        userStats.level = newLevel;
        showLevelUpNotification(newLevel);
    }
    
    localStorage.setItem('userStats', JSON.stringify(userStats));
}

// Set up all event listeners
function setupEventListeners() {
    // Navigation
    document.getElementById('navHome').addEventListener('click', () => UIRenderer.showSection('homeSection'));
    document.getElementById('navLeaderboard').addEventListener('click', () => UIRenderer.showSection('leaderboardSection'));
    document.getElementById('navAchievements').addEventListener('click', () => {
        updateAchievements();
        UIRenderer.showSection('achievementsSection');
    });

    // Form submission
    const form = document.getElementById('promptForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handlePromptSubmission();
        });
    }

    // Copy improved prompt button
    const copyBtn = document.getElementById('copyImprovedBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const improvedPrompt = document.getElementById('improvedPromptDisplay').textContent;
            UIRenderer.copyToClipboard(improvedPrompt);
        });
    }

    // Download improved prompt button
    const downloadBtn = document.getElementById('downloadImprovedBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const improvedPrompt = document.getElementById('improvedPromptDisplay').textContent;
            UIRenderer.downloadFile(improvedPrompt, 'improved_prompt.txt');
        });
    }

    // New prompt button
    const newPromptBtn = document.getElementById('newPromptBtn');
    if (newPromptBtn) {
        newPromptBtn.addEventListener('click', () => UIRenderer.showSection('homeSection'));
    }

    // Back buttons
    const backFromLeaderboard = document.getElementById('backFromLeaderboard');
    if (backFromLeaderboard) {
        backFromLeaderboard.addEventListener('click', () => UIRenderer.showSection('reviewSection'));
    }

    const backFromAchievements = document.getElementById('backFromAchievements');
    if (backFromAchievements) {
        backFromAchievements.addEventListener('click', () => UIRenderer.showSection('reviewSection'));
    }

    // Leaderboard filters
    const filterGlobal = document.getElementById('filterGlobal');
    const filterRegional = document.getElementById('filterRegional');
    if (filterGlobal && filterRegional) {
        filterGlobal.addEventListener('click', () => {
            filterGlobal.classList.add('active');
            filterRegional.classList.remove('active');
            updateLeaderboard('global');
        });
        filterRegional.addEventListener('click', () => {
            filterRegional.classList.add('active');
            filterGlobal.classList.remove('active');
            updateLeaderboard('regional');
        });
    }

    // Add for toAchievementsBtn if it exists
    const toAchievementsBtn = document.getElementById('toAchievementsBtn');
    if (toAchievementsBtn) {
        toAchievementsBtn.addEventListener('click', () => {
            updateAchievements();
            UIRenderer.showSection('achievementsSection');
        });
    }
}

// --- Prompt History Logic ---
function savePromptToHistory(promptData) {
    const key = 'PRT_PromptHistory';
    let history = JSON.parse(localStorage.getItem(key)) || [];
    history.push({
        ...promptData,
        timestamp: Date.now()
    });
    localStorage.setItem(key, JSON.stringify(history));
}

function loadPromptHistory() {
    const key = 'PRT_PromptHistory';
    return JSON.parse(localStorage.getItem(key)) || [];
}

function showPromptHistoryModal() {
    let history = loadPromptHistory();
    if (history.length === 0) {
        alert('No previous prompts found.');
        return;
    }
    // Create modal
    let modal = document.createElement('div');
    modal.id = 'promptHistoryModal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.style.zIndex = '2000';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';

    let content = document.createElement('div');
    content.style.background = 'white';
    content.style.padding = '2rem';
    content.style.borderRadius = '8px';
    content.style.maxWidth = '600px';
    content.style.maxHeight = '80vh';
    content.style.overflowY = 'auto';

    let closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.float = 'right';
    closeBtn.onclick = () => document.body.removeChild(modal);
    content.appendChild(closeBtn);

    let title = document.createElement('h3');
    title.textContent = 'Previous Prompts';
    content.appendChild(title);

    let list = document.createElement('ul');
    list.style.listStyle = 'none';
    list.style.padding = '0';
    history.slice().reverse().forEach((item, idx) => {
        let li = document.createElement('li');
        li.style.marginBottom = '1rem';
        let btn = document.createElement('button');
        btn.textContent = `${new Date(item.timestamp).toLocaleString()} | ${item.type} | ${item.prompt.slice(0, 40)}...`;
        btn.style.width = '100%';
        btn.style.textAlign = 'left';
        btn.onclick = () => {
            // Prefill form
            document.getElementById('promptInput').value = item.prompt;
            document.getElementById('promptType').value = item.type;
            if (item.username) document.getElementById('username').value = item.username;
            if (item.contact) document.getElementById('userContact').value = item.contact;
            if (item.continent) document.getElementById('userContinent').value = item.continent;
            document.body.removeChild(modal);
        };
        li.appendChild(btn);
        list.appendChild(li);
    });
    content.appendChild(list);
    modal.appendChild(content);
    document.body.appendChild(modal);
}

// Add button to open prompt history
window.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    const form = document.getElementById('prompt-form');
    if (form && !document.getElementById('showPromptHistoryBtn')) {
        let btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'showPromptHistoryBtn';
        btn.textContent = 'Show Previous Prompts';
        btn.style.marginBottom = '1rem';
        btn.onclick = showPromptHistoryModal;
        form.insertBefore(btn, form.firstChild);
    }
});

// Modify handlePromptSubmission to properly handle XP updates
async function handlePromptSubmission() {
    try {
        console.log('[Prompt Review] Form submitted.');
        // Get form data
        const formData = UIRenderer.getFormData();
        console.log('[Prompt Review] Form data:', formData);
        if (!formData.prompt || !formData.type || !formData.username) {
            UIRenderer.showNotification('Please fill in all required fields', 3000);
            console.log('[Prompt Review] Validation failed: missing fields.');
            return;
        }

        // Show loading state
        UIRenderer.setLoading(true);
        console.log('[Prompt Review] Loading state set. Calling reviewPrompt...');

        // Review the prompt
        let result;
        try {
            result = await PromptEvaluator.reviewPrompt(
                formData.prompt,
                formData.type
            );
            console.log('[Prompt Review] Review result:', result);

            // Calculate and award XP
            const score = result.score || 0;
            const xpGained = Math.floor(score * 2); // 2 XP per score point
            console.log(`[Prompt Review] Awarding ${xpGained} XP for score ${score}`);
            
            // Update XP and check for level up
            const updatedProgress = DataManager.updateUserXP(formData.username, xpGained);
            console.log('[Prompt Review] Updated progress:', updatedProgress);

            // Save to history with all required fields
            const historyEntry = {
                ...result,
                timestamp: Date.now(),
                username: formData.username,
                continent: formData.continent,
                contact: formData.contact,
                promptType: formData.type,
                xpGained: xpGained
            };
            DataManager.addHistoryEntry(historyEntry);

            // Update UI
            UIRenderer.updateUserStats(formData.username);
            UIRenderer.renderChallenges();
            UIRenderer.showPromptResult(result);

            // Check for completed challenges
            checkChallengeProgress(formData.username, score, formData.type);

            // Show XP gain notification
            UIRenderer.showNotification(`Earned ${xpGained} XP!`, 2000);

        } catch (err) {
            console.error('[Prompt Review] Error during reviewPrompt:', err);
            throw err;
        }

        // Show the review section
        UIRenderer.showSection('reviewSection');
        console.log('[Prompt Review] Review section displayed.');

    } catch (error) {
        console.error('Error:', error);
        UIRenderer.showNotification('An error occurred. Please try again.', 3000);
    } finally {
        UIRenderer.setLoading(false);
        console.log('[Prompt Review] Loading state cleared.');
    }
}

// Process review result
async function processReviewResult(result) {
    try {
        // Save to history with all required fields
        console.log('[Prompt Review] Adding review result to history...');
        const historyEntry = {
            ...result,
            timestamp: Date.now(),
            styles: result.styleFeatures || [], // Ensure styles array exists
            criteria: result.criteria || {}, // Ensure criteria object exists
            score: result.score || 0 // Ensure score exists
        };
        DataManager.addHistoryEntry(historyEntry);
        
        // Get updated history for badge checking
        const history = DataManager.loadHistory();
        if (!Array.isArray(history)) {
            console.error('[Prompt Review] History is not an array:', history);
            return;
        }

        // Update knowledge graph
        console.log('[Prompt Review] Updating knowledge graph...');
        KnowledgeGraph.processReviewResult(result);

        // Check for new badges
        console.log('[Prompt Review] Checking for new badges...');
        const newBadges = BadgeManager.checkBadges(history);
        if (newBadges.length > 0) {
            newBadges.forEach(badge => {
                UIRenderer.showNotification(
                    `🏆 New Badge Earned: ${badge.name}!`,
                    5000
                );
                console.log(`[Prompt Review] New badge earned: ${badge.name}`);
            });
        }

        // Update leaderboard
        console.log('[Prompt Review] Updating leaderboard...');
        updateLeaderboard();

        // Update achievements
        console.log('[Prompt Review] Updating achievements...');
        updateAchievements();
    } catch (error) {
        console.error('[Prompt Review] Error processing review result:', error);
        throw error;
    }
}

// Update leaderboard
function updateLeaderboard(filter = 'global') {
    const history = DataManager.loadHistory();
    const leaderboard = DataManager.loadLeaderboardData();
    UIRenderer.updateLeaderboardView(leaderboard, filter);
}

// Update achievements
function updateAchievements() {
    const history = DataManager.loadHistory();
    const userProfile = DataManager.loadProfile();
    // const badges = DataManager.loadBadges(); // No longer needed

    // Update profile display
    UIRenderer.updateProfileDisplay({
        ...userProfile,
        totalPrompts: history.length,
        averageScore: history.reduce((total, entry) => total + entry.score, 0) /
            Math.max(1, history.length)
    });

    // Update badges display (no arguments)
    UIRenderer.updateBadgesDisplay();
}

// Export data
function exportData() {
    const data = {
        userProfile: DataManager.loadProfile(),
        history: DataManager.loadHistory(),
        leaderboard: DataManager.loadLeaderboardData(),
        badges: DataManager.loadBadges(),
        knowledgeGraph: DataManager.loadKnowledgeGraph()
    };

    const content = JSON.stringify(data, null, 2);
    UIRenderer.downloadFile(content, 'prompt-tutor-data.json');
}

// Import data
function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            DataManager.saveProfile(data.userProfile);
            // For history, leaderboard, badges, knowledgeGraph, use DataManager's methods if available
            localStorage.setItem(DataManager.STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
            localStorage.setItem(DataManager.STORAGE_KEYS.LEADERBOARD, JSON.stringify(data.leaderboard));
            localStorage.setItem(DataManager.STORAGE_KEYS.BADGES, JSON.stringify(data.badges));
            localStorage.setItem(DataManager.STORAGE_KEYS.KNOWLEDGE_GRAPH, JSON.stringify(data.knowledgeGraph));

            // Reinitialize modules
            KnowledgeGraph.init();
            updateLeaderboard();
            updateAchievements();

            UIRenderer.showNotification('Data imported successfully!', 3000);
        } catch (error) {
            console.error('Import error:', error);
            UIRenderer.showNotification('Error importing data', 3000);
        }
    };
    reader.readAsText(file);
}

// Reset all data
function resetAllData() {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
        DataManager.resetAll();
        KnowledgeGraph.init();
        updateLeaderboard();
        updateAchievements();
        UIRenderer.showNotification('All data has been reset', 3000);
    }
}

// Add global handler for clickable suggestions
window.handleSuggestionClick = async function(suggestion, lastResult) {
    console.log('Suggestion clicked:', suggestion); // Debug log
    if (typeof UIRenderer !== 'undefined' && UIRenderer.showNotification) {
        UIRenderer.showNotification('Applying suggestion: ' + suggestion, 2000);
    } else {
        alert('Applying suggestion: ' + suggestion);
    }
    // Emphasize the suggestion in the improved prompt
    const improvedPrompt = lastResult.improvedPrompt || lastResult.prompt || '';
    // Append the suggestion as a new instruction (with clear separation)
    const newPrompt = improvedPrompt.trim() + '\n\n[Emphasize]: ' + suggestion;

    // Fill the prompt input with the new prompt
    const promptInput = document.getElementById('promptText');
    if (promptInput) promptInput.value = newPrompt;

    // Keep the same type, username, contact, continent
    if (document.getElementById('promptType')) {
        document.getElementById('promptType').value = lastResult.type;
    }
    if (document.getElementById('username')) {
        document.getElementById('username').value = lastResult.username || '';
    }
    if (document.getElementById('userContact')) {
        document.getElementById('userContact').value = lastResult.contact || '';
    }
    if (document.getElementById('userContinent')) {
        document.getElementById('userContinent').value = lastResult.continent || '';
    }

    // Auto-submit the form for review
    const form = document.getElementById('promptForm');
    if (form) {
        await handlePromptSubmission();
    }
};

// Check challenge progress
function checkChallengeProgress(username, score, promptType) {
    const progress = DataManager.getUserProgress(username);
    const dailyChallenges = DataManager.generateDailyChallenges();
    const weeklyChallenges = DataManager.generateWeeklyChallenges();
    
    // Check daily challenges
    if (score >= 95) {
        completeChallenge(username, 'd3'); // Perfect Score challenge
    }
    
    // Count prompts submitted today
    const today = new Date().toISOString().split('T')[0];
    const promptsToday = progress.completedChallenges.filter(c => 
        c.date === today
    ).length;
    
    if (promptsToday >= 3) {
        completeChallenge(username, 'd1'); // Prompt Master challenge
    }
    
    // Check for diverse thinking
    const uniqueTypes = new Set(progress.completedChallenges
        .filter(c => c.date === today)
        .map(c => c.promptType));
    
    if (uniqueTypes.size >= 2) {
        completeChallenge(username, 'd2'); // Diverse Thinker challenge
    }
    
    // Weekly challenges
    if (progress.streak >= 5) {
        completeChallenge(username, 'w1'); // Consistency King challenge
    }
    
    // Update UI after checking challenges
    UIRenderer.updateUserStats(username);
    UIRenderer.renderChallenges();
}

function completeChallenge(username, challengeId) {
    const progress = DataManager.getUserProgress(username);
    if (!progress.completedChallenges.includes(challengeId)) {
        progress.completedChallenges.push(challengeId);
        
        // Find challenge and award XP
        const allChallenges = [
            ...DataManager.generateDailyChallenges(),
            ...DataManager.generateWeeklyChallenges()
        ];
        const challenge = allChallenges.find(c => c.id === challengeId);
        
        if (challenge) {
            DataManager.updateUserXP(username, challenge.xpReward);
            showChallengeCompleteNotification(challenge);
        }
        
        localStorage.setItem(`progress_${username}`, JSON.stringify(progress));
    }
}

function showChallengeCompleteNotification(challenge) {
    const notification = document.getElementById('notification');
    notification.innerHTML = `
        <div class="level-up-notification">
            <h3>Challenge Complete! 🏆</h3>
            <p>${challenge.title}</p>
            <p>+${challenge.xpReward} XP</p>
        </div>
    `;
    notification.classList.remove('hidden');
    setTimeout(() => notification.classList.add('hidden'), 3000);
}

// Initialize challenges on page load
document.addEventListener('DOMContentLoaded', () => {
    const username = document.getElementById('username').value;
    if (username) {
        UIRenderer.renderChallenges();
        UIRenderer.updateUserStats(username);
    }
});
