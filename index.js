import scrollkeeper from './src/scrollkeeper.js';
import framecounter from './src/framecounter.js';

document.addEventListener('DOMContentLoaded', () => {
  scrollkeeper({
    element: document.querySelector('main'),
    target: document.body,
    scrolled: 'scrolled',
    unscrolled: 'unscrolled'
  });

  framecounter({
    prefix: 'counter-',
    randomized: true,
    rate: 24,
    states: 16,
    target: document.body
  });
});
