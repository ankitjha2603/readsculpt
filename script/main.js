//---------------------------------------------->
//SECTION: IMPORT
import app from "../components/firebase/base.js";
import {
  select,
  append,
  toggleClass,
  openUrl,
  calculateVerticalScrollPercentage,
  newElement,
  toTitleCase,
} from "../components/default/functions.js";
import {
  readData,
  search,
  writeData,
} from "../components/firebase/firebase.database.operations.js";
import { getStorageUrl } from "../components/firebase/firebase.storage.operations.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
//---------------------------------------------->

//---------------------------------------------->
//SECTION: Variable and constant
let savedData;
let sortBy = "external-rating";
let sortByDirection = 1;
let showing = 5;
const genereFilterData = new Object();
let data_generated_by_filter;
//---------------------------------------------->

//---------------------------------------------->
//SECTION: function
const createRsblock = (rsId, bookInfo) => {
  return newElement(
    `rs-block-${rsId}`,
    `
      <div class="cover-user-rating">
        <div class="bk-cover-photo"></div>
        <div class="user-rating user-rating-${rsId}">
          <div class="user-rating-star-count">User rating --</div>
          <div class="user-rating-star" hidden></div>
        </div>
      </div>
      <div class="bk-info">
        <div class="rating-part">
          <div class="bk-rating-box">
            <div class="bk-rating">${bookInfo.rating.toFixed(2)}</div>
            <div class="bk-rating-star"></div>
          </div>
          <div class="user-like user-like-${rsId}"></div>
        </div>
        <div class="bk-title">${bookInfo.name}</div>
        <i class="bk-author">by ${bookInfo.author}</i>
        <div class="bk-mul-info">
          <div class="bk-dinfo">${
            bookInfo.yow > 1000 ? bookInfo.yow : `${bookInfo.yow} AD`
          }</div>
          <div class="bk-dinfo">${bookInfo["pg-cnt"]} Page</div>
          ${bookInfo.genre
            .map((dg) => `<span class="bk-dinfo">${dg}</span>`)
            .join("")}
        </div>
        <p class="bk-one-line">${bookInfo["one-line"]}</p>
        <div class="bk-mul-info">
          ${bookInfo.keywords
            .map(
              (dkey) =>
                `<span class="bk-keyword">#${toTitleCase(
                  dkey.replace(/-/g, " ")
                ).replace(/ /g, "")}</span>`
            )
            .join("")}
        </div>
      </div>
    `,
    "rs-block"
  );
};

const createRsBlockFromData = (data, extend = false, callback = () => {}) => {
  if (!extend) {
    data = data.slice(0, showing);
    select("#card-collection").innerHTML = "";
  }
  let card_collection = select("#card-collection");
  data.forEach(([rsId, bookInfo]) => {
    append(card_collection, createRsblock(rsId, bookInfo));
    let user = getAuth().currentUser;
    select(`.rs-block-${rsId}`).ondblclick = () => openUrl(`bk?id=${rsId}`);

    if (user) {
      select(`.user-like-${rsId}`).onclick = ({ target }) => {
        writeData(
          `users/${user.uid}/liked/${rsId}`,
          !target.classList.contains("liked") ? true : null
        );
        target.classList.toggle("liked");
      };
      readData(`users/${user.uid}/liked/${rsId}`, () =>
        toggleClass(`.user-like-${rsId}`, "liked")
      );
    } else toggleClass(`.user-like-${rsId}`, "disabled");
    readData(`/books-info/user-rating/${rsId}`, (data) => {
      let sum = 0;
      Object.values(data).forEach((e) => {
        sum += e;
      });
      let avg_rating = (sum / Object.values(data).length).toFixed(2);
      select(
        `.user-rating-${rsId} > .user-rating-star-count`
      ).innerText = `User rating ${avg_rating}`;
      select(`.user-rating-${rsId} > .user-rating-star`).hidden = false;
    });
  });
  setTimeout(
    () =>
      data.forEach(([rsId, bookInfo]) =>
        getStorageUrl(
          `book-cover/${rsId}.jpg`,
          (url) => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
              select(
                `.rs-block-${rsId} > .cover-user-rating > .bk-cover-photo`
              ).style.backgroundImage = `url(${url})`;
            };
          },
          console.warn
        )
      ),
    750
  );
  callback();
};
const removeExtraSpace = (inputString) =>
  inputString
    .trim()
    .replace(/^'(.*)'$/, "$1")
    .replace(/\s+/g, " ");

const createcardSort_Filter = () => {
  let searchText = select("#search-by-text").value;
  let tempData = savedData;

  if (Object.keys(genereFilterData).length) {
    tempData = tempData.filter((d_rs_book) => {
      let isinclude = false;
      for (let i = 0; i < d_rs_book[1].genre.length; i++) {
        if (genereFilterData[d_rs_book[1].genre[i]]) {
          isinclude = true;
          break;
        }
      }
      return isinclude;
    });
  }
  if (searchText)
    tempData = tempData.filter(([id, book]) => {
      const text = [book.author, book.name, book["one-line"], book.yow]
        .join(", ")
        .toLocaleLowerCase();

      return removeExtraSpace(text).includes(
        removeExtraSpace(searchText.toLocaleLowerCase())
      );
    });
  data_generated_by_filter = tempData;
  if (sortBy === "liked") {
    if (!getAuth().currentUser) return alert("You are not logged in.");
    readData(`users/${getAuth().currentUser.uid}/liked`, (liked_book) => {
      const liked = new Array();
      const notliked = new Array();
      tempData.forEach((book) =>
        (liked_book[book[0]] ? liked : notliked).push(book)
      );
      createRsBlockFromData([...liked, ...notliked]);
    });
  } else if (sortBy === "external-rating") {
    tempData.sort((b1, b2) => (b2[1].rating - b1[1].rating) * sortByDirection);
    console.log(tempData, sortByDirection);
    createRsBlockFromData(tempData);
  } else if (sortBy === "user-rating") {
    readData(`books-info/user-rating`, (data) => {
      const getAvgUserRating = (book_id) => {
        if (data[book_id[0]] == undefined) return -Infinity * sortByDirection;
        const d_data = data[book_id[0]];
        let sum = 0;
        Object.values(d_data).forEach((e) => {
          sum += e;
        });
        return sum / Object.values(d_data).length;
      };
      tempData.sort(
        (b1, b2) =>
          (getAvgUserRating(b2) - getAvgUserRating(b1)) * sortByDirection
      );
      createRsBlockFromData(tempData);
    });
  } else if (sortBy === "shuffle") {
    tempData.sort(() => Math.random() - Math.random());
    createRsBlockFromData(tempData);
  } else {
    tempData.sort(
      (b1, b2) => (b2[1][sortBy] - b1[1][sortBy]) * sortByDirection
    );
    createRsBlockFromData(tempData);
  }
};

const extendContainer = () => {
  let data = data_generated_by_filter;
  if (data.length === showing) return 0;
  const container = select("section#card-collection");
  while (
    calculateVerticalScrollPercentage(container) > 85 &&
    data.length > showing
  ) {
    showing += 5;
    createRsBlockFromData(savedData.slice(showing - 5, showing), true);
  }
};
//---------------------------------------------->

//---------------------------------------------->
//SECTION: init
search(
  "/books-info/basic-info",
  (data) => {
    data.sort((b1, b2) => -b1[1]["rating"] + b2[1]["rating"]);
    savedData = data;
    data_generated_by_filter = data;
    createRsBlockFromData(data, false, extendContainer);
  },
  console.warn
);
//---------------------------------------------->

//---------------------------------------------->
//SECTION: event
select(".sorting-options").onchange = (e) => {
  sortBy = e.target.value;
  createcardSort_Filter();
};
select(".sorting-direction").onclick = () => {
  toggleClass(".sorting>button.sorting-direction", "reverse");
  toggleClass(".sort-icon.desc", "hidden");
  toggleClass(".sort-icon.asc", "hidden");
  sortByDirection *= -1;
  createcardSort_Filter();
};
select("#filter").onclick = () => {
  select(".filter-translucent").hidden = false;
};
select(".select-genre", false).forEach((d_genre) => {
  d_genre.onclick = ({ target }) => {
    if (target.classList.contains("selected"))
      delete genereFilterData[target.innerText];
    else genereFilterData[target.innerText] = true;
    target.classList.toggle("selected");
  };
});
select(".filter-close").onclick = () => {
  select(".filter-translucent").hidden = true;
  createcardSort_Filter();
};
select("section#card-collection").addEventListener("scroll", extendContainer);

//---------------------------------------------->
