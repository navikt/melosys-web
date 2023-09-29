import renderer from "react-test-renderer";
import { Skatteforholdsperioder } from "./skatteforholdsperioder";
import { useForm } from "react-hook-form";

vi.mock("../../../../../../utils", async () => {
  const actual = await vi.importActual("../../../../../../utils");
  return {
    // @ts-ignore
    ...actual,
    _uuid: () => "123",
  };
});

const SkatteforholdsperioderInjectedProps = (props: any) => {
  const form = useForm();
  return <Skatteforholdsperioder {...props} control={form.control} />;
};
describe("Skatteforholdsperioder", () => {
  const props = {
    formValues: {
      skatteforholdsperioder: [
        {
          fomDato: "01.10.2023",
          tomDato: "31.12.2023",
          skatteplikttype: "SKATTEPLIKTIG",
        },
        {
          fomDato: "01.01.2024",
          tomDato: "01.03.2024",
          skatteplikttype: "IKKE_SKATTEPLIKTIG",
        },
      ],
      inntektskilder: [
        {
          kildetype: "NÆRINGSINNTEKT_FRA_NORGE",
          arbAvgBetales: "FALSE",
          bruttoInntekt: 70000,
          fomDato: "01.10.2023",
          tomDato: "01.03.2024",
        },
      ],
    },
    fields: [
      {
        fomDato: "01.10.2023",
        tomDato: "31.12.2023",
        skatteplikttype: "SKATTEPLIKTIG",
        id: "ae597f7c-fef8-4e9a-9005-4a21218c0cd7",
      },
      {
        fomDato: "01.01.2024",
        tomDato: "01.03.2024",
        skatteplikttype: "IKKE_SKATTEPLIKTIG",
        id: "71e0ec35-318d-4b2a-900f-6240ed4556b7",
      },
    ],
    update: vi.fn(),
    remove: vi.fn(),
    append: vi.fn(),
    redigerbart: true,
    defaultPeriode: {
      fomDato: "01.10.2023",
      tomDato: "01.03.2024",
    },
  };

  it("snapshot test", () => {
    // Merk at dersom skatteforholdsperioder utvides med hjelpetekst i <LabelMedHjelpetekst/> må denne testen slettes.
    // Får dessverre ikke overstyrt generering av popover id som ligger nede i nav kode
    const tree = renderer.create(<SkatteforholdsperioderInjectedProps {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
