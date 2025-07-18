/**
 * Carousel Block
 * Features: Touch/swipe support, auto-play, keyboard navigation, accessibility
 */

import { moveInstrumentation } from '../../scripts/scripts.js';
import { readBlockConfig } from '../../scripts/aem.js';

export default function decorate(block) {
  // Read carousel configuration from Universal Editor
  const config = readBlockConfig(block);
  
  // Configuration settings with defaults
  const settings = {
    autoplay: config.autoplay !== 'false',
    interval: parseInt(config.interval) || 5,
    showDots: config.showdots !== 'false',
    showArrows: config.showarrows !== 'false',
    loop: config.loop !== 'false',
    variant: config.variant || '',
    title: config.title || ''
  };

  // Process all children as slides (similar to cards block)
  const slideRows = [...block.children];
  
  // If no slides, create a default placeholder that can be edited
  if (slideRows.length === 0) {
    // Create a default slide that can be edited in Universal Editor
    const defaultSlide = document.createElement('div');
    defaultSlide.innerHTML = '<div><p>Add your carousel slides here</p></div>';
    defaultSlide.setAttribute('data-aue-resource', 'urn:aemconnection:/content/slides/default');
    defaultSlide.setAttribute('data-aue-type', 'component');
    defaultSlide.setAttribute('data-aue-filter', 'carousel-slide');
    slideRows.push(defaultSlide);
  }
  
  // Clear the block and create carousel structure
  block.innerHTML = '';
  
  // Add Emirates theme styling
  block.classList.add('emirates-carousel');
  if (settings.variant) {
    block.classList.add(`carousel-${settings.variant}`);
  }
  
  // Add title if configured
  if (settings.title) {
    const titleElement = document.createElement('h2');
    titleElement.className = 'carousel-title';
    titleElement.textContent = settings.title;
    block.appendChild(titleElement);
  }
  
  const container = document.createElement('div');
  container.className = 'carousel-container';
  
  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';
  
  // Create slides while preserving Universal Editor attributes
  slideRows.forEach((slide, index) => {
    const slideElement = document.createElement('div');
    slideElement.className = 'carousel-slide emirates-slide';
    slideElement.setAttribute('aria-label', `Slide ${index + 1} of ${slideRows.length}`);
    slideElement.setAttribute('id', `slide-${index}`);
    
    // Preserve Universal Editor attributes from original slide
    moveInstrumentation(slide, slideElement);
    
    // Move content from original slide
    while (slide.firstChild) {
      slideElement.appendChild(slide.firstChild);
    }
    
    // Apply Emirates styling and structure
    const img = slideElement.querySelector('img');
    if (!img) {
      // Text-only slide
      const content = document.createElement('div');
      content.className = 'slide-content emirates-content';
      while (slideElement.firstChild) {
        content.appendChild(slideElement.firstChild);
      }
      slideElement.appendChild(content);
      slideElement.classList.add('text-slide');
    } else {
      // Image slide
      slideElement.classList.add('image-slide');
      img.setAttribute('loading', 'lazy');
      
      // Create content overlay for text content
      const textElements = slideElement.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, .button-container');
      if (textElements.length > 0) {
        const content = document.createElement('div');
        content.className = 'slide-content emirates-content overlay';
        
        textElements.forEach(el => {
          // Add Emirates styling to text elements
          if (el.tagName.match(/H[1-6]/)) {
            el.classList.add('emirates-heading');
          } else if (el.tagName === 'P') {
            el.classList.add('emirates-text');
          } else if (el.classList.contains('button-container')) {
            el.classList.add('emirates-buttons');
            const buttons = el.querySelectorAll('a, button');
            buttons.forEach(btn => btn.classList.add('emirates-button'));
          }
          content.appendChild(el);
        });
        
        slideElement.appendChild(content);
      }
    }
    
    wrapper.appendChild(slideElement);
  });
  
  // Create navigation arrows (only if enabled and multiple slides)
  let prevButton, nextButton;
  if (settings.showArrows && slideRows.length > 1) {
    prevButton = document.createElement('button');
    prevButton.className = 'carousel-nav prev emirates-nav';
    prevButton.innerHTML = '❮';
    prevButton.setAttribute('aria-label', 'Previous slide');
    prevButton.type = 'button';
    
    nextButton = document.createElement('button');
    nextButton.className = 'carousel-nav next emirates-nav';
    nextButton.innerHTML = '❯';
    nextButton.setAttribute('aria-label', 'Next slide');
    nextButton.type = 'button';
  }
  
  // Create dots/indicators (only if enabled and multiple slides)
  let dotsContainer;
  if (settings.showDots && slideRows.length > 1) {
    dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots emirates-dots';
    dotsContainer.setAttribute('role', 'tablist');
    dotsContainer.setAttribute('aria-label', 'Carousel slides');
    
    slideRows.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot emirates-dot';
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-controls', `slide-${index}`);
      dot.type = 'button';
      
      if (index === 0) {
        dot.classList.add('active');
        dot.setAttribute('aria-selected', 'true');
      } else {
        dot.setAttribute('aria-selected', 'false');
      }
      
      dotsContainer.appendChild(dot);
    });
  }
  
  // Create auto-play controls (only if autoplay is enabled)
  let controlsContainer, playPauseButton;
  if (settings.autoplay && slideRows.length > 1) {
    controlsContainer = document.createElement('div');
    controlsContainer.className = 'carousel-controls emirates-controls';
    
    playPauseButton = document.createElement('button');
    playPauseButton.className = 'carousel-play-pause emirates-play-pause';
    playPauseButton.textContent = 'Pause';
    playPauseButton.setAttribute('aria-label', 'Pause auto-play');
    playPauseButton.type = 'button';
    
    controlsContainer.appendChild(playPauseButton);
  }
  
  // Assemble carousel
  container.appendChild(wrapper);
  if (prevButton && nextButton) {
    container.appendChild(prevButton);
    container.appendChild(nextButton);
  }
  
  block.appendChild(container);
  
  if (dotsContainer) {
    block.appendChild(dotsContainer);
  }
  
  if (controlsContainer) {
    block.appendChild(controlsContainer);
  }
  
  // Only set up carousel functionality if there are multiple slides
  if (slideRows.length <= 1) {
    return; // Exit early for single slide
  }
  
  // Carousel state
  let currentSlide = 0;
  let isAutoPlaying = settings.autoplay;
  let autoPlayInterval;
  let touchStartX = 0;
  let touchEndX = 0;
  let isDragging = false;
  
  // Auto-play functionality
  const startAutoPlay = () => {
    if (!isAutoPlaying || slideRows.length <= 1) return;
    
    autoPlayInterval = setInterval(() => {
      nextSlide();
    }, (settings.interval * 1000)); // Use configured interval
  };
  
  const stopAutoPlay = () => {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  };
  
  // Navigation functions
  const goToSlide = (index) => {
    currentSlide = index;
    const offset = -currentSlide * 100;
    wrapper.style.transform = `translateX(${offset}%)`;
    
    // Update dots
    dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
      dot.setAttribute('aria-selected', i === currentSlide ? 'true' : 'false');
    });
    
    // Update slide IDs for accessibility
    wrapper.querySelectorAll('.carousel-slide').forEach((slide, i) => {
      slide.id = `slide-${i}`;
      slide.setAttribute('aria-hidden', i !== currentSlide ? 'true' : 'false');
    });
    
    // Announce slide change to screen readers
    if (window.lastAnnouncedSlide !== currentSlide) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Slide ${currentSlide + 1} of ${slideRows.length}`;
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
      
      window.lastAnnouncedSlide = currentSlide;
    }
  };
  
  const nextSlide = () => {
    if (currentSlide < slideRows.length - 1) {
      currentSlide++;
    } else if (settings.loop) {
      currentSlide = 0;
    }
    updateCarousel();
  };
  
  const prevSlide = () => {
    if (currentSlide > 0) {
      currentSlide--;
    } else if (settings.loop) {
      currentSlide = slideRows.length - 1;
    }
    updateCarousel();
  };
  
  // Update carousel display
  const updateCarousel = () => {
    const offset = -currentSlide * 100;
    wrapper.style.transform = `translateX(${offset}%)`;
    
    // Update dots (only if they exist)
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
        dot.setAttribute('aria-selected', i === currentSlide ? 'true' : 'false');
      });
    }
  };

  // Event listeners (only if elements exist)
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      stopAutoPlay();
      nextSlide();
      if (isAutoPlaying) startAutoPlay();
    });
  }
  
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      stopAutoPlay();
      prevSlide();
      if (isAutoPlaying) startAutoPlay();
    });
  }
  
  // Dot navigation (only if dots exist)
  if (dotsContainer) {
    dotsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('carousel-dot')) {
        const index = [...dotsContainer.children].indexOf(e.target);
        currentSlide = index;
        updateCarousel();
        stopAutoPlay();
        if (isAutoPlaying) startAutoPlay();
      }
    });
  }
  
  // Play/pause toggle (only if button exists)
  if (playPauseButton) {
    playPauseButton.addEventListener('click', () => {
      if (isAutoPlaying) {
        isAutoPlaying = false;
        stopAutoPlay();
        playPauseButton.textContent = 'Play';
        playPauseButton.setAttribute('aria-label', 'Start auto-play');
      } else {
        isAutoPlaying = true;
        startAutoPlay();
        playPauseButton.textContent = 'Pause';
        playPauseButton.setAttribute('aria-label', 'Pause auto-play');
      }
    });
  }
  
  // Keyboard navigation
  block.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        prevSlide();
        stopAutoPlay();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextSlide();
        stopAutoPlay();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        stopAutoPlay();
        break;
      case 'End':
        e.preventDefault();
        goToSlide(slideRows.length - 1);
        stopAutoPlay();
        break;
    }
  });
  
  // Touch/swipe support
  wrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    isDragging = true;
    wrapper.style.cursor = 'grabbing';
    stopAutoPlay();
  }, { passive: true });
  
  wrapper.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    touchEndX = e.touches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    // Add visual feedback during drag
    if (Math.abs(diff) > 10) {
      wrapper.classList.add('no-transition');
      const currentOffset = -currentSlide * 100;
      const dragOffset = (diff / wrapper.offsetWidth) * 100;
      wrapper.style.transform = `translateX(${currentOffset - dragOffset}%)`;
    }
  }, { passive: true });
  
  wrapper.addEventListener('touchend', () => {
    if (!isDragging) return;
    
    const diff = touchStartX - touchEndX;
    const threshold = 50; // Minimum swipe distance
    
    wrapper.classList.remove('no-transition');
    wrapper.style.cursor = '';
    isDragging = false;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide(); // Swipe left - next slide
      } else {
        prevSlide(); // Swipe right - previous slide
      }
    } else {
      // Snap back to current slide
      goToSlide(currentSlide);
    }
  }, { passive: true });
  
  // Mouse drag support for desktop
  let mouseDown = false;
  let startX = 0;
  
  wrapper.addEventListener('mousedown', (e) => {
    mouseDown = true;
    startX = e.clientX;
    wrapper.style.cursor = 'grabbing';
    wrapper.classList.add('grabbing');
    e.preventDefault();
  });
  
  wrapper.addEventListener('mousemove', (e) => {
    if (!mouseDown) return;
    
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 10) {
      wrapper.classList.add('no-transition');
      const currentOffset = -currentSlide * 100;
      const dragOffset = (diff / wrapper.offsetWidth) * 100;
      wrapper.style.transform = `translateX(${currentOffset - dragOffset}%)`;
    }
  });
  
  wrapper.addEventListener('mouseup', (e) => {
    if (!mouseDown) return;
    
    const diff = startX - e.clientX;
    const threshold = 50;
    
    mouseDown = false;
    wrapper.style.cursor = '';
    wrapper.classList.remove('grabbing', 'no-transition');
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      stopAutoPlay();
    } else {
      goToSlide(currentSlide);
    }
  });
  
  // Pause auto-play on hover
  block.addEventListener('mouseenter', stopAutoPlay);
  block.addEventListener('mouseleave', () => {
    if (isAutoPlaying) {
      startAutoPlay();
    }
  });
  
  // Pause auto-play when tab loses focus
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoPlay();
    } else if (isAutoPlaying) {
      startAutoPlay();
    }
  });
  
  // Respect user's motion preferences
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isAutoPlaying = false;
    playPauseButton.textContent = 'Play';
    playPauseButton.setAttribute('aria-label', 'Start auto-play');
  }
  
  // Initialize
  goToSlide(0);
  
  // Start auto-play if enabled and more than one slide
  if (isAutoPlaying && slideRows.length > 1) {
    startAutoPlay();
  }
  
  // Hide controls if only one slide
  if (slideRows.length <= 1) {
    if (prevButton) prevButton.style.display = 'none';
    if (nextButton) nextButton.style.display = 'none';
    if (dotsContainer) dotsContainer.style.display = 'none';
  }
  
  // Add ARIA attributes for accessibility
  block.setAttribute('role', 'region');
  block.setAttribute('aria-label', 'Image carousel');
  wrapper.setAttribute('aria-live', 'polite');
  
  // Intersection Observer for performance
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (isAutoPlaying && slideRows.length > 1) {
          startAutoPlay();
        }
      } else {
        stopAutoPlay();
      }
    });
  });
  
  observer.observe(block);
}
