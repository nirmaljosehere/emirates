/**
 * Emirates Flight Booking Widget
 * Dummy implementation - visual only, no actual booking functionality
 */

import { readBlockConfig } from '../../scripts/aem.js';

export default function decorate(block) {
  // Read configuration from Universal Editor
  const config = readBlockConfig(block);
  
  const settings = {
    title: config.title || 'Book your flight',
    departureAirport: config.departureairport || config.departureAirport || 'Birmingham (BHX)',
    showAdvancedSearch: config.showadvancedsearch === 'true' || config.showAdvancedSearch === true || !config.showadvancedsearch // default true
  };
  // Create the main booking widget structure
  const widget = document.createElement('div');
  widget.className = 'booking-widget';
  
  // Create tab navigation
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'booking-tabs';
  
  const flightTab = document.createElement('button');
  flightTab.className = 'booking-tab active';
  flightTab.textContent = 'Flight';
  flightTab.setAttribute('aria-selected', 'true');
  flightTab.setAttribute('role', 'tab');
  
  const flightHotelTab = document.createElement('button');
  flightHotelTab.className = 'booking-tab';
  flightHotelTab.textContent = 'Flight + hotel';
  flightHotelTab.setAttribute('aria-selected', 'false');
  flightHotelTab.setAttribute('role', 'tab');
  
  tabsContainer.appendChild(flightTab);
  tabsContainer.appendChild(flightHotelTab);
  
  // Create booking form
  const form = document.createElement('div');
  form.className = 'booking-form';
  
  // Advanced search link (conditional)
  const advancedSearch = document.createElement('div');
  advancedSearch.className = 'advanced-search';
  if (settings.showAdvancedSearch) {
    advancedSearch.innerHTML = '<a href="#">Advanced search: multi-city, promo codes, partner airlines ›</a>';
  }
  
  // Form fields container
  const fieldsContainer = document.createElement('div');
  fieldsContainer.className = 'form-fields';
  
  // Departure airport field
  const departureGroup = document.createElement('div');
  departureGroup.className = 'field-group departure-field';
  
  const departureLabel = document.createElement('label');
  departureLabel.className = 'field-label';
  departureLabel.textContent = 'Departure airport';
  
  const departureInput = document.createElement('input');
  departureInput.className = 'field-input';
  departureInput.type = 'text';
  departureInput.value = settings.departureAirport;
  departureInput.setAttribute('placeholder', 'Enter departure city or airport');
  
  const clearButton = document.createElement('button');
  clearButton.className = 'clear-button';
  clearButton.innerHTML = '×';
  clearButton.setAttribute('aria-label', 'Clear departure airport');
  
  departureGroup.appendChild(departureLabel);
  departureGroup.appendChild(departureInput);
  departureGroup.appendChild(clearButton);
  
  // Arrival airport field
  const arrivalGroup = document.createElement('div');
  arrivalGroup.className = 'field-group';
  
  const arrivalLabel = document.createElement('label');
  arrivalLabel.className = 'field-label';
  arrivalLabel.textContent = 'Arrival airport';
  
  const arrivalInput = document.createElement('input');
  arrivalInput.className = 'field-input';
  arrivalInput.type = 'text';
  arrivalInput.setAttribute('placeholder', 'Enter destination city or airport');
  
  arrivalGroup.appendChild(arrivalLabel);
  arrivalGroup.appendChild(arrivalInput);
  
  // Continue button
  const continueButton = document.createElement('button');
  continueButton.className = 'continue-button';
  continueButton.textContent = 'Continue';
  continueButton.type = 'button';
  
  fieldsContainer.appendChild(departureGroup);
  fieldsContainer.appendChild(arrivalGroup);
  fieldsContainer.appendChild(continueButton);
  
  if (settings.showAdvancedSearch) {
    form.appendChild(advancedSearch);
  }
  form.appendChild(fieldsContainer);
  
  widget.appendChild(tabsContainer);
  widget.appendChild(form);
  
  // Create services grid
  const servicesGrid = document.createElement('div');
  servicesGrid.className = 'services-grid';
  
  const services = [
    { icon: '🏨', title: 'Hotels', hasExternal: false },
    { icon: '🚗', title: 'Car rentals', hasExternal: true },
    { icon: '🏄‍♂️', title: 'Tours &\nactivities', hasExternal: false },
    { icon: '☀️', title: 'Book a holiday', hasExternal: true },
    { icon: '🏢', title: 'Dubai\nExperience', hasExternal: false },
    { icon: '👔', title: 'Chauffeur-drive', hasExternal: false },
    { icon: '🤝', title: 'Meet & Greet', hasExternal: true },
    { icon: '🚌', title: 'Airport transfers', hasExternal: true }
  ];
  
  services.forEach(service => {
    const serviceItem = document.createElement('a');
    serviceItem.className = 'service-item';
    serviceItem.href = '#';
    serviceItem.setAttribute('aria-label', service.title.replace('\n', ' '));
    
    if (service.hasExternal) {
      serviceItem.classList.add('external-link');
    }
    
    const icon = document.createElement('span');
    icon.className = 'service-icon';
    icon.textContent = service.icon;
    
    const title = document.createElement('span');
    title.className = 'service-title';
    title.textContent = service.title;
    
    serviceItem.appendChild(icon);
    serviceItem.appendChild(title);
    servicesGrid.appendChild(serviceItem);
  });
  
  // Clear existing content and add new structure
  block.innerHTML = '';
  block.appendChild(widget);
  block.appendChild(servicesGrid);
  
  // Add dummy interactions
  
  // Tab switching
  flightTab.addEventListener('click', () => {
    flightTab.classList.add('active');
    flightHotelTab.classList.remove('active');
    flightTab.setAttribute('aria-selected', 'true');
    flightHotelTab.setAttribute('aria-selected', 'false');
  });
  
  flightHotelTab.addEventListener('click', () => {
    flightHotelTab.classList.add('active');
    flightTab.classList.remove('active');
    flightHotelTab.setAttribute('aria-selected', 'true');
    flightTab.setAttribute('aria-selected', 'false');
  });
  
  // Clear button functionality
  clearButton.addEventListener('click', () => {
    departureInput.value = '';
    departureInput.focus();
  });
  
  // Dummy form submission
  continueButton.addEventListener('click', () => {
    if (!departureInput.value.trim() || !arrivalInput.value.trim()) {
      alert('Please enter both departure and arrival airports');
      return;
    }
    
    // Add loading state
    block.classList.add('loading');
    continueButton.textContent = 'Searching...';
    
    setTimeout(() => {
      block.classList.remove('loading');
      continueButton.textContent = 'Continue';
      alert(`Dummy search: ${departureInput.value} → ${arrivalInput.value}`);
    }, 2000);
  });
  
  // Service item clicks
  servicesGrid.addEventListener('click', (e) => {
    e.preventDefault();
    const serviceItem = e.target.closest('.service-item');
    if (serviceItem) {
      const serviceName = serviceItem.querySelector('.service-title').textContent;
      alert(`Redirecting to: ${serviceName.replace('\n', ' ')}`);
    }
  });
  
  // Enhanced accessibility
  
  // Keyboard navigation for tabs
  [flightTab, flightHotelTab].forEach((tab, index, tabs) => {
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = e.key === 'ArrowLeft' ? 
          (index - 1 + tabs.length) % tabs.length : 
          (index + 1) % tabs.length;
        tabs[nextIndex].focus();
        tabs[nextIndex].click();
      }
    });
  });
  
  // Input field enhancements
  departureInput.addEventListener('input', (e) => {
    // Simulate airport code suggestions (dummy)
    if (e.target.value.length >= 3) {
      console.log(`Searching airports for: ${e.target.value}`);
    }
  });
  
  arrivalInput.addEventListener('input', (e) => {
    // Simulate airport code suggestions (dummy)
    if (e.target.value.length >= 3) {
      console.log(`Searching airports for: ${e.target.value}`);
    }
  });
  
  // Form submission on Enter key
  [departureInput, arrivalInput].forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        continueButton.click();
      }
    });
  });
} 