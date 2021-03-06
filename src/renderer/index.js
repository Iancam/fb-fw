import Home from "./Home";

import * as React from "react";
import { render } from "react-dom";
const styles = document.createElement("style");
styles.innerText = `
@import url(http://unpkg.com/tachyons-word-break@3.0.5/css/tachyons-word-break.min.css);
@import url(https://unpkg.com/tachyons@4/css/tachyons.min.css);
.flex-column-reverse {
  flex-direction: column-reverse;
}

`;
document.head.appendChild(styles);
render(<Home />, document.getElementById("app"));
