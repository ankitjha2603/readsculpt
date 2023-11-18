//---------------------------------------------->
//SECTION: IMPORT
import app, { auth } from "../../components/firebase/base.js";
import {
  append,
  newElement,
  openUrl,
  select,
} from "../../components/default/functions.js";
import {
  readData,
  writeData,
} from "../../components/firebase/firebase.database.operations.js";
import {
  onAuthStateChanged,
  getAuth,
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { getStorageUrl } from "../../components/firebase/firebase.storage.operations.js";
//---------------------------------------------->

//---------------------------------------------->
//SECTION: Variable and constant
const saveComment = {
  showCount: 5,
  comments: [],
};
const book_id = new URL(window.location.href).searchParams.get("id");
let current_selected_rank = 0;
let c_saying;
//---------------------------------------------->

//---------------------------------------------->
//SECTION: validation
if (book_id === null) openUrl("", false);
onAuthStateChanged(auth, (authUser) => {
  select(".show-more").style.display = authUser === null ? "none" : "";
  select(".overlay").hidden = authUser != null;
  if (authUser)
    select(
      ".feedback-input > .user-profile-pic"
    ).style.backgroundImage = `url(${authUser.photoURL})`;
});
//---------------------------------------------->

//---------------------------------------------->
//SECTION: function
const showComment = (data) => {
  data.forEach(([user_uid, comment]) => {
    readData(`users/${user_uid}`, (user_info) => {
      append(
        select(`.user-feedback`),
        newElement(
          ["feedback", `user-feelback-${user_uid}`],
          `
          <div class="user-profile-pic"></div>
          <div class="user-info">
            <div class="email-ranking">
              <div class="user-email">${user_info.email}</div>
              <div class="user-ranking user-rating-${user_uid}">
                <div class="user-rank" state="empty"></div>
                <div class="user-rank" state="empty"></div>
                <div class="user-rank" state="empty"></div>
                <div class="user-rank" state="empty"></div>
                <div class="user-rank" state="empty"></div>
              </div>
            </div>

            <div class="user-comment">${comment}</div>
          </div>`
        )
      );
      select(
        `.feedback.user-feelback-${user_uid} > .user-profile-pic`
      ).style.backgroundImage = `url(${user_info["profile-pic"]})`;
    });
    readData(`/books-info/user-rating/${book_id}/${user_uid}`, (rating) => {
      select(`.user-rating-${user_uid} > .user-rank`, false).forEach(
        (dr, index) => {
          if (index < rating) {
            dr.setAttribute("state", "full");
          } else {
            dr.setAttribute("state", "empty");
          }
        }
      );
    });
  });
};
const getComments = () => {
  select(".feedback:not(.feedback-input)", false).forEach((e) => e.remove());
  readData(
    `books-info/user-comment/${book_id}`,
    (data) => {
      const gen = [];
      Object.keys(data).forEach((id) => gen.push([id, data[id]]));
      saveComment.comments = gen;
      saveComment.showCount = 5;
      showComment(gen.slice(0, saveComment.showCount));
      select(".show-more").hidden = gen.length <= saveComment.showCount;
    },
    () => openUrl("", false)
  );
};
function say(text, callback) {
  let utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.5;
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.onend = callback;
  speechSynthesis.speak(utterance);
}

//---------------------------------------------->

//---------------------------------------------->
//SECTION: init
readData(
  `books-info/basic-info/${book_id}`,
  (data) => {
    select("title").innerText = `${data.name} by ${data.author}`;
    select(".book-title").innerText = data.name;
    select(".author.d-book-info > .book-info-value").innerText = data.author;
    select(".yow.d-book-info > .book-info-value").innerText = data.yow;
    select(".number-of-page.d-book-info > .book-info-value").innerText =
      data["pg-cnt"];
    select(".one-line-description.d-book-info > .book-info-value").innerText =
      data["one-line"];
    select(".amazon-link").onclick = () =>
      window.open(data["read-book-from"].amz, "_blank");
    getStorageUrl(
      `book-cover/${book_id}.jpg`,
      (url) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          select(`.cover`).style.backgroundImage = `url(${url})`;
        };
      },
      console.warn
    );
  },
  () => openUrl("", false)
);
readData(
  `books-info/plot-summary/${book_id}`,
  (data) => {
    select(".plot").innerText = data.plot;
    select(".summary").innerHTML = data.summary;
  },
  () => openUrl("", false)
);
getComments();
//---------------------------------------------->

//---------------------------------------------->
//SECTION: event
select(".show-more").onclick = () => {
  const { comments, showCount } = saveComment;
  showComment(comments.slice(showCount, showCount + 5));
  saveComment.showCount += 5;
  select(".show-more").hidden = comments.length <= saveComment.showCount;
};
select(".input-comment").onkeyup = () => {
  const target = select(".input-comment");
  if (target.value) {
    target.classList.add("dark");
    select("button.add-comment").classList.add("enable");
    select("button.add-comment").classList.remove("disable");
  } else {
    target.classList.remove("dark");
    select("button.add-comment").classList.remove("enable");
    select("button.add-comment").classList.add("disable");
  }
};
select("button.add-comment").onclick = () => {
  writeData(
    `books-info/user-rating/${book_id}/${getAuth().currentUser.uid}`,
    current_selected_rank,
    () =>
      writeData(
        `books-info/user-comment/${book_id}/${getAuth().currentUser.uid}`,
        select(".input-comment").value,
        getComments
      )
  );
  select(".input-comment").value = "";
  current_selected_rank = 0;
  select(".input-comment").onkeyup();
  select(".submit-ranking > .rank", false)[0].onmouseleave();
};
select(".submit-ranking > .rank", false).forEach((dr) => {
  dr.onmouseover = ({ target }) => {
    const rank_id = target.getAttribute("rank-id");
    select(".submit-ranking > .rank", false).forEach((r, index) =>
      r.setAttribute("state", index < rank_id ? "hover" : "before")
    );
  };
  dr.onmouseleave = () => {
    select(".submit-ranking > .rank", false).forEach((r, index) =>
      r.setAttribute(
        "state",
        index < current_selected_rank ? "after" : "before"
      )
    );
  };
  dr.onclick = ({ target }) => {
    current_selected_rank = target.getAttribute("rank-id") * 1;
    select("button.add-comment").disabled = false;
    select(".submit-ranking > .rank", false).forEach((r, index) => {
      select(".submit-ranking > .rank", false).forEach((r, index) =>
        r.setAttribute(
          "state",
          index < current_selected_rank ? "after" : "before"
        )
      );
    });
  };
});
select(".summary-head-play-pause").onclick = ({ target }) => {
  if (target.getAttribute("status") === "play") {
    if (c_saying === "plot") {
      select(".plot-head-play-pause").click();
    }
    target.setAttribute("status", "pause");
    say(select(".summary").innerText, () => {
      c_saying = undefined;
      target.setAttribute("status", "play");
    });
    c_saying = "summary";
  } else {
    target.setAttribute("status", "play");
    speechSynthesis.cancel();
    c_saying = undefined;
  }
};
select(".plot-head-play-pause").onclick = ({ target }) => {
  if (target.getAttribute("status") === "play") {
    if (c_saying === "summary") {
      select(".summary-head-play-pause").click();
    }
    target.setAttribute("status", "pause");
    say(select(".plot").innerText, () => {
      c_saying = undefined;
      target.setAttribute("status", "play");
    });
    c_saying = "plot";
  } else {
    target.setAttribute("status", "play");
    speechSynthesis.cancel();
    c_saying = undefined;
  }
};
//---------------------------------------------->
