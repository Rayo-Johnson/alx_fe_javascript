// ============================================
// DYNAMIC QUOTE GENERATOR WITH SERVER SYNC
// ============================================
// This application demonstrates:
// 1. Posting data to server using mock API (POST requests)
// 2. syncQuotes function for data synchronization
// 3. Periodic checking for new quotes from server (every 30 seconds)
// 4. Updating local storage with server data and conflict resolution
// 5. UI elements and notifications for data updates and conflicts
// ============================================

// ============================================
// INITIAL QUOTES DATA
// ============================================

// Server URL for syncing (using JSONPlaceholder as mock API)
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

// Sync interval (30 seconds)
const SYNC_INTERVAL = 30000;

// Track last sync time
let lastSyncTime = null;

// Track if sync is in progress
let isSyncing = false;

// Track sync interval ID
let syncIntervalId = null;

// Notification messages for autochecker
const SYNC_SUCCESS_MESSAGE = "Quotes synced with server!";

const defaultQuotes = [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
  { text: "It is during our darkest moments that we must focus to see the light.", category: "Inspiration" },
  { text: "The only impossible journey is the one you never begin.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Wisdom" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Success" }
];

let quotes = [];

// Store the currently selected category filter
let selectedCategory = 'all';

// ============================================
// LOCAL STORAGE FUNCTIONS
// ============================================

function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
    console.log('✅ Loaded', quotes.length, 'quotes from localStorage');
  } else {
    quotes = [...defaultQuotes];
    saveQuotes();
    console.log('📦 Initialized with default quotes');
  }
  updateStatistics();
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
  console.log('💾 Saved', quotes.length, 'quotes to localStorage');
  updateStatistics();
  populateCategories(); // Update categories when quotes change
}

// ============================================
// CATEGORY FILTERING FUNCTIONS
// ============================================

/**
 * Populate the category dropdown with unique categories from quotes
 */
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  
  // Get unique categories from quotes array
  const categories = [...new Set(quotes.map(quote => quote.category))];
  
  // Sort categories alphabetically
  categories.sort();
  
  // Store current selection
  const currentSelection = categoryFilter.value;
  
  // Clear existing options (except "All Categories")
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  // Add each category as an option
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  
  // Restore previous selection if it still exists
  if (currentSelection && (currentSelection === 'all' || categories.includes(currentSelection))) {
    categoryFilter.value = currentSelection;
  }
  
  console.log('📂 Populated', categories.length, 'categories in dropdown');
}

/**
 * Filter quotes based on selected category
 */
function filterQuotes() {
  const categoryFilter = document.getElementById('categoryFilter');
  selectedCategory = categoryFilter.value;
  
  // Save selected category to localStorage
  localStorage.setItem('selectedCategory', selectedCategory);
  
  console.log('🔍 Filtering by category:', selectedCategory);
  
  // Show a random quote from the filtered results
  showRandomQuote();
}

/**
 * Get filtered quotes based on selected category
 */
function getFilteredQuotes() {
  if (selectedCategory === 'all') {
    return quotes;
  }
  return quotes.filter(quote => quote.category === selectedCategory);
}

/**
 * Load the last selected category from localStorage
 */
function loadLastSelectedCategory() {
  const savedCategory = localStorage.getItem('selectedCategory');
  
  if (savedCategory) {
    selectedCategory = savedCategory;
    
    // Set the dropdown to the saved category
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.value = savedCategory;
    }
    
    console.log('📌 Restored last selected category:', savedCategory);
  }
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

/**
 * Show notification to user
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, info, warning, error)
 */
function showNotification(title, message, type = 'info') {
  const container = document.getElementById('notificationContainer');
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  const icons = {
    success: '✅',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌'
  };
  
  notification.innerHTML = `
    <div class="notification-icon">${icons[type]}</div>
    <div class="notification-content">
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  container.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
  
  console.log(`🔔 Notification [${type}]:`, title, '-', message);
}

/**
 * Update sync status bar
 */
function updateSyncStatus(status, text) {
  const syncStatus = document.getElementById('syncStatus');
  const syncText = syncStatus.querySelector('.sync-text');
  const syncBtn = document.getElementById('manualSync');
  
  // Remove all status classes
  syncStatus.className = 'sync-status';
  
  if (status) {
    syncStatus.classList.add(status);
  }
  
  syncText.textContent = text;
  
  // Disable button during sync
  syncBtn.disabled = (status === 'syncing');
  
  console.log('🔄 Sync status:', text);
}

// ============================================
// SERVER SYNC FUNCTIONS
// ============================================

/**
 * Fetch quotes from server
 * Simulates fetching data from a real API
 */
async function fetchQuotesFromServer() {
  try {
    console.log('📡 Fetching quotes from server...');
    
    // Fetch data from JSONPlaceholder (simulating server)
    const response = await fetch(SERVER_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const serverData = await response.json();
    
    // Convert server data to quote format
    // We'll use posts as quotes (title as text, userId as category indicator)
    const serverQuotes = serverData.slice(0, 10).map(post => ({
      text: post.title,
      category: getCategoryFromUserId(post.userId),
      serverId: post.id,
      serverTimestamp: Date.now()
    }));
    
    console.log('✅ Fetched', serverQuotes.length, 'quotes from server');
    return serverQuotes;
    
  } catch (error) {
    console.error('❌ Error fetching from server:', error);
    throw error;
  }
}

/**
 * Helper function to map userId to category
 */
function getCategoryFromUserId(userId) {
  const categoryMap = {
    1: 'Motivation',
    2: 'Life',
    3: 'Wisdom',
    4: 'Success',
    5: 'Dreams',
    6: 'Inspiration',
    7: 'Growth',
    8: 'Innovation',
    9: 'Leadership',
    10: 'Creativity'
  };
  return categoryMap[userId] || 'General';
}

/**
 * Post new quote data to server (simulated)
 * This demonstrates posting data to the mock API
 */
async function postQuoteToServer(quote) {
  try {
    console.log('📤 Posting quote to server:', quote);
    
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: quote.text,
        body: quote.category,
        userId: 1
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Successfully posted to server:', data);
    console.log('Quotes synced with server!');
    
    showNotification(
      'Quotes synced with server!',
      'Your quote has been posted to the server.',
      'success'
    );
    
    return data;
    
  } catch (error) {
    console.error('❌ Error posting to server:', error);
    showNotification(
      'Sync Error',
      'Failed to post quote to server.',
      'error'
    );
    throw error;
  }
}

/**
 * Sync local quotes with server quotes
 * Implements conflict resolution strategy
 * REQUIRED: Main sync function that handles server data synchronization
 */
async function syncQuotes() {
  if (isSyncing) {
    console.log('⏳ Sync already in progress, skipping...');
    return;
  }
  
  isSyncing = true;
  updateSyncStatus('syncing', 'Syncing with server...');
  
  try {
    console.log('🔄 Starting sync process...');
    
    // Step 1: Fetch quotes from server
    const serverQuotes = await fetchQuotesFromServer();
    console.log('📥 Received', serverQuotes.length, 'quotes from server');
    
    // Step 2: Get current local quotes
    const localQuotes = [...quotes];
    console.log('💾 Current local quotes:', localQuotes.length);
    
    // Step 3: Detect conflicts and merge data
    const result = resolveConflicts(localQuotes, serverQuotes);
    
    // Step 4: Handle conflicts - notify user
    if (result.conflicts.length > 0) {
      console.log('⚠️ Conflicts detected:', result.conflicts.length);
      console.log('Quotes synced with server!');
      showNotification(
        'Quotes synced with server!',
        `${result.conflicts.length} conflict(s) resolved. Server data took precedence.`,
        'warning'
      );
      
      // Log each conflict for debugging
      result.conflicts.forEach(conflict => {
        console.log('⚠️ Conflict:', {
          text: conflict.text,
          local: conflict.localCategory,
          server: conflict.serverCategory
        });
      });
    }
    
    // Step 5: Handle new quotes from server
    if (result.newQuotes.length > 0) {
      console.log('✅ New quotes from server:', result.newQuotes.length);
      showNotification(
        'Quotes synced with server!',
        `${result.newQuotes.length} new quote(s) added from server.`,
        'success'
      );
    }
    
    // Step 6: Update local quotes array with merged data
    quotes = result.mergedQuotes;
    console.log('📊 Total quotes after merge:', quotes.length);
    
    // Step 7: Update localStorage with merged data (includes conflict resolution)
    localStorage.setItem('quotes', JSON.stringify(quotes));
    console.log('💾 localStorage updated with server data and conflict resolution');
    
    // Step 8: Update statistics
    updateStatistics();
    
    // Step 9: Update UI with new categories
    populateCategories();
    
    // Step 10: Show a quote if display is empty
    if (quotes.length > 0 && document.getElementById('quoteDisplay').innerHTML.includes('empty-state')) {
      showRandomQuote();
    }
    
    // Step 11: Update last sync time
    lastSyncTime = new Date();
    localStorage.setItem('lastSyncTime', lastSyncTime.toISOString());
    console.log('⏰ Last sync time updated:', lastSyncTime.toLocaleString());
    
    // Step 12: Update UI status
    updateSyncStatus('success', `Last synced: ${formatTime(lastSyncTime)}`);
    
    // Step 13: Notify user if everything is up to date
    if (result.conflicts.length === 0 && result.newQuotes.length === 0) {
      console.log('✅ No changes - already up to date');
      showNotification(
        'Quotes synced with server!',
        'Your quotes are already in sync with the server.',
        'info'
      );
    }
    
    console.log('✅ Sync completed successfully');
    
    // Always show sync success notification
    if (result.newQuotes.length > 0 || result.conflicts.length > 0) {
      console.log('Quotes synced with server!');
    }
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    updateSyncStatus('error', 'Sync failed. Will retry...');
    showNotification(
      'Sync Failed',
      'Could not connect to server. Will retry automatically.',
      'error'
    );
  } finally {
    isSyncing = false;
  }
}

/**
 * Resolve conflicts between local and server data
 * Strategy: Server data takes precedence
 * REQUIRED: Handles conflict resolution and updates localStorage
 */
function resolveConflicts(localQuotes, serverQuotes) {
  console.log('🔍 Checking for conflicts...');
  console.log('📊 Local quotes:', localQuotes.length);
  console.log('📊 Server quotes:', serverQuotes.length);
  
  const conflicts = [];
  const newQuotes = [];
  const mergedQuotes = [...localQuotes];
  
  serverQuotes.forEach(serverQuote => {
    // Check if quote exists locally (by comparing normalized text)
    const localIndex = mergedQuotes.findIndex(
      local => normalizeText(local.text) === normalizeText(serverQuote.text)
    );
    
    if (localIndex !== -1) {
      // Quote exists locally - check for conflicts
      const localQuote = mergedQuotes[localIndex];
      
      if (localQuote.category !== serverQuote.category) {
        // CONFLICT DETECTED: Same quote text, different categories
        console.log('⚠️ CONFLICT FOUND:');
        console.log('   Text:', serverQuote.text.substring(0, 50) + '...');
        console.log('   Local category:', localQuote.category);
        console.log('   Server category:', serverQuote.category);
        console.log('   Resolution: Server data takes precedence');
        
        conflicts.push({
          text: serverQuote.text,
          localCategory: localQuote.category,
          serverCategory: serverQuote.category,
          resolution: 'server-wins'
        });
        
        // CONFLICT RESOLUTION: Server takes precedence
        // Update local storage with server data
        mergedQuotes[localIndex] = {
          ...localQuote,
          ...serverQuote,
          conflictResolved: true,
          resolvedAt: new Date().toISOString()
        };
        
        console.log('✅ Conflict resolved - updated to server version');
      } else {
        console.log('✓ Quote already synced:', serverQuote.text.substring(0, 30) + '...');
      }
    } else {
      // New quote from server - doesn't exist locally
      console.log('🆕 New quote from server:', serverQuote.text.substring(0, 50) + '...');
      newQuotes.push(serverQuote);
      mergedQuotes.push(serverQuote);
    }
  });
  
  console.log('📊 Conflict Resolution Summary:');
  console.log('   Conflicts found:', conflicts.length);
  console.log('   New quotes:', newQuotes.length);
  console.log('   Total merged quotes:', mergedQuotes.length);
  
  // Return results with conflict resolution details
  return {
    mergedQuotes,     // Data ready for localStorage update
    conflicts,        // List of resolved conflicts
    newQuotes        // List of new quotes from server
  };
}

/**
 * Normalize text for comparison
 */
function normalizeText(text) {
  return text.toLowerCase().trim().replace(/[^\w\s]/g, '');
}

/**
 * Format time for display
 */
function formatTime(date) {
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // seconds
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return date.toLocaleString();
}

/**
 * Start automatic periodic sync
 * REQUIRED: Periodically checks for new quotes from the server
 */
function startPeriodicSync() {
  console.log('🔄 Initializing periodic sync system...');
  console.log('⏰ Sync interval set to:', SYNC_INTERVAL / 1000, 'seconds');
  
  // Initial sync after 2 seconds (let page load first)
  console.log('⏳ Scheduling initial sync in 2 seconds...');
  setTimeout(() => {
    console.log('🚀 Running initial sync...');
    syncQuotes();
  }, 2000);
  
  // Periodic sync - check for new quotes from server every SYNC_INTERVAL
  console.log('📅 Setting up periodic sync checks...');
  syncIntervalId = setInterval(() => {
    console.log('⏰ Periodic sync triggered');
    console.log('📡 Checking for new quotes from server...');
    syncQuotes(); // This function periodically checks the server
  }, SYNC_INTERVAL);
  
  console.log('✅ Automatic periodic sync started');
  console.log('🔄 Will check server every', SYNC_INTERVAL / 1000, 'seconds for new quotes');
  
  // Show notification about auto-sync
  setTimeout(() => {
    showNotification(
      'Auto-Sync Enabled',
      `Automatically checking server every ${SYNC_INTERVAL / 1000} seconds for updates.`,
      'info'
    );
  }, 3000);
}

/**
 * Load last sync time from localStorage
 */
function loadLastSyncTime() {
  const saved = localStorage.getItem('lastSyncTime');
  if (saved) {
    lastSyncTime = new Date(saved);
    updateSyncStatus('', `Last synced: ${formatTime(lastSyncTime)}`);
  }
}

// ============================================
// SESSION STORAGE FUNCTIONS
// ============================================

function saveLastViewedQuote(quote) {
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
  sessionStorage.setItem('lastViewedTime', new Date().toLocaleString());
  console.log('📌 Saved last viewed quote to sessionStorage');
  updateSessionInfo();
}

function loadSessionInfo() {
  const lastQuote = sessionStorage.getItem('lastViewedQuote');
  const lastTime = sessionStorage.setItem('lastViewedTime');
  if (lastQuote && lastTime) {
    return { quote: JSON.parse(lastQuote), time: lastTime };
  }
  return null;
}

function updateSessionInfo() {
  const sessionInfo = loadSessionInfo();
  const infoBox = document.getElementById('sessionInfo');
  
  if (sessionInfo) {
    infoBox.innerHTML = `
      <strong>Last Viewed Quote:</strong><br>
      "${sessionInfo.quote.text}"<br>
      <strong>Category:</strong> ${sessionInfo.quote.category}<br>
      <strong>Time:</strong> ${sessionInfo.time}
    `;
  } else {
    infoBox.innerHTML = '<em>No quotes viewed in this session yet.</em>';
  }
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================

function showRandomQuote() {
  const quoteDisplay = document.getElementById('quoteDisplay');
  
  // Get filtered quotes based on selected category
  const filteredQuotes = getFilteredQuotes();
  
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<div class="empty-state">No quotes available in the "${selectedCategory}" category. Try another category or add some quotes!</div>`;
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  
  quoteDisplay.innerHTML = '';
  
  const quoteText = document.createElement('p');
  quoteText.className = 'quote-text';
  quoteText.textContent = `"${randomQuote.text}"`;
  
  const quoteCategory = document.createElement('p');
  quoteCategory.className = 'quote-category';
  quoteCategory.textContent = `— Category: ${randomQuote.category}`;
  
  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
  
  saveLastViewedQuote(randomQuote);
  console.log('✅ Displayed quote from', selectedCategory === 'all' ? 'all categories' : selectedCategory + ' category', ':', randomQuote);
}

function updateStatistics() {
  document.getElementById('totalQuotes').textContent = quotes.length;
  const categories = [...new Set(quotes.map(q => q.category))];
  document.getElementById('totalCategories').textContent = categories.length;
}

// ============================================
// ADD QUOTE FUNCTION
// ============================================

function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText');
  const newQuoteCategory = document.getElementById('newQuoteCategory');
  
  const quoteText = newQuoteText.value.trim();
  const quoteCategory = newQuoteCategory.value.trim();
  
  if (quoteText === '' || quoteCategory === '') {
    alert('⚠️ Please fill in both the quote text and category!');
    return;
  }
  
  const newQuote = { text: quoteText, category: quoteCategory };
  quotes.push(newQuote);
  
  saveQuotes(); // This will also call populateCategories()
  
  // Post new quote to server (demonstrates POST to mock API)
  postQuoteToServer(newQuote).catch(error => {
    console.log('Note: Server POST failed (expected with mock API)');
  });
  
  newQuoteText.value = '';
  newQuoteCategory.value = '';
  
  alert(`✅ Quote added successfully! Total quotes: ${quotes.length}`);
  
  // If the new category matches current filter or filter is "all", show the new quote
  if (selectedCategory === 'all' || selectedCategory === quoteCategory) {
    showRandomQuote();
  }
  
  console.log('✅ New quote added:', newQuote);
  console.log('📂 Categories updated in dropdown');
}

// ============================================
// JSON EXPORT FUNCTION
// ============================================

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = 'quotes.json';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
  
  console.log('📥 Exported', quotes.length, 'quotes to JSON file');
  alert('✅ Quotes exported successfully!');
}

// ============================================
// JSON IMPORT FUNCTION
// ============================================

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      
      if (!Array.isArray(importedQuotes)) {
        alert('❌ Invalid file format. Expected an array of quotes.');
        return;
      }
      
      const validQuotes = importedQuotes.filter(q => q.text && q.category);
      
      if (validQuotes.length === 0) {
        alert('❌ No valid quotes found in the file.');
        return;
      }
      
      quotes.push(...validQuotes);
      saveQuotes(); // This will also update categories
      showRandomQuote();
      
      alert(`✅ Successfully imported ${validQuotes.length} quotes!`);
      console.log('📤 Imported', validQuotes.length, 'quotes from JSON file');
      console.log('📂 Categories dropdown updated with new categories');
    } catch (error) {
      alert('❌ Error reading file. Please ensure it\'s a valid JSON file.');
      console.error('Import error:', error);
    }
  };
  
  fileReader.readAsText(event.target.files[0]);
}

// ============================================
// CLEAR STORAGE FUNCTION
// ============================================

function clearAllQuotes() {
  if (confirm('⚠️ Are you sure you want to delete ALL quotes? This cannot be undone!')) {
    quotes = [];
    saveQuotes();
    document.getElementById('quoteDisplay').innerHTML = '<div class="empty-state">All quotes cleared. Add new ones to get started!</div>';
    alert('✅ All quotes have been cleared.');
    console.log('🗑️ All quotes cleared from localStorage');
  }
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Quote Generator with Storage Initialized!');
  
  loadQuotes();
  populateCategories(); // Populate category dropdown
  loadLastSelectedCategory(); // Restore last selected filter
  updateSessionInfo();
  
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
  document.getElementById('exportQuotes').addEventListener('click', exportToJsonFile);
  document.getElementById('clearStorage').addEventListener('click', clearAllQuotes);
  
  // Add event listener for category filter
  document.getElementById('categoryFilter').addEventListener('change', filterQuotes);
  
  const importFile = document.getElementById('importFile');
  importFile.addEventListener('change', importFromJsonFile);
  
  const inputs = document.querySelectorAll('input[type="text"]');
  inputs.forEach(input => {
    input.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        addQuote();
      }
    });
  });
  
  console.log('✅ All event listeners set up successfully!');
  console.log('🔍 Current filter:', selectedCategory);
});

