import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";

import Begrunnelser from "./begrunnelser";

interface BegrunnelseKode {
  kode: string;
  term: string;
}

interface Props {
  label: string;
  valgteBegrunnelser: string[];
  muligeBegrunnelser: BegrunnelseKode[];
  fritekst: string | undefined;
}

describe("Begrunnelser", () => {
  let props: Props;

  beforeEach(() => {
    props = {
      label: "Begrunnelser",
      valgteBegrunnelser: ["KODE1", "KODE2", "KODE3"],
      muligeBegrunnelser: [
        { kode: "KODE1", term: "Term1" },
        { kode: "KODE3", term: "Term3" },
      ],
      fritekst: undefined,
    } as Props;
  });

  it("snapshot test", () => {
    const { container } = render(<Begrunnelser {...props} />);
    expect(container).toMatchSnapshot();
  });
});
