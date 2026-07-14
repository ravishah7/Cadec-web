import { FormEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth, AuthError } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, MailCheck } from "lucide-react";
import GoogleLoginButton from "./GoogleLoginButton";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<"email_not_verified" | "general" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [lastAttemptedEmail, setLastAttemptedEmail] = useState("");

  // After registering, show a "check your email" screen instead of
  // pretending the user is logged in.
  const [pendingVerification, setPendingVerification] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");

  const { login, register } = useAuth();
  const { toast } = useToast();

  const resetLocalState = () => {
    setError(null);
    setErrorMessage(null);
    setResendSent(false);
    setPendingVerification(false);
    setPendingMessage("");
  };

  const handleClose = () => {
    resetLocalState();
    onClose();
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string).trim();
    const password = formData.get("password") as string;

    setLastAttemptedEmail(email);
    setResendSent(false);

    try {
      await login(email, password);
      setError(null);
      setErrorMessage(null);
      handleClose();
    } catch (err: unknown) {
      if (err instanceof AuthError && err.emailNotVerified) {
        setError("email_not_verified");
        setErrorMessage(err.message);
      } else {
        setError("general");
        setErrorMessage(
          err instanceof Error ? err.message : "Login failed. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    const name = (formData.get("name") as string).trim();
    const email = (formData.get("email") as string).trim();
    const password = formData.get("password") as string;

    setLastAttemptedEmail(email);

    try {
      const result = await register(name, email, password);

      if (result.emailNotVerified) {
        // Don't close the modal or pretend they're logged in —
        // show a clear "check your inbox" screen instead.
        setPendingVerification(true);
        setPendingMessage(result.message);
        setResendSent(false);
      } else {
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
        handleClose();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed";

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendLoading || resendSent || !lastAttemptedEmail) return;

    setResendLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/api/auth/resend-verification-public`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: lastAttemptedEmail }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setResendSent(true);
        setErrorMessage(data.message || "Verification email sent. Please check your inbox.");
        setPendingMessage(data.message || "Verification email sent. Please check your inbox.");
      } else {
        setErrorMessage(data.message || "Unable to resend verification email. Please try again.");
      }
    } catch {
      setErrorMessage("Unable to resend verification email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Welcome to CADEC
          </DialogTitle>
        </DialogHeader>

        {pendingVerification ? (
          /* ── Post-registration "check your email" screen ── */
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <MailCheck className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">Check your inbox</h3>
              <p className="text-sm text-muted-foreground">
                {pendingMessage || "We've sent a verification link to your email."}
              </p>
              <p className="text-xs text-muted-foreground">
                Sent to <span className="font-medium">{lastAttemptedEmail}</span>
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResendVerification}
              disabled={resendLoading || resendSent}
            >
              {resendLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {resendSent
                ? "✓ Verification email sent!"
                : resendLoading
                ? "Sending..."
                : "Resend verification email"}
            </Button>

            <Button type="button" className="w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* Login */}
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      autoComplete="email"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10"
                      autoComplete="current-password"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {error === "email_not_verified" && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-2 dark:bg-amber-900/20 dark:border-amber-800">
                    <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                      Email not verified
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-500">
                      {errorMessage}
                    </p>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading || resendSent}
                      className="text-xs text-amber-800 dark:text-amber-400 underline hover:no-underline disabled:opacity-50"
                    >
                      {resendSent
                        ? "✓ Verification email sent!"
                        : resendLoading
                        ? "Sending..."
                        : "Resend verification email"}
                    </button>
                  </div>
                )}

                {error === "general" && errorMessage && (
                  <p className="text-sm text-destructive">{errorMessage}</p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <GoogleLoginButton />
              </div>
            </TabsContent>

            {/* Register */}
            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="register-name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10"
                      autoComplete="name"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      autoComplete="email"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="register-password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      className="pl-10"
                      autoComplete="new-password"
                      disabled={isLoading}
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <GoogleLoginButton />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;