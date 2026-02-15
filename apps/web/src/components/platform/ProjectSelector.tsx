'use client';

import { useEffect, useState, useCallback } from 'react';

interface ProjectOption {
  id: string;
  name: string;
}

export function ProjectSelector({ orgId }: { orgId: string | null }) {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const loadProjects = useCallback(async () => {
    if (!orgId) { setProjects([]); return; }
    try {
      const res = await fetch(`/api/platform/orgs/${orgId}/projects`);
      const data = await res.json();
      if (data.ok) {
        setProjects(data.projects);
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('zeo-current-project') : null;
        const valid = data.projects.find((p: ProjectOption) => p.id === savedId);
        if (valid) setCurrentProjectId(savedId);
      }
    } catch { /* noop */ }
  }, [orgId]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  function switchProject(projectId: string | null) {
    setCurrentProjectId(projectId);
    if (typeof window !== 'undefined') {
      if (projectId) localStorage.setItem('zeo-current-project', projectId);
      else localStorage.removeItem('zeo-current-project');
    }
    setOpen(false);
  }

  async function createProject() {
    if (!newName.trim() || !orgId) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/platform/orgs/${orgId}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setNewName('');
        await loadProjects();
        switchProject(data.project.id);
      }
    } finally {
      setCreating(false);
    }
  }

  if (!orgId) return null;

  const current = projects.find(p => p.id === currentProjectId);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
        <span className="max-w-[120px] truncate">{current?.name ?? 'All Projects'}</span>
        <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
          <div className="max-h-48 overflow-y-auto p-1">
            <button
              type="button"
              onClick={() => switchProject(null)}
              className={`flex w-full rounded-md px-3 py-2 text-sm transition-colors ${
                !currentProjectId ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              All Projects
            </button>
            {projects.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => switchProject(p.id)}
                className={`flex w-full rounded-md px-3 py-2 text-sm transition-colors ${
                  p.id === currentProjectId ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
          <div className="border-t border-gray-200 p-2 dark:border-gray-600">
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="New project..."
                className="flex-1 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                onKeyDown={e => e.key === 'Enter' && createProject()}
              />
              <button
                type="button"
                onClick={createProject}
                disabled={creating || !newName.trim()}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? '...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
