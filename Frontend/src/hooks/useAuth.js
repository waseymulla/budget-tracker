import { useMemo } from "react";
import { getAuthToken, logoutUser } from "../services/authService.js";

export default function useAuth() {
  const token = useMemo(() => getAuthToken(), []);

  return {
    token,
    isAuthed: Boolean(token),
    logout: () => logoutUser(),
  };
}
