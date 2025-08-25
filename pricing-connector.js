// Pricing Connector - Connects home page pricing cards with Supabase subscription packages

// Load subscription packages from Supabase
async function loadSubscriptionPackages() {
    try {
        console.log('Loading subscription packages for pricing section...');
        
        // Check if Supabase is available
        if (typeof supabase === 'undefined') {
            console.error('Supabase client not available');
            return null;
        }
        
        console.log('Supabase client available, querying packages...');
        
        const { data, error } = await supabase
            .from('subscription_packages')
            .select('*')
            .eq('status', 'active')
            .order('price', { ascending: true });
        
        if (error) {
            console.error('Supabase query error:', error);
            throw error;
        }
        
        console.log('Loaded subscription packages:', data);
        console.log('Package count:', data ? data.length : 0);
        return data;
    } catch (error) {
        console.error('Error loading subscription packages:', error.message);
        return null;
    }
}

// Map subscription packages to pricing cards
function mapPackagesToCards(packages) {
    if (!packages || packages.length === 0) {
        console.warn('No subscription packages found');
        return;
    }
    
    // Sort packages by price
    const sortedPackages = [...packages].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    console.log('Sorted packages by price:', sortedPackages);
    
    // Get the pricing section container
    const pricingCards = document.querySelector('.pricing-cards');
    if (!pricingCards) {
        console.warn('No pricing cards container found on the page');
        return;
    }
    
    // Clear existing pricing cards
    pricingCards.innerHTML = '';
    
    // Create a new card for each package
    sortedPackages.forEach((pkg, index) => {
        // Skip inactive packages
        if (pkg.status !== 'active') {
            console.log(`Skipping inactive package: ${pkg.name}`);
            return;
        }
        
        // Determine card type based on price/position
        let cardType = 'trial';
        if (index === 0 || pkg.price === 0) {
            cardType = 'trial';
        } else if (index === sortedPackages.length - 1) {
            cardType = 'enterprise';
        } else {
            cardType = 'professional';
        }
        
        // Create the card
        const card = createPricingCard(pkg, cardType);
        pricingCards.appendChild(card);
    });
    
    console.log(`Created ${sortedPackages.length} dynamic pricing cards`);
}

// Create a new pricing card
function createPricingCard(pkg, cardType) {
    console.log(`Creating ${cardType} card for package:`, pkg);
    
    // Create the card element
    const card = document.createElement('div');
    card.className = `pricing-card ${cardType}`;
    
    // Determine plan badge text
    let planBadge = 'Lifetime';
    switch (pkg.billing_cycle) {
        case 'monthly':
            planBadge = 'Monthly';
            break;
        case 'yearly':
            planBadge = 'Yearly';
            break;
        case 'one-time':
            planBadge = 'Lifetime';
            break;
        case 'na':
            planBadge = cardType === 'trial' ? '7 Days' : 'Free';
            break;
    }
    
    // Determine plan icon
    let planIcon = '<i class="fas fa-rocket"></i>';
    if (cardType === 'professional') {
        planIcon = '<i class="fas fa-star"></i>';
    } else if (cardType === 'enterprise') {
        planIcon = '<i class="fas fa-building"></i>';
    }
    
    // Determine button text - all buttons now show "Get Now"
    let buttonText = 'Get Now';
    
    // Format price for display
    const priceDisplay = parseFloat(pkg.price).toString();
    
    // Format period for display
    let periodDisplay = '/trial';
    switch (pkg.billing_cycle) {
        case 'monthly':
            periodDisplay = '/month';
            break;
        case 'yearly':
            periodDisplay = '/year';
            break;
        case 'one-time':
            periodDisplay = '/one-time';
            break;
        case 'na':
            periodDisplay = cardType === 'trial' ? '/trial' : '/free';
            break;
    }
    
    // Add popular badge if it's the professional plan
    const popularBadge = cardType === 'professional' ? '<div class="popular-badge">Most Popular</div>' : '';
    
    // Create features HTML
    let featuresHTML = '';
    if (Array.isArray(pkg.features) && pkg.features.length > 0) {
        pkg.features.forEach(feature => {
            featuresHTML += `
                <div class="feature-item">
                    <span class="feature-icon">✓</span>
                    <span class="feature-text">${feature}</span>
                </div>
            `;
        });
    }
    
    // Set the card HTML
    card.innerHTML = `
        ${popularBadge}
        <div class="card-header">
            <div class="plan-icon">${planIcon}</div>
            <h3 class="plan-name">${pkg.name}</h3>
            <div class="plan-badge">${planBadge}</div>
        </div>
        <div class="plan-price">
            <span class="currency">$</span>
            <span class="amount">${priceDisplay}</span>
            <span class="period">${periodDisplay}</span>
        </div>
        <div class="plan-features">
            ${featuresHTML}
        </div>
        <button class="pricing-btn ${cardType}-btn" data-package-id="${pkg.id}">
            <span class="btn-text">${buttonText}</span>
            <span class="btn-arrow">→</span>
        </button>
    `;
    
            // Add click event to handle subscription selection
        const button = card.querySelector('.pricing-btn');
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Button clicked for package: ${pkg.name}`);
                selectSubscription(pkg.id, pkg.name);
            });
        } else {
            console.error(`No button found in card for ${pkg.name}`);
        }
    
    return card;
}

// Handle subscription selection
function selectSubscription(packageId, packageName) {
    console.log(`Selected subscription package: ${packageName} (${packageId})`);
    
    // Map package names to our mock package IDs for checkout
    let checkoutPackageId = packageId;
    
    // If it's a UUID from Supabase, map to our mock IDs
    if (packageName.toLowerCase().includes('free')) {
        checkoutPackageId = 'free';
    } else if (packageName.toLowerCase().includes('pro')) {
        checkoutPackageId = 'pro';
    } else if (packageName.toLowerCase().includes('business')) {
        checkoutPackageId = 'business';
    }
    
    console.log(`Redirecting to checkout with package: ${checkoutPackageId}`);
    console.log(`Checkout URL: checkout.html?package=${checkoutPackageId}`);
    
    // Try to redirect to checkout page
    try {
        window.location.href = `checkout.html?package=${checkoutPackageId}`;
    } catch (error) {
        console.error('Error redirecting to checkout:', error);
        // Fallback: try to navigate using window.open
        window.open(`checkout.html?package=${checkoutPackageId}`, '_self');
    }
}

// Update user subscription
async function updateUserSubscription(packageId, userId, packageName) {
    try {
        // Check if user already has a subscription
        const { data: existingSubscriptions, error: checkError } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active');
        
        if (checkError) throw checkError;
        
        // If user has an existing subscription, update it
        if (existingSubscriptions && existingSubscriptions.length > 0) {
            // Update the existing subscription
            const { error: updateError } = await supabase
                .from('user_subscriptions')
                .update({
                    package_id: packageId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingSubscriptions[0].id);
            
            if (updateError) throw updateError;
            
            // Also update the subscription_tier in the profiles table
            await updateUserProfile(userId, packageName);
            
            alert(`Your subscription has been updated to the ${packageName} plan!`);
        } else {
            // Create a new subscription
            const { error: insertError } = await supabase
                .from('user_subscriptions')
                .insert({
                    user_id: userId,
                    package_id: packageId,
                    status: 'active',
                    start_date: new Date().toISOString(),
                    end_date: null
                });
            
            if (insertError) throw insertError;
            
            // Also update the subscription_tier in the profiles table
            await updateUserProfile(userId, packageName);
            
            alert(`You have successfully subscribed to the ${packageName} plan!`);
        }
        
        // Redirect to profile page
        window.location.href = 'profile.html';
        
    } catch (error) {
        console.error('Error updating subscription:', error);
        alert('There was an error processing your subscription. Please try again.');
    }
}

// Update user profile with subscription tier
async function updateUserProfile(userId, packageName) {
    try {
        // Map package name to subscription tier
        let subscriptionTier = 'free';
        if (packageName.toLowerCase().includes('pro')) {
            subscriptionTier = 'pro';
        } else if (packageName.toLowerCase().includes('business') || 
                   packageName.toLowerCase().includes('enterprise')) {
            subscriptionTier = 'business';
        }
        
        // Update the profile
        const { error } = await supabase
            .from('profiles')
            .update({ subscription_tier: subscriptionTier })
            .eq('id', userId);
        
        if (error) throw error;
        
        console.log(`Updated user profile with subscription tier: ${subscriptionTier}`);
    } catch (error) {
        console.error('Error updating user profile:', error);
    }
}

// Initialize pricing connector
async function initPricingConnector() {
    try {
        console.log('Initializing pricing connector...');
        
        // Load packages from Supabase
        const packages = await loadSubscriptionPackages();
        console.log('Loaded packages:', packages);
        
        if (packages && packages.length > 0) {
            // Map packages to pricing cards
            mapPackagesToCards(packages);
            console.log('Pricing cards created successfully');
        } else {
            console.warn('No packages found or packages array is empty');
        }
    } catch (error) {
        console.error('Error initializing pricing connector:', error);
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking for pricing section...');
    
    // Check if we're on a page with pricing cards
    const pricingSection = document.querySelector('.pricing-section');
    if (pricingSection) {
        console.log('Pricing section found, initializing connector...');
        
        // Wait a bit for Supabase to be ready
        setTimeout(() => {
            console.log('Checking Supabase availability...');
            if (typeof supabase !== 'undefined') {
                console.log('Supabase client available, initializing...');
                initPricingConnector();
            } else {
                console.error('Supabase client not available, waiting...');
                // Try again after a longer delay
                setTimeout(() => {
                    if (typeof supabase !== 'undefined') {
                        console.log('Supabase client now available, initializing...');
                        initPricingConnector();
                    } else {
                        console.error('Supabase client still not available after delay');
                    }
                }, 2000);
            }
        }, 1000);
    } else {
        console.log('No pricing section found on this page');
    }
});

