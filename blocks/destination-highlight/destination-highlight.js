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
  const rows = [...block.children];
  
  if (rows.length === 0) {
    // Create default content if no content provided
    createDefaultContent(block);
    return;
  }

  // Clear existing content
  block.innerHTML = '';
  
  // Create main container
  const container = document.createElement('div');
  container.className = 'destination-container';
  
  let imageContainer, contentContainer;
  
  // Process existing rows
  if (rows.length >= 2) {
    // First row should contain image
    const imageRow = rows[0];
    imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';
    
    const img = imageRow.querySelector('img');
    if (img) {
      imageContainer.appendChild(img);
      // Ensure proper alt text
      if (!img.alt) {
        img.alt = 'Emirates destination';
      }
      img.loading = 'lazy';
    }
    
    // Second row should contain content
    const contentRow = rows[1];
    contentContainer = document.createElement('div');
    contentContainer.className = 'content';
    
    // Move all content from the row
    while (contentRow.firstChild) {
      contentContainer.appendChild(contentRow.firstChild);
    }
  } else {
    // Single row - try to split content
    const singleRow = rows[0];
    const cells = [...singleRow.children];
    
    imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';
    
    contentContainer = document.createElement('div');
    contentContainer.className = 'content';
    
    if (cells.length >= 2) {
      // Two cells - image and content
      const img = cells[0].querySelector('img');
      if (img) {
        imageContainer.appendChild(img);
        if (!img.alt) img.alt = 'Emirates destination';
        img.loading = 'lazy';
      }
      
      while (cells[1].firstChild) {
        contentContainer.appendChild(cells[1].firstChild);
      }
    } else {
      // Single cell - create default structure
      createDefaultContent(block);
      return;
    }
  }
  
  // Process content elements
  processContent(contentContainer);
  
  // Determine layout direction
  const isReverse = block.classList.contains('reverse') || 
                   block.dataset.reverse === 'true';
  
  if (isReverse) {
    container.appendChild(contentContainer);
    container.appendChild(imageContainer);
    block.classList.add('reverse');
  } else {
    container.appendChild(imageContainer);
    container.appendChild(contentContainer);
  }
  
  block.appendChild(container);
  
  // Add structured data for SEO
  addStructuredData(contentContainer, imageContainer);
  
  // Initialize scroll animation
  observeElement(block);
}

function processContent(contentContainer) {
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
  
  // Process feature lists
  const lists = contentContainer.querySelectorAll('ul');
  lists.forEach(list => {
    if (list.children.length > 0 && !list.classList.contains('features')) {
      list.classList.add('features');
    }
  });
  
  // Process highlight badges
  const paragraphs = contentContainer.querySelectorAll('p');
  paragraphs.forEach(p => {
    if (p.textContent.startsWith('[HIGHLIGHT]')) {
      const badge = document.createElement('span');
      badge.className = 'highlight-badge';
      badge.textContent = p.textContent.replace('[HIGHLIGHT]', '').trim();
      p.parentNode.insertBefore(badge, p);
      p.remove();
    }
  });
}

function createDefaultContent(block) {
  block.innerHTML = `
    <div class="destination-container">
      <div class="image-container">
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='18' fill='%23666'%3EDestination Image%3C/text%3E%3C/svg%3E" alt="Destination image placeholder" loading="lazy">
      </div>
      <div class="content">
        <span class="highlight-badge">Featured Destination</span>
        <h2>Dubai</h2>
        <h3>Your Gateway to Winter Sun</h3>
        <p>Start your winter sun journey in Dubai, where warm weather meets world-class luxury. Experience the perfect blend of modern innovation and traditional culture.</p>
        <ul class="features">
          <li>Year-round sunshine with temperatures around 25°C</li>
          <li>World-class shopping and dining experiences</li>
          <li>Luxury beach resorts and desert adventures</li>
          <li>Cultural attractions and modern marvels</li>
        </ul>
        <div class="button-container">
          <a href="/destinations/dubai" class="button">Discover Dubai</a>
          <a href="/dubai-stopover" class="button secondary">Dubai Stopover</a>
        </div>
      </div>
    </div>
  `;
  
  // Initialize scroll animation
  observeElement(block);
}

function addStructuredData(contentContainer, imageContainer) {
  const heading = contentContainer.querySelector('h2, h3');
  const description = contentContainer.querySelector('p');
  const img = imageContainer.querySelector('img');
  
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
    
    if (img && img.src) {
      structuredData.image = img.src;
    }
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    
    // Only add if not already present
    if (!document.head.querySelector('script[type="application/ld+json"]')) {
      document.head.appendChild(script);
    }
  }
} 