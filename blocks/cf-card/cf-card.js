import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Get locale from current URL path
 * @returns {string} The locale code (defaults to 'en')
 */
function getLocaleFromURL() {
  const currentPath = window.location.pathname;
  
  // Extract language from URL structure like /france/fr/ or /es/es/
  if (currentPath.startsWith('/france/fr/')) return 'fr';
  if (currentPath.startsWith('/es/es/')) return 'es';
  if (currentPath.startsWith('/de/de/')) return 'de';
  if (currentPath.startsWith('/uae/ar/')) return 'ar';
  
  // Default to English for all other cases
  return 'en';
}

/**
 * Check if we're in Universal Editor environment
 * @returns {boolean} True if in Universal Editor
 */
function isUniversalEditor() {
  // Check for Universal Editor specific indicators
  return window.location.pathname.includes('/content/emirates/') || 
         window.location.search.includes('wcmmode=edit') ||
         window.parent !== window || // Running in iframe
         document.querySelector('script[src*="universal-editor"]') !== null;
}

/**
 * Fetch teaser data from GraphQL endpoint
 * @param {string} slug - The teaser slug
 * @param {string} locale - The locale code
 * @returns {Promise} The fetch promise
 */
async function fetchTeaserData(slug, locale) {
  // Use author endpoint in Universal Editor, publish endpoint otherwise
  const isUE = isUniversalEditor();
  const baseUrl = isUE 
    ? 'https://author-p135360-e1341441.adobeaemcloud.com' 
    : 'https://publish-p135360-e1341441.adobeaemcloud.com';
  
  const endpoint = `${baseUrl}/graphql/execute.json/emirates/get-teaser-by-slug;slug=${slug};locale=${locale};`;
  
  console.log(`CF-Card: Using ${isUE ? 'author' : 'publish'} endpoint: ${endpoint}`);
  
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching teaser data:', error);
    throw error;
  }
}

/**
 * Create a card element from teaser data
 * @param {Object} teaserItem - The teaser data item
 * @returns {HTMLElement} The card list item element
 */
function createCard(teaserItem) {
  const li = document.createElement('li');
  li.className = 'cf-card-card';
  
  // Create image section
  if (teaserItem.primaryImage && teaserItem.primaryImage._dynamicUrl) {
    const imageDiv = document.createElement('div');
    imageDiv.className = 'cf-card-card-image';
    
    // Create optimized picture element
    const img = document.createElement('img');
    img.src = teaserItem.primaryImage._dynamicUrl;
    img.alt = teaserItem.title || '';
    img.loading = 'lazy';
    
    const optimizedPic = createOptimizedPicture(
      teaserItem.primaryImage._dynamicUrl, 
      teaserItem.title || '', 
      false, 
      [{ width: '750' }]
    );
    
    imageDiv.appendChild(optimizedPic);
    li.appendChild(imageDiv);
  }
  
  // Create content section
  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'cf-card-card-body';
  
  // Add pre-title if available
  if (teaserItem.preTitle) {
    const preTitle = document.createElement('p');
    preTitle.className = 'cf-card-pre-title';
    preTitle.textContent = teaserItem.preTitle;
    bodyDiv.appendChild(preTitle);
  }
  
  // Add title
  if (teaserItem.title) {
    const title = document.createElement('h3');
    title.className = 'cf-card-title';
    title.textContent = teaserItem.title;
    bodyDiv.appendChild(title);
  }
  
  // Add description
  if (teaserItem.description && teaserItem.description.html) {
    const description = document.createElement('div');
    description.className = 'cf-card-description';
    description.innerHTML = teaserItem.description.html;
    bodyDiv.appendChild(description);
  }
  
  li.appendChild(bodyDiv);
  return li;
}

/**
 * Show loading state
 * @param {HTMLElement} block - The block element
 */
function showLoading(block) {
  block.innerHTML = '<div class="cf-card-loading">Loading...</div>';
}

/**
 * Show error state
 * @param {HTMLElement} block - The block element
 * @param {string} message - Error message
 */
function showError(block, message) {
  block.innerHTML = `<div class="cf-card-error">Error: ${message}</div>`;
}

/**
 * Main decoration function
 * @param {HTMLElement} block - The cf-cards block element
 */
export default async function decorate(block) {
  // Extract slug from the first cell in the block
  const slugCell = block.querySelector('div:first-child');
  if (!slugCell) {
    showError(block, 'No slug configuration found');
    return;
  }
  
  const slug = slugCell.textContent.trim();
  if (!slug) {
    showError(block, 'Empty slug configuration');
    return;
  }
  
  // Get locale from URL
  const locale = getLocaleFromURL();
  
  console.log(`CF-Card: Loading teaser with slug="${slug}" and locale="${locale}"`);
  
  // Show loading state
  showLoading(block);
  
  try {
    // Fetch teaser data
    const response = await fetchTeaserData(slug, locale);
    
    // Check if we have valid data
    if (!response.data || !response.data.emiratesEmailTeaserList || !response.data.emiratesEmailTeaserList.items) {
      throw new Error('Invalid response structure');
    }
    
    const teasers = response.data.emiratesEmailTeaserList.items;
    
    if (teasers.length === 0) {
      throw new Error(`No teaser found for slug "${slug}" and locale "${locale}"`);
    }
    
    // Clear loading state and create cards container
    block.textContent = '';
    const ul = document.createElement('ul');
    ul.className = 'cf-card-list';
    
    // Create card for each teaser (usually just one)
    teasers.forEach((teaserItem) => {
      const card = createCard(teaserItem);
      moveInstrumentation(block.firstElementChild, card);
      ul.appendChild(card);
    });
    
    block.appendChild(ul);
    
  } catch (error) {
    console.error('CF-Card error:', error);
    showError(block, error.message);
  }
}