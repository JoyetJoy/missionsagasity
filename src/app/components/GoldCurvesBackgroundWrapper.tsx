import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { GoldCurvesBackground } from './GoldCurvesBackground';

export function GoldCurvesBackgroundWrapper() {
  const context = useContext(AppContext);
  if (!context || !context.currentUser) return null;
  return <GoldCurvesBackground />;
}