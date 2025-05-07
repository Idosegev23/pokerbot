import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import InvestorsPage from "./investors-page";
import { getUserInvestors } from "@/lib/data/game-service";

export const metadata = {
  title: "משקיעים - ניהול משחקי פוקר",
  description: "ניהול משקיעים ושותפים לסטייקינג",
};

export default async function InvestorsPageServerWrapper() {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // קבלת המשקיעים של המשתמש
  const investors = await getUserInvestors();

  return <InvestorsPage investors={investors} />;
} 