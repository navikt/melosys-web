import VedleggTable from "./vedleggTable";
import { render } from "@testing-library/react";

const dokument = {
  dokumentID: "1",
  tittel: "test",
  logiskeVedlegg: [],
  id: "1",
  journalpostID: "1",
  dato: null,
  avsenderEllerMottaker: "a",
};
const fritekstvedlegg = {
  tittel: "123",
  fritekst: "abc",
};

describe("vedleggTable", () => {
  it("snapshot test", () => {
    const { container } = render(
      <VedleggTable
        valgteVedlegg={[dokument]}
        fritekstvedlegg={[fritekstvedlegg]}
        setValgteVedlegg={vi.fn()}
        redigerFritekstvedlegg={vi.fn()}
        slettFritekstvedlegg={vi.fn()}
        label="a"
        redigerbart
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
