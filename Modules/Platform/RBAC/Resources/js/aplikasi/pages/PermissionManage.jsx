import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  ShieldCheck,
  X,
  Save,
  ChevronDown,
  ChevronRight,
  KeyRound,
  Layers3,
} from 'lucide-react';

import permissionService from '@Modules/Platform/RBAC/Resources/js/aplikasi/services/permissionService';


// =====================================================
// CONSTANT
// =====================================================

const TOP_NAVBAR_HEIGHT = 64;
const BOTTOM_NAVBAR_HEIGHT = 60;


// =====================================================
// COMPONENT
// =====================================================

export default function PermissionManage() {
  // ===================================================
  // STATE
  // ===================================================

  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const [expandedDomains, setExpandedDomains] = useState({});

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedPermission, setSelectedPermission] = useState(null);

  // Form
  const [form, setForm] = useState({
    name: '',
    guard_name: 'web',
  });

  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);


  // ===================================================
  // LOAD PERMISSIONS
  // ===================================================

  const loadPermissions = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await permissionService.getPermissions();

      const data = Array.isArray(response?.data)
        ? response.data
        : [];

      setDomains(data);

      const calculatedTotal = data.reduce(
        (sum, domain) =>
          sum +
          Number(
            domain?.total ||
            domain?.permissions?.length ||
            0
          ),
        0
      );

      setTotal(
        Number.isFinite(response?.total)
          ? response.total
          : calculatedTotal
      );

      // Pertahankan state expand yang sudah ada
      // untuk domain yang masih tersedia.
      setExpandedDomains((previous) => {
        const next = {};

        data.forEach((domain) => {
          if (!domain?.domain) return;

          next[domain.domain] =
            Object.prototype.hasOwnProperty.call(
              previous,
              domain.domain
            )
              ? previous[domain.domain]
              : true;
        });

        return next;
      });
    } catch (err) {
      console.error(
        'Gagal mengambil data permission:',
        err
      );

      setError(
        err?.response?.data?.message ||
          'Gagal mengambil data permission.'
      );

      setDomains([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };


  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    loadPermissions();
  }, []);


  // ===================================================
  // SEARCH / FILTER
  // ===================================================

  const filteredDomains = domains
    .map((domain) => {
      const keyword = search.trim().toLowerCase();

      if (!keyword) {
        return domain;
      }

      const permissions = Array.isArray(
        domain?.permissions
      )
        ? domain.permissions
        : [];

      const domainName =
        domain?.domain?.toLowerCase() || '';

      const displayName =
        domain?.name?.toLowerCase() || '';

      const domainMatched =
        domainName.includes(keyword) ||
        displayName.includes(keyword);

      const filteredPermissions =
        permissions.filter((permission) => {
          const permissionName =
            permission?.name?.toLowerCase() || '';

          const guardName =
            permission?.guard_name?.toLowerCase() || '';

          return (
            permissionName.includes(keyword) ||
            guardName.includes(keyword)
          );
        });

      if (
        !domainMatched &&
        !filteredPermissions.length
      ) {
        return null;
      }

      return {
        ...domain,
        permissions: domainMatched
          ? permissions
          : filteredPermissions,
      };
    })
    .filter(Boolean);


  // ===================================================
  // DOMAIN TOGGLE
  // ===================================================

  const toggleDomain = (domainKey) => {
    setExpandedDomains((previous) => ({
      ...previous,
      [domainKey]:
        previous[domainKey] !== true,
    }));
  };


  // ===================================================
  // EXPAND ALL
  // ===================================================

  const expandAll = () => {
    const next = {};

    domains.forEach((domain) => {
      if (domain?.domain) {
        next[domain.domain] = true;
      }
    });

    setExpandedDomains(next);
  };


  // ===================================================
  // COLLAPSE ALL
  // ===================================================

  const collapseAll = () => {
    const next = {};

    domains.forEach((domain) => {
      if (domain?.domain) {
        next[domain.domain] = false;
      }
    });

    setExpandedDomains(next);
  };


  // ===================================================
  // CREATE MODAL
  // ===================================================

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedPermission(null);

    setForm({
      name: '',
      guard_name: 'web',
    });

    setFormErrors({});
    setError('');
    setShowModal(true);
  };


  // ===================================================
  // EDIT MODAL
  // ===================================================

  const openEditModal = (permission) => {
    setModalMode('edit');
    setSelectedPermission(permission);

    setForm({
      name: permission?.name ?? '',
      guard_name:
        permission?.guard_name ?? 'web',
    });

    setFormErrors({});
    setError('');
    setShowModal(true);
  };


  // ===================================================
  // CLOSE MODAL
  // ===================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setSelectedPermission(null);
    setFormErrors({});
  };


  // ===================================================
  // INPUT CHANGE
  // ===================================================

  const handleInputChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));
  };


  // ===================================================
  // VALIDATE FORM
  // ===================================================

  const validateForm = () => {
    const errors = {};

    if (!form.name.trim()) {
      errors.name =
        'Nama permission wajib diisi.';
    }

    setFormErrors(errors);

    return (
      Object.keys(errors).length === 0
    );
  };


  // ===================================================
  // SUBMIT FORM
  // ===================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        guard_name:
          form.guard_name || 'web',
      };

      if (modalMode === 'create') {
        await permissionService.createPermission(
          payload
        );

        setSuccess(
          'Permission berhasil ditambahkan.'
        );
      } else {
        await permissionService.updatePermission(
          selectedPermission.id,
          payload
        );

        setSuccess(
          'Permission berhasil diperbarui.'
        );
      }

      setShowModal(false);
      setSelectedPermission(null);

      setForm({
        name: '',
        guard_name: 'web',
      });

      setFormErrors({});

      await loadPermissions();
    } catch (err) {
      console.error(
        'Gagal menyimpan permission:',
        err
      );

      if (
        err?.response?.status === 422 &&
        err?.response?.data?.errors
      ) {
        setFormErrors(
          err.response.data.errors
        );
      } else {
        setError(
          err?.response?.data?.message ||
            'Gagal menyimpan permission.'
        );
      }
    } finally {
      setSaving(false);
    }
  };


  // ===================================================
  // DELETE
  // ===================================================

  const handleDelete = async (permission) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus permission "${permission.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await permissionService.deletePermission(
        permission.id
      );

      setSuccess(
        'Permission berhasil dihapus.'
      );

      await loadPermissions();
    } catch (err) {
      console.error(
        'Gagal menghapus permission:',
        err
      );

      setError(
        err?.response?.data?.message ||
          'Gagal menghapus permission.'
      );
    } finally {
      setLoading(false);
    }
  };


  // ===================================================
  // FIELD ERROR
  // ===================================================

  const getFieldError = (field) => {
    const value = formErrors?.[field];

    return Array.isArray(value)
      ? value[0]
      : value;
  };


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <>
      {/* =================================================
          MAIN CONTENT
      ================================================== */}

      <div className="space-y-5">


        {/* =================================================
            HEADER CARD
        ================================================== */}

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Gradient Accent */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-700 via-indigo-500 to-amber-400" />

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">

            {/* Header Information */}
            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-white shadow-md">
                <ShieldCheck size={24} />
              </div>

              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  Manajemen Permission
                </h1>

                <p className="text-sm text-slate-500">
                  Kelola permission aplikasi berdasarkan domain dan guard.
                </p>
              </div>

            </div>


            {/* Header Actions */}
            <div className="flex items-center gap-2 self-end sm:self-auto">

              {/* Refresh */}
              <button
                type="button"
                onClick={loadPermissions}
                disabled={loading}
                title="Refresh Data"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={18}
                  className={
                    loading
                      ? 'animate-spin'
                      : ''
                  }
                />
              </button>


              {/* Add */}
              <button
                type="button"
                onClick={openCreateModal}
                className="flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800"
              >
                <Plus size={18} />

                <span>
                  Tambah Permission
                </span>
              </button>

            </div>

          </div>
        </div>


        {/* =================================================
            SUCCESS ALERT
        ================================================== */}

        {success && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">

            <span>
              {success}
            </span>

            <button
              type="button"
              onClick={() => setSuccess('')}
              className="rounded-lg p-1 transition hover:bg-emerald-100"
            >
              <X size={15} />
            </button>

          </div>
        )}


        {/* =================================================
            ERROR ALERT
        ================================================== */}

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() => setError('')}
              className="rounded-lg p-1 transition hover:bg-rose-100"
            >
              <X size={15} />
            </button>

          </div>
        )}


        {/* =================================================
            PERMISSION CARD
        ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">


          {/* =================================================
              TOOLBAR
          ================================================== */}

          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">

            {/* Search */}
            <div className="relative w-full sm:max-w-md">

              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Cari permission atau domain..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

            </div>


            {/* Summary */}
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">

              <span>
                Total:
                <strong className="ml-1 font-black text-slate-800">
                  {total}
                </strong>{' '}
                permission
              </span>

              <span className="hidden text-slate-300 sm:inline">
                |
              </span>

              <span>
                {domains.length} domain
              </span>


              {/* Expand */}
              <button
                type="button"
                onClick={expandAll}
                className="ml-1 flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <ChevronDown size={14} />
                Buka Semua
              </button>


              {/* Collapse */}
              <button
                type="button"
                onClick={collapseAll}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <ChevronRight size={14} />
                Tutup Semua
              </button>

            </div>

          </div>


          {/* =================================================
              DESKTOP TABLE
          ================================================== */}

          <div className="hidden overflow-x-auto md:block">

            <table className="w-full border-collapse text-left">

              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">

                  <th className="px-5 py-3.5">
                    Permission
                  </th>

                  <th className="px-5 py-3.5">
                    Guard
                  </th>

                  <th className="px-5 py-3.5">
                    Domain
                  </th>

                  <th className="px-5 py-3.5 text-right">
                    Aksi
                  </th>

                </tr>
              </thead>


              <tbody className="divide-y divide-slate-100 text-sm">

                {/* Loading */}
                {loading && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-5 py-10 text-center text-sm text-slate-400"
                    >
                      <div className="flex items-center justify-center gap-2">

                        <RefreshCw
                          size={17}
                          className="animate-spin"
                        />

                        Memuat data...

                      </div>
                    </td>
                  </tr>
                )}


                {/* Empty */}
                {!loading &&
                  filteredDomains.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-5 py-10 text-center text-sm font-semibold text-slate-400"
                      >
                        Tidak ada data permission.
                      </td>
                    </tr>
                  )}


                {/* Domains */}
                {!loading &&
                  filteredDomains.map((domain) => {
                    const domainKey =
                      domain.domain;

                    const permissions =
                      Array.isArray(
                        domain.permissions
                      )
                        ? domain.permissions
                        : [];

                    const expanded =
                      expandedDomains[
                        domainKey
                      ] === true;

                    return (
                      <React.Fragment
                        key={domainKey}
                      >

                        {/* Domain Header */}
                        <tr className="border-b border-slate-100 bg-slate-50/70">

                          <td
                            colSpan="4"
                            className="px-5 py-3"
                          >

                            <div className="flex items-center justify-between">

                              <div className="flex items-center gap-3">

                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleDomain(
                                      domainKey
                                    )
                                  }
                                  className="rounded-lg p-1 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                >
                                  {expanded ? (
                                    <ChevronDown
                                      size={16}
                                    />
                                  ) : (
                                    <ChevronRight
                                      size={16}
                                    />
                                  )}
                                </button>


                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                  <Layers3 size={16} />
                                </div>


                                <div>
                                  <div className="font-black text-slate-800">
                                    {domain.name ||
                                      domain.domain}
                                  </div>

                                  <div className="font-mono text-[10px] text-slate-400">
                                    {domain.domain}
                                  </div>
                                </div>


                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600">
                                  {permissions.length}{' '}
                                  permission
                                </span>

                              </div>


                              <span className="text-xs font-medium text-slate-400">
                                Domain
                              </span>

                            </div>

                          </td>

                        </tr>


                        {/* Permissions */}
                        {expanded &&
                          permissions.map(
                            (permission) => (
                              <tr
                                key={permission.id}
                                className="transition-colors hover:bg-slate-50"
                              >

                                <td className="px-5 py-4">

                                  <div className="flex items-center gap-3 pl-10">

                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                      <KeyRound
                                        size={15}
                                      />
                                    </div>


                                    <div className="min-w-0">

                                      <p className="break-all font-mono text-xs font-bold text-slate-800">
                                        {permission.name}
                                      </p>

                                      <p className="mt-0.5 text-xs text-slate-400">
                                        ID: {permission.id}
                                      </p>

                                    </div>

                                  </div>

                                </td>


                                <td className="px-5 py-4">

                                  <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                                    {permission.guard_name ||
                                      'web'}
                                  </span>

                                </td>


                                <td className="px-5 py-4">

                                  <span className="rounded-lg bg-blue-50 px-2 py-1 font-mono text-xs text-blue-600">
                                    {domain.domain}
                                  </span>

                                </td>


                                <td className="px-5 py-4 text-right">

                                  <div className="flex items-center justify-end gap-1.5">

                                    {/* Edit */}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openEditModal(
                                          permission
                                        )
                                      }
                                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-all hover:bg-blue-100"
                                      title="Edit"
                                    >
                                      <Pencil
                                        size={15}
                                      />
                                    </button>


                                    {/* Delete */}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDelete(
                                          permission
                                        )
                                      }
                                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition-all hover:bg-rose-100"
                                      title="Hapus"
                                    >
                                      <Trash2
                                        size={15}
                                      />
                                    </button>

                                  </div>

                                </td>

                              </tr>
                            )
                          )}

                      </React.Fragment>
                    );
                  })}

              </tbody>

            </table>

          </div>


          {/* =================================================
              MOBILE
          ================================================== */}

          <div className="divide-y divide-slate-100 text-sm md:hidden">

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-400">

                <RefreshCw
                  size={17}
                  className="animate-spin"
                />

                Memuat data...

              </div>
            )}


            {/* Empty */}
            {!loading &&
              filteredDomains.length === 0 && (
                <div className="p-8 text-center text-sm font-semibold text-slate-400">
                  Tidak ada data permission.
                </div>
              )}


            {/* Mobile Domains */}
            {!loading &&
              filteredDomains.map((domain) => {
                const domainKey =
                  domain.domain;

                const permissions =
                  Array.isArray(
                    domain.permissions
                  )
                    ? domain.permissions
                    : [];

                const expanded =
                  expandedDomains[
                    domainKey
                  ] === true;

                return (
                  <div key={domainKey}>

                    {/* Domain */}
                    <div className="flex items-center justify-between gap-3 bg-slate-50 p-4">

                      <div className="flex min-w-0 items-center gap-3">

                        <button
                          type="button"
                          onClick={() =>
                            toggleDomain(
                              domainKey
                            )
                          }
                          className="rounded-lg p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                        >
                          {expanded ? (
                            <ChevronDown
                              size={16}
                            />
                          ) : (
                            <ChevronRight
                              size={16}
                            />
                          )}
                        </button>


                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Layers3 size={16} />
                        </div>


                        <div className="min-w-0">

                          <p className="truncate text-sm font-black text-slate-800">
                            {domain.name ||
                              domain.domain}
                          </p>

                          <p className="truncate font-mono text-[10px] text-slate-400">
                            {domain.domain}
                          </p>

                        </div>

                      </div>


                      <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-600">
                        {permissions.length}
                      </span>

                    </div>


                    {/* Mobile Permissions */}
                    {expanded &&
                      permissions.map(
                        (permission) => (
                          <div
                            key={permission.id}
                            className="space-y-3 p-5 transition-colors hover:bg-slate-50"
                          >

                            <div className="flex items-start gap-3">

                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                <KeyRound
                                  size={16}
                                />
                              </div>


                              <div className="min-w-0 flex-1">

                                <p className="break-all font-mono text-xs font-black text-slate-800">
                                  {permission.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  Guard:{' '}
                                  {permission.guard_name ||
                                    'web'}
                                </p>

                              </div>

                            </div>


                            <div className="flex gap-2 border-t border-slate-100 pt-3">

                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    permission
                                  )
                                }
                                className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 text-sm font-bold text-blue-600 transition-all hover:bg-blue-100"
                              >
                                <Pencil
                                  size={15}
                                />

                                Edit
                              </button>


                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    permission
                                  )
                                }
                                className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-rose-50 text-sm font-bold text-rose-600 transition-all hover:bg-rose-100"
                              >
                                <Trash2
                                  size={15}
                                />

                                Hapus
                              </button>

                            </div>

                          </div>
                        )
                      )}

                  </div>
                );
              })}

          </div>

        </div>

      </div>


      {/* =====================================================
          MODAL
          
          TOP NAVBAR  : 64px
          BOTTOM NAV  : 60px
          
          Modal wrapper menggunakan inset custom supaya
          tidak mengambil area navbar.
      ====================================================== */}

      {showModal && (
        <div
          className="fixed inset-x-0 z-[70] flex items-center justify-center bg-transparent p-4"
          style={{
            top: `${TOP_NAVBAR_HEIGHT}px`,
            bottom: `${BOTTOM_NAVBAR_HEIGHT}px`,
          }}
        >

          {/* =================================================
              BACKDROP
          ================================================== */}

          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={closeModal}
          />


          {/* =================================================
              MODAL CONTAINER
          ================================================== */}

          <div
            className="relative z-[71] flex w-full max-w-lg max-h-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="permission-modal-title"
          >

            {/* =================================================
                MODAL HEADER
            ================================================== */}

            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5">

              <div className="min-w-0">

                <h2
                  id="permission-modal-title"
                  className="text-xl font-black text-slate-900"
                >
                  {modalMode === 'create'
                    ? 'Tambah Permission'
                    : 'Edit Permission'}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {modalMode === 'create'
                    ? 'Buat permission aplikasi baru.'
                    : 'Perbarui informasi permission.'}
                </p>

              </div>


              {/* Close */}
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                title="Tutup"
              >
                <X size={19} />
              </button>

            </div>


            {/* =================================================
                MODAL BODY
                Scroll hanya pada body.
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >

              <div className="min-h-0 flex-1 overflow-y-auto">

                <div className="space-y-5 p-6 text-sm">


                  {/* =================================================
                      PERMISSION NAME
                  ================================================== */}

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Permission Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      disabled={saving}
                      placeholder="contoh: hrd.users.view"
                      className={`w-full rounded-xl border px-3.5 py-2.5 font-mono text-sm outline-none transition-all ${
                        getFieldError('name')
                          ? 'border-rose-300 bg-rose-50'
                          : 'border-slate-200 bg-slate-50'
                      } focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100`}
                    />

                    {getFieldError('name') && (
                      <p className="mt-1.5 text-xs text-rose-600">
                        {getFieldError('name')}
                      </p>
                    )}

                    <p className="mt-1.5 text-xs text-slate-400">
                      Gunakan format domain.action agar permission mudah dikelompokkan.
                    </p>

                  </div>


                  {/* =================================================
                      GUARD NAME
                  ================================================== */}

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Guard Name
                    </label>

                    <select
                      name="guard_name"
                      value={form.guard_name}
                      onChange={handleInputChange}
                      disabled={saving}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="web">
                        web
                      </option>

                      <option value="api">
                        api
                      </option>
                    </select>

                  </div>


                  {/* =================================================
                      PREVIEW
                  ================================================== */}

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700">

                      <ShieldCheck
                        size={15}
                        className="text-blue-600"
                      />

                      Preview

                    </div>


                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">

                      <div className="break-all font-mono text-xs font-bold text-slate-800">
                        {form.name ||
                          'permission.name'}
                      </div>

                      <div className="mt-1 text-[10px] text-slate-400">
                        guard: {form.guard_name}
                      </div>

                    </div>

                  </div>

                </div>

              </div>


              {/* =================================================
                  MODAL FOOTER
              ================================================== */}

              <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 bg-white px-6 py-5">

                {/* Cancel */}
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>


                {/* Save */}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {saving ? (
                    <>
                      <RefreshCw
                        size={15}
                        className="animate-spin"
                      />

                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={15} />

                      {modalMode === 'create'
                        ? 'Simpan Permission'
                        : 'Simpan Perubahan'}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </>
  );
}