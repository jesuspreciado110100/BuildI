# React Native Expo App

This is a React Native application built with Expo and TypeScript.

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. **IMPORTANT: Initialize Git Repository**
   
   The EAS CLI requires a version control system. Run this command to initialize git:
   ```bash
   chmod +x init-git.sh
   ./init-git.sh
   ```
   
   Or manually:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

4. Initialize EAS project:
   ```bash
   npx eas project:init --non-interactive --force
   ```

### Development

- Start the development server:
  ```bash
  npm start
  ```

- Run on specific platforms:
  ```bash
  npm run android
  npm run ios
  npm run web
  ```

### Troubleshooting

If you encounter the error:
```
Using EAS CLI without version control system is not recommended
Error: project:init command failed
```

This means git is not initialized. Run the init-git.sh script or manually initialize git as shown above.

## Project Structure

- `app/` - Main application code
- `app/components/` - Reusable UI components
- `app/services/` - Business logic and API services
- `app/types.ts` - TypeScript type definitions