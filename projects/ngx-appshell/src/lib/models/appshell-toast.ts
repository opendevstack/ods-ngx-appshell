import { AppShellNotification } from "./appshell-notification";

export interface AppShellToast {
  id: number;
  notification: AppShellNotification;
  closeFn: () => void;
}