// Temporary type shims for environments where node_modules type files are incomplete.
// This unblocks TypeScript/JSX diagnostics in the editor.

declare module "react/jsx-runtime" {
  export const Fragment: any;
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
}

declare module "next/link" {
  import * as React from "react";
  const Link: React.ComponentType<any>;
  export default Link;
}

declare module "next/navigation" {
  export const useRouter: any;
  export const useSearchParams: any;
  export const usePathname: any;
}

declare global {
  // Ensures JSX intrinsic elements exist even if React types are unavailable.
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};
