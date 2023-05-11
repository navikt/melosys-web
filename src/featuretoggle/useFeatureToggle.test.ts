import { renderHook } from "@testing-library/react-hooks";

import useFeatureToggle from "./useFeatureToggle";
import { FEATURE_TOGGLE } from "./toggleNavn";

interface SessionStorageMock {
  getAll: () => Record<string, any>;
  getItem: (key: string) => string | null;
  setItem: (key: string, value: any) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

const createSessionStorageMock = (data: Record<string, any> = {}): SessionStorageMock => {
  const sessionStorageData: Record<string, any> = { ...data };
  const sessionStorageMock: SessionStorageMock = {
    getAll: () => sessionStorageData,
    getItem: (key: string) => sessionStorageData[key],
    setItem: (key: string, value: any) => {
      sessionStorageData[key] = JSON.stringify(value);
    },
    removeItem: (key: string) => {
      delete sessionStorageData[key];
    },
    clear: () => {
      Object.keys(sessionStorageData).forEach((key) => {
        delete sessionStorageData[key];
      });
    },
  };
  Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageMock,
  });
  return sessionStorageMock;
};

describe("useFeatureToggle", () => {
  let sessionStorageMock: SessionStorageMock;

  beforeEach(() => {
    sessionStorageMock = createSessionStorageMock();
  });

  it("henter featuretoggles og sletter de", async () => {
    sessionStorageMock.setItem(FEATURE_TOGGLE, { testFeatureEnabled: true, testFeatureDisabled: false });

    const { result: enabledToggle } = renderHook(() => useFeatureToggle("testFeatureEnabled"));
    const toggleStatusEnabled = enabledToggle.current;
    const { result: disabledToggle } = renderHook(() => useFeatureToggle("testFeatureDisabled"));
    const toggleStatusDisabled = disabledToggle.current;

    expect(toggleStatusEnabled).toBe(true);
    expect(toggleStatusDisabled).toBe(false);

    sessionStorageMock.clear();

    const { result: enabledToggleCleared } = renderHook(() => useFeatureToggle("testFeatureEnabled"));
    const toggleStatusEnabledCleared = enabledToggleCleared.current;
    const { result: disabledToggleCleared } = renderHook(() => useFeatureToggle("testFeatureDisabled"));
    const toggleStatusDisabledCleared = disabledToggleCleared.current;

    expect(toggleStatusEnabledCleared).toBe(null);
    expect(toggleStatusDisabledCleared).toBe(null);
  });
});
