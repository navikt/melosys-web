import renderer from "react-test-renderer";

import VedleggTable from "./vedleggTable";

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
    const tree = renderer
      .create(
        <VedleggTable
          valgteVedlegg={[dokument]}
          fritekstvedlegg={[fritekstvedlegg]}
          setValgteVedlegg={vi.fn()}
          redigerFritekstvedlegg={vi.fn()}
          slettFritekstvedlegg={vi.fn()}
          label="a"
          redigerbart={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
