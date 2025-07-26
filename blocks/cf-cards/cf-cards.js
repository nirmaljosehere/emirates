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
  
  console.log(`CF-Cards: Using ${isUE ? 'author' : 'publish'} endpoint for slug "${slug}"`);
  
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching teaser data for slug "${slug}":`, error);
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
  li.className = 'cf-cards-card';
  
  // Create image section
  if (teaserItem.primaryImage && teaserItem.primaryImage._dynamicUrl) {
    const imageDiv = document.createElement('div');
    imageDiv.className = 'cf-cards-card-image';
    
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
  bodyDiv.className = 'cf-cards-card-body';
  
  // Add pre-title if available
  if (teaserItem.preTitle) {
    const preTitle = document.createElement('p');
    preTitle.className = 'cf-cards-pre-title';
    preTitle.textContent = teaserItem.preTitle;
    bodyDiv.appendChild(preTitle);
  }
  
  // Add title
  if (teaserItem.title) {
    const title = document.createElement('h3');
    title.className = 'cf-cards-title';
    title.textContent = teaserItem.title;
    bodyDiv.appendChild(title);
  }
  
  // Add description
  if (teaserItem.description && teaserItem.description.html) {
    const description = document.createElement('div');
    description.className = 'cf-cards-description';
    description.innerHTML = teaserItem.description.html;
    bodyDiv.appendChild(description);
  }
  
  li.appendChild(bodyDiv);
  return li;
}

/**
 * Create loading placeholder for a card
 * @param {string} slug - The slug being loaded
 * @returns {HTMLElement} The loading placeholder element
 */
function createLoadingCard(slug) {
  const li = document.createElement('li');
  li.className = 'cf-cards-card cf-cards-loading';
  li.innerHTML = `
    <div class="cf-cards-card-body">
      <p>Loading "${slug}"...</p>
    </div>
  `;
  return li;
}

/**
 * Create error placeholder for a card
 * @param {string} slug - The slug that failed
 * @param {string} error - The error message
 * @returns {HTMLElement} The error placeholder element
 */
function createErrorCard(slug, error) {
  const li = document.createElement('li');
  li.className = 'cf-cards-card cf-cards-error';
  li.innerHTML = `
    <div class="cf-cards-card-body">
      <h3 class="cf-cards-title">Error Loading "${slug}"</h3>
      <p class="cf-cards-description">${error}</p>
    </div>
  `;
  return li;
}

/**
 * Create configuration placeholder for an unconfigured CF Card
 * @returns {HTMLElement} The configuration placeholder element
 */
function createConfigurationPlaceholder() {
  const li = document.createElement('li');
  li.className = 'cf-cards-card cf-cards-placeholder';
  li.innerHTML = `
    <div class="cf-cards-card-body">
      <h3 class="cf-cards-title">Configure CF Card</h3>
      <p class="cf-cards-description">Please add a Card Slug in the component properties to load content from GraphQL.</p>
    </div>
  `;
  return li;
}

/**
 * Process a single cf-card row
 * @param {HTMLElement} row - The cf-card row element
 * @param {HTMLElement} ul - The container ul element
 * @param {string} locale - The locale code
 */
async function processCardRow(row, ul, locale) {
  console.log('CF-Cards: processCardRow called with:', row);
  
  // Check for CF Card model attribute
  const modelAttr = row.getAttribute('data-aue-model');
  console.log('CF-Cards: Model attribute:', modelAttr);
  
  // Check if this is a CF Card component that hasn't been configured yet
  if (row.hasAttribute('data-aue-model') && modelAttr === 'cf-card') {
    console.log('CF-Cards: Found unconfigured CF Card');
    // This is an unconfigured CF Card - create a placeholder
    const placeholder = createConfigurationPlaceholder();
    moveInstrumentation(row, placeholder);
    ul.appendChild(placeholder);
    return;
  }
  
  // Extract slug from the first cell (for configured CF Cards)
  const slugCell = row.querySelector('div:first-child');
  console.log('CF-Cards: Slug cell found:', slugCell);
  
  if (!slugCell) {
    console.warn('CF-Cards: No slug found in row', row);
    console.log('CF-Cards: Row HTML:', row.outerHTML);
    return;
  }
  
  const slug = slugCell.textContent.trim();
  console.log('CF-Cards: Extracted slug:', slug);
  
  if (!slug) {
    console.log('CF-Cards: Empty slug, skipping');
    return;
  }
  
  // Create loading placeholder
  const loadingCard = createLoadingCard(slug);
  moveInstrumentation(row, loadingCard);
  ul.appendChild(loadingCard);
  
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
    
    // Create card with fetched data
    const teaserItem = teasers[0]; // Use first item
    const card = createCard(teaserItem);
    
    // Move instrumentation from loading card to new card
    moveInstrumentation(loadingCard, card);
    
    // Replace loading card with actual card
    ul.replaceChild(card, loadingCard);
    
    console.log(`CF-Cards: Successfully loaded card for slug "${slug}"`);
    
  } catch (error) {
    console.error(`CF-Cards: Error loading slug "${slug}":`, error);
    
    // Create error card
    const errorCard = createErrorCard(slug, error.message);
    
    // Move instrumentation from loading card to error card
    moveInstrumentation(loadingCard, errorCard);
    
    // Replace loading card with error card
    ul.replaceChild(errorCard, loadingCard);
  }
}

/**
 * Main decoration function for cf-cards block
 * @param {HTMLElement} block - The cf-cards block element
 */
export default async function decorate(block) {
  const locale = getLocaleFromURL();
  
  console.log(`CF-Cards: Processing block with locale "${locale}"`);
  console.log('CF-Cards: Block children:', block.children);
  
  // Create container ul
  const ul = document.createElement('ul');
  ul.className = 'cf-cards-list';
  
  // Process each cf-card row
  const rows = [...block.children];
  console.log('CF-Cards: Rows to process:', rows);
  
  // Process all rows in parallel for better performance
  const promises = rows.map((row, index) => {
    console.log(`CF-Cards: Processing row ${index}:`, row);
    console.log(`CF-Cards: Row innerHTML:`, row.innerHTML);
    console.log(`CF-Cards: Row attributes:`, [...row.attributes]);
    return processCardRow(row, ul, locale);
  });
  
  // Clear block and add container
  block.textContent = '';
  block.appendChild(ul);
  
  // Wait for all cards to load
  await Promise.allSettled(promises);
  
  console.log('CF-Cards: All cards processed');
}