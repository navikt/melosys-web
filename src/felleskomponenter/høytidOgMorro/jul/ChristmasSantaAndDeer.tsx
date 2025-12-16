import "./topplinjeJulepynt.less";

import SantaAndDeer from "./SantaAndDeer.svg";

export function ChristmasSantaAndDeer() {
  return (
    <div className="topplinje-julepynt__sesong">
      <img
        className="topplinje-julepynt__bilde"
        src={SantaAndDeer}
        alt=""
        aria-hidden
        draggable={false}
        width={400}
        height={45}
      />
    </div>
  );
}
