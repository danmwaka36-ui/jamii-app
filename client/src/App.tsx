import AppRouter from "./routes/AppRouter";
import { useAuth } from "./auth/AuthContext";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Loading Jamii App...
      </div>
    );
  }

  return <AppRouter />;
}

export default App;