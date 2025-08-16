# Subscription Management Setup Guide

This guide explains how to set up the subscription management system for Mirror Web.

## 1. Create Subscription Tables in Supabase

First, you need to create the subscription tables in your Supabase database:

1. Log in to your Supabase dashboard at https://app.supabase.io/
2. Select your project
3. Go to the "SQL Editor" section
4. Create a new query
5. Copy and paste the entire contents of the `create_subscription_table.sql` file
6. Click "Run" to execute the SQL

This will create:
- `subscription_packages` table - Stores subscription plan details
- `user_subscriptions` table - Tracks which users have which subscriptions
- RLS policies for secure access
- Helper functions for managing subscriptions

## 2. Connect the Admin Dashboard

The admin dashboard is already connected to these tables via the `subscription-manager.js` file. This file handles:

- Loading subscription packages from the database
- Displaying them in the admin dashboard
- Adding, editing, and deleting subscription packages
- Loading subscription analytics

## 3. Testing the Setup

After running the SQL script, you should:

1. Open the admin dashboard
2. Go to the "Subscription" tab
3. Verify that the three default plans (Free, Pro, Business) are displayed
4. Try editing one of the plans
5. Try adding a new plan
6. Check that the subscription analytics are displayed correctly

## 4. Understanding the Database Schema

### subscription_packages Table
- `id`: UUID - Unique identifier for the package
- `name`: VARCHAR - Name of the package (e.g., "Free", "Pro", "Business")
- `price`: DECIMAL - Price of the package
- `billing_cycle`: VARCHAR - Billing cycle (monthly, yearly, one-time, na)
- `features`: JSONB - Array of features included in the package
- `status`: VARCHAR - Status of the package (active, inactive, coming-soon)
- `created_at`: TIMESTAMP - When the package was created
- `updated_at`: TIMESTAMP - When the package was last updated

### user_subscriptions Table
- `id`: UUID - Unique identifier for the subscription
- `user_id`: UUID - Reference to auth.users table
- `package_id`: UUID - Reference to subscription_packages table
- `status`: VARCHAR - Status of the subscription (active, cancelled, expired, trial)
- `start_date`: TIMESTAMP - When the subscription started
- `end_date`: TIMESTAMP - When the subscription ends (null for active subscriptions)
- `created_at`: TIMESTAMP - When the subscription was created
- `updated_at`: TIMESTAMP - When the subscription was last updated

## 5. Implementing Payment Processing

This setup does not include payment processing. To implement payments:

1. Choose a payment processor (e.g., Stripe, PayPal)
2. Create a payment processing API endpoint
3. Update the subscription system to handle payment events
4. Add webhooks to handle subscription lifecycle events

## 6. Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Verify that the SQL script executed successfully
3. Check that the RLS policies are correctly set up
4. Ensure your Supabase client has the correct URL and API key

For more help, refer to the Supabase documentation on RLS policies and database schema design.
