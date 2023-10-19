import { useEffect } from "react";
import { formValueSelector } from "redux-form";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";

import * as Skjema from "../../../../felleskomponenter/skjema";
import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import * as Nav from "../../../../navFrontend";

import MKV from "../../../../melosyskodeverk";

const journalforingFormValueSelector = formValueSelector<KV.Form.SoknadFormData>(KV.Form.JOURNALFORING);
const { FULLMEKTIG_SØKNAD, FULLMEKTIG_ARBEIDSGIVER, FULLMEKTIG_TRYGDEAVGIFT } = MKV.Koder.fullmaktstype;

const mapStateToProps = (state: RootState) => ({
  avsenderNavn: journalforingFormValueSelector(state, "avsenderNavn"),
  avsenderID: journalforingFormValueSelector(state, "avsenderID"),
  annenPersonOrgErFullmektig: journalforingFormValueSelector(state, "annenPersonOrgErFullmektig"),
  fullmakter: journalforingFormValueSelector(state, "fullmakter"),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type AvsenderAnnenOrganisasjonPersonProps = PropsFromRedux & {
  settFeltInnhold: (felt: string, innhold: any) => void;
  hentOgVisAvsender: (ident: string) => void;
};

const AvsenderAnnenPersonOrganisasjon = ({
  avsenderID,
  settFeltInnhold,
  hentOgVisAvsender,
  avsenderNavn,
  annenPersonOrgErFullmektig,
  fullmakter = [],
}: AvsenderAnnenOrganisasjonPersonProps) => {
  const avsenderErPerson = Utils.person.erGyldigFnrEllerDnr(avsenderID);
  const avsenderErOrganisasjon = Utils.organisasjon.erOrgnrGyldig(avsenderID);
  const kanHaKontaktperson =
    avsenderErOrganisasjon && (fullmakter.includes(FULLMEKTIG_SØKNAD) || fullmakter.includes(FULLMEKTIG_ARBEIDSGIVER));

  useEffect(() => {
    settFeltInnhold("annenPersonOrgErFullmektig", null);
    settFeltInnhold("annenOrgErArbeidsgiver", null);
  }, [avsenderID]);

  useEffect(() => {
    if (annenPersonOrgErFullmektig) {
      settFeltInnhold("fullmektigID", avsenderID);
    } else {
      settFeltInnhold("fullmakter", []);
      settFeltInnhold("fullmektigID", null);
    }
  }, [annenPersonOrgErFullmektig]);

  useEffect(() => {
    if (!kanHaKontaktperson) {
      settFeltInnhold("fullmektigKontaktperson", null);
      settFeltInnhold("fullmektigKontaktOrgnr", null);
    }
  }, [kanHaKontaktperson]);

  const IDFeltTastOppHandler = async (sokStreng: string) => {
    if (Utils.organisasjon.erOrgnrGyldig(sokStreng) || Utils.person.erGyldigFnrEllerDnr(sokStreng)) {
      hentOgVisAvsender(sokStreng);
    }
  };

  const handleEndreFullmakt = (fullmakt: string) => {
    const nyeFullmakter = [...fullmakter];
    if (nyeFullmakter.includes(fullmakt)) {
      nyeFullmakter.splice(nyeFullmakter.indexOf(fullmakt), 1);
    } else {
      nyeFullmakter.push(fullmakt);
    }
    settFeltInnhold("fullmakter", nyeFullmakter);
  };

  return (
    <div className="avsender">
      <Skjema.FellesInputFnrDnrOrgnrSaksnr
        feltNavn="avsenderID"
        label="F.nr./d-nr. eller org.nr."
        onChange={IDFeltTastOppHandler}
        className="avsender__input"
        bredde="L"
      />
      <div className="avsender__navn">
        <Nav.Typo.Element className="avsender__navn__label">Navn: </Nav.Typo.Element>
        <Nav.Typo.Normaltekst>{avsenderNavn || ""}</Nav.Typo.Normaltekst>
      </div>

      {(avsenderErOrganisasjon || avsenderErPerson) && (
        <Skjema.Checkbox feltNavn="annenPersonOrgErFullmektig" label="Person/organisasjon er fullmektig" />
      )}

      {annenPersonOrgErFullmektig && (
        <>
          <Nav.Typo.Element className="overskrift_fullmakt">
            Hvilke fullmakter har personen/organisasjonen
          </Nav.Typo.Element>
          <Nav.Checkbox
            className="fullmakt"
            onChange={() => handleEndreFullmakt(FULLMEKTIG_SØKNAD)}
            label={<Nav.Typo.Normaltekst>Fullmektig for søknad</Nav.Typo.Normaltekst>}
            checked={fullmakter?.includes(FULLMEKTIG_SØKNAD)}
          />
          {avsenderErOrganisasjon && (
            <Nav.Checkbox
              className="fullmakt"
              onChange={() => handleEndreFullmakt(FULLMEKTIG_ARBEIDSGIVER)}
              label={<Nav.Typo.Normaltekst>Fullmektig for arbeidsgiver</Nav.Typo.Normaltekst>}
              checked={fullmakter?.includes(FULLMEKTIG_ARBEIDSGIVER)}
            />
          )}
          <Nav.Checkbox
            className="fullmakt"
            onChange={() => handleEndreFullmakt(FULLMEKTIG_TRYGDEAVGIFT)}
            label={<Nav.Typo.Normaltekst>Fullmektig for betaling av trygdeavgift</Nav.Typo.Normaltekst>}
            checked={fullmakter?.includes(FULLMEKTIG_TRYGDEAVGIFT)}
          />
        </>
      )}

      {kanHaKontaktperson && (
        <Nav.Row className="kontaktperson_wrapper">
          <Nav.Column xs="8">
            <Skjema.Input
              feltNavn="fullmektigKontaktperson"
              label={
                <>
                  <Nav.Typo.Element>Kontaktperson</Nav.Typo.Element>
                  <Nav.Typo.Normaltekst>(valgfritt)</Nav.Typo.Normaltekst>
                </>
              }
            />
          </Nav.Column>
          <Nav.Column xs="4">
            <Skjema.Input
              feltNavn="fullmektigKontaktOrgnr"
              label={
                <>
                  <Nav.Typo.Element>Org.nr.</Nav.Typo.Element>
                  <Nav.Typo.Normaltekst>(valgfritt)</Nav.Typo.Normaltekst>
                </>
              }
            />
          </Nav.Column>
        </Nav.Row>
      )}
    </div>
  );
};

export default connector(AvsenderAnnenPersonOrganisasjon);
