import renderer from "react-test-renderer";
import ReactDOM from "react-dom";
import { ReactNode, ReactPortal } from "react";

import SlettFritekstvedleggModal from "./slettFritekstvedleggModal";

describe("slettFritekstvedleggModal", () => {
  beforeAll(() => {
    ReactDOM.createPortal = (node: ReactNode): ReactPortal => node as ReactPortal;
  });

  it("snapshot test", () => {
    const tree = renderer
      .create(<SlettFritekstvedleggModal open lukkModal={vi.fn()} slettVedlegg={vi.fn()} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
