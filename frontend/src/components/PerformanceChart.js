import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PerformanceChart = ({ history, stats }) => {
  // Prepare data for line chart (performance over time)
  const lineChartData = {
    labels: history?.slice().reverse().slice(0, 10).map((_, i) => `Day ${i + 1}`) || [],
    datasets: [
      {
        label: 'Performance Score',
        data: history?.slice().reverse().slice(0, 10).map(h => h.performanceScore || 50) || [],
        fill: true,
        borderColor: '#00f5ff',
        backgroundColor: 'rgba(0, 245, 255, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#00f5ff',
        pointBorderColor: '#0a0a0a',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#888888'
        }
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#888888'
        }
      }
    }
  };

  // Prepare data for doughnut chart (outcome distribution)
  const successCount = history?.filter(h => h.outcome === 'SUCCESS').length || 0;
  const partialCount = history?.filter(h => h.outcome === 'PARTIAL').length || 0;
  const failureCount = history?.filter(h => h.outcome === 'FAILURE').length || 0;
  const pendingCount = history?.filter(h => h.outcome === 'PENDING').length || 0;

  const doughnutData = {
    labels: ['Success', 'Partial', 'Failure', 'Pending'],
    datasets: [
      {
        data: [successCount, partialCount, failureCount, pendingCount],
        backgroundColor: [
          'rgba(0, 255, 136, 0.8)',
          'rgba(255, 255, 0, 0.8)',
          'rgba(255, 51, 102, 0.8)',
          'rgba(0, 245, 255, 0.8)'
        ],
        borderColor: '#0a0a0a',
        borderWidth: 2
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#888888',
          padding: 15,
          usePointStyle: true
        }
      }
    }
  };

  return (
    <div className="dashboard-grid">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📈 Performance Trend</h2>
        </div>
        <div className="card-body">
          <div className="chart-container">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🎯 Outcome Distribution</h2>
        </div>
        <div className="card-body">
          <div className="chart-container">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
