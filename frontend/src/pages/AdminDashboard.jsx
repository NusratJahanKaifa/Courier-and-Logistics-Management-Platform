
import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import {
  FaBox,
  FaClock,
  FaTruckFast,
  FaCircleCheck,
  FaUsers,
  FaMagnifyingGlass,
  FaPlus,
  FaTrash,
  FaArrowUpWideShort,
  FaRotate,
  FaLocationDot,
  FaUser,
  FaPhone
} from 'react-icons/fa6'
import toast from 'react-hot-toast'
import { apiRequest } from '../utils/api'

const PAGE_SIZE = 5

const STATUSES = [
  'Pending',
  'Picked Up',
  'In Transit',
  'Ready for Delivery',
  'Delivered',
  'Cancelled'
]

const EMPTY_STATUS_FORM = {
  status: '',
  location: '',
  rider_name: '',
  rider_phone: '',
  description: ''
}

function getErrorMessage(data, fallback) {
  if (typeof data?.detail === 'string') return data.detail

  if (Array.isArray(data?.detail)) {
    return data.detail.map((item) => item.msg).join(', ')
  }

  return fallback
}

function AdminDashboard() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('newest')
  const [page, setPage] = useState(1)

  const [parcels, setParcels] = useState([])
  const [total, setTotal] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [statusTarget, setStatusTarget] = useState(null)
  const [statusForm, setStatusForm] = useState(EMPTY_STATUS_FORM)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const fetchParcels = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        sort_by: 'created_at',
        order: sortOrder === 'newest' ? 'desc' : 'asc'
      })

      if (search.trim()) {
        params.set('search', search.trim())
      }

      if (statusFilter !== 'All') {
        params.set('status', statusFilter)
      }

      const response = await apiRequest(`/parcels/?${params.toString()}`)
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, 'Failed to fetch parcels.')
        )
      }

      const list = Array.isArray(data.parcels)
        ? data.parcels
        : Array.isArray(data)
          ? data
          : []

      setParcels(
        list.map((parcel) => ({
          id: parcel.id,
          trackingNumber: parcel.tracking_number,
          sender: parcel.sender_name || '',
          receiver: parcel.receiver_name || '',
          destination: parcel.delivery_address || '',
          date: parcel.created_at || '',
          status: parcel.status || 'Pending'
        }))
      )

      setTotal(Number(data.total ?? list.length) || 0)
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot connect to backend. Please check the server.'
          : err.message || 'Could not load parcels.'
      )
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, sortOrder])

  useEffect(() => {
    fetchParcels()
  }, [fetchParcels])

  // Open status update modal
  const openStatusModal = (parcel, newStatus) => {
    if (parcel.status === newStatus) return

    setStatusTarget(parcel)

    setStatusForm({
      ...EMPTY_STATUS_FORM,
      status: newStatus
    })
  }

  // Update parcel status and tracking information
  const updateStatus = async () => {
    if (!statusTarget || updatingId !== null) return

    setUpdatingId(statusTarget.id)

    try {
      const response = await apiRequest(`/parcels/${statusTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statusForm)
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, 'Failed to update parcel status.')
        )
      }

      setStatusTarget(null)
      setStatusForm(EMPTY_STATUS_FORM)

      toast.success('Parcel tracking updated successfully!')

      await fetchParcels()
    } catch (err) {
      toast.error(err.message || 'Could not update parcel status.')
    } finally {
      setUpdatingId(null)
    }
  }

  // Delete parcel
  const deleteParcel = async () => {
    if (!deleteTarget || deletingId !== null) return

    const target = deleteTarget
    setDeletingId(target.id)

    try {
      const response = await apiRequest(`/parcels/${target.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(
          getErrorMessage(data, 'Failed to delete parcel.')
        )
      }

      setDeleteTarget(null)
      toast.success('Parcel deleted successfully!')

      if (parcels.length === 1 && page > 1) {
        setPage((current) => current - 1)
      } else {
        await fetchParcels()
      }
    } catch (err) {
      toast.error(err.message || 'Could not delete parcel.')
    } finally {
      setDeletingId(null)
    }
  }

  const counts = {
    total,
    pending: parcels.filter((parcel) => parcel.status === 'Pending').length,
    transit: parcels.filter((parcel) => parcel.status === 'In Transit').length,
    delivered: parcels.filter((parcel) => parcel.status === 'Delivered').length
  }

  const changeSearch = (value) => {
    setSearch(value)
    setPage(1)
  }

  const changeFilter = (value) => {
    setStatusFilter(value)
    setPage(1)
  }

  const formatDate = (value) => {
    if (!value) return 'N/A'

    const date = new Date(value)

    return Number.isNaN(date.getTime())
      ? 'N/A'
      : date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
  }

  const firstParcel = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const lastParcel = Math.min(page * PAGE_SIZE, total)

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">

        {/* Dashboard Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#0F766E]">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-extrabold text-[#102A43]">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-gray-500">
              Monitor and manage courier deliveries.
            </p>
          </div>

          <Link
            to="/users-management"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#115E59]"
          >
            <FaUsers /> Manage Users
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={<FaBox />}
            title="Matching Parcels"
            value={counts.total}
            color="text-[#0F766E]"
          />

          <SummaryCard
            icon={<FaClock />}
            title="Pending (This Page)"
            value={counts.pending}
            color="text-amber-600"
          />

          <SummaryCard
            icon={<FaTruckFast />}
            title="In Transit (This Page)"
            value={counts.transit}
            color="text-blue-600"
          />

          <SummaryCard
            icon={<FaCircleCheck />}
            title="Delivered (This Page)"
            value={counts.delivered}
            color="text-emerald-600"
          />
        </div>

        {/* Parcel Management */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-xl font-bold text-[#102A43]">
                Parcel Management
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Search, filter, sort and update deliveries.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={fetchParcels}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-[#0F766E] hover:text-[#0F766E] disabled:opacity-50"
              >
                <FaRotate className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 lg:p-6">
            <div className="relative">
              <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => changeSearch(event.target.value)}
                placeholder="Search tracking ID, sender, receiver..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => changeFilter(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F766E]"
            >
              <option value="All">All Statuses</option>

              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <div className="relative">
              <FaArrowUpWideShort className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <select
                value={sortOrder}
                onChange={(event) => {
                  setSortOrder(event.target.value)
                  setPage(1)
                }}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0F766E]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Loading, Error and Parcel Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <span className="h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-[#0F766E]" />

              <p className="mt-4 text-sm text-gray-500">
                Loading parcels...
              </p>
            </div>
          ) : error ? (
            <div className="m-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>

              <button
                type="button"
                onClick={fetchParcels}
                className="rounded-lg bg-red-100 px-4 py-2 font-semibold hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          ) : parcels.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <FaBox className="mx-auto mb-4 text-4xl text-slate-300" />

              <h3 className="font-bold text-[#102A43]">
                No parcels found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Try another search or status filter.
              </p>

              {(search || statusFilter !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setStatusFilter('All')
                    setPage(1)
                  }}
                  className="mt-4 font-semibold text-[#0F766E] hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#102A43] text-xs uppercase tracking-wider text-white">
                    <tr>
                      <th className="px-4 py-4">Tracking ID</th>
                      <th className="px-4 py-4">Sender</th>
                      <th className="px-4 py-4">Receiver</th>
                      <th className="px-4 py-4">Destination</th>
                      <th className="px-4 py-4">Date</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Update</th>
                      <th className="px-4 py-4">Delete</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {parcels.map((parcel) => (
                      <tr
                        key={parcel.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-4 py-4 font-semibold text-[#102A43]">
                          {parcel.trackingNumber || parcel.id}
                        </td>

                        <td className="px-4 py-4 text-gray-600">
                          {parcel.sender || 'N/A'}
                        </td>

                        <td className="px-4 py-4 text-gray-600">
                          {parcel.receiver || 'N/A'}
                        </td>

                        <td className="min-w-44 px-4 py-4 text-gray-600">
                          {parcel.destination || 'N/A'}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-gray-500">
                          {formatDate(parcel.date)}
                        </td>

                        <td className="px-4 py-4">
                          <ParcelStatus status={parcel.status} />
                        </td>

                        <td className="px-4 py-4">
                          <select
                            value={parcel.status}
                            disabled={
                              updatingId === parcel.id ||
                              deletingId === parcel.id
                            }
                            onChange={(event) =>
                              openStatusModal(parcel, event.target.value)
                            }
                            aria-label={`Update status for ${parcel.trackingNumber || parcel.id}`}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-[#0F766E] disabled:opacity-50"
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>

                          {updatingId === parcel.id && (
                            <span className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-teal-200 border-t-[#0F766E]" />
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(parcel)}
                            disabled={
                              deletingId === parcel.id ||
                              updatingId === parcel.id
                            }
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            aria-label={`Delete parcel ${parcel.trackingNumber || parcel.id}`}
                            title="Delete parcel"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  Showing {firstParcel}–{lastParcel} of {total} parcels
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    disabled={page === 1 || loading}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="px-2 text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                    disabled={page >= totalPages || loading}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-4 text-sm text-gray-500">
            <FaUsers className="text-[#0F766E]" />
            Parcel data is loaded from the backend API.
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {statusTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          role="presentation"
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              updatingId === null
            ) {
              setStatusTarget(null)
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-title"
            className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 inline-flex rounded-xl bg-teal-50 p-3 text-xl text-[#0F766E]">
              <FaTruckFast />
            </div>

            <h2
              id="status-title"
              className="text-xl font-bold text-[#102A43]"
            >
              Update Parcel Tracking
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Tracking ID: {statusTarget.trackingNumber}
            </p>

            <div className="mt-5 space-y-4">
              {/* Status */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Parcel Status
                </label>

                <select
                  value={statusForm.status}
                  onChange={(event) =>
                    setStatusForm({
                      ...statusForm,
                      status: event.target.value
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 outline-none focus:border-[#0F766E]"
                >
                  {STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FaLocationDot className="text-[#0F766E]" />
                  Current Location
                </label>

                <input
                  type="text"
                  value={statusForm.location}
                  onChange={(event) =>
                    setStatusForm({
                      ...statusForm,
                      location: event.target.value
                    })
                  }
                  placeholder="Example: Chattogram Hub"
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100"
                />
              </div>

              {/* Rider Name */}
              <div>
                <label className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FaUser className="text-[#0F766E]" />
                  Rider Name
                </label>

                <input
                  type="text"
                  value={statusForm.rider_name}
                  onChange={(event) =>
                    setStatusForm({
                      ...statusForm,
                      rider_name: event.target.value
                    })
                  }
                  placeholder="Enter rider name"
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100"
                />
              </div>

              {/* Rider Phone */}
              <div>
                <label className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FaPhone className="text-[#0F766E]" />
                  Rider Phone
                </label>

                <input
                  type="tel"
                  value={statusForm.rider_phone}
                  onChange={(event) =>
                    setStatusForm({
                      ...statusForm,
                      rider_phone: event.target.value
                    })
                  }
                  placeholder="Enter rider phone"
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Tracking Description
                </label>

                <textarea
                  value={statusForm.description}
                  onChange={(event) =>
                    setStatusForm({
                      ...statusForm,
                      description: event.target.value
                    })
                  }
                  placeholder="Example: Parcel arrived at Chattogram Hub."
                  rows={3}
                  className="w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={updatingId !== null}
                onClick={() => setStatusTarget(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={updatingId !== null}
                onClick={updateStatus}
                className="rounded-lg bg-[#0F766E] px-5 py-2 font-semibold text-white transition hover:bg-[#115E59] disabled:opacity-50"
              >
                {updatingId !== null ? 'Updating...' : 'Save Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              deletingId === null
            ) {
              setDeleteTarget(null)
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 inline-flex rounded-xl bg-red-50 p-3 text-xl text-red-600">
              <FaTrash />
            </div>

            <h2
              id="delete-title"
              className="text-xl font-bold text-[#102A43]"
            >
              Delete this parcel?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to delete parcel{' '}
              <strong>
                {deleteTarget.trackingNumber || deleteTarget.id}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deletingId !== null}
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deletingId !== null}
                onClick={deleteParcel}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId !== null ? 'Deleting...' : 'Delete Parcel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


function SummaryCard({ icon, title, value, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className={`mb-4 inline-flex rounded-xl bg-slate-50 p-3 text-2xl ${color}`}>
        {icon}
      </div>

      <p className="text-sm font-medium text-gray-500">{title}</p>

      <h2 className="mt-1 text-3xl font-extrabold text-[#102A43]">
        {value}
      </h2>
    </div>
  )
}


function ParcelStatus({ status }) {
  const styles = {
    Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    'Picked Up': 'bg-cyan-50 text-cyan-700 ring-cyan-200',
    'In Transit': 'bg-blue-50 text-blue-700 ring-blue-200',
    'Ready for Delivery': 'bg-purple-50 text-purple-700 ring-purple-200',
    Delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Cancelled: 'bg-red-50 text-red-700 ring-red-200'
  }

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
        styles[status] || 'bg-slate-100 text-slate-600 ring-slate-200'
      }`}
    >
      {status || 'Unknown'}
    </span>
  )
}

export default AdminDashboard
