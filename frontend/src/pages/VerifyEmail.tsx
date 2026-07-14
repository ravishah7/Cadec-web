import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type State = "loading" | "success" | "error" | "already-verified";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setState("error");
      setMessage("No verification token found in the link.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/auth/verify-email?token=${token}`
        );
        const data = await res.json();

        if (!res.ok) {
          setState("error");
          setMessage(data.message || "Verification failed.");
          return;
        }

        if (data.alreadyVerified) {
          setState("already-verified");
          setMessage(data.message);
          return;
        }

        // Set auth state + localStorage together, in sync, rather than
        // writing localStorage directly and hoping context catches up.
        if (data.token && data.user) {
          loginWithToken(data.token, data.user);
        }

        setState("success");
        setMessage(data.message);
      } catch {
        setState("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            {state === "loading" && (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            )}
            {state === "success" && (
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            )}
            {state === "already-verified" && (
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
            )}
            {state === "error" && (
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            )}
          </div>

          <CardTitle className="text-xl">
            {state === "loading" && "Verifying your email..."}
            {state === "success" && "Email Verified!"}
            {state === "already-verified" && "Already Verified"}
            {state === "error" && "Verification Failed"}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          {state !== "loading" && (
            <p className="text-muted-foreground text-sm">{message}</p>
          )}

          {state === "success" && (
            <Button className="w-full" onClick={() => navigate("/")}>
              Go to Home
            </Button>
          )}

          {state === "error" && (
            <div className="space-y-2">
              <Button className="w-full" onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </div>
          )}

          {state === "already-verified" && (
            <Button className="w-full" onClick={() => navigate("/")}>
              Go to Home
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;