declare module "@/components/LiveTextCMS/useLiveText.js" {
  export function useLiveText(): {
t: (key: string, params?: Record<string, unknown>) => string;
  };
}
