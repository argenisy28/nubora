import {
  fetchAuthSession,
  getCurrentUser,
  signIn,
  signOut,
} from "aws-amplify/auth";

export async function login(email: string, password: string) {
  return signIn({
    username: email,
    password,
  });
}

export async function logout() {
  return signOut();
}

export async function getUser() {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

export async function getAccessToken() {
  const session = await fetchAuthSession();

  return session.tokens?.accessToken?.toString() ?? null;
}