# PromptTutor PayPal Integration

This document describes how to set up and run the PayPal integration for the PromptTutor application.

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- PayPal Developer Account
- PayPal API Credentials (Client ID and Secret)

## Setup Instructions

1. Clone the repository and navigate to the project directory:
```bash
cd PromptTutor
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the project root with your PayPal credentials:
```bash
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_secret_here
```

5. Update the PayPal client ID in `index.html`:
Replace `YOUR_CLIENT_ID` in the PayPal SDK script tag with your actual PayPal client ID.

## Running the Application

1. Start the Flask server:
```bash
flask run
```
The server will start on http://localhost:5000

2. Open `index.html` in your browser to test the PayPal integration.

## Available Plans

- Basic Plan ($9.99/month)
  - Ad-free experience
  - Advanced prompt suggestions
  - Priority support

- Pro Plan ($19.99/month)
  - All Basic features
  - Custom prompt templates
  - API access
  - Team collaboration

## Testing

For testing purposes, you can use PayPal's sandbox environment:
1. Log in to your PayPal Developer account
2. Use sandbox test accounts for buyers
3. Test both successful and failed payment scenarios

## Troubleshooting

If you encounter any issues:

1. Check the browser console for client-side errors
2. Check the Flask server logs for server-side errors
3. Verify your PayPal credentials are correct
4. Ensure all required environment variables are set

## Security Notes

- Never commit your PayPal credentials to version control
- Always use environment variables for sensitive data
- Keep your dependencies up to date
- Use HTTPS in production

## Support

For technical support or payment-related issues:
- Email: sanhitaroyc@gmail.com 
