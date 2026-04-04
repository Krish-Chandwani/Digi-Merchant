import { useNavigate } from "react-router-dom";

const ShopCard = ({ shop }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/shops/${shop._id}`)}
      className="p-4 border rounded-xl shadow hover:shadow-lg cursor-pointer transition"
    >
      <h2 className="text-xl font-semibold">{shop.name}</h2>
      <p className="text-gray-600">{shop.address}</p>
      <p className="text-sm text-green-600 mt-2">{shop.category}</p>
    </div>
  );
};

export default ShopCard;