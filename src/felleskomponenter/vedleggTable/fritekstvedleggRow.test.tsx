import FritekstvedleggRow from "./fritekstvedleggRow";
import { render } from "@testing-library/react";

describe("fritekstvedleggRow", () => {
  it("snapshot test", () => {
    const { container } = render(
      <FritekstvedleggRow
        fritekstvedlegg={{ tittel: "a", fritekst: "b" }}
        slettFritekstvedlegg={vi.fn()}
        redigerFritekstvedlegg={vi.fn()}
        index={1}
        lagFritekstPdfUrl={vi.fn()}
        redigerbart
      />
    );
    expect(container).toMatchSnapshot();
  });
});
