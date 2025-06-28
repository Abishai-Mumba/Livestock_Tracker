const isTokenExpired = () => {
      const expiry = localStorage.getItem('tokenExpiry');
      if (!expiry) return true;

      const now = Date.now();
      if (now >= parseInt(expiry, 10)) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('tokenExpiry');
        console.log('Token expired and removed');
        // Optional: Redirect user to login or show expired message
      }
      return now >= parseInt(expiry, 10);
};

export default isTokenExpired;