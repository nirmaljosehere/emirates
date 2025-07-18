/**
 * Emirates Destinations Grid Block
 * Creates a responsive grid of destination cards from AEM content
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
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  observer.observe(element);
};

// Parse destination data from table structure
function parseDestinationData(row) {
  const cells = [...row.children];
  const destination = {};
  
  if (cells.length >= 2) {
    // First cell - image
    const imageCell = cells[0];
    const img = imageCell.querySelector('img');
    if (img) {
      destination.image = {
        src: img.src,
        alt: img.alt || 'Destination image'
      };
    }
    
    // Second cell - content
    const contentCell = cells[1];
    const contentHTML = contentCell.innerHTML;
    
    // Parse content using a temporary div
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentHTML;
    
    // Extract title (h2, h3, or strong)
    const titleElement = tempDiv.querySelector('h2, h3, strong');
    if (titleElement) {
      destination.title = titleElement.textContent.trim();
      titleElement.remove();
    }
    
    // Extract subtitle (em or italic text)
    const subtitleElement = tempDiv.querySelector('em, i');
    if (subtitleElement) {
      destination.subtitle = subtitleElement.textContent.trim();
      subtitleElement.remove();
    }
    
    // Extract description (first paragraph)
    const descriptionElement = tempDiv.querySelector('p');
    if (descriptionElement) {
      destination.description = descriptionElement.textContent.trim();
      descriptionElement.remove();
    }
    
    // Extract features (ul/li)
    const featuresList = tempDiv.querySelector('ul');
    if (featuresList) {
      destination.features = [...featuresList.querySelectorAll('li')].map(li => li.textContent.trim());
      featuresList.remove();
    }
    
    // Extract badge indicators
    const badgeRegex = /\[(popular|featured|new|hot)\]/i;
    const textContent = contentCell.textContent.toLowerCase();
    const badgeMatch = textContent.match(badgeRegex);
    if (badgeMatch) {
      destination.badge = badgeMatch[1].charAt(0).toUpperCase() + badgeMatch[1].slice(1);
    }
    
    // Extract price (text containing currency or "from")
    const priceRegex = /(from\s+)?([a-z]{3}\s*[\d,]+|[\$£€]\s*[\d,]+)/i;
    const priceMatch = contentCell.textContent.match(priceRegex);
    if (priceMatch) {
      destination.price = priceMatch[0].trim();
    }
    
    // Extract button/link
    const linkElement = contentCell.querySelector('a');
    if (linkElement) {
      destination.button = {
        text: linkElement.textContent.trim() || 'Learn More',
        href: linkElement.href
      };
    }
    
    // Check for featured status
    if (textContent.includes('[featured]') || cells.length > 2) {
      destination.featured = true;
    }
  }
  
  return destination;
}

// Create destination card element
function createDestinationCard(data) {
  const card = document.createElement('div');
  card.className = 'destination-card';
  
  if (data.featured) {
    card.classList.add('featured');
  }
  
  // Image section
  if (data.image) {
    const imageDiv = document.createElement('div');
    imageDiv.className = 'card-image';
    
    const img = document.createElement('img');
    img.src = data.image.src;
    img.alt = data.image.alt;
    img.loading = 'lazy';
    
    imageDiv.appendChild(img);
    
    // Add badge if present
    if (data.badge) {
      const badge = document.createElement('span');
      badge.className = 'card-badge';
      badge.textContent = data.badge;
      imageDiv.appendChild(badge);
    }
    
    card.appendChild(imageDiv);
  }
  
  // Content section
  const content = document.createElement('div');
  content.className = 'card-content';
  
  if (data.title) {
    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = data.title;
    content.appendChild(title);
  }
  
  if (data.subtitle) {
    const subtitle = document.createElement('div');
    subtitle.className = 'card-subtitle';
    subtitle.textContent = data.subtitle;
    content.appendChild(subtitle);
  }
  
  if (data.description) {
    const description = document.createElement('p');
    description.className = 'card-description';
    description.textContent = data.description;
    content.appendChild(description);
  }
  
  if (data.features && data.features.length > 0) {
    const features = document.createElement('ul');
    features.className = 'card-features';
    
    data.features.forEach(feature => {
      const li = document.createElement('li');
      li.textContent = feature;
      features.appendChild(li);
    });
    
    content.appendChild(features);
  }
  
  if (data.price) {
    const priceDiv = document.createElement('div');
    priceDiv.className = 'card-price';
    
    const label = document.createElement('span');
    label.className = 'price-label';
    label.textContent = 'From';
    
    const value = document.createElement('span');
    value.className = 'price-value';
    value.textContent = data.price;
    
    priceDiv.appendChild(label);
    priceDiv.appendChild(value);
    content.appendChild(priceDiv);
  }
  
  if (data.button) {
    const button = document.createElement('a');
    button.className = 'card-button';
    button.href = data.button.href;
    button.textContent = data.button.text;
    content.appendChild(button);
  }
  
  card.appendChild(content);
  return card;
}

// Create default destinations when no content is available
function createDefaultDestinations() {
  return [
    {
      title: 'Thailand',
      subtitle: 'Bangkok & Phuket',
      description: 'Discover the land of smiles with pristine beaches, vibrant culture, and world-renowned cuisine.',
      features: ['Direct flights', 'Tropical weather', 'World-class cuisine'],
      price: 'AED 2,299',
      button: { text: 'Explore Thailand', href: '/destinations/thailand' },
      badge: 'Popular',
      image: { 
        src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%234a90e2"/%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="white"%3EThailand%3C/text%3E%3C/svg%3E',
        alt: 'Thailand destination'
      }
    },
    {
      title: 'Seychelles',
      subtitle: 'Mahé Island',
      description: 'Paradise found in the Indian Ocean with crystal clear waters and pristine beaches.',
      features: ['Luxury resorts', 'Private beaches', 'Pristine nature'],
      price: 'AED 3,999',
      button: { text: 'Discover Seychelles', href: '/destinations/seychelles' },
      image: { 
        src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%2350c9c3"/%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="white"%3ESeychelles%3C/text%3E%3C/svg%3E',
        alt: 'Seychelles destination'
      }
    },
    {
      title: 'Mauritius',
      subtitle: 'Port Louis',
      description: 'A tropical paradise offering luxury, natural beauty, and warm hospitality.',
      features: ['Golf courses', 'Water sports', 'Luxury spas'],
      price: 'AED 3,299',
      button: { text: 'Visit Mauritius', href: '/destinations/mauritius' },
      image: { 
        src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%2378c257"/%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="white"%3EMauritius%3C/text%3E%3C/svg%3E',
        alt: 'Mauritius destination'
      }
    },
    {
      title: 'Australia',
      subtitle: 'Sydney & Melbourne',
      description: 'Experience the best of Down Under with world-class cities and unique wildlife.',
      features: ['Multiple cities', 'Adventure tours', 'Wildlife experiences'],
      price: 'AED 4,599',
      button: { text: 'Explore Australia', href: '/destinations/australia' },
      featured: true,
      image: { 
        src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23e74c3c"/%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="white"%3EAustralia%3C/text%3E%3C/svg%3E',
        alt: 'Australia destination'
      }
    }
  ];
}

export default function decorate(block) {
  const rows = [...block.children];
  
  // Clear existing content
  block.innerHTML = '';
  
  // Extract title if present
  let title = '';
  let titleElement = null;
  
  // Look for title in first row if it's a single cell
  if (rows.length > 0 && rows[0].children.length === 1) {
    const firstRow = rows[0];
    const firstCell = firstRow.children[0];
    const headingElement = firstCell.querySelector('h1, h2, h3');
    
    if (headingElement) {
      title = headingElement.textContent.trim();
      titleElement = headingElement;
      rows.shift(); // Remove title row from processing
    } else if (firstCell.textContent.trim() && !firstCell.querySelector('img')) {
      title = firstCell.textContent.trim();
      rows.shift(); // Remove title row from processing
    }
  }
  
  // Parse destination data from remaining rows
  const destinations = [];
  
  rows.forEach(row => {
    if (row.children.length >= 2) {
      const data = parseDestinationData(row);
      if (data.title || data.image) {
        destinations.push(data);
      }
    }
  });
  
  // Use default destinations if none found
  const finalDestinations = destinations.length > 0 ? destinations : createDefaultDestinations();
  
  // Add title
  if (title) {
    const h2 = document.createElement('h2');
    h2.textContent = title;
    block.appendChild(h2);
  } else {
    const h2 = document.createElement('h2');
    h2.textContent = 'Winter Sun Destinations';
    block.appendChild(h2);
  }
  
  // Create grid container
  const gridContainer = document.createElement('div');
  gridContainer.className = 'grid-container';
  
  // Add destination cards
  finalDestinations.forEach(data => {
    const card = createDestinationCard(data);
    gridContainer.appendChild(card);
  });
  
  block.appendChild(gridContainer);
  
  // Add structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Emirates Winter Sun Destinations',
    'itemListElement': finalDestinations.map((dest, index) => ({
      '@type': 'TouristDestination',
      'position': index + 1,
      'name': dest.title,
      'description': dest.description
    }))
  };
  
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  
  // Only add if not already present
  if (!document.head.querySelector('script[type="application/ld+json"][data-destinations]')) {
    script.setAttribute('data-destinations', 'true');
    document.head.appendChild(script);
  }
  
  // Initialize scroll animation
  observeElement(block);
} 