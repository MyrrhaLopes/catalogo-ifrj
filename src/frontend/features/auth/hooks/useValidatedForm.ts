import { useState, type ChangeEvent, type FormEvent } from "react";
import { hasFieldErrors, type FieldErrors, type FormValues } from "../auth.validation";

type Options = {
  /** Chamado a cada alteração de campo (ex: limpar o erro do servidor). */
  onChange?: () => void;
};

/**
 * Estado de formulário com validação no cliente. Erros de um campo só aparecem
 * depois que ele perde o foco ou após a primeira tentativa de envio.
 */
export function useValidatedForm<F extends string>(
  initialValues: FormValues<F>,
  validate: (values: FormValues<F>) => FieldErrors<F>,
  options: Options = {},
) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<Partial<Record<F, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const allErrors = validate(values);
  const errors: FieldErrors<F> = {};
  for (const field of Object.keys(allErrors) as F[]) {
    if (submitted || touched[field]) errors[field] = allErrors[field];
  }

  function fieldProps(field: F) {
    return {
      name: field,
      value: values[field],
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setValues((prev) => ({ ...prev, [field]: value }));
        options.onChange?.();
      },
      onBlur: () => setTouched((prev) => ({ ...prev, [field]: true })),
    };
  }

  function handleSubmit(onValid: (values: FormValues<F>) => void) {
    return (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitted(true);
      if (hasFieldErrors(allErrors)) return;
      onValid(values);
    };
  }

  return { values, errors, submitted, touched, fieldProps, handleSubmit };
}
