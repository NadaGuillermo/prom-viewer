import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface Props {
  children: React.ReactNode;
}

const Portal = ({ children }: Props) => {
  const portal = document.getElementById("portal-root");
  const elRef = useRef<HTMLDivElement>(document.createElement("div"));
  const el = elRef.current;

  if (portal === null) {
    return null;
  }
  useEffect(() => {
    portal.appendChild(el);
    return () => {
      portal.removeChild(el);
    };
  }, [el, portal]);

  return createPortal(children, el);
  
};

export default Portal;
