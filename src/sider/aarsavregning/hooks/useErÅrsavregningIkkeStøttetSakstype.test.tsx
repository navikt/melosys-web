import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { createTestStore } from "../../../ducks/test-utils/createTestStore";
import { useErÅrsavregningIkkeStøttetSakstype } from "./useErÅrsavregningIkkeStøttetSakstype";

const lagState = ({
  sakstype,
  sakstema,
  behandlingstema,
  toggles = {},
}: {
  sakstype?: string;
  sakstema?: string;
  behandlingstema?: string;
  toggles?: Record<string, boolean>;
}) => ({
  fagsaker: {
    status: "OK",
    data: {
      sakstype: sakstype ? { kode: sakstype } : undefined,
      sakstema: sakstema ? { kode: sakstema } : undefined,
    },
  },
  behandlinger: {
    status: "OK",
    data: {
      oppsummering: {
        behandlingstema: behandlingstema ? { kode: behandlingstema } : undefined,
      },
    },
  },
  featureToggle: {
    status: "OK",
    data: toggles,
  },
});

const renderMedState = (state: ReturnType<typeof lagState>) => {
  const store = createTestStore(state as any);
  return renderHook(() => useErÅrsavregningIkkeStøttetSakstype(), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
};

describe("useErÅrsavregningIkkeStøttetSakstype", () => {
  it("blokkerer EØS pensjonist (TRYGDEAVGIFT) når toggle er AV", () => {
    const { result } = renderMedState(
      lagState({ sakstype: "EU_EOS", sakstema: "TRYGDEAVGIFT", behandlingstema: "PENSJONIST" }),
    );
    expect(result.current).toBe(true);
  });

  it("blokkerer IKKE EØS pensjonist når toggle er PÅ", () => {
    const { result } = renderMedState(
      lagState({
        sakstype: "EU_EOS",
        sakstema: "TRYGDEAVGIFT",
        behandlingstema: "PENSJONIST",
        toggles: { "melosys.arsavregning.eos_pensjonist": true },
      }),
    );
    expect(result.current).toBe(false);
  });

  it("blokkerer EØS tjenesteperson (MEDLEMSKAP_LOVVALG) når toggle er AV", () => {
    const { result } = renderMedState(
      lagState({
        sakstype: "EU_EOS",
        sakstema: "MEDLEMSKAP_LOVVALG",
        behandlingstema: "ARBEID_TJENESTEPERSON_ELLER_FLY",
      }),
    );
    expect(result.current).toBe(true);
  });

  it("blokkerer IKKE EØS tjenesteperson når toggle er PÅ", () => {
    const { result } = renderMedState(
      lagState({
        sakstype: "EU_EOS",
        sakstema: "MEDLEMSKAP_LOVVALG",
        behandlingstema: "ARBEID_TJENESTEPERSON_ELLER_FLY",
        toggles: { "melosys.arsavregning.eos_tjenesteperson": true },
      }),
    );
    expect(result.current).toBe(false);
  });

  it("blokkerer ikke andre sakstype/tema/behandlingstema-kombinasjoner", () => {
    const { result } = renderMedState(
      lagState({ sakstype: "FTRL", sakstema: "TRYGDEAVGIFT", behandlingstema: "PENSJONIST" }),
    );
    expect(result.current).toBe(false);
  });
});
