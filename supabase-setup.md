# FamousAI Construction Platform - Supabase Setup Guide

## New Supabase Project Setup

### 1. Create New Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name: `famousai-construction`
4. Database Password: Generate a secure password
5. Region: Choose closest to your users
6. Click "Create new project"

### 2. Get Project Credentials
After project creation, go to Settings > API:
- Project URL: `https://[your-project-ref].supabase.co`
- Anon/Public Key: Copy the `anon` key

### 3. Update supabase.ts
Replace the values in `app/lib/supabase.ts` with your actual credentials:
```typescript
const supabaseUrl = 'https://[your-project-ref].supabase.co'
const supabaseAnonKey = '[your-anon-key]'
```

### 4. Database Schema
Run these SQL commands in the Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'contractor',
  phone VARCHAR(20),
  company_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sites table
CREATE TABLE sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  owner_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workers table
CREATE TABLE workers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  trade VARCHAR(100),
  hourly_rate DECIMAL(10,2),
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Machinery table
CREATE TABLE machinery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  daily_rate DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials table
CREATE TABLE materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  unit VARCHAR(50),
  price_per_unit DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Enable Row Level Security
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE machinery ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
```

### 6. Authentication Setup
1. Go to Authentication > Settings
2. Enable Email authentication
3. Configure redirect URLs for your app
4. Set up email templates if needed

### 7. Storage Setup (Optional)
1. Go to Storage
2. Create buckets for:
   - `site-photos`
   - `progress-images`
   - `documents`
3. Set appropriate policies for each bucket

### 8. Test Connection
Run the app and test the Supabase connection:
```bash
npm start
```

The app should connect to your new Supabase project successfully.