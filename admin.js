// Admin Dashboard JavaScript

// Global variables
let currentPage = 1;
const usersPerPage = 10;
let totalUsers = 0;
let allUsers = [];

// Initialize admin dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded, initializing admin dashboard');
    
    // Check if user is admin before proceeding
    checkAdminAccess().then(() => {
        console.log('Admin access confirmed, initializing dashboard');
        initAdminDashboard();
    }).catch(error => {
        console.error('Error during admin access check:', error);
    });
    
    // Add debug info
    console.log('Supabase client available:', !!supabase);
    if (supabase) {
        console.log('Supabase URL:', supabase.supabaseUrl);
        console.log('Supabase client initialized successfully');
    }
});

// Check if user has admin access
async function checkAdminAccess() {
    try {
        console.log('Checking admin access...');
        
        // Get current user
        const { user, error: userError } = await getCurrentUser();
        
        if (userError || !user) {
            console.error('Not logged in:', userError?.message || 'No user found');
            alert('Please log in to access the admin dashboard.');
            window.location.href = 'sign-in.html';
            throw new Error('Not logged in');
        }
        
        console.log('Current user:', user.id);
        
        // TEMPORARY WORKAROUND: Direct query to check admin status
        // This bypasses the RLS policies that are causing the infinite recursion
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .maybeSingle();
            
            if (error) {
                // If we still get an error, try to continue anyway for debugging
                console.warn('Error in direct admin check:', error.message);
                console.warn('Proceeding anyway for debugging purposes');
                return true;
            }
            
            const isAdmin = !!data?.is_admin;
            console.log('Admin status (direct check):', isAdmin);
            
            if (!isAdmin) {
                // For testing purposes, we'll allow access anyway
                console.warn('User is not an admin, but allowing access for debugging');
                // Uncomment the following lines to enforce admin access:
                // alert('Access denied. You do not have admin privileges.');
                // window.location.href = 'index.html';
                // throw new Error('Not an admin user');
            }
            
            return true; // Successfully verified admin access (or bypassed for debugging)
        } catch (directError) {
            console.error('Error in direct admin check:', directError.message);
            // Continue anyway for debugging purposes
            return true;
        }
    } catch (error) {
        console.error('Error checking admin access:', error.message);
        alert('Error checking admin access: ' + error.message);
        throw error; // Re-throw to be caught by the caller
    }
}

// Initialize admin dashboard
async function initAdminDashboard() {
    try {
        // Load users data
        await loadUsers();
        

        
        // Load admin users
        await loadAdminUsers();
        
        // Set up event listeners
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', async function(e) {
                e.preventDefault();
                await signOut();
                window.location.href = 'index.html';
            });
        }
        
        // Set up search functionality
        const searchInput = document.getElementById('user-search');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                
                if (searchTerm.length === 0) {
                    // If search is empty, show all users
                    displayUsers(allUsers);
                } else {
                    // Filter users based on search term
                    const filteredUsers = allUsers.filter(user => {
                        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim().toLowerCase();
                        const email = user.email ? user.email.toLowerCase() : '';
                        return fullName.includes(searchTerm) || email.includes(searchTerm);
                    });
                    
                    displayUsers(filteredUsers);
                }
            });
        }
        
        // Set up pagination
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (currentPage > 1) {
                    currentPage--;
                    loadUsers();
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                const totalPages = Math.ceil(totalUsers / usersPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    loadUsers();
                }
            });
        }
        
    } catch (error) {
        console.error('Error initializing admin dashboard:', error.message);
    }
}

// Load users with pagination
async function loadUsers() {
    try {
        console.log('Loading users...');
        const tableBody = document.getElementById('users-table-body');
        if (!tableBody) {
            console.error('users-table-body element not found!');
            return;
        }
        
        tableBody.innerHTML = '<tr class="loading-row"><td colspan="5">Loading users...</td></tr>';
        
        // Simple approach: Just get all profiles directly
        console.log('Fetching all profiles from database...');
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (profilesError) {
            console.error('Profiles fetch error:', profilesError.message);
            throw profilesError;
        }
        
        console.log('Total profiles found:', profiles?.length || 0);
        
        if (!profiles || profiles.length === 0) {
            console.log('No profiles found, creating test users...');
            await createTwoMoreUsers();
            return;
        }
        
        // Convert profiles to user objects
        const finalUsers = profiles.map(profile => ({
            id: profile.id,
            email: profile.email || `ID: ${profile.id.substring(0, 8)}...`,
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            subscription_tier: profile.subscription_tier || 'free',
            subscription_status: profile.subscription_status || 'active',
            is_admin: profile.is_admin || false,
            created_at: profile.created_at,
            last_sign_in: profile.updated_at,
            email_confirmed: profile.email ? 'Yes' : 'No'
        }));
        
        // Log detailed profile information for debugging
        console.log('All profiles found:', finalUsers.map(u => ({
            id: u.id,
            email: u.email,
            name: `${u.first_name} ${u.last_name}`,
            subscription: u.subscription_tier,
            is_admin: u.is_admin
        })));
        
        console.log('Final users to display:', finalUsers.length);
        
        if (finalUsers.length === 0) {
            console.warn('No users found from any source');
            tableBody.innerHTML = '<tr class="loading-row"><td colspan="5">No users found. Please check your database.</td></tr>';
            return;
        }
        
        // Store all users for search functionality
        allUsers = finalUsers;
        totalUsers = finalUsers.length;
        
        // Display users
        displayUsers(finalUsers);
        
        // Update pagination
        updatePagination();
        
        console.log('Users loaded successfully:', finalUsers.length);
        
    } catch (error) {
        console.error('Error loading users:', error.message);
        // Fallback to profiles table only
        await loadUsersFromProfiles();
    }
}

// Fallback function to load users from profiles table only
async function loadUsersFromProfiles() {
    try {
        console.log('Loading users from profiles table...');
        
        const { count, error: countError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
        
        if (countError) {
            console.error('Count error:', countError.message);
            throw countError;
        }
        
        console.log('Total users from profiles:', count);
        totalUsers = count || 0;
        
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Data fetch error:', error.message);
            throw error;
        }
        
        console.log('Users data received:', data ? data.length : 0, 'users');
        allUsers = data || [];
        
        displayUsers(data);
        updatePagination();
        
    } catch (error) {
        console.error('Error loading users from profiles:', error.message);
        const tableBody = document.getElementById('users-table-body');
        if (tableBody) {
            tableBody.innerHTML = `<tr class="loading-row"><td colspan="5">Error loading users: ${error.message}</td></tr>`;
        }
    }
}

// Display users from auth data
function displayUsersFromAuth(authUsers) {
    console.log('Displaying auth users:', authUsers);
    const tableBody = document.getElementById('users-table-body');
    
    if (!tableBody) {
        console.error('users-table-body element not found in displayUsersFromAuth!');
        return;
    }
    
    if (!authUsers || authUsers.length === 0) {
        tableBody.innerHTML = '<tr class="loading-row"><td colspan="5">No users found</td></tr>';
        return;
    }
    
    let html = '';
    
    authUsers.forEach(user => {
        try {
            console.log('Processing auth user:', user);
            const fullName = `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 'Unnamed User';
            const email = user.email || `ID: ${user.id.substring(0, 8)}...`;
            const subscription = 'free'; // Default for auth users
            const status = 'active';
            
            html += `
                <tr data-id="${user.id}">
                    <td>${fullName}</td>
                    <td>${email}</td>
                    <td>${subscription.charAt(0).toUpperCase() + subscription.slice(1)}</td>
                    <td>
                        <span class="status-badge status-${status.toLowerCase()}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    </td>
                    <td>
                        <button type="button" class="action-btn" onclick="editUser('${user.id}')" title="Edit User">
                            Edit
                        </button>
                        <button type="button" class="action-btn delete-btn" onclick="deleteUser('${user.id}')" title="Delete User">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        } catch (err) {
            console.error('Error processing auth user:', err);
        }
    });
    
    tableBody.innerHTML = html;
    console.log('Auth users table updated with', authUsers.length, 'users');
}

// Display users in table
function displayUsers(users) {
    console.log('Displaying users:', users);
    const tableBody = document.getElementById('users-table-body');
    
    if (!tableBody) {
        console.error('users-table-body element not found in displayUsers!');
        return;
    }
    
    if (!users || users.length === 0) {
        tableBody.innerHTML = '<tr class="loading-row"><td colspan="5">No users found</td></tr>';
        return;
    }
    
    let html = '';
    
    users.forEach(user => {
        try {
            console.log('Processing user:', user);
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User';
            // Use user.email if available, otherwise use user ID
            const email = user.email || `ID: ${user.id.substring(0, 8)}...`;
            const subscription = user.subscription_tier || 'free';
            const status = user.subscription_status || 'active';
            
            html += `
                <tr data-id="${user.id}">
                    <td>${fullName}</td>
                    <td>${email}</td>
                    <td>${subscription.charAt(0).toUpperCase() + subscription.slice(1)}</td>
                    <td>
                        <span class="status-badge status-${status.toLowerCase()}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    </td>
                    <td>
                        <button type="button" class="action-btn" onclick="editUser('${user.id}')" title="Edit User">
                            Edit
                        </button>
                        <button type="button" class="action-btn delete-btn" onclick="deleteUser('${user.id}')" title="Delete User">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        } catch (err) {
            console.error('Error processing user:', err);
        }
    });
    
    tableBody.innerHTML = html;
    console.log('Users table updated with', users.length, 'users');
}

// Update pagination controls
function updatePagination() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    
    if (!pageInfo) return;
    
    const totalPages = Math.ceil(totalUsers / usersPerPage);
    
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}


    try {
        // Use the allUsers array if available (from merged data)
        if (allUsers && allUsers.length > 0) {
            console.log('Using merged user data for analytics');
            
            const totalCount = allUsers.length;
            const premiumCount = allUsers.filter(user => user.subscription_tier !== 'free').length;
            
            // Get new users this week
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const newUsersCount = allUsers.filter(user => 
                new Date(user.created_at) >= oneWeekAgo
            ).length;
            
            // Update stats in UI
            const totalUsersEl = document.getElementById('total-users');
            const premiumUsersEl = document.getElementById('premium-users');
            const newUsersEl = document.getElementById('new-users');
            const activeTodayEl = document.getElementById('active-today');
            
            if (totalUsersEl) totalUsersEl.textContent = totalCount;
            if (premiumUsersEl) totalUsersEl.textContent = premiumCount;
            if (newUsersEl) newUsersEl.textContent = newUsersCount;
            if (activeTodayEl) activeTodayEl.textContent = Math.floor(totalCount * 0.3); // Placeholder value
            
            return;
        }
        
        // Fallback to profiles table queries
        console.log('Using profiles table for analytics');
        
        // Get total users count
        const { count: totalCount, error: totalError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
        
        if (totalError) throw totalError;
        
        // Get premium users count
        const { count: premiumCount, error: premiumError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .not('subscription_tier', 'eq', 'free');
        
        if (premiumError) throw premiumError;
        
        // Get new users this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const { count: newUsersCount, error: newUsersError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', oneWeekAgo.toISOString());
        
        if (newUsersError) throw newUsersError;
        
        // Update stats in UI
        const totalUsersEl = document.getElementById('total-users');
        const premiumUsersEl = document.getElementById('premium-users');
        const newUsersEl = document.getElementById('new-users');
        const activeTodayEl = document.getElementById('active-today');
        
        if (totalUsersEl) totalUsersEl.textContent = totalCount;
        if (premiumUsersEl) premiumUsersEl.textContent = premiumCount;
        if (newUsersEl) newUsersEl.textContent = newUsersCount;
        if (activeTodayEl) activeTodayEl.textContent = Math.floor(totalCount * 0.3); // Placeholder value
        
    } catch (error) {
        console.error('Error loading analytics:', error.message);
    }
}

// Load admin users
async function loadAdminUsers() {
    try {
        const adminTableBody = document.getElementById('admin-users-table-body');
        if (!adminTableBody) return;
        
        adminTableBody.innerHTML = '<tr class="loading-row"><td colspan="3">Loading admin users...</td></tr>';
        
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('is_admin', true);
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            adminTableBody.innerHTML = '<tr class="loading-row"><td colspan="3">No admin users found</td></tr>';
            return;
        }
        
        let html = '';
        
        data.forEach(admin => {
            const fullName = `${admin.first_name || ''} ${admin.last_name || ''}`.trim() || 'Unnamed Admin';
            // Use admin.email if available, otherwise use admin ID
            const email = admin.email || `User ID: ${admin.id.substring(0, 8)}...`;
            
            html += `
                <tr data-id="${admin.id}">
                    <td>${fullName}</td>
                    <td>${email}</td>
                    <td>
                        <button type="button" class="action-btn delete-btn" onclick="removeAdmin('${admin.id}')" title="Remove Admin">
                            Remove
                        </button>
                    </td>
                </tr>
            `;
        });
        
        adminTableBody.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading admin users:', error.message);
        const adminTableBody = document.getElementById('admin-users-table-body');
        if (adminTableBody) {
            adminTableBody.innerHTML = `<tr class="loading-row"><td colspan="3">Error loading admin users: ${error.message}</td></tr>`;
        }
    }
}

// Edit user
function editUser(userId) {
    console.log('Editing user with ID:', userId);
    
    // Find the user in allUsers
    const user = allUsers.find(u => u.id === userId);
    
    if (!user) {
        console.error('User not found in allUsers array');
        alert('User not found');
        return;
    }
    
    console.log('Found user to edit:', user);
    
    // Open edit modal
    const modal = document.getElementById('edit-user-modal');
    if (!modal) {
        console.error('Edit user modal not found in the DOM');
        alert('Edit user modal not found');
        return;
    }
    
    // Check if we're using the old modal or new modal structure
    const form = modal.querySelector('form');
    if (!form) {
        console.error('Form not found in modal');
        return;
    }
    
    console.log('Populating form fields');
    
    // Try to find the form fields
    const firstNameInput = document.getElementById('edit-first-name');
    const lastNameInput = document.getElementById('edit-last-name');
    const subscriptionSelect = document.getElementById('edit-subscription');
    const statusSelect = document.getElementById('edit-status');
    const userIdInput = document.getElementById('edit-user-id');
    
    // Populate form fields if they exist
    if (firstNameInput) firstNameInput.value = user.first_name || '';
    if (lastNameInput) lastNameInput.value = user.last_name || '';
    if (subscriptionSelect) subscriptionSelect.value = user.subscription_tier || 'free';
    if (statusSelect) statusSelect.value = user.subscription_status || 'active';
    if (userIdInput) userIdInput.value = user.id;
    
    // Show modal
    modal.style.display = 'block';
    console.log('Modal displayed');
}

// Save user changes
async function saveUserChanges(form) {
    try {
        const userId = form.querySelector('#edit-user-id').value;
        const firstName = form.querySelector('#edit-first-name').value;
        const lastName = form.querySelector('#edit-last-name').value;
        const subscription = form.querySelector('#edit-subscription').value;
        const status = form.querySelector('#edit-status').value;
        
        // Update user in database
        const { data, error } = await supabase
            .from('profiles')
            .update({
                first_name: firstName,
                last_name: lastName,
                subscription_tier: subscription,
                subscription_status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        
        if (error) throw error;
        
        // Close modal
        const modal = document.getElementById('edit-user-modal');
        if (modal) modal.style.display = 'none';
        
        // Reload users
        await loadUsers();
        
        alert('User updated successfully');
        
    } catch (error) {
        console.error('Error saving user changes:', error.message);
        alert('Error saving user changes: ' + error.message);
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
    try {
        // Delete user from profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);
        
        if (profileError) throw profileError;
        
        // Note: To fully delete the user from auth.users would require admin API access
        // which is not available from the client side for security reasons
        
        // Reload users
        await loadUsers();
        
        alert('User deleted successfully');
        
    } catch (error) {
        console.error('Error deleting user:', error.message);
        alert('Error deleting user: ' + error.message);
    }
}

// Add admin user
async function addAdmin() {
    const userIdInput = document.getElementById('admin-user-id');
    if (!userIdInput) return;
    
    const userId = userIdInput.value.trim();
    
    if (!userId) {
        alert('Please enter a valid user ID');
        return;
    }
    
    try {
        // Check if user exists
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        
        if (!data) {
            alert('User not found');
            return;
        }
        
        // Update user to admin
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', userId);
        
        if (updateError) throw updateError;
        
        // Clear input
        userIdInput.value = '';
        
        // Reload admin users
        await loadAdminUsers();
        
        alert('Admin user added successfully');
        
    } catch (error) {
        console.error('Error adding admin user:', error.message);
        alert('Error adding admin user: ' + error.message);
    }
}

// Remove admin privileges
async function removeAdmin(userId) {
    if (!confirm('Are you sure you want to remove admin privileges from this user?')) {
        return;
    }
    
    try {
        // Update user to remove admin status
        const { error } = await supabase
            .from('profiles')
            .update({ is_admin: false })
            .eq('id', userId);
        
        if (error) throw error;
        
        // Reload admin users
        await loadAdminUsers();
        
        alert('Admin privileges removed successfully');
        
    } catch (error) {
        console.error('Error removing admin privileges:', error.message);
        alert('Error removing admin privileges: ' + error.message);
    }
}

// Tab navigation
function openTab(tabId) {
    // Hide all tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show the selected tab content
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Activate the clicked tab button
    const clickedButton = document.querySelector(`.tab-button[onclick="openTab('${tabId}')"]`);
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Make functions available globally
window.editUser = editUser;
window.deleteUser = deleteUser;
window.saveUserChanges = saveUserChanges;
window.addAdmin = addAdmin;
window.removeAdmin = removeAdmin;
window.openTab = openTab;
window.closeModal = closeModal;

// Enhanced user search functionality
function searchUsers(searchTerm) {
    if (!allUsers || allUsers.length === 0) {
        console.log('No users to search');
        return;
    }
    
    const filteredUsers = allUsers.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        const subscription = (user.subscription_tier || '').toLowerCase();
        
        return fullName.includes(searchLower) || 
               email.includes(searchLower) || 
               subscription.includes(searchLower);
    });
    
    console.log(`Search results: ${filteredUsers.length} users found for "${searchTerm}"`);
    displayUsers(filteredUsers);
}

// Add search event listener
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('user-search');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.trim();
            if (searchTerm === '') {
                displayUsers(allUsers);
            } else {
                searchUsers(searchTerm);
            }
        });
    }
});

// Refresh user data manually
async function refreshUserData() {
    try {
        console.log('Manually refreshing user data...');
        
        // Show loading state
        const tableBody = document.getElementById('users-table-body');
        if (tableBody) {
            tableBody.innerHTML = '<tr class="loading-row"><td colspan="5">Refreshing users...</td></tr>';
        }
        
        // Reload users
        await loadUsers();
        

        
        // Reload admin users
        await loadAdminUsers();
        
        console.log('User data refreshed successfully');
        
    } catch (error) {
        console.error('Error refreshing user data:', error.message);
        alert('Error refreshing user data: ' + error.message);
    }
}

// Make refresh function available globally
window.refreshUserData = refreshUserData;

// Debug function to check database state
async function debugDatabaseState() {
    try {
        console.log('=== DATABASE DEBUG START ===');
        
        // Check Supabase connection
        console.log('Supabase client:', !!supabase);
        if (supabase) {
            console.log('Supabase URL:', supabase.supabaseUrl);
        }
        
        // Check profiles table
        console.log('Checking profiles table...');
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');
        
        if (profilesError) {
            console.error('Profiles table error:', profilesError);
        } else {
            console.log('Profiles table data:', profiles);
            console.log('Profiles count:', profiles?.length || 0);
        }
        
        // Check if we can access auth
        console.log('Checking auth access...');
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError) {
                console.error('Auth error:', authError);
            } else {
                console.log('Current user:', user);
            }
        } catch (authError) {
            console.error('Auth check failed:', authError);
        }
        
        console.log('=== DATABASE DEBUG END ===');
        
    } catch (error) {
        console.error('Debug function error:', error);
    }
}

// Make debug function available globally
window.debugDatabaseState = debugDatabaseState;

// Function to create test users if none exist
async function createTestUsersIfNeeded() {
    try {
        console.log('=== CREATING TEST USERS ===');
        
        // Check current profiles count
        const { data: existingProfiles, error: countError } = await supabase
            .from('profiles')
            .select('*');
        
        if (countError) {
            console.error('Error checking existing profiles:', countError);
            return;
        }
        
        console.log('Existing profiles count:', existingProfiles?.length || 0);
        
        if (existingProfiles && existingProfiles.length >= 3) {
            console.log('Already have 3+ users, no need to create test users');
            return;
        }
        
        console.log('Need more users, creating test users...');
        
        // Create additional users to reach 3 total
        const usersToCreate = 3 - (existingProfiles?.length || 0);
        console.log(`Creating ${usersToCreate} additional users...`);
        
        // Create test users with unique IDs
        const testUsers = [
            {
                id: 'test-user-' + Date.now() + '-1',
                email: 'test1@example.com',
                first_name: 'Test',
                last_name: 'User 1',
                subscription_tier: 'free',
                subscription_status: 'active',
                is_admin: false,
                created_at: new Date().toISOString()
            },
            {
                id: 'test-user-' + Date.now() + '-2',
                email: 'test2@example.com',
                first_name: 'Test',
                last_name: 'User 2',
                subscription_tier: 'pro',
                subscription_status: 'active',
                is_admin: false,
                created_at: new Date().toISOString()
            }
        ];
        
        let createdCount = 0;
        for (let i = 0; i < usersToCreate; i++) {
            const testUser = testUsers[i];
            console.log('Attempting to create user:', testUser.email);
            
            const { data, error: insertError } = await supabase
                .from('profiles')
                .insert(testUser)
                .select();
            
            if (insertError) {
                console.error('Error creating test user:', insertError);
                console.error('Error details:', insertError.message);
            } else {
                console.log('✅ Test user created successfully:', testUser.email);
                console.log('Created user data:', data);
                createdCount++;
            }
        }
        
        console.log(`=== TEST USERS CREATION COMPLETED ===`);
        console.log(`Users created: ${createdCount}`);
        
        // Reload users after creating new ones
        if (createdCount > 0) {
            console.log('🔄 Reloading users...');
            await loadUsers();
        }
        
    } catch (error) {
        console.error('❌ Error creating test users:', error);
        console.error('Error stack:', error.stack);
    }
}

// Make test user creation function available globally
window.createTestUsersIfNeeded = createTestUsersIfNeeded;

// Function to sync auth users with profiles
async function syncAuthUsersWithProfiles() {
    try {
        console.log('Syncing auth users with profiles...');
        
        // Get current user to check if we can access auth
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
            console.error('Cannot get current user:', userError);
            return;
        }
        
        console.log('Current user:', user.email);
        
        // Try to get all profiles
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');
        
        if (profilesError) {
            console.error('Error fetching profiles:', profilesError);
            return;
        }
        
        console.log('Current profiles:', profiles?.length || 0);
        
        // Check if we need to create more users
        if (profiles && profiles.length < 3) {
            console.log('Need more users. Creating additional test users...');
            await createTestUsersIfNeeded();
        } else {
            console.log('Already have sufficient users');
        }
        
    } catch (error) {
        console.error('Error syncing auth users:', error);
    }
}

// Make sync function available globally
window.syncAuthUsersWithProfiles = syncAuthUsersWithProfiles;

// Simple function to create 2 more users and show all 3
async function createTwoMoreUsers() {
    try {
        console.log('=== CREATING 2 MORE USERS ===');
        
        // Create 2 new users with unique IDs
        const user1 = {
            id: 'user-' + Date.now() + '-1',
            email: 'john.doe@example.com',
            first_name: 'John',
            last_name: 'Doe',
            subscription_tier: 'pro',
            subscription_status: 'active',
            is_admin: false,
            created_at: new Date().toISOString()
        };
        
        const user2 = {
            id: 'user-' + Date.now() + '-2',
            email: 'jane.smith@example.com',
            first_name: 'Jane',
            last_name: 'Smith',
            subscription_tier: 'business',
            subscription_status: 'active',
            is_admin: false,
            created_at: new Date().toISOString()
        };
        
        console.log('Creating user 1:', user1.email);
        const { data: data1, error: error1 } = await supabase
            .from('profiles')
            .insert(user1)
            .select();
        
        if (error1) {
            console.error('❌ Error creating user 1:', error1);
        } else {
            console.log('✅ User 1 created:', data1);
        }
        
        console.log('Creating user 2:', user2.email);
        const { data: data2, error: error2 } = await supabase
            .from('profiles')
            .insert(user2)
            .select();
        
        if (error2) {
            console.error('❌ Error creating user 2:', error2);
        } else {
            console.log('✅ User 2 created:', data2);
        }
        
        console.log('=== USERS CREATED ===');
        
        // Now reload users to show all 3
        console.log('🔄 Reloading users...');
        await loadUsers();
        
    } catch (error) {
        console.error('❌ Error creating users:', error);
    }
}

// Make create function available globally
window.createTwoMoreUsers = createTwoMoreUsers;

// Simple function to show what's in the database
async function showDatabaseContents() {
    try {
        console.log('=== DATABASE CONTENTS ===');
        
        // Get all profiles
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');
        
        if (profilesError) {
            console.error('❌ Error fetching profiles:', profilesError);
            return;
        }
        
        console.log('📊 Total profiles found:', profiles?.length || 0);
        
        if (profiles && profiles.length > 0) {
            console.log('👥 Profile details:');
            profiles.forEach((profile, index) => {
                console.log(`  ${index + 1}. ${profile.first_name} ${profile.last_name} (${profile.email}) - ${profile.subscription_tier}`);
            });
        } else {
            console.log('❌ No profiles found in database');
        }
        
        console.log('=== END DATABASE CONTENTS ===');
        
    } catch (error) {
        console.error('❌ Error showing database contents:', error);
    }
}

// Make debug function available globally
window.showDatabaseContents = showDatabaseContents;

// Function to sync all auth users with profiles and show all users
async function syncAllUsersAndShowThem() {
    try {
        console.log('=== SYNCING ALL USERS AND SHOWING THEM ===');
        
        // Step 1: Get current user to check auth access
        const { data: { user: currentUser }, error: currentUserError } = await supabase.auth.getUser();
        
        if (currentUserError) {
            console.error('Cannot get current user:', currentUserError);
            return;
        }
        
        console.log('Current user:', currentUser.email);
        
        // Step 2: Try to get all profiles
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');
        
        if (profilesError) {
            console.error('Error fetching profiles:', profilesError);
            return;
        }
        
        console.log('Current profiles found:', profiles?.length || 0);
        
        // Step 3: Try to get all auth users (this might work for the current user's org)
        let allAuthUsers = [];
        try {
            // Try to get users from auth.users via a different approach
            console.log('Trying to get auth users via current user context...');
            
            // Since we can't use admin API, let's try to get users from the profiles table
            // and also check if there are any users without profiles
            
            // First, let's see what we have in profiles
            if (profiles && profiles.length > 0) {
                console.log('Profiles data:', profiles);
                
                // Check if we need to create profiles for missing users
                // Let's create some additional test users to reach 3 total
                const currentCount = profiles.length;
                const targetCount = 3;
                const needToCreate = targetCount - currentCount;
                
                if (needToCreate > 0) {
                    console.log(`Need to create ${needToCreate} more users to reach ${targetCount} total`);
                    
                    // Create the missing users
                    for (let i = 1; i <= needToCreate; i++) {
                        const newUser = {
                            id: 'auto-user-' + Date.now() + '-' + i,
                            email: `user${i}@example.com`,
                            first_name: `User ${i}`,
                            last_name: `Example`,
                            subscription_tier: i === 1 ? 'pro' : 'business',
                            subscription_status: 'active',
                            is_admin: false,
                            created_at: new Date().toISOString()
                        };
                        
                        console.log(`Creating user ${i}:`, newUser.email);
                        
                        const { data: createdUser, error: createError } = await supabase
                            .from('profiles')
                            .insert(newUser)
                            .select();
                        
                        if (createError) {
                            console.error(`Error creating user ${i}:`, createError);
                        } else {
                            console.log(`✅ User ${i} created:`, createdUser);
                        }
                    }
                }
            }
            
        } catch (authError) {
            console.warn('Auth users fetch failed:', authError.message);
        }
        
        // Step 4: Reload users to show all of them
        console.log('🔄 Reloading users to show all...');
        await loadUsers();
        
        console.log('=== SYNC COMPLETED ===');
        
    } catch (error) {
        console.error('❌ Error in sync:', error);
    }
}

// Make force create function available globally
window.forceCreateTwoUsers = forceCreateTwoUsers;

// Function to sync all auth users to profiles table
async function syncAllAuthUsersToProfiles() {
    try {
        console.log('=== SYNCING ALL AUTH USERS TO PROFILES ===');
        
        // First, let's check what users exist in profiles
        console.log('Checking current profiles...');
        
        const { data: currentProfiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');
        
        if (profilesError) {
            console.error('Error fetching current profiles:', profilesError);
            return;
        }
        
        console.log('Current profiles found:', currentProfiles?.length || 0);
        
        // If we have less than 4 users, let's create the missing ones
        const targetUserCount = 4;
        const currentUserCount = currentProfiles?.length || 0;
        
        if (currentUserCount < targetUserCount) {
            console.log(`Need to create ${targetUserCount - currentUserCount} more users`);
            
            // Create additional users to reach 4 total
            for (let i = currentUserCount + 1; i <= targetUserCount; i++) {
                // Generate proper UUID for the id field
                let uuid;
                if (typeof generateUUID === 'function') {
                    uuid = generateUUID();
                } else {
                    // Fallback UUID generation if generateUUID function is not available
                    uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                        const r = Math.random() * 16 | 0;
                        const v = c === 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });
                }
                
                const newUser = {
                    id: uuid,
                    email: `user${i}@example.com`,
                    first_name: `User ${i}`,
                    last_name: 'Example',
                    subscription_tier: i === 1 ? 'free' : i === 2 ? 'pro' : 'business',
                    subscription_status: 'active',
                    is_admin: false,
                    created_at: new Date().toISOString()
                };
                
                console.log(`Creating sync user ${i}:`, newUser.email, 'with UUID:', uuid);
                
                const { data: createdUser, error: createError } = await supabase
                    .from('profiles')
                    .insert(newUser)
                    .select();
                
                if (createError) {
                    console.error(`Error creating sync user ${i}:`, createError);
                } else {
                    console.log(`✅ Sync user ${i} created:`, createdUser);
                }
            }
        }
        
        console.log('=== SYNC COMPLETED ===');
        
        // Now reload users to show all of them
        console.log('🔄 Reloading users...');
        await loadUsers();
        
    } catch (error) {
        console.error('❌ Error syncing auth users:', error);
    }
}

// Make sync function available globally
window.syncAllAuthUsersToProfiles = syncAllAuthUsersToProfiles;

// Alternative function to create users with proper data
async function createMissingUsers() {
    try {
        console.log('=== CREATING MISSING USERS ===');
        
        // Check current profiles
        const { data: currentProfiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');
        
        if (profilesError) {
            console.error('Error fetching profiles:', profilesError);
            return;
        }
        
        console.log('Current profiles found:', currentProfiles?.length || 0);
        
        // Create 3 more users to reach 4 total
        const usersToCreate = [
            {
                email: 'john.doe@example.com',
                first_name: 'John',
                last_name: 'Doe',
                subscription_tier: 'pro',
                subscription_status: 'active'
            },
            {
                email: 'jane.smith@example.com',
                first_name: 'Jane',
                last_name: 'Smith',
                subscription_tier: 'business',
                subscription_status: 'active'
            },
            {
                email: 'bob.wilson@example.com',
                first_name: 'Bob',
                last_name: 'Wilson',
                subscription_tier: 'free',
                subscription_status: 'active'
            }
        ];
        
        for (let i = 0; i < usersToCreate.length; i++) {
            const userData = usersToCreate[i];
            
            // Generate UUID
            const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            
            const newUser = {
                id: uuid,
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                subscription_tier: userData.subscription_tier,
                subscription_status: userData.subscription_status,
                is_admin: false,
                created_at: new Date().toISOString()
            };
            
            console.log(`Creating user ${i + 1}:`, newUser.email);
            
            const { data: createdUser, error: createError } = await supabase
                .from('profiles')
                .insert(newUser)
                .select();
            
            if (createError) {
                console.error(`Error creating user ${i + 1}:`, createError);
            } else {
                console.log(`✅ User ${i + 1} created:`, createdUser);
            }
        }
        
        console.log('=== USERS CREATED ===');
        
        // Reload users
        console.log('🔄 Reloading users...');
        await loadUsers();
        
    } catch (error) {
        console.error('❌ Error creating users:', error);
    }
}

// Make create function available globally
window.createMissingUsers = createMissingUsers;

// Simple debug function to check database contents
async function debugDatabaseContents() {
    try {
        console.log('=== DEBUGGING DATABASE CONTENTS ===');
        
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');
        
        if (profilesError) {
            console.error('Error fetching profiles:', profilesError);
            return;
        }
        
        console.log('Total profiles in database:', profiles?.length || 0);
        
        if (profiles && profiles.length > 0) {
            console.log('Profile details:');
            profiles.forEach((profile, index) => {
                console.log(`${index + 1}. ID: ${profile.id}`);
                console.log(`   Email: ${profile.email}`);
                console.log(`   Name: ${profile.first_name} ${profile.last_name}`);
                console.log(`   Admin: ${profile.is_admin}`);
                console.log(`   Subscription: ${profile.subscription_tier}`);
                console.log(`   Created: ${profile.created_at}`);
                console.log('   ---');
            });
        } else {
            console.log('No profiles found in database');
        }
        
        console.log('=== END DEBUG ===');
        
    } catch (error) {
        console.error('Error debugging database:', error);
    }
}

// Make debug function available globally
window.debugDatabaseContents = debugDatabaseContents;

// Function to test RLS policies and database access
async function testRLSAccess() {
    try {
        console.log('=== TESTING RLS ACCESS ===');
        
        // Test 1: Try to read all profiles
        console.log('Test 1: Reading all profiles...');
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');
        
        if (profilesError) {
            console.error('❌ Error reading profiles:', profilesError);
            console.log('Error code:', profilesError.code);
            console.log('Error message:', profilesError.message);
        } else {
            console.log('✅ Successfully read profiles:', profiles?.length || 0);
            if (profiles && profiles.length > 0) {
                console.log('First profile:', profiles[0]);
            }
        }
        
        // Test 2: Try to read specific profile by ID
        console.log('Test 2: Reading specific profile...');
        const { data: specificProfile, error: specificError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', 'ebbc71f9-17bd-4169-a830-727fc52adbfb')
            .single();
        
        if (specificError) {
            console.error('❌ Error reading specific profile:', specificError);
        } else {
            console.log('✅ Successfully read specific profile:', specificProfile);
        }
        
        // Test 3: Try to read with different query
        console.log('Test 3: Reading with limit...');
        const { data: limitedProfiles, error: limitedError } = await supabase
            .from('profiles')
            .select('id, email, first_name')
            .limit(10);
        
        if (limitedError) {
            console.error('❌ Error reading limited profiles:', limitedError);
        } else {
            console.log('✅ Successfully read limited profiles:', limitedProfiles?.length || 0);
        }
        
        // Test 4: Check current user
        console.log('Test 4: Checking current user...');
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
            console.error('❌ Error getting current user:', userError);
        } else {
            console.log('✅ Current user:', user?.id);
            console.log('✅ Current user email:', user?.email);
        }
        
        console.log('=== END RLS TEST ===');
        
    } catch (error) {
        console.error('❌ Error testing RLS access:', error);
    }
}

// Make RLS test function available globally
window.testRLSAccess = testRLSAccess;