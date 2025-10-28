// React import not needed with new JSX transform
import { ThemeProvider } from "./contexts";
import { AppLayout } from "./components";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <AppLayout />
    </ThemeProvider>
  );
}

export default App;
