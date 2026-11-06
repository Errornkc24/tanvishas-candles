import { Outlet } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@/hooks/use-query";
import { isAdminRole } from "@/services/admin.service";
import { useRoles } from "@/hooks/useAdmin";
import { claimStoreOwnership, storeHasOwnerQuery } from "@/services/admin.service";
import { Button } from "@/components/ui/button";

export function AdminRoute() {
  const { data: roles, isLoading, isError: rolesError } = useRoles();
  const allowed = isAdminRole(roles);
  const {
    data: hasOwner,
    error: ownerError,
  } = useQuery({ ...storeHasOwnerQuery, enabled: !isLoading && !allowed && !rolesError });

  if (isLoading) return <div className="py-32 text-center text-muted-foreground">Loading…</div>;
  if (allowed) return <Outlet />;
  if (rolesError || ownerError) {
    return (
      <div className="mx-auto max-w-md py-32 text-center">
        <h1 className="text-4xl">Admin setup incomplete</h1>
        <p className="mt-3 text-muted-foreground">
          Store permissions could not be loaded. Apply the Supabase migrations, then try again.
        </p>
      </div>
    );
  }
  return <NoAccess hasOwner={hasOwner} />;
}

function NoAccess({ hasOwner }: { hasOwner: boolean | undefined }) {
  const queryClient = useQueryClient();
  return (
    <div className="mx-auto max-w-md py-32 text-center">
      <h1 className="text-4xl">Store admin</h1>
      {hasOwner === false ? (
        <>
          <p className="mt-3 text-muted-foreground">
            No owner has been set up yet. Claim this store to become its owner.
          </p>
          <Button
            className="mt-6"
            onClick={async () => {
              const { data, error } = await claimStoreOwnership();
              if (error) return void toast.error(error.message);
              if (!data) {
                toast.error("Store ownership has already been claimed. Ask an owner to add you.");
                await queryClient.invalidateQueries();
                return;
              }
              toast.success("You're now the store owner");
              await queryClient.invalidateQueries();
            }}
          >
            Claim ownership
          </Button>
        </>
      ) : (
        <p className="mt-3 text-muted-foreground">This area is for the store team only.</p>
      )}
    </div>
  );
}
