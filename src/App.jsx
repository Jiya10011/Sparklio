import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import GeneratorForm from './components/GeneratorForm';
import ResultsDisplay from './components/ResultsDisplay';
import HistoryView from './components/HistoryView';
import ApiUsageDashboard from './components/ApiUsageDashboard';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [generatedResult, setGeneratedResult] = useState(null);
  
  // ✅ NEW: API Usage Tracking
  const [dailyApiUsage, setDailyApiUsage] = useState(0);
  const [showDashboard, setShowDashboard] = useState(false);

  // ✅ Load saved usage on mount
  useEffect(() => {
    const loadUsage = () => {
      const today = new Date().toDateString();
      const stored = localStorage.getItem('api-daily-count');
      
      if (stored) {
        try {
          const { date, count } = JSON.parse(stored);
          if (date === today) {
            setDailyApiUsage(count || 0);
            console.log('📊 Loaded usage:', count);
          } else {
            // Different day - reset
            setDailyApiUsage(0);
            localStorage.setItem('api-daily-count', JSON.stringify({ date: today, count: 0 }));
            console.log('🔄 New day - reset usage');
          }
        } catch (e) {
          console.warn('⚠️ Failed to parse usage data');
          setDailyApiUsage(0);
        }
      }
    };

    loadUsage();
  }, []);

  // ✅ Save usage whenever it changes
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem('api-daily-count', JSON.stringify({
      date: today,
      count: dailyApiUsage,
      timestamp: new Date().toISOString()
    }));
  }, [dailyApiUsage]);

  // ✅ Function to increment API usage
  const incrementApiUsage = (count = 5) => {
    setDailyApiUsage(prev => {
      const newCount = prev + count;
      console.log(`📈 API Usage: ${prev} → ${newCount} (+${count})`);
      return newCount;
    });
  };

  const handleStartCreating = () => {
    setCurrentView('generator');
    setGeneratedResult(null);
  };

  const handleResultsGenerated = (result) => {
    setGeneratedResult(result);
    setCurrentView('results');
    
    // ✅ Increment API usage based on number of variations
    const variationCount = result.variations?.length || 1;
    const apiCalls = variationCount * 5; // 5 calls per variation
    incrementApiUsage(apiCalls);
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

  // ✅ Handle opening dashboard
  const handleOpenDashboard = () => {
    setShowDashboard(true);
  };

  // Render based on current view
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage 
          onStartCreating={handleStartCreating}
          onViewHistory={handleViewHistory}
          onOpenDashboard={handleOpenDashboard}
          dailyApiUsage={dailyApiUsage}
        />
        
        {/* Dashboard Modal */}
        {showDashboard && (
          <ApiUsageDashboard
            dailyUsed={dailyApiUsage}
            onClose={() => setShowDashboard(false)}
          />
        )}
      </>
    );
  }

  if (currentView === 'generator') {
    return (
      <>
        <GeneratorForm
          onBack={handleBackToHome}
          onResultsGenerated={handleResultsGenerated}
          onViewHistory={handleViewHistory}
          onOpenDashboard={handleOpenDashboard}
          dailyApiUsage={dailyApiUsage}
        />
        
        {/* Dashboard Modal */}
        {showDashboard && (
          <ApiUsageDashboard
            dailyUsed={dailyApiUsage}
            onClose={() => setShowDashboard(false)}
          />
        )}
      </>
    );
  }

  if (currentView === 'results' && generatedResult) {
    return (
      <>
        <ResultsDisplay
          result={generatedResult}
          onGenerateNew={handleGenerateNew}
          onBack={handleBackToHome}
          onViewHistory={handleViewHistory}
          onOpenDashboard={handleOpenDashboard}
          dailyApiUsage={dailyApiUsage}
        />
        
        {/* Dashboard Modal */}
        {showDashboard && (
          <ApiUsageDashboard
            dailyUsed={dailyApiUsage}
            onClose={() => setShowDashboard(false)}
          />
        )}
      </>
    );
  }

  if (currentView === 'history') {
    return (
      <>
        <HistoryView
          onBack={handleBackToHome}
          onLoadResult={handleLoadFromHistory}
          onGenerateNew={handleGenerateNew}
          onOpenDashboard={handleOpenDashboard}
          dailyApiUsage={dailyApiUsage}
        />
        
        {/* Dashboard Modal */}
        {showDashboard && (
          <ApiUsageDashboard
            dailyUsed={dailyApiUsage}
            onClose={() => setShowDashboard(false)}
          />
        )}
      </>
    );
  }

  // Fallback
  return (
    <>
      <LandingPage 
        onStartCreating={handleStartCreating} 
        onViewHistory={handleViewHistory}
        onOpenDashboard={handleOpenDashboard}
        dailyApiUsage={dailyApiUsage}
      />
      
      {/* Dashboard Modal */}
      {showDashboard && (
        <ApiUsageDashboard
          dailyUsed={dailyApiUsage}
          onClose={() => setShowDashboard(false)}
        />
      )}
    </>
  );
}

export default App;