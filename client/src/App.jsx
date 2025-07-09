import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'


//components
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import isTokenExpired from './services/isTokenExpired'
import Map from './components/Map'

function App() {
  const [isExpired, setIsExpired] = useState(isTokenExpired());
  const navigate = useNavigate();
  const location = useLocation();

  

  // Only run useEffect if not on the signup route
  useEffect(() => {
    // If the user is on the signup page, do not check token expiration
    // This prevents redirecting to signin when the user is signing up
    if (location.pathname === '/signup' || location.pathname === '/signin') {
      return;
    }
    const expired = isTokenExpired();
    setIsExpired(expired);
    if (expired) {
      navigate('/signin');
    }
  }, [navigate]);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </div>
  );
}

export default App
