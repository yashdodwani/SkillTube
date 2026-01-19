# SkillVid Frontend

A modern React frontend for the SkillVid AI-powered course generator. This application provides a clean, intuitive interface for transforming YouTube videos into interactive learning experiences.

## Features

- **Modern UI**: Built with React 18, TypeScript, and Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Progress**: Live updates during course generation
- **Interactive Quizzes**: Engaging quiz interface with immediate feedback
- **Video Integration**: Embedded YouTube player with section navigation
- **Progress Tracking**: Visual progress indicators and completion status

## Tech Stack

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **Lucide React** - Beautiful icon library

## Prerequisites

- Node.js 16+ 
- npm 8+
- Backend API running on `http://localhost:8000`

## Installation

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Button, Input, etc.)
│   │   └── Layout.tsx      # Main layout component
│   ├── pages/              # Page components
│   │   ├── Home.tsx        # Landing page with URL input
│   │   └── Course.tsx      # Interactive course interface
│   ├── services/           # API services
│   │   └── api.ts          # Backend API integration
│   ├── types/              # TypeScript type definitions
│   │   └── api.ts          # API response types
│   ├── utils/              # Utility functions
│   │   ├── cn.ts           # Class name utility
│   │   └── youtube.ts      # YouTube URL helpers
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # App entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## API Integration

The frontend communicates with the FastAPI backend through these endpoints:

- `POST /api/course/process-complete` - Start course generation
- `GET /api/course/status/{taskId}` - Check generation progress
- `POST /api/course/chunks` - Generate video chunks
- `POST /api/course/quiz` - Generate quiz questions

## Configuration

### Vite Proxy

The development server is configured to proxy API requests to the backend:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    }
  }
}
```

### Environment Variables

No environment variables are required for the frontend. All configuration is handled through the Vite proxy.

## Usage

1. **Enter YouTube URL**: Paste any YouTube video URL on the home page
2. **Select Difficulty**: Choose Easy (3 questions), Medium (4 questions), or Hard (5 questions)
3. **Generate Course**: Click "Generate Course" to start the AI processing
4. **Track Progress**: Monitor real-time progress during generation
5. **Learn Interactively**: Navigate through sections, watch video segments, and complete quizzes

## Components

### UI Components

- **Button**: Flexible button component with variants and loading states
- **Input**: Form input with validation and helper text
- **Card**: Container component for content sections
- **Progress**: Visual progress indicator
- **Toast**: Notification system for user feedback

### Pages

- **Home**: Landing page with URL input form and feature showcase
- **Course**: Interactive learning interface with video player and quizzes

## Styling

The application uses Tailwind CSS with a custom design system:

- **Primary Colors**: Blue gradient (primary-50 to primary-900)
- **Typography**: Inter font family
- **Components**: Utility classes for consistent styling
- **Responsive**: Mobile-first responsive design

## Development

### Adding New Components

1. Create component in `src/components/`
2. Export from component file
3. Import and use in pages or other components

### API Integration

1. Define types in `src/types/api.ts`
2. Add API methods to `src/services/api.ts`
3. Use in components with proper error handling

### Styling Guidelines

- Use Tailwind utility classes
- Follow the established color scheme
- Ensure responsive design
- Add hover and focus states for interactive elements

## Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Deployment

The built application can be deployed to any static hosting service:

- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

Make sure to configure the backend API URL for production deployment.