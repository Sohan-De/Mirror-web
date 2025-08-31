// Debug script to check Key table structure
// Run this in your browser console to see what's wrong

async function debugKeyTableStructure() {
    try {
        console.log('🔍 Debugging Key table structure...');
        
        // Check if supabase is available
        if (typeof supabase === 'undefined') {
            console.error('❌ Supabase not loaded');
            return;
        }
        
        console.log('✅ Supabase loaded');
        
        // Method 1: Try to get table info
        console.log('📋 Checking table structure...');
        const { data: tableInfo, error: tableError } = await supabase
            .from('Key')
            .select('*')
            .limit(1);
        
        if (tableError) {
            console.error('❌ Table error:', tableError);
            console.log('Error code:', tableError.code);
            console.log('Error message:', tableError.message);
            return;
        }
        
        if (tableInfo && tableInfo.length > 0) {
            console.log('✅ Table exists and has data');
            console.log('📊 Sample record:', tableInfo[0]);
            console.log('🔑 Available columns:', Object.keys(tableInfo[0]));
            
            // Check specific columns
            const sample = tableInfo[0];
            console.log('ID column value:', sample.id);
            console.log('Key value column:', sample.key_value);
            console.log('Used column value:', sample.used);
            
        } else {
            console.log('⚠️ Table exists but no data found');
        }
        
        // Method 2: Check if there are any unused keys
        console.log('🔍 Checking for unused keys...');
        const { data: unusedKeys, error: unusedError } = await supabase
            .from('Key')
            .select('*')
            .eq('used', false)
            .limit(5);
        
        if (unusedError) {
            console.error('❌ Error checking unused keys:', unusedError);
        } else {
            console.log(`✅ Found ${unusedKeys.length} unused keys`);
            if (unusedKeys.length > 0) {
                console.log('🔑 First unused key:', unusedKeys[0]);
            }
        }
        
        // Method 3: Count total keys
        console.log('📊 Counting total keys...');
        const { count, error: countError } = await supabase
            .from('Key')
            .select('*', { count: 'exact', head: true });
        
        if (countError) {
            console.error('❌ Error counting keys:', countError);
        } else {
            console.log(`✅ Total keys in table: ${count}`);
        }
        
    } catch (error) {
        console.error('❌ Debug error:', error);
    }
}

// Method 4: Check all tables in database
async function listAllTables() {
    try {
        console.log('📋 Listing all tables...');
        
        // This is a workaround since we can't directly query information_schema
        // Try to access common table names
        const commonTables = ['profiles', 'subscriptions', 'Key', 'key_delivery_logs'];
        
        for (const tableName of commonTables) {
            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .limit(1);
                
                if (error) {
                    console.log(`❌ Table ${tableName}: ${error.message}`);
                } else {
                    console.log(`✅ Table ${tableName}: exists`);
                    if (data && data.length > 0) {
                        console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
                    }
                }
            } catch (e) {
                console.log(`❌ Table ${tableName}: ${e.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ List tables error:', error);
    }
}

// Method 5: Test key delivery step by step
async function testKeyDeliveryStepByStep() {
    try {
        console.log('🧪 Testing key delivery step by step...');
        
        // Step 1: Check if we can access the Key table
        console.log('Step 1: Checking Key table access...');
        const { data: keys, error: keyError } = await supabase
            .from('Key')
            .select('*')
            .limit(1);
        
        if (keyError) {
            console.error('❌ Step 1 failed:', keyError);
            return;
        }
        
        console.log('✅ Step 1 passed: Can access Key table');
        
        // Step 2: Check if there are unused keys
        console.log('Step 2: Checking for unused keys...');
        const { data: unusedKeys, error: unusedError } = await supabase
            .from('Key')
            .select('*')
            .eq('used', false)
            .limit(1);
        
        if (unusedError) {
            console.error('❌ Step 2 failed:', unusedError);
            return;
        }
        
        if (!unusedKeys || unusedKeys.length === 0) {
            console.error('❌ Step 2 failed: No unused keys available');
            return;
        }
        
        console.log('✅ Step 2 passed: Found unused key');
        console.log('Key data:', unusedKeys[0]);
        
        // Step 3: Test marking key as used
        console.log('Step 3: Testing mark key as used...');
        const keyToUpdate = unusedKeys[0];
        
        // Determine ID column
        let idColumn = 'id';
        if (keyToUpdate.key_id !== undefined) idColumn = 'key_id';
        
        const { error: updateError } = await supabase
            .from('Key')
            .update({ used: true, updated_at: new Date().toISOString() })
            .eq(idColumn, keyToUpdate[idColumn]);
        
        if (updateError) {
            console.error('❌ Step 3 failed:', updateError);
            return;
        }
        
        console.log('✅ Step 3 passed: Key marked as used');
        
        // Step 4: Reset key back to unused for testing
        console.log('Step 4: Resetting key back to unused...');
        const { error: resetError } = await supabase
            .from('Key')
            .update({ used: false, updated_at: new Date().toISOString() })
            .eq(idColumn, keyToUpdate[idColumn]);
        
        if (resetError) {
            console.error('❌ Step 4 failed:', resetError);
        } else {
            console.log('✅ Step 4 passed: Key reset to unused');
        }
        
        console.log('🎉 All steps completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Export functions for easy access
window.debugKeyTableStructure = debugKeyTableStructure;
window.listAllTables = listAllTables;
window.testKeyDeliveryStepByStep = testKeyDeliveryStepByStep;

console.log('🔧 Debug functions loaded!');
console.log('Run these in console:');
console.log('1. debugKeyTableStructure() - Check table structure');
console.log('2. listAllTables() - List all tables');
console.log('3. testKeyDeliveryStepByStep() - Test key delivery');
