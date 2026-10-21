import AppRoutes from './routes/AppRoutes';
import A11yShell from './components/A11yShell';
import ErrorBoundary from './components/ErrorBoundary';
import { initDialogAccessibility } from './a11y/dialogs';
import './a11y.css';

initDialogAccessibility();

function App() {
  return (
    <ErrorBoundary>
      <A11yShell>
        <AppRoutes />
      </A11yShell>
    </ErrorBoundary>
  );
}

export default App;
