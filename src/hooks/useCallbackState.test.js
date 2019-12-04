import { renderHook, act } from '@testing-library/react-hooks';

import { useAsyncCallbackState, useCallbackState } from './useCallbackState';

describe('useCallbackState', () => {
  it('tar imot et callback og lagrer resultatet til state', async () => {
    const sum = (a, b) => a + b;
    const { result } = renderHook(() => useCallbackState(() => sum(1, 2), 0));

    const [state] = result.current;
    expect(state).toBe(3);
  });

  it('tar imot et async callback og lagrer resultatet til state', async () => {
    const asyncSum = async (a, b) => a + b;

    const rh = renderHook(() => useAsyncCallbackState(() => asyncSum(1, 2), 0));

    await act(async () => {
      await rh.waitForNextUpdate();
    });

    const [state] = rh.result.current;
    expect(state).toBe(3);
  });
});
