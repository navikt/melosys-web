import renderer from "react-test-renderer";

import VedleggRow from "./vedleggRow";

const dokument = {
  dokumentID: "1",
  tittel: "test",
  logiskeVedlegg: [],
  id: "1",
  journalpostID: "1",
  dato: null,
  avsenderEllerMottaker: "a",
};

describe("vedleggRow renders correctly ", () => {
  it("when redigerer is false", () => {
    const tree = renderer
      .create(
        <VedleggRow
          slettVedlegg={jest.fn()}
          vedlegg={dokument}
          leggTilVedlegg={jest.fn()}
          vedleggErMarkert={false}
          redigerer={false}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
