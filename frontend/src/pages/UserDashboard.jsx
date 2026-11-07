
import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  FaBox,
  FaTruckFast,
  FaCircleCheck,
  FaClock,
  FaPlus,
  FaMagnifyingGlass,
  FaArrowUpWideShort,
  FaRotate
} from 'react-icons/fa6'
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

function getErrorMessage(data, fallback) {
  if (typeof data?.detail === 'string') return data.detail

  if (Array.isArray(data?.detail)) {
    return data.detail.map((item) => item.msg).join(', ')
  }

  return fallback
}

function UserDashboard() {
  const [parcels, setParcels] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('newest')
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const fetchParcels = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      if (!localStorage.getItem('access_token')) {
        throw new Error('Please log in to view your parcels.')
      }

      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        sort_by: 'created_at',
        order: sortOrder === 'newest' ? 'desc' : 'asc',
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
          getErrorMessage(data, 'Failed to load your parcels.')
        )
      }

      const list = Array.isArray(data.parcels)
        ? data.parcels
        : Array.isArray(data)
          ? data
          : []

      setParcels(list)
      setTotal(Number(data.total ?? list.length) || 0)
    } catch (err) {
      setParcels([])
      setTotal(0)
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
          year: 'numeric',
        })
  }

  const firstParcel = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const lastParcel = Math.min(page * PAGE_SIZE, total)

  const countStatus = (status) =>
    parcels.filter(
      (parcel) => parcel.status?.toLowerCase() === status.toLowerCase()
    ).length

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#0F766E]">
              User Dashboard
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-[#102A43]">
              My Parcels
            </h1>
            <p className="mt-2 text-gray-500">
              Manage and track your shipments from one place.
            </p>
          </div>

          <Link
            to="/book-parcel"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#115E59]"
          >
            <FaPlus /> Book a Parcel
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={<FaBox />}
            title="Matching Parcels"
            value={total}
            color="text-[#0F766E]"
          />
          <SummaryCard
            icon={<FaClock />}
            title="Pending (This Page)"
            value={countStatus('Pending')}
            color="text-amber-600"
          />
          <SummaryCard
            icon={<FaTruckFast />}
            title="In Transit (This Page)"
            value={countStatus('In Transit')}
            color="text-blue-600"
          />
          <SummaryCard
            icon={<FaCircleCheck />}
            title="Delivered (This Page)"
            value={countStatus('Delivered')}
            color="text-emerald-600"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#102A43]">
                My Shipments
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Search, filter and view your parcel details.
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

              <Link
                to="/track"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#0F766E] px-4 py-2 text-sm font-semibold text-[#0F766E] transition hover:bg-teal-50"
              >
                <FaMagnifyingGlass /> Track a Parcel
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 lg:p-6">
            <div className="relative">
              <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => changeSearch(event.target.value)}
                placeholder="Search tracking ID or address..."
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
                <option key={status} value={status}>{status}</option>
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

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <span className="h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-[#0F766E]" />
              <p className="mt-4 text-sm text-gray-500">
                Loading your parcels...
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
                Try Again
              </button>
            </div>
          ) : parcels.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <FaBox className="mx-auto mb-4 text-4xl text-slate-300" />
              <h3 className="font-bold text-[#102A43]">
                {search || statusFilter !== 'All'
                  ? 'No matching parcels'
                  : 'No parcels yet'}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {search || statusFilter !== 'All'
                  ? 'Try changing your search or status filter.'
                  : 'Your booked parcels will appear here.'}
              </p>

              {search || statusFilter !== 'All' ? (
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
              ) : (
                <Link
                  to="/book-parcel"
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#115E59]"
                >
                  <FaPlus /> Book Your First Parcel
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#102A43] text-xs uppercase tracking-wider text-white">
                    <tr>
                      <th className="px-5 py-4">Tracking ID</th>
                      <th className="px-5 py-4">Destination</th>
                      <th className="px-5 py-4">Booking Date</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {parcels.map((parcel) => (
                      <tr key={parcel.id} className="transition hover:bg-slate-50">
                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#102A43]">
                          {parcel.tracking_number || 'N/A'}
                        </td>
                        <td className="min-w-48 px-5 py-4 text-gray-600">
                          {parcel.delivery_address || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                          {formatDate(parcel.created_at)}
                        </td>
                        <td className="px-5 py-4">
                          <ParcelStatus status={parcel.status} />
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            to={`/track?tracking=${encodeURIComponent(parcel.tracking_number || '')}`}
                            className="rounded-lg px-3 py-2 font-semibold text-[#0F766E] transition hover:bg-teal-50"
                          >
                            Track
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  Showing {firstParcel}–{lastParcel} of {total} parcels
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1 || loading}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-[#102A43] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="px-2 text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page >= totalPages || loading}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-[#102A43] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
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
      <h2 className="mt-1 text-3xl font-extrabold text-[#102A43]">{value}</h2>
    </div>
  )
}

function ParcelStatus({ status }) {
  const styles = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    'in transit': 'bg-blue-50 text-blue-700 ring-blue-200',
    'picked up': 'bg-cyan-50 text-cyan-700 ring-cyan-200',
    'ready for delivery': 'bg-purple-50 text-purple-700 ring-purple-200',
    delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    cancelled: 'bg-red-50 text-red-700 ring-red-200',
  }

  const normalized = status?.toLowerCase() || ''

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
        styles[normalized] || 'bg-slate-100 text-slate-600 ring-slate-200'
      }`}
    >
      {status || 'Unknown'}
    </span>
  )
}

export default UserDashboard
