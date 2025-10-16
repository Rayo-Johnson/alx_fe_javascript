// ============================================
// INITIAL QUOTES DATA
// ============================================

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
