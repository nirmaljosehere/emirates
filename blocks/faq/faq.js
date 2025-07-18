/**
 * Emirates FAQ Block
 * Creates expandable FAQ items with accessibility features
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

// Toggle FAQ item
function toggleFAQ(questionElement, answerElement) {
  const isActive = questionElement.classList.contains('active');
  
  // Close all other FAQ items
  const allQuestions = questionElement.closest('.faq').querySelectorAll('.faq-question');
  const allAnswers = questionElement.closest('.faq').querySelectorAll('.faq-answer');
  
  allQuestions.forEach(q => q.classList.remove('active'));
  allAnswers.forEach(a => a.classList.remove('active'));
  
  // Toggle current item if it wasn't active
  if (!isActive) {
    questionElement.classList.add('active');
    answerElement.classList.add('active');
    
    // Set proper ARIA attributes
    questionElement.setAttribute('aria-expanded', 'true');
    answerElement.setAttribute('aria-hidden', 'false');
    
    // Smooth scroll to question if needed
    questionElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest' 
    });
  } else {
    questionElement.setAttribute('aria-expanded', 'false');
    answerElement.setAttribute('aria-hidden', 'true');
  }
}

// Parse FAQ data from content
function parseFAQData(content) {
  const rows = [...content.children];
  const faqs = [];
  let title = '';
  let intro = '';
  
  rows.forEach(row => {
    const cells = [...row.children];
    
    if (cells.length === 1) {
      const cellContent = cells[0].textContent.trim();
      const element = cells[0].querySelector('h1, h2, h3');
      
      if (element && !title) {
        title = cellContent;
      } else if (!title && cellContent.length > 0) {
        title = cellContent;
      } else if (title && !intro && cellContent.length > 100) {
        intro = cellContent;
      }
    } else if (cells.length >= 2) {
      const question = cells[0].textContent.trim();
      const answer = cells[1].innerHTML.trim();
      
      if (question && answer) {
        faqs.push({ question, answer });
      }
    }
  });
  
  return { title, intro, faqs };
}

// Create FAQ item element
function createFAQItem(faqData, index) {
  const item = document.createElement('div');
  item.className = 'faq-item';
  
  // Create question button
  const question = document.createElement('button');
  question.className = 'faq-question';
  question.setAttribute('aria-expanded', 'false');
  question.setAttribute('aria-controls', `faq-answer-${index}`);
  question.innerHTML = `
    <span>${faqData.question}</span>
    <span class="faq-icon" aria-hidden="true"></span>
  `;
  
  // Create answer container
  const answer = document.createElement('div');
  answer.className = 'faq-answer';
  answer.id = `faq-answer-${index}`;
  answer.setAttribute('aria-hidden', 'true');
  answer.innerHTML = `<div class="faq-answer-content">${faqData.answer}</div>`;
  
  // Add click handler
  question.addEventListener('click', () => {
    toggleFAQ(question, answer);
  });
  
  // Add keyboard handler
  question.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFAQ(question, answer);
    }
  });
  
  item.appendChild(question);
  item.appendChild(answer);
  
  return item;
}

export default function decorate(block) {
  const content = block.querySelector('div');
  
  if (!content) return;

  // Parse FAQ data
  const { title, intro, faqs } = parseFAQData(content);
  
  // Clear content and rebuild
  content.innerHTML = '';
  
  // Add title
  if (title) {
    const h2 = document.createElement('h2');
    h2.textContent = title;
    content.appendChild(h2);
  } else {
    const h2 = document.createElement('h2');
    h2.textContent = 'Frequently Asked Questions';
    content.appendChild(h2);
  }
  
  // Add intro if present
  if (intro) {
    const introP = document.createElement('p');
    introP.className = 'faq-intro';
    introP.textContent = intro;
    content.appendChild(introP);
  }
  
  // Create FAQ container
  const faqContainer = document.createElement('div');
  faqContainer.className = 'faq-container';
  
  // Add FAQ items
  if (faqs.length > 0) {
    faqs.forEach((faq, index) => {
      const item = createFAQItem(faq, index);
      faqContainer.appendChild(item);
    });
  } else {
    // Create default FAQs if none provided
    const defaultFAQs = [
      {
        question: 'What destinations are included in the winter sun promotion?',
        answer: 'Our winter sun destinations include Thailand, Seychelles, Mauritius, Australia, and many more tropical paradises. Each destination offers unique experiences and warm weather perfect for escaping the winter cold.'
      },
      {
        question: 'When is the best time to book my winter sun holiday?',
        answer: 'We recommend booking at least 6-8 weeks in advance to secure the best fares and availability. Peak winter months (December to March) tend to book up quickly, so early booking is essential.'
      },
      {
        question: 'What is included in the Emirates winter sun packages?',
        answer: 'Our packages typically include round-trip flights, hotel accommodations, airport transfers, and selected meals depending on the destination. Premium packages may also include additional tours and experiences.'
      },
      {
        question: 'Can I earn Emirates Skywards Miles on winter sun bookings?',
        answer: 'Yes, you can earn Emirates Skywards Miles on all eligible flights and hotel bookings. Miles earning depends on your fare type and membership tier. Premium members enjoy additional benefits and bonus miles.'
      },
      {
        question: 'What COVID-19 safety measures are in place?',
        answer: 'Emirates maintains the highest health and safety standards. This includes enhanced cleaning protocols, HEPA air filtration systems, flexible booking policies, and compliance with all destination health requirements.'
      }
    ];
    
    defaultFAQs.forEach((faq, index) => {
      const item = createFAQItem(faq, index);
      faqContainer.appendChild(item);
    });
  }
  
  content.appendChild(faqContainer);
  
  // Add CTA section
  const cta = document.createElement('div');
  cta.className = 'faq-cta';
  cta.innerHTML = `
    <h3>Still have questions?</h3>
    <p>Our customer service team is here to help you plan the perfect winter sun getaway.</p>
    <a href="#contact" class="button">Contact Us</a>
  `;
  content.appendChild(cta);
  
  // Add structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer.replace(/<[^>]*>/g, '') // Strip HTML tags
      }
    }))
  };
  
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
  
  // Initialize scroll animation
  observeElement(block);
  
  // Add keyboard navigation
  const questions = block.querySelectorAll('.faq-question');
  questions.forEach((question, index) => {
    question.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextQuestion = questions[index + 1];
        if (nextQuestion) nextQuestion.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevQuestion = questions[index - 1];
        if (prevQuestion) prevQuestion.focus();
      }
    });
  });
} 