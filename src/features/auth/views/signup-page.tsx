import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Button } from "../../../shared/views/ui/button";
import { Input } from "../../../shared/views/ui/input";
import { Label } from "../../../shared/views/ui/label";
import { recoveryQuestions } from "../constants/recoveryQuestions";
import { signup } from "../services/AuthManager";

export function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryQuestion, setRecoveryQuestion] = useState(recoveryQuestions[0]);
  const [recoveryAnswer, setRecoveryAnswer] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await signup({
        name,
        email,
        password,
        confirmPassword,
        recoveryQuestion,
        recoveryAnswer,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E89B7E] via-[#C97B63] to-[#8B6B7C] p-4">
      <div className="w-full max-w-[320px] bg-white rounded-lg p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Create Account
        </h1>

        <form onSubmit={handleSignUp} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-gray-700">
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-gray-200"
              required
            />
          </div>

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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-200"
              required
            />
            <p className="text-xs text-gray-500">
              Use at least 8 characters with letters and numbers.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recoveryQuestion" className="text-sm text-gray-700">
              Recovery Question
            </Label>
            <select
              id="recoveryQuestion"
              name="recoveryQuestion"
              value={recoveryQuestion}
              onChange={(e) => setRecoveryQuestion(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              required
            >
              {recoveryQuestions.map((question) => (
                <option key={question} value={question}>
                  {question}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recoveryAnswer" className="text-sm text-gray-700">
              Recovery Answer
            </Label>
            <Input
              id="recoveryAnswer"
              name="recoveryAnswer"
              type="text"
              placeholder="Write the answer you will remember"
              value={recoveryAnswer}
              onChange={(e) => setRecoveryAnswer(e.target.value)}
              className="w-full bg-white border border-gray-200"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm text-gray-700">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            className="w-full bg-[#E89B7E] hover:bg-[#D88B6E] text-white rounded mt-2"
          >
            Sign up
          </Button>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/"
                className="text-[#E89B7E] hover:underline font-medium"
              >
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
