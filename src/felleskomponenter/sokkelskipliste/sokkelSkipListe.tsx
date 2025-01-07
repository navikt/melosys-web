import SokkelSkipEnkelt from "./sokkelSkipEnkelt";
import { KTObject } from "@navikt/melosys-kodeverk";
import { ArbeidsstedOffshore, ArbeidsstedSkip } from "../../kodeverk/form";
import { Avklartfakta } from "../../services/modules/avklartefakta";

interface SokkelSkipListeProps {
  sokkelEllerSkipListe?: Avklartfakta[];
  installasjonArbeidslandListe?: Avklartfakta[];
  installasjonArbeidslandTypeListe?: Avklartfakta[];
  arbeidslandListe?: Avklartfakta[];
  maritimtArbeid?: (ArbeidsstedOffshore | ArbeidsstedSkip)[];
  begrunnelser: KTObject[];
  redigerbart: boolean;
  avklartefaktaEndretHandler: (type: string, subjektID: string, verdi: string) => void;
  avklartefaktaBegrunnelserEndretHandler: (type: string, subjektID: string, verdi: string) => void;
  oppdaterData: (objekt: any) => void;
  slettData: (objekt?: any) => void;
  className?: string;
}

function SokkelSkipListe({
  sokkelEllerSkipListe = [],
  maritimtArbeid = [],
  begrunnelser,
  redigerbart,
  avklartefaktaEndretHandler,
  avklartefaktaBegrunnelserEndretHandler,
  oppdaterData,
  slettData,
  installasjonArbeidslandListe = [],
  installasjonArbeidslandTypeListe = [],
  arbeidslandListe = [],
  className,
}: SokkelSkipListeProps) {
  const finnAvklartfakta = (enkeltArbeid: ArbeidsstedOffshore | ArbeidsstedSkip, avklartfaktaListe: Avklartfakta[]) =>
    avklartfaktaListe.find((avklartfakta) => avklartfakta.subjektID === enkeltArbeid.enhetNavn);

  return (
    <div className={className}>
      {maritimtArbeid.map((enkelt) => (
        <SokkelSkipEnkelt
          key={enkelt.enhetNavn}
          maritimtArbeid={enkelt}
          sokkelEllerSkip={finnAvklartfakta(enkelt, sokkelEllerSkipListe)}
          arbeidslandAvklartfakta={finnAvklartfakta(enkelt, installasjonArbeidslandListe)}
          arbeidslandTypeAvklartfakta={finnAvklartfakta(enkelt, installasjonArbeidslandTypeListe)}
          arbeidslandFakta={finnAvklartfakta(enkelt, arbeidslandListe)}
          begrunnelser={begrunnelser}
          redigerbart={redigerbart}
          avklartefaktaEndretHandler={avklartefaktaEndretHandler}
          avklartefaktaBegrunnelserEndretHandler={avklartefaktaBegrunnelserEndretHandler}
          oppdaterData={oppdaterData}
          slettData={slettData}
        />
      ))}
    </div>
  );
}

export default SokkelSkipListe;
