import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  let footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  
  // Handle Universal Editor environment
  const isUniversalEditor = window.location.pathname.includes('/content/emirates/');
  if (isUniversalEditor) {
    // Extract language from current URL path
    const currentPath = window.location.pathname;
    let language = 'en'; // default to English
    
    // Detect language from URL structure like /content/emirates/country/language/
    const pathParts = currentPath.split('/');
    if (pathParts.length >= 5) {
      const potentialLang = pathParts[4]; // /content/emirates/country/language/
      if (['en', 'fr', 'es', 'de', 'ar'].includes(potentialLang)) {
        language = potentialLang;
      }
    }
    
    // Always use language-masters for the detected language in Universal Editor
    footerPath = `/content/emirates/language-masters/${language}/footer`;
  }
  
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  block.append(footer);
}
