import { tableFeatures, createColumnHelper, useTable } from "@tanstack/react-table";
import { useUsers } from "../hooks/useAdminUsers";
import type { UserListItem } from "@/backend/http/features/users/user.schema";
import { AdminDataTable, CreatedAtCell, LockedCell } from "./AdminTableShared";

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
  const { data: users = [], isLoading, isError } = useUsers();

  const table = useTable({
    features,
    data: users,
    columns,
  });

  return (
    <AdminDataTable
      table={table}
      colCount={columns.length}
      emptyMessage="Nenhum usuário cadastrado"
      isLoading={isLoading}
      loadingMessage="Carregando usuários…"
      isError={isError}
      errorMessage="Erro ao carregar usuários."
    />
  );
}
