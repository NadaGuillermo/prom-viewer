import React, { useState } from "react";
import Portal from "@components/Portal";
import { backgroundColorRecord, textColorRecord, type Style } from "@styles/index";

interface Props {
  content: React.ReactNode;
  type?: Style.Color;
  children: React.ReactNode;
};

type Coords = {
  left: number;
  top: number;
};

function CustomTooltip({ content, children, type = "base" }: Props) {
  const [coords, setCoords] = useState<Coords>({ left: 0, top: 0 });
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const mouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    setCoords({
      left: rect.left , //+ rect.width / 2,
      top: rect.top + rect.height,
    });
    setShowTooltip(true);
  };

  const mouseLeave = () => {
    setShowTooltip(false);
  };

  const backgroundColor = backgroundColorRecord[type] ?? backgroundColorRecord["base"];
  const textColor = textColorRecord[type] ?? textColorRecord["base"]

  return (
    <div
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}
    >
      {children}
      {showTooltip && (
        <Portal>
          <div
            style={{ left: coords.left, top: coords.top }}
            className={`tooltip ${backgroundColor} ${textColor}`}
          >
            {content}
          </div>
        </Portal>
      )}
      </div>
  );
}

export default CustomTooltip;