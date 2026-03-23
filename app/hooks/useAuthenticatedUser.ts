"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { getUserDisplayFromSource, type AuthUserDisplay } from "../lib/auth";
import { getAuthMe, type AuthMeResponse } from "../services/auth.service";

type UseAuthenticatedUserResult = {
  userDisplay: AuthUserDisplay;
  user: AuthMeResponse | null;
  isLoading: boolean;
};

export function useAuthenticatedUser(token: string | null): UseAuthenticatedUserResult {
  const [user, setUser] = useState<AuthMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    let isActive = true;
    setIsLoading(true);

    async function loadUser() {
      try {
        const data = await getAuthMe();

        if (!isActive) {
          return;
        }

        setUser(data);
      } catch (error) {
        if (!isActive) {
          return;
        }

        if (axios.isAxiosError(error)) {
          const status = error.response?.status;

          if (status === 401 || status === 403) {
            setUser(null);
            return;
          }
        }

        setUser(null);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      isActive = false;
    };
  }, [token]);

  const userDisplay = useMemo(() => {
    return getUserDisplayFromSource(user, token);
  }, [user, token]);

  return {
    userDisplay,
    user,
    isLoading,
  };
}
