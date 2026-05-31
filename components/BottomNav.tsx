import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, CalendarDays, Folder, User } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/home", icon: Home },
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "Sessions", href: "/sessions", icon: CalendarDays },
    { name: "Projects", href: "/projects", icon: Folder },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 pb-8 z-50 rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.04)] md:hidden">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center gap-1 group"
            >
              <Icon 
                className={`w-6 h-6 transition-colors ${
                  isActive 
                    ? "text-[#0ea5e9] stroke-[2.5]" 
                    : "text-slate-400 stroke-2 group-hover:text-slate-600"
                }`} 
              />
              <span 
                className={`text-[10px] font-medium transition-colors ${
                  isActive 
                    ? "text-[#0ea5e9]" 
                    : "text-slate-400 group-hover:text-slate-600"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
