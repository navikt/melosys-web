import * as Ikoner from "../../../../../resources/images";
import * as Mui from "../../../../ui";

interface IngenDataRenderProps {
  redigerbart: boolean;
  onClick: () => void;
  lenketekst: string;
}

function IngenDataRender({ redigerbart, onClick, lenketekst }: IngenDataRenderProps) {
  return redigerbart ? (
    <Mui.Lenkeknapp onClick={onClick} ikon={Ikoner.Add}>
      {lenketekst}
    </Mui.Lenkeknapp>
  ) : null;
}

export default IngenDataRender;
