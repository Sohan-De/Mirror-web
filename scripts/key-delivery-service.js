// Key Delivery Service - Sends keys to users after successful payment
class KeyDeliveryService {
    constructor() {
        // EmailJS configuration
        this.emailjsConfig = {
            serviceId: 'Key-service', // Replace with your EmailJS service ID
            templateId: 'template_qic08qk', // Replace with your EmailJS template ID
            publicKey: 'e58yoorl3LASDk8bj' // Replace with your EmailJS public key
        };
        
        // Initialize EmailJS
        this.initializeEmailJS();
    }

    // Initialize EmailJS
    initializeEmailJS() {
        if (typeof emailjs !== 'undefined') {
            emailjs.init(this.emailjsConfig.publicKey);
            console.log('EmailJS initialized successfully');
        } else {
            console.error('EmailJS not loaded');
        }
    }

    // Get an unused key from the database for a specific plan
    async getUnusedKey(planId = null) {
        try {
            console.log('Getting unused key for plan:', planId);
            
            // Build the query
            let query = supabase
                .from('Key')
                .select('*')
                .eq('used', false);
            
            // If planId is provided, filter by plan_id
            if (planId) {
                query = query.eq('plan_id', planId);
                console.log(`🔍 Filtering keys for plan_id: ${planId}`);
            }
            
            // Get the first available key
            const { data, error } = await query.limit(1).single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No keys found for this plan
                    console.log(`❌ No unused keys available for plan_id: ${planId}`);
                    return null;
                }
                throw error;
            }
            
            // Verify the key has the correct plan_id
            if (planId && data.plan_id !== planId) {
                console.error(`❌ CRITICAL ERROR: Key returned has wrong plan_id!`);
                console.error(`Expected plan_id: ${planId}, Got: ${data.plan_id}`);
                console.error(`Key data:`, data);
                throw new Error(`Database returned key with wrong plan_id. Expected: ${planId}, Got: ${data.plan_id}`);
            }
            
            console.log('✅ Found unused key:', data);
            console.log(`🔑 Key value: ${data.key_value}, Plan ID: ${data.plan_id}`);
            console.log(`✅ Plan ID verification passed: ${data.plan_id} === ${planId}`);
            return data;
        } catch (error) {
            console.error('Error getting unused key:', error);
            return null;
        }
    }

    // Mark key as used
    async markKeyAsUsed(keyData) {
        try {
            console.log('🔍 Key data received:', keyData);
            console.log('🔍 Available columns:', Object.keys(keyData));
            
            // Determine the correct ID column name by checking what exists
            let idColumn = null;
            let idValue = null;
            
            // Check for common ID column names
            if (keyData.id !== undefined) {
                idColumn = 'id';
                idValue = keyData.id;
            } else if (keyData.key_id !== undefined) {
                idColumn = 'key_id';
                idValue = keyData.key_id;
            } else if (keyData.license_id !== undefined) {
                idColumn = 'license_id';
                idValue = keyData.license_id;
            } else if (keyData.product_id !== undefined) {
                idColumn = 'product_id';
                idValue = keyData.product_id;
            } else {
                // If no ID column found, try to use the key_value as identifier
                if (keyData.key_value !== undefined) {
                    idColumn = 'key_value';
                    idValue = keyData.key_value;
                    console.log('⚠️ No ID column found, using key_value as identifier');
                } else {
                    throw new Error('No suitable ID column found in key data');
                }
            }
            
            console.log(`✅ Using column: ${idColumn} = ${idValue}`);
            
            // Update the key to mark it as used
            const { error } = await supabase
                .from('Key')
                .update({ used: true, updated_at: new Date().toISOString() })
                .eq(idColumn, idValue);

            if (error) {
                console.error('❌ Database update error:', error);
                throw error;
            }
            
            console.log('✅ Key marked as used successfully');
            return true;
        } catch (error) {
            console.error('❌ Error marking key as used:', error);
            return false;
        }
    }

    // Send key via email to both user and admin
    async sendKeyEmail(userEmail, userName, keyValue, packageName) {
        try {
            console.log('📧 Preparing to send emails to user and admin');
            
            // Get admin email from profiles table
            let adminEmail = 'admin@mirrorweb.com'; // Default admin email
            try {
                const { data: adminProfile } = await supabase
                    .from('profiles')
                    .select('email')
                    .eq('is_admin', true)
                    .limit(1)
                    .single();
                
                if (adminProfile && adminProfile.email) {
                    adminEmail = adminProfile.email;
                    console.log('📧 Admin email found:', adminEmail);
                }
            } catch (error) {
                console.log('⚠️ Could not fetch admin email, using default:', adminEmail);
            }
            
            // Send email to user
            const userTemplateParams = {
                to_email: userEmail,        // User's email address
                to_name: userName,          // User's name
                key_value: keyValue,        // License key
                package_name: packageName,  // Package name
                company_name: 'Mirror Web',
                support_email: 'support@mirrorweb.com',
                purchase_date: new Date().toLocaleDateString()
            };

            console.log('📧 Sending email to user:', userEmail);
            const userEmailResponse = await emailjs.send(
                this.emailjsConfig.serviceId,
                this.emailjsConfig.templateId,
                userTemplateParams,
                this.emailjsConfig.publicKey
            );

            console.log('✅ User email sent successfully');
            
            // Send email to admin
            const adminTemplateParams = {
                to_email: adminEmail,       // Admin's email address
                to_name: 'Admin',           // Admin's name
                key_value: keyValue,        // License key
                package_name: packageName,  // Package name
                company_name: 'Mirror Web',
                support_email: 'support@mirrorweb.com',
                purchase_date: new Date().toLocaleDateString(),
                user_email: userEmail,      // Include user's email for admin reference
                user_name: userName         // Include user's name for admin reference
            };

            console.log('📧 Sending email to admin:', adminEmail);
            const adminEmailResponse = await emailjs.send(
                this.emailjsConfig.serviceId,
                this.emailjsConfig.templateId,
                adminTemplateParams,
                this.emailjsConfig.publicKey
            );

            console.log('✅ Admin email sent successfully');
            console.log('📧 All emails sent successfully');
            
            return true;
        } catch (error) {
            console.error('❌ Error sending emails:', error);
            return false;
        }
    }

    // Main function: Process successful payment and send key
    async processSuccessfulPayment(userEmail, userName, packageName, planId = null) {
        try {
            console.log('Processing successful payment for:', userEmail, 'Plan:', packageName, 'Plan ID:', planId);

            // Step 1: Get an unused key for the specific plan
            console.log('🔍 Step 1: Getting unused key for plan...');
            const keyData = await this.getUnusedKey(planId);
            if (!keyData) {
                if (planId) {
                    throw new Error(`No unused keys available for ${packageName} plan. Please contact support.`);
                } else {
                    throw new Error('No unused keys available. Please contact support.');
                }
            }
            
            console.log('✅ Step 1: Got unused key:', keyData);
            console.log('🔑 Key value:', keyData.key_value);
            console.log('📊 Plan ID:', keyData.plan_id);
            console.log('📦 Package:', packageName);

            // Step 2: Send the key via email
            const emailSent = await this.sendKeyEmail(
                userEmail, 
                userName, 
                keyData.key_value, 
                packageName
            );

            if (!emailSent) {
                throw new Error('Failed to send key email');
            }

            // Step 3: Mark the key as used
            const keyMarked = await this.markKeyAsUsed(keyData);
            if (!keyMarked) {
                throw new Error('Failed to mark key as used');
            }

            // Step 4: Log the transaction
            await this.logKeyDelivery(userEmail, keyData.key_value, packageName, planId);

            console.log('✅ Key delivery completed successfully');
            return {
                success: true,
                key: keyData.key_value,
                plan_id: keyData.plan_id,
                message: 'Key delivered successfully'
            };

        } catch (error) {
            console.error('❌ Error processing successful payment:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Log key delivery for tracking
    async logKeyDelivery(userEmail, keyValue, packageName, planId = null) {
        try {
            const { error } = await supabase
                .from('key_delivery_logs')
                .insert({
                    user_email: userEmail,
                    key_value: keyValue,
                    package_name: packageName,
                    plan_id: planId,
                    delivered_at: new Date().toISOString(),
                    status: 'delivered'
                });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error logging key delivery:', error);
            return false;
        }
    }

    // Get delivery status for a user
    async getDeliveryStatus(userEmail) {
        try {
            const { data, error } = await supabase
                .from('key_delivery_logs')
                .select('*')
                .eq('user_email', userEmail)
                .order('delivered_at', { ascending: false })
                .limit(1);

            if (error) throw error;
            return data[0] || null;
        } catch (error) {
            console.error('Error getting delivery status:', error);
            return null;
        }
    }

    // Helper function to get plan ID from package name
    getPlanIdFromPackageName(packageName) {
        const packageMap = {
            'free': 1,
            'Free': 1,
            'pro': 2,
            'Pro': 2,
            'business': 3,
            'Business': 3
        };
        
        return packageMap[packageName] || null;
    }

    // Check if keys are available for a specific plan
    async checkKeyAvailability(planId) {
        try {
            const { count, error } = await supabase
                .from('Key')
                .select('*', { count: 'exact', head: true })
                .eq('used', false)
                .eq('plan_id', planId);

            if (error) throw error;
            
            console.log(`🔍 Available keys for plan ${planId}: ${count}`);
            return count || 0;
        } catch (error) {
            console.error('Error checking key availability:', error);
            return 0;
        }
    }

    // Get plan details for a specific plan ID
    async getPlanDetails(planId) {
        try {
            const { data, error } = await supabase
                .from('subscription_packages')
                .select('*')
                .eq('id', planId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting plan details:', error);
            return null;
        }
    }

    // Test function to verify key delivery system
    async testKeyDelivery(planId) {
        try {
            console.log(`🧪 Testing key delivery for plan_id: ${planId}`);
            
            // Check key availability
            const availableKeys = await this.checkKeyAvailability(planId);
            console.log(`📊 Available keys for plan ${planId}: ${availableKeys}`);
            
            if (availableKeys === 0) {
                console.log(`❌ No keys available for plan ${planId}`);
                return false;
            }
            
            // Get a key without marking it as used (for testing)
            const { data, error } = await supabase
                .from('Key')
                .select('*')
                .eq('used', false)
                .eq('plan_id', planId)
                .limit(1)
                .single();
            
            if (error) {
                console.error('❌ Error getting test key:', error);
                return false;
            }
            
            console.log(`✅ Test key found:`, data);
            console.log(`🔑 Key value: ${data.key_value}`);
            console.log(`📦 Plan ID: ${data.plan_id}`);
            console.log(`✅ Plan ID matches: ${data.plan_id === planId}`);
            
            return true;
        } catch (error) {
            console.error('❌ Test failed:', error);
            return false;
        }
    }
}

// Export the service
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeyDeliveryService;
} else {
    window.KeyDeliveryService = KeyDeliveryService;
}
