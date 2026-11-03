import { tableFeatures, createColumnHelper, useTable } from "@tanstack/react-table";
import { useUsersAdminTable } from "../hooks/useAdminUsers";
import type { UserListItem } from "@/backend/http/features/users/user.schema";
import { AdminDataTable, CreatedAtCell, LockedCell } from "./AdminTableShared";
import { AdminTablePagination } from "./AdminTablePagination";

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, UserListItem>();

const columns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "ID",
    cell: (ctx) => (
      <LockedCell>
        <span className="font-mono text-xs">{ctx.getValue().slice(0, 8)}…</span>
      </LockedCell>
    ),
  }),
  columnHelper.accessor("name", {
    header: "Nome",
    cell: (ctx) => {
      const v = ctx.getValue();
      return v ?? <span className="text-muted-foreground">—</span>;
    },
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (ctx) => ctx.getValue(),
  }),
  columnHelper.accessor("createdAt", {
    header: "Criado em",
    cell: (ctx) => <CreatedAtCell value={ctx.getValue()} />,
  }),
]);

export function UsersTable() {
  const { users, isLoading, isError, page, setPage, totalPages } = useUsersAdminTable();

  const table = useTable({
    features,
    data: users,
    columns,
  });

  return (
    <div className="flex flex-col gap-3">
      <AdminDataTable
        table={table}
        colCount={columns.length}
        emptyMessage="Nenhum usuário cadastrado"
        isLoading={isLoading}
        loadingMessage="Carregando usuários…"
        isError={isError}
        errorMessage="Erro ao carregar usuários."
      />

      <AdminTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
