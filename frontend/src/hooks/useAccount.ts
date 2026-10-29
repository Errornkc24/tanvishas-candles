import { useQuery } from "@/hooks/use-query";
import { addressesQuery, profileQuery } from "@/services/account.service";

export function useProfile(userId: string) {
  return useQuery(profileQuery(userId));
}
export function useAddresses(userId: string) {
  return useQuery(addressesQuery(userId));
}
