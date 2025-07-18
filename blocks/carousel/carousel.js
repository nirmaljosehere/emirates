/**
 * Carousel Block
 * Features: Touch/swipe support, auto-play, keyboard navigation, accessibility
 */

export default function decorate(block) {
  const slides = [...block.children];
  
  if (slides.length === 0) {
    return;
  }

  // Clear the block and create carousel structure
  block.innerHTML = '';
  
  const container = document.createElement('div');
  container.className = 'carousel-container';
  
  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';
  
  // Create slides
  slides.forEach((slide, index) => {
    const slideElement = document.createElement('div');
    slideElement.className = 'carousel-slide';
    slideElement.setAttribute('aria-label', `Slide ${index + 1} of ${slides.length}`);
    
    // Move content from original slide
    while (slide.firstChild) {
      slideElement.appendChild(slide.firstChild);
    }
    
    // Wrap text content in slide-content if no image is present
    const img = slideElement.querySelector('img');
    if (!img) {
      const content = document.createElement('div');
      content.className = 'slide-content';
      while (slideElement.firstChild) {
        content.appendChild(slideElement.firstChild);
      }
      slideElement.appendChild(content);
    } else {
      // Ensure image fills the slide
      img.setAttribute('loading', 'lazy');
      
      // Create content overlay if there's text content
      const textContent = slideElement.querySelector('h1, h2, h3, h4, h5, h6, p');
      if (textContent) {
        const content = document.createElement('div');
        content.className = 'slide-content';
        
        // Move all text elements to overlay
        const textElements = slideElement.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, .button-container');
        textElements.forEach(el => content.appendChild(el));
        
        slideElement.appendChild(content);
      }
    }
    
    wrapper.appendChild(slideElement);
  });
  
  // Create navigation arrows
  const prevButton = document.createElement('button');
  prevButton.className = 'carousel-nav prev';
  prevButton.innerHTML = '❮';
  prevButton.setAttribute('aria-label', 'Previous slide');
  prevButton.type = 'button';
  
  const nextButton = document.createElement('button');
  nextButton.className = 'carousel-nav next';
  nextButton.innerHTML = '❯';
  nextButton.setAttribute('aria-label', 'Next slide');
  nextButton.type = 'button';
  
  // Create dots/indicators
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'carousel-dots';
  dotsContainer.setAttribute('role', 'tablist');
  dotsContainer.setAttribute('aria-label', 'Carousel slides');
  
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
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
  
  // Create auto-play controls
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'carousel-controls';
  
  const playPauseButton = document.createElement('button');
  playPauseButton.className = 'carousel-play-pause';
  playPauseButton.textContent = 'Pause';
  playPauseButton.setAttribute('aria-label', 'Pause auto-play');
  playPauseButton.type = 'button';
  
  controlsContainer.appendChild(playPauseButton);
  
  // Assemble carousel
  container.appendChild(wrapper);
  container.appendChild(prevButton);
  container.appendChild(nextButton);
  
  block.appendChild(container);
  block.appendChild(dotsContainer);
  
  // Only show controls if more than one slide
  if (slides.length > 1) {
    block.appendChild(controlsContainer);
  }
  
  // Carousel state
  let currentSlide = 0;
  let isAutoPlaying = true;
  let autoPlayInterval;
  let touchStartX = 0;
  let touchEndX = 0;
  let isDragging = false;
  
  // Auto-play functionality
  const startAutoPlay = () => {
    if (!isAutoPlaying || slides.length <= 1) return;
    
    autoPlayInterval = setInterval(() => {
      nextSlide();
    }, 4000); // 4 seconds
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
      announcement.textContent = `Slide ${currentSlide + 1} of ${slides.length}`;
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
      
      window.lastAnnouncedSlide = currentSlide;
    }
  };
  
  const nextSlide = () => {
    const nextIndex = (currentSlide + 1) % slides.length;
    goToSlide(nextIndex);
  };
  
  const prevSlide = () => {
    const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
    goToSlide(prevIndex);
  };
  
  // Event listeners
  nextButton.addEventListener('click', () => {
    nextSlide();
    stopAutoPlay();
  });
  
  prevButton.addEventListener('click', () => {
    prevSlide();
    stopAutoPlay();
  });
  
  // Dot navigation
  dotsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('carousel-dot')) {
      const index = [...dotsContainer.children].indexOf(e.target);
      goToSlide(index);
      stopAutoPlay();
    }
  });
  
  // Play/pause toggle
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
        goToSlide(slides.length - 1);
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
  if (isAutoPlaying && slides.length > 1) {
    startAutoPlay();
  }
  
  // Hide controls if only one slide
  if (slides.length <= 1) {
    prevButton.style.display = 'none';
    nextButton.style.display = 'none';
    dotsContainer.style.display = 'none';
  }
  
  // Add ARIA attributes for accessibility
  block.setAttribute('role', 'region');
  block.setAttribute('aria-label', 'Image carousel');
  wrapper.setAttribute('aria-live', 'polite');
  
  // Intersection Observer for performance
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (isAutoPlaying && slides.length > 1) {
          startAutoPlay();
        }
      } else {
        stopAutoPlay();
      }
    });
  });
  
  observer.observe(block);
}
