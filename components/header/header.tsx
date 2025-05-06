import Link from "next/link";
import Image from "next/image";
import { UserNav } from "./user-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-md border-b border-headingText/10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="Chipz Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-bold text-headingText text-xl hidden sm:inline-block">Chipz</span>
          </Link>
        </div>
        <UserNav />
      </div>
    </header>
  );
} 