import { useQuery, useQueryClient } from "@/hooks/use-query";
import { useState } from "react";
import { toast } from "sonner";
import { setTeamRole, teamQuery } from "@/services/team.service";
import { useAuth } from "@/context/AuthContext";
import type { AdminRole } from "@/services/admin.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Team() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: team = [], error } = useQuery(teamQuery);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"staff" | "owner">("staff");

  async function setR(e: string, r: AdminRole, grant: boolean) {
    const { error } = await setTeamRole(e, r, grant);
    if (error) return toast.error(error.message);
    toast.success(grant ? "Access given" : "Access removed");
    setEmail("");
    qc.invalidateQueries({ queryKey: ["admin", "team"] });
  }

  if (error) return <p className="text-muted-foreground">Only the owner can manage the team.</p>;
  return (
    <div className="space-y-4">
      <h2 className="text-3xl">Team</h2>
      <p className="text-sm text-muted-foreground">
        Staff can manage orders, products and stock. Owners can also manage categories and the team.
        The person must sign up on the store first.
      </p>
      <div className="flex flex-wrap gap-2">
        <Input
          type="email"
          placeholder="Their email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-64"
        />
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value as "staff" | "owner")}
        >
          <option value="staff">Staff</option>
          <option value="owner">Owner</option>
        </select>
        <Button disabled={!email.trim()} onClick={() => setR(email, role, true)}>
          Add
        </Button>
      </div>
      <ul className="divide-y divide-border rounded-2xl border bg-card/60">
        {team.map((m) => (
          <li
            key={m.user_id + m.role}
            className="flex items-center justify-between gap-3 p-3 text-sm"
          >
            <span>
              {m.name || m.email}
              <span className="block text-xs text-muted-foreground">{m.email}</span>
            </span>
            <span className="flex items-center gap-3">
              <span className="capitalize text-primary">{m.role}</span>
              {m.user_id !== user?.id && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() =>
                    m.email &&
                    confirm(`Remove ${m.role} access for ${m.email}?`) &&
                    setR(m.email, m.role as AdminRole, false)
                  }
                >
                  Remove
                </Button>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
