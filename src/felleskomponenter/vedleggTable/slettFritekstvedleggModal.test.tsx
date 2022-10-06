import renderer from "react-test-renderer";
import ReactDOM from "react-dom";
import { ReactNode, ReactPortal } from "react";

import SlettFritekstvedleggModal from "./slettFritekstvedleggModal";

beforeAll(() => {
  ReactDOM.createPortal = (node: ReactNode): ReactPortal => node as ReactPortal;
});

it("slettFritekstvedleggModal renders correctly", () => {
  const tree = renderer
    .create(<SlettFritekstvedleggModal slettVedlegg={jest.fn()} onRequestClose={jest.fn()} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
