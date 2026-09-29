import { ToastProvider } from "@/components/pk/Toast";

/** The phone screen: full height on mobile, a centred 480px column on desktop. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="app-shell">
      <ToastProvider>{children}</ToastProvider>
    </div>
  );
}
