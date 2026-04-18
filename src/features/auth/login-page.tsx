import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();

    // mock auth
    if (email === "newuser@example.com" && password === "password123") {
      setError("");
      localStorage.setItem("isAuthenticated", "true");
      navigate("/dashboard");
      return;
    }

    setError("Invalid email or password");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E89B7E] via-[#C97B63] to-[#8B6B7C] p-4">
      <div className="w-full max-w-[280px] bg-white rounded-lg p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Welcome Back
        </h1>

        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-gray-200"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-200"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-[#E89B7E] hover:bg-[#D88B6E] text-white rounded"
          >
            Sign in
          </Button>

          <button
            type="button"
            className="w-full text-sm text-gray-700 hover:underline text-left"
          >
            Forgot password?
          </button>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-[#E89B7E] hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
