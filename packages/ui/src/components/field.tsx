import { cloneElement, createContext, isValidElement, useContext, useId } from "react";
import { cn } from "../cn";

type FieldProps = {
  label: React.ReactNode;
  /** Field error from Zod or the API (Problem Details `errors[]`). */
  error?: string;
  hint?: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  className?: string;
  /** A single form control; Field wires id, aria-invalid and aria-describedby into it. */
  children: React.ReactElement<Record<string, unknown>>;
};

type FieldControlProps = { id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string; "aria-required"?: boolean };
const FieldContext = createContext<FieldControlProps & { labelId?: string }>({});

/** Id of the enclosing Field's label, for controls a <label for> can't name (radio groups). */
export function useFieldLabelId(): string | undefined {
  return useContext(FieldContext).labelId;
}

/**
 * Accessible wiring for custom controls rendered inside <Controller> (Select, ChoiceCards, DatePicker…), which
 * Field can't reach with cloneElement. Explicit props win over the context.
 */
export function useFieldControl<T extends FieldControlProps>(props: T): T {
  const ctx = useContext(FieldContext);
  return {
    ...props,
    id: props.id ?? ctx.id,
    "aria-invalid": props["aria-invalid"] ?? ctx["aria-invalid"],
    "aria-describedby": props["aria-describedby"] ?? ctx["aria-describedby"],
    "aria-required": props["aria-required"] ?? ctx["aria-required"],
  };
}

/** Label + control + hint/error, with accessible wiring. */
export function Field({ label, error, hint, required, optional, className, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: (children.props.id as string | undefined) ?? id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        "aria-required": required || undefined,
      })
    : children;
  const controlId = (isValidElement(children) && (children.props.id as string | undefined)) || id;
  const wiring = { labelId: `${id}-label`, id: controlId, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy, "aria-required": required || undefined };
  return (
    <FieldContext.Provider value={wiring}>
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label id={`${id}-label`} htmlFor={controlId} className="text-[12.5px] font-medium text-ink-2">
        {label}
        {required && (
          <span className="text-critical" aria-hidden>
            {" "}
            *
          </span>
        )}
        {optional && <span className="font-normal text-ink-4"> (optional)</span>}
      </label>
      {control}
      {hint && !error && (
        <p id={hintId} className="text-[12.5px] text-ink-3">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-[12.5px] text-critical">
          {error}
        </p>
      )}
    </div>
    </FieldContext.Provider>
  );
}

/** Group of fields under a small heading, used to split long forms into sections. */
export function FieldGroup({ title, description, children, className }: { title?: string; description?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <fieldset className={cn("flex min-w-0 flex-col gap-4", className)}>
      {title && (
        <legend className="mb-1">
          <span className="text-[13.5px] font-medium text-ink">{title}</span>
          {description && <span className="mt-0.5 block text-[12.5px] text-ink-3">{description}</span>}
        </legend>
      )}
      {children}
    </fieldset>
  );
}
