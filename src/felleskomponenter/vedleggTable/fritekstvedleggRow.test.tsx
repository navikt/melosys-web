import renderer from "react-test-renderer";
import FritekstvedleggRow from "./fritekstvedleggRow";

it("fritekstvedleggRow renders correctly", () => {
  const tree = renderer
    .create(
      <FritekstvedleggRow
        fritekstvedlegg={{ tittel: "a", fritekst: "b" }}
        slettFritekstvedlegg={jest.fn()}
        redigerFritekstvedlegg={jest.fn()}
        index={1}
        lagFritekstPdfUrl={jest.fn()}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
