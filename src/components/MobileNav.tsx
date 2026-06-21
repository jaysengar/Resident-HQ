import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Users, QrCode, Bell, PlusCircle, AlertCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: any;
  href: string;
};

export function MobileNav({ role }: { role: "resident" | "guard" }) {
  const router = useRouterState();
  const pathname = router.location.pathname;

  const residentItems: NavItem[] = [
    { label: "Home", icon: Home, href: "/m/resident/dashboard" },
    { label: "Approvals", icon: Users, href: "/m/resident/approvals" },
    { label: "Invite", icon: QrCode, href: "/m/resident/pre-approve" },
    { label: "SOS", icon: AlertCircle, href: "/m/resident/sos" },
  ];

  const guardItems: NavItem[] = [
    { label: "Dashboard", icon: Home, href: "/m/guard/dashboard" },
    { label: "Add Visitor", icon: PlusCircle, href: "/m/guard/add-visitor" },
    { label: "Expected", icon: Calendar, href: "/m/guard/expected" },
  ];

  const items = role === "resident" ? residentItems : guardItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-white/60 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] z-50 pb-safe">
      <div className="flex items-center justify-around px-2 py-3">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const isSos = item.label === "SOS";

          return (
            <Link
              key={item.label}
              to={item.href}
              className="relative flex flex-col items-center justify-center w-full group"
            >
              <div
                className={cn(
                  "p-2 rounded-2xl transition-all duration-300",
                  isActive && !isSos ? "bg-brand/10" : "",
                  isSos ? "bg-red-500 shadow-lg" : "",
                  isActive && isSos ? "scale-110" : ""
                )}
              >
                <item.icon
                  size={24}
                  className={cn(
                    "transition-colors duration-300",
                    isActive && !isSos ? "text-brand" : "text-gray-400",
                    isSos ? "text-white" : ""
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold mt-1 transition-colors duration-300",
                  isActive && !isSos ? "text-brand" : "text-gray-500",
                  isSos && isActive ? "text-red-500" : ""
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
