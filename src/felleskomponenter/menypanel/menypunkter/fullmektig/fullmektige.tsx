import { useDispatch, useSelector } from "react-redux";

import MKV from "../../../../melosyskodeverk";

import * as Mui from "../../../ui";
import * as Api from "../../../../services/api";
import * as Ikoner from "../../../../resources/images";
import * as Utils from "../../../../utils";
import * as Nav from "../../../../navFrontend";

import { fagsakSelectors } from "../../../../ducks/fagsaker";

import "./fullmektige.css";
import { useEffect, useState } from "react";
import { FieldValue, FieldValues, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import fullmektig_schema from "./fullmektigeSchema";
import RedigererFullmektig from "./redigererFullmektig";
import LagretFullmektig from "./lagretFullmektig";
import { AdresseOgFeil, FieldArrayProps, Fullmektig, Type } from "./types";
import { menypanelOperations } from "../../../../ducks/menypanel";
import Knapperad from "../../../knapperad";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { useAsyncCallbackState } from "../../../../hooks";

const { FULLMEKTIG } = MKV.Koder.aktoersroller;
const { FULLMEKTIG_TRYGDEAVGIFT } = MKV.Koder.fullmaktstype;
const { HENVENDELSE, NY_VURDERING, MANGLENDE_INNBETALING_TRYGDEAVGIFT } = MKV.Koder.behandlinger.behandlingstyper;

interface FullmektigeProps {
  redigerbart: boolean;
  finnOrganisasjonAdresse: (orgnr: string) => Promise<AdresseOgFeil>;
  finnPersonAdresse: (personIdent: string) => Promise<AdresseOgFeil>;
}

function Fullmektige({ redigerbart, finnOrganisasjonAdresse, finnPersonAdresse }: FullmektigeProps) {
  const dispatch = useDispatch();
  const saksnummer = useSelector(fagsakSelectors.SaksnummerSelector);
  const behandlingstype = useSelector(behandlingerSelectors.BehandlingstypeKodeSelector);
  const [{ harBehandlingMedTrygdeavgift }] = useAsyncCallbackState(
    () => Api.Fagsaker.fagsak.hentTrygdeavgiftOppsummering(saksnummer),
    { harBehandlingMedTrygdeavgift: false },
    [saksnummer],
  );
  const [visFeilFullmektigHarIkkeFullmakter, setVisFeilFullmektigHarIkkeFullmakter] = useState(false);
  const [redigerer, setRedigerer] = useState(false);
  const [pending, setPending] = useState(false);
  const [visModal, setVisModal] = useState(false);
  const [modalFunksjon, setModalFunksjon] = useState<(sjekk: boolean) => void>(() => () => {});
  const harBehandlingstypeSomSkalSjekkes = [HENVENDELSE, NY_VURDERING, MANGLENDE_INNBETALING_TRYGDEAVGIFT].includes(
    behandlingstype,
  );

  const {
    control,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(fullmektig_schema),
    mode: "all",
    defaultValues: {
      fullmektige: [],
    } as FieldValue<FieldValues & FieldArrayProps>,
  });
  const {
    fields,
    append,
    update,
    remove,
    replace: resetFullmektige,
  } = useFieldArray<FieldArrayProps, "fullmektige", "id">({
    control,
    name: "fullmektige",
  });
  const formValues = watch();
  const fullmektige = watch("fullmektige");

  useEffect(() => {
    setVisFeilFullmektigHarIkkeFullmakter(false);
  }, [fullmektige]);

  const initializeFullmektige = async () => {
    const lagredeFullmektige = await Api.Fagsaker.aktoer.hent(saksnummer, FULLMEKTIG);
    const mappedFullmektige =
      lagredeFullmektige?.map((aktør) => ({
        databaseID: aktør.databaseID,
        ident: aktør.orgnr ? aktør.orgnr : aktør.personIdent!,
        type: aktør.orgnr ? Type.ORGANISASJON : Type.PERSON,
        fullmakter: aktør.fullmakter ?? [],
        originalAktør: aktør,
      })) ?? [];
    resetFullmektige(mappedFullmektige);
    mappedFullmektige.forEach((fullmektig, index) => {
      if (fullmektig.type === Type.PERSON) {
        finnPersonAdresse(fullmektig.ident).then((adresseOgFeil) =>
          update(index, {
            ...fullmektig,
            adresse: adresseOgFeil.adresse,
            feil: adresseOgFeil.feil,
          }),
        );
      } else {
        let oppdatertFullmektig: Fullmektig = { ...fullmektig };
        finnOrganisasjonAdresse(fullmektig.ident).then((adresseOgFeil) => {
          oppdatertFullmektig = {
            ...oppdatertFullmektig,
            adresse: adresseOgFeil.adresse,
            feil: adresseOgFeil.feil,
          };
          update(index, oppdatertFullmektig);
        });
        Api.Fagsaker.kontaktopplysninger
          .hent(saksnummer, fullmektig.ident)
          .then((kontaktopplysning) => {
            oppdatertFullmektig = {
              ...oppdatertFullmektig,
              harLagretKontaktperson: true,
              kontaktperson: kontaktopplysning.kontaktnavn,
              kontaktOrgnr: kontaktopplysning.kontaktorgnr,
              kontaktTelefon: kontaktopplysning.kontakttelefon,
            };
            if (kontaktopplysning.kontaktorgnr) {
              finnOrganisasjonAdresse(kontaktopplysning.kontaktorgnr).then((adresseOgFeil) =>
                update(index, { ...oppdatertFullmektig, kontaktOrgAdresse: adresseOgFeil.adresse }),
              );
            } else {
              update(index, oppdatertFullmektig);
            }
          })
          .catch();
      }
    });
  };

  useEffect(() => {
    initializeFullmektige();
  }, []);

  const handleLeggTil = () => {
    append({
      ident: "",
      fullmakter: [],
    });
  };

  const originalAktørHarFullmaktTrygdeavgift = (fullmektig: Fullmektig): boolean => {
    return fullmektig.originalAktør?.fullmakter?.includes(FULLMEKTIG_TRYGDEAVGIFT) ?? false;
  };

  const fullmaktHarEndringer = (fullmektig: Fullmektig) => {
    if (fullmektig.originalAktør) {
      const { originalAktør } = fullmektig;
      return (
        !(
          (fullmektig.type === Type.ORGANISASJON && fullmektig.ident === originalAktør.orgnr) ||
          (fullmektig.type === Type.PERSON && fullmektig.ident === originalAktør.personIdent)
        ) || !Utils._isEqual(fullmektig.fullmakter, originalAktør.fullmakter)
      );
    }
    return true;
  };

  const handleLagre = async (sjekkEndretFullmakt: boolean) => {
    if (formValues.fullmektige.some((a: any) => a.fullmakter.length === 0)) {
      setVisFeilFullmektigHarIkkeFullmakter(true);
      return;
    }
    setVisFeilFullmektigHarIkkeFullmakter(false);
    if (!isValid) {
      formValues.fullmektige.forEach((_it: Fullmektig, index: number) => {
        trigger(`fullmektige[${index}].fullmakter`);
      });
      return;
    }

    const fullmektigMedBetalingHarForsvunnet = formValues.fullmektige.some(
      (fullmektig: Fullmektig) =>
        originalAktørHarFullmaktTrygdeavgift(fullmektig) && !fullmektig.fullmakter?.includes(FULLMEKTIG_TRYGDEAVGIFT),
    );
    const skalViseErDuSikkerModal =
      sjekkEndretFullmakt &&
      harBehandlingMedTrygdeavgift &&
      harBehandlingstypeSomSkalSjekkes &&
      fullmektigMedBetalingHarForsvunnet;
    if (skalViseErDuSikkerModal) {
      setModalFunksjon(() => (sjekk: boolean) => handleLagre(sjekk));
      setVisModal(true);
      return;
    }

    setPending(true);

    for (const fullmektig of formValues.fullmektige) {
      if (fullmaktHarEndringer(fullmektig)) {
        await Api.Fagsaker.aktoer.send(saksnummer, {
          databaseID: fullmektig.databaseID,
          orgnr: fullmektig.type === Type.ORGANISASJON ? fullmektig.ident : null,
          personIdent: fullmektig.type === Type.PERSON ? fullmektig.ident : null,
          rolleKode: FULLMEKTIG,
          fullmakter: fullmektig.fullmakter ?? [],
        });
      }

      if (fullmektig.kontaktperson || fullmektig.kontaktOrgnr || fullmektig.kontaktTelefon) {
        await Api.Fagsaker.kontaktopplysninger.send(saksnummer, fullmektig.ident, {
          kontaktorgnr: fullmektig.kontaktOrgnr,
          kontaktnavn: fullmektig.kontaktperson,
          kontakttelefon: fullmektig.kontaktTelefon,
        });
        if (fullmektig.harLagretKontaktperson && fullmektig.ident !== fullmektig.originalAktør?.orgnr) {
          await Api.Fagsaker.kontaktopplysninger.slett(saksnummer, fullmektig.originalAktør?.orgnr);
        }
      } else if (fullmektig.harLagretKontaktperson) {
        await Api.Fagsaker.kontaktopplysninger.slett(saksnummer, fullmektig.originalAktør?.orgnr);
      }
    }
    initializeFullmektige().then(() => {
      setPending(false);
      setRedigerer(false);
      dispatch(menypanelOperations.setErFullmektigEndret(true));
    });
    setVisModal(false);
  };

  const handleSlett = (index: number, sjekkEndretFullmakt: boolean) => {
    const fullmektigSomSkalSlettes = formValues.fullmektige[index];

    const skalViseErDuSikkerModal =
      sjekkEndretFullmakt &&
      harBehandlingMedTrygdeavgift &&
      harBehandlingstypeSomSkalSjekkes &&
      originalAktørHarFullmaktTrygdeavgift(fullmektigSomSkalSlettes);
    if (skalViseErDuSikkerModal) {
      setModalFunksjon(() => (sjekk: boolean) => handleSlett(index, sjekk));
      setVisModal(true);
      return;
    }

    if (fullmektigSomSkalSlettes.databaseID) {
      Api.Fagsaker.aktoer
        .slett(fullmektigSomSkalSlettes.databaseID)
        .then(() => dispatch(menypanelOperations.setErFullmektigEndret(true)));
    }
    if (fullmektigSomSkalSlettes.harLagretKontaktperson) {
      Api.Fagsaker.kontaktopplysninger.slett(saksnummer, fullmektigSomSkalSlettes.originalAktør?.orgnr);
    }
    if (formValues.fullmektige.length === 1) {
      setRedigerer(false);
    }
    remove(index);
    setVisModal(false);
  };

  const lukkModal = () => {
    setModalFunksjon(() => () => {});
    setVisModal(false);
  };

  const visLeggTilKnapp = redigerbart && !redigerer && Utils._isEmpty(formValues?.fullmektige);
  const visEndreKnapp = redigerbart && !redigerer && !Utils._isEmpty(formValues?.fullmektige);

  return (
    <div className="fullmektige">
      {Utils._isEmpty(formValues.fullmektige) && (
        <div className="ingenFullmektigRegistrert">Ingen fullmektig registrert</div>
      )}
      {redigerer ? (
        <RedigererFullmektig
          fullmektige={formValues.fullmektige}
          fields={fields}
          control={control}
          update={update}
          errors={errors}
          trigger={trigger}
          handleSlett={(index) => handleSlett(index, true)}
          handleLeggTil={handleLeggTil}
          finnOrganisasjonAdresse={finnOrganisasjonAdresse}
          finnPersonAdresse={finnPersonAdresse}
        />
      ) : (
        <LagretFullmektig fullmektige={formValues.fullmektige} />
      )}
      {visLeggTilKnapp && (
        <Mui.Lenkeknapp
          onClick={() => {
            handleLeggTil();
            setRedigerer(true);
          }}
          ikon={Ikoner.Add}
          className="legg__til__knapp"
        >
          Legg til ny fullmektig
        </Mui.Lenkeknapp>
      )}
      {visFeilFullmektigHarIkkeFullmakter && (
        <Nav.Alert variant="error" className="varselstripe">
          Du kan ikke ha en fullmektig uten fullmakt.
        </Nav.Alert>
      )}
      {visEndreKnapp && (
        <Nav.Button variant="secondary" className="endre_knapp" onClick={() => setRedigerer(true)}>
          Endre/Legg til ny
        </Nav.Button>
      )}
      {redigerer && (
        <div>
          <Nav.Button className="lagre_knapp" variant="primary" onClick={() => handleLagre(true)} loading={pending}>
            Lagre
          </Nav.Button>
          <Nav.Button
            variant="tertiary"
            onClick={() => {
              setRedigerer(false);
              initializeFullmektige();
            }}
          >
            Avbryt
          </Nav.Button>
        </div>
      )}

      {visModal && (
        <Nav.Modal
          onClose={lukkModal}
          open
          closeOnBackdropClick
          header={{ heading: "Er du sikker?", closeButton: false }}
        >
          <Nav.Modal.Body>
            <Nav.BodyLong size="small">
              Er du sikker på at du vil fjerne/endre fullmektig for betaling av trygdeavgift? I så fall endres mottaker
              av eventuelle nye fakturaer når du avslutter denne behandlingen.
            </Nav.BodyLong>
          </Nav.Modal.Body>
          <Nav.Modal.Footer>
            <Knapperad
              bekreft={() => modalFunksjon(false)}
              bekreftTekst="Bekreft"
              avbryt={lukkModal}
              avbrytTekst="Avbryt"
              redigerbart
            />
          </Nav.Modal.Footer>
        </Nav.Modal>
      )}
    </div>
  );
}

export default Fullmektige;
