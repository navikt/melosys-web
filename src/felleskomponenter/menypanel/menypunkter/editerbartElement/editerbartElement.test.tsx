import { ComponentProps } from "react";

import EditerbartElement from "./editerbartElement";
import { Status } from "./types";
import { render, screen } from "@testing-library/react";

describe("EditerbartElement", () => {
  const props: ComponentProps<typeof EditerbartElement> = {
    redigerbart: true,
  } as ComponentProps<typeof EditerbartElement>;

  it("viser innhold etter redigering er utført", () => {
    props.harData = true;
    props.redigeringUtfortRender = vi.fn(() => <span>Redigering utført</span>);

    render(<EditerbartElement {...props} />);
    expect(screen.getByText("Redigering utført")).toBeInTheDocument();
  });

  it("viser innhold for ingen data", () => {
    props.harData = false;
    props.ingenDataRender = vi.fn(() => <span>Ingen data funnet</span>);
    render(<EditerbartElement {...props} />);
    expect(screen.getByText("Ingen data funnet")).toBeInTheDocument();
  });

  it("viser innhold for redigering", () => {
    props.harData = false;
    props.ingenDataRender = (apneRedigering) => {
      apneRedigering();
      return <div />;
    };
    props.redigererRender = vi.fn(() => <span>Redigerer...</span>);

    render(<EditerbartElement {...props} />);
    expect(screen.getByText("Redigerer...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  describe("symbolsynlighet", () => {
    it("viser ingen symboler, kun lagre knapp ved redigering", () => {
      props.harData = false;
      props.redigererRender = vi.fn(() => <span />);

      render(<EditerbartElement {...props} />);
      expect(screen.getByText("Lagre")).toBeInTheDocument();
      expect(screen.queryAllByRole("button")).toHaveLength(1);
    });

    it("viser ingen knapper når harData er false", () => {
      props.harData = false;
      props.ingenDataRender = () => <span />;

      render(<EditerbartElement {...props} />);
      expect(screen.queryAllByRole("button")).toHaveLength(0);
    });

    it("viser symboler ved redigering utført ", () => {
      props.harData = true;
      props.redigeringUtfortRender = vi.fn(() => <span>Redigering utført</span>);

      render(<EditerbartElement {...props} />);
      expect(screen.queryByText("Lagre")).not.toBeInTheDocument();
      expect(screen.queryAllByRole("button")).toHaveLength(2);
    });

    it("får symbolsynlighet satt ved symbolsynlighet-prop", () => {
      const forventetSymbolsynlighet = { pencil: false, bin: false };
      props.symbolsynlighet = { [Status.RedigeringUtfort]: forventetSymbolsynlighet };
      props.harData = true;
      props.redigeringUtfortRender = vi.fn(() => <span>Redigering utført</span>);

      render(<EditerbartElement {...props} />);
      expect(screen.queryAllByRole("button")).toHaveLength(0);
    });
  });
});
