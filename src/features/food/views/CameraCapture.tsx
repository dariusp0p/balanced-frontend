import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { X, Camera, RotateCw, Check } from "lucide-react";
import { Button } from "../../../shared/views/ui/button";

export function CameraCapture() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions.");
      console.error("Error accessing camera:", err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/png");
        setCapturedImage(imageData);

        // Stop the camera stream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const usePhoto = () => {
    // Here you would typically send the image to your backend or processing service
    // For now, we'll just navigate back to the dashboard
    navigate("/dashboard");
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    navigate("/dashboard");
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#1E3A5F] text-white px-4 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Scan Food</h1>
        <button
          onClick={handleClose}
          className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {error ? (
          <div className="text-white text-center p-6">
            <p className="mb-4">{error}</p>
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-[#E89B7E] hover:bg-[#D88B6E]"
            >
              Go Back
            </Button>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured food"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="max-w-full max-h-full object-contain"
          />
        )}

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Viewfinder overlay */}
        {!capturedImage && !error && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 border-2 border-white/30 m-8 rounded-lg flex items-center justify-center">
              <p className="text-white text-sm bg-black/50 px-4 py-2 rounded-full">
                Point camera at your food
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {!error && (
        <div className="bg-[#1E3A5F] px-6 py-8 pb-safe">
          {capturedImage ? (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={retake}
                className="flex flex-col items-center gap-2 text-white hover:text-gray-300 transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                  <RotateCw className="w-6 h-6" />
                </div>
                <span className="text-xs">Retake</span>
              </button>
              <button
                onClick={usePhoto}
                className="flex flex-col items-center gap-2 text-white hover:text-gray-300 transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-[#E89B7E] hover:bg-[#D88B6E] flex items-center justify-center">
                  <Check className="w-7 h-7" />
                </div>
                <span className="text-xs">Use Photo</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <button
                onClick={capturePhoto}
                className="w-20 h-20 rounded-full bg-white border-4 border-[#E89B7E] hover:bg-gray-100 transition-all flex items-center justify-center"
              >
                <Camera className="w-8 h-8 text-[#1E3A5F]" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
