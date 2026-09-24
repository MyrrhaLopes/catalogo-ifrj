import { AlertTriangle, Eye, Save, X, ArrowLeft } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { buttonVariants } from "@/frontend/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/frontend/components/ui/alert-dialog";

type Props = {
  mode: "edit" | "preview";
  isSaving: boolean;
  onPreview: () => void;
  onSave: () => void;
  onCancel: () => void;
  onBackToEdit: () => void;
};

export function ArticleEditorHeader({ mode, isSaving, onPreview, onSave, onCancel, onBackToEdit }: Props) {
  if (mode === "preview") {
    return (
      <div className="flex items-center gap-3 px-6 py-2 bg-blue-50 border-b border-blue-200 text-sm sticky top-0 z-20">
        <Eye className="h-4 w-4 text-blue-600 shrink-0" />
        <span className="text-blue-800 flex-1 text-sm">
          Modo de visualização — veja como o artigo ficará publicado
        </span>
        <Button size="sm" variant="outline" className="shrink-0" onClick={onBackToEdit}>
          <ArrowLeft className="h-3 w-3 mr-1" />
          Voltar à edição
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-6 py-2 bg-amber-50 border-b border-amber-200 text-sm sticky top-0 z-20">
      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
      <span className="text-amber-800 flex-1 text-sm">
        Modo de edição — mudanças salvas localmente até confirmar
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" variant="outline" onClick={onPreview}>
          <Eye className="h-3 w-3 mr-1" />
          Visualizar
        </Button>
        <Button size="sm" onClick={onSave} disabled={isSaving}>
          <Save className="h-3 w-3 mr-1" />
          {isSaving ? "Salvando…" : "Salvar"}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="ghost">
              <X className="h-3 w-3 mr-1" />
              Cancelar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar edição?</AlertDialogTitle>
              <AlertDialogDescription>
                As mudanças salvas localmente serão descartadas e você voltará ao modo de leitura.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continuar editando</AlertDialogCancel>
              <AlertDialogAction
                className={buttonVariants({ variant: "destructive" })}
                onClick={onCancel}
              >
                Descartar e sair
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
