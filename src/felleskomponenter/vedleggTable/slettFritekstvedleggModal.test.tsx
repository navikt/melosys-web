import ReactDOM from "react-dom";
import { ReactNode, ReactPortal } from "react";

import SlettFritekstvedleggModal from "./slettFritekstvedleggModal";
import { render } from "@testing-library/react";

describe("slettFritekstvedleggModal", () => {
  beforeAll(() => {
    ReactDOM.createPortal = (node: ReactNode): ReactPortal => node as ReactPortal;
  });

  it("snapshot test", () => {
    const { container } = render(<SlettFritekstvedleggModal open lukkModal={vi.fn()} slettVedlegg={vi.fn()} />);
    expect(container).toMatchSnapshot();
  });
});
