import * as React from "react";

export type ToastVariant = "info" | "success" | "warning" | "error";

export type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastInput = Omit<Toast, "id">;

const listeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

function dispatch(next: Toast[]) {
  toasts = next;
  listeners.forEach((l) => l(toasts));
}

function toast(input: ToastInput) {
  const id = Math.random().toString(36).slice(2);
  const duration = input.duration ?? 4000;
  const item: Toast = { ...input, id };

  dispatch([...toasts, item]);

  setTimeout(() => {
    dispatch(toasts.filter((t) => t.id !== id));
  }, duration);

  return id;
}

toast.success = (title: string, rest?: Omit<ToastInput, "title" | "variant">) =>
  toast({ title, variant: "success", ...rest });
toast.error = (title: string, rest?: Omit<ToastInput, "title" | "variant">) =>
  toast({ title, variant: "error", ...rest });
toast.warning = (title: string, rest?: Omit<ToastInput, "title" | "variant">) =>
  toast({ title, variant: "warning", ...rest });
toast.info = (title: string, rest?: Omit<ToastInput, "title" | "variant">) =>
  toast({ title, variant: "info", ...rest });

function useToast() {
  const [state, setState] = React.useState<Toast[]>(toasts);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const i = listeners.indexOf(setState);
      if (i > -1) listeners.splice(i, 1);
    };
  }, []);

  return { toasts: state, toast };
}

export { useToast, toast };
