import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const PrivateRoute = ({ isAuthenticated, children }) => {
  const location = useLocation();
  
  useEffect(() => {
    // Scroll main content area to top when route changes
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  }, [location]);

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute; 