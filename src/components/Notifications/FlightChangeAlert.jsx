import { useFlightNotifications } from '../../hooks/useFlightNotifications';

export default function FlightChangeAlert({ userId }) {
  const { notifications, dismissNotification } = useFlightNotifications(userId);
  
  if (notifications.length === 0) return null;
  
  return (
    <div className="fixed top-20 right-5 z-[10000] flex flex-col gap-4">
      {notifications.map((notif) => (
        <div 
          key={notif.timestamp}
          className={`bg-white rounded-xl shadow-2xl p-5 w-96 animate-slideIn border-l-8 ${
            notif.severity === 'critical' ? 'border-red-500 animate-pulse-shadow' : 'border-orange-500'
          }`}
          role="alert"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xl font-bold flex items-center gap-2 text-black">
              {notif.severity === 'critical' ? '🚨' : '⚠️'} Flight Update
            </span>
            <button 
              onClick={() => dismissNotification(notif.timestamp)}
              className="text-gray-400 hover:text-black transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="text-gray-800">
            <p className="font-semibold text-lg mb-2">Flight {notif.flight_number}</p>
            
            {notif.changes.gate && (
              <p className="mb-2">
                Gate: <strike className="text-gray-400 mr-2">{notif.changes.gate.old}</strike> → 
                <strong className="text-blue-600 text-lg ml-2">{notif.changes.gate.new}</strong>
              </p>
            )}
            
            {notif.changes.terminal && (
              <p className="mb-2 text-red-600 font-semibold">
                Terminal: <strike className="text-red-300 mr-2">{notif.changes.terminal.old}</strike> → 
                <strong className="text-xl ml-2">{notif.changes.terminal.new}</strong>
              </p>
            )}
            
            {notif.changes.status && (
              <p className="mb-2">
                Status: <strike className="text-gray-400 mr-2">{notif.changes.status.old}</strike> → 
                <strong className="text-orange-500 ml-2">{notif.changes.status.new}</strong>
              </p>
            )}
            
            <p className="mt-4 p-3 bg-gray-100 rounded-lg text-sm font-medium border border-gray-200">
              {notif.action_required}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
