import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";

function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }

    setOpen(false);

    if (notification.type === "new_order") {
      navigate("/merchant/orders");
    } else if (notification.type === "order_status") {
      navigate("/my-orders");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-xl border border-gray-100 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-500 text-center">
                No notifications yet
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`block w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${
                    !notification.read ? "bg-green-50" : ""
                  }`}
                >
                  <p className="text-sm text-gray-800">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
