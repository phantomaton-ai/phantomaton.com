const scrollkeeper = ({ element, target, scrolled, unscrolled }) => {
  const state = { scrolled: false };
  const keep = () => {
    const value = element.scrollTop > 0;
    if (value !== state.scrolled) {
      target.classList.add(value ? scrolled : unscrolled);
      target.classList.remove(!value ? scrolled : unscrolled);
    }
    state.scrolled = value;
  };

  element.addEventListener('scroll', keep);
  keep();

  return () => {
    element.removeEventListener('scroll', keep);
  };
};

export default scrollkeeper;
