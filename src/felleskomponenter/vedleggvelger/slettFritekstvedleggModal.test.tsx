import renderer from "react-test-renderer";
import SlettFritekstvedleggModal from "./slettFritekstvedleggModal";
import ReactDOM from "react-dom";
import { ReactNode, ReactPortal } from "react";

beforeAll(() => {
  ReactDOM.createPortal = (node: ReactNode): ReactPortal => node as ReactPortal;
});

it("slettFritekstvedleggModal renders correctly", () => {
  const tree = renderer
    .create(<SlettFritekstvedleggModal slettVedlegg={jest.fn()} onRequestClose={jest.fn()} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
