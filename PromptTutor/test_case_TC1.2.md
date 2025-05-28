# Test Case TC1.2: Multiple Prompt Submissions

## Objective
Verify that the XP system correctly accumulates experience points across multiple prompt submissions and maintains accurate tracking of total XP.

## Prerequisites
1. Clean browser state (cleared localStorage)
2. User logged in with test account
3. Application in initial state
4. No existing XP or level progress

## Test Data
- Username: "test_user"
- Test Prompts:
  1. Chatbot Prompt:
     ```
     Create a customer service chatbot that handles returns and refunds
     ```
  2. Coding Prompt:
     ```
     Write a Python function to calculate Fibonacci sequence
     ```
  3. Research Prompt:
     ```
     Analyze the impact of AI on healthcare in 2024
     ```

## Test Steps

### 1. Initial Setup
1. Clear browser localStorage:
   ```javascript
   localStorage.clear();
   ```
2. Navigate to application homepage
3. Verify initial state:
   ```javascript
   const initial = JSON.parse(localStorage.getItem('progress_test_user'));
   console.assert(!initial, 'Storage should be empty');
   ```

### 2. User Login
1. Enter username "test_user"
2. Select "North America" in continent dropdown
3. Enter "test@example.com" in contact field
4. Verify initial profile creation:
   ```javascript
   const profile = JSON.parse(localStorage.getItem('progress_test_user'));
   console.table(profile);
   // Should show:
   // xp: 0, level: 1, streak: 0
   ```

### 3. First Prompt Submission (Chatbot)
1. Select "Chatbot" from prompt type dropdown
2. Enter first test prompt
3. Submit and wait for evaluation
4. Expected score: 75%
5. Verify XP gain:
   ```javascript
   // Expected: 75 * 2 = 150 XP
   const progress1 = JSON.parse(localStorage.getItem('progress_test_user'));
   console.assert(progress1.xp === 150, 'First submission XP check');
   ```

### 4. Second Prompt Submission (Coding)
1. Click "New Prompt" button
2. Select "Coding" from prompt type dropdown
3. Enter second test prompt
4. Submit and wait for evaluation
5. Expected score: 85%
6. Verify cumulative XP:
   ```javascript
   // Previous: 150 XP
   // New: 85 * 2 = 170 XP
   // Expected total: 320 XP
   const progress2 = JSON.parse(localStorage.getItem('progress_test_user'));
   console.assert(progress2.xp === 320, 'Second submission XP check');
   ```

### 5. Third Prompt Submission (Research)
1. Click "New Prompt" button
2. Select "Research" from prompt type dropdown
3. Enter third test prompt
4. Submit and wait for evaluation
5. Expected score: 90%
6. Verify final XP accumulation:
   ```javascript
   // Previous: 320 XP
   // New: 90 * 2 = 180 XP
   // Expected total: 500 XP
   const progress3 = JSON.parse(localStorage.getItem('progress_test_user'));
   console.assert(progress3.xp === 500, 'Third submission XP check');
   ```

### 6. Level Progression Check
1. Verify level increases:
   ```javascript
   const finalProgress = JSON.parse(localStorage.getItem('progress_test_user'));
   console.assert(finalProgress.level === 3, 'Should be level 3');
   // Level 1: 0-200 XP
   // Level 2: 201-400 XP
   // Level 3: 401-600 XP
   ```
2. Confirm level up notifications appeared
3. Check XP bar shows correct progress in current level

### 7. History Verification
1. Check prompt history:
   ```javascript
   const history = JSON.parse(localStorage.getItem(DataManager.STORAGE_KEYS.HISTORY));
   console.assert(history.length === 3, 'Should have 3 entries');
   ```
2. Verify each prompt's individual score
3. Confirm timestamps are sequential
4. Check all prompt types are recorded

### 8. UI Consistency Check
1. Navigate to achievements section
2. Verify XP total displays correctly
3. Check leaderboard position updated
4. Confirm all UI elements show 500 XP
5. Verify level 3 indicators are present

### 9. Data Persistence Verification
1. Refresh the page
2. Check all values remain:
   ```javascript
   const refreshCheck = () => {
     const data = JSON.parse(localStorage.getItem('progress_test_user'));
     return {
       'Total XP': data.xp === 500,
       'Level': data.level === 3,
       'History Length': JSON.parse(localStorage.getItem(DataManager.STORAGE_KEYS.HISTORY)).length === 3
     };
   };
   console.table(refreshCheck());
   ```

## Expected Results
1. Total XP: 500 points
2. Final Level: 3
3. History: 3 entries
4. XP Breakdown:
   - First prompt: 150 XP
   - Second prompt: 170 XP
   - Third prompt: 180 XP
5. All data persists after refresh

## Actual Results
- Cumulative XP: 500 points ✅
- Level progression: 1 → 2 → 3 ✅
- History tracking: Complete ✅
- UI consistency: Maintained ✅
- Data persistence: Verified ✅

## Status
✅ PASS

## Notes
- XP accumulation formula: Score * 2
- Level thresholds: 200 XP per level
- Multiple level-ups handled correctly
- No XP loss observed between submissions
- UI updates remained consistent

## Related Test Cases
- TC1.1: Single prompt submission
- TC1.5: Level up threshold
- TC1.8: Multiple level ups
- TC4.1: XP data persistence

## Bug Reporting
No bugs found during this test case execution.

## Test Environment Details
- Browser: Chrome 120.0.6099.129
- OS: macOS Sonoma
- Network: Stable connection
- Local Storage: Enabled
- Console: No errors logged

## Monitoring Tips
1. Watch for race conditions between submissions
2. Monitor memory usage during multiple submissions
3. Check network requests for each evaluation
4. Verify no XP double-counting occurs 