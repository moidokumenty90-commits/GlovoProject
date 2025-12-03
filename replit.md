# Courier Delivery System (Glovo-style)

## Overview
A mobile-first courier delivery application similar to Glovo. Built for couriers to manage deliveries with real-time map tracking, order management, and route navigation.

## Tech Stack
- **Frontend**: React + TypeScript + TailwindCSS + ShadcnUI
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Simple username/password (session-based)
- **Maps**: Leaflet with OpenStreetMap tiles

## Project Structure
```
client/src/
├── components/
│   ├── ui/              # ShadcnUI components
│   ├── MapView.tsx      # Interactive map with markers and routes
│   ├── TopBar.tsx       # Status toggle and menu button
│   ├── OrderPanel.tsx   # Sliding order details panel
│   ├── BurgerMenu.tsx   # Side navigation drawer
│   ├── StatusBadge.tsx  # Online/Offline and order status badges
│   ├── ConfirmDialog.tsx # Delivery confirmation modals
│   ├── NavigationButton.tsx # Google Maps navigation link
│   └── MarkerDialog.tsx # Add/delete map markers
├── pages/
│   ├── landing.tsx      # Login page for unauthenticated users
│   ├── home.tsx         # Main map screen with orders
│   ├── settings.tsx     # Courier settings and markers management
│   └── add-order.tsx    # Create new order form
├── hooks/
│   ├── useAuth.ts       # Authentication hook
│   └── use-toast.ts     # Toast notifications
└── lib/
    ├── queryClient.ts   # TanStack Query setup
    ├── utils.ts         # Utility functions
    └── authUtils.ts     # Auth error utilities

server/
├── db.ts               # Database connection
├── storage.ts          # Database operations
├── routes.ts           # API endpoints
├── authConfig.ts       # Login credentials (username: "courier", password: "glovo123")
├── simpleAuth.ts       # Session-based authentication
└── index.ts            # Server entry

shared/
└── schema.ts           # Database schema and types
```

## Key Features
1. **Real-time Map**: Full-screen map with courier (blue), restaurant (green), and customer (black) markers
2. **Order Management**: Accept orders, track status (New → Accepted → In Transit → Delivered)
3. **Route Navigation**: Visual route and Google Maps integration
4. **Courier Status**: Toggle Online/Offline
5. **Marker Management**: Save and delete restaurant/customer locations
6. **Order Creation**: Admin form to create new orders

## Authentication
Login credentials are stored in `server/authConfig.ts`:
- Default username: `courier`
- Default password: `glovo123`

To change credentials, edit the `AUTH_CREDENTIALS` object in that file.

## Database Schema
- `users`: System users
- `couriers`: Courier profiles and status
- `orders`: Delivery orders with items and status
- `markers`: Saved map markers

## API Endpoints
- `GET /api/auth/user` - Current user
- `GET /api/courier` - Current courier profile
- `PATCH /api/courier` - Update courier
- `PATCH /api/courier/status` - Toggle online/offline
- `PATCH /api/courier/location` - Update GPS location
- `GET /api/orders` - List orders
- `GET /api/orders/active` - Current active order
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status
- `GET /api/markers` - List saved markers
- `POST /api/markers` - Create marker
- `DELETE /api/markers/:id` - Delete marker

## Running the App
The app runs on port 5000 with `npm run dev`

## Design Language
- Mobile-first responsive design
- Green primary color (#22C55E) for branding
- White cards with subtle shadows
- Rounded corners (rounded-xl, rounded-2xl)
- Full-screen map as primary interface
