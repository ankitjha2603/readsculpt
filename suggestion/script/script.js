//---------------------------------------------->
//SECTION: IMPORT
import app, { auth } from "../../components/firebase/base.js";
import {
  select,
  append,
  newElement,
  calculateVerticalScrollPercentage,
} from "../../components/default/functions.js";
import {
  deleteData,
  readData,
  writeData,
} from "../../components/firebase/firebase.database.operations.js";
import {
  getStorageUrl,
  uploadFileToStorage,
} from "../../components/firebase/firebase.storage.operations.js";
import {
  onAuthStateChanged,
  getAuth,
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
//---------------------------------------------->

//---------------------------------------------->
//SECTION: Variable and constant
let showing = 5;
let savedData = new Array();
const reason_char_reason = 300;
let currentUser;
//---------------------------------------------->

//---------------------------------------------->
//SECTION: function
const like = ({ target }) => {
  if (!currentUser) return 0;
  const uid = currentUser.uid;
  const suggestion_id = target.getAttribute("suggestion-id");
  const state = target.getAttribute("state");
  const choice = state === "after" ? null : 1;
  writeData(
    `/suggestion/${suggestion_id}/users-like-dislike-uid/${uid}`,
    choice
  );
  if (
    select(`.dislike-container-${suggestion_id} > .dislike-icon`).getAttribute(
      "state"
    ) === "after"
  ) {
    let nowdown =
      select(`.dislike-container-${suggestion_id} > .dislike-count`).innerText *
        1 -
      1;
    writeData(`/suggestion/${suggestion_id}/score-down`, nowdown);
    select(`.dislike-container-${suggestion_id} > .dislike-count`).innerText =
      nowdown;
  }
  let nowup =
    select(`.like-container-${suggestion_id} > .like-count`).innerText * 1 +
    (state === "before" ? 1 : -1);
  writeData(`/suggestion/${suggestion_id}/score-up`, nowup);
  select(`.like-container-${suggestion_id} > .like-count`).innerText = nowup;

  target.setAttribute("state", state === "before" ? "after" : "before");
  select(`.dislike-container-${suggestion_id} > .dislike-icon`).setAttribute(
    "state",
    "before"
  );
};
const dislike = ({ target }) => {
  if (!currentUser) return 0;
  const uid = currentUser.uid;
  const suggestion_id = target.getAttribute("suggestion-id");
  const state = target.getAttribute("state");
  const choice = state === "after" ? null : -1;

  writeData(
    `/suggestion/${suggestion_id}/users-like-dislike-uid/${uid}`,
    choice
  );

  if (
    select(`.like-container-${suggestion_id} > .like-icon`).getAttribute(
      "state"
    ) === "after"
  ) {
    let nowup =
      select(`.like-container-${suggestion_id} > .like-count`).innerText * 1 -
      1;
    writeData(`/suggestion/${suggestion_id}/score-up`, nowup);
    select(`.like-container-${suggestion_id} > .like-count`).innerText = nowup;
  }
  let nowdown =
    select(`.dislike-container-${suggestion_id} > .dislike-count`).innerText *
      1 +
    (state === "before" ? 1 : -1);
  writeData(`/suggestion/${suggestion_id}/score-down`, nowdown);
  select(`.dislike-container-${suggestion_id} > .dislike-count`).innerText =
    nowdown;

  target.setAttribute("state", state === "before" ? "after" : "before");
  select(`.like-container-${suggestion_id} > .like-icon`).setAttribute(
    "state",
    "before"
  );
};
const extendContainer = () => {
  if (savedData.length === showing) return 0;
  const container = select("section#card-collection");
  while (
    calculateVerticalScrollPercentage(container) > 85 &&
    savedData.length > showing
  ) {
    showing += 5;
    showData(savedData.slice(showing - 5, showing));
  }
};
const uploadSuggestion = () => {
  const uid = currentUser.uid;
  const name = select("#suggest-book-name").value;
  const reason = select("#suggested-book-reason").value;
  const file = select("#uploaded-cover-image").files[0];
  const k = `${uid}${new Date() * 1}`;
  if (file) {
    const filename = `${k}${file.name}`;
    writeData(`suggestion/${k}`, {
      name,
      reason,
      "cover-image-name": filename,
      "score-up": 1,
      "score-down": 0,
      creator: uid,
      "users-like-dislike-uid": {
        [uid]: 1,
      },
    });
    uploadFileToStorage(file, `suggestion/${filename}`, () =>
      location.reload()
    );
  } else {
    writeData(
      `suggestion/${k}`,
      {
        name: name,
        "score-up": 1,
        "score-down": 0,
        reason: reason,
        creator: uid,
        "cover-image-name": "undefined",
        "users-like-dislike-uid": {
          [uid]: 1,
        },
      },
      () => location.reload()
    );
  }
};
const createCard = (id, info) =>
  newElement(
    ["rs-block", `rs-block-${id}`],
    `
    <div
    class="bk-cover-photo"
    ></div>
    <div class="bk-info">
        <div class="bk-title">${info.name}</div>
        <div class="bk-info-title">Reason</div>
        <p class="reason">${info.reason}</p>
        <div class="like-dislike-container like-dislike-container-${id}">
            <div class="like-container like-container-${id} ${
      currentUser ? "authorized-user" : "unauthorized-user"
    }" suggestion-id="${id}">
                <div class="hide-like-dislike-to-unauthorized-user"></div>
                <div class="like-icon" state="before" suggestion-id="${id}"></div>
                <div class="like-count" suggestion-id="${id}">${
      info["score-up"]
    }</div>
            </div>
            <div class="dislike-container dislike-container-${id} ${
      currentUser ? "authorized-user" : "unauthorized-user"
    }" suggestion-id="${id}">
                <div class="hide-like-dislike-to-unauthorized-user"></div>
                <div class="dislike-icon" state="before" suggestion-id="${id}"></div>
                <div class="dislike-count" suggestion-id="${id}">${
      info["score-down"]
    }</div>
            </div>
            <div class="delete delete-${id}" creator="other"></delete>
        </div>
    </div>
    `,
    "rs-block"
  );
const showData = (data, callback = () => {}) => {
  const container = select("#card-collection");
  data.forEach(([id, info]) => {
    append(container, createCard(id, info));
    const rs_block = select(`.rs-block-${id}`);
    if (currentUser) {
      rs_block.setAttribute(
        "creator",
        info.creator === currentUser.uid ? "you" : "other"
      );
      if (info.creator === currentUser.uid) {
        select(`.delete-${id}`).setAttribute("creator", "you");
        select(`.delete-${id}`).onclick = () => {
          if (window.confirm("Please confirm or cancel:"))
            writeData(`deleted/suggestion/${id}`, info, () => {
              deleteData(`suggestion/${id}`);
              location.reload();
            });
        };
      }
    } else rs_block.setAttribute("creator", "other");
    if (currentUser)
      readData(
        `/suggestion/${id}/users-like-dislike-uid/${currentUser.uid}`,
        (d) => {
          if (d == 1)
            select(`.like-container-${id} > .like-icon`).setAttribute(
              "state",
              "after"
            );
          else
            select(`.dislike-container-${id} > .dislike-icon`).setAttribute(
              "state",
              "after"
            );
        }
      );
    select(`.like-container-${id}`).onclick = like;
    select(`.dislike-container-${id}`).onclick = dislike;
    const cover = select(`.rs-block-${id} > .bk-cover-photo`);
    getStorageUrl(
      `suggestion/${info["cover-image-name"]}`,
      (url) => (cover.style.backgroundImage = `url(${url})`),
      () => cover.setAttribute("state", "no-cover-image-found")
    );
  });
  callback();
};
const refresh = () => {
  readData("suggestion", (suggestion_book_list) => {
    savedData.splice(0, savedData.length);
    Object.keys(suggestion_book_list).forEach((id) =>
      savedData.push([id, suggestion_book_list[id]])
    );
    savedData.sort(() => Math.random() - Math.random());
    showData(savedData.slice(0, 5), extendContainer);
  });
};
//---------------------------------------------->

//---------------------------------------------->
//SECTION: init
select("#suggest-book-name").setCustomValidity("Book name is required");
select("#suggested-book-reason").setCustomValidity(
  `The reason for adding this is mandatory, with a maximum length of ${reason_char_reason} characters.`
);
//---------------------------------------------->

//---------------------------------------------->
//SECTION: validation
onAuthStateChanged(auth, (authUser) => {
  currentUser = authUser;
  if (authUser)
    select(".submit-suggestion").onclick = () => {
      select(".light-background").hidden = false;
      select(".center").hidden = false;
    };
  else select(".submit-suggestion").classList.add("not-for-unauthorized-user");
  refresh();
});
//---------------------------------------------->

//---------------------------------------------->
//SECTION: event
select("section#card-collection").onscroll = extendContainer;
select(".form-cancel-suggestion").onclick = () => {
  select(".light-background").hidden = true;
  select(".center").hidden = true;
  select("#uploaded-cover-image").value = "";
  select(".upload-cover-image-demo").style.backgroundImage = "";
};
select("#suggested-book-reason").onkeyup = (e) => {
  select(".reason-char-limit-warning").style.opacity =
    e.target.value.length <= reason_char_reason ? 0 : 1;
  e.target.value = e.target.value.slice(0, reason_char_reason);
};
select(".form-submit-suggestion").onclick = (e) => {
  e.preventDefault();
  const form = select(".book-suggestion-form");
  if (select("#suggest-book-name").value === "")
    return select("#suggest-book-name").reportValidity();
  if (select("#suggested-book-reason").value === "")
    return select("#suggested-book-reason").reportValidity();
  uploadSuggestion();
};
select("#uploaded-cover-image").onchange = (e) => {
  const file = e.target.files[0];
  console.log("file", file);
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const imageUrl = e.target.result;
      select(
        ".upload-cover-image-demo"
      ).style.backgroundImage = `url('${imageUrl}')`;
    };
    reader.readAsDataURL(file);
    select(".upload-cover-image-demo").setAttribute("state", "after");
  }
};
select(".upload-cover-image-cancel").onclick = () => {
  console.log("crack");
  select("#uploaded-cover-image").value = "";
  select(".upload-cover-image-demo").style.backgroundImage = "";
  select(".upload-cover-image-demo").setAttribute("state", "before");
};
//---------------------------------------------->
