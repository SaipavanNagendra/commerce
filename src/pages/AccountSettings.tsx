import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useLogout } from '../hooks/useAuth';
import {
  useSessions,
  useRevokeSession,
  useUploadAvatar,
  useUpdateProfile,
} from '../hooks/useUser';
import { Button } from '../components/Button';
import { FormInput } from '../components/FormInput';
import { ErrorAlert } from '../components/ErrorAlert';
import { getApiErrorMessage } from '../lib/axios';
import { resolveAvatarUrl } from '../lib/format';
import { SiteHeader } from '../components/layout/SiteHeader';
import { StudentSidebar } from '../components/layout/StudentSidebar';
import type { ClassLevel } from '../types/auth.types';

export function AccountSettings() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const logoutMutation = useLogout();
  const uploadAvatarMutation = useUploadAvatar();
  const updateProfileMutation = useUpdateProfile();
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const revokeSessionMutation = useRevokeSession();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: user?.profile.firstName ?? '',
    lastName: user?.profile.lastName ?? '',
    classLevel: (user?.profile.classLevel ?? 'CLASS_11') as ClassLevel,
    state: user?.profile.state ?? '',
    city: user?.profile.city ?? '',
  });

  function openEditForm() {
    if (!user) return;
    setEditForm({
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      classLevel: user.profile.classLevel,
      state: user.profile.state,
      city: user.profile.city,
    });
    setEditError(null);
    setIsEditing(true);
  }

  function handleEditChange(field: keyof typeof editForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setEditForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    setEditError(null);
    try {
      await updateProfileMutation.mutateAsync(editForm);
      setIsEditing(false);
    } catch (err) {
      setEditError(getApiErrorMessage(err, 'Could not update profile. Check the fields and try again.'));
    }
  }

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      document.body.style.visibility = 'hidden';
      window.location.replace('/login');
    }
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    try {
      await uploadAvatarMutation.mutateAsync(file);
    } catch (err) {
      setAvatarError(getApiErrorMessage(err, 'Could not upload avatar.'));
    } finally {
      e.target.value = '';
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="flex gap-8">
          <StudentSidebar />

          <div className="min-w-0 flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-slate-900">Account Settings</h1>
              <div className="flex items-center gap-3">
                {(user.role === 'SUPER_ADMIN' || user.role === 'SCHOOL_ADMIN') && (
                  <Button variant="secondary" className="w-auto" onClick={() => navigate('/admin')}>
                    Admin Panel
                  </Button>
                )}
                <Button
                  variant="secondary"
                  className="w-auto"
                  onClick={handleLogout}
                  isLoading={logoutMutation.isPending}
                >
                  Logout
                </Button>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Left Column - Profile & Sessions */}
              <div className="lg:col-span-2 space-y-8">
                {/* Profile Section */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-8 py-6">
                    <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
                  </div>

                  <div className="p-8">
                    {avatarError && <ErrorAlert message={avatarError} />}

                    <div className="flex flex-col sm:flex-row sm:items-start sm:gap-8">
                      {/* Avatar */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 ring-4 ring-white shadow-lg transition hover:shadow-xl"
                        title="Change avatar"
                      >
                        {user.profile.avatarPath ? (
                          <img
                            src={resolveAvatarUrl(user.profile.avatarPath) ?? undefined}
                            alt={`${user.profile.firstName}'s avatar`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-4xl font-bold text-blue-700">
                            {user.profile.firstName[0]}
                            {user.profile.lastName[0]}
                          </span>
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />

                      {/* User Info */}
                      <div className="mt-6 flex-1 sm:mt-0">
                        <h3 className="text-2xl font-bold text-slate-900">
                          {user.profile.firstName} {user.profile.lastName}
                        </h3>
                        <p className="mt-1 text-slate-600">{user.email}</p>
                        <div className="mt-4 flex gap-3">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                            disabled={uploadAvatarMutation.isPending}
                          >
                            📸
                            {uploadAvatarMutation.isPending ? 'Uploading…' : 'Change photo'}
                          </button>
                          {!isEditing && (
                            <button
                              type="button"
                              onClick={openEditForm}
                              className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                            >
                              ✏️ Edit Profile
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Edit Form or Display */}
                    {isEditing ? (
                      <form className="mt-8 space-y-6 border-t border-slate-100 pt-8" onSubmit={handleSaveProfile}>
                        <ErrorAlert message={editError} />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormInput
                            label="First Name"
                            name="firstName"
                            value={editForm.firstName}
                            onChange={handleEditChange('firstName')}
                            required
                            maxLength={50}
                          />
                          <FormInput
                            label="Last Name"
                            name="lastName"
                            value={editForm.lastName}
                            onChange={handleEditChange('lastName')}
                            required
                            maxLength={50}
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="editClassLevel" className="text-sm font-medium text-slate-700">
                            Class Level
                          </label>
                          <select
                            id="editClassLevel"
                            value={editForm.classLevel}
                            onChange={handleEditChange('classLevel')}
                            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                          >
                            <option value="CLASS_11">Class 11</option>
                            <option value="CLASS_12">Class 12</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormInput
                            label="State / Province"
                            name="state"
                            value={editForm.state}
                            onChange={handleEditChange('state')}
                            required
                            maxLength={50}
                          />
                          <FormInput
                            label="City"
                            name="city"
                            value={editForm.city}
                            onChange={handleEditChange('city')}
                            required
                            maxLength={50}
                          />
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Button type="submit" isLoading={updateProfileMutation.isPending}>
                            Save Changes
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsEditing(false)}
                            disabled={updateProfileMutation.isPending}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-8 sm:grid-cols-4">
                        <div className="rounded-lg bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Class Level</p>
                          <p className="mt-2 text-lg font-semibold text-slate-900">{user.profile.classLevel.replace('_', ' ')}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">City</p>
                          <p className="mt-2 text-lg font-semibold text-slate-900">{user.profile.city}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">State</p>
                          <p className="mt-2 text-lg font-semibold text-slate-900">{user.profile.state}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
                          <p className="mt-2 text-lg font-semibold text-slate-900">{user.phone || '—'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-8 py-6">
                    <h2 className="text-xl font-bold text-slate-900">Active Sessions</h2>
                    <p className="mt-1 text-sm text-slate-600">Manage your login sessions across devices</p>
                  </div>

                  <div className="p-8">
                    {sessionsLoading && (
                      <div className="flex justify-center py-8">
                        <p className="text-sm text-slate-500">Loading sessions…</p>
                      </div>
                    )}

                    {sessions && sessions.length === 0 && (
                      <div className="rounded-lg border-2 border-dashed border-slate-200 py-12 text-center">
                        <p className="text-sm text-slate-500">No active sessions</p>
                      </div>
                    )}

                    {sessions && sessions.length > 0 && (
                      <ul className="space-y-3">
                        {sessions.map((session) => (
                          <li
                            key={session.id}
                            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 transition hover:bg-slate-100"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">
                                💻 {session.browser} on {session.os}
                              </p>
                              <p className="mt-1 text-xs text-slate-600">
                                IP: {session.ip} • Last active: {new Date(session.lastActive).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => revokeSessionMutation.mutate(session.id)}
                              className="ml-4 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                              disabled={revokeSessionMutation.isPending}
                            >
                              {revokeSessionMutation.isPending ? 'Revoking…' : 'Revoke'}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <aside className="space-y-8">
                {/* Account Stats */}
                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900">Account Status</h3>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Status</span>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                        ✓ Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Member Since</span>
                      <span className="text-sm font-medium text-slate-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Email Verified</span>
                      <span className={`text-sm font-medium ${user.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
                        {user.isEmailVerified ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security */}
                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900">Security</h3>
                  <div className="mt-6 space-y-2">
                    <a
                      href="#"
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    >
                      🔑 Change Password
                    </a>
                    <a
                      href="#"
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    >
                      🔐 Two-Factor Authentication
                    </a>
                  </div>
                </div>

                {/* Help */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-8">
                  <h3 className="text-lg font-bold text-slate-900">Need Help?</h3>
                  <p className="mt-2 text-sm text-slate-600">Visit our help center or contact support.</p>
                  <a
                    href="#"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    📧 Contact Support →
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}