/**
 * Emirates Hero Block
 * Handles responsive images and content positioning
 */

export default function decorate(block) {
  const rows = [...block.children];
  
  if (rows.length === 0) {
    return;
  }

  // Extract content from the block
  let heroImage = null;
  let mobileImage = null;
  let content = [];

  // Process rows to extract images and content
  rows.forEach(row => {
    const cells = [...row.children];
    
    // Look for images in the cells
    cells.forEach((cell, index) => {
      const img = cell.querySelector('img');
      if (img) {
        if (!heroImage) {
          // First image becomes hero image
          heroImage = img.cloneNode(true);
        } else if (!mobileImage) {
          // Second image becomes mobile image (if present)
          mobileImage = img.cloneNode(true);
        }
      }
      
      // Collect text content (excluding image containers)
      if (!cell.querySelector('img') && cell.textContent.trim()) {
        content.push(cell.cloneNode(true));
      } else if (cell.querySelector('img') && cell.textContent.trim()) {
        // If cell has both image and text, extract text
        const textNodes = [...cell.childNodes].filter(node => 
          node.nodeType === Node.TEXT_NODE || 
          (node.nodeType === Node.ELEMENT_NODE && !node.querySelector('img'))
        );
        
        if (textNodes.length > 0) {
          const textContainer = document.createElement('div');
          textNodes.forEach(node => textContainer.appendChild(node.cloneNode(true)));
          if (textContainer.textContent.trim()) {
            content.push(textContainer);
          }
        }
      }
    });
  });

  // Clear the block
  block.innerHTML = '';

  // Create hero image - always create this as the main image
  if (heroImage) {
    const heroPicture = document.createElement('picture');
    heroPicture.className = 'hero-desktop-image';
    
    const img = heroImage.cloneNode(true);
    img.loading = 'eager'; // Hero images should load immediately
    heroPicture.appendChild(img);
    block.appendChild(heroPicture);
  }

  // Create mobile image only if provided
  if (mobileImage) {
    const mobilePicture = document.createElement('picture');
    mobilePicture.className = 'hero-mobile-image';
    
    const img = mobileImage.cloneNode(true);
    img.loading = 'eager'; // Hero images should load immediately
    mobilePicture.appendChild(img);
    block.appendChild(mobilePicture);
  }

  // Create content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'hero-content';

  // Add content to wrapper
  if (content.length > 0) {
    content.forEach(item => {
      contentWrapper.appendChild(item);
    });
  } else {
    // Create default content if none provided
    const defaultTitle = document.createElement('h1');
    defaultTitle.textContent = 'Emirates Winter Sun';
    const defaultSubtitle = document.createElement('p');
    defaultSubtitle.textContent = 'Escape to warm destinations this winter';
    
    contentWrapper.appendChild(defaultTitle);
    contentWrapper.appendChild(defaultSubtitle);
  }

  block.appendChild(contentWrapper);

  // Add intersection observer for performance
  if (window.IntersectionObserver) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('hero-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });

    observer.observe(block);
  }

  // Handle responsive image switching - only if mobile image exists
  function handleResponsiveImages() {
    const desktopImg = block.querySelector('.hero-desktop-image');
    const mobileImg = block.querySelector('.hero-mobile-image');

    // Only apply responsive logic if both images exist
    if (desktopImg && mobileImg) {
      const isDesktop = window.matchMedia('(min-width: 968px)').matches;
      
      if (isDesktop) {
        desktopImg.style.display = 'block';
        mobileImg.style.display = 'none';
      } else {
        desktopImg.style.display = 'none';
        mobileImg.style.display = 'block';
      }
    }
    // If only hero image exists, it will be shown on all devices via CSS
  }

  // Initialize responsive images only if mobile image exists
  if (mobileImage) {
    handleResponsiveImages();

    // Listen for resize events
    window.addEventListener('resize', handleResponsiveImages);
    
    // Listen for orientation changes on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResponsiveImages, 100);
    });
  }
}
