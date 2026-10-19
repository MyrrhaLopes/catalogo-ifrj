import { Check, Circle, X } from "lucide-react";
import { PASSWORD_RULES } from "@/backend/http/features/users/user.schema";
import { cn } from "@/lib/utils";

type PasswordRequirementsProps = {
  title?: string;
  /** Quando informado, cada requisito mostra se a senha o atende. */
  password?: string;
  /** Destaca em vermelho os requisitos não atendidos. */
  showErrors?: boolean;
};

export function PasswordRequirements({
  title = "A senha deve conter:",
  password,
  showErrors = false,
}: PasswordRequirementsProps) {
  const live = password !== undefined && password.length > 0;

  return (
    <div className="rounded-md bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
      <p className="mb-1 font-medium">{title}</p>
      <ul className="space-y-0.5">
        {PASSWORD_RULES.map((rule) => {
          const met = live && rule.test(password);
          const failed = !met && showErrors;
          const Icon = met ? Check : failed ? X : Circle;
          return (
            <li
              key={rule.id}
              className={cn(
                "flex items-center gap-1.5",
                met && "text-green-700",
                failed && "text-red-600",
              )}
            >
              <Icon className={cn("shrink-0", met || failed ? "size-3.5" : "size-2")} aria-hidden />
              <span>{rule.label}</span>
              {live && <span className="sr-only">{met ? "(atendido)" : "(não atendido)"}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
