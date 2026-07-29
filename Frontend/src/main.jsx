import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {  BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/auth.provider.jsx';
import { CartProvider } from './context/cart.provider.jsx';
import { NotificationProvider } from './context/notification.provider.jsx';
import { FavouritesProvider } from './context/favourites.provider.jsx';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <FavouritesProvider>
            <App />
            <Toaster
              position="bottom-left"
              toastOptions={{
                duration: 3000,
                style: { borderRadius: "12px", fontSize: "14px" },
                success: {
                  style: { background: "#ecfdf5", color: "#166534" },
                },
                error: {
                  style: { background: "#fef2f2", color: "#991b1b" },
                },
              }}
            />
          </FavouritesProvider>
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>,
)
