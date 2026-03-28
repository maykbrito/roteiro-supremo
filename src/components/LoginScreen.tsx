// src/components/LoginScreen.tsx
import { useAuthActions } from "@convex-dev/auth/react";

export function LoginScreen() {
  const { signIn } = useAuthActions();

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-zinc-100">
            Roteiro Supremo
          </h1>
          <p className="mt-2 text-zinc-500">
            Crie roteiros incriveis para seus videos
          </p>
        </div>
        <button
          type="button"
          onClick={() => void signIn("google")}
          className="px-6 py-3 bg-lime-500 text-zinc-950 font-semibold rounded-lg hover:bg-lime-400 transition-colors text-base"
        >
          Entrar com Google
        </button>
      </div>
    </div>
  );
}
