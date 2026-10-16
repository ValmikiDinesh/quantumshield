import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { ProjectDTO } from '../../types';
import { Header } from '../../components/common/Header';
import { Sidebar } from '../../components/common/Sidebar';
import {
  FolderGit2,
  Plus,
  Search,
  Trash2,
  ArrowRight,
  Loader2,
  AlertCircle,
  Tag,
  Shield,
  X,
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Project Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectType, setNewProjectType] = useState('web');
  const [newProjectTags, setNewProjectTags] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await api.listProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);

    try {
      const tagsArray = newProjectTags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const created = await api.createProject({
        name: newProjectName.trim(),
        description: newProjectDesc.trim(),
        projectType: newProjectType,
        tags: tagsArray,
      });

      setProjects([created, ...projects]);
      setIsModalOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
      setNewProjectTags('');
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" and all associated scans?`)) {
      return;
    }

    try {
      await api.deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || p.projectType === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Repository Projects"
          subtitle="Manage software repositories and historical post-quantum cryptographic scans"
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex justify-between">
              <span>{error}</span>
              <button onClick={loadProjects} className="font-bold underline">Retry</button>
            </div>
          )}

          {/* Action bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                />
              </div>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="py-2 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">All Types</option>
                <option value="web">Web Application</option>
                <option value="api">Backend API</option>
                <option value="mobile">Mobile App</option>
                <option value="library">Library / SDK</option>
                <option value="infrastructure">Infrastructure</option>
              </select>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center justify-center space-x-2 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project</span>
            </button>
          </div>

          {/* Project List */}
          {isLoading ? (
            <div className="py-24 text-center">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-600">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
              <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-navy-950">No projects found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {search ? 'No projects match your current filter.' : 'Get started by creating your first repository project to initiate cryptographic scans.'}
              </p>
              {!search && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 bg-brand-600 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm"
                >
                  Create Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project) => {
                const latest = project.latestScan;
                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {project.projectType}
                        </span>
                        <button
                          onClick={() => handleDeleteProject(project.id, project.name)}
                          className="text-slate-400 hover:text-red-600 p-1"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-navy-950 leading-snug">
                        {project.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {project.description || 'No description provided.'}
                      </p>

                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {project.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-blue-50 text-brand-700 px-1.5 py-0.5 rounded flex items-center space-x-1"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                      {latest ? (
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Latest Readiness</p>
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mt-0.5 ${
                              latest.readinessScore < 40 ? 'bg-red-100 text-red-700' :
                              latest.readinessScore < 65 ? 'bg-orange-100 text-orange-700' :
                              latest.readinessScore < 85 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {latest.readinessScore} / 100
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Findings</p>
                            <p className="text-xs font-bold text-slate-700 mt-0.5">
                              {latest.findingsCount} ({latest.criticalCount} crit)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 mb-3 italic">No scans executed yet</p>
                      )}

                      <Link
                        to={`/app/projects/${project.id}`}
                        className="w-full bg-slate-50 hover:bg-slate-100 text-navy-950 border border-slate-200 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center space-x-1 transition-colors"
                      >
                        <span>Open & Scan Repository</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CREATE PROJECT MODAL */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="text-base font-bold text-navy-950">Create New Project</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {createError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                    {createError}
                  </div>
                )}

                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="e.g. Identity Authentication Gateway"
                      className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                      placeholder="Purpose, service architecture, and target repository details..."
                      className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Project Type
                      </label>
                      <select
                        value={newProjectType}
                        onChange={(e) => setNewProjectType(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="web">Web Application</option>
                        <option value="api">Backend API</option>
                        <option value="mobile">Mobile App</option>
                        <option value="library">Library / SDK</option>
                        <option value="infrastructure">Infrastructure</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={newProjectTags}
                        onChange={(e) => setNewProjectTags(e.target.value)}
                        placeholder="auth, nodejs, tls"
                        className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="bg-brand-600 hover:bg-brand-500 text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center space-x-1"
                    >
                      {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      <span>Create Project</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
