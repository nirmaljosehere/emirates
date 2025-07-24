import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('role', 'none');
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('role');
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

function getDirectTextContent(menuItem) {
  const menuLink = menuItem.querySelector(':scope > :where(a,p)');
  if (menuLink) {
    return menuLink.textContent.trim();
  }
  return Array.from(menuItem.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ');
}

async function buildBreadcrumbsFromNavTree(nav, currentUrl) {
  const crumbs = [];

  const homeUrl = document.querySelector('.nav-brand a').href;

  let menuItem = Array.from(nav.querySelectorAll('a')).find((a) => a.href === currentUrl);
  if (menuItem) {
    do {
      const link = menuItem.querySelector(':scope > a');
      crumbs.unshift({ title: getDirectTextContent(menuItem), url: link ? link.href : null });
      menuItem = menuItem.closest('ul')?.closest('li');
    } while (menuItem);
  } else if (currentUrl !== homeUrl) {
    crumbs.unshift({ title: getMetadata('og:title'), url: currentUrl });
  }

  const homePlaceholder = 'Home';

  crumbs.unshift({ title: homePlaceholder, url: homeUrl });

  // last link is current page and should not be linked
  if (crumbs.length > 1) {
    crumbs[crumbs.length - 1].url = null;
  }
  crumbs[crumbs.length - 1]['aria-current'] = 'page';
  return crumbs;
}

async function buildBreadcrumbs() {
  const breadcrumbs = document.createElement('nav');
  breadcrumbs.className = 'breadcrumbs';

  const crumbs = await buildBreadcrumbsFromNavTree(document.querySelector('.nav-sections'), document.location.href);

  const ol = document.createElement('ol');
  ol.append(...crumbs.map((item) => {
    const li = document.createElement('li');
    if (item['aria-current']) li.setAttribute('aria-current', item['aria-current']);
    if (item.url) {
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.title;
      li.append(a);
    } else {
      li.textContent = item.title;
    }
    return li;
  }));

  breadcrumbs.append(ol);
  return breadcrumbs;
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');  
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  console.log("navMeta>>>>>>>>>"+navMeta);
  console.log("navPath>>>>>>>>>"+navPath);
  console.log("fragment>>>>>>>>>", fragment);
  console.log("fragment.children>>>>>>>>>", fragment?.children);
  console.log("fragment.innerHTML>>>>>>>>>", fragment?.innerHTML);

  // decorate nav DOM
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools', 'country'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
    navSections.querySelectorAll('.button-container').forEach((buttonContainer) => {
      buttonContainer.classList.remove('button-container');
      buttonContainer.querySelector('.button').classList.remove('button');
    });
  }

  // Process country section for country selector
  const navCountry = nav.querySelector('.nav-country');
  if (navCountry) {
    setupCountrySelector(navCountry);
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    navWrapper.append(await buildBreadcrumbs());
  }

}

/**
 * Setup country selector in country section
 * @param {Element} navCountry The nav country section
 */
function setupCountrySelector(navCountry) {
  // Find any ul in the country section (this will be the country list)
  const countryList = navCountry.querySelector('ul');
  if (!countryList) return;

  // Create country selector button with icon
  const countryButton = document.createElement('button');
  countryButton.className = 'country-selector-button';
  countryButton.setAttribute('aria-expanded', 'false');
  countryButton.setAttribute('aria-haspopup', 'true');
  countryButton.setAttribute('aria-label', 'Select country and language');
  
  countryButton.innerHTML = `
    <img src="/icons/geo_language.svg" alt="Country & Language" class="country-icon">
    <span class="country-arrow">▼</span>
  `;

  // Transform the ul into a dropdown
  countryList.className = 'country-dropdown';
  countryList.setAttribute('role', 'menu');
  countryList.style.display = 'none';

  // Process nested lists for countries with multiple languages
  countryList.querySelectorAll('li').forEach(countryItem => {
    const countryLink = countryItem.querySelector('a');
    if (countryLink) {
      countryLink.setAttribute('role', 'menuitem');
    }

    // Handle nested language lists
    const languageList = countryItem.querySelector('ul');
    if (languageList) {
      countryItem.classList.add('has-languages');
      languageList.querySelectorAll('a').forEach(langLink => {
        langLink.setAttribute('role', 'menuitem');
      });
    }
  });

  // Create container and insert before the original list
  const countrySelector = document.createElement('div');
  countrySelector.className = 'country-selector';
  countrySelector.appendChild(countryButton);
  countrySelector.appendChild(countryList);

  // Replace the original list with our enhanced selector
  countryList.parentNode.replaceChild(countrySelector, countryList);

  // Add interaction events
  setupCountrySelectorEvents(countrySelector, countryButton, countryList);
}

/**
 * Setup country selector interaction events
 * @param {Element} countrySelector The country selector container
 * @param {Element} countryButton The country button
 * @param {Element} countryList The country dropdown list
 */
function setupCountrySelectorEvents(countrySelector, countryButton, countryList) {
  // Toggle dropdown on button click
  countryButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = countryButton.getAttribute('aria-expanded') === 'true';
    
    // Toggle dropdown
    const newState = !isExpanded;
    countryButton.setAttribute('aria-expanded', newState);
    countryList.style.display = newState ? 'block' : 'none';
    
    if (newState) {
      // Focus first item when opening
      const firstItem = countryList.querySelector('a');
      if (firstItem) {
        setTimeout(() => firstItem.focus(), 100);
      }
    }
  });

  // Handle country/language selection
  countryList.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      e.preventDefault();
      
      // Close dropdown
      countryButton.setAttribute('aria-expanded', 'false');
      countryList.style.display = 'none';
      
      // Log selection (replace with actual navigation)
      console.log(`Country/Language selected: ${e.target.textContent} (${e.target.href})`);
      
      // In real implementation, redirect to the selected country/language
      // window.location.href = e.target.href;
    }
  });

  // Keyboard navigation
  countryList.addEventListener('keydown', (e) => {
    const links = countryList.querySelectorAll('a');
    const currentIndex = Array.from(links).indexOf(e.target);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % links.length;
        links[nextIndex].focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + links.length) % links.length;
        links[prevIndex].focus();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        e.target.click();
        break;
      case 'Escape':
        e.preventDefault();
        countryButton.setAttribute('aria-expanded', 'false');
        countryList.style.display = 'none';
        countryButton.focus();
        break;
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!countrySelector.contains(e.target)) {
      countryButton.setAttribute('aria-expanded', 'false');
      countryList.style.display = 'none';
    }
  });

  // Close dropdown on escape key globally
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      countryButton.setAttribute('aria-expanded', 'false');
      countryList.style.display = 'none';
    }
  });
}
