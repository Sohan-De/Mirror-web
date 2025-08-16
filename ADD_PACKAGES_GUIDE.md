# How to Add 3 New Subscription Packages

You have 2 options to add the 3 new subscription packages (Free, Pro, Business):

## Option 1: Use the Admin Dashboard (Recommended)

1. **Log in to your admin dashboard** as an admin user
2. **Go to the "Subscription" tab**
3. **Click "Add New Plan" button**
4. **Add each package one by one:**

### Package 1: Free
- **Plan Name**: Free
- **Price**: 0
- **Billing Cycle**: na
- **Features**: 
  - Basic screen sharing
  - Up to 3 devices
  - 720p resolution
  - Standard support
- **Status**: active

### Package 2: Pro
- **Plan Name**: Pro
- **Price**: 9.99
- **Billing Cycle**: monthly
- **Features**:
  - Advanced screen sharing
  - Up to 10 devices
  - 1080p resolution
  - Recording feature
  - Priority support
  - Custom branding
- **Status**: active

### Package 3: Business
- **Plan Name**: Business
- **Price**: 29.99
- **Billing Cycle**: monthly
- **Features**:
  - Premium screen sharing
  - Unlimited devices
  - 4K resolution
  - Recording & editing features
  - Priority support
  - Custom branding
  - Analytics dashboard
  - Team management
- **Status**: active

## Option 2: Run SQL Script

If you prefer to use SQL directly:

1. **Go to your Supabase dashboard**
2. **Navigate to SQL Editor**
3. **Create a new query**
4. **Copy and paste the contents of `add_new_packages.sql`**
5. **Click "Run"**

## After Adding Packages

Once you've added the packages:

1. **Refresh your admin dashboard** - you should see all 3 packages in the Subscription tab
2. **Go to your home page** - the pricing section should automatically show the 3 new packages
3. **Test the functionality** - try editing, deleting, and adding packages to make sure everything works

## Features Included

Each package includes relevant features for screen sharing and collaboration:

- **Free**: Basic functionality for casual users
- **Pro**: Enhanced features for professionals
- **Business**: Enterprise-level features for teams and businesses

The packages will automatically appear on your home page pricing section and can be managed through the admin dashboard.
