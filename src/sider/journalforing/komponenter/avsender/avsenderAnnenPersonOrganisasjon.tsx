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

      {(Utils.organisasjon.erOrgnrGyldig(avsenderID) || Utils.person.erGyldigFnrEllerDnr(avsenderID)) && (
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
          />
          {Utils.organisasjon.erOrgnrGyldig(avsenderID) && (
            <Nav.Checkbox
              className="fullmakt"
              onChange={() => handleEndreFullmakt(FULLMEKTIG_ARBEIDSGIVER)}
              label={<Nav.Typo.Normaltekst>Fullmektig for arbeidsgiver</Nav.Typo.Normaltekst>}
            />
          )}
          <Nav.Checkbox
            className="fullmakt"
            onChange={() => handleEndreFullmakt(FULLMEKTIG_TRYGDEAVGIFT)}
            label={<Nav.Typo.Normaltekst>Fullmektig for betaling av trygdeavgift</Nav.Typo.Normaltekst>}
          />
        </>
      )}

      {(fullmakter.includes(FULLMEKTIG_SØKNAD) || fullmakter.includes(FULLMEKTIG_ARBEIDSGIVER)) && (
        <div>
          <Skjema.Input
            feltNavn="fullmektigKontaktperson"
            label={
              <>
                <Nav.Typo.Element>Kontaktperson</Nav.Typo.Element>
                <Nav.Typo.Normaltekst>(valgfritt)</Nav.Typo.Normaltekst>
              </>
            }
          />
          <Skjema.Input
            feltNavn="fullmektigKontaktOrgnr"
            label={
              <>
                <Nav.Typo.Element>Org.nr.</Nav.Typo.Element>
                <Nav.Typo.Normaltekst>(valgfritt)</Nav.Typo.Normaltekst>
              </>
            }
          />
        </div>
      )}
    </div>
  );
};

export default connector(AvsenderAnnenPersonOrganisasjon);
