# Local Rental UI

Interactive web interface for the Local Rental API with map visualization using MapLibre GL.

## Features

- **Interactive Map**: MapLibre GL-powered map showing property locations
- **Property List**: Searchable and filterable sidebar with property listings
- **Detailed View**: Comprehensive property information panel
- **Statistics Dashboard**: Aggregated statistics by district, municipality, and type
- **Type-Safe API**: Auto-generated TypeScript types from OpenAPI spec
- **Responsive Design**: Modern UI built with React, TypeScript, and Tailwind CSS

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **MapLibre GL** - Map visualization
- **openapi-typescript** - Auto-generated API types
- **openapi-fetch** - Type-safe API client

## Quick Start

### Prerequisites

- Node.js 20+
- npm
- Running API instance (see `../localRentalApi`)

### Development

```bash
# Install dependencies
npm install

# Generate TypeScript types from OpenAPI spec
npm run generate-types

# Start development server
npm run dev
```

The app will be available at http://localhost:8085

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Docker

### Build and run with Docker Compose

From the project root:

```bash
# Build and start all services (postgres, api, ui)
docker-compose up -d

# View logs
docker-compose logs -f ui

# Access the UI
open http://localhost:8085
```

### Build standalone Docker image

```bash
# Build
docker build -t local-rental-ui .

# Run
docker run -p 8085:80 local-rental-ui
```

## Configuration

### Environment Variables

Create a `.env` file (see `.env.example`):

```env
VITE_API_URL=http://localhost:8087
```

**Note**: In development, API requests use the proxy configured in `vite.config.ts`. In production with Docker, nginx proxies `/api/*` to the API service.

## API Integration

The UI automatically generates TypeScript types from the API's OpenAPI spec:

```bash
# Regenerate types when API changes
npm run generate-types
```

This creates `src/types/api.ts` with full type definitions for all API endpoints and models.

## Project Structure

```
local-rental-ui/
├── src/
│   ├── components/          # React components
│   │   ├── Map.tsx         # MapLibre GL map
│   │   ├── PropertyList.tsx # Sidebar with filters
│   │   ├── PropertyDetail.tsx # Detail panel
│   │   └── StatsPanel.tsx  # Statistics dashboard
│   ├── services/
│   │   └── api.ts          # API client
│   ├── types/
│   │   └── api.ts          # Auto-generated types
│   ├── App.tsx             # Main application
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                  # Static assets
├── Dockerfile              # Multi-stage Docker build
├── nginx.conf              # Nginx configuration
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
└── tsconfig.json           # TypeScript config
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Type-check TypeScript
- `npm run generate-types` - Generate API types from OpenAPI spec
- `npm run convert-swagger` - Convert Swagger 2.0 to OpenAPI 3.0

## Map Features

- **Satellite Imagery**: High-resolution satellite view with ESRI World Imagery
- **Place Labels**: Overlay showing boundaries and place names
- **Enhanced Markers**: Larger markers (16px) with glow effects for better visibility
- **Click to Select**: Click markers to view property details
- **Auto-fit Bounds**: Map automatically fits to show all properties
- **Fly-to Animation**: Smooth animation when selecting properties
- **Color Coding**: Selected property highlighted in red with pulse effect
- **Zoom Controls**: Navigation controls in top-right corner

## Search & Filtering

Filter properties by:
- District (Distrito)
- Municipality (Concelho)
- Type (Modalidade)
- Capacity (min/max)
- Geographic bounds (via API)

## Statistics

View aggregated data:
- Total number of properties
- Average capacity
- Distribution by property type
- Top 10 districts
- Top 15 municipalities

## Browser Support

Modern browsers with ES2020+ support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Development Tips

### Hot Module Replacement

Vite provides instant HMR during development. Changes to React components update immediately without page refresh.

### API Proxy

In development, `vite.config.ts` proxies `/api/*` requests to `http://localhost:8087` to avoid CORS issues.

### Type Safety

The entire application is fully typed. API responses, request parameters, and component props all have TypeScript types auto-generated from the OpenAPI spec.

### Debugging

Use React DevTools and browser DevTools. The development build includes source maps for easy debugging.

## Troubleshooting

**API connection errors**:
- Ensure the API is running on port 8087
- Check `VITE_API_URL` environment variable
- Verify nginx proxy configuration in Docker

**Map not loading**:
- Check browser console for errors
- Ensure MapLibre GL CSS is loaded
- Verify properties have valid latitude/longitude

**Build errors**:
- Delete `node_modules` and run `npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Regenerate types: `npm run generate-types`

## License

Same as parent project
