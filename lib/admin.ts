/** The only profile role that may access or change administration data. */
export const SUPA_ADMIN_ROLE = "super_admin";

export function isSupaAdmin(role: string | null | undefined) {
  return role === SUPA_ADMIN_ROLE;
}
