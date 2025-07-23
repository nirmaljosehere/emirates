import { readBlockConfig } from '../../scripts/aem.js';

/**
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  // Read teaser configuration (though it might be empty due to Universal Editor structure)
  const config = readBlockConfig(block);
  
  // Look for layout configuration in single-cell rows
  let layoutConfig = 'image-left'; // default
  
  const allRows = [...block.children];
  allRows.forEach((row, index) => {
    const cells = [...row.children];
    if (cells.length === 1) {
      const cellText = cells[0].textContent.trim();
      // Check if this cell contains a layout configuration value
      if (cellText === 'image-left' || cellText === 'content-left') {
        layoutConfig = cellText;
        console.log(`Found layout config in row ${index}:`, cellText);
      }
    }
  });

  // Configuration settings
  const settings = {
    layout: config['layout-direction'] || layoutConfig,
  };
  
  console.log('Final settings:', settings);

  // Filter out configuration rows and get content rows
  const contentRows = allRows.filter(row => {
    const cells = [...row.children];
    
    // Filter out single-cell configuration rows
    if (cells.length === 1) {
      const cellText = cells[0].textContent.trim();
      if (cellText === 'image-left' || cellText === 'content-left') {
        console.log('Excluding configuration row:', cellText);
        return false; // Exclude configuration values
      }
    }
    
    // Filter out traditional 2-cell configuration rows (just in case)
    if (cells.length === 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim().toLowerCase();
      
      const configKeys = ['layout direction', 'layout-direction'];
      const configValues = ['image-left', 'content-left'];
      
      if (configKeys.includes(key) || configValues.includes(value)) {
        console.log('Excluding traditional config row:', key, value);
        return false;
      }
    }
    
    return true; // Include content rows
  });

  console.log('Content rows after filtering:', contentRows.length);

  // Extract image and content from content rows
  let imageElement = null;
  let contentElements = [];

  contentRows.forEach(row => {
    const cells = [...row.children];
    cells.forEach(cell => {
      const img = cell.querySelector('img');
      if (img && !imageElement) {
        imageElement = img;
        console.log('Found image element');
      } else if (cell.textContent.trim() || cell.querySelector('*:not(img)')) {
        contentElements.push(cell);
        console.log('Found content element');
      }
    });
  });

  // Clear block and create new structure
  block.innerHTML = '';

  // Create image container
  const imageContainer = document.createElement('div');
  imageContainer.className = 'teaser-image';
  
  if (imageElement) {
    // Wrap image in picture element if not already
    const pictureElement = imageElement.closest('picture') || imageElement;
    imageContainer.appendChild(pictureElement);
    
    // Ensure proper attributes
    if (!imageElement.alt) {
      imageElement.alt = 'Teaser image';
    }
    imageElement.loading = 'lazy';
  }

  // Create content container
  const contentContainer = document.createElement('div');
  contentContainer.className = 'teaser-content';
  
  // Move content elements
  contentElements.forEach(element => {
    while (element.firstChild) {
      contentContainer.appendChild(element.firstChild);
    }
  });

  // Apply layout configuration
  console.log('Applying layout:', settings.layout);
  if (settings.layout === 'content-left') {
    block.classList.add('content-left');
    block.appendChild(contentContainer);
    block.appendChild(imageContainer);
    console.log('Applied content-left layout');
  } else {
    block.classList.add('image-left');
    block.appendChild(imageContainer);
    block.appendChild(contentContainer);
    console.log('Applied image-left layout');
  }
  
  console.log('Final block classes:', block.className);
}
