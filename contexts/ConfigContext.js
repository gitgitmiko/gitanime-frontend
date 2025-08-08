import { createContext, useContext, useState, useEffect } from 'react';

const ConfigContext = createContext();

// Backend URL - akan menggunakan environment variable di production
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    sourceUrl: 'https://v1.samehadaku.how/',
    scrapingInterval: '0 * * * *',
    autoScraping: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/config`);
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const updateConfig = async (newConfig) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig),
      });

      if (response.ok) {
        setConfig(newConfig);
        return { success: true };
      } else {
        throw new Error('Failed to update config');
      }
    } catch (error) {
      console.error('Error updating config:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    config,
    loading,
    updateConfig,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};
