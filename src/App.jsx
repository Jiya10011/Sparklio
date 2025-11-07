import { useState } from 'react';
import LandingPage from './components/LandingPage';
import GeneratorForm from './components/GeneratorForm';
import ResultsDisplay from './components/ResultsDisplay';
import HistoryView from './components/HistoryView';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'generator', 'results', 'history'
  const [generatedResult, setGeneratedResult] = useState(null);

  const handleStartCreating = () => {
    setCurrentView('generator');
    setGeneratedResult(null);
  };

  const handleResultsGenerated = (result) => {
    setGeneratedResult(result);
    setCurrentView('results');
  };

  const handleGenerateNew = () => {
    setCurrentView('generator');
    setGeneratedResult(null);
  };

  const handleBackToHome = () => {
    setCurrentView('landing');
    setGeneratedResult(null);
  };

  const handleViewHistory = () => {
    setCurrentView('history');
    setGeneratedResult(null);
  };

  const handleLoadFromHistory = (result) => {
    setGeneratedResult(result);
    setCurrentView('results');
  };

  // Render based on current view
  if (currentView === 'landing') {
    return (
      <LandingPage 
        onStartCreating={handleStartCreating}
        onViewHistory={handleViewHistory}
      />
    );
  }

  if (currentView === 'generator') {
    return (
      <GeneratorForm
        onBack={handleBackToHome}
        onResultsGenerated={handleResultsGenerated}
        onViewHistory={handleViewHistory}
      />
    );
  }

  if (currentView === 'results' && generatedResult) {
    return (
      <ResultsDisplay
        result={generatedResult}
        onGenerateNew={handleGenerateNew}
        onBack={handleBackToHome}
        onViewHistory={handleViewHistory}
      />
    );
  }

  if (currentView === 'history') {
    return (
      <HistoryView
        onBack={handleBackToHome}
        onLoadResult={handleLoadFromHistory}
        onGenerateNew={handleGenerateNew}
      />
    );
  }

  // Fallback
  return <LandingPage onStartCreating={handleStartCreating} onViewHistory={handleViewHistory} />;
}

export default App;