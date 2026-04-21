/// <reference types="astro/client" />

import type { AuthUser } from './lib/rbac';

declare global {
  namespace App {
    interface Locals {
      user: AuthUser | null;
    }
  }
}

export {};
