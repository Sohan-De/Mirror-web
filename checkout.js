// Checkout Page JavaScript with Stripe Integration

// Stripe configuration
const stripe = Stripe('pk_test_51QH7ScFv00fKIACqGfORYO5j1VPJRwZgxxY2P1662qAIwfbm1vv3nfJi4Ig4UUrCoPDoMuslLPGRUja9NQZl6ecq003TypD8pF');

// Global variables
let elements;
let cardElement;
let currentPackage = null;

// Initialize checkout page
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Checkout page loaded');
    
    // Check if Stripe is available
    if (typeof Stripe === 'undefined') {
        console.error('Stripe library not loaded');
        showError('Payment system not available. Please refresh the page.');
        return;
    }
    
    console.log('Stripe library loaded:', typeof Stripe);
    console.log('Stripe instance:', stripe);
    
    // Get package from URL parameters and show package details
    await loadPackageFromURL();
    
    // Initialize Stripe directly (no auth required)
    initializeStripe();
    setupFormValidation();
    setupPaymentMethodToggle();
    setupCryptoPayments();
    updateButtonText('Pay Now');
    
    // Show checkout form directly
    showCheckoutForm();
    
    console.log('Checkout page initialization complete');
});

// Mock package data for direct checkout (no Supabase required)
const mockPackages = {
    'free': {
        id: 'free',
        name: 'Free',
        price: 0,
        billing_cycle: 'na',
        features: ['Basic screen sharing', 'Up to 3 devices', '720p resolution', 'Standard support']
    },
    'pro': {
        id: 'pro',
        name: 'Pro',
        price: 9.99,
        billing_cycle: 'monthly',
        features: ['Advanced screen sharing', 'Up to 10 devices', '1080p resolution', 'Recording feature', 'Priority support', 'Custom branding']
    },
    'business': {
        id: 'business',
        name: 'Business',
        price: 29.99,
        billing_cycle: 'monthly',
        features: ['Premium screen sharing', 'Unlimited devices', '4K resolution', 'Recording & editing features', 'Priority support', 'Custom branding', 'Analytics dashboard', 'Team management']
    }
};

// Load package details from URL parameters
async function loadPackageFromURL() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const packageId = urlParams.get('package');
        
        console.log('URL package parameter:', packageId);
        
        if (!packageId) {
            console.error('No package ID in URL');
            showError('No package selected. Please go back and select a plan.');
            return;
        }
        
        // Try to find package in mock data first
        let packageData = mockPackages[packageId.toLowerCase()];
        console.log('Looking for package:', packageId.toLowerCase());
        console.log('Available mock packages:', Object.keys(mockPackages));
        
        if (!packageData) {
            // If not found in mock data, try to parse as UUID and use default
            packageData = mockPackages['pro']; // Default to Pro plan
            console.log('Package not found in mock data, using default Pro plan');
        }
        
        currentPackage = packageData;
        console.log('Loaded package:', currentPackage);
        
        // Update the UI with package details
        updatePackageDisplay();
        
    } catch (error) {
        console.error('Error loading package:', error);
        showError('Error loading package details. Please try again.');
    }
}

// Update package display in the UI
function updatePackageDisplay() {
    if (!currentPackage) return;
    
    // Update package name and badge
    const packageName = document.getElementById('package-name');
    const packageBadge = document.getElementById('package-badge');
    
    if (packageName) {
        packageName.textContent = currentPackage.name;
    }
    
    if (packageBadge) {
        packageBadge.textContent = currentPackage.name;
    }
    
    // Update package description
    const packageDescription = document.getElementById('package-description');
    if (packageDescription) {
        packageDescription.textContent = getPackageDescription(currentPackage.name);
    }
    
    // Update price
    const priceAmount = document.getElementById('price-amount');
    if (priceAmount) {
        priceAmount.textContent = `$${currentPackage.price}`;
    }
    
    // Update billing period
    const pricePeriod = document.getElementById('price-period');
    if (pricePeriod) {
        pricePeriod.textContent = getBillingPeriodText(currentPackage.billing_cycle);
    }
    
    // Update features grid
    const featuresGrid = document.getElementById('features-grid');
    if (featuresGrid && Array.isArray(currentPackage.features)) {
        featuresGrid.innerHTML = '';
        currentPackage.features.forEach(feature => {
            const featureItem = document.createElement('div');
            featureItem.className = 'feature-item';
            featureItem.innerHTML = `
                <span class="feature-icon">✓</span>
                <span>${feature}</span>
            `;
            featuresGrid.appendChild(featureItem);
        });
    }
    
    // Update totals
    updateTotals();
}

// Get package description based on name
function getPackageDescription(packageName) {
    const descriptions = {
        'Free': 'Basic screen sharing for casual users',
        'Pro': 'Advanced screen sharing with premium features',
        'Business': 'Enterprise-level screen sharing for teams'
    };
    return descriptions[packageName] || 'Premium screen sharing solution';
}

// Get billing period text
function getBillingPeriodText(billingCycle) {
    const periods = {
        'monthly': '/month',
        'yearly': '/year',
        'one-time': '/one-time',
        'na': '/free'
    };
    return periods[billingCycle] || '/month';
}

// Update totals section
function updateTotals() {
    if (!currentPackage) return;
    
    const price = parseFloat(currentPackage.price);
    const subtotal = price;
    const tax = 0; // No tax for now
    const total = subtotal + tax;
    
    // Update subtotal
    const subtotalElement = document.getElementById('subtotal');
    if (subtotalElement) {
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    }
    
    // Update tax
    const taxElement = document.getElementById('tax');
    if (taxElement) {
        taxElement.textContent = `$${tax.toFixed(2)}`;
    }
    
    // Update total
    const totalElement = document.getElementById('total');
    if (totalElement) {
        totalElement.textContent = `$${total.toFixed(2)}`;
    }
}

// Initialize Stripe
function initializeStripe() {
    try {
        // Check if Stripe is loaded
        if (typeof Stripe === 'undefined') {
            throw new Error('Stripe library not loaded');
        }
        
        // Create card element with proper styling
        elements = stripe.elements({
            mode: 'payment',
            amount: currentPackage ? Math.round(currentPackage.price * 100) : 999,
            currency: 'usd'
        });
        
        cardElement = elements.create('card', {
            style: {
                base: {
                    color: '#ffffff',
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: '16px',
                    lineHeight: '24px',
                    '::placeholder': {
                        color: 'rgba(255, 255, 255, 0.5)'
                    },
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px'
                },
                invalid: {
                    color: '#ff6b6b',
                    borderColor: '#ff6b6b'
                }
            },
            hidePostalCode: true
        });
        
        // Mount the card element
        cardElement.mount('#card-element');
        
        // Handle card validation
        cardElement.on('change', function(event) {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
                displayError.style.display = 'block';
            } else {
                displayError.textContent = '';
                displayError.style.display = 'none';
            }
        });
        
        // Handle card ready event
        cardElement.on('ready', function() {
            console.log('Card element is ready');
        });
        
        console.log('Stripe initialized successfully');
        
    } catch (error) {
        console.error('Error initializing Stripe:', error);
        
        // Show a fallback card input if Stripe fails
        const cardElement = document.getElementById('card-element');
        if (cardElement) {
            cardElement.innerHTML = `
                <div class="fallback-card-input">
                    <div class="card-row">
                        <input type="text" placeholder="Card number" class="fallback-input" maxlength="19">
                        <input type="text" placeholder="MM/YY" class="fallback-input" maxlength="5">
                        <input type="text" placeholder="CVC" class="fallback-input" maxlength="4">
                    </div>
                    <p class="fallback-note">Payment processing will be handled securely</p>
                </div>
            `;
        }
        
        showError('Payment system temporarily unavailable. Please try again later.');
    }
}

// Set up form validation
function setupFormValidation() {
    const form = document.querySelector('.checkout-form');
    const submitButton = document.getElementById('submit-button');
    const termsCheckbox = document.getElementById('terms');
    
    // Enable/disable submit button based on terms checkbox
    if (termsCheckbox && submitButton) {
        termsCheckbox.addEventListener('change', function() {
            submitButton.disabled = !this.checked;
            if (this.checked) {
                updateButtonText('Pay Now');
            } else {
                updateButtonText('Accept Terms to Continue');
            }
        });
    }
    
    // Handle form submission
    if (submitButton) {
        submitButton.addEventListener('click', handlePayment);
    }
}

// Handle payment submission
async function handlePayment() {
    if (!currentPackage) {
        showError('Missing package information. Please refresh the page.');
        return;
    }
    
    try {
        // Show loading state
        showLoading(true);
        updateButtonText('Processing...');
        
        // Validate form
        if (!validateForm()) {
            showLoading(false);
            updateButtonText('Pay Now');
            return;
        }
        
        // Check payment method
        const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked');
        if (!selectedPaymentMethod) {
            showError('Please select a payment method.');
            showLoading(false);
            updateButtonText('Pay Now');
            return;
        }
        
        if (selectedPaymentMethod.value === 'crypto') {
            // Process crypto payment
            await processCryptoPayment();
        } else {
            // Process Stripe payment
            await processStripePayment();
        }
        
    } catch (error) {
        console.error('Payment error:', error);
        showError(error.message || 'Payment failed. Please try again.');
    } finally {
        showLoading(false);
        updateButtonText('Pay Now');
    }
}

// Process Stripe payment
async function processStripePayment() {
    try {
        console.log('Processing Stripe payment for package:', currentPackage.name);
        
        // For demo purposes, simulate a successful payment
        // In a real app, you would create a payment intent and confirm it
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock successful payment
        const mockPaymentIntent = {
            id: 'pi_mock_' + Math.random().toString(36).substr(2, 9),
            status: 'succeeded'
        };
        
        // Update user subscription
        await updateUserSubscription(mockPaymentIntent);
        showSuccess();
        
    } catch (error) {
        console.error('Stripe payment error:', error);
        throw new Error('Card payment failed. Please try again.');
    }
}



// Mock subscription update (no Supabase required)
async function updateUserSubscription(paymentIntent) {
    try {
        console.log('Updating user subscription...');
        
        // In a real app, this would update the database
        // For now, we'll just log the success
        console.log(`User subscribed to ${currentPackage.name} plan`);
        console.log('Payment Intent ID:', paymentIntent.id);
        
        // Simulate a small delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('User subscription updated successfully');
        
    } catch (error) {
        console.error('Error updating user subscription:', error);
        throw new Error('Payment successful but failed to update subscription. Please contact support.');
    }
}

// Validate form
function validateForm() {
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const terms = document.getElementById('terms').checked;
    
    if (!email || !name || !terms) {
        showError('Please fill in all required fields and accept the terms.');
        return false;
    }
    
    if (!email.includes('@')) {
        showError('Please enter a valid email address.');
        return false;
    }
    
    return true;
}

// Show loading state
function showLoading(show = true) {
    const overlay = document.getElementById('loading-overlay');
    const submitButton = document.getElementById('submit-button');
    
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
    
    if (submitButton) {
        const spinner = submitButton.querySelector('.spinner');
        if (spinner) {
            spinner.style.display = show ? 'block' : 'none';
        }
    }
}

// Hide loading state
function hideLoading() {
    showLoading(false);
}

// Update button text
function updateButtonText(text) {
    const submitButton = document.getElementById('submit-button');
    if (submitButton) {
        const btnText = submitButton.querySelector('.btn-text');
        if (btnText) {
            btnText.textContent = text;
        }
    }
}

// Setup payment method toggle
function setupPaymentMethodToggle() {
    const paymentMethodInputs = document.querySelectorAll('input[name="payment-method"]');
    const stripeContainer = document.getElementById('stripe-container');
    const cryptoContainer = document.getElementById('crypto-container');
    
    paymentMethodInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.value === 'stripe') {
                stripeContainer.style.display = 'block';
                cryptoContainer.style.display = 'none';
                updateButtonText('Pay with Card');
            } else if (this.value === 'crypto') {
                stripeContainer.style.display = 'none';
                cryptoContainer.style.display = 'block';
                updateButtonText('Pay with Crypto');
                updateCryptoAmounts();
            }
        });
    });
}

// Setup crypto payments
function setupCryptoPayments() {
    // Crypto option selection
    const cryptoOptions = document.querySelectorAll('.crypto-option');
    cryptoOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            cryptoOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            this.classList.add('selected');
            
            const selectedCrypto = this.dataset.crypto;
            console.log('Selected crypto:', selectedCrypto);
            
            // Update payment button text
            updateButtonText(`Pay with ${selectedCrypto.toUpperCase()}`);
        });
    });
    
    // Check wallet availability and update UI
    checkWalletAvailability();
    
    // Wallet connection buttons
    const walletButtons = document.querySelectorAll('.wallet-btn');
    walletButtons.forEach(button => {
        button.addEventListener('click', function() {
            const walletType = this.dataset.wallet;
            connectWallet(walletType);
        });
    });
}

// Update crypto amounts based on current price
async function updateCryptoAmounts() {
    if (!currentPackage || !currentPackage.price) return;
    
    const totalUSD = currentPackage.price;
    
    try {
        // Fetch real-time crypto prices from CoinGecko API
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,usd-coin,tether&vs_currencies=usd');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const prices = await response.json();
        console.log('Real-time crypto prices fetched:', prices);
        
        // Calculate amounts with real prices
        const btcAmount = (totalUSD / (prices.bitcoin?.usd || 45000)).toFixed(6);
        const ethAmount = (totalUSD / (prices.ethereum?.usd || 3000)).toFixed(6);
        const usdcAmount = totalUSD.toFixed(2);
        const usdtAmount = totalUSD.toFixed(2);
        
        // Update display with real amounts
        document.getElementById('btc-amount').textContent = `${btcAmount} BTC`;
        document.getElementById('eth-amount').textContent = `${ethAmount} ETH`;
        document.getElementById('usdc-amount').textContent = `${usdcAmount} USDC`;
        document.getElementById('usdt-amount').textContent = `${usdtAmount} USDT`;
        
        // Add price info as tooltips
        document.getElementById('btc-amount').title = `~$${prices.bitcoin?.usd || 45000} per BTC`;
        document.getElementById('eth-amount').title = `~$${prices.ethereum?.usd || 3000} per ETH`;
        document.getElementById('usdc-amount').title = `~$${prices['usd-coin']?.usd || 1} per USDC`;
        document.getElementById('usdt-amount').title = `~$${prices.tether?.usd || 1} per USDT`;
        
        // Update timestamp
        const timestamp = document.getElementById('price-timestamp');
        if (timestamp) {
            const now = new Date();
            timestamp.textContent = `Prices updated: ${now.toLocaleTimeString()}`;
        }
        
    } catch (error) {
        console.error('Error fetching crypto prices:', error);
        
        // Show error state
        document.getElementById('btc-amount').textContent = 'Price unavailable';
        document.getElementById('eth-amount').textContent = 'Price unavailable';
        document.getElementById('usdc-amount').textContent = 'Price unavailable';
        document.getElementById('usdt-amount').textContent = 'Price unavailable';
        
        // Show error message
        const walletStatus = document.getElementById('wallet-status');
        if (walletStatus) {
            walletStatus.innerHTML = '<span class="status-text error">Unable to fetch crypto prices. Please try again.</span>';
        }
    }
}

// Connect wallet
async function connectWallet(walletType) {
    const walletStatus = document.getElementById('wallet-status');
    const walletBtn = document.querySelector(`[data-wallet="${walletType}"]`);
    
    try {
        walletStatus.innerHTML = '<span class="status-text">Connecting to ' + walletType + '...</span>';
        
        let connectedAccount = null;
        
        if (walletType === 'metamask') {
            // Connect to MetaMask
            if (typeof window.ethereum !== 'undefined') {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    connectedAccount = accounts[0];
                    console.log('MetaMask connected:', connectedAccount);
                } catch (error) {
                    if (error.code === 4001) {
                        throw new Error('User rejected connection');
                    } else {
                        throw new Error('MetaMask connection failed');
                    }
                }
            } else {
                throw new Error('MetaMask not installed. Please install MetaMask extension from metamask.io');
            }
        } else if (walletType === 'walletconnect') {
            // WalletConnect integration would go here
            throw new Error('WalletConnect integration coming soon. Please use MetaMask for now.');
        } else if (walletType === 'coinbase') {
            // Coinbase Wallet integration would go here
            throw new Error('Coinbase Wallet integration coming soon. Please use MetaMask for now.');
        } else {
            throw new Error('Unsupported wallet type');
        }
        
        if (connectedAccount) {
            // Update status
            walletStatus.innerHTML = `<span class="status-text connected">Connected: ${connectedAccount.substring(0, 6)}...${connectedAccount.substring(38)}</span>`;
            walletBtn.classList.add('connected');
            walletBtn.textContent = 'Connected';
            
            // Enable payment button
            const submitButton = document.getElementById('submit-button');
            if (submitButton) {
                submitButton.disabled = false;
            }
            
            console.log('Wallet connected successfully:', walletType, connectedAccount);
        }
        
    } catch (error) {
        console.error('Wallet connection failed:', error);
        walletStatus.innerHTML = `<span class="status-text error">Connection failed: ${error.message}</span>`;
    }
}

// Process crypto payment
async function processCryptoPayment() {
    const selectedCrypto = document.querySelector('.crypto-option.selected');
    if (!selectedCrypto) {
        showError('Please select a cryptocurrency to pay with.');
        return;
    }
    
    const cryptoType = selectedCrypto.dataset.crypto;
    const walletStatus = document.getElementById('wallet-status');
    
    if (!walletStatus.querySelector('.status-text.connected')) {
        showError('Please connect your wallet first.');
        return;
    }
    
    try {
        console.log('Processing crypto payment with:', cryptoType);
        
        // Get current crypto prices for accurate payment
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,usd-coin,tether&vs_currencies=usd');
        const prices = await response.json();
        
        let paymentAmount;
        let paymentCurrency;
        
        // Calculate exact payment amount based on selected crypto
        switch(cryptoType) {
            case 'btc':
                paymentAmount = currentPackage.price / (prices.bitcoin?.usd || 45000);
                paymentCurrency = 'BTC';
                break;
            case 'eth':
                paymentAmount = currentPackage.price / (prices.ethereum?.usd || 3000);
                paymentCurrency = 'ETH';
                break;
            case 'usdc':
                paymentAmount = currentPackage.price;
                paymentCurrency = 'USDC';
                break;
            case 'usdt':
                paymentAmount = currentPackage.price;
                paymentCurrency = 'USDT';
                break;
            default:
                throw new Error('Unsupported cryptocurrency');
        }
        
        // Show payment details
        const confirmPayment = confirm(
            `Confirm Payment:\n` +
            `Amount: ${paymentAmount.toFixed(6)} ${paymentCurrency}\n` +
            `Package: ${currentPackage.name}\n` +
            `Price: $${currentPackage.price} USD\n\n` +
            `Click OK to proceed with payment.`
        );
        
        if (!confirmPayment) {
            console.log('Payment cancelled by user');
            return;
        }
        
        // In a real implementation, you would:
        // 1. Create a payment request to your backend
        // 2. Generate a payment address/QR code
        // 3. Monitor the blockchain for payment confirmation
        // 4. Verify payment amount and confirm subscription
        
        // For now, simulate the payment process
        showLoading(true);
        updateButtonText('Processing Payment...');
        
        // Simulate blockchain transaction time
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Mock successful payment (replace with real blockchain verification)
        const paymentResult = {
            id: 'crypto_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            status: 'succeeded',
            payment_method: cryptoType,
            amount: paymentAmount,
            currency: paymentCurrency,
            transaction_hash: '0x' + Math.random().toString(36).substr(2, 64),
            block_number: Math.floor(Math.random() * 1000000) + 18000000
        };
        
        console.log('Crypto payment processed:', paymentResult);
        
        // Update user subscription
        await updateUserSubscription(paymentResult);
        showSuccess();
        
    } catch (error) {
        console.error('Crypto payment failed:', error);
        showError(`Payment failed: ${error.message}`);
    } finally {
        showLoading(false);
        updateButtonText('Pay with Crypto');
    }
}

// Check which wallets are available
function checkWalletAvailability() {
    const walletButtons = document.querySelectorAll('.wallet-btn');
    
    walletButtons.forEach(button => {
        const walletType = button.dataset.wallet;
        
        if (walletType === 'metamask') {
            if (typeof window.ethereum !== 'undefined') {
                button.classList.add('available');
                button.title = 'MetaMask is available';
            } else {
                button.classList.add('unavailable');
                button.title = 'MetaMask not installed';
                button.disabled = true;
            }
        } else if (walletType === 'walletconnect') {
            button.classList.add('coming-soon');
            button.title = 'WalletConnect coming soon';
            button.disabled = true;
        } else if (walletType === 'coinbase') {
            button.classList.add('coming-soon');
            button.title = 'Coinbase Wallet coming soon';
            button.disabled = true;
        }
    });
}

// Refresh crypto prices manually
function refreshCryptoPrices() {
    const refreshBtn = document.querySelector('.refresh-prices-btn');
    if (refreshBtn) {
        refreshBtn.textContent = '🔄 Updating...';
        refreshBtn.disabled = true;
    }
    
    updateCryptoAmounts().finally(() => {
        if (refreshBtn) {
            refreshBtn.textContent = '🔄 Refresh Prices';
            refreshBtn.disabled = false;
        }
    });
}

// Show success modal
function showSuccess() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Show error
function showError(message) {
    const errorModal = document.getElementById('error-modal');
    const errorMessage = document.getElementById('error-message');
    
    if (errorModal && errorMessage) {
        errorMessage.textContent = message;
        errorModal.style.display = 'flex';
    }
}

// Modal functions
function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeErrorModal() {
    const modal = document.getElementById('error-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function goToHome() {
    // Redirect to home page
    window.location.href = 'index.html';
}

// Show checkout form
function showCheckoutForm() {
    const checkoutForm = document.querySelector('.checkout-form');
    if (checkoutForm) {
        checkoutForm.style.display = 'block';
    }
}
