import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import MKV from "../../../../../melosyskodeverk";

vi.mock("react-redux", () => ({
  useSelector: vi.fn(() => 1),
}));

vi.mock("../../../../../ducks/behandlinger", () => ({
  behandlingerSelectors: { BehandlingIDSelector: () => 1 },
}));

vi.mock("../../../../../hooks", () => ({
  useAsyncCallbackState: () => [null],
}));

vi.mock("../../../../../utils", () => ({
  _isEmpty: (val: any) => !val,
}));

vi.mock("../../../../../services/api", () => ({
  DokumenterV2: {
    hentMuligeMottakere: vi.fn(),
    tomHentMuligeMottakereResDto: () => null,
  },
}));

vi.mock("../../../../../felleskomponenter/dokumentliste", () => ({
  default: ({ dokumenter }: any) => <div>Dokumentliste: {dokumenter?.length}</div>,
}));

import { BrevMottakereTabell } from "./brevMottakereTabell";

describe("BrevMottakereTabell", () => {
  it("returnerer null når muligeMottakere er tom", () => {
    const { container } = render(<BrevMottakereTabell />);
    expect(container.innerHTML).toBe("");
  });

  it("verifiserer at MKV IKKE_YRKESAKTIV_VEDTAKSBREV eksisterer", () => {
    expect(MKV.Koder.brev.produserbaredokumenter.IKKE_YRKESAKTIV_VEDTAKSBREV).toBeDefined();
  });
});
