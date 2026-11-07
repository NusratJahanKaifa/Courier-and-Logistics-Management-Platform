function Logo({ className = '', markClassName = '', textClassName = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500 text-white shadow-md ${markClassName}`}>
        <svg
          viewBox="0 0 48 48"
          className="h-7 w-7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M7 15.5 24 7l17 8.5v17L24 41 7 32.5v-17Z" stroke="currentColor" strokeWidth="2.8" strokeLinejoin="round" />
          <path d="m7.8 15.8 16.2 8.4 16.2-8.4M24 24.2V40" stroke="currentColor" strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M15 20.2h10.5m-3.5-3.5 3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className={`font-extrabold tracking-tight text-xl ${textClassName}`}>
        Courier<span className="text-teal-400">Connect</span>
      </span>
    </span>
  )
}

export default Logo
