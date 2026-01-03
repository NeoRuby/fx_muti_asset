
import React, { useState } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import DurationChart from './components/DurationChart';
import ResearchReports from './components/ResearchReports';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState('duration');

  const handleLogin = (user: string) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogout={handleLogout} 
      username={username}
    >
      {activeTab === 'duration' ? <DurationChart /> : <ResearchReports />}
    </Layout>
  );
};

export default App;
