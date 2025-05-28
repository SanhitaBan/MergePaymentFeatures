# PayPal Integration Guide

## Overview
This guide provides step-by-step instructions for integrating PayPal payments into your application. The integration supports both Basic ($9.99/month) and Pro ($19.99/month) subscription plans with a complete payment flow.

## Prerequisites
- PayPal Business Account
- PayPal Developer Account (for sandbox testing)
- Python 3.8 or higher
- Flask web framework
- Node.js 14 or higher (for frontend development)

## Step 1: Set Up PayPal Developer Account
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Create a PayPal Business account if you don't have one
3. Navigate to the "Apps & Credentials" section
4. Create a new app to get your API credentials:
   - Client ID
   - Client Secret

## Step 2: Project Setup
1. Install required Python packages:
```bash
pip install flask==3.0.3 paypal-server-sdk==1.0.0 python-dotenv==1.0.1 flask-cors==4.0.0
```

2. Create a `.env` file in your project root:
```bash
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
```

## Step 3: Backend Implementation (Flask)
1. Create server configuration (server.py):
```python
import os
from flask import Flask, request
from flask_cors import CORS
from paypalserversdk.paypal_serversdk_client import PaypalServersdkClient
from paypalserversdk.http.auth.o_auth_2 import ClientCredentialsAuthCredentials

app = Flask(__name__)
CORS(app)

# PayPal client configuration
paypal_client = PaypalServersdkClient(
    client_credentials_auth_credentials=ClientCredentialsAuthCredentials(
        o_auth_client_id=os.getenv("PAYPAL_CLIENT_ID"),
        o_auth_client_secret=os.getenv("PAYPAL_CLIENT_SECRET"),
    )
)
```

2. Implement order creation endpoint:
```python
@app.route("/api/orders", methods=["POST"])
def create_order():
    try:
        plan_type = request.json.get("plan_type")
        amount = "19.99" if plan_type == "pro" else "9.99"
        
        order_request = OrderRequest(
            intent=CheckoutPaymentIntent.CAPTURE,
            purchase_units=[
                PurchaseUnitRequest(
                    amount=AmountWithBreakdown(
                        currency_code="USD",
                        value=amount
                    )
                )
            ]
        )
        
        response = orders_controller.create_order(order_request)
        return jsonify({"id": response.result.id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

## Step 4: Frontend Implementation
1. Add PayPal SDK to your HTML:
```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD&components=buttons&enable-funding=paylater,venmo" data-namespace="paypal_sdk"></script>
```

2. Create PaymentManager class (paymentManager.js):
```javascript
class PaymentManager {
    constructor() {
        this.initializePayPalSDK();
    }

    initializePayPalSDK() {
        if (typeof paypal_sdk !== 'undefined') {
            this.initializePayPalButtons();
        } else {
            window.addEventListener('paypal-sdk-loaded', () => {
                this.initializePayPalButtons();
            });
        }
    }

    async createOrder(plan_type) {
        const response = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan_type })
        });
        const orderData = await response.json();
        return orderData.id;
    }

    async captureOrder(orderId) {
        const response = await fetch(`/api/orders/${orderId}/capture`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        return await response.json();
    }
}
```

3. Implement PayPal buttons:
```javascript
initializePayPalButtons() {
    // Basic Plan Button
    paypal_sdk.Buttons({
        createOrder: () => this.createOrder('basic'),
        onApprove: async (data) => {
            const orderData = await this.captureOrder(data.orderID);
            if (orderData.status === 'COMPLETED') {
                this.handleSuccessfulPayment('basic', orderData);
            }
        }
    }).render('#paypal-button-basic');

    // Pro Plan Button
    paypal_sdk.Buttons({
        createOrder: () => this.createOrder('pro'),
        onApprove: async (data) => {
            const orderData = await this.captureOrder(data.orderID);
            if (orderData.status === 'COMPLETED') {
                this.handleSuccessfulPayment('pro', orderData);
            }
        }
    }).render('#paypal-button-pro');
}
```

## Step 5: Testing
1. Use PayPal Sandbox credentials for testing:
   - Sandbox Client ID: ATGzIcOUVISmjjL0i3EioKqTQdXRDuxuUXcsOiesCBg6lRYHoBY69-2TVGSrdwVlBSsGCz5t1dKixZE0
   - Test Buyer Account: sb-47bfpq11499161@personal.example.com

2. Test scenarios to cover:
   - Successful payment flow
   - Payment cancellation
   - Payment method declined
   - Network errors
   - Server errors
   - SDK loading issues

## Step 6: Error Handling
1. Implement frontend error handling:
```javascript
handleError(error) {
    console.error('Payment Error:', error);
    this.showNotification('Payment failed. Please try again later.', 'error');
}

showAlternativePaymentOptions() {
    // Display alternative payment methods or support contact
}
```

2. Implement backend error handling:
```python
@app.errorhandler(Exception)
def handle_error(error):
    return jsonify({
        "error": str(error),
        "message": "An error occurred processing the payment"
    }), 500
```

## Step 7: Production Deployment
1. Update environment variables with production credentials
2. Enable proper logging and monitoring
3. Implement proper security measures:
   - SSL/TLS encryption
   - Input validation
   - Rate limiting
   - Error logging

## Security Best Practices
1. Never store PayPal credentials in code
2. Use environment variables for sensitive data
3. Implement proper error handling
4. Validate all inputs
5. Use HTTPS for all communications
6. Implement proper logging
7. Regular security audits

## Troubleshooting
Common issues and solutions:
1. SDK Loading Issues
   - Check internet connectivity
   - Verify Client ID
   - Check browser console for errors

2. Payment Failures
   - Verify API credentials
   - Check payment amount and currency
   - Verify buyer account status

3. Integration Issues
   - Verify webhook configurations
   - Check server logs
   - Validate API responses

## Support Resources
- [PayPal Developer Documentation](https://developer.paypal.com/docs)
- [PayPal Developer Forums](https://developer.paypal.com/forums)
- [PayPal Technical Support](https://developer.paypal.com/support)

## Maintenance
1. Regular testing of payment flows
2. Monitor transaction success rates
3. Keep dependencies updated
4. Regular security audits
5. Monitor PayPal API changes 