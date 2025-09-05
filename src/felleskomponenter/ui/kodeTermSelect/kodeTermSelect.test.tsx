import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import KodeTermSelect from "./kodeTermSelect";

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

  // readonly settes ikke på selecten, men ligger som tittel i legend under svg
  describe("redigerbart prop", () => {
    it("true enabler select", () => {
      props.redigerbart = true;
      render(<KodeTermSelect {...props} />);
      expect(screen.queryByTitle("Skrivebeskyttet")).not.toBeInTheDocument();
    });

    it("false disabler select", () => {
      props.redigerbart = false;
      render(<KodeTermSelect {...props} />);
      expect(screen.getByTitle("Skrivebeskyttet")).toBeInTheDocument();
    });
  });
});
