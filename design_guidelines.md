# Design Guidelines: Glovo-Style Delivery Courier App

## Design Approach
**Reference-Based: Glovo Courier Interface**
This is a mobile-first delivery courier tracking application inspired by Glovo's clean, functional courier interface with emphasis on map visibility and quick-action accessibility.

## Core Design Principles
- **Mobile-Only**: Designed exclusively for phone viewports (no desktop adaptation needed)
- **Map-First**: Full-screen map as primary interface element
- **Speed**: All critical actions accessible within 1 tap
- **Minimal Chrome**: UI elements overlay map, don't compete with it
- **High Contrast**: Clear markers and status indicators for outdoor visibility

## Layout System

**Spacing Units**: Use Tailwind units of 2, 4, 6, and 8 (p-2, m-4, gap-6, etc.)

**Screen Structure**:
- Full viewport map (100vh)
- Floating UI elements overlay map
- Bottom sliding panel (40-60% viewport height when expanded)
- Side drawer menu (80% viewport width)

## Typography

**Font Stack**: System fonts for speed
- Primary: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

**Hierarchy**:
- Order titles: text-xl font-bold
- Customer names: text-lg font-semibold
- Addresses: text-sm font-medium
- Status labels: text-xs font-semibold uppercase tracking-wide
- Order items: text-sm font-normal
- Prices: text-base font-semibold

## Component Library

### Map Interface
- **Full-screen map container**: Fills entire viewport with Google Maps/Leaflet integration
- **Courier marker**: Blue pulsing dot with circular ripple animation (16px diameter)
- **Restaurant marker**: Green icon (24px) - shop/storefront symbol
- **Customer marker**: Black icon (24px) - person/pin symbol
- **Route lines**: Bold green polyline (4px stroke) from courier → restaurant → customer

### Top Bar (Floating over map)
- **Position**: Absolute top, full width with px-4 py-3
- **Background**: White with subtle shadow (shadow-lg) and backdrop-blur
- **Layout**: Flex row with space-between
  - Left: Burger menu icon (24px)
  - Center: Status badge (Online/Offline pill with dot indicator)
  - Right: Support/headphones icon (24px)

### Status Badge
- **Online**: Green background (bg-green-500), white text, green dot
- **Offline**: Gray background (bg-gray-400), white text, gray dot
- **Style**: Rounded-full px-4 py-2, text-sm font-semibold, flex items with gap-2

### Bottom Sliding Panel (Order Card)
- **Container**: Fixed bottom, rounded-t-3xl, white background, shadow-2xl
- **Drag handle**: Centered gray bar (w-12 h-1) at top
- **Padding**: p-6
- **States**: 
  - Collapsed: Shows customer name + address only (h-32)
  - Expanded: Shows full order details (min-h-96)

**Panel Content Structure**:
1. Customer name (text-xl font-bold mb-2)
2. Delivery address (text-sm text-gray-600 mb-4)
3. Action buttons row (flex gap-3 mb-6):
   - Call button: Green circle (bg-green-500, 48px diameter, phone icon)
   - Message button: Gray circle (bg-gray-200, 48px diameter, chat icon)
4. Restaurant section:
   - Name (text-base font-semibold mb-2)
   - Address (text-sm text-gray-500)
5. Order items list:
   - Each item: flex justify-between, text-sm, border-b py-3
   - Item name on left, price on right
6. Total (text-lg font-bold, flex justify-between, pt-4)
7. Payment method badge (inline-flex bg-gray-100 px-3 py-1 rounded-full text-xs)
8. Primary action button (full width, h-14, rounded-xl, text-base font-semibold)

### Primary Action Buttons
- **Accept Order**: Green (bg-green-500 hover:bg-green-600), white text
- **Confirm Delivery**: Black (bg-black hover:bg-gray-900), white text
- **Style**: Rounded-xl shadow-lg active:scale-98 transition

### Burger Menu (Side Drawer)
- **Container**: Fixed left, h-full, w-80, white background, shadow-2xl
- **Overlay**: Semi-transparent black backdrop (bg-black/50)
- **Items**: 
  - Each menu item: flex items-center gap-3 px-6 py-4 hover:bg-gray-50
  - Icon (20px) + text (text-base font-medium)
  - Border-b for separation

**Menu Options**:
- Add Order
- Change Courier Data
- Add Restaurant Marker
- Remove Restaurant Marker
- Add Customer Marker
- Remove Customer Marker

### Floating Navigation Button
- **Position**: Fixed bottom-right (mb-24 mr-4)
- **Style**: Circular white button (56px diameter), blue arrow/navigation icon, shadow-xl
- **Purpose**: Opens external navigation app

### Modals/Dialogs
**Confirmation Modal**:
- Centered overlay with backdrop (bg-black/60)
- White card: rounded-2xl p-6 max-w-sm
- Title: text-lg font-bold mb-2
- Message: text-sm text-gray-600 mb-6
- Buttons row: flex gap-3
  - Confirm: bg-black text-white px-6 py-3 rounded-xl
  - Cancel: bg-gray-200 text-gray-800 px-6 py-3 rounded-xl

### Add Order Form
- **Container**: White background, p-6, rounded-t-3xl (if bottom sheet) or full screen
- **Input fields**: 
  - Each input: border border-gray-300 rounded-xl px-4 py-3 text-base mb-4
  - Labels: text-sm font-medium text-gray-700 mb-2
- **Field groups**:
  1. Restaurant (name, address)
  2. Delivery (address, house, apartment, floor)
  3. Customer (name, ID)
  4. Order (number, price, payment method)
  5. Comments (textarea)
- **Submit button**: Full-width green button at bottom

### Status Indicators
- **New**: Red dot or badge (bg-red-500)
- **Accepted**: Yellow (bg-yellow-500)
- **In Transit**: Green (bg-green-500)
- **Delivered**: Checkmark with green (text-green-600)

Display as small pills: `rounded-full px-3 py-1 text-xs font-semibold`

## Interaction Patterns

1. **Map interactions**: Standard pinch-zoom, pan, marker tap
2. **Bottom panel**: Swipe up/down to expand/collapse
3. **Order acceptance**: Single tap on "Accept" button
4. **Delivery confirmation**: Tap → Modal appears → Confirm
5. **Menu**: Tap burger → Slide in from left
6. **Call/Message**: Direct tap on circular buttons

## Images
No hero images needed - this is a map-based utility application. All visual focus is on the interactive map with live markers and routes.