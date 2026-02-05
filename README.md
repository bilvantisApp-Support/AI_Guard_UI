# AI Guard UI

A modern, enterprise-grade web interface for the AI Guard API management platform. Provides secure, monitored access to multiple AI providers (OpenAI, Anthropic, Google Gemini) with comprehensive project management, usage analytics, and team collaboration features.

## ✨ Features

### 🔐 Authentication & Security
- **Firebase Authentication**: Secure user authentication with multiple providers
- **Personal Access Tokens (PAT)**: Generate scoped tokens for programmatic access
- **Token Rotation**: Secure token refresh mechanism for enhanced security
- **Role-Based Access**: Owner, admin, member permissions
- **API Key Protection**: Encrypted storage with masked display for security

### 🚀 Project Management
- **Multi-Project Support**: Create and manage multiple AI projects
- **Project Scoping**: Scope tokens and permissions to specific projects
- **Team Collaboration**: Invite members with granular role assignments
- **Project Settings**: Configure rate limiting, quotas, and allowed providers
- **Project Analytics**: Comprehensive usage tracking and cost monitoring

### 📊 Usage Analytics & Monitoring
- **Real-Time Usage Tracking**: Monitor requests, tokens, and costs
- **Multi-Timeframe Analytics**: Daily, monthly, and total usage metrics
- **Cost Monitoring**: Track spending across all AI providers
- **Usage History**: Historical data with visual charts and trends
- **Quota Management**: Set and monitor usage limits and quotas

### 🔑 Token Management
- **Personal Access Tokens**: Create tokens with specific permissions and scopes
- **Token Scoping**: Limit tokens to specific projects or grant global access
- **Granular Permissions**: Fine-grained scope control (api:read, api:write, etc.)
- **Token Security**: One-time display during creation, hidden thereafter
- **Token Rotation**: Generate new tokens while invalidating old ones
- **Expiration Control**: Set custom expiration periods (1-365 days or never)

### 🌐 Multi-Provider Support
- **OpenAI Integration**: Full support for GPT models and APIs
- **Anthropic Integration**: Claude models with usage tracking
- **Google Gemini**: Google AI integration with monitoring
- **Unified Interface**: Single dashboard for all AI providers
- **Provider-Specific Analytics**: Usage breakdown by AI provider

### 👥 Team & Collaboration
- **Team Management**: Invite and manage team members
- **Role-Based Permissions**: Granular access control system
- **Member Activity**: Track team member usage and activity
- **Project Sharing**: Collaborate on projects with role-based access

### 🛠 Developer Experience
- **API Debug Tools**: Built-in API testing and debugging interface
- **Comprehensive Documentation**: In-app guides and API references
- **Mock Data Fallback**: Demo mode when backend is unavailable
- **Error Handling**: Graceful error handling with helpful messages

## 🛠 Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Library**: Material-UI (MUI) v6 with modern design system
- **State Management**: React Context + TanStack Query (React Query)
- **Routing**: React Router v6 with nested routing
- **Authentication**: Firebase Auth with token management
- **HTTP Client**: Axios with interceptors and error handling
- **Form Handling**: React Hook Form + Yup validation
- **Date Handling**: date-fns for date formatting and manipulation
- **Code Quality**: ESLint + TypeScript for type safety

## 📋 Prerequisites

- **Node.js**: Version 16 or higher
- **npm**: Package manager
- **Firebase Project**: With Authentication enabled
- **AI Guard Backend**: Server running (default: http://localhost:3000)

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd AI_Guard_UI

# Install dependencies
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

Update `.env` with your Firebase configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id

# API Configuration
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/             # React components
│   ├── auth/              # Authentication (Login, Register)
│   ├── common/            # Shared components (Layout, Navigation)
│   ├── dashboard/         # Dashboard and overview
│   ├── projects/          # Project management (List, Detail, Create)
│   ├── tokens/            # Token management (List, Create, Rotate)
│   ├── analytics/         # Usage analytics and charts
│   ├── teams/             # Team management
│   ├── profile/           # User profile management
│   └── debug/             # API debugging tools
├── contexts/              # React contexts
│   ├── AuthContext.tsx    # Authentication state
│   └── NotificationContext.tsx # Toast notifications
├── hooks/                 # Custom React hooks
│   ├── useAuth.tsx        # Authentication hook
│   └── useNotification.tsx # Notification hook
├── services/              # API services
│   ├── api.ts            # Axios configuration
│   ├── authService.ts    # Authentication API
│   ├── projectService.ts # Project management API
│   ├── userService.ts    # User and token management API
│   └── dashboardService.ts # Dashboard API
├── types/                 # TypeScript type definitions
│   ├── api.ts            # API response types
│   ├── user.ts           # User and token types
│   └── auth.ts           # Authentication types
├── utils/                 # Utility functions
├── config/                # Configuration files
│   └── firebase.ts       # Firebase configuration
├── App.tsx               # Main application component
└── main.tsx              # Application entry point
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |
| `npm run type-check` | Run TypeScript type checking |

## 🔧 API Integration

### Backend Endpoints

The UI integrates with the AI Guard backend API:

- **Authentication**: `/_api/auth/*`
- **Projects**: `/_api/projects/*`
- **Users**: `/_api/users/*`
- **Tokens**: `/_api/users/tokens/*`
- **Analytics**: `/_api/projects/*/usage`
- **Health**: `/_api/health`

### API Headers

All requests include required headers:
- `Content-Type: application/json`
- `Authorization: Bearer <firebase-token>`
- `X-AI-Guard-Provider: web-ui`

## 🔒 Security Features

- **Token Security**: PATs are only displayed once during creation
- **Secure Storage**: API keys encrypted on backend, never stored in browser
- **Role-Based Access**: Granular permissions for project and resource access
- **Token Rotation**: Secure mechanism to refresh tokens without downtime
- **Authentication**: Firebase-based authentication with automatic token refresh
- **Request Validation**: All API requests validated and sanitized

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with desktop optimization
- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Accessibility**: WCAG compliant with keyboard navigation support
- **Loading States**: Skeleton loaders and progress indicators
- **Error Boundaries**: Graceful error handling with recovery options
- **Toast Notifications**: Real-time feedback for user actions

## 🚧 Development Guidelines

### Adding New Features

1. **Component Structure**: Follow the existing folder structure
2. **Type Safety**: Use TypeScript interfaces for all data structures
3. **API Integration**: Add service methods in appropriate service files
4. **Error Handling**: Implement proper error boundaries and fallbacks
5. **Testing**: Add unit tests for complex logic

### Code Style

- **ESLint**: Enforced code quality rules
- **TypeScript**: Strict type checking enabled
- **Imports**: Absolute imports using `@/` alias
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions

### Best Practices

- Use React Query for all API calls
- Implement loading and error states
- Follow Material-UI design system
- Use meaningful commit messages
- Add proper TypeScript types
- Handle edge cases gracefully

## 📈 Performance

- **Code Splitting**: Lazy loading for route-based components
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: React Query for intelligent data caching
- **Image Optimization**: Optimized assets and lazy loading
- **Performance Monitoring**: Core Web Vitals tracking

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Authentication**: Verify Firebase configuration in `.env`
2. **API Connection**: Check backend server status at `/_api/health`
3. **CORS Issues**: Ensure backend allows frontend origin
4. **Build Errors**: Run `npm run type-check` for TypeScript issues

### Debug Mode

Enable API debugging through the Debug menu in the navigation bar to test API connectivity and inspect responses.

## 📄 License

ISC License - See LICENSE file for details

---

**Built with ❤️ using React, TypeScript, and Material-UI**