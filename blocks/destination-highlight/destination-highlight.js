/**
 * Emirates Destination Highlight Block
 * Creates an engaging destination showcase with image and content
 */

// Intersection Observer for scroll animations
const observeElement = (element) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  });
  
  observer.observe(element);
};

export default function decorate(block) {
  const content = block.querySelector('div');
  
  if (!content) return;

  // Structure the content
  const rows = [...content.children];
  
  if (rows.length < 2) {
    console.warn('Destination highlight block needs at least 2 rows (image and content)');
    return;
  }

  // Clear the block and rebuild structure
  content.innerHTML = '';
  
  // Create main container
  const container = document.createElement('div');
  container.className = 'destination-container';
  
  // Process image (first row)
  const imageRow = rows[0];
  const imageContainer = document.createElement('div');
  imageContainer.className = 'image-container';
  
  const img = imageRow.querySelector('img');
  if (img) {
    // Ensure proper alt text for accessibility
    if (!img.alt) {
      img.alt = 'Emirates destination';
    }
    imageContainer.appendChild(img);
  }
  
  // Process content (second row)
  const contentRow = rows[1];
  const contentContainer = document.createElement('div');
  contentContainer.className = 'content';
  
  // Move all content from the second row
  while (contentRow.firstChild) {
    contentContainer.appendChild(contentRow.firstChild);
  }
  
  // Process buttons
  const buttons = contentContainer.querySelectorAll('a');
  buttons.forEach((button, index) => {
    if (!button.classList.contains('button')) {
      button.classList.add('button');
    }
    
    // Make the second button secondary
    if (index === 1) {
      button.classList.add('secondary');
    }
  });
  
  // Check for features list and style it
  const lists = contentContainer.querySelectorAll('ul');
  lists.forEach(list => {
    if (list.children.length > 0 && !list.classList.contains('features')) {
      list.classList.add('features');
    }
  });
  
  // Add highlight badge if first paragraph starts with special indicator
  const firstP = contentContainer.querySelector('p');
  if (firstP && firstP.textContent.startsWith('[HIGHLIGHT]')) {
    const badge = document.createElement('span');
    badge.className = 'highlight-badge';
    badge.textContent = firstP.textContent.replace('[HIGHLIGHT]', '').trim();
    contentContainer.insertBefore(badge, firstP);
    firstP.remove();
  }
  
  // Determine layout direction
  const isReverse = block.classList.contains('reverse') || 
                   block.closest('[data-block-name]')?.getAttribute('data-reverse') === 'true';
  
  if (isReverse) {
    block.classList.add('reverse');
    container.appendChild(contentContainer);
    container.appendChild(imageContainer);
  } else {
    container.appendChild(imageContainer);
    container.appendChild(contentContainer);
  }
  
  content.appendChild(container);
  
  // Add structured data for SEO
  const heading = contentContainer.querySelector('h2, h3');
  const description = contentContainer.querySelector('p');
  
  if (heading && description) {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'TouristDestination',
      'name': heading.textContent,
      'description': description.textContent,
      'provider': {
        '@type': 'Organization',
        'name': 'Emirates'
      }
    };
    
    if (img) {
      structuredData.image = img.src;
    }
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }
  
  // Initialize scroll animation
  observeElement(block);
  
  // Add accessibility improvements
  const images = block.querySelectorAll('img');
  images.forEach(img => {
    if (!img.alt) {
      const heading = contentContainer.querySelector('h2, h3');
      img.alt = heading ? `${heading.textContent} destination image` : 'Emirates destination';
    }
  });
  
  // Optimize image loading
  images.forEach(img => {
    img.loading = 'lazy';
  });
} 