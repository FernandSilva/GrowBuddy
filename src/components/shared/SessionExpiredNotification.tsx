import React, { useState, useEffect } from "react";
import { useSignOutAccount } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

type SessionExpiredNotificationProps = {
  title?: string;
  message: string;
};

const SessionExpiredNotification: React.FC<SessionExpiredNotificationProps> = ({
  title = "⚠️ Session Expired",
  message,
}) => {
  const [visible, setVisible] = useState(true);
  const { setIsAuthenticated, setUser } = useUserContext();
  const { mutate: signOut } = useSignOutAccount();

  // ✅ Auto-dismiss after 20 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 4000); // 20 seconds
    return () => clearTimeout(timer); // Clean up
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = "/sign-in"; // Redirect to login
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!visible) return null;

  return (
    <div className="w-full max-w-md mx-auto my-4">
      <div className="bg-yellow-500 text-white py-3 px-4 rounded flex items-center justify-between shadow-md">
        <span className="font-semibold">{title}</span>
        <button
          onClick={() => setVisible(false)}
          className="text-white text-lg font-bold cursor-pointer"
        >
          ✖
        </button>
      </div>
      <div className="bg-yellow-100 text-yellow-900 p-4 rounded-b shadow-sm">
        <p className="font-bold mb-2">System Login Error</p>
        <p>{message}</p>
        <div className="mt-3 text-right">
          {/* <Button onClick={handleLogout} className="bg-yellow-600 text-white">
            Logout & Re-login
          </Button> */}
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredNotification;
