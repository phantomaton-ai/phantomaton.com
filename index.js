const state = { scrolled: false, counter: 0 };
const main = document.querySelector('main');


// index.js
const classifyScroll = () => {
  const scrolled = main.scrollTop > 0;
  // Fade in header background on scroll
  if (scrolled !== state.scrolled) {
    document.body.classList.add(scrolled ? 'scrolled' : 'unscrolled');
    document.body.classList.remove(!scrolled ? 'scrolled' : 'unscrolled');
  }
  state.scrolled = scrolled;
};

const keepCount = () => {
  const counter = Math.floor(Math.random() * 16);
  document.body.classList.remove(`counter-${state.counter}`);
  document.body.classList.add(`counter-${counter}`);
  state.counter = counter;
};

document.addEventListener('DOMContentLoaded', classifyScroll);
main.addEventListener('scroll', classifyScroll);
window.setInterval(keepCount, 1000 / 24);

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

fetch('images.txt').then(async res => {
  const text = await res.text();
  const images = text.split('\n').filter(i => !!i);
  const pct = 100 / images.length;
  shuffle(images);
  const keyframes = images.map((image, i) => `
    ${i * pct}% { background-image: url('images/${image}'); }
  `).join('\n');
  const css = `
    @keyframes carousel {
      ${keyframes}
    }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.body.prepend(style);
  
  images.forEach(image => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'preload');
    link.setAttribute('href', `images/${image}`);
    link.setAttribute('as', 'image');
    document.head.append(link);
  });
});
