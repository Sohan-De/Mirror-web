// Debug script for signup issues
// Add this to your sign-up.html page temporarily to debug the issue

// Enhanced signup function with better error handling
async function debugSignUp(email, password, userData = {}) {
    try {
        console.log('Attempting signup with data:', { email, userData });
        
        // First, check if Supabase client is properly initialized
        if (!window.supabase) {
            throw new Error('Supabase client not initialized');
        }
        
        // Check if the supabase object has the auth property
        if (!window.supabase.auth) {
            throw new Error('Supabase auth not available');
        }
        
        // Attempt the signup
        const { data, error } = await window.supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });
        
        console.log('Signup response:', { data, error });
        
        if (error) {
            console.error('Supabase signup error:', error);
            throw error;
        }
        
        return { data, error: null };
    } catch (error) {
        console.error('Debug signup error:', error);
        
        // Log additional error details
        if (error.message) {
            console.error('Error message:', error.message);
        }
        if (error.status) {
            console.error('Error status:', error.status);
        }
        if (error.details) {
            console.error('Error details:', error.details);
        }
        if (error.hint) {
            console.error('Error hint:', error.hint);
        }
        
        return { data: null, error };
    }
}

// Function to test the database connection
async function testDatabaseConnection() {
    try {
        console.log('Testing database connection...');
        
        // Try to query the profiles table
        const { data, error } = await window.supabase
            .from('profiles')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('Database connection test failed:', error);
            return false;
        }
        
        console.log('Database connection successful');
        return true;
    } catch (error) {
        console.error('Database connection test error:', error);
        return false;
    }
}

// Function to check if profiles table exists and has correct structure
async function checkProfilesTable() {
    try {
        console.log('Checking profiles table structure...');
        
        // Try to get table info
        const { data, error } = await window.supabase
            .from('profiles')
            .select('*')
            .limit(1);
        
        if (error) {
            console.error('Profiles table check failed:', error);
            return false;
        }
        
        console.log('Profiles table accessible, columns:', Object.keys(data[0] || {}));
        return true;
    } catch (error) {
        console.error('Profiles table check error:', error);
        return false;
    }
}

// Enhanced error display function
function showDetailedError(error, elementId = 'error-message') {
    const errorElement = document.getElementById(elementId);
    if (!errorElement) return;
    
    let errorText = 'Sign up failed. ';
    
    if (error.message) {
        errorText += error.message;
    }
    
    if (error.status) {
        errorText += ` (Status: ${error.status})`;
    }
    
    if (error.details) {
        errorText += ` Details: ${error.details}`;
    }
    
    if (error.hint) {
        errorText += ` Hint: ${error.hint}`;
    }
    
    errorElement.textContent = errorText;
    errorElement.style.display = 'block';
    
    // Also log to console for debugging
    console.error('Detailed error:', error);
}

// Add this to your signup form submission
async function enhancedSignup(formData) {
    try {
        // Test database connection first
        const dbConnected = await testDatabaseConnection();
        if (!dbConnected) {
            throw new Error('Database connection failed');
        }
        
        // Check profiles table
        const tableExists = await checkProfilesTable();
        if (!tableExists) {
            throw new Error('Profiles table not accessible');
        }
        
        // Proceed with signup
        const { data, error } = await debugSignUp(
            formData.email, 
            formData.password, 
            formData.userData
        );
        
        if (error) throw error;
        
        return { data, error: null };
    } catch (error) {
        showDetailedError(error);
        return { data: null, error };
    }
}

// Export functions for use in HTML
window.debugSignUp = debugSignUp;
window.testDatabaseConnection = testDatabaseConnection;
window.checkProfilesTable = checkProfilesTable;
window.showDetailedError = showDetailedError;
window.enhancedSignup = enhancedSignup;
