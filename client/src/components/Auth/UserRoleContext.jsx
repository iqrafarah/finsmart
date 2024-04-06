import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const UserRoleContext = createContext();

export const UserRoleProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isPathAllowed = () => {
      const allowedBasePaths = [
        "/register",
        "/forgot-password",
        "/new-password",
      ];

      return allowedBasePaths.some((basePath) =>
        location.pathname.startsWith(basePath)
      );
    };

    fetch("http://localhost:3001/user-role", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user.role);
        } else {
          console.error("Error getting user role");

          if (!isPathAllowed()) {
            navigate("/login");
          }
        }
      });
  }, [navigate, location.pathname]);

  return (
    <UserRoleContext.Provider value={user}>{children}</UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  return useContext(UserRoleContext);
};
