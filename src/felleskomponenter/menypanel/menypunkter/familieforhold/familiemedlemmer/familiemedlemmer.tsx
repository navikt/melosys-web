import { useSelector } from "react-redux";
import { Alert, BodyShort, Heading, Tag } from "@navikt/ds-react";
import { PersonGroupIcon, ChildEyesIcon } from "@navikt/aksel-icons";
import { useHentFamiliemedlemmerQuery } from "./hentFamiliemedlemmer.generated";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { Familierelasjonsrolle } from "../../../../../graphql";
import bem from "../../../../../bemUtils";
import "./familiemedlemmer.css";
import BarnTable from "./tables/barnTable";
import EktefelleTable from "./tables/ektefelleTable";

const Familiemedlemmer = () => {
  const behandlingID: number = useSelector(behandlingerSelectors.BehandlingIDSelector) as number;
  const { loading, error, data } = useHentFamiliemedlemmerQuery({ variables: { behandlingID } });

  if (error) return <Alert variant="error">Kunne ikke hente familiemedlemmer!</Alert>;
  if (loading) return <div>Henter familiemedlemmer...</div>;

  const barn =
    data?.hentSaksopplysninger.persondata.familiemedlemmer.filter(
      (fm) => fm.relasjonsrolle === Familierelasjonsrolle.Barn
    ) || [];

  const ektefellePartner =
    data?.hentSaksopplysninger.persondata.familiemedlemmer.filter(
      (fm) =>
        fm.relasjonsrolle === Familierelasjonsrolle.RelatertVedSivilstand &&
        fm.sivilstand != null &&
        !fm.sivilstand.erHistorisk
    ) || [];

  const familiemedlemmerClassName = bem("familiemedlemmer");

  return (
    <div className={familiemedlemmerClassName.block}>
      <div className={familiemedlemmerClassName.element("padding-bottom")}>
        <Tag size="small" variant="info" className={familiemedlemmerClassName.element("fra-register-etikett")}>
          Fra register
        </Tag>
      </div>
      <Heading size="xsmall" level="2" spacing className={familiemedlemmerClassName.element("understrek")}>
        <ChildEyesIcon aria-hidden="true" fontSize="1.5rem" className="mellomrom-ikon-tekst" /> Barn
      </Heading>
      {barn.length > 0 ? (
        <BarnTable barnListe={barn} />
      ) : (
        <BodyShort size="small" spacing>
          Ingen barn registrert.
        </BodyShort>
      )}
      <Heading size="xsmall" level="2" spacing className={familiemedlemmerClassName.element("understrek")}>
        <PersonGroupIcon aria-hidden="true" fontSize="1.5rem" className="mellomrom-ikon-tekst" /> Ektefelle/partner
      </Heading>
      <BodyShort size="small" textColor="subtle" spacing>
        Samboer registreres ikke som relasjon i PDL
      </BodyShort>
      {ektefellePartner.length > 0 ? (
        <EktefelleTable ektefelleListe={ektefellePartner} />
      ) : (
        <BodyShort size="small">Ingen ektefelle/partner registrert.</BodyShort>
      )}
    </div>
  );
};

export default Familiemedlemmer;
