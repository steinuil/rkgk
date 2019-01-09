import { useState, useEffect, ChangeEventHandler, Dispatch } from 'react';

type UseTextInput = [string, ChangeEventHandler<HTMLInputElement>];

export function useTextInput(initial: string): UseTextInput {
  const [text, setText] = useState(initial);

  const handleChange: ChangeEventHandler<HTMLInputElement> = ({ target }) =>
    setText(target.value);

  return [text, handleChange];
}

type UseHistory<T> = [T, Dispatch<T>];

export function useHistory<T>(initialState: T): UseHistory<T> {
  const [state, setState] = useState(initialState);

  const pushState = (state: T) => {
    history.pushState(state, '');
    setState(state);
  };

  const restoreState = (ev: PopStateEvent) => {
    console.log(ev);
    if (ev.state) {
      setState(ev.state);
    }
  };

  useEffect(() => {
    // Push the initial state
    history.pushState(state, '');

    // Subscribe to history state changes
    window.addEventListener('popstate', restoreState);
    return () => {
      window.removeEventListener('popstate', restoreState);
    };
  }, []);

  return [state, pushState];
}
