/**
 * Organization state management — Zustand store for org/project context.
 */

import type { Organization, Project, OrgRole } from '@/lib/platform/types';

interface OrgState {
  organizations: Array<Organization & { role: OrgRole }>;
  currentOrgId: string | null;
  projects: Project[];
  currentProjectId: string | null;
  loading: boolean;
  setOrganizations: (orgs: Array<Organization & { role: OrgRole }>) => void;
  setCurrentOrg: (orgId: string | null) => void;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (projectId: string | null) => void;
  setLoading: (loading: boolean) => void;
  currentOrg: () => (Organization & { role: OrgRole }) | null;
}

let state: OrgState;

function createStore(): OrgState {
  let organizations: Array<Organization & { role: OrgRole }> = [];
  let currentOrgId: string | null = null;
  let projects: Project[] = [];
  let currentProjectId: string | null = null;
  let loading = false;

  // Persist to localStorage
  function persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('zeo-org-state', JSON.stringify({ currentOrgId, currentProjectId }));
    } catch { /* noop */ }
  }

  function restore() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('zeo-org-state');
      if (raw) {
        const parsed = JSON.parse(raw);
        currentOrgId = parsed.currentOrgId ?? null;
        currentProjectId = parsed.currentProjectId ?? null;
      }
    } catch { /* noop */ }
  }

  restore();

  const store: OrgState = {
    get organizations() { return organizations; },
    get currentOrgId() { return currentOrgId; },
    get projects() { return projects; },
    get currentProjectId() { return currentProjectId; },
    get loading() { return loading; },
    setOrganizations(orgs) { organizations = orgs; },
    setCurrentOrg(orgId) { currentOrgId = orgId; persist(); },
    setProjects(p) { projects = p; },
    setCurrentProject(pid) { currentProjectId = pid; persist(); },
    setLoading(l) { loading = l; },
    currentOrg() {
      return organizations.find(o => o.id === currentOrgId) ?? null;
    },
  };

  return store;
}

export function getOrgStore(): OrgState {
  if (!state) state = createStore();
  return state;
}
