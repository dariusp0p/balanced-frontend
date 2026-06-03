import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../../../shared/views/ui/button";
import { Input } from "../../../shared/views/ui/input";
import { Label } from "../../../shared/views/ui/label";
import {
  fetchRecoveryQuestion,
  recoverPassword,
} from "../services/AuthManager";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [recoveryQuestion, setRecoveryQuestion] = useState("");
  const [recoveryAnswer, setRecoveryAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLoadQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoadingQuestion(true);

    try {
      const response = await fetchRecoveryQuestion({ email });
      setRecoveryQuestion(response.recoveryQuestion);
      setInfo("Answer your recovery question to set a new password.");
    } catch (err) {
      setRecoveryQuestion("");
      setError(err instanceof Error ? err.message : "Unable to load recovery question.");
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);

    try {
      await recoverPassword({
        email,
        recoveryAnswer,
        newPassword,
        confirmPassword,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E89B7E] via-[#C97B63] to-[#8B6B7C] p-4">
      <div className="w-full max-w-[360px] bg-white rounded-lg p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-gray-900 mb-3 text-center">
          Recover Password
        </h1>
        <p className="mb-6 text-center text-sm text-gray-600">
          Use your signup recovery question to regain access.
        </p>

        <form
          onSubmit={recoveryQuestion ? handleResetPassword : handleLoadQuestion}
          className="space-y-5"
        >
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

          {recoveryQuestion ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="recoveryQuestion" className="text-sm text-gray-700">
                  Recovery Question
                </Label>
                <Input
                  id="recoveryQuestion"
                  name="recoveryQuestion"
                  type="text"
                  value={recoveryQuestion}
                  readOnly
                  className="w-full bg-gray-50 border border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recoveryAnswer" className="text-sm text-gray-700">
                  Recovery Answer
                </Label>
                <Input
                  id="recoveryAnswer"
                  name="recoveryAnswer"
                  type="text"
                  placeholder="Type your answer"
                  value={recoveryAnswer}
                  onChange={(e) => setRecoveryAnswer(e.target.value)}
                  className="w-full bg-white border border-gray-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm text-gray-700">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Create a new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm text-gray-700">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm the new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200"
                  required
                />
              </div>
            </>
          ) : null}

          {info ? (
            <p className="text-sm text-emerald-700" role="status">
              {info}
            </p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            className="w-full bg-[#E89B7E] hover:bg-[#D88B6E] text-white rounded"
            disabled={loadingQuestion || submitting}
          >
            {recoveryQuestion
              ? submitting
                ? "Resetting..."
                : "Reset Password"
              : loadingQuestion
                ? "Loading..."
                : "Load Recovery Question"}
          </Button>

          <div className="text-center pt-2">
            <Link to="/" className="text-sm text-[#E89B7E] hover:underline font-medium">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
