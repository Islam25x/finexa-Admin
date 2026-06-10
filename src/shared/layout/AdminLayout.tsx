import { Bot, ChevronDown, LayoutDashboard, LogOut, Menu, Users, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import logoSrc from "../../assets/logo.png";
import { useLogout } from "../../features/auth/hooks/useLogout";
import { useAuth } from "../auth/AuthContext";
import { Button, cn } from "../ui";

type AdminLayoutProps = {
  children: ReactNode;
};

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Users", to: "/users", icon: Users },
  { label: "AI Monitoring", to: "/ai-monitoring", icon: Bot },
];

function readJwtPayload(token?: string): Record<string, unknown> | null {
  if (!token) return null;
  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readClaim(payload: Record<string, unknown> | null, keys: string[]): string | null {
  if (!payload) return null;

  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { session } = useAuth();
  const logoutMutation = useLogout();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const admin = useMemo(() => {
    const payload = readJwtPayload(session?.token);
    const email = readClaim(payload, [
      "email",
      "Email",
      "sub",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
    ]);
    const name = readClaim(payload, [
      "name",
      "unique_name",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
    ]);

    return {
      name: name ?? "Admin",
      email: email ?? "admin@finexa.com",
      initial: (name ?? email ?? "A").trim().charAt(0).toUpperCase(),
    };
  }, [session?.token]);

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-[250px] -translate-x-full flex-col border-r border-border bg-surface/95 shadow-md transition-transform duration-150 lg:translate-x-0",
          sidebarOpen && "translate-x-0",
        )}
      >
        <div className="flex items-center gap-3.5 px-7 pb-9 pt-8">
          <img src={logoSrc} alt="" className="h-[54px] w-[54px] object-contain" />
          <div>
            <p className="m-0 text-[28px] font-extrabold leading-none text-text-primary">Finexa</p>
            <p className="mt-1.5 text-sm text-text-secondary">Admin Panel</p>
          </div>
        </div>

        <nav className="grid gap-4 px-[18px]" aria-label="Admin navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-14 items-center gap-5 rounded-lg px-[18px] text-text-secondary no-underline transition hover:bg-primary/10 hover:text-primary",
                    isActive && "bg-primary/10 font-bold text-primary",
                  )
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={21} strokeWidth={2} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          className="mt-auto flex min-h-[72px] w-full items-center gap-5 border-0 border-t border-border bg-transparent px-[18px] text-base text-text-secondary transition hover:bg-primary/10 hover:text-primary disabled:opacity-60"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut size={22} strokeWidth={1.9} />
          <span>Logout</span>
        </button>
      </aside>

      <div className="min-h-screen lg:pl-[250px]">
        <header className="sticky top-0 z-20 flex h-[84px] items-center justify-between border-b border-border bg-surface/85 px-5 backdrop-blur lg:h-[86px] lg:px-[34px]">
          <Button
            type="button"
            variant="ghost"
            className="lg:hidden"
            aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setSidebarOpen((current) => !current)}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </Button>
          <div className="ml-auto flex items-center gap-3.5 text-text-primary">
            <div className="hidden text-left sm:block">
              <strong className="block font-bold">{admin.name}</strong>
              <span className="mt-1 block text-[13px] text-text-secondary">{admin.email}</span>
            </div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-text-primary">
              {admin.initial}
            </span>
          </div>
        </header>

        <main className="px-[18px] py-8 sm:px-7 lg:px-[22px] lg:pb-7 lg:pt-9">{children}</main>
      </div>
    </div>
  );
}
