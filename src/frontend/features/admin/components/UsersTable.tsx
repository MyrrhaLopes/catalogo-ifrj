import { tableFeatures, createColumnHelper, useTable } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table";
import { Loader2 } from "lucide-react";
import { useUsers } from "../hooks/useAdminUsers";
import type { UserListItem } from "@/backend/http/features/users/user.schema";

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, UserListItem>();

const columns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "ID",
    cell: (ctx) => (
      <span className="font-mono text-xs text-muted-foreground">
        {ctx.getValue().slice(0, 8)}…
      </span>
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
    cell: (ctx) => {
      const v = ctx.getValue();
      if (!v) return <span className="text-muted-foreground">—</span>;
      return new Date(v).toLocaleDateString("pt-BR");
    },
  }),
]);

export function UsersTable() {
  const { data: users = [], isLoading, isError } = useUsers();

  const table = useTable({
    features,
    data: users,
    columns,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Carregando usuários…
      </div>
    );
  }

  if (isError) {
    return <div className="text-destructive text-sm p-4">Erro ao carregar usuários.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                Nenhum usuário cadastrado
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
