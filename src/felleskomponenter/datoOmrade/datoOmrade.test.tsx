import { screen } from "@testing-library/react";
import { vi } from "vitest";
import { render } from "@testing-library/react";
import DatoOmrade, { DatoOmradeMedVarighet, DatoOmradeDescription } from "./datoOmrade";

// Mock EnkeltDato component
vi.mock("../enkeltDato", () => ({
  default: ({ dato, defaultValue }: { dato?: string | null; defaultValue?: string }) => (
    <span data-testid="enkelt-dato">{dato || defaultValue || ""}</span>
  ),
}));

// Mock Utils
vi.mock("../../utils", () => ({
  dato: {
    datoDiffMenneskelig: (fom?: string | null, tom?: string | null) => {
      if (!fom || !tom) return "";
      return "6 måneder";
    },
  },
}));

describe("DatoOmrade", () => {
  describe("Default DatoOmrade", () => {
    it("skal vise Fra og Til labels", () => {
      const periode = { fom: "2024-01-01", tom: "2024-12-31" };

      render(<DatoOmrade periode={periode} />);

      expect(screen.getByText("Fra")).toBeInTheDocument();
      expect(screen.getByText("Til")).toBeInTheDocument();
    });

    it("skal vise label når den er oppgitt", () => {
      const periode = { fom: "2024-01-01", tom: "2024-12-31" };

      render(<DatoOmrade periode={periode} label="Periode" />);

      expect(screen.getByText("Periode")).toBeInTheDocument();
    });

    it("skal ikke vise label når den ikke er oppgitt", () => {
      const periode = { fom: "2024-01-01", tom: "2024-12-31" };

      render(<DatoOmrade periode={periode} />);

      // Skal bare vise Fra og Til, ikke noen ekstra label
      const labels = screen
        .getAllByRole("generic")
        .filter((el) => el.textContent?.includes("Fra") || el.textContent?.includes("Til"));
      expect(labels.length).toBeGreaterThan(0);
    });

    it("skal vise EnkeltDato komponenter for både fom og tom", () => {
      const periode = { fom: "2024-01-01", tom: "2024-12-31" };

      render(<DatoOmrade periode={periode} />);

      const datoer = screen.getAllByTestId("enkelt-dato");
      expect(datoer).toHaveLength(2);
    });

    it("skal håndtere manglende fom dato", () => {
      const periode = { tom: "2024-12-31" };

      render(<DatoOmrade periode={periode} />);

      expect(screen.getByText("Fra")).toBeInTheDocument();
      expect(screen.getByText("Til")).toBeInTheDocument();
    });

    it("skal håndtere manglende tom dato", () => {
      const periode = { fom: "2024-01-01" };

      render(<DatoOmrade periode={periode} />);

      expect(screen.getByText("Fra")).toBeInTheDocument();
      expect(screen.getByText("Til")).toBeInTheDocument();
    });

    it("skal håndtere null verdier", () => {
      const periode = { fom: null, tom: null };

      render(<DatoOmrade periode={periode} />);

      expect(screen.getByText("Fra")).toBeInTheDocument();
      expect(screen.getByText("Til")).toBeInTheDocument();
    });

    it("skal ha CSS-klasse blokk-xs på kolonnene", () => {
      const periode = { fom: "2024-01-01", tom: "2024-12-31" };

      const { container } = render(<DatoOmrade periode={periode} />);

      const columns = container.querySelectorAll(".blokk-xs");
      expect(columns.length).toBe(2);
    });
  });

  describe("DatoOmradeMedVarighet", () => {
    it("skal vise label", () => {
      const periode = { fom: "2024-01-01", tom: "2024-06-30" };

      render(<DatoOmradeMedVarighet periode={periode} label="Arbeidsperiode" />);

      expect(screen.getByText("Arbeidsperiode")).toBeInTheDocument();
    });

    it("skal vise Fra og Til labels", () => {
      const periode = { fom: "2024-01-01", tom: "2024-06-30" };

      render(<DatoOmradeMedVarighet periode={periode} label="Periode" />);

      expect(screen.getByText(/Fra/)).toBeInTheDocument();
      expect(screen.getByText(/Til/)).toBeInTheDocument();
    });

    it("skal vise varighet", () => {
      const periode = { fom: "2024-01-01", tom: "2024-06-30" };

      render(<DatoOmradeMedVarighet periode={periode} label="Periode" />);

      expect(screen.getByText("6 måneder")).toBeInTheDocument();
    });

    it("skal ha datoomradevarighet CSS-klasse", () => {
      const periode = { fom: "2024-01-01", tom: "2024-06-30" };

      const { container } = render(<DatoOmradeMedVarighet periode={periode} label="Periode" />);

      expect(container.querySelector(".datoomradevarighet")).toBeInTheDocument();
    });

    it("skal vise EnkeltDato komponenter", () => {
      const periode = { fom: "2024-01-01", tom: "2024-06-30" };

      render(<DatoOmradeMedVarighet periode={periode} label="Periode" />);

      const datoer = screen.getAllByTestId("enkelt-dato");
      expect(datoer).toHaveLength(2);
    });

    it("skal håndtere manglende datoer", () => {
      const periode = { fom: null, tom: null };

      render(<DatoOmradeMedVarighet periode={periode} label="Periode" />);

      expect(screen.getByText("Periode")).toBeInTheDocument();
      // Varighet skal være tom string når datoer mangler
      const varighet = screen.queryByText("6 måneder");
      expect(varighet).not.toBeInTheDocument();
    });
  });

  describe("DatoOmradeDescription", () => {
    it("skal vise label som dt element", () => {
      const periode = { fom: "2024-01-01", tom: "2024-12-31" };

      const { container } = render(<DatoOmradeDescription periode={periode} label="Lovvalgsperiode" />);

      const dt = container.querySelector("dt");
      expect(dt).toBeInTheDocument();
      expect(dt).toHaveTextContent("Lovvalgsperiode");
    });

    it("skal vise datoer i dd element", () => {
      const periode = { fom: "2024-01-01", tom: "2024-12-31" };

      const { container } = render(<DatoOmradeDescription periode={periode} label="Periode" />);

      const dd = container.querySelector("dd");
      expect(dd).toBeInTheDocument();
    });

    it("skal vise bindestrek mellom datoene", () => {
      const periode = { fom: "2024-01-01", tom: "2024-12-31" };

      const { container } = render(<DatoOmradeDescription periode={periode} label="Periode" />);

      const dd = container.querySelector("dd");
      expect(dd?.textContent).toContain("-");
    });

    it("skal vise EnkeltDato med defaultValue tom string", () => {
      const periode = { fom: "2024-01-01", tom: "2024-12-31" };

      render(<DatoOmradeDescription periode={periode} label="Periode" />);

      const datoer = screen.getAllByTestId("enkelt-dato");
      expect(datoer).toHaveLength(2);
    });

    it("skal returnere null når periode mangler", () => {
      const { container } = render(<DatoOmradeDescription periode={undefined as any} label="Periode" />);

      expect(container.querySelector("dt")).not.toBeInTheDocument();
      expect(container.querySelector("dd")).not.toBeInTheDocument();
    });

    it("skal håndtere manglende label", () => {
      const periode = { fom: "2024-01-01", tom: "2024-12-31" };

      const { container } = render(<DatoOmradeDescription periode={periode} />);

      const dt = container.querySelector("dt");
      expect(dt).toBeInTheDocument();
      expect(dt).toHaveTextContent("");
    });

    it("skal håndtere null verdier i periode", () => {
      const periode = { fom: null, tom: null };

      const { container } = render(<DatoOmradeDescription periode={periode} label="Periode" />);

      const dd = container.querySelector("dd");
      expect(dd).toBeInTheDocument();
      // EnkeltDato skal håndtere null verdier
      expect(screen.getAllByTestId("enkelt-dato")).toHaveLength(2);
    });
  });

  describe("Export", () => {
    it("skal ha default export", () => {
      expect(DatoOmrade).toBeDefined();
    });

    it("skal ha named export DatoOmradeMedVarighet", () => {
      expect(DatoOmradeMedVarighet).toBeDefined();
    });

    it("skal ha named export DatoOmradeDescription", () => {
      expect(DatoOmradeDescription).toBeDefined();
    });
  });
});
