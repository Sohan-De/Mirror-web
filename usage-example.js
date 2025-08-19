// Example usage of Key Delivery Service
// This shows how to integrate with your payment system

// Initialize the service
const keyDeliveryService = new KeyDeliveryService();

// Example 1: After successful payment
async function handleSuccessfulPayment(paymentData) {
    try {
        const result = await keyDeliveryService.processSuccessfulPayment(
            paymentData.userEmail,        // User's email
            paymentData.userName,         // User's name
            paymentData.packageName       // Package name (e.g., "Pro", "Business")
        );

        if (result.success) {
            console.log('Key delivered successfully:', result.key);
            // Show success message to user
            showSuccessMessage('Your key has been sent to your email!');
        } else {
            console.error('Key delivery failed:', result.error);
            // Show error message to user
            showErrorMessage('Failed to deliver key. Please contact support.');
        }
    } catch (error) {
        console.error('Error handling payment:', error);
    }
}

// Example 2: Check delivery status
async function checkDeliveryStatus(userEmail) {
    try {
        const deliveryStatus = await keyDeliveryService.getDeliveryStatus(userEmail);
        
        if (deliveryStatus) {
            console.log('Delivery status:', deliveryStatus);
            return deliveryStatus;
        } else {
            console.log('No delivery found for this user');
            return null;
        }
    } catch (error) {
        console.error('Error checking delivery status:', error);
        return null;
    }
}

// Example 3: Integration with Stripe webhook
async function handleStripeWebhook(event) {
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        
        // Extract user information from payment intent
        const userEmail = paymentIntent.receipt_email || paymentIntent.customer_details?.email;
        const userName = paymentIntent.customer_details?.name || 'User';
        const packageName = paymentIntent.metadata?.package_name || 'Unknown Package';
        
        // Process key delivery
        await handleSuccessfulPayment({
            userEmail,
            userName,
            packageName
        });
    }
}

// Example 4: Manual key delivery (for admin use)
async function manuallyDeliverKey(userEmail, userName, packageName) {
    try {
        const result = await keyDeliveryService.processSuccessfulPayment(
            userEmail,
            userName,
            packageName
        );
        
        if (result.success) {
            console.log('Manual key delivery successful:', result.key);
            return result;
        } else {
            console.error('Manual key delivery failed:', result.error);
            return result;
        }
    } catch (error) {
        console.error('Error in manual key delivery:', error);
        return { success: false, error: error.message };
    }
}

// Example 5: Get available keys count
async function getAvailableKeysCount() {
    try {
        const { count, error } = await supabase
            .from('Key')
            .select('*', { count: 'exact', head: true })
            .eq('used', false);

        if (error) throw error;
        return count;
    } catch (error) {
        console.error('Error getting available keys count:', error);
        return 0;
    }
}

// Example 6: Refund and reset key (if needed)
async function refundAndResetKey(userEmail) {
    try {
        // Get the delivery log
        const deliveryLog = await keyDeliveryService.getDeliveryStatus(userEmail);
        
        if (deliveryLog) {
            // Reset the key to unused
            const { error } = await supabase
                .from('Key')
                .update({ used: false, updated_at: new Date().toISOString() })
                .eq('key_value', deliveryLog.key_value);

            if (error) throw error;

            // Mark delivery log as refunded
            const { error: updateError } = await supabase
                .from('key_delivery_logs')
                .update({ status: 'refunded' })
                .eq('id', deliveryLog.id);

            if (updateError) throw updateError;

            console.log('Key refunded and reset successfully');
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error refunding key:', error);
        return false;
    }
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleSuccessfulPayment,
        checkDeliveryStatus,
        handleStripeWebhook,
        manuallyDeliverKey,
        getAvailableKeysCount,
        refundAndResetKey
    };
} else {
    window.KeyDeliveryExamples = {
        handleSuccessfulPayment,
        checkDeliveryStatus,
        handleStripeWebhook,
        manuallyDeliverKey,
        getAvailableKeysCount,
        refundAndResetKey
    };
}
