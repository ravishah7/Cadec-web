import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");
      const error = searchParams.get("error");

      if (error) {
        toast({
          title: "Authentication Error",
          description: "Google authentication failed.",
          variant: "destructive",
        });

        navigate("/", { replace: true });
        return;
      }

      if (!token) {
        navigate("/", { replace: true });
        return;
      }

      try {
        localStorage.setItem("token", token);

        const response = await fetch(`${API}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Invalid token");
        }

        const data = await response.json();

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        await refreshUser();

        toast({
          title: "Success",
          description: "Logged in successfully!",
        });

        navigate("/", { replace: true });
      } catch (error) {
        console.error(error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        toast({
          title: "Authentication Error",
          description: "Unable to complete login.",
          variant: "destructive",
        });

        navigate("/", { replace: true });
      }
    };

    handleCallback();
  }, [navigate, refreshUser, searchParams, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />

        <h2 className="text-xl font-semibold">
          Completing Authentication...
        </h2>

        <p className="text-muted-foreground">
          Please wait while we sign you in...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;