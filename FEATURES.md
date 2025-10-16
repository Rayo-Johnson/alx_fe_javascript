# Dynamic Quote Generator - Features

## Core Features

### 1. Quote Display
- Display random quotes from the collection
- Show quote text and category
- Refresh to see different quotes

### 2. Data Persistence
- **Local Storage**: Quotes saved permanently
- **Session Storage**: Tracks last viewed quote
- Survives browser restarts

### 3. Import/Export
- Export quotes to JSON file
- Import quotes from JSON file
- Backup and restore functionality

### 4. Category Filtering ⭐ NEW
- Filter quotes by category
- Dynamic category dropdown
- Filter preference saved across sessions
- Real-time category updates

## How to Use

### Filtering Quotes
1. Use the dropdown menu to select a category
2. Click "Show New Quote" to see quotes from that category
3. Select "All Categories" to see quotes from all categories
4. Your filter choice is automatically saved

### Adding Quotes
1. Enter quote text and category
2. Click "Add Quote"
3. New category automatically appears in filter dropdown
4. Quote is immediately filterable

## Technical Details

- **localStorage** for permanent data storage
- **sessionStorage** for temporary session data
- **Dynamic DOM manipulation** for category dropdown
- **Event-driven architecture** for real-time updates

## Browser Compatibility
- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Opera: ✅ Fully supported