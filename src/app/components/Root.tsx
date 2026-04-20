import { Outlet } from 'react-router';
import { AppProvider } from '../context/AppContext';
import { ThemeProvider } from '../context/ThemeContext';
import { Toaster } from './ui/sonner';
import { GoldCurvesBackgroundWrapper } from './GoldCurvesBackgroundWrapper';

export function Root() {
  return (
    <ThemeProvider>
      <AppProvider>
        <GoldCurvesBackgroundWrapper />
        <Outlet />
        <Toaster />
      </AppProvider>
    </ThemeProvider>
  );
}
