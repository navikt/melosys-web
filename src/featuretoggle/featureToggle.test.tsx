import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("./useFeatureToggle", () => ({
  default: vi.fn(),
}));

import useFeatureToggle from "./useFeatureToggle";
import FeatureToggle from "./featureToggle";

describe("FeatureToggle", () => {
  it("rendrer children med toggle=true når feature er aktivert", () => {
    (useFeatureToggle as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(
      <FeatureToggle togglename="test.feature">{(toggle) => (toggle ? <span>Aktivert</span> : null)}</FeatureToggle>,
    );

    expect(screen.getByText("Aktivert")).toBeDefined();
  });

  it("rendrer null når feature er deaktivert", () => {
    (useFeatureToggle as ReturnType<typeof vi.fn>).mockReturnValue(false);

    const { container } = render(
      <FeatureToggle togglename="test.feature">{(toggle) => (toggle ? <span>Aktivert</span> : null)}</FeatureToggle>,
    );

    expect(container.innerHTML).toBe("");
  });

  it("sender togglename til useFeatureToggle", () => {
    (useFeatureToggle as ReturnType<typeof vi.fn>).mockReturnValue(undefined);

    render(<FeatureToggle togglename="min.toggle">{() => <span>Test</span>}</FeatureToggle>);

    expect(useFeatureToggle).toHaveBeenCalledWith("min.toggle");
  });
});
