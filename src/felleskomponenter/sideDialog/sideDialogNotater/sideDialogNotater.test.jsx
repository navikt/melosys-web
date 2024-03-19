import SideDialogNotater from "./sideDialogNotater";
import { render } from "@testing-library/react";

describe("SideDialogNotater", () => {
  let props = null;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));

    props = {
      saksnummer: "1",
      redigerbart: true,
    };
  });

  it("snapshot test", () => {
    const { container } = render(<SideDialogNotater {...props} />);
    expect(container).toMatchSnapshot();
  });
});
