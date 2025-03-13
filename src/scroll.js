// scroll.js - Handles scroll-based UI transitions
class ScrollHandler {
  constructor(options = {}) {
    this.state = { scrolled: false };
    this.main = document.querySelector(options.mainSelector || 'main');
    this.bodyClass = {
      scrolled: options.scrolledClass || 'scrolled',
      unscrolled: options.unscrolledClass || 'unscrolled'
    };
    
    this.init();
  }
  
  init() {
    // Initial classification
    this.classifyScroll();
    
    // Add event listeners
    document.addEventListener('DOMContentLoaded', () => this.classifyScroll());
    this.main.addEventListener('scroll', () => this.classifyScroll());
  }
  
  classifyScroll() {
    const scrolled = this.main.scrollTop > 0;
    
    // Only update when state changes
    if (scrolled !== this.state.scrolled) {
      document.body.classList.add(scrolled ? this.bodyClass.scrolled : this.bodyClass.unscrolled);
      document.body.classList.remove(!scrolled ? this.bodyClass.scrolled : this.bodyClass.unscrolled);
      this.state.scrolled = scrolled;
    }
  }
}

// Export the class
export default ScrollHandler;