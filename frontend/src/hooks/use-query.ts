import { useCallback, useMemo } from "react";
import useSWR, { mutate as globalMutate } from "swr";

type QueryOptions<T> = {
  queryKey: readonly unknown[];
  queryFn: () => Promise<T>;
  staleTime?: number;
  enabled?: boolean;
};
export function queryOptions<T>(options: QueryOptions<T>) {
  return options;
}
const keyOf = (key: readonly unknown[]) => JSON.stringify(key);

export function useQuery<T>(options: QueryOptions<T>) {
  const key = options.enabled === false ? null : keyOf(options.queryKey);
  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(key, options.queryFn, {
    revalidateOnFocus: false,
    dedupingInterval: options.staleTime ?? 0,
  });
  const dataUpdatedAt = useMemo(() => (data === undefined ? 0 : Date.now()), [data]);
  return {
    data,
    error,
    isLoading,
    isPending: isLoading,
    isError: !!error,
    isFetching: isValidating,
    dataUpdatedAt,
    refetch: mutate,
  };
}

export function useQueryClient() {
  const invalidateQueries = useCallback(
    async ({ queryKey }: { queryKey?: readonly unknown[] } = {}) => {
      const prefix = queryKey ? keyOf(queryKey).slice(0, -1) : undefined;
      await globalMutate((key) => typeof key === "string" && (!prefix || key.startsWith(prefix)));
    },
    [],
  );
  const removeQueries = useCallback(
    async ({
      predicate,
    }: { predicate?: (query: { queryKey: readonly unknown[] }) => boolean } = {}) => {
      await globalMutate(
        (key) => {
          if (typeof key !== "string") return false;
          try {
            return predicate ? predicate({ queryKey: JSON.parse(key) }) : true;
          } catch {
            return false;
          }
        },
        undefined,
        { revalidate: false },
      );
    },
    [],
  );
  return { invalidateQueries, removeQueries, cancelQueries: async () => undefined };
}
