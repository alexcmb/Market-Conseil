import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import CategoryFilter from '../components/CategoryFilter';
import TodayAdvice from '../components/TodayAdvice';
import StatsGrid from '../components/StatsGrid';
import PerformanceChart from '../components/PerformanceChart';
import HistoryTable from '../components/HistoryTable';
import LearningPanel from '../components/LearningPanel';
import { adviceService } from '../services/api';
import '../styles/App.css';

const Dashboard = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [latestAdvice, setLatestAdvice] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      // Check connection
      await adviceService.healthCheck();
      setIsConnected(true);

      // Fetch categories first
      const categoriesRes = await adviceService.getCategories();
      setCategories(categoriesRes.data || []);

      // Fetch all data with optional category filter
      const [latestRes, historyRes, performanceRes] = await Promise.all([
        adviceService.getLatest(selectedCategory),
        adviceService.getHistory(1, 20, selectedCategory),
        adviceService.getPerformance()
      ]);

      setLatestAdvice(latestRes.data);
      setHistory(historyRes.data || []);
      setStats({
        totalAdvice: performanceRes.data?.totalAdvice || 0,
        successRate: performanceRes.data?.successRate || 0,
        averageScore: performanceRes.data?.averageScore || 0,
        evaluatedAdvice: performanceRes.data?.evaluatedAdvice || 0
      });
      setStrategy(performanceRes.data?.strategy);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchData();
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setLoading(true);
  };

  const handleGenerateAdvice = async () => {
    setLoading(true);
    try {
      const result = await adviceService.generateAdvice(null, selectedCategory);
      setLatestAdvice(result.data);
      // Refresh all data
      await fetchData();
    } catch (error) {
      console.error('Error generating advice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    try {
      await adviceService.evaluateAdvice();
      await fetchData();
    } catch (error) {
      console.error('Error evaluating advice:', error);
    }
  };

  return (
    <div className="app">
      <Header isConnected={isConnected} />
      
      <main className="main-container">
        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Today's Advice */}
        <TodayAdvice 
          advice={latestAdvice} 
          onGenerate={handleGenerateAdvice}
          loading={loading && !latestAdvice}
          selectedCategory={selectedCategory}
          categories={categories}
        />

        {/* Stats Overview */}
        <StatsGrid stats={stats} />

        {/* Performance Charts */}
        <PerformanceChart history={history} stats={stats} />

        {/* History and Learning Grid */}
        <div className="dashboard-grid">
          <HistoryTable history={history} />
          <LearningPanel strategy={strategy} />
        </div>

        {/* Evaluation Button */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="btn btn-secondary" onClick={handleEvaluate}>
            🔄 Evaluate Past Advice
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
