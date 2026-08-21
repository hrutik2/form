export type ToastKind = "success" | "error";

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  title: string;
  detail?: string;
}

type Listener = (messages: ToastMessage[]) => void;

let messages: ToastMessage[] = [];
const listeners = new Set<Listener>();

const emit = () => {
  listeners.forEach((listener) => listener(messages));
};

export const subscribeToToasts = (listener: Listener) => {
  listeners.add(listener);
  listener(messages);
  return () => {
    listeners.delete(listener);
  };
};

export const dismissToast = (id: number) => {
  messages = messages.filter((message) => message.id !== id);
  emit();
};

export const showToast = (message: Omit<ToastMessage, "id">) => {
  const id = Date.now() + Math.floor(Math.random() * 1000);
  messages = [{ id, ...message }, ...messages].slice(0, 5);
  emit();
  window.setTimeout(() => dismissToast(id), 5000);
};
