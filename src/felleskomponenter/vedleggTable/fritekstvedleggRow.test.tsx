import renderer from "react-test-renderer";
import FritekstvedleggRow from "./fritekstvedleggRow";

describe("fritekstvedleggRow", () => {
  it("snapshot test", () => {
    const tree = renderer
      .create(
        <FritekstvedleggRow
          fritekstvedlegg={{ tittel: "a", fritekst: "b" }}
          slettFritekstvedlegg={vi.fn()}
          redigerFritekstvedlegg={vi.fn()}
          index={1}
          lagFritekstPdfUrl={vi.fn()}
          redigerbart
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
