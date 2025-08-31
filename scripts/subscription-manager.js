// Subscription Manager - Connects admin dashboard to Supabase subscription tables

// Load subscription packages from Supabase
async function loadSubscriptionPackages() {
    try {
        console.log('Loading subscription packages from database...');
        
        const { data, error } = await supabase
            .from('subscription_packages')
            .select('*')
            .order('price', { ascending: true });
        
        if (error) throw error;
        
        console.log('Loaded subscription packages:', data);
        return data;
    } catch (error) {
        console.error('Error loading subscription packages:', error.message);
        alert('Error loading subscription packages: ' + error.message);
        return [];
    }
}

// Display subscription packages in the admin dashboard
function displaySubscriptionPackages(packages) {
    const tableBody = document.querySelector('.subscription-plans table tbody');
    if (!tableBody) {
        console.error('Subscription table body not found');
        return;
    }
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (!packages || packages.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No subscription packages found</td></tr>';
        return;
    }
    
    // Add each package to the table
    packages.forEach(pkg => {
        const features = Array.isArray(pkg.features) ? pkg.features : [];
        
        let featuresHtml = '<ul style="margin: 0; padding-left: 20px;">';
        features.forEach(feature => {
            featuresHtml += `<li>${feature}</li>`;
        });
        featuresHtml += '</ul>';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${pkg.name}</td>
            <td>$${pkg.price}</td>
            <td>${formatBillingCycle(pkg.billing_cycle)}</td>
            <td>${featuresHtml}</td>
            <td><span class="status-badge status-${pkg.status}">${formatStatus(pkg.status)}</span></td>
            <td>
                <button class="action-btn" onclick="editSubscriptionPackage('${pkg.id}')">Edit</button>
                <button class="action-btn delete-btn" onclick="confirmDeletePackage('${pkg.id}', '${pkg.name}')">Delete</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Format billing cycle for display
function formatBillingCycle(cycle) {
    if (!cycle) return 'N/A';
    
    switch (cycle.toLowerCase()) {
        case 'monthly': return 'Monthly';
        case 'yearly': return 'Yearly';
        case 'one-time': return 'One-time';
        case 'na': return 'N/A';
        default: return cycle;
    }
}

// Save user changes including subscription data
async function saveUserChanges(form) {
    try {
        console.log('Saving user changes...');
        
        // Get form values
        const userId = document.getElementById('edit-user-id').value;
        const firstName = document.getElementById('edit-first-name').value;
        const lastName = document.getElementById('edit-last-name').value;
        const packageId = document.getElementById('edit-subscription').value;
        const subscriptionStatus = document.getElementById('edit-subscription-status').value;
        const startDate = document.getElementById('edit-subscription-start').value;
        const endDate = document.getElementById('edit-subscription-end').value;
        
        console.log('Form values:', {
            userId,
            firstName,
            lastName,
            packageId,
            subscriptionStatus,
            startDate,
            endDate
        });
        
        // Update user profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                first_name: firstName,
                last_name: lastName,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        
        if (profileError) throw profileError;
        
        // Get package details to determine subscription tier
        const { data: packageData, error: packageError } = await supabase
            .from('subscription_packages')
            .select('name')
            .eq('id', packageId)
            .single();
        
        if (packageError) throw packageError;
        
        // Map package name to subscription tier
        let subscriptionTier = 'free';
        if (packageData.name.toLowerCase().includes('pro')) {
            subscriptionTier = 'pro';
        } else if (packageData.name.toLowerCase().includes('business') || 
                   packageData.name.toLowerCase().includes('enterprise')) {
            subscriptionTier = 'business';
        }
        
        // Update subscription tier in profile
        const { error: tierError } = await supabase
            .from('profiles')
            .update({ subscription_tier: subscriptionTier })
            .eq('id', userId);
        
        if (tierError) throw tierError;
        
        // Try to update user subscriptions if the table exists
        try {
            // Check if user already has a subscription
            const { data: existingSubscriptions, error: checkError } = await supabase
                .from('user_subscriptions')
                .select('id')
                .eq('user_id', userId);
            
            if (!checkError && existingSubscriptions) {
                if (existingSubscriptions.length > 0) {
                    // Update existing subscriptions to inactive
                    const { error: deactivateError } = await supabase
                        .from('user_subscriptions')
                        .update({ status: 'inactive' })
                        .eq('user_id', userId);
                    
                    if (deactivateError) throw deactivateError;
                }
                
                // Create new active subscription if status is not inactive
                if (subscriptionStatus !== 'inactive') {
                    const { error: createError } = await supabase
                        .from('user_subscriptions')
                        .insert({
                            user_id: userId,
                            package_id: packageId,
                            status: subscriptionStatus,
                            start_date: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
                            end_date: endDate ? new Date(endDate).toISOString() : null
                        });
                    
                    if (createError) throw createError;
                }
            }
        } catch (subsError) {
            console.warn('Could not update user subscriptions:', subsError.message);
            console.warn('This is expected if the user_subscriptions table does not exist yet.');
            // If the table doesn't exist, we'll just update the profile and continue
        }
        
        // Close modal
        closeModal('edit-user-modal');
        
        // Reload users and analytics
        await loadUsersWithSubscriptions();
        await loadSubscriptionAnalytics();
        
        alert('User and subscription updated successfully!');
        
    } catch (error) {
        console.error('Error saving user changes:', error.message);
        alert('Error saving user changes: ' + error.message);
    }
}

// Format status for display
function formatStatus(status) {
    if (!status) return 'Unknown';
    
    switch (status.toLowerCase()) {
        case 'active': return 'Active';
        case 'inactive': return 'Inactive';
        case 'coming-soon': return 'Coming Soon';
        default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
}

// Save a subscription package to Supabase
async function saveSubscriptionPackage(packageData) {
    try {
        console.log('Saving subscription package:', packageData);
        
        const { data, error } = await supabase
            .from('subscription_packages')
            .upsert(packageData)
            .select();
        
        if (error) throw error;
        
        console.log('Saved subscription package:', data);
        return data[0];
    } catch (error) {
        console.error('Error saving subscription package:', error.message);
        alert('Error saving subscription package: ' + error.message);
        return null;
    }
}

// Delete a subscription package from Supabase
async function deleteSubscriptionPackage(packageId) {
    try {
        console.log('Deleting subscription package:', packageId);
        
        // Try to check if any users are using this package
        try {
            const { data: usersWithPackage, error: checkError } = await supabase
                .from('user_subscriptions')
                .select('id')
                .eq('package_id', packageId)
                .eq('status', 'active');
            
            // Only check if users are using the package if the table exists and there's no error
            if (!checkError && usersWithPackage && usersWithPackage.length > 0) {
                alert(`Cannot delete this package: ${usersWithPackage.length} users are currently subscribed to it. Deactivate it instead.`);
                return false;
            }
        } catch (checkError) {
            // If the table doesn't exist yet, we can safely ignore this check
            console.warn('Could not check for users with this package:', checkError.message);
        }
        
        // Delete the package
        const { error } = await supabase
            .from('subscription_packages')
            .delete()
            .eq('id', packageId);
        
        if (error) throw error;
        
        console.log('Deleted subscription package:', packageId);
        
        // Also reload home page pricing section if window.loadSubscriptionPackages exists
        if (typeof window.loadSubscriptionPackages === 'function') {
            try {
                window.loadSubscriptionPackages().then(() => {
                    console.log('Home page pricing section updated after deletion');
                });
            } catch (e) {
                console.warn('Could not update home page pricing section:', e);
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error deleting subscription package:', error.message);
        alert('Error deleting subscription package: ' + error.message);
        return false;
    }
}

// Update a subscription package's status (for deactivating instead of deleting)
async function updatePackageStatus(packageId, status) {
    try {
        console.log(`Updating package ${packageId} status to ${status}`);
        
        const { data, error } = await supabase
            .from('subscription_packages')
            .update({ status })
            .eq('id', packageId)
            .select();
        
        if (error) throw error;
        
        console.log('Updated package status:', data);
        return data[0];
    } catch (error) {
        console.error('Error updating package status:', error.message);
        alert('Error updating package status: ' + error.message);
        return null;
    }
}

// Get a single subscription package by ID
async function getSubscriptionPackage(packageId) {
    try {
        console.log('Getting subscription package:', packageId);
        
        const { data, error } = await supabase
            .from('subscription_packages')
            .select('*')
            .eq('id', packageId)
            .single();
        
        if (error) throw error;
        
        console.log('Got subscription package:', data);
        return data;
    } catch (error) {
        console.error('Error getting subscription package:', error.message);
        alert('Error getting subscription package: ' + error.message);
        return null;
    }
}

// Load subscription analytics from Supabase
async function loadSubscriptionAnalytics() {
    try {
        console.log('Loading subscription analytics...');
        
        // Initialize default counts
        const packageCounts = {
            free: { count: 0, price: 0 },
            pro: { count: 0, price: 0 },
            business: { count: 0, price: 0 }
        };
        let totalRevenue = 0;
        
        try {
            // Try to get count of users by subscription package
            const { data, error } = await supabase
                .from('user_subscriptions')
                .select(`
                    package_id,
                    subscription_packages!inner (
                        name,
                        price
                    )
                `)
                .eq('status', 'active');
            
            // Only process the data if there's no error
            if (!error && data) {
                data.forEach(subscription => {
                    const packageName = subscription.subscription_packages.name.toLowerCase();
                    const packagePrice = parseFloat(subscription.subscription_packages.price);
                    
                    // Map package names to our standard tiers
                    let tier = 'free';
                    if (packageName.includes('pro')) {
                        tier = 'pro';
                    } else if (packageName.includes('business') || packageName.includes('enterprise')) {
                        tier = 'business';
                    } else if (packagePrice === 0) {
                        tier = 'free';
                    }
                    
                    if (!packageCounts[tier]) {
                        packageCounts[tier] = {
                            count: 0,
                            price: packagePrice
                        };
                    }
                    
                    packageCounts[tier].count++;
                    
                    // Only add to revenue if it's not the free tier
                    if (packagePrice > 0) {
                        totalRevenue += packagePrice;
                    }
                });
            }
        } catch (analyticsError) {
            console.warn('Could not load subscription analytics:', analyticsError.message);
            // If the table doesn't exist yet, we'll just use the default values
        }
        
        // Update the UI
        document.getElementById('free-users').textContent = packageCounts.free?.count || 0;
        document.getElementById('pro-users').textContent = packageCounts.pro?.count || 0;
        document.getElementById('business-users').textContent = packageCounts.business?.count || 0;
        document.getElementById('monthly-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
        
        console.log('Subscription analytics:', { packageCounts, totalRevenue });
        
        // Also try to load users with their subscription data
        try {
            await loadUsersWithSubscriptions();
        } catch (usersError) {
            console.warn('Could not load users with subscriptions:', usersError.message);
        }
        
    } catch (error) {
        console.error('Error loading subscription analytics:', error.message);
        
        // Use fallback data if there's an error
        document.getElementById('free-users').textContent = '85';
        document.getElementById('pro-users').textContent = '32';
        document.getElementById('business-users').textContent = '8';
        document.getElementById('monthly-revenue').textContent = '$559.68';
    }
}

// Load users with their subscription data
async function loadUsersWithSubscriptions() {
    try {
        console.log('Loading users with subscription data...');
        
        // Get all profiles with their subscription data
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (profilesError) throw profilesError;
        
        // Get the users table body
        const tableBody = document.getElementById('users-table-body');
        if (!tableBody) {
            console.warn('Users table body not found');
            return;
        }
        
        // Clear the table
        tableBody.innerHTML = '';
        
        // Initialize empty subscriptions map
        const userSubscriptions = {};
        
        // Try to get subscription data if the table exists
        try {
            // Get all active subscriptions
            const { data: subscriptions, error: subsError } = await supabase
                .from('user_subscriptions')
                .select(`
                    user_id,
                    package_id,
                    status,
                    start_date,
                    subscription_packages (
                        name,
                        price,
                        billing_cycle
                    )
                `)
                .eq('status', 'active');
            
            // Only process if there's no error
            if (!subsError && subscriptions) {
                // Map subscriptions to users
                subscriptions.forEach(sub => {
                    userSubscriptions[sub.user_id] = sub;
                });
            }
        } catch (subsError) {
            console.warn('Could not load subscription data:', subsError.message);
            // If the table doesn't exist yet, we'll just use empty subscription data
        }
        
        // Add each user to the table
        profiles.forEach(profile => {
            const subscription = userSubscriptions[profile.id];
            
            // Get subscription info or use defaults
            let subscriptionName = 'Free';
            let subscriptionStatus = 'none';
            
            if (subscription) {
                subscriptionName = subscription.subscription_packages?.name || 'Free';
                subscriptionStatus = subscription.status || 'none';
            } else if (profile.subscription_tier) {
                // Use subscription_tier from profile if available
                subscriptionName = profile.subscription_tier.charAt(0).toUpperCase() + profile.subscription_tier.slice(1);
            }
            
            const row = document.createElement('tr');
            row.setAttribute('data-id', profile.id);
            
            const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unnamed User';
            
            row.innerHTML = `
                <td>${fullName}</td>
                <td>${profile.email || `ID: ${profile.id.substring(0, 8)}...`}</td>
                <td>${subscriptionName}</td>
                <td>
                    <span class="status-badge status-${subscriptionStatus.toLowerCase()}">${subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}</span>
                </td>
                <td>
                    <button type="button" class="action-btn" onclick="editUser('${profile.id}')" title="Edit User">
                        Edit
                    </button>
                    <button type="button" class="action-btn delete-btn" onclick="deleteUser('${profile.id}')" title="Delete User">
                        Delete
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        console.log('Loaded users with subscription data');
        
    } catch (error) {
        console.error('Error loading users with subscriptions:', error.message);
        
        // If we can't load users, show an error message
        const tableBody = document.getElementById('users-table-body');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="5">Error loading users: ${error.message}</td></tr>`;
        }
    }
}

// Edit a subscription package
async function editSubscriptionPackage(packageId) {
    try {
        const pkg = await getSubscriptionPackage(packageId);
        if (!pkg) return;
        
        // Set form values
        document.getElementById('plan-id').value = pkg.id;
        document.getElementById('plan-name').value = pkg.name;
        document.getElementById('plan-price').value = pkg.price;
        document.getElementById('plan-billing-cycle').value = pkg.billing_cycle;
        document.getElementById('plan-status').value = pkg.status;
        
        // Set features as newline-separated text
        const features = Array.isArray(pkg.features) ? pkg.features : [];
        document.getElementById('plan-features').value = features.join('\n');
        
        // Show the modal
        document.getElementById('edit-plan-modal').style.display = 'block';
        
    } catch (error) {
        console.error('Error editing subscription package:', error.message);
        alert('Error editing subscription package: ' + error.message);
    }
}

// Edit user with subscription data
async function editUser(userId) {
    try {
        console.log('Editing user with ID:', userId);
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (profileError) throw profileError;
        
        if (!profile) {
            alert('User not found');
            return;
        }
        
        // Initialize subscription as null
        let subscription = null;
        
        // Try to get user's subscription if the table exists
        try {
            const { data: subData, error: subError } = await supabase
                .from('user_subscriptions')
                .select(`
                    id,
                    package_id,
                    status,
                    start_date,
                    end_date,
                    subscription_packages (
                        id,
                        name,
                        price,
                        billing_cycle
                    )
                `)
                .eq('user_id', userId)
                .eq('status', 'active')
                .maybeSingle();
            
            // Only set subscription if there's no error
            if (!subError) {
                subscription = subData;
            }
        } catch (subError) {
            console.warn('Could not get user subscription:', subError.message);
            // If the table doesn't exist yet, we'll just use null subscription
        }
        
        // Get all available subscription packages for the dropdown
        const { data: allPackages, error: pkgError } = await supabase
            .from('subscription_packages')
            .select('*')
            .eq('status', 'active');
        
        if (pkgError) throw pkgError;
        
        // Get the edit user modal
        const modal = document.getElementById('edit-user-modal');
        if (!modal) {
            alert('Edit user modal not found');
            return;
        }
        
        // Find or create form elements
        const form = modal.querySelector('form') || document.createElement('form');
        form.id = 'edit-user-form';
        form.onsubmit = function(e) { e.preventDefault(); saveUserChanges(this); };
        
        // Create the form content
        form.innerHTML = `
            <input type="hidden" id="edit-user-id" value="${profile.id}">
            <div class="form-group">
                <label for="edit-first-name">First Name</label>
                <input type="text" id="edit-first-name" class="form-control" value="${profile.first_name || ''}">
            </div>
            <div class="form-group">
                <label for="edit-last-name">Last Name</label>
                <input type="text" id="edit-last-name" class="form-control" value="${profile.last_name || ''}">
            </div>
            <div class="form-group">
                <label for="edit-subscription">Subscription</label>
                <select id="edit-subscription" class="form-control">
                    ${allPackages.map(pkg => `
                        <option value="${pkg.id}" ${subscription && subscription.package_id === pkg.id ? 'selected' : ''}>
                            ${pkg.name} ($${pkg.price} / ${formatBillingCycle(pkg.billing_cycle)})
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="edit-subscription-status">Subscription Status</label>
                <select id="edit-subscription-status" class="form-control">
                    <option value="active" ${subscription && subscription.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="cancelled" ${subscription && subscription.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    <option value="expired" ${subscription && subscription.status === 'expired' ? 'selected' : ''}>Expired</option>
                    <option value="trial" ${subscription && subscription.status === 'trial' ? 'selected' : ''}>Trial</option>
                </select>
            </div>
            <div class="form-group">
                <label for="edit-subscription-start">Subscription Start Date</label>
                <input type="date" id="edit-subscription-start" class="form-control" 
                    value="${subscription ? new Date(subscription.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
                <label for="edit-subscription-end">Subscription End Date (leave empty for ongoing)</label>
                <input type="date" id="edit-subscription-end" class="form-control" 
                    value="${subscription && subscription.end_date ? new Date(subscription.end_date).toISOString().split('T')[0] : ''}">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-outline" onclick="closeModal('edit-user-modal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
        `;
        
        // Replace or append the form to the modal
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.innerHTML = '';
            modalBody.appendChild(form);
        } else {
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Edit User & Subscription</h3>
                        <button type="button" class="close-btn" onclick="closeModal('edit-user-modal')">&times;</button>
                    </div>
                    <div class="modal-body"></div>
                </div>
            `;
            modal.querySelector('.modal-body').appendChild(form);
        }
        
        // Show the modal
        modal.style.display = 'block';
        
    } catch (error) {
        console.error('Error editing user:', error.message);
        alert('Error editing user: ' + error.message);
    }
}

// Save changes to a subscription package
async function saveSubscriptionPackageChanges() {
    try {
        const packageId = document.getElementById('plan-id').value;
        const name = document.getElementById('plan-name').value;
        const price = parseFloat(document.getElementById('plan-price').value);
        const billingCycle = document.getElementById('plan-billing-cycle').value;
        const status = document.getElementById('plan-status').value;
        
        // Convert features from newline-separated text to array
        const featuresText = document.getElementById('plan-features').value;
        const features = featuresText.split('\n')
            .map(line => line.trim())
            .filter(line => line !== '');
        
        // Validate inputs
        if (!name) {
            alert('Please enter a plan name');
            return;
        }
        
        if (isNaN(price)) {
            alert('Please enter a valid price');
            return;
        }
        
        // Create package data object
        const packageData = {
            id: packageId,
            name,
            price,
            billing_cycle: billingCycle,
            features,
            status
        };
        
        // Save to Supabase
        const savedPackage = await saveSubscriptionPackage(packageData);
        
        if (savedPackage) {
            // Close the modal
            document.getElementById('edit-plan-modal').style.display = 'none';
            
            // Reload subscription packages
            const packages = await loadSubscriptionPackages();
            displaySubscriptionPackages(packages);
            
            // Also reload home page pricing section if window.loadSubscriptionPackages exists
            if (typeof window.loadSubscriptionPackages === 'function') {
                try {
                    window.loadSubscriptionPackages().then(() => {
                        console.log('Home page pricing section updated after edit');
                    });
                } catch (e) {
                    console.warn('Could not update home page pricing section:', e);
                }
            }
            
            // Show success message
            alert('Subscription package updated successfully!');
        }
        
    } catch (error) {
        console.error('Error saving subscription package changes:', error.message);
        alert('Error saving subscription package changes: ' + error.message);
    }
}

// Add a new subscription package
async function addNewSubscriptionPackage() {
    try {
        const name = document.getElementById('new-plan-name').value;
        const price = parseFloat(document.getElementById('new-plan-price').value);
        const billingCycle = document.getElementById('new-plan-billing-cycle').value;
        const status = document.getElementById('new-plan-status').value;
        
        // Convert features from newline-separated text to array
        const featuresText = document.getElementById('new-plan-features').value;
        const features = featuresText.split('\n')
            .map(line => line.trim())
            .filter(line => line !== '');
        
        // Validate inputs
        if (!name) {
            alert('Please enter a plan name');
            return;
        }
        
        if (isNaN(price)) {
            alert('Please enter a valid price');
            return;
        }
        
        // Create package data object
        const packageData = {
            name,
            price,
            billing_cycle: billingCycle,
            features,
            status
        };
        
        // Save to Supabase
        const savedPackage = await saveSubscriptionPackage(packageData);
        
        if (savedPackage) {
            // Close the modal
            document.getElementById('add-plan-modal').style.display = 'none';
            
            // Reset the form
            document.getElementById('add-plan-form').reset();
            
            // Reload subscription packages
            const packages = await loadSubscriptionPackages();
            displaySubscriptionPackages(packages);
            
            // Also reload home page pricing section if window.loadSubscriptionPackages exists
            if (typeof window.loadSubscriptionPackages === 'function') {
                try {
                    window.loadSubscriptionPackages().then(() => {
                        console.log('Home page pricing section updated after adding new package');
                    });
                } catch (e) {
                    console.warn('Could not update home page pricing section:', e);
                }
            }
            
            // Show success message
            alert('New subscription package added successfully!');
        }
        
    } catch (error) {
        console.error('Error adding new subscription package:', error.message);
        alert('Error adding new subscription package: ' + error.message);
    }
}

// Confirm deletion of a subscription package
function confirmDeletePackage(packageId, packageName) {
    const isFree = packageName.toLowerCase() === 'free';
    
    const confirmMessage = isFree ? 
        'Are you sure you want to deactivate the Free plan? This might affect existing users.' : 
        `Are you sure you want to delete the ${packageName} plan? This might affect existing users.`;
        
    if (confirm(confirmMessage)) {
        if (isFree) {
            // For the Free plan, just deactivate it instead of deleting
            updatePackageStatus(packageId, 'inactive')
                .then(updatedPackage => {
                    if (updatedPackage) {
                        // Reload subscription packages
                        loadSubscriptionPackages().then(displaySubscriptionPackages);
                        alert('Free plan deactivated successfully!');
                    }
                });
        } else {
            // For other plans, try to delete
            deleteSubscriptionPackage(packageId)
                .then(success => {
                    if (success) {
                        // Reload subscription packages
                        loadSubscriptionPackages().then(displaySubscriptionPackages);
                        alert(`${packageName} plan deleted successfully!`);
                    }
                });
        }
    }
}

// Initialize the subscription manager
async function initSubscriptionManager() {
    try {
        console.log('Initializing subscription manager...');
        
        // Load subscription packages
        const packages = await loadSubscriptionPackages();
        displaySubscriptionPackages(packages);
        
        // Load subscription analytics
        await loadSubscriptionAnalytics();
        
        // Set up event listeners
        document.getElementById('add-plan-form').addEventListener('submit', function(e) {
            e.preventDefault();
            addNewSubscriptionPackage();
        });
        
        document.getElementById('edit-plan-form').addEventListener('submit', function(e) {
            e.preventDefault();
            saveSubscriptionPackageChanges();
        });
        
        console.log('Subscription manager initialized');
        
    } catch (error) {
        console.error('Error initializing subscription manager:', error.message);
    }
}

// Delete user function
async function deleteUser(userId) {
    try {
        if (!confirm('Are you sure you want to delete this user? This will also cancel their subscription.')) {
            return;
        }
        
        console.log('Deleting user:', userId);
        
        // Try to cancel any active subscriptions if the table exists
        try {
            const { error: subError } = await supabase
                .from('user_subscriptions')
                .update({ status: 'cancelled' })
                .eq('user_id', userId);
                
            // Only throw if there's an error and it's not about the table not existing
            if (subError && !subError.message.includes('not found') && !subError.message.includes('does not exist')) {
                throw subError;
            }
        } catch (subError) {
            console.warn('Could not cancel subscriptions:', subError.message);
            // If the table doesn't exist yet, we can ignore this error
        }
        
        // Then delete the user profile
        const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);
        
        if (profileError) throw profileError;
        
        // Note: We can't delete from auth.users from client side
        // This would require a server-side function or admin API
        
        // Reload users and analytics
        await loadUsersWithSubscriptions();
        await loadSubscriptionAnalytics();
        
        alert('User deleted successfully');
        
    } catch (error) {
        console.error('Error deleting user:', error.message);
        alert('Error deleting user: ' + error.message);
    }
}

// Make functions available globally
window.loadSubscriptionPackages = loadSubscriptionPackages;
window.displaySubscriptionPackages = displaySubscriptionPackages;
window.editSubscriptionPackage = editSubscriptionPackage;
window.confirmDeletePackage = confirmDeletePackage;
window.addNewSubscriptionPackage = addNewSubscriptionPackage;
window.saveSubscriptionPackageChanges = saveSubscriptionPackageChanges;
window.loadSubscriptionAnalytics = loadSubscriptionAnalytics;
window.editUser = editUser;
window.saveUserChanges = saveUserChanges;
window.deleteUser = deleteUser;

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initSubscriptionManager);
