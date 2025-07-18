/**
 * Blockquote Block
 * Creates styled blockquotes with optional author attribution and various styling options
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

export default function decorate(block) {
  const content = block.querySelector('div');
  
  if (!content) {
    return;
  }

  // Get the content and determine structure
  const children = [...content.children];
  
  if (children.length === 0) {
    return;
  }

  // Clear the block
  block.innerHTML = '';
  
  // Create blockquote element
  const blockquote = document.createElement('blockquote');
  
  // Variables to hold different parts
  let quoteText = '';
  let citation = '';
  let authorImage = '';
  let authorName = '';
  let authorTitle = '';
  
  // Process children to extract content
  children.forEach((child, index) => {
    const textContent = child.textContent.trim();
    
    // First child is usually the quote text
    if (index === 0) {
      // Move all content from first child to blockquote
      while (child.firstChild) {
        blockquote.appendChild(child.firstChild);
      }
    } else if (index === 1) {
      // Second child might be citation or author info
      citation = textContent;
    } else if (index === 2) {
      // Third child might be author name
      authorName = textContent;
    } else if (index === 3) {
      // Fourth child might be author title
      authorTitle = textContent;
    }
    
    // Check for images (author photo)
    const img = child.querySelector('img');
    if (img) {
      authorImage = img.src;
      img.remove(); // Remove from original location
    }
  });
  
  // If blockquote is empty, create from text content
  if (!blockquote.hasChildNodes()) {
    const p = document.createElement('p');
    p.textContent = children[0]?.textContent || '';
    blockquote.appendChild(p);
  }
  
  // Add citation if provided
  if (citation) {
    // Check if it's already in a citation element
    let citeElement = blockquote.querySelector('cite, footer');
    
    if (!citeElement) {
      citeElement = document.createElement('cite');
      citeElement.textContent = citation;
      blockquote.appendChild(citeElement);
    }
  }
  
  // Add author information if provided
  if (authorName || authorImage) {
    const authorDiv = document.createElement('div');
    authorDiv.className = 'author';
    
    if (authorImage) {
      const img = document.createElement('img');
      img.src = authorImage;
      img.alt = authorName || 'Author';
      img.loading = 'lazy';
      authorDiv.appendChild(img);
    }
    
    if (authorName || authorTitle) {
      const authorInfo = document.createElement('div');
      authorInfo.className = 'author-info';
      
      if (authorName) {
        const nameEl = document.createElement('div');
        nameEl.className = 'author-name';
        nameEl.textContent = authorName;
        authorInfo.appendChild(nameEl);
      }
      
      if (authorTitle) {
        const titleEl = document.createElement('div');
        titleEl.className = 'author-title';
        titleEl.textContent = authorTitle;
        authorInfo.appendChild(titleEl);
      }
      
      authorDiv.appendChild(authorInfo);
    }
    
    blockquote.appendChild(authorDiv);
  }
  
  // Apply styling based on classes
  const blockClasses = block.className.split(' ');
  
  // Check for style variants
  if (blockClasses.includes('minimal')) {
    block.classList.add('style-minimal');
  } else if (blockClasses.includes('card')) {
    block.classList.add('style-card');
  } else if (blockClasses.includes('emphasis')) {
    block.classList.add('style-emphasis');
  }
  
  // Check for size variants
  if (blockClasses.includes('large')) {
    block.classList.add('large');
  }
  
  // Check for alignment variants
  if (blockClasses.includes('center')) {
    block.classList.add('center');
  }
  
  // Check for pull quote variant
  if (blockClasses.includes('pull') || blockClasses.includes('pull-quote')) {
    block.classList.add('pull-quote');
  }
  
  // Add the blockquote to the block
  block.appendChild(blockquote);
  
  // Add semantic attributes for accessibility
  blockquote.setAttribute('role', 'blockquote');
  
  // Add language attribute if specified
  const lang = block.getAttribute('data-lang');
  if (lang) {
    blockquote.setAttribute('lang', lang);
  }
  
  // Handle structured data
  addStructuredData(blockquote);
  
  // Initialize scroll animation (only if motion is not reduced)
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    observeElement(block);
  } else {
    // Skip animation for users who prefer reduced motion
    block.classList.add('visible');
  }
  
  // Add keyboard navigation support for interactive elements
  const interactiveElements = block.querySelectorAll('a, button');
  interactiveElements.forEach(element => {
    element.addEventListener('focus', () => {
      block.classList.add('focused');
    });
    
    element.addEventListener('blur', () => {
      block.classList.remove('focused');
    });
  });
}

function addStructuredData(blockquote) {
  const quoteText = blockquote.querySelector('p')?.textContent;
  const citation = blockquote.querySelector('cite, footer')?.textContent;
  const authorName = blockquote.querySelector('.author-name')?.textContent;
  
  if (quoteText) {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Quotation',
      'text': quoteText
    };
    
    if (citation || authorName) {
      structuredData.creator = {
        '@type': 'Person',
        'name': authorName || citation
      };
    }
    
    // Create script tag for structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    
    // Only add if not already present
    if (!document.head.querySelector('script[type="application/ld+json"]')) {
      document.head.appendChild(script);
    }
  }
}

// Utility function to clean up citation text
function cleanCitation(text) {
  // Remove common prefixes
  return text.replace(/^(—|–|-|\s)+/, '').trim();
}

// Support for dynamic content updates
function updateBlockquote(block, newContent) {
  const blockquote = block.querySelector('blockquote');
  if (blockquote && newContent) {
    // Clear existing content
    blockquote.innerHTML = '';
    
    // Add new content
    const p = document.createElement('p');
    p.textContent = newContent.text || '';
    blockquote.appendChild(p);
    
    if (newContent.citation) {
      const cite = document.createElement('cite');
      cite.textContent = newContent.citation;
      blockquote.appendChild(cite);
    }
    
    // Update structured data
    addStructuredData(blockquote);
  }
}

// Export utility functions for external use
export { updateBlockquote, addStructuredData }; 