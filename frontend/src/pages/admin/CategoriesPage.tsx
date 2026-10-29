import { useQuery, useQueryClient } from "@/hooks/use-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  createCategory,
  deleteCategory,
  renameCategory,
  categoriesQuery,
} from "@/services/categories.service";
import { slugify } from "@/services/admin.service";
import { useRoles } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Categories() {
  const qc = useQueryClient();
  const { data: roles } = useRoles();
  const isOwner = !!roles?.includes("owner");
  const { data: cats = [] } = useQuery(categoriesQuery);
  const [name, setName] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: ["categories"] });

  async function add() {
    if (!name.trim()) return;
    const { error } = await createCategory(name, slugify(name), cats.length);
    if (error)
      return toast.error(
        error.message.includes("slug") ? "That category already exists" : error.message,
      );
    setName("");
    refresh();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl">Categories</h2>
      {!isOwner && (
        <p className="text-sm text-muted-foreground">Only the owner can change categories.</p>
      )}
      {isOwner && (
        <div className="flex gap-2">
          <Input
            placeholder="New category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={add}>Add</Button>
        </div>
      )}
      <ul className="divide-y divide-border rounded-2xl border bg-card/60">
        {cats.map((c) => (
          <Row key={c.id} id={c.id} name={c.name} editable={isOwner} onChange={refresh} />
        ))}
      </ul>
    </div>
  );
}

function Row({
  id,
  name,
  editable,
  onChange,
}: {
  id: string;
  name: string;
  editable: boolean;
  onChange: () => void;
}) {
  const [v, setV] = useState(name);
  return (
    <li className="flex items-center gap-2 p-3">
      {editable ? (
        <Input value={v} onChange={(e) => setV(e.target.value)} className="max-w-xs" />
      ) : (
        <span>{name}</span>
      )}
      {editable && (
        <>
          <Button
            size="sm"
            variant="outline"
            disabled={v === name || !v.trim()}
            onClick={async () => {
              const { error } = await renameCategory(id, v);
              if (error) toast.error(error.message);
              else {
                toast.success("Renamed");
                onChange();
              }
            }}
          >
            Save
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive"
            onClick={async () => {
              if (!confirm(`Delete "${name}"? Candles in it will become uncategorised.`)) return;
              const { error } = await deleteCategory(id);
              if (error) toast.error(error.message);
              else onChange();
            }}
          >
            Delete
          </Button>
        </>
      )}
    </li>
  );
}
