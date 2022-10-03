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

it("vedleggTable renders correctly", () => {
  const tree = renderer
    .create(
      <VedleggTable
        valgteVedlegg={[dokument]}
        fritekstvedlegg={[fritekstvedlegg]}
        setValgteVedlegg={jest.fn()}
        redigerFritekstvedlegg={jest.fn()}
        slettFritekstvedlegg={jest.fn()}
        label="a"
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
