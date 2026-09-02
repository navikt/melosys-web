import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import TekstblokkerFilter from "./tekstblokkerFilter";
import { Statusfilter } from "../../services/modules/tekstblokker";

const visFilter = (statusfilter: Statusfilter, setStatusfilter = vi.fn()) => {
  render(
    <TekstblokkerFilter
      type="TEKSTBLOKK"
      setType={vi.fn()}
      soek=""
      setSoek={vi.fn()}
      valgteTags={[]}
      setValgteTags={vi.fn()}
      tilgjengeligeTags={[]}
      statusfilter={statusfilter}
      setStatusfilter={setStatusfilter}
    />,
  );
  return setStatusfilter;
};

describe("TekstblokkerFilter – statusfilter", () => {
  it("markerer det valgte statusvalget", () => {
    visFilter("UTKAST");

    expect(screen.getByRole("button", { name: "Utkast" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Alle" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("melder fra om nytt statusvalg", async () => {
    const setStatusfilter = visFilter("ALLE");

    await userEvent.click(screen.getByRole("button", { name: "Publiserte" }));

    expect(setStatusfilter).toHaveBeenCalledWith("PUBLISERT");
  });
});
