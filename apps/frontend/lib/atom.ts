import { atom } from "jotai";
import { User } from "../types/api";

export type ModalStateType = {
  id: string;
  data?: unknown;
  callBack?: (data?: unknown) => void;
} | null;

export const modalAtom = atom<ModalStateType>(null);
export const loadingState = atom<number>(0);
export const accessTokenAtom = atom<string | null>(null);
export const userAtom = atom<User | null>(null);
export const errorAtom = atom<string | null>(null);
export const alertAtom = atom<string | null>(null);
export const confirmAtom = atom<{
  title?: string;
  message: string;
  confirmEvent: () => void;
} | null>(null);
