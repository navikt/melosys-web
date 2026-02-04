import { describe, it, expect, beforeEach } from "vitest";

import { Faktura } from "./faktura";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

describe("Faktura", () => {
  let props: any;

  beforeEach(() => {
    props = {
      faktura: {
        datoBestilt: "2023-08-24",
        fakturaLinje: [],
        id: 1,
        periodeFra: "2023-04-01",
        periodeTil: "2023-08-31",
        status: "BESTILT",
        fakturaserieReferanse: "TEST-REF-123",
      },
      visReferanse: false,
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(
      <table>
        <tbody>
          <Faktura {...props} />
        </tbody>
      </table>,
    );

    expect(container).toMatchSnapshot();
  });
});
