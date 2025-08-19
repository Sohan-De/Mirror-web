# Key Delivery Service Usage Guide

## Overview
The updated Key Delivery Service now ensures that users receive keys that match the exact plan they paid for. This prevents users from getting keys for different plans than what they purchased.

## Key Features

### ✅ **Plan-Specific Key Delivery**
- Users only get keys for their paid plan
- Automatic filtering by `plan_id`
- Prevents plan mismatch issues

### ✅ **Supabase Integration**
- Fully connected to your Supabase database
- Real-time key availability checking
- Proper error handling and logging

### ✅ **EmailJS Integration**
- Automated email delivery to users and admins
- Professional email templates
- Delivery confirmation and tracking

## Usage Examples

### 1. Basic Usage (Auto-detect plan from package name)
```javascript
const keyService = new KeyDeliveryService();

// The service will automatically detect the plan ID from the package name
const result = await keyService.processSuccessfulPayment(
    'user@example.com',
    'John Doe',
    'Pro'  // Will automatically map to plan_id: 2
);
```

### 2. Explicit Plan ID Usage
```javascript
const keyService = new KeyDeliveryService();

// Explicitly specify the plan ID
const result = await keyService.processSuccessfulPayment(
    'user@example.com',
    'John Doe',
    'Pro',
    2  // Explicit plan_id for Pro plan
);
```

### 3. Check Key Availability Before Payment
```javascript
const keyService = new KeyDeliveryService();

// Check if keys are available for a specific plan
const availableKeys = await keyService.checkKeyAvailability(2); // Pro plan
console.log(`Available Pro plan keys: ${availableKeys}`);

if (availableKeys > 0) {
    // Proceed with payment
    console.log('Keys available, payment can proceed');
} else {
    // Show out of stock message
    console.log('No keys available for this plan');
}
```

### 4. Get Plan Details
```javascript
const keyService = new KeyDeliveryService();

// Get detailed information about a plan
const planDetails = await keyService.getPlanDetails(2);
console.log('Pro Plan Details:', planDetails);
// Output: { id: 2, name: 'Pro', price: 29.99, features: [...], ... }
```

## Plan ID Mapping

| Plan Name | Plan ID | Price | Description |
|-----------|---------|-------|-------------|
| Free      | 1       | $0.00 | Basic features, limited usage |
| Pro       | 2       | $29.99 | Advanced features, moderate usage |
| Business  | 3       | $99.99 | Premium features, unlimited usage |

## Integration with Checkout

### In your checkout.js or payment handler:
```javascript
// After successful Stripe payment
async function handleSuccessfulPayment(userEmail, userName, packageName) {
    try {
        const keyService = new KeyDeliveryService();
        
        // Get plan ID from package name
        const planId = keyService.getPlanIdFromPackageName(packageName);
        
        // Process key delivery
        const result = await keyService.processSuccessfulPayment(
            userEmail,
            userName,
            packageName,
            planId
        );
        
        if (result.success) {
            console.log('✅ Key delivered successfully:', result.key);
            // Show success message to user
            showSuccessMessage(`Your ${packageName} license key has been sent to ${userEmail}`);
        } else {
            console.error('❌ Key delivery failed:', result.error);
            // Handle error
            showErrorMessage('Key delivery failed. Please contact support.');
        }
    } catch (error) {
        console.error('Payment processing error:', error);
        showErrorMessage('Payment processing failed. Please try again.');
    }
}
```

## Error Handling

### Common Error Scenarios:

1. **No Keys Available for Plan**
   ```javascript
   // Error: "No unused keys available for Pro plan. Please contact support."
   // Solution: Add more keys for this plan in admin dashboard
   ```

2. **Invalid Plan ID**
   ```javascript
   // Error: "Invalid plan_id: Plan does not exist"
   // Solution: Check plan_id exists in subscription_packages table
   ```

3. **Email Delivery Failed**
   ```javascript
   // Error: "Failed to send key email"
   // Solution: Check EmailJS configuration and internet connection
   ```

## Database Requirements

### Required Tables:
1. **`Key`** - Stores license keys with `plan_id` column
2. **`subscription_packages`** - Stores plan information
3. **`profiles`** - User profiles with admin flags
4. **`key_delivery_logs`** - Delivery tracking (optional)

### Required Columns in `Key` table:
- `id` (Primary Key)
- `key_value` (License key string)
- `plan_id` (Foreign key to subscription_packages)
- `used` (Boolean - true if key is consumed)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## Testing

### Test Key Delivery:
```javascript
// Test with a specific plan
const testResult = await keyService.processSuccessfulPayment(
    'test@example.com',
    'Test User',
    'Free',
    1
);

console.log('Test Result:', testResult);
```

### Monitor Key Availability:
```javascript
// Check all plans
for (let planId = 1; planId <= 3; planId++) {
    const count = await keyService.checkKeyAvailability(planId);
    console.log(`Plan ${planId}: ${count} keys available`);
}
```

## Best Practices

1. **Always check key availability** before processing payment
2. **Use explicit plan IDs** when possible for better control
3. **Monitor key inventory** regularly in admin dashboard
4. **Handle errors gracefully** with user-friendly messages
5. **Log all transactions** for audit purposes

## Support

If you encounter issues:
1. Check browser console for detailed error logs
2. Verify Supabase connection and table structure
3. Ensure EmailJS is properly configured
4. Check that keys exist for the requested plan
5. Verify RLS policies allow proper access
