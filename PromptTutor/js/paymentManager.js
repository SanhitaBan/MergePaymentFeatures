class PaymentManager {
    constructor() {
        this.sdkLoaded = false;
        this.initializePayPalSDK();
        this.setupEventListeners();
        this.premiumFeatures = {
            isSubscribed: false,
            plan: null,
            expiryDate: null
        };
    }

    initializePayPalSDK() {
        // Check if PayPal SDK is loaded
        if (typeof paypal_sdk !== 'undefined') {
            this.sdkLoaded = true;
            this.initializePayPalButtons();
        } else {
            // Wait for SDK to load
            window.addEventListener('paypal-sdk-loaded', () => {
                this.sdkLoaded = true;
                this.initializePayPalButtons();
            });

            // Fallback if SDK fails to load
            setTimeout(() => {
                if (!this.sdkLoaded) {
                    this.handleSDKLoadError();
                }
            }, 10000); // 10 second timeout
        }
    }

    handleSDKLoadError() {
        console.warn('PayPal SDK failed to load. Showing alternative payment options.');
        this.showAlternativePaymentOptions();
    }

    showAlternativePaymentOptions() {
        const basicButton = document.getElementById('paypal-button-basic');
        const proButton = document.getElementById('paypal-button-pro');

        if (basicButton) {
            basicButton.innerHTML = `
                <div class="alternative-payment">
                    <p>PayPal temporarily unavailable</p>
                    <button onclick="window.paymentManager.contactSupport('basic')">Contact Support</button>
                </div>
            `;
        }

        if (proButton) {
            proButton.innerHTML = `
                <div class="alternative-payment">
                    <p>PayPal temporarily unavailable</p>
                    <button onclick="window.paymentManager.contactSupport('pro')">Contact Support</button>
                </div>
            `;
        }
    }

    contactSupport(plan) {
        const subject = encodeURIComponent(`Subscription Request - ${plan} Plan`);
        const body = encodeURIComponent('I would like to subscribe to the ' + plan + ' plan.');
        window.location.href = `mailto:support@promptreviewtool.com?subject=${subject}&body=${body}`;
    }

    async createOrder(plan_type) {
        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    plan_type: plan_type
                }),
            });

            const orderData = await response.json();

            if (orderData.id) {
                return orderData.id;
            }

            const errorDetail = orderData?.details?.[0];
            const errorMessage = errorDetail
                ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                : JSON.stringify(orderData);

            throw new Error(errorMessage);
        } catch (error) {
            console.error(error);
            this.showNotification(`Could not initiate PayPal Checkout: ${error.message}`, 'error');
            throw error;
        }
    }

    async captureOrder(orderId) {
        try {
            const response = await fetch(`/api/orders/${orderId}/capture`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const orderData = await response.json();
            const errorDetail = orderData?.details?.[0];

            if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                throw new Error('Payment method declined. Please try a different payment method.');
            } else if (errorDetail) {
                throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
            } else if (!orderData.purchase_units) {
                throw new Error(JSON.stringify(orderData));
            }

            return orderData;
        } catch (error) {
            console.error(error);
            this.showNotification(`Payment capture failed: ${error.message}`, 'error');
            throw error;
        }
    }

    initializePayPalButtons() {
        try {
            // Basic Plan PayPal Button
            paypal_sdk.Buttons({
                createOrder: () => this.createOrder('basic'),
                onApprove: async (data, actions) => {
                    try {
                        const orderData = await this.captureOrder(data.orderID);
                        const transaction = orderData?.purchase_units?.[0]?.payments?.captures?.[0];
                        if (transaction?.status === 'COMPLETED') {
                            this.handleSuccessfulPayment('basic', orderData);
                        }
                    } catch (error) {
                        // Error is already handled in captureOrder
                        return;
                    }
                },
                onError: (err) => {
                    console.error('PayPal Basic Plan Error:', err);
                    this.showNotification('Payment failed. Please try again later.', 'error');
                }
            }).render('#paypal-button-basic')
              .catch(err => {
                  console.error('Failed to render PayPal button:', err);
                  this.showAlternativePaymentOptions();
              });

            // Pro Plan PayPal Button
            paypal_sdk.Buttons({
                createOrder: () => this.createOrder('pro'),
                onApprove: async (data, actions) => {
                    try {
                        const orderData = await this.captureOrder(data.orderID);
                        const transaction = orderData?.purchase_units?.[0]?.payments?.captures?.[0];
                        if (transaction?.status === 'COMPLETED') {
                            this.handleSuccessfulPayment('pro', orderData);
                        }
                    } catch (error) {
                        // Error is already handled in captureOrder
                        return;
                    }
                },
                onError: (err) => {
                    console.error('PayPal Pro Plan Error:', err);
                    this.showNotification('Payment failed. Please try again later.', 'error');
                }
            }).render('#paypal-button-pro')
              .catch(err => {
                  console.error('Failed to render PayPal button:', err);
                  this.showAlternativePaymentOptions();
              });
        } catch (error) {
            console.error('PayPal initialization error:', error);
            this.showAlternativePaymentOptions();
        }
    }

    handleSuccessfulPayment(plan, orderData) {
        const transaction = orderData?.purchase_units?.[0]?.payments?.captures?.[0];
        
        this.premiumFeatures.isSubscribed = true;
        this.premiumFeatures.plan = plan;
        this.premiumFeatures.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        this.premiumFeatures.transactionId = transaction?.id;

        // Save subscription details to localStorage
        localStorage.setItem('premiumFeatures', JSON.stringify(this.premiumFeatures));

        // Update UI
        this.updateUIForPremiumUser();
        
        // Show success notification
        this.showNotification(`Thank you for subscribing to the ${plan} plan! Transaction ID: ${transaction?.id}`);
        
        // Hide ads if subscribed
        this.toggleAds();
    }

    setupEventListeners() {
        // Go Premium button click handler
        const goPremiumBtn = document.getElementById('goPremiumBtn');
        if (goPremiumBtn) {
            goPremiumBtn.addEventListener('click', () => {
                document.getElementById('premiumSection').style.display = 'block';
                document.getElementById('advertisingSection').style.display = 'none';
            });
        }

        // Premium navigation button click handler
        const navPremium = document.getElementById('navPremium');
        if (navPremium) {
            navPremium.addEventListener('click', () => {
                this.showPremiumSection();
            });
        }

        // Load premium status on page load
        this.loadPremiumStatus();
    }

    showPremiumSection() {
        // Hide all sections
        document.querySelectorAll('main > section').forEach(section => {
            section.style.display = 'none';
        });

        // Show premium section
        document.getElementById('premiumSection').style.display = 'block';
    }

    loadPremiumStatus() {
        const savedFeatures = localStorage.getItem('premiumFeatures');
        if (savedFeatures) {
            this.premiumFeatures = JSON.parse(savedFeatures);
            
            // Check if subscription is expired
            if (new Date(this.premiumFeatures.expiryDate) < new Date()) {
                this.handleExpiredSubscription();
            } else {
                this.updateUIForPremiumUser();
                this.toggleAds();
            }
        }
    }

    handleExpiredSubscription() {
        this.premiumFeatures = {
            isSubscribed: false,
            plan: null,
            expiryDate: null,
            transactionId: null
        };
        localStorage.removeItem('premiumFeatures');
        this.updateUIForFreeUser();
        this.toggleAds();
    }

    updateUIForPremiumUser() {
        const navPremium = document.getElementById('navPremium');
        if (navPremium) {
            navPremium.textContent = `Premium (${this.premiumFeatures.plan})`;
        }
    }

    updateUIForFreeUser() {
        const navPremium = document.getElementById('navPremium');
        if (navPremium) {
            navPremium.textContent = 'Premium Features';
        }
    }

    toggleAds() {
        const adSection = document.getElementById('advertisingSection');
        if (adSection) {
            adSection.style.display = this.premiumFeatures.isSubscribed ? 'none' : 'block';
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = `notification ${type}`; // Add type class for styling
            notification.classList.remove('hidden');
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 3000);
        }
    }
}

// Initialize PaymentManager when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.paymentManager = new PaymentManager();
}); 