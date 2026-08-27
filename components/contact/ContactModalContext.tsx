"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type OpenContactOptions = {
  /** Prefills the message textarea (e.g. the hero CTA label). */
  message?: string;
};

type ContactModalContextValue = {
  isOpen: boolean;
  formKey: number;
  initialFormValues: Record<string, string> | null;
  openContact: (options?: OpenContactOptions) => void;
  closeContact: () => void;
};

const ContactModalContext = createContext<ContactModalContextValue | null>(null);

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [initialFormValues, setInitialFormValues] = useState<Record<string, string> | null>(null);

  const openContact = useCallback((options?: OpenContactOptions) => {
    const message = options?.message?.trim();
    setInitialFormValues(message ? { message } : null);
    setFormKey((current) => current + 1);
    setIsOpen(true);
  }, []);

  const closeContact = useCallback(() => {
    setIsOpen(false);
    setInitialFormValues(null);
  }, []);

  const value = useMemo(
    () => ({ isOpen, formKey, initialFormValues, openContact, closeContact }),
    [isOpen, formKey, initialFormValues, openContact, closeContact],
  );

  return (
    <ContactModalContext.Provider value={value}>{children}</ContactModalContext.Provider>
  );
}

export function useContactModal() {
  return useContext(ContactModalContext);
}
