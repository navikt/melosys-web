import "./topplinjeJulepynt.less";

import ChristmasDeerPng from "./SantaHatReindeer.png";

export function ChristmasDeer() {
  return (
    <img
      className="topplinje-julepynt__bilde topplinje-julepynt__julerein"
      src={ChristmasDeerPng}
      alt=""
      aria-hidden
      draggable={false}
      width={200}
      height={25}
    />
  );
}
