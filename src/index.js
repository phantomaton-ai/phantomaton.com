import scrollkeeper from './scrollkeeper.js';
import framecounter from './framecounter.js';

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
    rate: 12,
    states: 16,
    target: document.body
  });
});
