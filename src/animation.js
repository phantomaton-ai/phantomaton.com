// animation.js - Handles UI animations and effects
class AnimationController {
  constructor() {
    this.state = { counter: 0 };
    this.animate = this.animate.bind(this);
    
    this.init();
  }
  
  init() {
    // Start animation loop
    window.setInterval(this.animate, 1000 / 24);
  }
  
  animate() {
    const counter = Math.floor(Math.random() * 16);
    document.body.classList.remove(`counter-${this.state.counter}`);
    document.body.classList.add(`counter-${counter}`);
    this.state.counter = counter;
  }
}

// Export the class
export default AnimationController;