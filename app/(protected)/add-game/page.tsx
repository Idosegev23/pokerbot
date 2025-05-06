import { getRecentGameTypes } from "@/lib/data/game-service";
import { pokerVariants, tournamentTypes, bountyTypes } from "@/lib/data/poker-types";
import ClientPage from "./client-page";

export default async function AddGamePage() {
  // קבלת סוגי המשחקים האחרונים של המשתמש בצד השרת
  const recentGameTypes = await getRecentGameTypes();

  return (
    <ClientPage
      recentGameTypes={recentGameTypes}
      pokerVariants={pokerVariants}
      tournamentTypes={tournamentTypes}
      bountyTypes={bountyTypes}
    />
  );
}