"use strict";
console.log("this is ReadSculpt");
const base = "https://ankitjha2603.github.io/readsculpt";

export function select(selection, singleElement = true) {
  if (singleElement) return document.querySelector(selection);
  return Array.from(document.querySelectorAll(selection));
}
export const append = (mainElement, ...subElements) =>
  subElements.forEach((subElement) => mainElement.append(subElement));

export function newElement(cls, content = "", tag = "div") {
  let element = document.createElement(tag);
  if (cls) {
    if (typeof cls === "object")
      cls.forEach((clsElement) => element.classList.add(clsElement));
    else element.classList.add(cls);
  }
  if (content) element.innerHTML = content;
  return element;
}

export const toggleClass = (selection, toggleClass) =>
  select(selection).classList.toggle(toggleClass);

export const toTitleCase = (str) =>
  str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export const openUrl = (url = "", newPage = true) => {
  let a = newElement("", "", "a");
  a.href = `${base}/${url}`;
  if (newPage) a.target = "_blank";
  a.click();
};

export const calculateVerticalScrollPercentage = (
  element,
  limit = 0.95 * window.innerHeight
) => {
  if (getComputedStyle(element).height.slice(0, -2) * 1 < limit) return 100;
  const { scrollHeight, clientHeight, scrollTop } = element;
  const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
  return Math.min(100, Math.max(0, scrollPercentage));
};
