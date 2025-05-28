# PayPal Payment Integration Test Cases

## Test Environment
- Application: PromptTutor
- Environment: Sandbox
- Test Date: 2024-03-19

## Test Cases

### TC-P1: Basic Plan Subscription - Happy Path
**Objective**: Verify successful subscription to Basic Plan using PayPal
**Steps**:
1. Navigate to Premium Features section
2. Click on Basic Plan PayPal button
3. Log in with sandbox buyer account
4. Complete payment process
**Expected Results**:
- Payment successful
- Transaction ID displayed
- UI updates to show premium status
- Ads are hidden
- Basic plan features accessible

### TC-P2: Pro Plan Subscription - Happy Path
**Objective**: Verify successful subscription to Pro Plan using PayPal
**Steps**:
1. Navigate to Premium Features section
2. Click on Pro Plan PayPal button
3. Log in with sandbox buyer account
4. Complete payment process
**Expected Results**:
- Payment successful
- Transaction ID displayed
- UI updates to show premium status
- Ads are hidden
- Pro plan features accessible

### TC-P3: Payment Cancellation
**Objective**: Verify proper handling of cancelled payment
**Steps**:
1. Start Basic/Pro plan subscription process
2. Cancel payment in PayPal window
**Expected Results**:
- Return to premium plans page
- No subscription activated
- Error message displayed
- Free plan remains active

### TC-P4: Payment Method Declined
**Objective**: Verify handling of declined payment method
**Steps**:
1. Start subscription process
2. Use declined payment method in sandbox
**Expected Results**:
- Error message displayed
- Option to try different payment method
- No subscription activated

### TC-P5: Network Error During Payment
**Objective**: Verify handling of network issues
**Steps**:
1. Start subscription process
2. Simulate network error
**Expected Results**:
- Appropriate error message
- Option to retry payment
- No subscription activated

### TC-P6: Server Error Response
**Objective**: Verify handling of server errors
**Steps**:
1. Start subscription process
2. Simulate 500 server error
**Expected Results**:
- Error message displayed
- Support contact information shown
- No subscription activated

### TC-P7: Subscription Status Persistence
**Objective**: Verify subscription status persists across sessions
**Steps**:
1. Complete successful subscription
2. Close browser
3. Reopen application
**Expected Results**:
- Premium status maintained
- Features still accessible
- Correct plan type displayed

### TC-P8: Subscription Expiry
**Objective**: Verify proper handling of expired subscriptions
**Steps**:
1. Have active subscription
2. Set date beyond expiry
3. Refresh application
**Expected Results**:
- Premium status removed
- Features restricted
- Prompt to renew subscription

### TC-P9: Multiple Subscription Attempts
**Objective**: Verify handling of multiple subscription attempts
**Steps**:
1. Complete successful subscription
2. Attempt another subscription
**Expected Results**:
- Warning about existing subscription
- Option to upgrade/change plan
- No duplicate charges

### TC-P10: PayPal SDK Loading
**Objective**: Verify PayPal SDK loading and fallback
**Steps**:
1. Load application with slow connection
2. Block PayPal SDK URL
**Expected Results**:
- Loading indicator shown
- Fallback payment options displayed
- Support contact information available 