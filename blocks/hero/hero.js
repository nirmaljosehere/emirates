/**
 * Emirates Hero Banner Block
 * Creates an engaging hero section with background image and call-to-action
 */
export default function decorate(block) {
  const heroContent = block.querySelector('div');
  
  if (!heroContent) return;

  // Add winter-sun class for specific styling
  block.classList.add('winter-sun');
  
  // Process the hero content
  const h1 = heroContent.querySelector('h1');
  const h2 = heroContent.querySelector('h2');
  const buttonContainer = heroContent.querySelector('.button-container');
  
  // Set default content if not provided
  if (!h1) {
    const defaultH1 = document.createElement('h1');
    defaultH1.textContent = 'Fly Emirates and follow the sun';
    heroContent.prepend(defaultH1);
  }
  
  if (!h2) {
    const defaultH2 = document.createElement('h2');
    defaultH2.textContent = 'Escape to warmer destinations this winter with Emirates';
    if (h1) {
      h1.after(defaultH2);
    } else {
      heroContent.appendChild(defaultH2);
    }
  }
  
  // Ensure button has proper styling
  const buttons = heroContent.querySelectorAll('a');
  buttons.forEach(button => {
    if (!button.classList.contains('button')) {
      button.classList.add('button');
    }
    
    // Add default text if button is empty
    if (!button.textContent.trim()) {
      button.textContent = 'Explore Destinations';
    }
  });
  
  // Add structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPageElement',
    'name': 'Emirates Winter Sun Hero Banner',
    'description': 'Promotional banner for Emirates winter sun destinations',
    'provider': {
      '@type': 'Organization',
      'name': 'Emirates'
    }
  };
  
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
}
