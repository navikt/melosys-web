import * as Nav from "../../../../../../navFrontend";
import LabelMedHjelpetekst from "../../../../../../felleskomponenter/labelMedHjelpetekst";
import { KTObject } from "@navikt/melosys-kodeverk";

type BrukersSituasjonType = {
  muligeSituasjoner: KTObject[] | undefined;
  alleSituasjoner: Map<string, KTObject> | undefined;
  redigerbart: boolean;
};

export const BrukersSituasjon = ({ muligeSituasjoner, redigerbart, alleSituasjoner }: BrukersSituasjonType) => {
  const valgtSituasjon = alleSituasjoner?.get(`brukerssituasjon`);

  return (
    <Nav.Fieldset className="select" legend={<LabelMedHjelpetekst label="Angi brukers situasjon" />}>
      <Nav.Row>
        <Nav.Column xs="7">
          <Nav.Select
            label=""
            bredde="fullbredde"
            onChange={() => console.log("JAJA")}
            name="brukerssituasjon"
            value={valgtSituasjon?.kode}
            disabled={!redigerbart}
          >
            <option key="" value="" disabled={false}>
              Velg...
            </option>
            {muligeSituasjoner?.map((situasjon) => (
              <option key={situasjon.kode} value={situasjon.kode}>
                {situasjon.term}
              </option>
            ))}
          </Nav.Select>
        </Nav.Column>
      </Nav.Row>
    </Nav.Fieldset>
  );
};
