import { readBlockConfig } from '../../scripts/aem.js';

/**
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  // Debug: Log the block structure
  console.log('Teaser block structure:', block);
  console.log('Block children:', [...block.children]);
  
  // Read teaser configuration
  const config = readBlockConfig(block);
  console.log('Config object:', config);
  
  // Configuration settings with defaults
  const settings = {
    layout: config['layout-direction'] || 'image-left',
  };
  console.log('Settings:', settings);

  // Debug: Check each row
  const allRows = [...block.children];
  allRows.forEach((row, index) => {
    const cells = [...row.children];
    console.log(`Row ${index}:`, {
      cellCount: cells.length,
      cell0Text: cells[0]?.textContent?.trim(),
      cell1Text: cells[1]?.textContent?.trim(),
      rowHTML: row.outerHTML
    });
  });

  // Filter out configuration rows and get content rows
  const contentRows = allRows.filter(row => {
    const cells = [...row.children];
    if (cells.length === 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim().toLowerCase();
      
      console.log(`Checking row: key="${key}", value="${value}"`);
      
      // Configuration keys and values to exclude
      const configKeys = ['layout direction', 'layout-direction'];
      const configValues = ['image-left', 'content-left', 'image left, content right', 'content left, image right'];
      
      if (configKeys.includes(key) || configValues.includes(value)) {
        console.log('Excluding configuration row:', key, value);
        return false; // Exclude configuration rows
      }
    }
    console.log('Including content row');
    return true; // Include content rows
  });

  console.log('Content rows after filtering:', contentRows);

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

  console.log('Image element:', imageElement);
  console.log('Content elements:', contentElements);

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
