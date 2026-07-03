import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";

const GoogleLoginButton = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    if (loading) return;

    setLoading(true);

    const apiUrl =
      import.meta.env.VITE_API_URL?.trim() ||
      "http://localhost:5000";

    window.location.assign(`${apiUrl}/api/auth/google`);
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGoogleLogin}
      disabled={loading}
    >
      <Chrome
        aria-hidden="true"
        className="mr-2 h-4 w-4"
      />
      {loading ? "Redirecting..." : "Continue with Google"}
    </Button>
  );
};

export default GoogleLoginButton;