export const StatsCard = ({ title, value, icon: Icon, color = 'blue', subtitle, onClick }) => {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/20',
    green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
    orange: 'from-orange-500 to-orange-600 shadow-orange-500/20',
    red: 'from-red-500 to-red-600 shadow-red-500/20',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/20',
    yellow: 'from-amber-500 to-amber-600 shadow-amber-500/20',
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-lg transition-all duration-300 group ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorMap[color]} shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          {Icon && <Icon size={22} className="text-white" />}
        </div>
      </div>
    </div>
  );
};
