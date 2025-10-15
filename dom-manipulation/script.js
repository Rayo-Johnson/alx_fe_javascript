// ============================================
// STEP 1: CREATE THE QUOTES DATABASE
// ============================================

// This is our array of quote objects
// Each quote has 'text' and 'category' properties
let quotes = [
  {
    text: "The only way to do great work is to love what you do.",
    category: "Motivation"
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    category: "Life"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    category: "Dreams"
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    category: "Inspiration"
  },
  {
    text: "The only impossible journey is the one you never begin.",
    category: "Motivation"
  },
  {
    text: "In the middle of difficulty lies opportunity.",
    category: "Wisdom"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    category: "Success"
  }
];


// ============================================
// STEP 2: FUNCTION TO SHOW A RANDOM QUOTE
// ============================================

/**
 * This function displays a random quote from our quotes array
 * It uses DOM manipulation to create and display the quote
 */
function showRandomQuote() {
  // Get the display area element by its ID
  const quoteDisplay = document.getElementById('quoteDisplay');
  
  // Check if we have any quotes
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = '<div class="empty-state">No quotes available. Add some quotes first!</div>';
    return;
  }
  
  // Generate a random index number between 0 and quotes.length-1
  const randomIndex = Math.floor(Math.random() * quotes.length);
  
  // Get the random quote using the random index
  const randomQuote = quotes[randomIndex];
  
  // CLEAR the previous content
  quoteDisplay.innerHTML = '';
  
  // CREATE a new paragraph element for the quote text
  const quoteText = document.createElement('p');
  quoteText.className = 'quote-text';
  quoteText.textContent = `"${randomQuote.text}"`;
  
  // CREATE a new paragraph element for the category
  const quoteCategory = document.createElement('p');
  quoteCategory.className = 'quote-category';
  quoteCategory.textContent = `— Category: ${randomQuote.category}`;
  
  // APPEND both elements to the display area
  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
  
  console.log('✅ Displayed quote:', randomQuote);
}


// ============================================
// STEP 3: FUNCTION TO ADD NEW QUOTES
// ============================================

/**
 * This function adds a new quote to the quotes array
 * It gets values from the input fields and creates a new quote object
 */
function addQuote() {
  // GET the input elements by their IDs
  const newQuoteText = document.getElementById('newQuoteText');
  const newQuoteCategory = document.getElementById('newQuoteCategory');
  
  // GET the values that the user typed
  const quoteText = newQuoteText.value.trim();
  const quoteCategory = newQuoteCategory.value.trim();
  
  // VALIDATE: Check if both fields have content
  if (quoteText === '' || quoteCategory === '') {
    alert('⚠️ Please fill in both the quote text and category!');
    return;
  }
  
  // CREATE a new quote object
  const newQuote = {
    text: quoteText,
    category: quoteCategory
  };
  
  // ADD the new quote to our quotes array
  quotes.push(newQuote);
  
  // CLEAR the input fields (reset them)
  newQuoteText.value = '';
  newQuoteCategory.value = '';
  
  // Show success message
  alert(`✅ Quote added successfully! Total quotes: ${quotes.length}`);
  
  // Automatically show the newly added quote
  showRandomQuote();
  
  console.log('✅ New quote added:', newQuote);
  console.log('📚 Total quotes now:', quotes.length);
}


// ============================================
// STEP 4: FUNCTION TO CREATE ADD QUOTE FORM
// ============================================

/**
 * This function dynamically creates the form for adding quotes
 * (In our case, the form is already in HTML, but this shows how to do it)
 */
function createAddQuoteForm() {
  // This is already handled in our HTML, but here's how you'd do it programmatically:
  
  /*
  const container = document.body;
  
  const formDiv = document.createElement('div');
  formDiv.className = 'add-quote-section';
  
  const heading = document.createElement('h2');
  heading.textContent = '📝 Add Your Own Quote';
  
  const inputText = document.createElement('input');
  inputText.id = 'newQuoteText';
  inputText.type = 'text';
  inputText.placeholder = 'Enter a new quote';
  
  const inputCategory = document.createElement('input');
  inputCategory.id = 'newQuoteCategory';
  inputCategory.type = 'text';
  inputCategory.placeholder = 'Enter quote category';
  
  const addButton = document.createElement('button');
  addButton.textContent = '➕ Add Quote';
  addButton.onclick = addQuote;
  
  formDiv.appendChild(heading);
  formDiv.appendChild(inputText);
  formDiv.appendChild(inputCategory);
  formDiv.appendChild(addButton);
  
  container.appendChild(formDiv);
  */
  
  console.log('ℹ️ Add quote form is already in HTML');
}


// ============================================
// STEP 5: SET UP EVENT LISTENERS
// ============================================

/**
 * This code runs when the page loads
 * It sets up event listeners for our buttons
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Quote Generator Initialized!');
  console.log('📚 Starting with', quotes.length, 'quotes');
  
  // GET the "Show New Quote" button
  const newQuoteButton = document.getElementById('newQuote');
  
  // ADD a click event listener to it
  newQuoteButton.addEventListener('click', showRandomQuote);
  
  // GET the "Add Quote" button
  const addQuoteButton = document.getElementById('addQuoteBtn');
  
  // ADD a click event listener to it
  addQuoteButton.addEventListener('click', addQuote);
  
  // BONUS: Allow pressing Enter key in input fields to add quote
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        addQuote();
      }
    });
  });
  
  console.log('✅ Event listeners set up successfully!');
});


// ============================================
// BONUS: ADDITIONAL HELPER FUNCTIONS
// ============================================

/**
 * Function to get all unique categories from quotes
 */
function getCategories() {
  const categories = quotes.map(quote => quote.category);
  return [...new Set(categories)]; // Remove duplicates
}

/**
 * Function to filter quotes by category
 */
function getQuotesByCategory(category) {
  return quotes.filter(quote => quote.category === category);
}

// Log available categories when page loads
setTimeout(() => {
  console.log('📂 Available categories:', getCategories());
}, 1000);

