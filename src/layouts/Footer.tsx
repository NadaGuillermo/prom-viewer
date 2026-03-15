import "@styles/style.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from "@fortawesome/free-brands-svg-icons/faGithub";

library.add(faGithub);

const Footer = () => {
  return (
<footer className="tw:footer tw:sm:footer-horizontal tw:justify-items-center-safe tw:shadow-sm tw:text-base-content tw:p-4">
  <nav>
    <h6 className="tw:footer-title">PROM Viewer v1.0.0</h6>
    </nav>
<nav>
    <h6 className="tw:footer-title"><a className="tw:link tw:link-hover" href="https://github.com/" target="_blank" rel="noopener noreferrer">Source Code <FontAwesomeIcon icon={faGithub} /></a></h6>
    </nav>
<nav>
    <h6 className="tw:footer-title">License: AAA</h6>
  </nav>
</footer>
  );
};

export default Footer;