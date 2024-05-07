import * as Utils from "../../utils";
import * as Nav from "../../navFrontend";
import * as KV from "../../kodeverk";
import MKV from "../../melosyskodeverk";

export interface ArbeidslandProp {
  landkode?: string;
  type: "Flaggland" | "Sokkelland" | "Territorialfarvannsland";
}

interface Props {
  landliste: ArbeidslandProp[];
  onChange: (land: ArbeidslandProp) => void;
  arbeidslandType: string | undefined;
  disabled: boolean;
}

const ArbeidslandRadioButtons = ({ landliste, onChange, arbeidslandType, disabled }: Props) => {
  const utfylteLand = landliste.filter((land) => land.landkode);

  if (Utils._isEmpty(utfylteLand)) return <>Ingen flaggland, sokkelland eller territorialfarvannsland valgt.</>;

  const unikRadioButtonGruppeID = Utils._uuid();
  return (
    <>
      {utfylteLand.map((land) => (
        <Nav.Radio
          id={Utils._uuid()}
          onChange={() => onChange(land)}
          checked={arbeidslandType === land.type}
          key={land.type}
          value={land.landkode}
          label={`${KV.kodeTilTerm(land.landkode, MKV.KTObjects.landkoder)} - ${land.type}`}
          name={unikRadioButtonGruppeID}
          disabled={disabled}
        />
      ))}
    </>
  );
};

export default ArbeidslandRadioButtons;
