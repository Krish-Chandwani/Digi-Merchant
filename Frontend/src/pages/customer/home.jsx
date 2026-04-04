import api from "../../api/axios";
import { useEffect, useState } from "react";
import ShopCard from "../../components/ShopCard";

const Home = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await api.get("/shops");
        console.log("Fetched shops:", response.data.shops);
        setShops(response.data.shops);
        }catch (error) {
        console.error("Error fetching shops:", error);
        } finally {
        setLoading(false);
        }
    };
    fetchShops();
  }, []);

    if (loading) {
    return <div className="p-6">Loading...</div>;
  }

    return (
    <div className="p-6">   
        <h1 className="text-2xl font-bold mb-4">Shops</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops.map((shop) => (
            <ShopCard key={shop._id} shop={shop} />
        ))}
        </div>
    </div>
    );
}

export default Home;