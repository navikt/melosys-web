import { screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { render } from "@testing-library/react";
import {
  Innsynsmelding,
  VirksomhetMelding,
  IngenFlytMelding,
  NyVurderingMelding,
  StandardMeldingOverst,
  UlikPeriodeMelding,
} from "./alertmeldinger";

// Mock icons
vi.mock("../../resources/images", () => ({
  Remove: (props: { onClick?: () => void }) => <button onClick={props.onClick}>X</button>,
}));

describe("Alertmeldinger", () => {
  describe("Innsynsmelding", () => {
    it("skal vise innsynsmelding", () => {
      render(<Innsynsmelding />);

      expect(screen.getByText("Innsynsmodus")).toBeInTheDocument();
    });

    it("skal ha info variant", () => {
      const { container } = render(<Innsynsmelding />);

      const alert = container.querySelector(".navds-alert--info");
      expect(alert).toBeInTheDocument();
    });

    it("skal ha innsynsmelding CSS-klasse", () => {
      const { container } = render(<Innsynsmelding />);

      expect(container.querySelector(".innsynsmelding")).toBeInTheDocument();
    });

    it("skal støtte custom className", () => {
      const { container } = render(<Innsynsmelding className="custom-class" />);

      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  describe("VirksomhetMelding", () => {
    it("skal vise virksomhet melding", () => {
      render(<VirksomhetMelding />);

      expect(screen.getByText("Behandlingen er journalført på virksomhet")).toBeInTheDocument();
    });

    it("skal ha info variant", () => {
      const { container } = render(<VirksomhetMelding />);

      const alert = container.querySelector(".navds-alert--info");
      expect(alert).toBeInTheDocument();
    });

    it("skal ha virksomhetMelding CSS-klasse", () => {
      const { container } = render(<VirksomhetMelding />);

      expect(container.querySelector(".virksomhetMelding")).toBeInTheDocument();
    });
  });

  describe("IngenFlytMelding", () => {
    it("skal vise ingen flyt melding", () => {
      render(<IngenFlytMelding />);

      expect(screen.getByText("Du kan ikke gå videre, men:")).toBeInTheDocument();
    });

    it("skal ha warning variant", () => {
      const { container } = render(<IngenFlytMelding />);

      const alert = container.querySelector(".navds-alert--warning");
      expect(alert).toBeInTheDocument();
    });

    it("skal ha ingenFlytMelding CSS-klasse", () => {
      const { container } = render(<IngenFlytMelding />);

      expect(container.querySelector(".ingenFlytMelding")).toBeInTheDocument();
    });

    it("skal vise liste med instruksjoner", () => {
      render(<IngenFlytMelding />);

      expect(screen.getByText(/Send brev/)).toBeInTheDocument();
      expect(screen.getByText(/avslutte behandlingen/)).toBeInTheDocument();
      expect(screen.getByText(/MEDL og eventuelt avgiftssystemet/)).toBeInTheDocument();
    });

    it("skal ha liste med listePadding CSS-klasse", () => {
      const { container } = render(<IngenFlytMelding />);

      expect(container.querySelector(".listePadding")).toBeInTheDocument();
    });
  });

  describe("NyVurderingMelding", () => {
    it("skal vise ny vurdering melding", () => {
      render(<NyVurderingMelding />);

      expect(screen.getByText("Ny behandling av sak")).toBeInTheDocument();
    });

    it("skal ha warning variant", () => {
      const { container } = render(<NyVurderingMelding />);

      const alert = container.querySelector(".navds-alert--warning");
      expect(alert).toBeInTheDocument();
    });

    it("skal ha nyVurderingMelding CSS-klasse", () => {
      const { container } = render(<NyVurderingMelding />);

      expect(container.querySelector(".nyVurderingMelding")).toBeInTheDocument();
    });

    it("skal vise beskrivelse", () => {
      render(<NyVurderingMelding />);

      expect(
        screen.getByText(/Du har startet en ny behandling av en sak der tidligere behandling er avsluttet/),
      ).toBeInTheDocument();
    });
  });

  describe("UlikPeriodeMelding", () => {
    it("viser varsel ved ulike perioder", () => {
      render(<UlikPeriodeMelding />);

      expect(
        screen.getByText("Arbeidsgiver og arbeidstaker har oppgitt ulike perioder for utenlandsoppdraget."),
      ).toBeInTheDocument();
    });
  });

  describe("StandardMeldingOverst", () => {
    it("skal vise melding", () => {
      const mockAction = vi.fn();

      render(<StandardMeldingOverst variant="info" actionEtterSynlighet={mockAction} melding="Test melding" />);

      expect(screen.getByText("Test melding")).toBeInTheDocument();
    });

    it("skal ha korrekt variant", () => {
      const mockAction = vi.fn();
      const { container } = render(
        <StandardMeldingOverst variant="error" actionEtterSynlighet={mockAction} melding="Error melding" />,
      );

      const alert = container.querySelector(".navds-alert--error");
      expect(alert).toBeInTheDocument();
    });

    it("skal ha standardMeldingOverst CSS-klasse", () => {
      const mockAction = vi.fn();
      const { container } = render(
        <StandardMeldingOverst variant="info" actionEtterSynlighet={mockAction} melding="Test" />,
      );

      expect(container.querySelector(".standardMeldingOverst")).toBeInTheDocument();
    });

    it("skal vise Remove-ikon", () => {
      const mockAction = vi.fn();

      render(<StandardMeldingOverst variant="info" actionEtterSynlighet={mockAction} melding="Test" />);

      expect(screen.getByText("X")).toBeInTheDocument();
    });

    it("skal kalle actionEtterSynlighet når Remove-ikon klikkes", async () => {
      const mockAction = vi.fn();
      const user = userEvent.setup();

      render(<StandardMeldingOverst variant="info" actionEtterSynlighet={mockAction} melding="Test" />);

      const removeButton = screen.getByText("X");
      await user.click(removeButton);

      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it("skal skjule melding etter klikk på Remove", async () => {
      const mockAction = vi.fn();
      const user = userEvent.setup();

      render(<StandardMeldingOverst variant="info" actionEtterSynlighet={mockAction} melding="Test" />);

      const removeButton = screen.getByText("X");
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText("Test")).not.toBeInTheDocument();
      });
    });

    it("skal sette opp en timeout for automatisk skjuling", async () => {
      const mockAction = vi.fn();
      vi.useFakeTimers();

      render(<StandardMeldingOverst variant="info" actionEtterSynlighet={mockAction} melding="Test" />);

      // Komponenten skal vises først
      expect(screen.getByText("Test")).toBeInTheDocument();

      // Etter 3 sekunder skal den skjules
      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      // actionEtterSynlighet skal være kalt
      expect(mockAction).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it("skal kalle actionEtterSynlighet bare én gang ved klikk", async () => {
      const mockAction = vi.fn();
      const user = userEvent.setup();

      render(<StandardMeldingOverst variant="info" actionEtterSynlighet={mockAction} melding="Test" />);

      // Klikk på Remove-knappen
      const removeButton = screen.getByText("X");
      await user.click(removeButton);

      // Action skal være kalt én gang
      expect(mockAction).toHaveBeenCalledTimes(1);

      // Meldingen skal være borte
      await waitFor(() => {
        expect(screen.queryByText("Test")).not.toBeInTheDocument();
      });
    });

    it("skal støtte success variant", () => {
      const mockAction = vi.fn();
      const { container } = render(
        <StandardMeldingOverst variant="success" actionEtterSynlighet={mockAction} melding="Success!" />,
      );

      const alert = container.querySelector(".navds-alert--success");
      expect(alert).toBeInTheDocument();
    });

    it("skal støtte warning variant", () => {
      const mockAction = vi.fn();
      const { container } = render(
        <StandardMeldingOverst variant="warning" actionEtterSynlighet={mockAction} melding="Warning!" />,
      );

      const alert = container.querySelector(".navds-alert--warning");
      expect(alert).toBeInTheDocument();
    });

    it("skal returnere null når melding er skjult", async () => {
      const mockAction = vi.fn();

      const { container } = render(
        <StandardMeldingOverst variant="info" actionEtterSynlighet={mockAction} melding="Test" />,
      );

      // Komponenten vises først
      expect(container.querySelector(".standardMeldingOverst")).toBeInTheDocument();

      // Klikk på Remove-knappen
      const user = userEvent.setup();
      const removeButton = screen.getByText("X");
      await user.click(removeButton);

      // Etter klikk skal komponenten returnere null
      expect(screen.queryByText("Test")).not.toBeInTheDocument();
    });

    it("skal rydde opp timer ved unmount", async () => {
      vi.useFakeTimers();
      const mockAction = vi.fn();

      const { unmount } = render(
        <StandardMeldingOverst variant="info" actionEtterSynlighet={mockAction} melding="Test" />,
      );

      unmount();

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      // actionEtterSynlighet skal ikke kalles etter unmount
      expect(mockAction).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });
});
