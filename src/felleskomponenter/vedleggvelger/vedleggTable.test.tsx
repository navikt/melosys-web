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

describe("vedleggTable renders correctly ", () => {
  it("when valgteVedlegg is empty", () => {
    const tree = renderer
      .create(
        <VedleggTable
          valgteVedlegg={[]}
          alleVedlegg={[dokument]}
          redigerer={false}
          slettVedlegg={jest.fn()}
          leggTilVedlegg={jest.fn()}
          fritekstvedlegg={[fritekstvedlegg]}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
