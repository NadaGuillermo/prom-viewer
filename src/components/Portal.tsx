import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  children: React.ReactNode;
}

const Portal = ({ children }: Props) => {
  const portal = document.getElementById("portal-root");
  const [el] = useState(() => document.createElement("div"));

  useEffect(() => {
    if (portal === null) return;
    portal.appendChild(el);
    return () => {
      portal.removeChild(el);
    };
  }, [el, portal]);

  if (portal === null) {
    return null;
  }

  return createPortal(children, el);
  
};

export default Portal;
