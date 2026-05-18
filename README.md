# Budget Planner

A high-performance, minimalist budget planning web application built with Next.js 15, MongoDB, and Redux Toolkit.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **State Management**: Redux Toolkit & TanStack Query
- **Styling**: Tailwind CSS 4 (Minimalist B&W Theme)
- **Auth**: NextAuth.js
- **Charts**: Recharts

## Features
- **Authentication**: Secure JWT-based login and registration.
- **Dashboard**: Real-time financial summary with spending charts.
- **Transactions**: Full CRUD for income and expenses with categorization.
- **Budgets**: Set monthly limits per category with progress tracking.
- **Dark Mode**: Minimalist theme with seamless light/dark switching.
- **Responsive**: Optimized for Mobile, Tablet, and Desktop.

## Getting Started

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Set up Environment Variables**
   Create a `.env.local` file with the following:
   ```env
   MONGODB_URI=your_mongodb_uri
   NEXTAUTH_SECRET=your_secret
   NEXTAUTH_URL=http://localhost:3000
   ```
4. **Run the development server**
   ```bash
   npm run dev
   ```

## Folder Structure
- `src/app`: Routes and API endpoints.
- `src/components`: Reusable UI components and layouts.
- `src/models`: Mongoose schemas.
- `src/store`: Redux toolkit configuration.
- `src/providers`: Client-side providers for Auth, Redux, and Query.
- `src/lib`: Shared utilities and database connection.
