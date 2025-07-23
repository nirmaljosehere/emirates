import { readBlockConfig } from '../../scripts/aem.js';

/**
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  // Read teaser configuration
  const config = readBlockConfig(block);
  
  // Configuration settings with defaults
  const settings = {
    layout: config['layout-direction'] || 'image-left',
  };

  // Filter out configuration rows and get content rows
  const allRows = [...block.children];
  const contentRows = allRows.filter(row => {
    const cells = [...row.children];
    if (cells.length === 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim().toLowerCase();
      
      // Configuration keys and values to exclude
      const configKeys = ['layout direction', 'layout-direction'];
      const configValues = ['image-left', 'content-left'];
      
      if (configKeys.includes(key) || configValues.includes(value)) {
        return false; // Exclude configuration rows
      }
    }
    return true; // Include content rows
  });

  // Extract image and content from content rows
  let imageElement = null;
  let contentElements = [];

  contentRows.forEach(row => {
    const cells = [...row.children];
    cells.forEach(cell => {
      const img = cell.querySelector('img');
      if (img && !imageElement) {
        imageElement = img;
      } else if (cell.textContent.trim() || cell.querySelector('*:not(img)')) {
        contentElements.push(cell);
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
  if (settings.layout === 'content-left') {
    block.classList.add('content-left');
    block.appendChild(contentContainer);
    block.appendChild(imageContainer);
  } else {
    block.classList.add('image-left');
    block.appendChild(imageContainer);
    block.appendChild(contentContainer);
  }
}
