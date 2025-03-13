const framecounter = ({ prefix, randomized, rate, states, target }) => {
  const state = { counter: -1 };

  const count = () => {
    const counter = randomized
      ? Math.floor(Math.random() * states)
      : (state.counter + 1) % states;
    target.classList.remove(`${prefix}${state.counter}`);
    target.classList.add(`${prefix}${counter}`);
    state.counter = counter;
  };
  
  count();

  const interval = setInterval(count, 1000 / rate);
  return () => {
    clearInterval(interval);
  };
}

export default framecounter;
