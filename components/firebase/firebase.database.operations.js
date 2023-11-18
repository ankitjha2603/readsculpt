import {
  getDatabase,
  ref,
  set,
  get,
  child,
  query,
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-database.js";

export const writeData = (path, information, call_back = () => {}) => {
  const db = getDatabase();
  set(ref(db, path), information);
  call_back();
};

export const readData = (path, call_back, if_data_not_found = () => {}) => {
  const dbRef = ref(getDatabase());
  get(child(dbRef, path))
    .then((snapshot) => {
      if (snapshot.exists()) call_back(snapshot.val());
      else if_data_not_found(path);
    })
    .catch((error) => console.error(path, error));
};
export const deleteData = (path) => writeData(path, null);

export const search = (path, call_back, if_data_not_found = () => {}) => {
  const dbRef = ref(getDatabase());
  const que = query(child(dbRef, path));

  get(que)
    .then((snapshot) => {
      const data = new Array();

      snapshot.forEach((childSnapshot) => {
        data.push([childSnapshot.key, childSnapshot.val()]);
      });
      if (data) call_back(data);
      else if_data_not_found(path);
    })
    .catch((error) => if_data_not_found(path, error));
};
