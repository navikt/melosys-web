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

describe("vedleggRow", () => {
  it("snapshot test", () => {
    const tree = renderer.create(<VedleggRow slettVedlegg={vi.fn()} vedlegg={dokument} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
