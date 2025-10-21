import { screen } from "@testing-library/react";
import { vi } from "vitest";
import { render } from "@testing-library/react";
import Behandlingsstatus, { BehandlingsstatusMedSvarfrist } from "./behandlingsstatus";
import MKV from "../../melosyskodeverk";

// Mock icons
vi.mock("../../resources/images", () => ({
  LockOpenFilled: ({ color }: { color: string }) => (
    <div data-testid="lock-open" data-color={color}>
      LockOpen
    </div>
  ),
  LockClosedFilled: ({ color }: { color: string }) => (
    <div data-testid="lock-closed" data-color={color}>
      LockClosed
    </div>
  ),
  ClockFilled: ({ color }: { color: string }) => (
    <div data-testid="clock" data-color={color}>
      Clock
    </div>
  ),
}));

// Mock kodeverk
vi.mock("../../kodeverk", () => ({
  objektTilTerm: (obj: any) => obj?.term || "Unknown",
}));

// Mock dato formatter
vi.mock("../../utils/dato", () => ({
  formatterDatoTilNorsk: (dato: string) => {
    if (!dato) return "";
    return "01.12.2024";
  },
}));

describe("Behandlingsstatus", () => {
  describe("Behandlingsstatus (default export)", () => {
    it("skal vise behandlingsstatus term", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.OPPRETTET,
        term: "Opprettet",
      };

      render(<Behandlingsstatus behandlingsstatus={behandlingsstatus} />);

      expect(screen.getByText("Opprettet")).toBeInTheDocument();
    });

    it("skal ha CSS-klasse behandlingsstatus__behandlingsstatus", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.OPPRETTET,
        term: "Opprettet",
      };

      const { container } = render(<Behandlingsstatus behandlingsstatus={behandlingsstatus} />);

      expect(container.querySelector(".behandlingsstatus__behandlingsstatus")).toBeInTheDocument();
    });

    it("skal vise LockOpenFilled ikon for OPPRETTET status", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.OPPRETTET,
        term: "Opprettet",
      };

      render(<Behandlingsstatus behandlingsstatus={behandlingsstatus} />);

      const ikon = screen.getByTestId("lock-open");
      expect(ikon).toBeInTheDocument();
      expect(ikon).toHaveAttribute("data-color", "#0056B4");
    });

    it("skal vise LockOpenFilled ikon for UNDER_BEHANDLING status", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
        term: "Under behandling",
      };

      render(<Behandlingsstatus behandlingsstatus={behandlingsstatus} />);

      const ikon = screen.getByTestId("lock-open");
      expect(ikon).toBeInTheDocument();
      expect(ikon).toHaveAttribute("data-color", "#0056B4");
    });

    it("skal vise LockOpenFilled ikon for SVAR_ANMODNING_MOTTATT status", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.SVAR_ANMODNING_MOTTATT,
        term: "Svar mottatt",
      };

      render(<Behandlingsstatus behandlingsstatus={behandlingsstatus} />);

      const ikon = screen.getByTestId("lock-open");
      expect(ikon).toBeInTheDocument();
    });

    it("skal vise LockOpenFilled ikon med orange farge for VURDER_DOKUMENT status", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.VURDER_DOKUMENT,
        term: "Vurder dokument",
      };

      render(<Behandlingsstatus behandlingsstatus={behandlingsstatus} />);

      const ikon = screen.getByTestId("lock-open");
      expect(ikon).toBeInTheDocument();
      expect(ikon).toHaveAttribute("data-color", "#D47B00");
    });

    it("skal vise ClockFilled ikon for AVVENT_DOK_UTL status", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL,
        term: "Avventer dok fra utland",
      };

      render(<Behandlingsstatus behandlingsstatus={behandlingsstatus} />);

      const ikon = screen.getByTestId("clock");
      expect(ikon).toBeInTheDocument();
      expect(ikon).toHaveAttribute("data-color", "#0056B4");
    });

    it("skal vise ClockFilled ikon for AVVENT_DOK_PART status", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART,
        term: "Avventer dok fra part",
      };

      render(<Behandlingsstatus behandlingsstatus={behandlingsstatus} />);

      const ikon = screen.getByTestId("clock");
      expect(ikon).toBeInTheDocument();
    });

    it("skal vise ClockFilled ikon for AVVENT_FAGLIG_AVKLARING status", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_FAGLIG_AVKLARING,
        term: "Avventer faglig avklaring",
      };

      render(<Behandlingsstatus behandlingsstatus={behandlingsstatus} />);

      const ikon = screen.getByTestId("clock");
      expect(ikon).toBeInTheDocument();
    });

    it("skal vise ClockFilled ikon for ANMODNING_UNNTAK_SENDT status", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT,
        term: "Anmodning unntak sendt",
      };

      render(<Behandlingsstatus behandlingsstatus={behandlingsstatus} />);

      const ikon = screen.getByTestId("clock");
      expect(ikon).toBeInTheDocument();
    });

    it("skal vise ClockFilled ikon med orange farge for TIDSFRIST_UTLOEPT status", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.TIDSFRIST_UTLOEPT,
        term: "Tidsfrist utløpt",
      };

      render(<Behandlingsstatus behandlingsstatus={behandlingsstatus} />);

      const ikon = screen.getByTestId("clock");
      expect(ikon).toBeInTheDocument();
      expect(ikon).toHaveAttribute("data-color", "#D47B00");
    });

    it("skal vise LockClosedFilled ikon for IVERKSETTER_VEDTAK status", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.IVERKSETTER_VEDTAK,
        term: "Iverksetter vedtak",
      };

      render(<Behandlingsstatus behandlingsstatus={behandlingsstatus} />);

      const ikon = screen.getByTestId("lock-closed");
      expect(ikon).toBeInTheDocument();
      expect(ikon).toHaveAttribute("data-color", "#6A6A6A");
    });

    it("skal vise LockClosedFilled ikon for MIDLERTIDIG_LOVVALGSBESLUTNING status", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.MIDLERTIDIG_LOVVALGSBESLUTNING,
        term: "Midlertidig lovvalgsbeslutning",
      };

      render(<Behandlingsstatus behandlingsstatus={behandlingsstatus} />);

      const ikon = screen.getByTestId("lock-closed");
      expect(ikon).toBeInTheDocument();
    });

    it("skal vise LockClosedFilled ikon for AVSLUTTET status", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET,
        term: "Avsluttet",
      };

      render(<Behandlingsstatus behandlingsstatus={behandlingsstatus} />);

      const ikon = screen.getByTestId("lock-closed");
      expect(ikon).toBeInTheDocument();
    });

    it("skal ikke vise ikon for ukjent status", () => {
      const behandlingsstatus = {
        kode: "UKJENT_STATUS",
        term: "Ukjent",
      };

      render(<Behandlingsstatus behandlingsstatus={behandlingsstatus} />);

      expect(screen.queryByTestId("lock-open")).not.toBeInTheDocument();
      expect(screen.queryByTestId("lock-closed")).not.toBeInTheDocument();
      expect(screen.queryByTestId("clock")).not.toBeInTheDocument();
    });

    it("skal håndtere manglende behandlingsstatus", () => {
      render(<Behandlingsstatus behandlingsstatus={undefined as any} />);

      expect(screen.getByText("Unknown")).toBeInTheDocument();
    });
  });

  describe("BehandlingsstatusMedSvarfrist", () => {
    it("skal vise behandlingsstatus", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.OPPRETTET,
        term: "Opprettet",
      };

      render(<BehandlingsstatusMedSvarfrist behandlingsstatus={behandlingsstatus} svarFrist={null} />);

      expect(screen.getByText("Opprettet")).toBeInTheDocument();
    });

    it("skal vise svarfrist når status er AVVENT_DOK_UTL", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL,
        term: "Avventer dok fra utland",
      };

      render(<BehandlingsstatusMedSvarfrist behandlingsstatus={behandlingsstatus} svarFrist="2024-12-01" />);

      expect(screen.getByText(/Svarfrist: 01.12.2024/)).toBeInTheDocument();
    });

    it("skal vise svarfrist når status er AVVENT_DOK_PART", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART,
        term: "Avventer dok fra part",
      };

      render(<BehandlingsstatusMedSvarfrist behandlingsstatus={behandlingsstatus} svarFrist="2024-12-01" />);

      expect(screen.getByText(/Svarfrist: 01.12.2024/)).toBeInTheDocument();
    });

    it("skal ikke vise svarfrist for andre statuser", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.OPPRETTET,
        term: "Opprettet",
      };

      render(<BehandlingsstatusMedSvarfrist behandlingsstatus={behandlingsstatus} svarFrist="2024-12-01" />);

      expect(screen.queryByText(/Svarfrist/)).not.toBeInTheDocument();
    });

    it("skal ikke vise svarfrist når den er null", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL,
        term: "Avventer dok fra utland",
      };

      render(<BehandlingsstatusMedSvarfrist behandlingsstatus={behandlingsstatus} svarFrist={null} />);

      expect(screen.queryByText(/Svarfrist/)).not.toBeInTheDocument();
    });

    it("skal ha CSS-klasse behandlingsstatus__behandlingsstatusMedSaksfrist", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.OPPRETTET,
        term: "Opprettet",
      };

      const { container } = render(
        <BehandlingsstatusMedSvarfrist behandlingsstatus={behandlingsstatus} svarFrist={null} />,
      );

      expect(container.querySelector(".behandlingsstatus__behandlingsstatusMedSaksfrist")).toBeInTheDocument();
    });

    it("skal støtte custom className", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.OPPRETTET,
        term: "Opprettet",
      };

      const { container } = render(
        <BehandlingsstatusMedSvarfrist
          behandlingsstatus={behandlingsstatus}
          svarFrist={null}
          className="custom-class"
        />,
      );

      const element = container.querySelector(".behandlingsstatus__behandlingsstatusMedSaksfrist");
      expect(element).toHaveClass("custom-class");
    });

    it("skal ha behandlingsstatus__span CSS-klasse på svarfrist span", () => {
      const behandlingsstatus = {
        kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL,
        term: "Avventer dok fra utland",
      };

      const { container } = render(
        <BehandlingsstatusMedSvarfrist behandlingsstatus={behandlingsstatus} svarFrist="2024-12-01" />,
      );

      const spans = container.querySelectorAll(".behandlingsstatus__span");
      expect(spans.length).toBeGreaterThan(0);
    });
  });

  describe("Export", () => {
    it("skal ha default export Behandlingsstatus", () => {
      expect(Behandlingsstatus).toBeDefined();
    });

    it("skal ha named export BehandlingsstatusMedSvarfrist", () => {
      expect(BehandlingsstatusMedSvarfrist).toBeDefined();
    });
  });
});
