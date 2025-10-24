# Construction Management Platform - Deployment Guide

## System Overview

A comprehensive multi-role construction management platform built with React Native and Expo, featuring:

- **Contractor Dashboard**: Project management, worker coordination, portfolio tracking
- **Worker/Labor Chief Interface**: Job applications, progress tracking, performance metrics
- **Machinery Renter Portal**: Equipment listings, booking management, response tracking
- **Material Supplier Hub**: Catalog management, quote processing, inventory tracking
- **Admin Panel**: User management, system analytics, dispute resolution

## Architecture

```
├── frontend/          # React Native UI components and screens
├── backend/           # Services, API logic, database interactions
├── shared/            # Common types, enums, utilities
├── ai/                # Future AI models and ML pipelines
└── app/               # Main application code (legacy structure)
```

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g @expo/cli`)
- EAS CLI for production builds (`npm install -g eas-cli`)
- Supabase account for backend services

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create `.env.local` file:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### 3. Start Development Server
```bash
# Web development
npm run web

# Mobile development (iOS/Android)
npm run start
npm run ios     # iOS simulator
npm run android # Android emulator
```

## Build Process

### Web Build (Local)
```bash
npm run build
# Outputs to dist/ directory
```

### Mobile Build (EAS)
```bash
# Configure EAS
eas build:configure

# Build for all platforms
eas build --platform all

# Build for specific platform
eas build --platform ios
eas build --platform android
```

## Database Setup

### Supabase Configuration
1. Create new Supabase project
2. Run SQL migrations from `backend/migrations/`
3. Configure Row Level Security (RLS)
4. Set up storage buckets for file uploads

### Seed Mock Data
```bash
# TODO: Implement seeding script
# npm run seed:dev
```

## Deployment Targets

### Web Deployment
- **Platform**: Vercel, Netlify, or custom hosting
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`
- **Environment Variables**: Set in hosting platform

### Mobile Deployment
- **iOS**: App Store via EAS Submit
- **Android**: Google Play Store via EAS Submit
- **Internal Testing**: EAS Build + TestFlight/Internal Testing

### EAS Submit Commands
```bash
# Submit to app stores
eas submit --platform ios
eas submit --platform android

# Internal distribution
eas build --platform all --profile preview
```

## Environment Configurations

### Development
- Local Supabase instance or development project
- Debug logging enabled
- Hot reload and fast refresh

### Staging
- Staging Supabase project
- Production-like data
- Performance monitoring

### Production
- Production Supabase project
- Error tracking (Sentry)
- Analytics integration
- Performance optimization

## Key Features

### Core Functionality
- Multi-role authentication and authorization
- Real-time notifications and messaging
- File upload and document management
- Payment processing integration
- Offline mode support

### Advanced Features
- Portfolio performance analytics
- Delay tracking and forecasting
- Labor benchmarking and performance metrics
- Machinery rental with response time tracking
- Material catalog and quote management

## Monitoring and Maintenance

### Performance Monitoring
- Bundle size analysis
- Load time optimization
- Memory usage tracking

### Error Tracking
- Crash reporting
- User feedback collection
- Performance issue alerts

### Updates and Maintenance
- Over-the-air updates via EAS Update
- Database migration scripts
- Dependency security updates

## Support and Documentation

- **Technical Issues**: Check logs in Supabase dashboard
- **Build Issues**: Refer to EAS build logs
- **Performance Issues**: Use React Native performance profiler

## Security Considerations

- Row Level Security (RLS) enabled on all tables
- API key rotation schedule
- User data encryption
- Secure file upload validation

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Platform**: React Native + Expo + Supabase