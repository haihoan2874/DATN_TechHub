import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ScrollToTop from './components/common/ScrollToTop';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <AppRoutes />
          <Toaster
            position="bottom-right"
            containerStyle={{
              bottom: 96,
              right: 24
            }}
            toastOptions={{
              duration: 2600,
              className: 'text-sm font-semibold',
              success: { duration: 2200 },
              error: { duration: 3600 }
            }}
          />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}


export default App;
