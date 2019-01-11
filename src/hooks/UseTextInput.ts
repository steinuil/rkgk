import { useState, ChangeEventHandler } from 'react';

type UseTextInput = [string, ChangeEventHandler<HTMLInputElement>];

export function useTextInput(initial: string): UseTextInput {
  const [text, setText] = useState(initial);

  const handleChange: ChangeEventHandler<HTMLInputElement> = ({ target }) =>
    setText(target.value);

  return [text, handleChange];
}
