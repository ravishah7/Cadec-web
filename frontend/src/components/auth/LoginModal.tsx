import { useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User } from "lucide-react";
import GoogleLoginButton from "./GoogleLoginButton";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    const email = (formData.get("email") as string).trim();
    const password = formData.get("password") as string;

    try {
      await login(email, password);

      toast({
        title: "Success",
        description: "Logged in successfully!",
      });

      onClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Login failed";

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    const name = (formData.get("name") as string).trim();
    const email = (formData.get("email") as string).trim();
    const password = formData.get("password") as string;

    try {
      await register(name, email, password);

      toast({
        title: "Success",
        description: "Account created successfully!",
      });

      onClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Registration failed";

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Welcome to CADEC
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">
              Login
            </TabsTrigger>
            <TabsTrigger value="register">
              Register
            </TabsTrigger>
          </TabsList>

          {/* Login */}
          <TabsContent
            value="login"
            className="space-y-4"
          >
            <form
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="login-email">
                  Email
                </Label>

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
                <Label htmlFor="login-password">
                  Password
                </Label>

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

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}

                {isLoading
                  ? "Logging in..."
                  : "Login"}
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
          <TabsContent
            value="register"
            className="space-y-4"
          >
            <form
              onSubmit={handleRegister}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="register-name">
                  Full Name
                </Label>

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
                <Label htmlFor="register-email">
                  Email
                </Label>

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
                <Label htmlFor="register-password">
                  Password
                </Label>

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
                    minLength={8}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}

                {isLoading
                  ? "Creating Account..."
                  : "Create Account"}
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
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;