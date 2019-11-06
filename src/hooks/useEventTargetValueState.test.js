import { renderHook, act } from '@testing-library/react-hooks';

import useEventTargetValueState from './useEventTargetValueState';

describe('useEventTargetValueState', () => {
  it('tar imot en event og lagrer event.target.value til state', () => {
    const { result } = renderHook(() => useEventTargetValueState(1));
    const [, setState] = result.current;

    const event = { target: { value: 2 } };
    act(() => {
      setState(event);
    });

    const [state] = result.current;
    expect(state).toBe(event.target.value);
  });
});
