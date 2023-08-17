import * as Ikoner from "../../../../../resources/images";
import * as Mui from "../../../../ui";

interface IngenDataRenderProps {
  redigerbart: boolean;
  onClick: () => void;
  lenketekst: string;
}

const IngenDataRender = ({ redigerbart, onClick, lenketekst }: IngenDataRenderProps) =>
  redigerbart ? (
    <Mui.Lenkeknapp onClick={onClick} ikon={Ikoner.Add}>
      {lenketekst}
    </Mui.Lenkeknapp>
  ) : null;

export default IngenDataRender;
