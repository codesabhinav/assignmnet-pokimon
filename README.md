# Pokédex - Resource Explorer

A modern, polished React application that explores the Pokémon universe with excellent UX, built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Requirements ✅
- **Pokémon List View**: Browse all Pokémon with beautiful cards and pagination
- **Detail View**: Comprehensive Pokémon details with stats, abilities, and types
- **Search & Filter**: Debounced search by name, filter by type and generation
- **Sorting**: Multiple sort options (name, ID, height, weight)
- **Favorites**: Toggle and persist favorites in localStorage
- **URL State Management**: Shareable URLs that reflect current state
- **Error Handling**: Graceful error states with retry functionality
- **Loading States**: Beautiful skeleton loaders and loading animations

### Nice-to-Have Features ✅
- **React Query Integration**: Client-side caching and background refetching
- **Optimistic UI**: Instant favorite toggles with smooth animations
- **Responsive Design**: Mobile-first design that works on all devices
- **Accessibility**: Keyboard navigation, focus management, and semantic HTML

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom gradients and animations
- **Data Fetching**: TanStack Query (React Query) with caching
- **HTTP Client**: Axios with interceptors for error handling
- **State Management**: URL-based state with custom hooks
- **Icons**: Custom SVG icons and Heroicons

## 🏗️ Architecture

### File Structure
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main Pokémon list page
│   └── pokemon/[id]/      # Dynamic Pokémon detail routes
├── components/            # Reusable UI components
│   ├── pokemon-card.tsx   # Pokémon card component
│   ├── pokemon-modal.tsx  # Detail modal component
│   └── search-filters.tsx # Search and filter controls
├── hooks/                 # Custom React hooks
│   ├── use-characters.ts  # Pokémon data fetching hooks
│   └── use-url-state.ts   # URL state management
├── lib/                   # Utility libraries
│   ├── api.ts            # API client and endpoints
│   ├── favorites.ts      # LocalStorage favorites manager
│   └── utils.ts          # Utility functions
├── providers/            # React context providers
│   └── query-provider.tsx # React Query provider
└── types/                # TypeScript type definitions
    └── api.ts            # API response types
```

### Key Design Decisions

1. **URL as Source of Truth**: All search, filter, sort, and pagination state is reflected in the URL for shareability and browser navigation.

2. **Component Boundaries**: Clear separation between data fetching (hooks), business logic (lib), and presentation (components).

3. **Error Handling**: Comprehensive error handling with user-friendly messages and retry mechanisms.

4. **Performance**: 
   - Debounced search to reduce API calls
   - React Query for intelligent caching
   - Optimistic UI updates for favorites
   - Image optimization with Next.js Image component

5. **Accessibility**: 
   - Semantic HTML structure
   - Keyboard navigation support
   - Focus management
   - Screen reader friendly

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd resource-explorer
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#3B82F6 to #8B5CF6)
- **Secondary**: Purple gradient (#8B5CF6 to #EC4899)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Neutral**: Gray scale (#F9FAFB to #111827)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold weights with gradient text effects
- **Body**: Regular weight for readability

### Components
- **Cards**: Rounded corners (2xl), subtle shadows, hover effects
- **Buttons**: Gradient backgrounds, rounded corners, smooth transitions
- **Inputs**: Backdrop blur effects, focus rings, rounded corners

## 🔧 API Integration

### Pokémon API (PokeAPI)
- **Base URL**: `https://pokeapi.co/api/v2`
- **Endpoints**:
  - `/pokemon` - List Pokémon with pagination
  - `/pokemon/{id}` - Individual Pokémon details
  - `/type` - Pokémon types for filtering

### Data Flow
1. **List View**: Fetches paginated Pokémon list
2. **Search**: Client-side filtering by name
3. **Type Filter**: Server-side filtering by Pokémon type
4. **Detail View**: Fetches complete Pokémon data with stats and abilities

## 🎯 Key Features Explained

### URL State Management
The app uses a custom `useURLState` hook that:
- Parses URL parameters on initial load
- Updates URL when state changes
- Maintains browser history for back/forward navigation
- Ensures shareable links

### Favorites System
- **Storage**: localStorage with fallback handling
- **Persistence**: Survives page reloads and browser restarts
- **Optimistic Updates**: Instant UI feedback with error handling
- **Sync**: Favorites are available across all views

### Error Handling
- **Network Errors**: User-friendly messages with retry buttons
- **404 Errors**: Graceful handling for missing Pokémon
- **API Errors**: Centralized error handling with axios interceptors
- **Fallbacks**: Graceful degradation when features fail

### Performance Optimizations
- **Debounced Search**: 300ms delay to reduce API calls
- **React Query**: Intelligent caching and background refetching
- **Image Optimization**: Next.js Image component with proper sizing
- **Code Splitting**: Dynamic imports for detail routes

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Search functionality with debouncing
- [ ] Filter by type and generation
- [ ] Sorting by various criteria
- [ ] Pagination navigation
- [ ] Favorite toggling and persistence
- [ ] Detail view navigation
- [ ] URL state persistence
- [ ] Error handling and retry
- [ ] Mobile responsiveness
- [ ] Keyboard navigation

### Future Testing Improvements
- **Unit Tests**: Jest + React Testing Library for components
- **Integration Tests**: API integration testing
- **E2E Tests**: Playwright for critical user flows
- **Accessibility Tests**: Automated a11y testing

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. Deploy automatically on push to main branch

### Environment Variables
No environment variables required for this project.

## 📈 Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🔮 Future Enhancements

### Phase 2 Features
1. **Dark Mode**: Theme toggle with persistent preference
2. **Virtual Scrolling**: For better performance with large lists
3. **Advanced Filters**: More filter options (abilities, stats ranges)
4. **Pokémon Comparisons**: Side-by-side comparison tool
5. **User Notes**: Add personal notes to favorite Pokémon

### Technical Improvements
1. **Service Worker**: Offline support with cached data
2. **Progressive Web App**: Installable app experience
3. **Advanced Caching**: More sophisticated caching strategies
4. **Analytics**: User behavior tracking and insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **PokeAPI**: For providing the comprehensive Pokémon data
- **Next.js Team**: For the excellent React framework
- **Tailwind CSS**: For the utility-first CSS framework
- **TanStack**: For React Query and excellent developer tools

---

Built with ❤️ using modern web technologies and best practices.
