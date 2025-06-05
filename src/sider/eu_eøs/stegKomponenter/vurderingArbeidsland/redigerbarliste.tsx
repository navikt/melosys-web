import Element from "./element";

interface ElementItemProps {
  kode: string;
  term: string;
  fjernbar?: boolean;
  defaultFjernet?: boolean;
}

interface RedigerbarlisteProps {
  elementer: ElementItemProps[];
  onFjern?: (kode: string) => void;
  onAngreFjern?: (kode: string) => void;
  className?: string;
  redigerbar?: boolean;
}

function Redigerbarliste({
  elementer,
  onFjern = () => {},
  onAngreFjern = () => {},
  className,
  redigerbar = true,
}: RedigerbarlisteProps) {
  return (
    <div className={className}>
      {elementer.map(({ kode, term, fjernbar, defaultFjernet }) => (
        <Element
          key={kode}
          kode={kode}
          term={term}
          onFjern={onFjern}
          onAngreFjern={onAngreFjern}
          fjernbar={fjernbar}
          redigerbar={redigerbar}
          defaultFjernet={defaultFjernet}
        />
      ))}
    </div>
  );
}

export default Redigerbarliste;
