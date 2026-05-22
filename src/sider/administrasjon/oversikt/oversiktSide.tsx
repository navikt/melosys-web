import { BodyShort, Heading } from "@navikt/ds-react";
import { useHistory } from "react-router-dom";
import { useMemo } from "react";

import * as Nav from "../../../navFrontend";
import useFeatureToggle, { useAktiveToggles } from "../../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER } from "../../../featuretoggle/toggleNavn";
import { useTekstblokker } from "../../../services/api/tekstblokker";
import { tellTags } from "../../../services/modules/tekstblokker";
import { formatterDatoTilNorsk } from "../../../utils/dato";
import { ADMIN_TEKSTBLOKKER } from "../ruter";

import "./oversikt.less";

function OversiktSide() {
  const history = useHistory();
  const visTekstblokker = useFeatureToggle(MELOSYS_TEKSTBLOKKER);
  const aktiveToggles = useAktiveToggles();

  const tekstblokker = useTekstblokker(undefined, Boolean(visTekstblokker));

  const stats = useMemo(() => {
    const alle = tekstblokker.data ?? [];
    return {
      tekstblokker: alle.filter((b) => b.type === "TEKSTBLOKK").length,
      brevmaler: alle.filter((b) => b.type === "BREVMAL").length,
      unikeTags: tellTags(alle).length,
      sistEndret: alle.length === 0 ? null : alle.reduce((a, b) => (a.endretDato > b.endretDato ? a : b)),
    };
  }, [tekstblokker.data]);

  const sistEndret = stats.sistEndret;

  return (
    <div className="oversikt">
      <Heading size="large" level="1">
        Oversikt
      </Heading>
      <BodyShort>Sammendrag av administrasjonsfunksjoner du har tilgang til.</BodyShort>

      {visTekstblokker && (
        <section className="oversikt__seksjon">
          <div className="oversikt__seksjon-header">
            <Heading size="small" level="2">
              Tekstblokker og brevmaler
            </Heading>
            <Nav.Button size="small" variant="tertiary" onClick={() => history.push(ADMIN_TEKSTBLOKKER)}>
              Gå til Tekstblokker →
            </Nav.Button>
          </div>

          {tekstblokker.isLoading && (
            <div className="oversikt__laster">
              <Nav.Loader size="small" />
            </div>
          )}

          {!tekstblokker.isLoading && (
            <div className="oversikt__kort-rad">
              <StatistikkKort label="Tekstblokker" verdi={stats.tekstblokker} />
              <StatistikkKort label="Brevmaler" verdi={stats.brevmaler} />
              <StatistikkKort label="Unike tags" verdi={stats.unikeTags} />
              <StatistikkKort
                label="Sist endret"
                verdi={sistEndret?.tittel ?? "—"}
                undertekst={
                  sistEndret
                    ? `${formatterDatoTilNorsk(sistEndret.endretDato, true)} av ${sistEndret.endretAv}`
                    : undefined
                }
              />
            </div>
          )}
        </section>
      )}

      <section className="oversikt__seksjon">
        <Heading size="small" level="2">
          Aktive funksjoner
        </Heading>
        <BodyShort size="small" className="oversikt__hjelp">
          Feature toggles som er slått på akkurat nå.
        </BodyShort>
        {aktiveToggles.length === 0 ? (
          <BodyShort size="small">Ingen valgfrie funksjoner er aktive.</BodyShort>
        ) : (
          <ul className="oversikt__toggle-liste">
            {aktiveToggles.map((navn) => (
              <li key={navn}>
                <code>{navn}</code>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

interface StatistikkKortProps {
  label: string;
  verdi: string | number;
  undertekst?: string;
}

function StatistikkKort({ label, verdi, undertekst }: StatistikkKortProps) {
  return (
    <div className="oversikt__kort">
      <div className="oversikt__kort-label">{label}</div>
      <div className="oversikt__kort-verdi">{verdi}</div>
      {undertekst && <div className="oversikt__kort-undertekst">{undertekst}</div>}
    </div>
  );
}

export default OversiktSide;
