import * as Forms from "../../../forms";
import { Organisasjon } from "../../../../services/modules/types";
import { Personopplysninger } from "../../../../graphql";
import { Control, FieldErrors, FieldValue, FieldValues } from "react-hook-form";
import * as Utils from "../../../../utils";
import * as Nav from "../../../../navFrontend";
import Adresse from "./adresse";
import MKV from "../../../../melosyskodeverk";
import { KTObject } from "@navikt/melosys-kodeverk";
import * as Ikoner from "../../../../resources/images";
import * as Mui from "../../../ui";
import { FieldArrayProps, Fullmektig, Type } from "./types";
import { SkjemaelementFeilmelding } from "nav-frontend-skjema";

const { FULLMEKTIG_SØKNAD, FULLMEKTIG_ARBEIDSGIVER } = MKV.Koder.fullmaktstype;

interface RedigererFullmektigProps {
  fullmektige: Fullmektig[];
  control: Control;
  update: (index: number, fullmektig: Fullmektig) => void;
  handleSlett: (index: number) => void;
  handleLeggTil: () => void;
  finnOrganisasjonAdresse: (orgnr: string) => Promise<{ org?: Organisasjon; feil?: string }>;
  finnPersonAdresse: (personIdent: string) => Promise<{ person?: Personopplysninger; feil?: string }>;
  errors: FieldErrors<FieldValue<FieldValues & FieldArrayProps>>;
  trigger: (field: string) => void;
}

const RedigererFullmektig = ({
  fullmektige,
  control,
  update,
  handleSlett,
  handleLeggTil,
  finnOrganisasjonAdresse,
  finnPersonAdresse,
  errors,
  trigger,
}: RedigererFullmektigProps) => {
  const handleIdChange = (id: string, index: number) => {
    if (Utils.organisasjon.erOrgnrGyldig(id)) {
      finnOrganisasjonAdresse(id).then((response) =>
        update(index, { ...fullmektige[index], type: Type.ORGANISASJON, feil: response.feil, org: response.org })
      );
    } else if (Utils.person.erGyldigFnrEllerDnr(id)) {
      finnPersonAdresse(id).then((response) =>
        update(index, { ...fullmektige[index], type: Type.PERSON, feil: response.feil, person: response.person })
      );
    } else {
      update(index, { ...fullmektige[index], type: undefined, feil: undefined, person: undefined, org: undefined });
    }
  };

  const handleFullmaktChange = (fullmakt: string, index: number, triggerValidation: boolean) => {
    const nyeFullmakter = [...fullmektige[index].fullmakter];
    if (nyeFullmakter.includes(fullmakt)) {
      nyeFullmakter.splice(nyeFullmakter.indexOf(fullmakt), 1);
    } else {
      nyeFullmakter.push(fullmakt);
    }
    update(index, { ...fullmektige[index], fullmakter: nyeFullmakter });
    if (triggerValidation) {
      trigger(`fullmektige[${index}].fullmakter`);
    }
  };

  const fullmaktErDisabled = (index: number, kode: string) => {
    const andreFullmektigesFullmakter = [...fullmektige]
      .filter((it, itIndex) => index !== itIndex)
      .flatMap((it) => it.fullmakter);
    return andreFullmektigesFullmakter.includes(kode);
  };

  const gyldigeFullmakter = (type?: Type) => {
    return type === Type.PERSON
      ? MKV.KTObjects.fullmaktstype.filter((it: KTObject) => it.kode !== FULLMEKTIG_ARBEIDSGIVER)
      : MKV.KTObjects.fullmaktstype;
  };

  const visLeggTilKnapp = fullmektige.length < 3 && fullmektige.every((it) => it.type);
  return (
    <>
      {fullmektige.map(({ type, fullmakter, feil, person, org }: Fullmektig, index) => {
        const adresseErGyldig = !feil && (person || org);
        const kanHaKontaktperson =
          type === Type.ORGANISASJON &&
          (fullmakter.includes(FULLMEKTIG_SØKNAD) || fullmakter.includes(FULLMEKTIG_ARBEIDSGIVER));
        // @ts-ignore
        const manglerFullmakt = errors?.fullmektige?.[index]?.fullmakter?.message;

        return (
          <div className="redigererFullmektig_container">
            <Nav.Typo.Element className="id_label">Org.nr. eller f.nr./d-nr.:</Nav.Typo.Element>
            <span className="id_input">
              <Forms.Input
                name={`fullmektige[${index}].id`}
                label=""
                control={control}
                onChange={(id) => handleIdChange(id, index)}
                bredde="S"
                feil={feil}
              />
            </span>
            <Nav.Knapp className="slett_knapp" mini onClick={() => handleSlett(index)}>
              Slett Fullmektig
            </Nav.Knapp>

            <Adresse type={type} person={person} organisasjon={org} className="adresse" />

            {adresseErGyldig && (
              <>
                <Nav.Typo.Element className="overskrift_fullmakt">
                  Hvilke fullmakter har organisasjonen/personen
                </Nav.Typo.Element>
                {gyldigeFullmakter(type).map((fullmakt: KTObject) => (
                  <Nav.Checkbox
                    className="fullmakt"
                    value={fullmakt.kode}
                    label={fullmakt.term}
                    checked={fullmakter.includes(fullmakt.kode)}
                    onChange={(event) => handleFullmaktChange(event.target.value, index, Boolean(manglerFullmakt))}
                    disabled={fullmaktErDisabled(index, fullmakt.kode)}
                    feil={Boolean(manglerFullmakt)}
                  />
                ))}
                {manglerFullmakt && <SkjemaelementFeilmelding>{manglerFullmakt}</SkjemaelementFeilmelding>}
              </>
            )}

            {adresseErGyldig && kanHaKontaktperson && (
              <Nav.Row className="kontaktperson_container">
                <Nav.Column xs="5">
                  <Forms.Input
                    name={`fullmektige[${index}].kontaktperson`}
                    control={control}
                    label={
                      <span className="kontaktperson_labels">
                        <Nav.Typo.Element>Kontaktperson </Nav.Typo.Element>
                        <Nav.Typo.Normaltekst>(valgfritt)</Nav.Typo.Normaltekst>
                      </span>
                    }
                  />
                </Nav.Column>
                <Nav.Column xs="3">
                  <Forms.Input
                    name={`fullmektige[${index}].kontaktOrgnr`}
                    control={control}
                    label={
                      <span className="kontaktperson_labels">
                        <Nav.Typo.Element>Org.nr. </Nav.Typo.Element>
                        <Nav.Typo.Normaltekst>(valgfritt)</Nav.Typo.Normaltekst>
                      </span>
                    }
                  />
                </Nav.Column>
              </Nav.Row>
            )}
          </div>
        );
      })}
      {visLeggTilKnapp && (
        <Mui.Lenkeknapp onClick={handleLeggTil} ikon={Ikoner.Add} className="legg__til__knapp">
          Legg til ny fullmektig
        </Mui.Lenkeknapp>
      )}
    </>
  );
};

export default RedigererFullmektig;
