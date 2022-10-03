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

it("vedleggRow renders correctly ", () => {
  const tree = renderer.create(<VedleggRow slettVedlegg={jest.fn()} vedlegg={dokument} />).toJSON();
  expect(tree).toMatchSnapshot();
});
