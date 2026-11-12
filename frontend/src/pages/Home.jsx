
import { Link } from 'react-router-dom'
import { FaBox, FaTruckFast, FaLocationDot, FaShieldHalved, FaArrowRight } from 'react-icons/fa6'

function Home() {
  return (
    <div className="bg-[#F1F5F9]">
      <section className="relative overflow-hidden bg-linear-to-br from-[#102A43] via-[#163B5C] to-[#0F766E] text-white">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:px-10 md:py-28">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-white/10 px-4 py-2 text-sm font-semibold tracking-wide text-teal-200">
              <FaTruckFast /> PARCELIX — SMART COURIER & DELIVERY
            </p>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Your Parcel,<span className="text-teal-300"> Our Priority.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-slate-200 md:text-lg">
              Book parcels, track deliveries, and manage your shipments from one simple and reliable platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/book-parcel" className="btn border-none bg-teal-500 text-white shadow-lg hover:bg-teal-600">
                <FaBox /> Book a Parcel
              </Link>
              <Link to="/track" className="btn border border-white/40 bg-white/5 text-white hover:border-white hover:bg-white hover:text-[#102A43]">
                Track Shipment <FaArrowRight />
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-200">
              <span className="flex items-center gap-2"><FaShieldHalved className="text-teal-300" /> Secure booking</span>
              <span className="flex items-center gap-2"><FaLocationDot className="text-teal-300" /> Easy tracking</span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-sm md:p-7">
            <div className="rounded-2xl bg-white p-6 text-[#102A43] shadow-xl md:p-9">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <FaTruckFast className="text-4xl" />
              </div>

              <p className="mb-2 text-sm font-bold uppercase tracking-wider text-teal-700">Reliable Delivery</p>
              <h2 className="text-2xl font-bold md:text-3xl">Delivery made simple</h2>
              <p className="mt-3 leading-7 text-slate-600">
                From booking to delivery, follow your parcel at every step with Parcelix.
              </p>

              <div className="my-6 border-t border-slate-200" />

              <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                  <FaLocationDot className="text-xl" />
                </div>
                <div>
                  <p className="font-semibold">Delivery Updates</p>
                  <p className="mt-1 text-sm text-slate-500">Check your parcel status using its tracking ID.</p>
                </div>
                <FaArrowRight className="ml-auto shrink-0 text-teal-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-teal-700">Our Features</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#102A43] md:text-4xl">Everything You Need</h2>
          <p className="mt-4 leading-7 text-slate-600">Simple tools for convenient and reliable parcel delivery.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon={<FaBox />} title="Easy Parcel Booking" description="Submit parcel details and create a delivery request with ease." />
          <Feature icon={<FaLocationDot />} title="Parcel Tracking" description="Check your latest delivery status using your tracking ID." />
          <Feature icon={<FaShieldHalved />} title="Secure Management" description="Access your account through protected authentication." />
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-5 rounded-2xl bg-[#102A43] p-7 text-center text-white shadow-lg sm:flex-row sm:text-left md:p-10">
          <div>
            <h2 className="text-2xl font-bold">Ready to send a parcel?</h2>
            <p className="mt-2 text-slate-300">Start your delivery journey with Parcelix.</p>
          </div>
          <Link to="/track" className="btn border-none bg-teal-500 text-white hover:bg-teal-600">
            Track Your Parcel <FaArrowRight />
          </Link>
        </div>
      </section>
    </div>
  )
}

function Feature({ icon, title, description }) {
  return (
    <div className="card border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl">
      <div className="card-body">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-2xl text-teal-700">{icon}</div>
        <h3 className="card-title text-lg text-[#102A43]">{title}</h3>
        <p className="leading-7 text-slate-600">{description}</p>
      </div>
    </div>
  )
}

export default Home
