# Test Case TC1.1: Submit Prompt with 80% Score

## Objective
Verify that the XP gain system correctly awards experience points based on a prompt submission scoring 80%.

## Prerequisites
1. Clean browser state (cleared localStorage)
2. User logged in with test account
3. Application in initial state
4. No existing XP or level progress

## Test Data
- Username: "test_user"
- Prompt Type: "Chatbot"
- Sample Prompt: "Create a customer service chatbot that handles basic product inquiries and returns"

## Test Steps

### 1. Initial Setup
1. Clear browser localStorage
   ```javascript
   localStorage.clear();
   ```
2. Navigate to application homepage
3. Verify XP counter shows 0
4. Verify user level shows 1

### 2. User Login
1. Enter username "test_user" in the username field
2. Select "North America" in the continent dropdown
3. Enter "test@example.com" in the contact field
4. Verify user profile is created in localStorage:
   ```
   Steps to check localStorage:
   a. Open browser Developer Tools:
      - Chrome/Edge: Press F12 or Ctrl+Shift+I (Cmd+Option+I on Mac)
      - Firefox: Press F12 or Ctrl+Shift+I
      - Safari: Enable Developer Menu in Preferences > Advanced, then press Cmd+Option+I
   
   b. Navigate to Application/Storage tab:
      - Chrome/Edge: Click "Application" tab > "Local Storage" in left sidebar
      - Firefox: Click "Storage" tab > "Local Storage"
      - Safari: Click "Storage" tab > "Local Storage"
   
   c. Select your website domain
   
   d. Look for these key-value pairs:
      ```javascript
      // User profile entry
      progress_test_user = {
        "username": "test_user",
        "xp": 0,
        "level": 1,
        "streak": 0,
        "lastLoginDate": "YYYY-MM-DD",
        "completedChallenges": [],
        "currentChallenges": []
      }
      ```
   
   e. Verify the data structure matches expected format
   f. Confirm all initial values are set to default
   ```

### 3. Prompt Submission
1. Select "Chatbot" from the prompt type dropdown
2. Enter the sample prompt in the prompt text area
3. Click the "Review Prompt" button
4. Wait for prompt evaluation to complete

### 4. Score Verification
1. Verify the prompt receives an 80% score
2. Check score breakdown in the review section
3. Confirm score is properly stored in the system

### 5. XP Gain Verification
1. Check XP notification appears
2. Verify XP gain calculation:
   ```
   Score: 80%
   XP Multiplier: 2
   Expected XP Gain: 80 * 2 = 160 XP
   ```
3. Confirm XP counter updates to 160
4. Verify XP progress bar reflects correct percentage
5. Check localStorage for updated XP value:
   ```
   Steps to verify XP in localStorage:
   a. Open Developer Tools (as described above)
   b. Navigate to Application/Storage tab
   c. Find 'progress_test_user' key
   d. Verify the JSON structure:
      ```javascript
      {
        "username": "test_user",
        "xp": 160,              // Should be exactly 160
        "level": 1,             // Should still be 1
        "streak": 1,            // Should be 1 for first login
        "lastLoginDate": "YYYY-MM-DD",
        "completedChallenges": [],
        "currentChallenges": []
      }
      ```
   e. You can also verify via console:
      ```javascript
      const progress = JSON.parse(localStorage.getItem('progress_test_user'));
      console.table(progress); // Shows formatted table of values
      console.assert(progress.xp === 160, 'XP should be 160');
      console.assert(progress.level === 1, 'Level should be 1');
      ```
   ```

### 6. UI Update Verification
1. Check profile section shows updated XP
2. Verify XP bar fills to correct percentage (160/200 = 80% of level 1)
3. Confirm no level up notification (as 160 XP < 200 XP required)

### 7. Data Persistence Check
1. Refresh the page
2. Verify XP value remains at 160
3. Check all UI elements show correct XP value
4. Confirm progress is maintained in localStorage:
   ```
   Verification steps:
   a. Open Developer Tools
   b. In Console tab, run:
      ```javascript
      // Check all relevant localStorage entries
      const checkStorage = () => {
        const progress = JSON.parse(localStorage.getItem('progress_test_user'));
        const checks = {
          'XP Value': progress.xp === 160,
          'Level Value': progress.level === 1,
          'Data Structure': Boolean(progress.username && progress.lastLoginDate),
          'Streak Present': typeof progress.streak === 'number'
        };
        console.table(checks);
        return Object.values(checks).every(v => v === true);
      };
      
      checkStorage(); // Should return true and show all checks passed
      ```
   c. Verify no console errors
   d. Confirm all checks return true
   ```

## Expected Results
1. XP Gain: 160 points
2. XP Counter: Shows "160/200 XP"
3. Progress Bar: Fills to 80%
4. Level: Remains at 1
5. Notifications: XP gain notification shown
6. Data Persistence: All values properly saved

## Actual Results
- XP awarded: 160 points ✅
- UI updates correctly ✅
- Data persists after refresh ✅
- No level up triggered ✅

## Status
✅ PASS

## Notes
- XP calculation formula: Score * 2
- Level threshold: 200 XP
- Test performed on Chrome/Firefox/Safari
- No race conditions observed
- UI updates were immediate
- Data persistence working as expected

## Related Test Cases
- TC1.2: Multiple prompt submissions
- TC1.5: Level up threshold
- TC4.1: XP data persistence
- TC4.5: Real-time UI updates

## Bug Reporting
No bugs found during this test case execution.

## Test Environment Details
- Browser: Chrome 120.0.6099.129
- OS: macOS Sonoma
- Screen Resolution: 1920x1080
- Network: Stable connection
- Local Storage: Enabled
- Console: No errors logged 

## Additional Developer Tools Tips
- Use Console Filters: In the console tab, use the filter icon to only show "Storage" related entries
- Storage Events: Monitor storage changes by adding:
  ```javascript
  window.addEventListener('storage', (e) => {
    console.log('Storage changed:', e.key, e.newValue);
  });
  ```
- Clear Storage: To reset test conditions, use:
  ```javascript
  localStorage.clear(); // Clears all storage
  // OR
  localStorage.removeItem('progress_test_user'); // Clears only user data
  ``` 