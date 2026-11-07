
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FaBox, FaLocationDot, FaArrowLeft, FaWeightHanging } from 'react-icons/fa6'
import { apiRequest } from '../utils/api'

const initialForm = {
  sender_name: '',
  receiver_name: '',
  receiver_phone: '',
  pickup_address: '',
  delivery_address: '',
  category: 'Documents',
  weight: '',
}

function getErrorMessage(data) {
  if (typeof data?.detail === 'string') return data.detail

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => {
        const field = item.loc?.at(-1)
        return field ? `${field}: ${item.msg}` : item.msg
      })
      .join(', ')
  }

  return 'Could not book the parcel. Please check your details.'
}

function BookParcel() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (loading) return

    if (!localStorage.getItem('access_token')) {
      toast.error('Please log in before booking a parcel.')
      navigate('/login')
      return
    }

    const requiredFields = [
      ['sender_name', 'Sender name'],
      ['receiver_name', 'Receiver name'],
      ['receiver_phone', 'Receiver phone'],
      ['pickup_address', 'Pickup address'],
      ['delivery_address', 'Delivery address'],
      ['category', 'Category'],
    ]

    for (const [field, label] of requiredFields) {
      if (!String(form[field] ?? '').trim()) {
        toast.error(`${label} is required.`)
        return
      }
    }

    if (form.sender_name.trim().length < 2 ||
        form.sender_name.trim().length > 100) {
      toast.error('Sender name must be 2–100 characters.')
      return
    }

    if (form.receiver_name.trim().length < 2 ||
        form.receiver_name.trim().length > 100) {
      toast.error('Receiver name must be 2–100 characters.')
      return
    }

    const phone = form.receiver_phone.trim()

    if (phone.length < 7 || phone.length > 20) {
      toast.error('Receiver phone must be 7–20 characters.')
      return
    }
    if (!/^[+0-9()\s-]+$/.test(phone)) {
      toast.error('Please enter a valid phone number.')
      return
    }
    

    if (form.pickup_address.trim().length < 5 ||
        form.pickup_address.trim().length > 255) {
      toast.error('Pickup address must be 5–255 characters.')
      return
    }

    if (form.delivery_address.trim().length < 5 ||
        form.delivery_address.trim().length > 255) {
      toast.error('Delivery address must be 5–255 characters.')
      return
    }

    const weight = Number(form.weight)

    if (!Number.isFinite(weight) || weight <= 0 || weight > 1000) {
      toast.error('Weight must be greater than 0 and no more than 1000 kg.')
      return
    }

    setLoading(true)

    try {
      const payload = {
        sender_name: form.sender_name.trim(),
        receiver_name: form.receiver_name.trim(),
        receiver_phone: phone,
        pickup_address: form.pickup_address.trim(),
        delivery_address: form.delivery_address.trim(),
        category: form.category,
        weight,
      }

      const response = await apiRequest('/parcels/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(getErrorMessage(data))
      }

      toast.success(
        data.tracking_number
          ? `Parcel booked! Tracking ID: ${data.tracking_number}`
          : 'Parcel booked successfully!'
      )

      setForm(initialForm)
      navigate('/dashboard')
    } catch (error) {
      toast.error(
        error.message === 'Failed to fetch'
          ? 'Cannot connect to backend. Please check the server.'
          : error.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-[#102A43] outline-none transition placeholder:text-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100'

  const labelClass = 'mb-2 block text-sm font-semibold text-[#102A43]'

  return (
    <div className="min-h-screen bg-[#F1F5F9] px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0F766E] transition hover:text-[#115E59]"
        >
          <FaArrowLeft /> Back to Dashboard
        </Link>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-[#102A43] px-6 py-8 text-white md:px-10">
            <div className="mb-4 inline-flex rounded-xl bg-white/10 p-3 text-2xl">
              <FaBox />
            </div>

            <h1 className="text-3xl font-extrabold">Book a Parcel</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Enter the sender, receiver and parcel details to create a new shipment.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 p-6 md:p-10">
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#102A43]">
                <FaLocationDot className="text-[#0F766E]" />
                Sender & Receiver
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="sender_name" className={labelClass}>
                    Sender Name *
                  </label>
                  <input
                    id="sender_name"
                    name="sender_name"
                    value={form.sender_name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter sender name"
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="receiver_name" className={labelClass}>
                    Receiver Name *
                  </label>
                  <input
                    id="receiver_name"
                    name="receiver_name"
                    value={form.receiver_name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter receiver name"
                    minLength={2}
                    maxLength={100}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="receiver_phone" className={labelClass}>
                    Receiver Phone *
                  </label>
                  <input
                    id="receiver_phone"
                    name="receiver_phone"
                    type="tel"
                    value={form.receiver_phone}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="01XXXXXXXXX"
                    minLength={7}
                    maxLength={20}
                    autoComplete="tel"
                    disabled={loading}
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Include the country code if needed.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="pickup_address" className={labelClass}>
                    Pickup Address *
                  </label>
                  <textarea
                    id="pickup_address"
                    name="pickup_address"
                    value={form.pickup_address}
                    onChange={handleChange}
                    className={`${inputClass} min-h-24 resize-y`}
                    placeholder="Where should the parcel be collected?"
                    minLength={5}
                    maxLength={255}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="delivery_address" className={labelClass}>
                    Delivery Address *
                  </label>
                  <textarea
                    id="delivery_address"
                    name="delivery_address"
                    value={form.delivery_address}
                    onChange={handleChange}
                    className={`${inputClass} min-h-24 resize-y`}
                    placeholder="Where should the parcel be delivered?"
                    minLength={5}
                    maxLength={255}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-slate-100" />

            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#102A43]">
                <FaWeightHanging className="text-[#0F766E]" />
                Parcel Details
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="category" className={labelClass}>
                    Parcel Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={inputClass}
                    disabled={loading}
                    required
                  >
                    <option value="Documents">Documents</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Food">Food</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="weight" className={labelClass}>
                    Weight (kg) *
                  </label>
                  <input
                    id="weight"
                    name="weight"
                    type="number"
                    value={form.weight}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. 1.5"
                    min="0.1"
                    max="1000"
                    step="0.1"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </section>

            <div className="rounded-xl border border-teal-100 bg-teal-50 p-4 text-sm leading-6 text-teal-900">
              Please review the addresses and receiver phone number before submitting your booking.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#115E59] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Booking Parcel...
                </>
              ) : (
                <>
                  <FaBox /> Submit Parcel Booking
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BookParcel
