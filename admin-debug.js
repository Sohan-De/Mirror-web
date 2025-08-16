// Debug script for admin dashboard
console.log('Admin debug script loaded');

// Function to check if users are being loaded
function debugCheckUsers() {
    console.log('Checking users table...');
    
    // Check if the users table exists
    const usersTable = document.getElementById('users-table-body');
    if (!usersTable) {
        console.error('users-table-body element not found!');
        return;
    }
    
    console.log('Users table found:', usersTable);
    
    // Check if allUsers global variable exists
    if (typeof allUsers !== 'undefined') {
        console.log('allUsers variable found with', allUsers.length, 'users');
    } else {
        console.error('allUsers variable not found!');
    }
    
    // Try to load users directly
    console.log('Attempting to load users directly...');
    
    // Get profiles with user data - simpler query
    supabase
        .from('profiles')
        .select('*')
        .then(({ data, error }) => {
            if (error) {
                console.error('Error loading users directly:', error.message);
                return;
            }
            
            console.log('Users loaded directly:', data.length, 'users');
            console.log('Sample user data:', data[0]);
            
            // Try to display users directly
            if (data && data.length > 0) {
                let html = '';
                
                data.forEach(user => {
                    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User';
                    const email = user.email || `ID: ${user.id.substring(0, 8)}...`;
                    const subscription = user.subscription_tier || 'free';
                    const status = user.subscription_status || 'active';
                    
                    html += `
                        <tr data-id="${user.id}">
                            <td>${fullName}</td>
                            <td>${email}</td>
                            <td>${subscription.charAt(0).toUpperCase() + subscription.slice(1)}</td>
                            <td>${status.charAt(0).toUpperCase() + status.slice(1)}</td>
                            <td>
                                <button type="button" class="action-btn">Edit</button>
                                <button type="button" class="action-btn delete-btn">Delete</button>
                            </td>
                        </tr>
                    `;
                });
                
                usersTable.innerHTML = html;
                console.log('Users table updated directly with', data.length, 'users');
            }
        });
}

// Run debug checks after a short delay
setTimeout(debugCheckUsers, 2000);
