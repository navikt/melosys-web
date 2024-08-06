import KodeTermSelect from "./kodeTermSelect";
import { render, screen } from "@testing-library/react";

describe("KodeTermSelect", () => {
  let props = null;

  beforeEach(() => {
    props = {
      koder: [],
      value: "",
      onChange: vi.fn(),
      label: "",
      feil: undefined,
      disableForsteValg: false,
      redigerbart: true,
    };
  });

  it("snapshot test", () => {
    const { container } = render(<KodeTermSelect {...props} />);
    expect(container).toMatchSnapshot();
  });

  it("har ett valg når koder prop er tom", () => {
    props.koder = [];
    render(<KodeTermSelect {...props} />);
    expect(screen.getByRole("option")).toBeInTheDocument();
  });

  it("mapper koder prop til valg i dropdownlist", () => {
    props.koder = [
      { kode: "kode1", term: "valg 1" },
      { kode: "kode2", term: "valg 2" },
    ];
    render(<KodeTermSelect {...props} />);
    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(screen.getByRole("option", { name: "valg 1" })).toBeInTheDocument();
  });

  describe("redigerbart prop", () => {
    it("true enabler select", () => {
      props.redigerbart = true;
      render(<KodeTermSelect {...props} />);
      expect(screen.getByRole("combobox")).toBeEnabled();
    });

    it("false disabler select", () => {
      props.redigerbart = false;
      render(<KodeTermSelect {...props} />);
      expect(screen.getByRole("combobox")).toBeDisabled();
    });
  });
});
