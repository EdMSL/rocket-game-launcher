import React, { useRef } from 'react';

const DEFAULT_DELAY = 200;

export const useDebouncedFunction = (func, delay = DEFAULT_DELAY) => {
  const ref = useRef(null);

  return (...args): void => {
    //@ts-ignore
    clearTimeout(ref.current);
    //@ts-ignore
    ref.current = setTimeout(() => func(...args), delay);
  };
};
