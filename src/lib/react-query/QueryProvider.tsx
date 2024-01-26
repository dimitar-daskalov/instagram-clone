import { ICommonHOCType } from "@/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const QueryProvider = ({ children }: ICommonHOCType) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
