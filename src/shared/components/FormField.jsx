export const FormField = ({ label, icon: Icon, type = "text", error, className = "", ...props }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon size={18} className="text-gray-400" />
          </div>
        )}
        {type === 'textarea' ? (
          <textarea
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-gray-50 dark:bg-gray-700 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-bik-blue focus:border-bik-blue'} text-gray-900 dark:text-white rounded-lg transition-colors`}
            {...props}
          />
        ) : type === 'select' ? (
          <select
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-gray-50 dark:bg-gray-700 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-bik-blue focus:border-bik-blue'} text-gray-900 dark:text-white rounded-lg transition-colors appearance-none`}
            {...props}
          >
            {props.children}
          </select>
        ) : (
          <input
            type={type}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-gray-50 dark:bg-gray-700 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-bik-blue focus:border-bik-blue'} text-gray-900 dark:text-white rounded-lg transition-colors`}
            {...props}
          />
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};
