export type PermissionKey = string;

export interface UserPermissions {
  id?: number;
  priorityPermissions?: PermissionKey[];
  permissions?: PermissionKey[];
}
