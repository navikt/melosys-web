import { renderHook } from "@testing-library/react";

import { FEATURE_TOGGLE } from "./toggleNavn";

import * as featureToggleModule from "../featuretoggle";

interface SessionStorageMock {
  getAll: () => Record<string, any>;
  getItem: (key: string) => string | null;
  setItem: (key: string, value: any) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

vi.mock("../featuretoggle", () => ({
  __esModule: true,
  useFeatureToggle: vi.fn(),
}));

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

  it("henter featuretoggle som er sann", async () => {
    vi.spyOn(featureToggleModule, "useFeatureToggle").mockResolvedValue(true as never);
    sessionStorageMock.setItem(FEATURE_TOGGLE, { testFeatureEnabled: true });

    const { result: enabledToggle } = renderHook(() => featureToggleModule.useFeatureToggle("testFeatureEnabled"));
    const toggleStatusEnabled = await enabledToggle.current;

    expect(toggleStatusEnabled).toBe(true);

    sessionStorageMock.clear();
  });

  it("henter featuretoggle som er usann", async () => {
    vi.spyOn(featureToggleModule, "useFeatureToggle").mockResolvedValue(false as never);
    sessionStorageMock.setItem(FEATURE_TOGGLE, { testFeatureEnabled: true, testFeatureDisabled: false });

    const { result: disabledToggle } = renderHook(() => featureToggleModule.useFeatureToggle("testFeatureDisabled"));
    const toggleStatusDisabled = await disabledToggle.current;

    expect(toggleStatusDisabled).toBe(false);

    sessionStorageMock.clear();
  });
});
