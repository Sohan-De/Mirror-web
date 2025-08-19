# EmailJS Setup Guide for Key Delivery

## 🚀 Complete Setup Instructions

### **Step 1: EmailJS Account Setup**

1. **Go to [EmailJS.com](https://www.emailjs.com/)**
2. **Sign up/Login** to your account
3. **Get your credentials**:
   - Public Key
   - Service ID
   - Template ID

### **Step 2: EmailJS Service Configuration**

1. **Create Email Service**:
   - Click "Add New Service"
   - Choose your email provider (Gmail, Outlook, etc.)
   - Connect your email account
   - Copy the **Service ID**

2. **Create Email Template**:
   - Click "Add New Template"
   - Use this template code:

```html
Subject: Your Mirror Web License Key - {{package_name}}

Hello {{to_name}},

Thank you for your purchase! Your Mirror Web license key has been generated and is ready for use.

📦 Package: {{package_name}}
🔑 License Key: {{key_value}}

📱 How to Use:
1. Download Mirror Web from our website
2. Open the application
3. Enter your license key when prompted
4. Start enjoying professional screen projection!

💡 Need Help?
- Visit our documentation: https://mirrorweb.com/docs
- Contact support: {{support_email}}
- Check our FAQ: https://mirrorweb.com/faq

Best regards,
The {{company_name}} Team

---
This is an automated email. Please do not reply directly.
```

3. **Copy the Template ID**

### **Step 3: Update Configuration**

1. **Open `key-delivery-service.js`**
2. **Replace these values**:
   ```javascript
   this.emailjsConfig = {
       serviceId: 'YOUR_SERVICE_ID',        // ← Replace with your service ID
       templateId: 'YOUR_TEMPLATE_ID',      // ← Replace with your template ID
       publicKey: 'YOUR_PUBLIC_KEY'         // ← Replace with your public key
   };
   ```

### **Step 4: Database Setup**

1. **Run the SQL files in order**:
   ```sql
   -- First: Create/modify Key table
   -- Run: modify_key_table.sql
   
   -- Second: Insert keys
   -- Run: insert_16_digit_keys.sql
   
   -- Third: Create delivery logs table
   -- Run: create_key_delivery_logs.sql
   ```

### **Step 5: Integration**

1. **Include the scripts** in your HTML:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
   <script src="key-delivery-service.js"></script>
   <script src="usage-example.js"></script>
   ```

2. **Call the service** after successful payment:
   ```javascript
   const keyDeliveryService = new KeyDeliveryService();
   
   // After payment success
   const result = await keyDeliveryService.processSuccessfulPayment(
       'user@example.com',
       'John Doe',
       'Pro Package'
   );
   ```

## 🔧 Configuration Details

### **EmailJS Credentials**
- **Public Key**: Found in Account → API Keys
- **Service ID**: Found in Email Services
- **Template ID**: Found in Email Templates

### **Template Variables**
- `{{to_name}}` - User's name
- `{{key_value}}` - The 16-character license key
- `{{package_name}}` - Package name (Pro, Business, etc.)
- `{{company_name}}` - Your company name
- `{{support_email}}` - Support email address

## 📧 Email Template Customization

### **Professional Template Example**:
```html
Subject: 🎉 Your Mirror Web License Key is Ready!

Hi {{to_name}},

🎊 Congratulations! Your purchase is complete and your license key is ready.

📋 Order Details:
   Package: {{package_name}}
   License Key: {{key_value}}
   Purchase Date: {{purchase_date}}

🚀 Next Steps:
   1. Download Mirror Web from mirrorweb.com
   2. Install and launch the application
   3. Enter your license key when prompted
   4. Start mirroring your Android screen to PC!

💎 What You Get:
   • Ultra-low latency screen mirroring
   • HD quality output
   • Recording and streaming features
   • Priority support

📚 Resources:
   • Setup Guide: mirrorweb.com/setup
   • Video Tutorials: mirrorweb.com/tutorials
   • Support: {{support_email}}

Best regards,
The Mirror Web Team
```

## 🧪 Testing

### **Test Key Delivery**:
```javascript
// Test the service
const testResult = await keyDeliveryService.processSuccessfulPayment(
    'test@example.com',
    'Test User',
    'Test Package'
);

console.log('Test result:', testResult);
```

### **Check Database**:
```sql
-- Check available keys
SELECT COUNT(*) FROM "Key" WHERE used = false;

-- Check delivery logs
SELECT * FROM key_delivery_logs ORDER BY delivered_at DESC;
```

## 🚨 Troubleshooting

### **Common Issues**:

1. **"EmailJS not loaded"**:
   - Check if EmailJS script is included
   - Verify script loading order

2. **"Service not found"**:
   - Verify Service ID is correct
   - Check if service is active in EmailJS

3. **"Template not found"**:
   - Verify Template ID is correct
   - Check if template is published

4. **"No unused keys"**:
   - Run the insert script to add more keys
   - Check if all keys are marked as used

### **Debug Mode**:
```javascript
// Enable debug logging
console.log('EmailJS Config:', keyDeliveryService.emailjsConfig);
console.log('Available Keys:', await getAvailableKeysCount());
```

## 📊 Monitoring

### **Track Deliveries**:
```sql
-- Daily delivery count
SELECT 
    DATE(delivered_at) as delivery_date,
    COUNT(*) as keys_delivered,
    package_name
FROM key_delivery_logs 
WHERE status = 'delivered'
GROUP BY DATE(delivered_at), package_name
ORDER BY delivery_date DESC;
```

### **Key Usage Statistics**:
```sql
-- Key usage overview
SELECT 
    COUNT(*) as total_keys,
    SUM(CASE WHEN used = true THEN 1 ELSE 0 END) as used_keys,
    SUM(CASE WHEN used = false THEN 1 ELSE 0 END) as available_keys
FROM "Key";
```

## 🎯 Success Checklist

- [ ] EmailJS account created
- [ ] Email service configured
- [ ] Email template created
- [ ] Configuration updated in code
- [ ] Database tables created
- [ ] Keys inserted
- [ ] Test delivery successful
- [ ] Integration with payment system complete

## 🆘 Support

If you encounter issues:
1. Check EmailJS dashboard for service status
2. Verify all credentials are correct
3. Check browser console for error messages
4. Test with a simple email first
5. Contact EmailJS support if needed

---

**Your key delivery system is now ready! 🎉**
