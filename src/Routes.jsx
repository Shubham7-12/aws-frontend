import React, { useEffect } from "react";
import { useNavigate, useRoutes } from "react-router-dom";

// Pages List
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/login.jsx";
import Signup from "./components/auth/Signup";
import CreateRepository from "./components/repository/CreateRepository";

import RepositoryDetails from "./components/repository/RepositoryDetails";

// Auth Context
import { useAuth } from "./authContext";

const ProjectRoutes = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const userIdFromStorage = localStorage.getItem("userId");

    if (userIdFromStorage && !currentUser) {
      setCurrentUser(userIdFromStorage);
    }

    const currentPath = window.location.pathname;

    const isPublicRoute =
      currentPath === "/auth" ||
      currentPath === "/signup" ||
      currentPath.startsWith("/repo/");

    if (!userIdFromStorage && !isPublicRoute) {
      navigate("/auth");
    }
    if (userIdFromStorage && window.location.pathname == "/auth") {
      navigate("/");
    }
  }, [currentUser, navigate, setCurrentUser]);

  let element = useRoutes([
    {
      path: "/",
      element: <Dashboard />,
    },
    {
      path: "/auth",
      element: <Login />,
    },
    {
      path: "/signup",
      element: <Signup />,
    },
    {
      path: "/profile",
      element: <Profile />,
    },
    {
      path: "/create",
      element: <CreateRepository />,
    },
    {
      path: "/repo/:id",
      element: <RepositoryDetails />,
    },
  ]);

  return element;
};

export default ProjectRoutes;
