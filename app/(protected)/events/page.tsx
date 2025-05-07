import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import EventsPage from "./events-page";
import { getUserEvents } from "@/lib/data/game-service";

export const metadata = {
  title: "אירועים - ניהול משחקי פוקר",
  description: "ניהול אירועים מיוחדים - טיולי פוקר, סדרות טורנירים ואירועים נוספים",
};

export default async function EventsPageServerWrapper() {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // קבלת האירועים של המשתמש
  const events = await getUserEvents();

  return <EventsPage events={events} />;
} 