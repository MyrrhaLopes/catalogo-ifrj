import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../admin.api";

export const USERS_ADMIN_PAGE_SIZE = 20;

export function useUsersAdminTable() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", "admin-list", page],
    queryFn: () => getUsers(page, USERS_ADMIN_PAGE_SIZE),
    placeholderData: (prev) => prev,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / USERS_ADMIN_PAGE_SIZE)) : 1;

  return {
    page,
    setPage,
    users: data?.users ?? [],
    totalPages,
    isLoading,
    isError,
  };
}
