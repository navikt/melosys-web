import React, { useEffect } from "react";
import { reset, formValueSelector } from "redux-form";
import { connect } from "react-redux";
import PT from "prop-types";

import MKV from "../../../../melosyskodeverk";

import * as Nav from "../../../../navFrontend";
import * as MPT from "../../../../proptypes";
import * as KV from "../../../../kodeverk";

import LandLinje from "./landlinje";
import EnkeltAvklartfakta from "../felles/enkeltAvklartfakta";
import { VurderingVesentligAktivitetINorgeTyper } from "../../../../kodeverk/koder";
import {
  konverterAvklartfaktaTilStegData,
  lagAvklartfakta,
  lagLovvalgsbestemmelse,
  slettLovvalgsbestemmelse,
  konverterLovvalgsbestemmelseTilStegData,
  lagTilleggBestemmelse,
  slettTilleggBestemmelse,
  konverterTilleggBestemmelseTilStegData,
} from "../../../../felleskomponenter/stegvelger";
import { hentFaktaVerdi } from "../../../../regler/avklartefakta";
import { BOOLSK_STRING } from "../../../../constants";

import "./vurderingArbeidsmonster.css";

export const UkjenteEllerFlereEosLandLinje = () => (
  <LandLinje land="Flere EØS-land/Sveits. Ikke kjent hvilke" checkbox={{ redigerbart: false, checked: true }} />
);

/**
 * Enkeltsjekkboks for marginalt arbeid i et land.
 *
 * @param props Objekt Diverse props (se propTypes)
 */
export const CheckableLandLinje = (props) => {
  const { landKode, avklartMarginaltArbeidILand, oppdaterData, redigerbart, resetForm } = props;

  useEffect(() => {
    if (avklartMarginaltArbeidILand) {
      oppdaterData(
        konverterAvklartfaktaTilStegData(MKV.Koder.avklartefaktatyper.MARGINALT_ARBEID, avklartMarginaltArbeidILand)
      );
    }
  }, []);

  const erMarginaltArbeidIArbeidsland =
    avklartMarginaltArbeidILand && avklartMarginaltArbeidILand.fakta.includes("TRUE");

  const klikkHandler = () => {
    const verdi = erMarginaltArbeidIArbeidsland ? BOOLSK_STRING.USANN : BOOLSK_STRING.SANN;
    oppdaterData(lagAvklartfakta(MKV.Koder.avklartefaktatyper.MARGINALT_ARBEID, landKode.kode, verdi));

    /* Ved valg av marginale land(skal ikke ha SED), reinitialize former med mottakerinstitusjoner,
    slik at mottakerinstitusjoner i vedtakssteget/utpekingssteg oppdateres.
    Unngår at bruker må endre på radioknapp "Vurdering av vesentlig aktivitet i Norge" for å oppdatere de nevnte stegene. */
    resetForm(KV.Form.ARTIKKEL_13_X_VEDTAK);
    resetForm(KV.Form.ARTIKKEL_13_UTPEKLAND);
  };

  return (
    <LandLinje
      land={`${landKode.term} (${landKode.kode})`}
      checkbox={{
        redigerbart,
        checked: erMarginaltArbeidIArbeidsland === true,
        value: BOOLSK_STRING.SANN,
        onCheck: klikkHandler,
      }}
    />
  );
};

CheckableLandLinje.propTypes = {
  oppdaterData: PT.func.isRequired,
  landKode: MPT.Kodeverk.isRequired,
  avklartMarginaltArbeidILand: PT.object,
  redigerbart: PT.bool.isRequired,
  resetForm: PT.func.isRequired,
};

CheckableLandLinje.defaultProps = {
  avklartMarginaltArbeidILand: undefined,
};

const landLinjeMapDispatchToProps = (dispatch) => ({
  resetForm: (form) => dispatch(reset(form)),
});

export const ConnectedCheckableLandLinje = connect(null, landLinjeMapDispatchToProps)(CheckableLandLinje);

export const MarginaltArbeid = ({
  arbeidsland,
  redigerbart,
  marginaltArbeid,
  oppdaterData,
  soknadsland: { erUkjenteEllerAlleEosLand },
}) => {
  const landlinjer = erUkjenteEllerAlleEosLand ? (
    <UkjenteEllerFlereEosLandLinje />
  ) : (
    arbeidsland.map(({ land }) => {
      const avklartMarginaltArbeidILand = marginaltArbeid.find(
        (enkeltAvklaring) => enkeltAvklaring.subjektID === land.kode
      );

      const key = `marginaltArbeidslandListe${land.kode}`;
      return (
        <ConnectedCheckableLandLinje
          landKode={land}
          avklartMarginaltArbeidILand={avklartMarginaltArbeidILand}
          key={key}
          oppdaterData={oppdaterData}
          redigerbart={redigerbart}
        />
      );
    })
  );

  return (
    <Nav.Fieldset legend="Er det marginalt arbeid i noen av landene?">
      <div className="marginaltArbeid">
        <div className="landliste_innhold">
          <div className="land__enkeltlinje">
            <Nav.Typo.UndertekstBold>Land</Nav.Typo.UndertekstBold>
            <Nav.Typo.UndertekstBold className="marginaltArbeidCheckbox">
              Marginalt arbeid? {"(<5%)"}
            </Nav.Typo.UndertekstBold>
          </div>
          {landlinjer}
        </div>
      </div>
    </Nav.Fieldset>
  );
};

MarginaltArbeid.propTypes = {
  arbeidsland: PT.arrayOf(MPT.ArbeidslandMedYrkesaktivitet),
  marginaltArbeid: PT.array,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  soknadsland: PT.object.isRequired,
};

MarginaltArbeid.defaultProps = {
  arbeidsland: [],
  marginaltArbeid: [],
};

const soknadFormValueSelector = formValueSelector(KV.Form.SOKNAD);

const marginaltArbeidMapStateToProps = (state) => ({
  soknadsland: soknadFormValueSelector(state, "soknadsland"),
});

const ConnectedMarginaltArbeid = connect(marginaltArbeidMapStateToProps)(MarginaltArbeid);

/**
 * Dette er hovedkomponenten for fanen "Arbeidsmønster". Denne trekker inn MarginaltArbeid som er utlistingen av sjekkbokser og håndtereren
 * av event handlers hvor bruker velger marginalt arbeid i land.
 *
 * @param props
 */
export const VurderingArbeidsmonster = ({
  bekreftOgFortsett,
  arbeidsland,
  tilstand,
  redigerbart,
  oppdaterData,
  slettData,
}) => {
  const {
    marginaltArbeid,
    aktivitetINorge,
    aktivitetINorgeNodvendig,
    erArbeidstakerOgSelvstendigNaeringsdrivende,
    erOffentligTjenestemann,
    harAvklaring,
    yrkesaktivitet,
    loennetArbeidAntallLandFakta,
    offentligArbeidAntallLandFakta,
  } = tilstand;

  const loennetArbeidEndretHandler = (avklartLoennetArbeid) => {
    if (
      avklartLoennetArbeid === KV.Koder.LoennetArbeidAntallLand.NORGE ||
      avklartLoennetArbeid === KV.Koder.LoennetArbeidAntallLand.ETT_ANNET_LAND
    ) {
      oppdaterData(
        lagLovvalgsbestemmelse(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_3)
      );
      slettData(slettTilleggBestemmelse());
    } else if (avklartLoennetArbeid === KV.Koder.LoennetArbeidAntallLand.FLERE_LAND) {
      slettData(slettLovvalgsbestemmelse());
      oppdaterData(
        lagTilleggBestemmelse(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_3)
      );
    }
  };

  const offentligArbeidEndretHandler = (avklartOffentligArbeid) => {
    if (
      avklartOffentligArbeid === KV.Koder.OffentligArbeidAntallLand.NORGE_OG_ANNEN_VIRKSOMHET ||
      avklartOffentligArbeid === KV.Koder.OffentligArbeidAntallLand.ANNET_LAND_OG_ANNEN_VIRKSOMHET
    ) {
      oppdaterData(
        lagLovvalgsbestemmelse(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_4)
      );
    }
  };

  const aktivitetINorgeEndretHandler = (avklartAktivitetINorge) => {
    if (avklartAktivitetINorge === VurderingVesentligAktivitetINorgeTyper.OVER_25_PROSENT) {
      if (yrkesaktivitet === KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE) {
        oppdaterData(
          lagLovvalgsbestemmelse(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_2A)
        );
      } else {
        oppdaterData(
          lagLovvalgsbestemmelse(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1A)
        );
      }
    } else if (avklartAktivitetINorge === VurderingVesentligAktivitetINorgeTyper.UNDER_25_PROSENT) {
      if (yrkesaktivitet === KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE) {
        oppdaterData(
          lagLovvalgsbestemmelse(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_2B)
        );
      } else {
        slettData(slettLovvalgsbestemmelse());
      }
    }
  };

  const initialiserStegDataForSteg = (avklartAktivitetINorge, loennetArbeidAntallLand, offentligArbeidAntallLand) => {
    if (
      loennetArbeidAntallLand === KV.Koder.LoennetArbeidAntallLand.NORGE ||
      loennetArbeidAntallLand === KV.Koder.LoennetArbeidAntallLand.ETT_ANNET_LAND
    ) {
      oppdaterData(
        konverterLovvalgsbestemmelseTilStegData(
          MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_3
        )
      );
    } else if (loennetArbeidAntallLand === KV.Koder.LoennetArbeidAntallLand.FLERE_LAND) {
      oppdaterData(
        konverterTilleggBestemmelseTilStegData(
          MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_3
        )
      );
    }

    if (
      offentligArbeidAntallLand === KV.Koder.OffentligArbeidAntallLand.NORGE_OG_ANNEN_VIRKSOMHET ||
      offentligArbeidAntallLand === KV.Koder.OffentligArbeidAntallLand.ANNET_LAND_OG_ANNEN_VIRKSOMHET
    ) {
      oppdaterData(
        konverterLovvalgsbestemmelseTilStegData(
          MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_4
        )
      );
    }

    if (avklartAktivitetINorge === VurderingVesentligAktivitetINorgeTyper.OVER_25_PROSENT) {
      if (yrkesaktivitet === KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE) {
        oppdaterData(
          lagLovvalgsbestemmelse(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_2A)
        );
      } else {
        oppdaterData(
          lagLovvalgsbestemmelse(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1A)
        );
      }
    } else if (avklartAktivitetINorge === VurderingVesentligAktivitetINorgeTyper.UNDER_25_PROSENT) {
      if (yrkesaktivitet === KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE) {
        oppdaterData(
          konverterLovvalgsbestemmelseTilStegData(
            MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_2B
          )
        );
      }
    }
  };

  const avklartAktivitetINorge = hentFaktaVerdi(aktivitetINorge);
  const loennetArbeidAntallLand = hentFaktaVerdi(loennetArbeidAntallLandFakta);
  const offentligArbeidAntallLand = hentFaktaVerdi(offentligArbeidAntallLandFakta);

  useEffect(() => {
    initialiserStegDataForSteg(avklartAktivitetINorge, loennetArbeidAntallLand, offentligArbeidAntallLand);

    return () => {
      slettData();
    };
  }, []);

  useEffect(() => {
    initialiserStegDataForSteg(avklartAktivitetINorge, loennetArbeidAntallLand, offentligArbeidAntallLand);
  }, [avklartAktivitetINorge, loennetArbeidAntallLand, offentligArbeidAntallLand, yrkesaktivitet]);

  const vesentligAktivitetINorgeValg = [
    { label: "25% eller mer", type: VurderingVesentligAktivitetINorgeTyper.OVER_25_PROSENT },
    { label: "Mindre enn 25%", type: VurderingVesentligAktivitetINorgeTyper.UNDER_25_PROSENT },
  ];

  const loennetArbeidValg = [
    {
      label: "Lønnet arbeid i Norge og selvstendig virksomhet (13.3)",
      type: KV.Koder.LoennetArbeidAntallLand.NORGE,
    },
    {
      label: "Lønnet arbeid i et annet land og selvstendig virksomhet (13.3)",
      type: KV.Koder.LoennetArbeidAntallLand.ETT_ANNET_LAND,
    },
    {
      label: "Lønnet arbeid i to eller flere land og selvstendig virksomhet (13.1)",
      type: KV.Koder.LoennetArbeidAntallLand.FLERE_LAND,
    },
  ];

  const offentligArbeidValg = [
    {
      label: "Offentlig tjeneste i Norge og annen virksomhet (13.4)",
      type: KV.Koder.OffentligArbeidAntallLand.NORGE_OG_ANNEN_VIRKSOMHET,
    },
    {
      label: "Offentlig tjeneste i et annet land og annen virksomhet (13.4)",
      type: KV.Koder.OffentligArbeidAntallLand.ANNET_LAND_OG_ANNEN_VIRKSOMHET,
    },
    {
      label: "Offentlig tjeneste i to eller flere land og annen virksomhet (13.1)",
      type: KV.Koder.OffentligArbeidAntallLand.FLERE_LAND_OG_ANNEN_VIRKSOMHET,
    },
  ];

  return (
    <div className="vurderingArbeidsmonster">
      <Nav.Typo.Undertittel>Vurder aktiviteten i de ulike landene</Nav.Typo.Undertittel>
      <div className="arbeidsmonster">
        <ConnectedMarginaltArbeid
          redigerbart={redigerbart}
          marginaltArbeid={marginaltArbeid}
          arbeidsland={arbeidsland}
          oppdaterData={oppdaterData}
          {...tilstand}
        />
        {erArbeidstakerOgSelvstendigNaeringsdrivende && (
          <EnkeltAvklartfakta
            redigerbart={redigerbart}
            avklartfakta={loennetArbeidAntallLandFakta}
            avklartfaktaKode={KV.Koder.avklartefaktaKoder.LOENNET_ARBEID_ANTALL_LAND}
            avklartefaktaTyper={loennetArbeidValg}
            tittel="Vurder aktivitet"
            oppdaterData={oppdaterData}
            slettData={slettData}
            onChange={loennetArbeidEndretHandler}
          />
        )}
        {erOffentligTjenestemann && (
          <EnkeltAvklartfakta
            redigerbart={redigerbart}
            avklartfakta={offentligArbeidAntallLandFakta}
            avklartfaktaKode={KV.Koder.avklartefaktaKoder.OFFENTLIG_ARBEID_ANTALL_LAND}
            avklartefaktaTyper={offentligArbeidValg}
            tittel="Vurder aktivitet"
            oppdaterData={oppdaterData}
            slettData={slettData}
            onChange={offentligArbeidEndretHandler}
          />
        )}
        {aktivitetINorgeNodvendig && (
          <EnkeltAvklartfakta
            redigerbart={redigerbart}
            avklartfakta={aktivitetINorge}
            avklartfaktaKode={KV.Koder.avklartefaktaKoder.AKTIVITET_I_NORGE}
            avklartefaktaTyper={vesentligAktivitetINorgeValg}
            tittel="Vurdering av vesentlig aktivitet i Norge"
            oppdaterData={oppdaterData}
            slettData={slettData}
            onChange={aktivitetINorgeEndretHandler}
          />
        )}
        <div className="fane__knapplinje">
          <Nav.Knapp
            disabled={!(redigerbart && harAvklaring)}
            className="fane__navigasjonsknapp"
            onClick={bekreftOgFortsett}
          >
            Bekreft og fortsett
          </Nav.Knapp>
        </div>
      </div>
    </div>
  );
};

VurderingArbeidsmonster.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  arbeidsland: PT.arrayOf(MPT.ArbeidslandMedYrkesaktivitet).isRequired,
  tilstand: PT.shape({
    marginaltArbeid: PT.array,
    aktivitetINorge: PT.object,
    aktivitetINorgeNodvendig: PT.bool,
    harAvklaring: PT.bool,
    yrkesaktivitet: PT.string.isRequired,
    erArbeidstakerOgSelvstendigNaeringsdrivende: PT.bool.isRequired,
    erOffentligTjenestemann: PT.bool.isRequired,
    loennetArbeidAntallLandFakta: MPT.Avklartefakta,
    offentligArbeidAntallLandFakta: MPT.Avklartefakta,
  }).isRequired,
  redigerbart: PT.bool.isRequired,
};

export default VurderingArbeidsmonster;
