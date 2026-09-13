import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  children: React.ReactNode;
}

/**
 * Custom portal component that renders its children into a DOM node outside the parent component's hierarchy.
 * This is useful for rendering modals, tooltips, or other elements that need to visually break out of the parent container.
 */
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
