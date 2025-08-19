// EmailJS Troubleshooting Script
// Run this to debug why emails aren't working

class EmailJSTroubleshooter {
    constructor() {
        this.serviceId = 'Key-service';
        this.templateId = 'template_qic08qk';
        this.publicKey = 'e58yoorl3LASDk8bj';
    }

    // Test 1: Check if EmailJS is loaded
    checkEmailJSLoaded() {
        console.log('=== EmailJS Load Check ===');
        if (typeof emailjs !== 'undefined') {
            console.log('✅ EmailJS is loaded');
            console.log('EmailJS version:', emailjs.version);
            return true;
        } else {
            console.error('❌ EmailJS is NOT loaded');
            console.log('Make sure you include: <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>');
            return false;
        }
    }

    // Test 2: Initialize EmailJS
    async initializeEmailJS() {
        console.log('=== EmailJS Initialization ===');
        try {
            emailjs.init(this.publicKey);
            console.log('✅ EmailJS initialized with public key:', this.publicKey);
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize EmailJS:', error);
            return false;
        }
    }

    // Test 3: Check service availability
    async checkServiceAvailability() {
        console.log('=== Service Availability Check ===');
        try {
            // Try to get service info
            const response = await emailjs.send(
                this.serviceId,
                this.templateId,
                { test: 'test' },
                this.publicKey
            );
            console.log('✅ Service test successful:', response);
            return true;
        } catch (error) {
            console.error('❌ Service test failed:', error);
            console.log('Common issues:');
            console.log('1. Service ID is incorrect');
            console.log('2. Service is not active');
            console.log('3. Template ID is incorrect');
            console.log('4. Public key is wrong');
            return false;
        }
    }

    // Test 4: Send test email
    async sendTestEmail() {
        console.log('=== Test Email Send ===');
        try {
            const templateParams = {
                to_email: 'test@example.com',
                to_name: 'Test User',
                key_value: 'TEST1234567890123',
                package_name: 'Test Package',
                company_name: 'Mirror Web',
                support_email: 'support@mirrorweb.com',
                purchase_date: new Date().toLocaleDateString()
            };

            console.log('Sending test email with params:', templateParams);

            const response = await emailjs.send(
                this.serviceId,
                this.templateId,
                templateParams,
                this.publicKey
            );

            console.log('✅ Test email sent successfully!');
            console.log('Response:', response);
            return true;
        } catch (error) {
            console.error('❌ Test email failed:', error);
            console.log('Error details:', error);
            return false;
        }
    }

    // Test 5: Check all configurations
    async runAllTests() {
        console.log('🚀 Starting EmailJS Troubleshooting...');
        console.log('=====================================');

        const tests = [
            { name: 'EmailJS Load Check', test: () => this.checkEmailJSLoaded() },
            { name: 'EmailJS Initialization', test: () => this.initializeEmailJS() },
            { name: 'Service Availability', test: () => this.checkServiceAvailability() },
            { name: 'Test Email Send', test: () => this.sendTestEmail() }
        ];

        for (const test of tests) {
            console.log(`\n🔄 Running: ${test.name}`);
            const result = await test.test();
            console.log(`${result ? '✅' : '❌'} ${test.name}: ${result ? 'PASSED' : 'FAILED'}`);
        }

        console.log('\n=====================================');
        console.log('🏁 Troubleshooting Complete!');
    }

    // Quick fix: Try alternative email method
    async sendEmailAlternative() {
        console.log('=== Trying Alternative Email Method ===');
        try {
            const response = await emailjs.sendForm(
                this.serviceId,
                this.templateId,
                {
                    to_email: 'test@example.com',
                    to_name: 'Test User',
                    key_value: 'TEST1234567890123',
                    package_name: 'Test Package'
                },
                this.publicKey
            );
            console.log('✅ Alternative method successful:', response);
            return true;
        } catch (error) {
            console.error('❌ Alternative method failed:', error);
            return false;
        }
    }
}

// Create global instance for easy access
window.EmailJSTroubleshooter = EmailJSTroubleshooter;

// Auto-run troubleshooting if this script is loaded
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        console.log('📧 EmailJS Troubleshooter loaded!');
        console.log('Run this in console: new EmailJSTroubleshooter().runAllTests()');
    });
}
