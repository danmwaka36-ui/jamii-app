import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

// Register
export async function registerUser(
  fullName: string,
  email: string,
 password: string
) {
  const userCredential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  await setDoc(
    doc(db, "users", userCredential.user.uid),
    {
      uid: userCredential.user.uid,
      fullName,
      email,
      role: "citizen",
      createdAt: serverTimestamp(),
    }
  );

  return userCredential;
}

// Login
export async function loginUser(
  email: string,
  password: string
) {
  return signInWithEmailAndPassword(
    auth,
    email,
    password
  );
}

// Logout
export async function logoutUser() {
  return signOut(auth);
}

// Reset Password
export async function resetPassword(
  email: string
) {
  return sendPasswordResetEmail(
    auth,
    email
  );
}