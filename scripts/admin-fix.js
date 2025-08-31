// Admin fix script to ensure admin links are only visible to actual admins
document.addEventListener('DOMContentLoaded', function() {
    // Wait for page to load and check admin status properly
    setTimeout(function() {
        const adminLinks = document.querySelectorAll('.admin-link');
        
        // Hide all admin links by default
        adminLinks.forEach(link => {
            link.style.display = 'none';
        });
        
        // Check if admin status is being detected correctly
        console.log('Checking admin status directly from database...');
        
        // Get current user
        supabase.auth.getUser().then(({ data }) => {
            if (data && data.user) {
                const userId = data.user.id;
                console.log('Current user ID:', userId);
                
                // Check admin status directly with enhanced error handling
                supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', userId)
                    .maybeSingle()
                    .then(({ data, error }) => {
                        if (error) {
                            console.error('Error checking admin status:', error.message);
                            // Try to create a profile if it doesn't exist
                            if (error.message.includes('Cannot coerce') || error.message.includes('406')) {
                                console.log('Attempting to create profile for admin check...');
                                const defaultProfile = {
                                    id: userId,
                                    first_name: '',
                                    last_name: '',
                                    is_admin: false,
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                };
                                
                                supabase
                                    .from('profiles')
                                    .insert(defaultProfile)
                                    .then(({ error: createError }) => {
                                        if (createError) {
                                            console.error('Error creating profile:', createError);
                                        } else {
                                            console.log('Profile created successfully for admin check');
                                        }
                                    });
                            }
                        } else {
                            console.log('Admin status from DB:', data?.is_admin);
                            
                            // Only show admin link if user is actually admin
                            if (data?.is_admin === true) {
                                console.log('User is admin, showing admin link');
                                const adminLinks = document.querySelectorAll('.admin-link');
                                adminLinks.forEach(link => {
                                    link.style.display = 'block';
                                });
                            } else {
                                console.log('User is not admin, hiding admin link');
                                const adminLinks = document.querySelectorAll('.admin-link');
                                adminLinks.forEach(link => {
                                    link.style.display = 'none';
                                });
                            }
                        }
                    });
            } else {
                // No user logged in, hide admin links
                console.log('No user logged in, hiding admin links');
                const adminLinks = document.querySelectorAll('.admin-link');
                adminLinks.forEach(link => {
                    link.style.display = 'none';
                });
            }
        });
    }, 1000); // Wait 1 second to ensure the page is fully loaded
});
