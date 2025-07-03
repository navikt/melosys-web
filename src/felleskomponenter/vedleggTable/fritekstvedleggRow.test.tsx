import FritekstvedleggRow from "./fritekstvedleggRow";
import { render } from "@testing-library/react";
import React from "react";

// Mock the modal component to avoid HTML structure issues in tests
vi.mock("./slettFritekstvedleggModal", () => ({
  default: ({ open, children }: { open: boolean; children?: React.ReactNode }) =>
    open ? <div data-testid="mocked-modal">{children}</div> : null,
}));

describe("fritekstvedleggRow", () => {
  it("snapshot test", () => {
    const { container } = render(
      <table>
        <tbody>
          <FritekstvedleggRow
            fritekstvedlegg={{ tittel: "a", fritekst: "b" }}
            slettFritekstvedlegg={vi.fn()}
            redigerFritekstvedlegg={vi.fn()}
            index={1}
            lagFritekstPdfUrl={vi.fn()}
            redigerbart
          />
        </tbody>
      </table>,
    );
    expect(container).toMatchSnapshot();
  });
});
