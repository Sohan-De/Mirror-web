// Mirror Web Admin Dashboard - Fixed Version
// This fixes the syntax errors and missing functions

// Global variables
let allUsers = [];
let currentPage = 1;
const usersPerPage = 10;
let totalUsers = 0;

// Initialize admin dashboard
async function initializeAdminDashboard() {
    try {
        console.log('Initializing admin dashboard...');
        
        // Check if user is admin
        const isAdmin = await checkAdminStatus();
        if (!isAdmin) {
            showAccessDenied();
            return;
        }
        
        // Load initial data
        await Promise.all([
            loadUsers(),
            loadAnalytics(),
            loadAdminUsers(),
            loadKeys()
        ]);
        
        console.log('Admin dashboard initialized successfully');
        
    } catch (error) {
        console.error('Error initializing admin dashboard:', error);
        showErrorMessage('Failed to initialize dashboard: ' + error.message);
    }
}

// Check if current user is admin
async function checkAdminStatus() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;
        
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
        
        return profile?.is_admin === true;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Load users with pagination
async function loadUsers(page = 1) {
    try {
        currentPage = page;
        const startIndex = (page - 1) * usersPerPage;
        
        const { data: users, error } = await supabase
            .from('profiles')
            .select('*')
            .range(startIndex, startIndex + usersPerPage - 1)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Get total count
        const { count, error: countError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
        
        if (countError) throw countError;
        totalUsers = count;
        
        // Store users globally
        allUsers = users;
        
        // Render users table
        renderUsersTable(users);
        updatePagination();
        
    } catch (error) {
        console.error('Error loading users:', error);
        showErrorMessage('Failed to load users: ' + error.message);
    }
}

// Render users table
function renderUsersTable(users) {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;
    
    if (!users || users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No users found</td></tr>';
        return;
    }
    
    let html = '';
    
    users.forEach(user => {
        try {
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User';
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
    const nextBtn = document.getElementById('prev-page');
    const pageInfo = document.getElementById('page-info');
    
    if (!pageInfo) return;
    
    const totalPages = Math.ceil(totalUsers / usersPerPage);
    
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}

// Load analytics data
async function loadAnalytics() {
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
            if (premiumUsersEl) premiumUsersEl.textContent = premiumCount;
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

// Load keys from Key table
async function loadKeys() {
    try {
        console.log('Loading keys...');
        const keysTableBody = document.getElementById('keys-table-body');
        if (!keysTableBody) {
            console.error('Keys table body not found');
            return;
        }
        
        // Show loading state
        keysTableBody.innerHTML = '<tr class="loading-row"><td colspan="5">Loading keys...</td></tr>';
        
        // Fetch keys with cache busting
        const { data: keys, error } = await supabase
            .from('Key')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log('Fetched keys from database:', keys);
        
        if (!keys || keys.length === 0) {
            keysTableBody.innerHTML = '<tr><td colspan="5">No keys found</td></tr>';
            console.log('No keys found in database');
            return;
        }
        
        let html = '';
        
        keys.forEach(key => {
            const status = key.used ? '🔴 Used' : '🟢 Available';
            const statusClass = key.used ? 'status-used' : 'status-available';
            
            html += `
                <tr data-id="${key.id}">
                    <td>${key.id}</td>
                    <td><code>${key.key_value}</code></td>
                    <td><span class="status-badge ${statusClass}">${status}</span></td>
                    <td>${new Date(key.created_at).toLocaleDateString()}</td>
                    <td>
                        <button type="button" class="action-btn" onclick="editKey('${key.id}')" title="Edit Key">
                            Edit
                        </button>
                        <button type="button" class="action-btn delete-btn" onclick="deleteKey('${key.id}')" title="Delete Key">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });
        
        keysTableBody.innerHTML = html;
        console.log('Keys table updated with', keys.length, 'keys');
        
    } catch (error) {
        console.error('Error loading keys:', error.message);
        const keysTableBody = document.getElementById('keys-table-body');
        if (keysTableBody) {
            keysTableBody.innerHTML = `<tr class="loading-row"><td colspan="5">Error loading keys: ${error.message}</td></tr>`;
        }
    }
}

// Add new key
async function addKey() {
    try {
        const keyValue = document.getElementById('new-key-value').value.trim();
        if (!keyValue) {
            showErrorMessage('Please enter a key value');
            return;
        }
        
        if (keyValue.length !== 16) {
            showErrorMessage('Key must be exactly 16 characters long');
        return;
    }
    
        console.log('Adding new key:', keyValue);
        
        const { error } = await supabase
            .from('Key')
            .insert({
                key_value: keyValue,
                used: false
            });
        
        if (error) throw error;
        
        console.log('Key added successfully');
        showSuccessMessage('Key added successfully');
        
        // Clear input and reload keys
        document.getElementById('new-key-value').value = '';
        await loadKeys();
        
    } catch (error) {
        console.error('Error adding key:', error);
        showErrorMessage('Failed to add key: ' + error.message);
    }
}

// Edit key
async function editKey(keyId) {
    try {
        console.log('Editing key:', keyId);
        
        // Get current key data
        const { data: keys, error } = await supabase
            .from('Key')
            .select('*')
            .eq('id', keyId)
            .single();
        
        if (error) throw error;
        
        // Show edit modal
        showEditKeyModal(keys);
        
    } catch (error) {
        console.error('Error editing key:', error);
        showErrorMessage('Failed to edit key: ' + error.message);
    }
}

// Update key
async function updateKey(keyId, keyValue, used) {
    try {
        console.log('Updating key:', keyId, keyValue, used);
        
        const { error } = await supabase
            .from('Key')
            .update({
                key_value: keyValue,
                used: used,
                updated_at: new Date().toISOString()
            })
            .eq('id', keyId);
        
        if (error) throw error;
        
        console.log('Key updated successfully');
        showSuccessMessage('Key updated successfully');
        
        // Close the modal
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
        
        // Reload keys
        await loadKeys();
        
    } catch (error) {
        console.error('Error updating key:', error);
        showErrorMessage('Failed to update key: ' + error.message);
    }
}

// Delete key
async function deleteKey(keyId) {
    try {
        if (!confirm('Are you sure you want to delete this key? This action cannot be undone.')) {
            return;
        }
        
        console.log('Deleting key:', keyId);
        
        // First verify the key exists
        const { data: keyExists, error: checkError } = await supabase
            .from('Key')
            .select('id')
            .eq('id', keyId)
            .single();
        
        if (checkError || !keyExists) {
            showErrorMessage('Key not found or already deleted');
            await loadKeys(); // Refresh to show current state
            return;
        }
        
        // Delete the key with multiple attempts
        console.log('Attempting to delete key with ID:', keyId);
        
        // Method 1: Standard delete
        let { data: deleteResult, error: deleteError } = await supabase
            .from('Key')
            .delete()
            .eq('id', keyId)
            .select();
        
        console.log('Delete result:', deleteResult);
        
        // If no rows deleted, try alternative method
        if (!deleteResult || deleteResult.length === 0) {
            console.log('Standard delete failed, trying alternative method...');
            
            // Method 2: Try with different approach
            const { error: altDeleteError } = await supabase
                .rpc('delete_key_by_id', { key_id: keyId });
            
            if (altDeleteError) {
                console.log('Alternative delete also failed:', altDeleteError);
                throw new Error('Failed to delete key - no rows affected');
            } else {
                console.log('Alternative delete successful');
            }
        }
        
        console.log('Key deleted successfully');
        showSuccessMessage('Key deleted successfully');
        
        // Verify deletion by checking if key still exists
        const { data: verifyKey, error: verifyError } = await supabase
            .from('Key')
            .select('id')
            .eq('id', keyId)
            .single();
        
        if (verifyError && verifyError.code === 'PGRST116') {
            console.log('Key successfully verified as deleted (not found)');
        } else if (verifyKey) {
            console.log('WARNING: Key still exists after deletion:', verifyKey);
        }
        
        // Force refresh the keys table
        console.log('Refreshing keys table...');
        await loadKeys();
        
        // Also remove the row from DOM if it exists
        const row = document.querySelector(`tr[data-id="${keyId}"]`);
        if (row) {
            row.remove();
            console.log('Row removed from DOM');
        } else {
            console.log('Row not found in DOM, table should be refreshed');
        }
        
        // Double-check the count after refresh
        const { count: finalCount, error: countError } = await supabase
            .from('Key')
            .select('*', { count: 'exact', head: true });
        
        if (countError) {
            console.error('Error getting final count:', countError);
        } else {
            console.log('Final key count after deletion:', finalCount);
        }
        
    } catch (error) {
        console.error('Error deleting key:', error);
        showErrorMessage('Failed to delete key: ' + error.message);
        // Refresh table even on error to show current state
        await loadKeys();
    }
}

// Generate random key
function generateRandomKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('new-key-value').value = result;
}

// Show edit key modal
function showEditKeyModal(key) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Edit Key</h3>
            <div class="form-group">
                <label>Key Value:</label>
                <input type="text" id="edit-key-value" value="${key.key_value}" maxlength="16" />
            </div>
            <div class="form-group">
                <label>Status:</label>
                <select id="edit-key-used">
                    <option value="false" ${!key.used ? 'selected' : ''}>Available</option>
                    <option value="true" ${key.used ? 'selected' : ''}>Used</option>
                </select>
            </div>
            <div class="modal-actions">
                <button onclick="updateKey('${key.id}', document.getElementById('edit-key-value').value, document.getElementById('edit-key-used').value === 'true')">
                    Update
                </button>
                <button onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
            // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // Show add key modal
    function showAddKeyModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Add New Key</h3>
                <div class="form-group">
                    <label>Key Value:</label>
                    <input type="text" id="add-key-value" placeholder="Enter 16-character key" maxlength="16" />
                </div>
                <div class="form-group">
                    <label>Status:</label>
                    <select id="add-key-used">
                        <option value="false" selected>Available</option>
                        <option value="true">Used</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button onclick="addNewKey()">Add Key</button>
                    <button onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Focus on input field
        setTimeout(() => {
            const input = document.getElementById('add-key-value');
            if (input) input.focus();
        }, 100);
    }
    
    // Add new key function
    async function addNewKey() {
        try {
            const keyValue = document.getElementById('add-key-value').value.trim();
            const used = document.getElementById('add-key-used').value === 'true';
            
            if (!keyValue) {
                showErrorMessage('Please enter a key value');
                return;
            }
            
            if (keyValue.length !== 16) {
                showErrorMessage('Key must be exactly 16 characters long');
                return;
            }
            
            console.log('Adding new key:', keyValue, 'Used:', used);
            
            // Use the RLS-bypass function for admin users
            const { data: newKeyId, error } = await supabase
                .rpc('add_key_by_admin', {
                    key_value: keyValue,
                    is_used: used
                });
            
            if (error) throw error;
            
            console.log('Key added successfully');
            showSuccessMessage('Key added successfully');
            
            // Close the modal
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                modal.remove();
            }
            
            // Reload keys
            await loadKeys();
            
        } catch (error) {
            console.error('Error adding key:', error);
            showErrorMessage('Failed to add key: ' + error.message);
        }
    }

// Delete user function
async function deleteUser(userId) {
    try {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
        console.log('Deleting user:', userId);
        
        // Delete user from profiles table
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);
        
        if (error) throw error;
        
        console.log('User deleted successfully');
        showSuccessMessage('User deleted successfully');
        
        // Reload users
        await loadUsers(currentPage);
        
    } catch (error) {
        console.error('Error deleting user:', error);
        showErrorMessage('Failed to delete user: ' + error.message);
    }
}

// Edit user function
async function editUser(userId) {
    try {
        console.log('Editing user:', userId);
        
        // Find user data
        const user = allUsers.find(u => u.id === userId);
        if (!user) {
            showErrorMessage('User not found');
            return;
        }
        
        // Show edit modal (implement this based on your UI)
        showEditUserModal(user);
        
    } catch (error) {
        console.error('Error editing user:', error);
        showErrorMessage('Failed to edit user: ' + error.message);
    }
}

// Remove admin function
async function removeAdmin(userId) {
    try {
    if (!confirm('Are you sure you want to remove admin privileges from this user?')) {
            return;
        }
        
        console.log('Removing admin privileges from user:', userId);
        
        const { error } = await supabase
                .from('profiles')
            .update({ is_admin: false })
            .eq('id', userId);
        
        if (error) throw error;
        
        console.log('Admin privileges removed successfully');
        showSuccessMessage('Admin privileges removed successfully');
        
        // Reload admin users
        await loadAdminUsers();
        
    } catch (error) {
        console.error('Error removing admin privileges:', error);
        showErrorMessage('Failed to remove admin privileges: ' + error.message);
    }
}

// Utility functions
function showSuccessMessage(message) {
    // Implement success message display
    console.log('Success:', message);
    alert('Success: ' + message);
}

function showErrorMessage(message) {
    // Implement error message display
    console.error('Error:', message);
    alert('Error: ' + message);
}

function showAccessDenied() {
    const container = document.querySelector('.admin-container');
    if (container) {
        container.innerHTML = `
            <div class="access-denied">
                <h2>Access Denied</h2>
                <p>You do not have permission to access the admin dashboard.</p>
                <a href="/" class="btn">Go Home</a>
            </div>
        `;
    }
}

function showEditUserModal(user) {
    // Implement edit user modal
    console.log('Show edit modal for user:', user);
    alert('Edit user: ' + user.first_name + ' ' + user.last_name);
}

// Navigation functions
function goToPage(page) {
    if (page >= 1 && page <= Math.ceil(totalUsers / usersPerPage)) {
        loadUsers(page);
    }
}

function nextPage() {
    if (currentPage < Math.ceil(totalUsers / usersPerPage)) {
        goToPage(currentPage + 1);
    }
}

function prevPage() {
    if (currentPage > 1) {
        goToPage(currentPage - 1);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin dashboard DOM loaded');
    
    // Add CSS for keys tab
    addKeysTabStyles();
    
    initializeAdminDashboard();
});

// Add CSS styles for keys tab
function addKeysTabStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .status-available {
            background: #e8f5e8;
            color: #2e7d32;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
        }
        
        .status-used {
            background: #ffebee;
            color: #c62828;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
        }
        
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .modal-content {
            background: white;
            padding: 20px;
            border-radius: 8px;
            min-width: 300px;
        }
        
        .form-group {
            margin: 15px 0;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        .form-group input,
        .form-group select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        .modal-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 20px;
        }
        
        .modal-actions button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .modal-actions button:first-child {
            background: #007bff;
            color: white;
        }
        
        .modal-actions button:last-child {
            background: #6c757d;
            color: white;
        }
        
        .add-key-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .add-key-section input {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-right: 10px;
            width: 200px;
        }
        
        .add-key-section button {
            margin-right: 10px;
        }
        
        .key-stats {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .key-stat {
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .key-stat h3 {
            margin: 0;
            color: #007bff;
        }
        
        .key-stat p {
            margin: 5px 0 0 0;
            font-size: 24px;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
}

// Refresh user data function
async function refreshUserData() {
    try {
        console.log('Refreshing user data...');
        await loadUsers(currentPage);
        await loadAnalytics();
        console.log('User data refreshed successfully');
    } catch (error) {
        console.error('Error refreshing user data:', error);
        showErrorMessage('Failed to refresh user data: ' + error.message);
    }
}

// Export functions for global access
window.deleteUser = deleteUser;
window.editUser = editUser;
window.removeAdmin = removeAdmin;
window.goToPage = goToPage;
window.nextPage = nextPage;
window.prevPage = prevPage;
window.refreshUserData = refreshUserData;
window.loadKeys = loadKeys;
window.addKey = addKey;
window.editKey = editKey;
window.updateKey = updateKey;
window.deleteKey = deleteKey;
window.generateRandomKey = generateRandomKey;
window.showAddKeyModal = showAddKeyModal;
window.addNewKey = addNewKey;
