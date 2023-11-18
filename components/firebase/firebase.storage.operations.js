import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-storage.js";
import { storage } from "./base.js";

export const getStorageUrl = (
  path,
  callback,
  dataNotFoundCallback = () => {}
) => {
  const imageRef = ref(storage, path);
  getDownloadURL(imageRef)
    .then((url) => {
      callback(url);
    })
    .catch((error) => {
      if (error.code === "storage/object-not-found") {
        dataNotFoundCallback();
      } else {
        console.error("Error getting image URL:", error);
      }
    });
};

export const uploadFileToStorage = (
  file,
  storagePath,
  successCallback = () => console.log("success"),
  progress = (snapshot) => {},
  errorCallback = (error) => console.error("error", error)
) => {
  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file);
  uploadTask.on("state_changed", progress, errorCallback, successCallback);
};
