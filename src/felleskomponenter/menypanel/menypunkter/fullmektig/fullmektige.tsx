import { connect, ConnectedProps, useDispatch } from "react-redux";
import { RootState } from "AppTypes";

import MKV from "../../../../melosyskodeverk";

import * as Mui from "../../../ui";
import * as Api from "../../../../services/api";
import { Organisasjon } from "../../../../services/api";
import * as Ikoner from "../../../../resources/images";
import * as Utils from "../../../../utils";
import * as Nav from "../../../../navFrontend";

import { fagsakSelectors } from "../../../../ducks/fagsaker";

import "./fullmektige.css";
import { useEffect, useState } from "react";
import { FieldValue, FieldValues, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import fullmektig_schema from "./fullmektigeSchema";
import RedigererFullmektig from "./redigererFullmektig";
import { hentBostedsadresseForPerson } from "../../../../graphql/adresse";
import { Personopplysninger } from "../../../../graphql";
import LagretFullmektig from "./lagretFullmektig";
import { FieldArrayProps, Fullmektig, Type } from "./types";
import { menypanelOperations } from "../../../../ducks/menypanel";
import { fullmektigEndret } from "../../../../ducks/menypanel/operations";

const { FULLMEKTIG } = MKV.Koder.aktoersroller;

const mapStateToProps = (state: RootState) => ({
  saksnummer: fagsakSelectors.SaksnummerSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type FullmektigeProps = PropsFromRedux & {
  redigerbart: boolean;
};

const Fullmektige = ({ redigerbart, saksnummer }: FullmektigeProps) => {
  const dispatch = useDispatch();
  const [redigerer, setRedigerer] = useState(false);
  const [pending, setPending] = useState(false);

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

  const finnOrganisasjonAdresse = (orgnr: string): Promise<{ org?: Organisasjon; feil?: string }> => {
    return Api.Organisasjoner.hentOrganisasjon(orgnr)
      .then((org) => ({ org, feil: undefined }))
      .catch(() => ({ org: undefined, feil: "Kunne ikke finne organisasjon" }));
  };

  const finnPersonAdresse = async (personident: string): Promise<{ person?: Personopplysninger; feil?: string }> => {
    let data: { person?: Personopplysninger; feil?: string } = {};
    try {
      await hentBostedsadresseForPerson(personident).then((person) => {
        if (person == null) {
          data = { ...data, feil: "Kunne ikke finne personen" };
        } else {
          data = { ...data, person };
        }
      });
    } catch (e) {
      data = { ...data, feil: "Ukjent feil ved søk på f.nr. eller d-nr." };
    }
    return data;
  };

  const initializeFullmektige = async () => {
    const lagredeFullmektige = await Api.Fagsaker.aktoer.hent(saksnummer, FULLMEKTIG);
    const mappedFullmektige =
      lagredeFullmektige?.map((aktør) => ({
        databaseID: aktør.databaseID,
        ident: aktør.orgnr ? aktør.orgnr : aktør.personIdent!!,
        type: aktør.orgnr ? Type.ORGANISASJON : Type.PERSON,
        fullmakter: aktør.fullmakter ?? [],
        originalAktør: aktør,
      })) ?? [];
    resetFullmektige(mappedFullmektige);
    mappedFullmektige.forEach((fullmektig, index) => {
      if (fullmektig.type === Type.PERSON) {
        finnPersonAdresse(fullmektig.ident).then((personOgFeil) =>
          update(index, { ...fullmektig, person: personOgFeil.person, feil: personOgFeil.feil })
        );
      } else {
        let oppdatertFullmektig: Fullmektig = { ...fullmektig };
        finnOrganisasjonAdresse(fullmektig.ident).then((orgOgFeil) => {
          oppdatertFullmektig = { ...oppdatertFullmektig, org: orgOgFeil.org, feil: orgOgFeil.feil };
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
              finnOrganisasjonAdresse(kontaktopplysning.kontaktorgnr).then((orgOgFeil) =>
                update(index, { ...oppdatertFullmektig, kontaktOrg: orgOgFeil.org })
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

  const handleLagre = async () => {
    if (!isValid) {
      formValues.fullmektige.forEach((_it: Fullmektig, index: number) => {
        trigger(`fullmektige[${index}].fullmakter`);
      });
      return;
    }
    setPending(true);
    // eslint-disable-next-line no-restricted-syntax
    for (const fullmektig of formValues.fullmektige) {
      await Api.Fagsaker.aktoer.send(saksnummer, {
        databaseID: fullmektig.databaseID,
        orgnr: fullmektig.type === Type.ORGANISASJON ? fullmektig.ident : null,
        personIdent: fullmektig.type === Type.PERSON ? fullmektig.ident : null,
        rolleKode: FULLMEKTIG,
        fullmakter: fullmektig.fullmakter ?? [],
      });

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
  };

  const handleSlett = (index: number) => {
    const { fullmektige } = formValues;
    if (fullmektige[index].databaseID) {
      Api.Fagsaker.aktoer
        .slett(fullmektige[index].databaseID)
        .then(() => dispatch(menypanelOperations.setErFullmektigEndret(true)));
    }
    if (fullmektige[index].harLagretKontaktperson) {
      Api.Fagsaker.kontaktopplysninger
        .slett(saksnummer, fullmektige[index].originalAktør?.orgnr)
        .then(() => dispatch(menypanelOperations.setErFullmektigEndret(true)));
    }
    if (fullmektige.length === 1) {
      setRedigerer(false);
    }
    remove(index);
  };

  const visLeggTilKnapp = redigerbart && !redigerer && Utils._isEmpty(formValues?.fullmektige);
  const visEndreKnapp = redigerbart && !redigerer && !Utils._isEmpty(formValues?.fullmektige);

  return (
    <div className="fullmektige">
      {visEndreKnapp && (
        <Nav.Knapp className="endre_knapp" onClick={() => setRedigerer(true)} mini>
          Endre/Legg til ny
        </Nav.Knapp>
      )}
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
          handleSlett={handleSlett}
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
      {redigerer && (
        <div>
          <Nav.Hovedknapp onClick={handleLagre} className="lagre_knapp" spinner={pending} autoDisableVedSpinner>
            Lagre
          </Nav.Hovedknapp>
          <Nav.Flatknapp
            onClick={() => {
              setRedigerer(false);
              initializeFullmektige();
            }}
          >
            Avbryt
          </Nav.Flatknapp>
        </div>
      )}
    </div>
  );
};

export default connector(Fullmektige);
