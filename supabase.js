// Initialize Supabase client
const SUPABASE_URL = 'https://hyimlsdqexkbltlhjctp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5aW1sc2RxZXhrYmx0bGhqY3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MzU2MzYsImV4cCI6MjA3MDUxMTYzNn0.ALZNJUleYo4qzexjLCcoRRxg4xJDH6EW6KaHZHI-VmI';

// Create Supabase client - wait for library to be available
let supabase = null;

function initializeSupabase() {
    try {
        if (typeof window.supabase !== 'undefined') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase client initialized successfully');
            return true;
        } else {
            console.warn('Supabase library not available yet');
            return false;
        }
    } catch (error) {
        console.error('Error initializing Supabase client:', error);
        return false;
    }
}

// Global function to check if Supabase is ready
function isSupabaseReady() {
    return supabase !== null;
}

// Authentication functions
async function signUp(email, password, userData = {}) {
    // Safety check: ensure Supabase is available
    if (!supabase) {
        console.warn('Supabase not available, cannot sign up');
        return { data: null, error: new Error('Supabase not available') };
    }
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error signing up:', error.message);
        return { data: null, error };
    }
}

async function signIn(email, password) {
    // Safety check: ensure Supabase is available
    if (!supabase) {
        console.warn('Supabase not available, cannot sign in');
        return { data: null, error: new Error('Supabase not available') };
    }
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error signing in:', error.message);
        return { data: null, error };
    }
}

async function signOut() {
    // Safety check: ensure Supabase is available
    if (!supabase) {
        console.warn('Supabase not available, cannot sign out');
        return { error: new Error('Supabase not available') };
    }
    
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Error signing out:', error.message);
        return { error };
    }
}

// Get current user session
async function getCurrentUser() {
    // Safety check: ensure Supabase is available
    if (!supabase) {
        console.warn('Supabase not available, cannot get current user');
        return { user: null, error: new Error('Supabase not available') };
    }
    
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
            return { user: session.user, error: null };
        } else {
            return { user: null, error: null };
        }
    } catch (error) {
        console.error('Error getting user:', error.message);
        return { user: null, error };
    }
}

// Update user profile in Supabase
async function updateUserProfile(userData) {
    // Safety check: ensure Supabase is available
    if (!supabase) {
        console.warn('Supabase not available, cannot update profile');
        return { data: null, error: new Error('Supabase not available') };
    }
    
    try {
        const { data, error } = await supabase.auth.updateUser({
            data: userData
        });
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error updating profile:', error.message);
        return { data: null, error };
    }
}

// Check authentication status and update UI
async function checkAuthStatus() {
    // Safety check: ensure Supabase is available
    if (!supabase) {
        console.warn('Supabase not available, skipping auth check');
        return;
    }
    
    const { user } = await getCurrentUser();
    
    const navAuthButtons = document.getElementById('nav-auth-buttons');
    const navProfile = document.getElementById('nav-profile');
    
    if (user) {
        // User is logged in
        if (navAuthButtons) navAuthButtons.style.display = 'none';
        if (navProfile) {
            navProfile.style.display = 'block';
            
            // Update profile information
            const avatarText = navProfile.querySelector('.avatar-text');
            const profileName = navProfile.querySelector('.profile-name');
            
            // Get real user data from profiles table first
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('first_name, last_name, email')
                .eq('id', user.id)
                .maybeSingle();
            
            let firstName, lastName, fullName, initials;
            
            if (!profileError && profileData && (profileData.first_name || profileData.last_name)) {
                // Use database profile data for real user information
                firstName = profileData.first_name || '';
                lastName = profileData.last_name || '';
                fullName = `${firstName} ${lastName}`.trim();
                initials = firstName && lastName 
                    ? (firstName[0] + lastName[0]).toUpperCase() 
                    : (firstName[0] || lastName[0] || user.email[0]).toUpperCase();
            } else {
                // Fallback to user metadata if no profile data
                firstName = user.user_metadata?.first_name || '';
                lastName = user.user_metadata?.last_name || '';
                fullName = firstName && lastName ? `${firstName} ${lastName}` : user.email.split('@')[0];
                initials = firstName && lastName 
                    ? (firstName[0] + lastName[0]).toUpperCase() 
                    : user.email.substring(0, 2).toUpperCase();
            }
            
            if (avatarText) avatarText.textContent = initials;
            if (profileName) profileName.textContent = fullName;
            
            // Check if user is admin and update dropdown
            const { isAdmin } = await isUserAdmin();
            const adminLink = navProfile.querySelector('.dropdown-menu a.admin-link');
            
            if (adminLink) {
                adminLink.style.display = isAdmin ? 'block' : 'none';
                console.log('Admin status:', isAdmin); // Debug log
            }
            
            // Update mobile profile section
            const mobileProfileSection = document.getElementById('mobile-profile-section');
            const mobileAuthButtons = document.getElementById('mobile-auth-buttons');
            const mobileAvatarText = document.querySelector('.mobile-profile-avatar .avatar-text');
            const mobileProfileName = document.querySelector('.mobile-profile-name');
            const mobileAdminLink = document.querySelector('.mobile-profile-section .admin-link');
            
            if (mobileProfileSection) mobileProfileSection.style.display = 'flex';
            if (mobileAuthButtons) mobileAuthButtons.style.display = 'none';
            if (mobileAvatarText) mobileAvatarText.textContent = initials;
            if (mobileProfileName) mobileProfileName.textContent = fullName;
            if (mobileAdminLink) mobileAdminLink.style.display = isAdmin ? 'block' : 'none';
        }
    } else {
        // User is not logged in
        if (navAuthButtons) navAuthButtons.style.display = 'flex';
        if (navProfile) navProfile.style.display = 'none';
        
        // Update mobile sections
        const mobileProfileSection = document.getElementById('mobile-profile-section');
        const mobileAuthButtons = document.getElementById('mobile-auth-buttons');
        
        if (mobileProfileSection) mobileProfileSection.style.display = 'none';
        if (mobileAuthButtons) mobileAuthButtons.style.display = 'flex';
    }
}

// Check if user is admin
async function isUserAdmin() {
    // Safety check: ensure Supabase is available
    if (!supabase) {
        console.warn('Supabase not available, skipping admin check');
        return { isAdmin: false, error: null };
    }
    
    try {
        const { user, error: userError } = await getCurrentUser();
        
        if (userError || !user) {
            return { isAdmin: false, error: null };
        }
        
        // Get user profile to check admin status with enhanced error handling
        const { data, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .maybeSingle(); // Use maybeSingle instead of single
        
        if (error) {
            console.error('Error fetching admin status:', error);
            // Return false instead of throwing to prevent crashes
            return { isAdmin: false, error };
        }
        
        // If no profile exists, create one with default admin status
        if (!data) {
            console.log('No profile found for admin check, creating default profile...');
            try {
                const defaultProfile = {
                    id: user.id,
                    first_name: user.user_metadata?.first_name || '',
                    last_name: user.user_metadata?.last_name || '',
                    is_admin: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                
                const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert(defaultProfile)
                    .select('is_admin')
                    .single();
                
                if (createError) {
                    console.error('Error creating default profile:', createError);
                    return { isAdmin: false, error: createError };
                }
                
                return { isAdmin: newProfile?.is_admin || false, error: null };
            } catch (createError) {
                console.error('Error in profile creation fallback:', createError);
                return { isAdmin: false, error: createError };
            }
        }
        
        return { isAdmin: data?.is_admin || false, error: null };
    } catch (error) {
        console.error('Error checking admin status:', error.message);
        return { isAdmin: false, error };
    }
}

// Initialize auth status on page load
document.addEventListener('DOMContentLoaded', function() {
    // Try to initialize Supabase first
    if (initializeSupabase()) {
        checkAuthStatus();
    } else {
        // If Supabase isn't ready yet, wait a bit and try again
        setTimeout(function() {
            if (initializeSupabase()) {
                checkAuthStatus();
            } else {
                console.warn('Supabase not available after timeout');
            }
        }, 1000);
    }
});
