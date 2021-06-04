import React, { useState, useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { Aktoer } from "Domene";

import MKV from "../../../../melosyskodeverk";

import * as Mui from "../../../ui";
import * as Api from "../../../../services/api";
import * as Hooks from "../../../../hooks";
import * as Ikoner from "../../../../resources/images";

import { fagsakSelectors } from "../../../../ducks/fagsaker";

import EnkeltFullmektig from "./enkeltFullmektig";

import "./fullmektige.css";

const aktoerTemplate: Aktoer = {
  aktoerID: null,
  databaseID: -1,
  institusjonsID: null,
  orgnr: null,
  representererKode: null,
  rolleKode: "",
  utenlandskPersonID: null,
};

const mapStateToProps = (state: RootState) => ({
  saksnummer: fagsakSelectors.SaksnummerSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type FullmektigeProps = PropsFromRedux & {
  redigerbart: boolean;
};

const Fullmektige = ({ redigerbart, saksnummer }: FullmektigeProps) => {
  const [fullmektige, setFullmektige] = Hooks.useAsyncCallbackState(
    () => Api.Fagsaker.aktoer.hent(saksnummer, MKV.Koder.aktoersroller.REPRESENTANT),
    [],
    () => {}
  );
  const [disableLeggTilFullmektig, setDisableLeggTilFullmektig] = useState(false);

  const hentFullmektige = async () => {
    try {
      const fullmektigAktoerer: Aktoer[] = await Api.Fagsaker.aktoer.hent(
        saksnummer,
        MKV.Koder.aktoersroller.REPRESENTANT
      );
      setFullmektige(fullmektigAktoerer);
    } catch (e) {
      setFullmektige([]);
    }
  };

  useEffect(() => {
    hentFullmektige();
  }, []);

  const settRepresentant = (endretIndex: number, representererKode: string) => {
    setFullmektige((prevFullmektige) =>
      prevFullmektige.map((fullmektig, index) =>
        index === endretIndex ? { ...fullmektig, representererKode } : fullmektig
      )
    );
  };

  const lagreFullmektig = (representererKode: string | null, orgnr: string, databaseID?: number) =>
    Api.Fagsaker.aktoer.send(saksnummer, {
      databaseID: databaseID || null,
      aktoerID: null,
      orgnr,
      utenlandskPersonID: null,
      institusjonsID: null,
      rolleKode: MKV.Koder.aktoersroller.REPRESENTANT,
      representererKode: representererKode || null,
    });

  const byttUtTemplateMedLagretFullmektig = (aktoerer: Aktoer[], lagretFullmektig: Aktoer) =>
    aktoerer.map((fullmektig) => {
      if (fullmektig.databaseID === aktoerTemplate.databaseID) return { ...lagretFullmektig };
      return { ...fullmektig };
    });

  const lagreNyFullmektigOgOppdaterLokalt = async (orgnr: string, representererKode: string | null) => {
    try {
      const lagretFullmektig = await lagreFullmektig(representererKode, orgnr);

      setFullmektige((prevFullmektige) => byttUtTemplateMedLagretFullmektig(prevFullmektige, lagretFullmektig));
      setDisableLeggTilFullmektig(false);
      return lagretFullmektig;
    } catch (e) {
      if (e.status >= 500) throw new Error("Teknisk feil ved lagring av fullmektig");
      else if (e.status >= 400) throw new Error(e.body.message);
      else throw e;
    }
  };

  const apneLeggTilFullmektigDialog = () => {
    setFullmektige((prevFullmektige) => [...prevFullmektige, { ...aktoerTemplate }]);
    setDisableLeggTilFullmektig(true);
  };

  const slettFullmektigLokalt = (databaseID: number) => {
    const nyFullmektige = fullmektige.filter((fullmektig) => fullmektig.databaseID !== databaseID);
    setFullmektige(nyFullmektige);
    setDisableLeggTilFullmektig(false);
  };

  const visLeggTilKnapp = !disableLeggTilFullmektig && redigerbart;

  return (
    <div className="fullmektige">
      {fullmektige.map((fullmektig, index) => {
        const slettFullmektig = async () => {
          try {
            if (fullmektig.databaseID !== aktoerTemplate.databaseID) {
              await Api.Fagsaker.aktoer.slett(fullmektig.databaseID);
            }
            slettFullmektigLokalt(fullmektig.databaseID);
          } catch (e) {
            if (e.status >= 500) throw new Error("Teknisk feil ved sletting av fullmektig");
            else if (e.status >= 400) throw new Error(e.body.message);
            else throw e;
          }
        };

        const onRollechange = async (representererKode: string, orgnr?: string) => {
          try {
            if (orgnr) await lagreFullmektig(representererKode, orgnr, fullmektig.databaseID);
            settRepresentant(index, representererKode);
          } catch (e) {
            if (e.status >= 500) throw new Error("Teknisk feil ved lagring av fullmektig");
            else if (e.status >= 400) throw new Error(e.body.message);
            else throw e;
          }
        };

        return (
          <EnkeltFullmektig
            key={fullmektig.databaseID}
            className="enkelt__fullmektig"
            redigerbart={redigerbart}
            fullmektig={fullmektig}
            slett={slettFullmektig}
            onRolleChange={onRollechange}
            onOrgFunnet={(orgnr) => lagreNyFullmektigOgOppdaterLokalt(orgnr, fullmektig.representererKode)}
            saksnummer={saksnummer}
          />
        );
      })}
      {visLeggTilKnapp && (
        <Mui.Knappelenke onClick={apneLeggTilFullmektigDialog} ikon={Ikoner.Add} className="legg__til__knapp">
          Legg til ny fullmektig
        </Mui.Knappelenke>
      )}
    </div>
  );
};

export default connector(Fullmektige);
