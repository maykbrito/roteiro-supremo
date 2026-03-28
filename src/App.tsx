// src/App.tsx
import { useConvexAuth } from "convex/react";
import { Route, Switch } from "wouter";
import { Dashboard } from "./components/Dashboard";
import { Editor } from "./components/Editor";
import { LoginScreen } from "./components/LoginScreen";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <Switch>
      <Route path="/">
        <Dashboard />
      </Route>
      <Route<{ scriptId: string }> path="/editor/:scriptId">
        {(params) => (
          <Editor scriptId={params.scriptId as Id<"scripts">} />
        )}
      </Route>
    </Switch>
  );
}
