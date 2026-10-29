import { supabase } from "@/lib/supabase";
import { queryOptions } from "@/hooks/use-query";
import type { Database } from "@/types/database.types";

type AdminRole = Database["public"]["Enums"]["app_role"];

export const teamQuery = queryOptions({
  queryKey: ["admin", "team"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("admin_team");
    if (error) throw error;
    return data ?? [];
  },
});

export async function setTeamRole(email: string, role: AdminRole, grant: boolean) {
  return supabase.rpc("admin_set_role", { _email: email, _role: role, _grant: grant });
}
