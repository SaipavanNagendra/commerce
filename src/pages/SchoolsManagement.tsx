import { useState, useMemo } from 'react';
import { useSchools, useCreateSchool, useDeleteSchool } from '../hooks/useEntities';
import { Button } from '../components/Button';
import { ErrorAlert } from '../components/ErrorAlert';
import { AdminNav } from '../components/AdminNav';

export function SchoolsManagement() {
  const { data: schools, isLoading, error } = useSchools();
  const createMutation = useCreateSchool();
  const deleteMutation = useDeleteSchool();

  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<string>('');
  const [filterCity, setFilterCity] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    state: '',
    city: '',
    adminId: '',
    logoPath: '',
  });

  const uniqueStates = useMemo(() => {
    return [...new Set(schools?.map((s) => s.state) || [])].sort();
  }, [schools]);

  const filteredSchools = useMemo(() => {
    if (!schools) return [];
    return schools.filter((s) => {
      if (filterState && s.state !== filterState) return false;
      if (filterCity && s.city !== filterCity) return false;
      return true;
    });
  }, [schools, filterState, filterCity]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('School name is required');
      return;
    }
    if (!formData.code.trim()) {
      setFormError('School code is required');
      return;
    }
    if (!formData.state.trim()) {
      setFormError('State is required');
      return;
    }
    if (!formData.city.trim()) {
      setFormError('City is required');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formData.name,
        code: formData.code.toUpperCase(),
        state: formData.state,
        city: formData.city,
        adminId: formData.adminId || undefined,
        logoPath: formData.logoPath || undefined,
      });

      setFormData({ name: '', code: '', state: '', city: '', adminId: '', logoPath: '' });
      setIsCreating(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create school');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this school?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: any) {
        setFormError(err.response?.data?.message || 'Failed to delete school');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-slate-600">Loading schools...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminNav />
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Schools Management</h1>
          <p className="mt-1 text-slate-600">Manage schools and institutions</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="w-auto">
            + Add School
          </Button>
        )}
      </div>

      {/* Errors */}
      {error && <ErrorAlert message={(error as any).message || 'Failed to load schools'} />}
      {formError && <ErrorAlert message={formError} />}

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filterState}
          onChange={(e) => {
            setFilterState(e.target.value);
            setFilterCity('');
          }}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
        >
          <option value="">All States</option>
          {uniqueStates.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        {filterState && (
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
          >
            <option value="">All Cities in {filterState}</option>
            {[...new Set(schools?.filter((s) => s.state === filterState).map((s) => s.city) || [])]
              .sort()
              .map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
          </select>
        )}
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Add New School</h2>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  School Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                  placeholder="e.g., Delhi Public School"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  School Code (Unique) *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                  placeholder="e.g., DPS"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                  placeholder="e.g., Delhi"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                  placeholder="e.g., New Delhi"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Admin ID (Optional)
              </label>
              <input
                type="text"
                value={formData.adminId}
                onChange={(e) => setFormData({ ...formData, adminId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                placeholder="Assign school admin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Logo URL (Optional)
              </label>
              <input
                type="url"
                value={formData.logoPath}
                onChange={(e) => setFormData({ ...formData, logoPath: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={createMutation.isPending}>
                Add School
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsCreating(false);
                  setFormData({ name: '', code: '', state: '', city: '', adminId: '', logoPath: '' });
                }}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Schools Grid */}
      {filteredSchools && filteredSchools.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSchools.map((school) => (
            <div key={school.id} className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition">
              {school.logoPath && (
                <img src={school.logoPath} alt={school.name} className="h-12 w-12 rounded-lg object-cover mb-3" />
              )}
              <h3 className="text-lg font-bold text-slate-900">{school.name}</h3>
              <p className="text-sm text-slate-600 mt-1">Code: {school.code}</p>
              <p className="text-sm text-slate-600">
                {school.city}, {school.state}
              </p>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100">
                  View
                </button>
                <button
                  onClick={() => handleDelete(school.id)}
                  disabled={deleteMutation.isPending}
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-slate-200 py-12 text-center">
          <p className="text-slate-500">No schools found. Add one to get started.</p>
        </div>
      )}
      </div>
    </div>
  );
}
