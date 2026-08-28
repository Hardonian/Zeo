/**
 * Reality Mode - Access Control List (ACL)
 *
 * Minimal ACL implementation with owner/editor/viewer roles.
 * Local-only default with optional multi-user support.
 * Never breaks tenant isolation.
 */

import type {
  AccessControlList,
  AccessControlEntry,
  AccessRole,
  RolePermissions,
  SecurityContext,
  TenantContext
} from "./types.js";
import { DEFAULT_ROLE_PERMISSIONS } from "./types.js";

/**
 * Create a new ACL for a resource
 */
export function createACL(
  resourceId: string,
  resourceType: "packet" | "dataset" | "decision",
  ownerId: string,
  tenantId: string
): AccessControlList {
  const now = new Date().toISOString();

  return {
    resourceId,
    resourceType,
    ownerId,
    entries: [],
    tenantId,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Add an entry to an ACL
 */
export function addACLEntry(
  acl: AccessControlList,
  entry: Omit<AccessControlEntry, "grantedAt">
): AccessControlList {
  const newEntry: AccessControlEntry = {
    ...entry,
    grantedAt: new Date().toISOString(),
  };

  // Check for existing entry and update if found
  const existingIndex = acl.entries.findIndex((e) => e.userId === entry.userId);
  let entries: AccessControlEntry[];

  if (existingIndex >= 0) {
    entries = [...acl.entries];
    entries[existingIndex] = newEntry;
  } else {
    entries = [...acl.entries, newEntry];
  }

  return {
    ...acl,
    entries,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Remove an entry from an ACL
 */
export function removeACLEntry(
  acl: AccessControlList,
  userId: string,
  removedBy: string
): AccessControlList {
  // Cannot remove owner
  if (userId === acl.ownerId) {
    throw new Error("Cannot remove owner from ACL");
  }

  const entries = acl.entries.filter((e) => e.userId !== userId);

  return {
    ...acl,
    entries,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get permissions for a user on a resource
 */
export function getPermissions(
  acl: AccessControlList,
  userId: string
): RolePermissions {
  // Owner has full permissions
  if (userId === acl.ownerId) {
    return DEFAULT_ROLE_PERMISSIONS.owner;
  }

  // Find user's entry
  const entry = acl.entries.find((e) => e.userId === userId);

  if (!entry) {
    // No entry = no permissions
    return {
      canRead: false,
      canWrite: false,
      canDelete: false,
      canShare: false,
      canExport: false,
      canRedact: false,
    };
  }

  // Check if entry has expired
  if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
    return {
      canRead: false,
      canWrite: false,
      canDelete: false,
      canShare: false,
      canExport: false,
      canRedact: false,
    };
  }

  return DEFAULT_ROLE_PERMISSIONS[entry.role];
}

/**
 * Get role for a user on a resource
 */
export function getRole(acl: AccessControlList, userId: string): AccessRole | null {
  if (userId === acl.ownerId) {
    return "owner";
  }

  const entry = acl.entries.find((e) => e.userId === userId);

  if (!entry) {
    return null;
  }

  // Check if expired
  if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
    return null;
  }

  return entry.role;
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  acl: AccessControlList,
  userId: string,
  permission: keyof RolePermissions
): boolean {
  const permissions = getPermissions(acl, userId);
  return permissions[permission];
}

/**
 * Check if user can read resource
 */
export function canRead(acl: AccessControlList, userId: string): boolean {
  return hasPermission(acl, userId, "canRead");
}

/**
 * Check if user can write resource
 */
export function canWrite(acl: AccessControlList, userId: string): boolean {
  return hasPermission(acl, userId, "canWrite");
}

/**
 * Check if user can delete resource
 */
export function canDelete(acl: AccessControlList, userId: string): boolean {
  return hasPermission(acl, userId, "canDelete");
}

/**
 * Check if user can share resource
 */
export function canShare(acl: AccessControlList, userId: string): boolean {
  return hasPermission(acl, userId, "canShare");
}

/**
 * Transfer ownership of a resource
 */
export function transferOwnership(
  acl: AccessControlList,
  newOwnerId: string,
  oldOwnerId: string
): AccessControlList {
  // Verify old owner
  if (oldOwnerId !== acl.ownerId) {
    throw new Error("Only owner can transfer ownership");
  }

  // Add old owner as editor
  const withOldOwner = addACLEntry(acl, {
    userId: oldOwnerId,
    role: "editor",
    grantedBy: oldOwnerId,
  });

  // Update owner
  return {
    ...withOldOwner,
    ownerId: newOwnerId,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Create security context for a user
 */
export function createSecurityContext(
  acl: AccessControlList,
  userId: string,
  sessionId: string
): SecurityContext {
  const role = getRole(acl, userId);

  if (!role) {
    throw new Error(`User ${userId} has no access to resource ${acl.resourceId}`);
  }

  return {
    userId,
    tenantId: acl.tenantId,
    role,
    permissions: getPermissions(acl, userId),
    sessionId,
  };
}

/**
 * Validate tenant isolation
 * Throws if tenant boundary violated
 */
export function validateTenantIsolation(
  acl: AccessControlList,
  userTenantId: string
): void {
  if (acl.tenantId !== userTenantId) {
    throw new Error(
      `Tenant isolation violation: resource tenant ${acl.tenantId} != user tenant ${userTenantId}`
    );
  }
}

/**
 * Check if multi-user mode is enabled
 */
export function isMultiUserMode(tenantContext: TenantContext): boolean {
  return tenantContext.isMultiUser;
}

/**
 * Get all users with access to a resource
 */
export function getAuthorizedUsers(acl: AccessControlList): string[] {
  const users = [acl.ownerId];

  for (const entry of acl.entries) {
    // Skip expired entries
    if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
      continue;
    }
    users.push(entry.userId);
  }

  return [...new Set(users)];
}

/**
 * List ACL entries with current status
 */
export function listACLEntries(
  acl: AccessControlList
): Array<AccessControlEntry & { isExpired: boolean }> {
  const now = new Date();

  return acl.entries.map((entry) => ({
    ...entry,
    isExpired: entry.expiresAt ? new Date(entry.expiresAt) < now : false,
  }));
}

/**
 * Clean expired entries from ACL
 */
export function cleanExpiredEntries(acl: AccessControlList): AccessControlList {
  const now = new Date();
  const entries = acl.entries.filter(
    (e) => !e.expiresAt || new Date(e.expiresAt) >= now
  );

  if (entries.length === acl.entries.length) {
    return acl;
  }

  return {
    ...acl,
    entries,
    updatedAt: now.toISOString(),
  };
}

/**
 * Validate ACL integrity
 */
export function validateACL(acl: AccessControlList): string[] {
  const errors: string[] = [];

  if (!acl.resourceId) {
    errors.push("ACL missing resourceId");
  }

  if (!acl.ownerId) {
    errors.push("ACL missing ownerId");
  }

  if (!acl.tenantId) {
    errors.push("ACL missing tenantId");
  }

  // Check for duplicate user entries
  const userIds = acl.entries.map((e) => e.userId);
  const duplicates = userIds.filter((id, index) => userIds.indexOf(id) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate entries for users: ${[...new Set(duplicates)].join(", ")}`);
  }

  // Check owner is not also in entries
  if (acl.entries.some((e) => e.userId === acl.ownerId)) {
    errors.push("Owner should not have a separate ACL entry");
  }

  return errors;
}

