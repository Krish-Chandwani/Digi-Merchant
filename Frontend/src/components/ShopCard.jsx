import { useNavigate } from "react-router-dom";

const ShopCard = ({ shop }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/shops/${shop._id}`)}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer"
    >
      {/* 🔥 Banner */}
      <div className="h-32 w-full bg-gray-200">
        <img
          src={
            shop.banner ||
            "https://via.placeholder.com/400x150?text=Shop+Banner"
          }
          alt={shop.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 🔥 Content */}
      <div className="p-4 relative">
        {/* 🔥 Logo */}
        <div className="absolute -top-10 left-4">
          <img
            src={
              shop.logo ||
              "https://via.placeholder.com/80?text=Logo"
            }
            alt="logo"
            className="w-16 h-16 rounded-full border-4 border-white object-cover shadow"
          />
        </div>

        {/* 🔥 Info */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800">
            {shop.name}
          </h2>

          <p className="text-gray-500 text-sm mt-1 line-clamp-1">
            {shop.address}
          </p>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full">
              {shop.category || "General"}
            </span>

            <span
              className={`text-xs px-3 py-1 rounded-full ${
                shop.isOpen
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {shop.isOpen ? "Open" : "Closed"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;