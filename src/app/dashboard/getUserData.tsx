import { getServerUserData } from "../../../supabase/server-actions";
import { redirect } from "next/navigation";

// This is a server function that should only be called from server components
export async function getUserData() {
  const user = await getServerUserData();

  if (!user) {
    return redirect("/sign-in");
  }

  return user;
}
