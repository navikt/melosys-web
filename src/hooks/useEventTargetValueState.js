import { useState } from 'react';

const useEventTargetValueState = defaultState => {
  const [state, setState] = useState(defaultState);

  const setEventTargetValueState = event => {
    setState(event.target.value);
  };

  return [state, setEventTargetValueState];
};

export default useEventTargetValueState;
