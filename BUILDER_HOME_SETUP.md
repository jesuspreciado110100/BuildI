# Builder Home Screen Setup Guide

## Overview
The Builder Home screen displays construction projects with filtering by construction type. The system consists of three main components working together.

## Database Schema
The `projects` table uses these key columns:
- **project_id** (uuid) - Primary key
- **name** (text) - Project name
- **description** (text) - Project description
- **status** (text) - Project status (active, pending, completed, on_hold)
- **construction_type** (text) - Type (commercial, residential, infrastructure, etc.)
- **budget** (numeric) - Project budget
- **location** (text) - Project location
- **latitude/longitude** (numeric) - GPS coordinates
- **start_date/end_date** (date) - Project timeline
- **progress** (integer) - Progress percentage (0-100)
- **image_url** (text) - Project image URL
- **created_at/updated_at** (timestamp) - Timestamps

## Component Architecture

### 1. ProjectService (app/services/ProjectService.ts)
Handles all database queries using correct column names:
- `getProjectsByIds()` - Fetches specific projects by UUID
- `getProjects()` - Fetches all projects with optional type filter
- `getNearbyProjects()` - Fetches projects by location
- All queries use `project_id` column (not `id`)

### 2. ConstructionTypesCarousel (app/components/ConstructionTypesCarousel.tsx)
Displays horizontal scrollable cards for filtering:
- Fetches unique construction types from database
- Shows count of projects per type
- Displays background images for each type
- "All Types" option shows total project count
- Triggers filter when type is selected

### 3. ProjectCard (app/components/ProjectCard.tsx)
Displays individual project information:
- Shows project image, name, description
- Displays status, location, budget
- Shows progress bar
- Handles both `project_id` and `id` fields
- Handles both `image_url` and `image` fields

### 4. Builder Home (app/builder/home.tsx)
Main screen that coordinates everything:
- Fetches 3 specific project UUIDs first
- Falls back to all projects if specific ones not found
- Filters by selected construction type
- Maps database fields to component props
- Handles location-based filtering

## Data Flow
1. Home screen loads and fetches specific project IDs
2. ProjectService queries database using `project_id` column
3. ConstructionTypesCarousel fetches and displays available types
4. User selects a construction type
5. Home screen filters projects by selected type
6. ProjectCard displays each filtered project

## The 3 Specific Projects
These UUIDs are hardcoded in the home screen:
- `02467be4-8500-4bed-8066-5c967e454c6b` - Downtown Commercial Tower
- `21fe53d7-0d93-4901-b76d-575611e160b7` - Sunset Valley Residential Community
- `5043c4ce-a8e8-4ce0-9165-14e578aa36b0` - Harbor Bridge Infrastructure Project

## Database Setup
Run the SQL script to insert the 3 projects:
```bash
# The projects have been inserted into the database with:
# - Correct project_id UUIDs
# - Real generated image URLs
# - Complete project data
# - Active status and progress values
```

## Troubleshooting

### "No projects found"
- Check if projects exist in database: `SELECT * FROM projects WHERE project_id IN ('02467be4-8500-4bed-8066-5c967e454c6b', ...)`
- Verify Supabase connection in app/lib/supabase.ts
- Check console for error messages

### ConstructionTypesCarousel empty
- Verify projects have `construction_type` field populated
- Check if carousel is loading (spinner should show)
- Verify images are loading (check network tab)

### Images not showing
- Verify `image_url` column has valid URLs
- Check if CDN URLs are accessible
- ProjectCard handles both `image` and `image_url` fields

## Key Points
✅ Database column is `project_id` (not `id`)
✅ Progress column is `progress` (integer 0-100)
✅ Image column is `image_url` (text)
✅ All 3 components must work together
✅ Projects inserted with real generated images
✅ Construction types filter works automatically
