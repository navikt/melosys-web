import React, { useState } from "react";
import PT from "prop-types";
import * as EKV from "eessi-kodeverk";

import MKV from "../../melosyskodeverk";

import * as Nav from "../../utils/navFrontend";
import * as Api from "../../services/api";
import * as Utils from "../../utils";
import { lagYupToReduxformErrorMapper } from "../../yup";
import sideDialogOpprettNyBucSchema from "./sideDialogOpprettNyBucSchema";
import { kodeTilObjekt } from "../../kodeverk";
import VedleggVelger from "../vedleggvelger";
import MultiSelect from "../multiSelect";

import "./sideDialogOpprettNyBuc.css";

const TomtFelt = ({ tekst }) => <option value="">{tekst}</option>;

TomtFelt.propTypes = {
  tekst: PT.string,
};

TomtFelt.defaultProps = {
  tekst: "Velg...",
};

const SideDialogOpprettNyBuc = ({ behandlingID, dokumenter }) => {
  const [tilgjengeligeMottakerinstitusjoner, setTilgjengeligeMottakerinstitusjoner] = useState([]);

  const [valgtFagomrade, setValgtFagomrade] = useState(EKV.Koder.sektor.LA);
  const [valgtBuc, setValgtBuc] = useState("");
  const [valgtSed, setValgtSed] = useState("");
  const [valgteLand, setValgteLand] = useState([]);
  const [valgteMottakerinstitusjoner, setValgteMottakerinstitusjoner] = useState([]);
  const [valgteVedlegg, setValgteVedlegg] = useState([]);

  const [opprettetBucUrl, setOpprettetBucUrl] = useState("");
  const [bucOpprettet, setBucOpprettet] = useState(false);
  const [oppretterBuc, setOppretterBuc] = useState(false);
  const [feilmeldinger, setFeilmeldinger] = useState({
    buc: undefined,
    land: undefined,
    mottakerinstitusjoner: undefined,
  });
  const [oppdaterteFelt, setOppdaterteFelt] = useState({ buc: false, land: false, mottakerinstitusjoner: false });
  const [alertmelding, setAlertmelding] = useState("");

  const hentMottakerinstitusjoner = async (buc, landkode) => {
    if (buc && landkode) {
      try {
        const institusjoner = await Api.Eessi.mottakerinstitusjoner.hent(buc, landkode);
        setTilgjengeligeMottakerinstitusjoner(institusjoner);
      } catch (e) {
        Utils.logger.error(e);
        setAlertmelding("Finner ingen mottakerinstitusjoner");
      }
    } else {
      setTilgjengeligeMottakerinstitusjoner([]);
    }
  };

  const overstyrSubmit = (event) => {
    event.preventDefault();
  };

  const resetForm = () => {
    setValgtBuc("");
    setValgtSed("");
    setValgteLand([]);
    setValgteMottakerinstitusjoner([]);
    setValgtFagomrade(EKV.Koder.sektor.LA);
    setValgteVedlegg([]);
    setFeilmeldinger({ buc: undefined, land: undefined, mottakerinstitusjoner: undefined });
    setOppdaterteFelt({ buc: false, land: false, mottakerinstitusjoner: false });
  };

  const resetState = () => {
    setBucOpprettet(false);
    setOppretterBuc(false);
    setOpprettetBucUrl("");
    setAlertmelding("");
  };

  const resetKomponent = () => {
    resetForm();
    resetState();
  };

  const erValidert = () =>
    sideDialogOpprettNyBucSchema.isValidSync({
      buc: valgtBuc,
      land: valgteLand,
      mottakerinstitusjoner: valgteMottakerinstitusjoner,
    });

  const valider = ({ buc = valgtBuc, land = valgteLand, mottakerinstitusjoner = valgteMottakerinstitusjoner }) =>
    setFeilmeldinger(lagYupToReduxformErrorMapper(sideDialogOpprettNyBucSchema)({ buc, land, mottakerinstitusjoner }));

  const sendSed = async () => {
    if (erValidert()) {
      try {
        setOppretterBuc(true);
        const sedResponse = await Api.Eessi.bucer.opprett(behandlingID, {
          bucType: valgtBuc,
          mottakerInstitusjoner: valgteMottakerinstitusjoner,
          vedlegg: valgteVedlegg.map(({ journalpostID, dokumentID }) => ({ journalpostID, dokumentID })),
        });

        setBucOpprettet(true);
        if (sedResponse) {
          setOpprettetBucUrl(sedResponse.rinaUrl);
          setAlertmelding("");
          resetForm();
        }
      } catch (e) {
        Utils.logger.error(e);
        if (e.status >= 500) setAlertmelding("Saken kunne ikke opprettes i RINA");
        else if (e.status >= 400) setAlertmelding(e.body.message);
      }
    } else {
      setOppdaterteFelt({ buc: true, land: true, mottakerinstitusjoner: true });
      valider({});
    }

    setOppretterBuc(false);
  };

  const tilgjengeligeFagomrader = [
    kodeTilObjekt(EKV.Koder.sektor.LA, EKV.KTObjects.sektor),
    kodeTilObjekt(EKV.Koder.sektor.HZ, EKV.KTObjects.sektor),
  ];

  const tilgjengeligeHBucer = [
    EKV.Koder.buctyper.horizontal.H_BUC_01,
    EKV.Koder.buctyper.horizontal.H_BUC_02a,
    EKV.Koder.buctyper.horizontal.H_BUC_02b,
    EKV.Koder.buctyper.horizontal.H_BUC_02c,
    EKV.Koder.buctyper.horizontal.H_BUC_03a,
    EKV.Koder.buctyper.horizontal.H_BUC_03b,
  ];
  const ignorerteHBucer = EKV.KTObjects.buctyper.horizontal.filter(({ kode }) => !tilgjengeligeHBucer.includes(kode));

  const tilgjengeligeBucer = (fagomrade) =>
    EKV.Selectors.hentBucTyperForFagomrade(fagomrade).filter((buc) => !ignorerteHBucer.includes(buc));

  const tilgjengeligeSeder = (buc) => EKV.Selectors.hentSedTyperForBuc(buc);

  const hentValgtKode = (event) => event.target.value;

  const oppdaterFelt = (felt) => {
    const prevState = { ...oppdaterteFelt };
    prevState[felt] = true;
    setOppdaterteFelt(prevState);
  };

  const fagomradeEndret = (event) => {
    const fagomrade = hentValgtKode(event);
    setValgtBuc("");
    setValgtFagomrade(fagomrade);
  };

  const bucEndret = (event) => {
    const buc = hentValgtKode(event);
    setValgtBuc(buc);
    oppdaterFelt("buc");
    valider({ buc });

    setValgtSed(buc ? tilgjengeligeSeder(buc)[0].kode : "");
    hentMottakerinstitusjoner(buc, valgteLand);
  };

  const landEndret = (options) => {
    const land = options ? options.map((item) => item.value) : [];
    setValgteLand(land);
    oppdaterFelt("land");
    valider({ land });
    hentMottakerinstitusjoner(valgtBuc, land);
  };

  const mottakerinstitusjonEndret = (options) => {
    const mottakerinstitusjoner = options ? options.map((item) => item.value) : [];
    setValgteMottakerinstitusjoner(mottakerinstitusjoner);
    oppdaterFelt("mottakerinstitusjoner");
    valider({ mottakerinstitusjoner });
  };

  const displayName = (elem) => `${elem.kode} - ${elem.term}`;

  const feil = (felt) => (oppdaterteFelt[felt] ? feilmeldinger[felt] : undefined);

  return (
    <div className="sedbestilling">
      <form onSubmit={overstyrSubmit}>
        <Nav.Fieldset legend="">
          <Nav.Select bredde="fullbredde" label="Fagområde" onChange={fagomradeEndret} value={valgtFagomrade}>
            <TomtFelt />
            {tilgjengeligeFagomrader.map((fagomrade) => (
              <option key={fagomrade.kode} value={fagomrade.kode}>
                {fagomrade.term}
              </option>
            ))}
          </Nav.Select>
          <Nav.Select bredde="fullbredde" label="BUC" onChange={bucEndret} value={valgtBuc} feil={feil("buc")}>
            <TomtFelt />
            {tilgjengeligeBucer(valgtFagomrade).map((buc) => (
              <option key={buc.kode} value={buc.kode}>
                {displayName(buc)}
              </option>
            ))}
          </Nav.Select>
          <Nav.Select bredde="fullbredde" label="SED" value={valgtSed} disabled>
            <TomtFelt tekst="" />
            {tilgjengeligeSeder(valgtBuc).map((forsteSed) => (
              <option key={forsteSed.kode} value={forsteSed.kode}>
                {displayName(forsteSed)}
              </option>
            ))}
          </Nav.Select>
          <MultiSelect
            label="Land"
            onChange={landEndret}
            options={MKV.KTObjects.landkoder.map((item) => ({ value: item.kode, label: item.term }))}
            feil={feil("land")}
            values={valgteLand}
          />
          <MultiSelect
            label="Mottakerinstitusjoner"
            onChange={mottakerinstitusjonEndret}
            options={tilgjengeligeMottakerinstitusjoner.map((item) => ({
              value: item.id,
              label: `${item.landkode} - ${item.navn}`,
            }))}
            feil={feil("mottakerinstitusjoner")}
            values={valgteMottakerinstitusjoner}
          />
          <Nav.typo.Undertittel>Vedlegg</Nav.typo.Undertittel>
          <VedleggVelger valgteVedlegg={valgteVedlegg} onChange={setValgteVedlegg} dokumenter={dokumenter} />
          <Nav.Hovedknapp spinner={oppretterBuc} htmlType="submit" onClick={sendSed}>
            Opprett ny BUC
          </Nav.Hovedknapp>
          &nbsp;
          <Nav.Knapp type="standard" onClick={resetKomponent}>
            Avbryt utfylling
          </Nav.Knapp>
        </Nav.Fieldset>
        {opprettetBucUrl && bucOpprettet && (
          <Nav.AlertStripe type="suksess" className="varsel">
            Saken er nå opprettet i RINA{" "}
            <Nav.Lenker href={opprettetBucUrl} target="_blank">
              {opprettetBucUrl}
            </Nav.Lenker>
          </Nav.AlertStripe>
        )}
        {alertmelding && (
          <Nav.AlertStripe type="advarsel" className="varsel">
            {alertmelding}
          </Nav.AlertStripe>
        )}
      </form>
    </div>
  );
};

SideDialogOpprettNyBuc.propTypes = {
  behandlingID: PT.number.isRequired,
  dokumenter: PT.arrayOf(PT.object).isRequired,
};

export default SideDialogOpprettNyBuc;
