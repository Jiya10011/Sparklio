import { useState } from 'react';
import LandingPage from './components/LandingPage';
import GeneratorForm from './components/GeneratorForm';
import ResultsDisplay from './components/ResultsDisplay';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'generator', 'results'
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

  // Render based on current view
  if (currentView === 'landing') {
    return <LandingPage onStartCreating={handleStartCreating} />;
  }

  if (currentView === 'generator') {
    return (
      <GeneratorForm 
        onBack={handleBackToHome}
        onResultsGenerated={handleResultsGenerated}
      />
    );
  }

  if (currentView === 'results' && generatedResult) {
    return (
      <ResultsDisplay
        result={generatedResult}
        onGenerateNew={handleGenerateNew}
        onBack={handleBackToHome}
      />
    );
  }

  // Fallback
  return <LandingPage onStartCreating={handleStartCreating} />;
}

export default App;