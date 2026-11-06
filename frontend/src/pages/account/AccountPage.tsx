import { useQueryClient } from "@/hooks/use-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MapPin, Pencil, Star, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  createAddress,
  deleteAddress,
  setDefaultAddress,
  updateAddress,
  updateProfile,
} from "@/services/account.service";
import { useAddresses, useProfile } from "@/hooks/useAccount";
import { AddressForm } from "@/components/shop/AddressForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export function Account() {
  const { user } = useAuth();
  const uid = user!.id;
  const qc = useQueryClient();
  const { data: profile, isLoading } = useProfile(uid);
  const { data: addresses = [] } = useAddresses(uid);
  const [p, setP] = useState({ first_name: "", last_name: "", phone: "", instagram: "" });
  const [editing, setEditing] = useState<string | "new" | null>(null);

  useEffect(() => {
    if (profile)
      setP({
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
        phone: profile.phone ?? "",
        instagram: profile.instagram ?? "",
      });
  }, [profile]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (p.phone && !/^[6-9]\d{9}$/.test(p.phone.trim()))
      return toast.error("Enter a valid 10-digit mobile number");
    const clean = Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v.trim().slice(0, 60)]));
    const { error } = await updateProfile(uid, clean as Parameters<typeof updateProfile>[1]);
    if (error) return toast.error("Couldn't save your details");
    toast.success("Details saved");
    qc.invalidateQueries({ queryKey: ["profile", uid] });
  }

  const refresh = () => qc.invalidateQueries({ queryKey: ["addresses", uid] });

  async function makeDefault(id: string) {
    const { error } = await setDefaultAddress(id);
    if (error) return void toast.error("Couldn't update the default address");
    refresh();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-5xl">My Account</h1>
      <section className="mt-8 rounded-2xl border bg-card/60 p-6">
        <h2 className="text-2xl">Personal details</h2>
        {isLoading ? (
          <Skeleton className="mt-4 h-40 bg-muted" />
        ) : (
          <form onSubmit={saveProfile} className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pf">First name</Label>
              <Input
                id="pf"
                value={p.first_name}
                onChange={(e) => setP({ ...p, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pl">Last name</Label>
              <Input
                id="pl"
                value={p.last_name}
                onChange={(e) => setP({ ...p, last_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pe">Email</Label>
              <Input id="pe" value={profile?.email ?? user?.email ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pp">Mobile number</Label>
              <Input
                id="pp"
                inputMode="numeric"
                value={p.phone}
                onChange={(e) => setP({ ...p, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="pi">Instagram ID (optional)</Label>
              <Input
                id="pi"
                placeholder="@yourhandle"
                value={p.instagram}
                onChange={(e) => setP({ ...p, instagram: e.target.value })}
              />
            </div>
            <div>
              <Button>Save details</Button>
            </div>
          </form>
        )}
      </section>

      <section className="mt-8 rounded-2xl border bg-card/60 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Saved addresses</h2>
          {editing !== "new" && (
            <Button size="sm" variant="outline" onClick={() => setEditing("new")}>
              Add address
            </Button>
          )}
        </div>
        <div className="mt-5 space-y-4">
          {addresses.length === 0 && editing !== "new" && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> No saved addresses yet.
            </p>
          )}
          {addresses.map((a) =>
            editing === a.id ? (
              <div key={a.id} className="rounded-xl border p-4">
                <AddressForm
                  initial={{ ...a, landmark: a.landmark ?? "" }}
                  onCancel={() => setEditing(null)}
                  onSubmit={async (v) => {
                    const { error } = await updateAddress(a.id, v);
                    if (error) return void toast.error("Couldn't update the address");
                    setEditing(null);
                    refresh();
                  }}
                />
              </div>
            ) : (
              <div
                key={a.id}
                className="flex items-start justify-between gap-4 rounded-xl border p-4 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {a.full_name} · {a.phone}{" "}
                    {a.is_default && (
                      <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                        Default
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {a.line1}
                    {a.landmark ? `, near ${a.landmark}` : ""}, {a.city}, {a.state} – {a.pincode}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {!a.is_default && (
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Make default"
                      onClick={() => makeDefault(a.id)}
                    >
                      <Star />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Edit address"
                    onClick={() => setEditing(a.id)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Delete address"
                    onClick={async () => {
                      await deleteAddress(a.id);
                      refresh();
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ),
          )}
          {editing === "new" && (
            <div className="rounded-xl border p-4">
              <AddressForm
                onCancel={() => setEditing(null)}
                onSubmit={async (v) => {
                  const { error } = await createAddress({
                    ...v,
                    user_id: uid,
                    is_default: addresses.length === 0,
                  });
                  if (error) return void toast.error("Couldn't save the address");
                  setEditing(null);
                  refresh();
                }}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
