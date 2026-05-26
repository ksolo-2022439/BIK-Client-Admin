import { AppRouter } from './app/router/AppRouter';
import { ErrorBoundary } from './shared/components/ErrorBoundary';

export const App = () => {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
};

export default App;
