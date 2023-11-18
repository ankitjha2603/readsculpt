import { select, openUrl } from "./functions.js";
select(".open-link", false).forEach((clickButton) => {
  clickButton.onclick = ({ target }) => {
    openUrl = openUrl(
      target.getAttribute("href") ? target.getAttribute("href") : "",
      false
    );
  };
});
