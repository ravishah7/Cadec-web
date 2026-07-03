import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

const CustomAppLoginButton = () => {
  const [loading, setLoading] = useState(false);

  const handleCustomAppLogin = () => {
    if (loading) return;

    setLoading(true);

    const apiUrl =
      import.meta.env.VITE_API_URL?.trim() ||
      "http://localhost:5000";

    window.location.assign(`${apiUrl}/api/auth/custom-app`);
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleCustomAppLogin}
      disabled={loading}
    >
      <Users
        aria-hidden="true"
        className="mr-2 h-4 w-4"
      />
      {loading ? "Redirecting..." : "Continue with CADEC"}
    </Button>
  );
};

export default CustomAppLoginButton;