import { useState, ChangeEventHandler } from 'react';

export const useTextInput = (
  initial: string
): [string, ChangeEventHandler<HTMLInputElement>] => {
  const [text, setText] = useState(initial);

  const handleChange: ChangeEventHandler<HTMLInputElement> = ({ target }) =>
    setText(target.value);

  return [text, handleChange];
};
