# Cursor Rules for Frontend Development

## Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API and external service integrations
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
├── styles/        # Global styles and theme
├── context/       # React context providers
└── assets/        # Static assets
```

## Naming Conventions

### Files and Directories
- Use camelCase for all files



### Variables and Functions
- Use camelCase for variables and functions
- Boolean variables should be prefixed with 'is', 'has', or 'should': `isLoading`, `hasError`
- Event handlers should be prefixed with 'handle': `handleClick`, `handleSubmit`
- Async functions should be prefixed with 'async': `async fetchData`

## Code Style

### TypeScript
- Always define types for props
- Use interfaces for object types
- Use type for unions and intersections
- Avoid using `any` type
- Use proper type imports: `import type { User } from './types'`

### React Components
- Use functional components with hooks
- Keep components small and focused
- Use destructuring for props
- Implement proper prop types
- Use React.memo for performance optimization when needed

### Styling
- Use Material-UI components when possible
- Follow BEM naming convention for custom CSS
- Use CSS-in-JS for component-specific styles
- Keep styles close to components

## Best Practices

### State Management
- Use React Context for global state
- Use local state for component-specific state
- Implement proper loading and error states
- Use proper state initialization

### API Calls
- Create service files for API calls
- Implement proper error handling
- Use proper loading states
- Implement retry logic for failed requests
- Use proper caching strategies

### Performance
- Implement proper code splitting
- Use React.memo for expensive components
- Implement proper lazy loading
- Use proper image optimization
- Implement proper caching strategies

### Security
- Implement proper input validation
- Use proper authentication
- Implement proper authorization
- Use proper error handling
- Implement proper data sanitization

### Testing
- Write unit tests for utilities
- Write component tests
- Write integration tests
- Use proper test naming conventions
- Implement proper test coverage

## Git Workflow

### Branch Naming
- feature/feature-name
- bugfix/bug-name
- hotfix/issue-name
- release/version-number

### Commit Messages
- Use present tense
- Start with a verb
- Keep it short and descriptive
- Reference issue numbers when applicable

## Documentation

### Code Comments
- Use JSDoc for function documentation
- Comment complex logic
- Keep comments up to date
- Use proper comment formatting

### README
- Keep README up to date
- Include setup instructions
- Include development guidelines
- Include deployment instructions

## Dependencies

### Core
- React
- TypeScript
- Material-UI
- React Router
- Axios/Fetch

### Development
- ESLint
- Prettier
- Jest
- React Testing Library
- Vite

## Environment Variables
- Use proper naming convention: `VITE_API_URL`
- Keep sensitive data in .env files
- Document all environment variables
- Use proper validation for environment variables

## Error Handling
- Implement proper error boundaries
- Use proper error messages
- Implement proper error logging
- Use proper error recovery

## Accessibility
- Use proper ARIA labels
- Implement proper keyboard navigation
- Use proper color contrast
- Implement proper screen reader support

## Internationalization
- Use proper i18n library
- Keep translations organized
- Use proper date formatting
- Use proper number formatting

## Monitoring
- Implement proper error tracking
- Use proper analytics
- Implement proper logging
- Use proper performance monitoring

## Styling Guidelines

### Color System
- Base Colors:
  - Background: `#0f172a` (dark mode)
  - Paper: `#1e293b` (dark mode)
  - Text Primary: `#f8fafc`
  - Text Secondary: `#94a3b8`

### Department-Specific Gradients
- Marketing: `linear-gradient(45deg, #6366f1, #ec4899)` (Indigo to Pink)
- Sales: `linear-gradient(45deg, #10b981, #3b82f6)` (Emerald to Blue)
- Social: `linear-gradient(45deg, #f59e0b, #ef4444)` (Amber to Red)
- Others: `linear-gradient(45deg, #8b5cf6, #10b981)` (Purple to Emerald)
- Analytics: `linear-gradient(45deg, #8b5cf6, #10b981)` (Purple to Emerald)
- Home: `linear-gradient(45deg, #8b5cf6, #ec4899)` (Purple to Pink)

### Component Styling
- Buttons:
  ```typescript
  sx={{
    background: 'linear-gradient(45deg, [primary], [secondary])',
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 500,
    padding: '8px 16px',
    '&:hover': {
      opacity: 0.9,
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba([primary], 0.2)',
    },
    transition: 'all 0.2s ease-in-out',
  }}
  ```

- Cards:
  ```typescript
  sx={{
    background: 'rgba(30, 41, 59, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
  }}
  ```

- Text Fields:
  ```typescript
  sx={{
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '[primary]',
      },
    },
  }}
  ```

### Typography
- Headings:
  ```typescript
  sx={{
    background: 'linear-gradient(45deg, [primary], [secondary])',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 700,
  }}
  ```

- Body Text:
  ```typescript
  sx={{
    color: 'rgba(255, 255, 255, 0.7)',
  }}
  ```

### Layout
- Container:
  ```typescript
  sx={{
    maxWidth: 800, // or 1200 for wider layouts
    mx: 'auto',
    p: 3,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  }}
  ```

- Navbar:
  ```typescript
  sx={{
    background: 'transparent',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(8px)',
  }}
  ```

### Animations
- Page Transitions:
  ```typescript
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  ```

### Alerts
- Error Alert:
  ```typescript
  sx={{
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
  }}
  ```

### Dialog/Modal
- Paper Props:
  ```typescript
  PaperProps={{
    sx: {
      background: 'rgba(30, 41, 59, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
  }}
  ```

### Best Practices
1. Use Material-UI's `sx` prop for component-specific styles
2. Keep gradients consistent within each department
3. Use rgba colors for overlays and transparency
4. Implement proper dark mode support
5. Use backdrop-filter for glass morphism effects
6. Maintain consistent spacing using MUI's spacing system
7. Use proper typography hierarchy
8. Implement proper hover and focus states
9. Use proper transitions for interactive elements
10. Maintain consistent border radius across components 