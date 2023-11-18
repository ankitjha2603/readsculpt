import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  getAuth,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";

import { select, toggleClass } from "../../default/functions.js";
import { auth } from "../../firebase/base.js";
import {
  readData,
  writeData,
} from "../../firebase/firebase.database.operations.js";

const makeUsernameCompact = (username) => {
  if (username.length <= 15) return username;
  return username.slice(0, 15) + "...";
};
const unsubscribe = onAuthStateChanged(auth, (authUser) => {
  select(".google-login").hidden = authUser != null;
  select(".user-option").hidden = authUser === null;
  if (authUser != null) {
    let currentUserInfo = getAuth().currentUser;
    readData(
      `users/${currentUserInfo.uid}`,
      () => {
        select(
          ".user-dp"
        ).style.backgroundImage = `url('${currentUserInfo.photoURL}')`;
        select("strong.username").innerText = makeUsernameCompact(
          currentUserInfo.email
        );
      },
      () => {
        select("strong.username").innerText = makeUsernameCompact(
          currentUserInfo.email
        );
        select(
          ".user-dp"
        ).style.backgroundImage = `url('${currentUserInfo.photoURL}')`;
        writeData(`users/${currentUserInfo.uid}`, {
          email: currentUserInfo.email,
          "profile-pic": currentUserInfo.photoURL,
        });
      }
    );
  }
});
select(".google-login").onclick = () => {
  const provider = new GoogleAuthProvider();
  signInWithRedirect(auth, provider);
};

select(".user-option").onclick = () => toggleClass(".user-option > ul", "show");
select(".log-out").onclick = async () => {
  await signOut(auth);
  location.reload();
};
