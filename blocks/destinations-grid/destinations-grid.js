/**
 * Emirates Destinations Grid Block
 * Creates a responsive grid of destination cards
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
  
  // Expected structure: Image | Title | Description | Features | Price | Button
  if (cells.length >= 3) {
    const imageCell = cells[0];
    const img = imageCell.querySelector('img');
    if (img) {
      destination.image = {
        src: img.src,
        alt: img.alt || 'Destination image'
      };
    }
    
    const contentCell = cells[1];
    const content = contentCell.innerHTML;
    
    // Parse content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    const title = tempDiv.querySelector('h3, h2, strong') || tempDiv.querySelector('p');
    if (title) {
      destination.title = title.textContent.trim();
      title.remove();
    }
    
    const subtitle = tempDiv.querySelector('em, .subtitle');
    if (subtitle) {
      destination.subtitle = subtitle.textContent.trim();
      subtitle.remove();
    }
    
    const description = tempDiv.querySelector('p');
    if (description) {
      destination.description = description.textContent.trim();
      description.remove();
    }
    
    const features = tempDiv.querySelectorAll('ul li, li');
    if (features.length > 0) {
      destination.features = [...features].map(li => li.textContent.trim());
    }
    
    // Parse additional data from other cells
    if (cells.length >= 4) {
      const priceCell = cells[2];
      const priceText = priceCell.textContent.trim();
      if (priceText && priceText.includes('$') || priceText.toLowerCase().includes('from')) {
        destination.price = priceText;
      }
    }
    
    if (cells.length >= 5) {
      const buttonCell = cells[3];
      const link = buttonCell.querySelector('a');
      if (link) {
        destination.button = {
          text: link.textContent.trim() || 'Learn More',
          href: link.href
        };
      }
    }
    
    // Check for badges
    const badgeIndicators = ['popular', 'featured', 'new', 'hot'];
    const textContent = contentCell.textContent.toLowerCase();
    for (const indicator of badgeIndicators) {
      if (textContent.includes(`[${indicator}]`)) {
        destination.badge = indicator.charAt(0).toUpperCase() + indicator.slice(1);
        break;
      }
    }
    
    // Check for featured status
    if (textContent.includes('[featured]') || cells.length > 5) {
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

export default function decorate(block) {
  const content = block.querySelector('div');
  
  if (!content) return;

  // Get the title (first element that's not a table/row)
  let title = '';
  const titleElement = content.querySelector('h2, h1');
  if (titleElement) {
    title = titleElement.textContent;
    titleElement.remove();
  }
  
  // Parse destination data from rows
  const rows = [...content.children];
  const destinations = [];
  
  rows.forEach(row => {
    const data = parseDestinationData(row);
    if (data.title || data.image) {
      destinations.push(data);
    }
  });
  
  // Clear content and rebuild
  content.innerHTML = '';
  
  // Add title if present
  if (title) {
    const h2 = document.createElement('h2');
    h2.textContent = title;
    content.appendChild(h2);
  } else {
    // Add default title
    const h2 = document.createElement('h2');
    h2.textContent = 'Winter Sun Destinations';
    content.appendChild(h2);
  }
  
  // Create grid container
  const gridContainer = document.createElement('div');
  gridContainer.className = 'grid-container';
  
  // Add destination cards
  destinations.forEach(data => {
    const card = createDestinationCard(data);
    gridContainer.appendChild(card);
  });
  
  // If no destinations found, create some defaults
  if (destinations.length === 0) {
    const defaultDestinations = [
      {
        title: 'Thailand',
        subtitle: 'Bangkok & Phuket',
        description: 'Discover the land of smiles with pristine beaches and vibrant culture.',
        features: ['Direct flights', 'Tropical weather', 'World-class cuisine'],
        price: 'AED 2,299',
        button: { text: 'Explore Thailand', href: '#' },
        badge: 'Popular'
      },
      {
        title: 'Seychelles',
        subtitle: 'Mahé Island',
        description: 'Paradise found in the Indian Ocean with crystal clear waters.',
        features: ['Luxury resorts', 'Private beaches', 'Pristine nature'],
        price: 'AED 3,999',
        button: { text: 'Discover Seychelles', href: '#' }
      },
      {
        title: 'Mauritius',
        subtitle: 'Port Louis',
        description: 'A tropical paradise offering luxury and natural beauty.',
        features: ['Golf courses', 'Water sports', 'Luxury spas'],
        price: 'AED 3,299',
        button: { text: 'Visit Mauritius', href: '#' }
      },
      {
        title: 'Australia',
        subtitle: 'Sydney & Melbourne',
        description: 'Experience the best of Down Under with world-class cities.',
        features: ['Multiple cities', 'Adventure tours', 'Wildlife experiences'],
        price: 'AED 4,599',
        button: { text: 'Explore Australia', href: '#' },
        featured: true
      }
    ];
    
    defaultDestinations.forEach(data => {
      const card = createDestinationCard(data);
      gridContainer.appendChild(card);
    });
  }
  
  content.appendChild(gridContainer);
  
  // Add structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Emirates Winter Sun Destinations',
    'itemListElement': destinations.map((dest, index) => ({
      '@type': 'TouristDestination',
      'position': index + 1,
      'name': dest.title,
      'description': dest.description
    }))
  };
  
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
  
  // Initialize scroll animation
  observeElement(block);
} 