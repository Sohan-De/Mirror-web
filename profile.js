// Profile management functions for Supabase

// Get user profile data with enhanced error handling
async function getUserProfile() {
    try {
        // Get current user
        const { user, error: userError } = await getCurrentUser();
        
        if (userError || !user) {
            throw new Error(userError?.message || 'User not authenticated');
        }
        
        console.log('Fetching profile for user:', user.id);
        
        // First, try to get profile data from profiles table
        let { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle(); // Use maybeSingle instead of single to avoid errors
        
        if (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
        
        // If no profile exists, create one
        if (!data) {
            console.log('No profile found, creating default profile...');
            
            // Create a default profile
            const defaultProfile = {
                id: user.id,
                first_name: user.user_metadata?.first_name || '',
                last_name: user.user_metadata?.last_name || '',
                avatar_url: '',
                website: '',
                company: '',
                job_title: '',
                bio: '',
                subscription_tier: 'free',
                subscription_status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_admin: false
            };
            
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert(defaultProfile)
                .select()
                .single();
            
            if (createError) {
                console.error('Error creating profile:', createError);
                throw createError;
            }
            
            data = newProfile;
            console.log('Default profile created:', data);
        }
        
        // Ensure all required fields have default values
        const profile = {
            id: data.id,
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            avatar_url: data.avatar_url || '',
            website: data.website || '',
            company: data.company || '',
            job_title: data.job_title || '',
            bio: data.bio || '',
            subscription_tier: data.subscription_tier || 'free',
            subscription_status: data.subscription_status || 'active',
            subscription_start: data.subscription_start || null,
            subscription_end: data.subscription_end || null,
            is_admin: data.is_admin || false,
            created_at: data.created_at || new Date().toISOString(),
            updated_at: data.updated_at || new Date().toISOString()
        };
        
        console.log('Profile data retrieved successfully:', profile);
        return { profile, error: null };
        
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        
        // Return a minimal profile object if we can't fetch from database
        try {
            const { user } = await getCurrentUser();
            if (user) {
                const fallbackProfile = {
                    id: user.id,
                    first_name: user.user_metadata?.first_name || '',
                    last_name: user.user_metadata?.last_name || '',
                    avatar_url: '',
                    website: '',
                    company: '',
                    job_title: '',
                    bio: '',
                    subscription_tier: 'free',
                    subscription_status: 'active',
                    subscription_start: null,
                    subscription_end: null,
                    is_admin: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                
                console.log('Using fallback profile:', fallbackProfile);
                return { profile: fallbackProfile, error: null };
            }
        } catch (fallbackError) {
            console.error('Fallback profile creation failed:', fallbackError);
        }
        
        return { profile: null, error };
    }
}

// Update user profile
async function updateProfile(profileData) {
    try {
        // Get current user
        const { user, error: userError } = await getCurrentUser();
        
        if (userError || !user) {
            throw new Error(userError?.message || 'User not authenticated');
        }
        
        // Update profile data
        const { data, error } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('id', user.id)
            .select()
            .single();
        
        if (error) throw error;
        
        // Also update user metadata in auth.users
        const metadataToUpdate = {};
        if (profileData.first_name) metadataToUpdate.first_name = profileData.first_name;
        if (profileData.last_name) metadataToUpdate.last_name = profileData.last_name;
        
        if (Object.keys(metadataToUpdate).length > 0) {
            const { error: updateError } = await updateUserProfile(metadataToUpdate);
            if (updateError) throw updateError;
        }
        
        return { profile: data, error: null };
    } catch (error) {
        console.error('Error updating profile:', error.message);
        return { profile: null, error };
    }
}

// Upload avatar image
async function uploadAvatar(file) {
    try {
        // Get current user
        const { user, error: userError } = await getCurrentUser();
        
        if (userError || !user) {
            throw new Error(userError?.message || 'User not authenticated');
        }
        
        // Generate a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('user-avatars')
            .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: urlData } = await supabase
            .storage
            .from('user-avatars')
            .getPublicUrl(filePath);
        
        const avatarUrl = urlData.publicUrl;
        
        // Update profile with new avatar URL
        const { profile, error } = await updateProfile({ avatar_url: avatarUrl });
        
        if (error) throw error;
        
        return { profile, avatarUrl, error: null };
    } catch (error) {
        console.error('Error uploading avatar:', error.message);
        return { profile: null, avatarUrl: null, error };
    }
}

// Update subscription information
async function updateSubscription(subscriptionData) {
    try {
        // Get current user
        const { user, error: userError } = await getCurrentUser();
        
        if (userError || !user) {
            throw new Error(userError?.message || 'User not authenticated');
        }
        
        // Update subscription data
        const { data, error } = await supabase
            .from('profiles')
            .update(subscriptionData)
            .eq('id', user.id)
            .select()
            .single();
        
        if (error) throw error;
        
        return { profile: data, error: null };
    } catch (error) {
        console.error('Error updating subscription:', error.message);
        return { profile: null, error };
    }
}

// Initialize profile page
async function initializeProfilePage() {
    try {
        // Get user profile
        const { profile, error } = await getUserProfile();
        
        if (error) throw error;
        
        if (profile) {
            // Update UI with profile data
            const profileNameElement = document.getElementById('profile-name');
            const profileEmailElement = document.getElementById('profile-email');
            const profileAvatarElement = document.getElementById('profile-avatar');
            const profileFirstNameInput = document.getElementById('profile-first-name');
            const profileLastNameInput = document.getElementById('profile-last-name');
            const profileBioInput = document.getElementById('profile-bio');
            const profileWebsiteInput = document.getElementById('profile-website');
            const profileCompanyInput = document.getElementById('profile-company');
            const profileJobTitleInput = document.getElementById('profile-job-title');
            const subscriptionTierElement = document.getElementById('subscription-tier');
            const subscriptionStatusElement = document.getElementById('subscription-status');
            
            // Get current user for email
            const { user } = await getCurrentUser();
            
            if (profileNameElement) {
                profileNameElement.textContent = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
            }
            
            if (profileEmailElement && user) {
                profileEmailElement.textContent = user.email;
            }
            
            if (profileAvatarElement) {
                if (profile.avatar_url) {
                    profileAvatarElement.innerHTML = `<img src="${profile.avatar_url}" alt="Profile Avatar" class="avatar-img">`;
                } else {
                    // Display initials if no avatar
                    const initials = `${(profile.first_name || '').charAt(0)}${(profile.last_name || '').charAt(0)}`.toUpperCase() || 'U';
                    profileAvatarElement.innerHTML = `<div class="avatar-text">${initials}</div>`;
                }
            }
            
            // Fill form inputs if they exist
            if (profileFirstNameInput) profileFirstNameInput.value = profile.first_name || '';
            if (profileLastNameInput) profileLastNameInput.value = profile.last_name || '';
            if (profileBioInput) profileBioInput.value = profile.bio || '';
            if (profileWebsiteInput) profileWebsiteInput.value = profile.website || '';
            if (profileCompanyInput) profileCompanyInput.value = profile.company || '';
            if (profileJobTitleInput) profileJobTitleInput.value = profile.job_title || '';
            
            // Display subscription info if available
            if (subscriptionTierElement) {
                const tier = profile.subscription_tier || 'free';
                subscriptionTierElement.textContent = tier.charAt(0).toUpperCase() + tier.slice(1);
            }
            
            if (subscriptionStatusElement) {
                const status = profile.subscription_status || 'active';
                subscriptionStatusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            }
        }
    } catch (error) {
        console.error('Error initializing profile page:', error.message);
        
        // Check if user is authenticated before redirecting
        const { user } = await getCurrentUser();
        if (!user && window.location.pathname !== '/sign-in.html') {
            // Only redirect if the user is not authenticated
            window.location.href = 'sign-in.html';
        } else {
            // If user is authenticated but profile has issues, show an error message
            alert('Error loading profile data. Please try again later or contact support.');
        }
    }
}

// Handle profile form submission
function setupProfileForm() {
    const profileForm = document.getElementById('profile-form');
    
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const firstName = document.getElementById('profile-first-name').value;
            const lastName = document.getElementById('profile-last-name').value;
            const bio = document.getElementById('profile-bio').value;
            const website = document.getElementById('profile-website').value;
            const company = document.getElementById('profile-company').value;
            const jobTitle = document.getElementById('profile-job-title').value;
            
            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Saving...';
            submitButton.disabled = true;
            
            try {
                // Update profile
                const { profile, error } = await updateProfile({
                    first_name: firstName,
                    last_name: lastName,
                    bio,
                    website,
                    company,
                    job_title: jobTitle,
                    updated_at: new Date().toISOString()
                });
                
                if (error) throw error;
                
                // Show success message
                alert('Profile updated successfully!');
                
                // Update UI
                const profileNameElement = document.getElementById('profile-name');
                if (profileNameElement) {
                    profileNameElement.textContent = `${firstName} ${lastName}`.trim();
                }
                
                // Reset button
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
                
            } catch (error) {
                console.error('Error updating profile:', error.message);
                alert('Error updating profile: ' + error.message);
                
                // Reset button
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }
        });
    }
    
    // Handle avatar upload
    const avatarInput = document.getElementById('avatar-upload');
    const avatarPreview = document.getElementById('profile-avatar');
    
    if (avatarInput && avatarPreview) {
        avatarInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            
            if (file) {
                // Show loading state
                avatarPreview.innerHTML = '<div class="avatar-loading">Uploading...</div>';
                
                try {
                    // Upload avatar
                    const { avatarUrl, error } = await uploadAvatar(file);
                    
                    if (error) throw error;
                    
                    // Update preview
                    avatarPreview.innerHTML = `<img src="${avatarUrl}" alt="Profile Avatar" class="avatar-img">`;
                    
                } catch (error) {
                    console.error('Error uploading avatar:', error.message);
                    alert('Error uploading avatar: ' + error.message);
                    
                    // Reset preview
                    const { profile } = await getUserProfile();
                    if (profile && profile.avatar_url) {
                        avatarPreview.innerHTML = `<img src="${profile.avatar_url}" alt="Profile Avatar" class="avatar-img">`;
                    } else {
                        // Display initials if no avatar
                        const { user } = await getCurrentUser();
                        const initials = user ? user.email.substring(0, 2).toUpperCase() : 'U';
                        avatarPreview.innerHTML = `<div class="avatar-text">${initials}</div>`;
                    }
                }
            }
        });
    }
}

// Initialize profile functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a profile page
    const isProfilePage = document.getElementById('profile-form') !== null;
    
    if (isProfilePage) {
        initializeProfilePage();
        setupProfileForm();
    }
});
