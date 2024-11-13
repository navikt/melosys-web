import * as Forms from "../../../forms";
import { Control, FieldArrayWithId, FieldErrors, FieldValue, FieldValues } from "react-hook-form";
import * as Utils from "../../../../utils";
import * as Nav from "../../../../navFrontend";
import MKV from "../../../../melosyskodeverk";
import { KTObject } from "@navikt/melosys-kodeverk";
import * as Ikoner from "../../../../resources/images";
import * as Mui from "../../../ui";
import { AdresseOgFeil, FieldArrayProps, Fullmektig, Type } from "./types";
import BrevAdresse from "../../../adresser/brevAdresse";

const { FULLMEKTIG_SØKNAD, FULLMEKTIG_ARBEIDSGIVER } = MKV.Koder.fullmaktstype;

export const fullmaktStøtterKontaktperson = (fullmakter: string[]) =>
  fullmakter.includes(FULLMEKTIG_SØKNAD) || fullmakter.includes(FULLMEKTIG_ARBEIDSGIVER);

interface RedigererFullmektigProps {
  fullmektige: Fullmektig[];
  control: Control;
  update: (index: number, fullmektig: Fullmektig) => void;
  handleSlett: (index: number) => void;
  handleLeggTil: () => void;
  finnOrganisasjonAdresse: (orgnr: string) => Promise<AdresseOgFeil>;
  finnPersonAdresse: (personIdent: string) => Promise<AdresseOgFeil>;
  errors: FieldErrors<FieldValue<FieldValues & FieldArrayProps>>;
  trigger: (field: string) => void;
  fields: FieldArrayWithId<FieldArrayProps, "fullmektige">[];
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
  fields,
}: RedigererFullmektigProps) => {
  const handleIdChange = (ident: string, index: number) => {
    if (Utils.organisasjon.erOrgnrGyldig(ident)) {
      finnOrganisasjonAdresse(ident).then((response) =>
        update(index, {
          ...fullmektige[index],
          type: Type.ORGANISASJON,
          feil: response.feil,
          adresse: response.adresse,
        })
      );
    } else if (Utils.person.erGyldigFnrEllerDnr(ident)) {
      finnPersonAdresse(ident).then((response) =>
        update(index, {
          ...fullmektige[index],
          type: Type.PERSON,
          feil: response.feil,
          adresse: response.adresse,
        })
      );
    } else if (fullmektige[index].type) {
      update(index, {
        ...fullmektige[index],
        type: undefined,
        feil: undefined,
        adresse: undefined,
        kontaktperson: undefined,
        kontaktOrgnr: undefined,
        kontaktTelefon: undefined,
        kontaktOrgAdresse: undefined,
        fullmakter: [],
      });
    }
  };

  const handleKontaktOrgnrChange = (orgnr: string, index: number) => {
    if (Utils.organisasjon.erOrgnrGyldig(orgnr)) {
      finnOrganisasjonAdresse(orgnr).then((response) =>
        update(index, { ...fullmektige[index], kontaktOrgAdresse: response.adresse })
      );
    } else if (fullmektige[index].kontaktOrgAdresse) {
      update(index, { ...fullmektige[index], kontaktOrgAdresse: undefined });
    }
  };

  const kanHaKontaktperson = (fullmakter: string[], type?: Type) =>
    type === Type.ORGANISASJON && fullmaktStøtterKontaktperson(fullmakter);

  const handleFullmaktChange = (fullmakt: string, index: number, triggerValidation: boolean) => {
    const nyeFullmakter = [...fullmektige[index].fullmakter];
    if (nyeFullmakter.includes(fullmakt)) {
      nyeFullmakter.splice(nyeFullmakter.indexOf(fullmakt), 1);
    } else {
      nyeFullmakter.push(fullmakt);
    }

    const oppdatertFullmektig = { ...fullmektige[index], fullmakter: nyeFullmakter };

    if (kanHaKontaktperson(nyeFullmakter, oppdatertFullmektig.type)) {
      update(index, oppdatertFullmektig);
    } else {
      update(index, {
        ...oppdatertFullmektig,
        kontaktperson: undefined,
        kontaktOrgnr: undefined,
        kontaktTelefon: undefined,
        kontaktOrgAdresse: undefined,
      });
    }

    if (triggerValidation) {
      trigger(`fullmektige[${index}].fullmakter`);
    }
  };

  const andreFullmektigesFullmakter = (index: number) =>
    [...fullmektige].filter((it, itIndex) => index !== itIndex).flatMap((it) => it.fullmakter);

  const fullmaktErDisabled = (index: number, kode: string) => andreFullmektigesFullmakter(index).includes(kode);

  const gyldigeFullmakter = (type?: Type) =>
    type === Type.PERSON
      ? MKV.KTObjects.fullmaktstype.filter((it: KTObject) => it.kode !== FULLMEKTIG_ARBEIDSGIVER)
      : MKV.KTObjects.fullmaktstype;

  const visLeggTilKnapp =
    fullmektige.length < 3 && fullmektige.every((it) => it.type) && andreFullmektigesFullmakter(-1).length !== 3;

  return (
    <>
      {fullmektige.map(({ type, fullmakter, feil, adresse, kontaktOrgAdresse }: Fullmektig, index) => {
        const adresseErGyldig = !feil && adresse;
        // @ts-ignore
        const manglerFullmakt = errors?.fullmektige?.[index]?.fullmakter?.message?.melding;

        return (
          <div className="redigererFullmektig_container" key={fields[index].id}>
            <Forms.Input
              name={`fullmektige[${index}].ident`}
              label="Org.nr. eller f.nr./d-nr.:"
              control={control}
              onChange={(ident: string) => handleIdChange(ident, index)}
              error={feil}
              size="small"
            />

            {adresse && <BrevAdresse className="adresse" {...adresse} visNavn />}

            {adresseErGyldig && (
              <>
                <Nav.CheckboxGroup legend="Hvilke fullmakter har organisasjonen/personen" defaultValue={fullmakter}>
                  {gyldigeFullmakter(type).map((fullmakt: KTObject) => (
                    <Nav.Checkbox
                      key={fullmakt.kode}
                      value={fullmakt.kode}
                      onChange={(event) => handleFullmaktChange(event.target.value, index, Boolean(manglerFullmakt))}
                      disabled={fullmaktErDisabled(index, fullmakt.kode)}
                      error={Boolean(manglerFullmakt)}
                    >
                      {fullmakt.term}
                    </Nav.Checkbox>
                  ))}
                </Nav.CheckboxGroup>
                {manglerFullmakt && (
                  <Nav.Typo.Element className="fullmakt_errortext">{manglerFullmakt}</Nav.Typo.Element>
                )}
              </>
            )}

            {adresseErGyldig && kanHaKontaktperson(fullmakter, type) && (
              <div className="kontaktperson_container">
                <span className="kontaktperson_labels">
                  <Nav.Typo.Element>Kontaktopplysninger </Nav.Typo.Element>
                  <Nav.BodyLong size="small">(valgfritt)</Nav.BodyLong>
                </span>
                <Nav.Typo.EtikettLiten className="kontaktperson_info">
                  Brev sendes til denne personen/adressen.
                </Nav.Typo.EtikettLiten>
                <Nav.Row>
                  <Nav.Column xs="5">
                    <Forms.Input name={`fullmektige[${index}].kontaktperson`} control={control} label="Kontaktperson" />
                  </Nav.Column>
                  <Nav.Column xs="3">
                    <Forms.Input
                      name={`fullmektige[${index}].kontaktOrgnr`}
                      control={control}
                      label="Org.nr."
                      onChange={(orgnr) => handleKontaktOrgnrChange(orgnr, index)}
                    />
                  </Nav.Column>
                  <Nav.Column xs="3">
                    <Forms.Input name={`fullmektige[${index}].kontaktTelefon`} control={control} label="Telefon" />
                  </Nav.Column>
                </Nav.Row>
                {kontaktOrgAdresse && <BrevAdresse {...kontaktOrgAdresse} visNavn />}
              </div>
            )}

            <div className="knapperad">
              <Nav.Button
                variant="secondary"
                icon={<Ikoner.Bin aria-hidden className="slett_ikon" />}
                onClick={() => handleSlett(index)}
              >
                Slett fullmektig
              </Nav.Button>
            </div>
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
