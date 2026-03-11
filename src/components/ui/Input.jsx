export default function Input({
    label,
    error,
    className = '',
    ...props
}) {
    return (
        <div className="flex flex-col gap-1">

            {label && (
                <label className="text-sm font-medium text-gray-700">
                    {label}
                    {props.required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <input
                className={`
          w-full px-3 py-2 text-sm rounded-lg border transition-colors
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
          ${error
                        ? 'border-red-400 bg-red-50 focus:ring-red-400'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }
          ${className}
        `}
                {...props}
            />

            {error && (
                <span className="text-xs text-red-500">{error}</span>
            )}

        </div>
    )
}