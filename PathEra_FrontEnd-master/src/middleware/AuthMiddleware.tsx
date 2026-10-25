import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { PropsWithChildren } from "react";
import LoadingIcon from "@/components/LoadingIcon";

const AuthMiddleware = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const [user, , loading] = useUser();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingIcon />
      </div>
    );
  }

  if (user === null) {
    // Remember where the user was heading so login can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export default AuthMiddleware;
