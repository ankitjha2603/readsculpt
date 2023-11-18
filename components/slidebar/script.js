"use strict";
import { select, toggleClass } from "../default/functions.js";
select("#hamburger-open-menu").onclick = () => {
  toggleClass("#slide-bar", "hidden");
  toggleClass("#hamburger-open-menu", "close");

  toggleClass("svg.slide-bar-open-icon", "slide-bar-hidden-icon");
  toggleClass("svg.slide-bar-close-icon", "slide-bar-hidden-icon");
};
