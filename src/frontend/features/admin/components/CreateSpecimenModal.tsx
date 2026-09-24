import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/frontend/components/ui/dialog";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Loader2 } from "lucide-react";
import { useCreateSpecimen } from "../hooks/useAdminSpecimen";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateSpecimenModal({ open, onOpenChange }: Props) {
  const createMutation = useCreateSpecimen();

  const [code, setCode] = useState("");
  const [lot, setLot] = useState("");
  const [shelf, setShelf] = useState("");

  function handleClose() {
    setCode("");
    setLot("");
    setShelf("");
    onOpenChange(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!code.trim()) return;

    await createMutation.mutateAsync({
      code: code.trim(),
      lot: lot !== "" ? Number(lot) : undefined,
      shelf: shelf !== "" ? Number(shelf) : undefined,
    });

    handleClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Adicionar espécime</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="code">Código *</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ex: IFRJ-001"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lot">Lote</Label>
              <Input
                id="lot"
                type="number"
                value={lot}
                onChange={(e) => setLot(e.target.value)}
                placeholder="—"
                min={1}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shelf">Prateleira</Label>
              <Input
                id="shelf"
                type="number"
                value={shelf}
                onChange={(e) => setShelf(e.target.value)}
                placeholder="—"
                min={1}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!code.trim() || createMutation.isPending}>
              {createMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
