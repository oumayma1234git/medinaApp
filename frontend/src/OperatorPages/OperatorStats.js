import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import OperatorNavbar from './OperatorNavbar';

const OperatorStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    films: 0,
    seances: 0,
    reservations: 0
  });
  const [films, setFilms] = useState([]);
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Nouveaux états pour la segmentation et le sentiment
  const [segmentationData, setSegmentationData] = useState(null);
  const [sentimentData, setSentimentData] = useState(null);
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'segmentation', 'sentiment'

  useEffect(() => {
    fetchStats();
    fetchFilmsData();
    fetchSegmentationData();
    fetchSentimentData();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/operatorRoutes/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }
      
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setError('Impossible de charger les statistiques');
      setLoading(false);
    }
  };

  const fetchFilmsData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/operatorRoutes/films', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFilms(data.films.slice(0, 3));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des films:', error);
    }
  };

  // Nouvelle fonction pour récupérer les données de segmentation
  const fetchSegmentationData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/segmentation');
      if (response.ok) {
        const data = await response.json();
        setSegmentationData(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la segmentation:', error);
    }
  };

  // Nouvelle fonction pour récupérer les données de sentiment
  const fetchSentimentData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/film-sentiment');
      if (response.ok) {
        const data = await response.json();
        setSentimentData(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du sentiment:', error);
    }
  };

  if (loading) {
    return (
      <div className="operator-stats">
        <OperatorNavbar />
        <div className="operator-content">
          <div className="loading">Chargement des statistiques...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="operator-stats">
      <OperatorNavbar />
      
      <div className="operator-content">
        <div className="page-header">
          <h1>Statistiques</h1>
          
          {/* Nouveaux onglets de navigation */}
          <div className="tabs">
            <button 
              className={activeTab === 'stats' ? 'active' : ''}
              onClick={() => setActiveTab('stats')}
            >
              Statistiques
            </button>
            <button 
              className={activeTab === 'segmentation' ? 'active' : ''}
              onClick={() => setActiveTab('segmentation')}
            >
              Segmentation Clients
            </button>
            <button 
              className={activeTab === 'sentiment' ? 'active' : ''}
              onClick={() => setActiveTab('sentiment')}
            >
              Analyse Sentiment
            </button>
            
            <div className="time-filters">
              <button 
                className={timeRange === 'day' ? 'active' : ''}
                onClick={() => setTimeRange('day')}
              >
                Aujourd'hui
              </button>
              <button 
                className={timeRange === 'week' ? 'active' : ''}
                onClick={() => setTimeRange('week')}
              >
                Cette semaine
              </button>
              <button 
                className={timeRange === 'month' ? 'active' : ''}
                onClick={() => setTimeRange('month')}
              >
                Ce mois
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Contenu des onglets */}
        {activeTab === 'stats' && (
          <>
            <div className="stats-grid">
              <div className="stat-card large">
                <div className="stat-header">
                  <h3>Réservations</h3>
                  <span className="stat-trend up">+12%</span>
                </div>
                <div className="stat-value">{stats.reservations}</div>
                <div className="stat-chart">
                  <div className="chart-bar" style={{ height: '80%' }}></div>
                  <div className="chart-bar" style={{ height: '60%' }}></div>
                  <div className="chart-bar" style={{ height: '90%' }}></div>
                  <div className="chart-bar" style={{ height: '75%' }}></div>
                  <div className="chart-bar" style={{ height: '85%' }}></div>
                  <div className="chart-bar" style={{ height: '70%' }}></div>
                  <div className="chart-bar" style={{ height: '95%' }}></div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#e3f2fd' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1976d2">
                    <path d="M18 3H6C4.346 3 3 4.346 3 6v12c0 1.654 1.346 3 3 3h12c1.654 0 3-1.346 3-3V6c0-1.654-1.346-3-3-3zM6 5h12c.551 0 1 .449 1 1v1H5V6c0-.551.449-1 1-1zm12 14H6c-.551 0-1-.449-1-1V9h14v9c0 .551-.449 1-1 1z"/>
                    <circle cx="8" cy="12" r="1.5"/>
                    <circle cx="12" cy="12" r="1.5"/>
                    <circle cx="16" cy="12" r="1.5"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>{stats.films}</h3>
                  <p>Films</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#e8f5e9' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#388e3c">
                    <path d="M19 4h-1V3c0-.55-.45-1-1-1s-1 .45-1 1v1H8V3c0-.55-.45-1-1-1s-1 .45-1 1v1H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                    <path d="M7 12h5v5H7z"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>{stats.seances}</h3>
                  <p>Séances</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#fff3e0' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f57c00">
                    <path d="M4 9v10h16V9H4zm16-2V4c0-1.1-.9-2-2-2h-3c0-1.1-.9-2-2-2H9C7.9 0 7 .9 7 2H4c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2z"/>
                    <path d="M8 4h8v2H8z"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>{stats.reservations}</h3>
                  <p>Réservations</p>
                </div>
              </div>
            </div>

            <div className="stats-charts">
              <div className="chart-card">
                <h3>Réservations par film</h3>
                <div className="chart-container">
                  <div className="bar-chart">
                    {films.map((film, index) => (
                      <div key={film._id} className="chart-item">
                        <div className="chart-label">{film.title}</div>
                        <div className="chart-bar-container">
                          <div 
                            className="chart-bar" 
                            style={{ 
                              width: `${(index + 1) * 25}%`,
                              backgroundColor: index === 0 ? '#1a56db' : index === 1 ? '#10b981' : '#f59e0b'
                            }}
                          ></div>
                        </div>
                        <div className="chart-value">{index === 0 ? 75 : index === 1 ? 50 : 25}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <h3>Répartition des séances</h3>
                <div className="chart-container">
                  <div className="pie-chart">
                    <div className="pie-slice" style={{ '--percentage': 100, '--color': '#1a56db' }}></div>
                    <div className="pie-center">
                      <span>{stats.seances}</span>
                      <small>Séances</small>
                    </div>
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item">
                      <div className="legend-color" style={{ background: '#1a56db' }}></div>
                      <span>Salle Unique (100%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'segmentation' && segmentationData && (
          <div className="segmentation-section">
            <h2>Segmentation des Clients</h2>
            <div className="segmentation-grid">
              {segmentationData.segmentation_data && segmentationData.segmentation_data.map((segment, index) => (
                <div key={index} className="segment-card">
                  <h3>Segment {segment.segment}</h3>
                  <div className="segment-details">
                    <p><strong>Nombre de clients:</strong> {segment.Nb_Clients}</p>
                    <p><strong>Dépense moyenne:</strong> {segment.Dépense_Moyenne} DT</p>
                  </div>
                </div>
              ))}
            </div>
            
            {segmentationData.segmentation_chart && (
              <div className="segmentation-chart">
                <img 
                  src={`data:image/png;base64,${segmentationData.segmentation_chart}`} 
                  alt="Segmentation des clients" 
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'sentiment' && sentimentData && (
          <div className="sentiment-section">
            <h2>Analyse de Sentiment des Films</h2>
            
            <div className="films-positive">
              <h3>Films avec plus de 50% de sentiments positifs</h3>
              <div className="films-grid">
                {sentimentData.films_positifs && Object.entries(sentimentData.films_positifs).map(([film, data], index) => (
                  <div key={index} className="film-sentiment-card">
                    <h4>{film}</h4>
                    <div className="sentiment-stats">
                      <div className="sentiment-bar">
                        <div 
                          className="positive-bar" 
                          style={{ width: `${data.Positif || 0}%` }}
                        >
                          <span>{data.Positif || 0}% Positif</span>
                        </div>
                        <div 
                          className="negative-bar" 
                          style={{ width: `${data.Négatif || 0}%` }}
                        >
                          <span>{data.Négatif || 0}% Négatif</span>
                        </div>
                        <div 
                          className="neutral-bar" 
                          style={{ width: `${data.Neutre || 0}%` }}
                        >
                          <span>{data.Neutre || 0}% Neutre</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {sentimentData.sentiment_chart && (
              <div className="sentiment-chart">
                <img 
                  src={`data:image/png;base64,${sentimentData.sentiment_chart}`} 
                  alt="Analyse de sentiment des films" 
                />
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .operator-stats {
          min-height: 100vh;
          background: #f9fafb;
        }
        
        .operator-content {
          padding: 20px;
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .page-header h1 {
          font-size: 28px;
          color: #1a293b;
          margin: 0;
        }
        
        .tabs {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }
        
        .tabs button {
          padding: 10px 20px;
          border: none;
          background: #f3f4f6;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .tabs button.active {
          background: #1a56db;
          color: white;
        }
        
        .time-filters {
          display: flex;
          background: #f3f4f6;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .time-filters button {
          padding: 8px 16px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s;
        }
        
        .time-filters button.active {
          background: #1a56db;
          color: white;
        }
        
        .error-message {
          background: #fee2e2;
          color: #b91c1c;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 500;
        }
        
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          color: #6b7280;
          font-size: 18px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .stat-card.large {
          grid-column: span 1;
        }
        
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .stat-header h3 {
          margin: 0;
          font-size: 16px;
          color: #6b7280;
        }
        
        .stat-trend {
          font-size: 14px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 20px;
        }
        
        .stat-trend.up {
          background: #ecfdf5;
          color: #10b981;
        }
        
        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #1a293b;
          margin-bottom: 15px;
        }
        
        .stat-chart {
          display: flex;
          align-items: end;
          height: 80px;
          gap: 4px;
        }
        
        .stat-chart .chart-bar {
          flex: 1;
          background: #e0e7ff;
          border-radius: 3px 3px 0 0;
        }
        
        .stat-card:not(.large) {
          display: flex;
          align-items: center;
        }
        
        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
        }
        
        .stat-icon svg {
          width: 30px;
          height: 30px;
        }
        
        .stat-content h3 {
          font-size: 28px;
          font-weight: 700;
          color: #1a293b;
          margin: 0;
        }
        
        .stat-content p {
          color: #6b7280;
          margin: 5px 0 0;
        }
        
        .stats-charts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .chart-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .chart-card h3 {
          margin: 0 0 20px;
          font-size: 18px;
          color: #1a293b;
        }
        
        .chart-container {
          display: flex;
        }
        
        .bar-chart {
          flex: 1;
        }
        
        .chart-item {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .chart-label {
          width: 120px;
          font-size: 14px;
          color: #6b7280;
        }
        
        .chart-bar-container {
          flex: 1;
          height: 20px;
          background: #f3f4f6;
          border-radius: 10px;
          overflow: hidden;
          margin: 0 10px;
        }
        
        .bar-chart .chart-bar {
          height: 100%;
          border-radius: 10px;
        }
        
        .chart-value {
          width: 40px;
          text-align: right;
          font-weight: 500;
          color: #1a293b;
        }
        
        .pie-chart {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: conic-gradient(
            var(--color) 0% calc(var(--percentage) * 1%),
            #f3f4f6 calc(var(--percentage) * 1%) 100%
          );
          position: relative;
          margin-right: 20px;
        }
        
        .pie-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          background: white;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        
        .pie-center span {
          font-size: 18px;
          font-weight: 700;
          color: #1a293b;
        }
        
        .pie-center small {
          font-size: 12px;
          color: #6b7280;
        }
        
        .chart-legend {
          flex: 1;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
          margin-right: 8px;
        }
        
        .legend-item span {
          font-size: 14px;
          color: #6b7280;
        }
        
        /* Styles pour la segmentation */
        .segmentation-section, .sentiment-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          margin-bottom: 20px;
        }
        
        .segmentation-section h2, .sentiment-section h2 {
          margin-top: 0;
          color: #1a293b;
          border-bottom: 2px solid #f3f4f6;
          padding-bottom: 10px;
        }
        
        .segmentation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .segment-card {
          background: #f9fafb;
          border-radius: 8px;
          padding: 15px;
          border-left: 4px solid #1a56db;
        }
        
        .segment-card h3 {
          margin-top: 0;
          color: #1a293b;
        }
        
        .segment-details p {
          margin: 8px 0;
        }
        
        .segmentation-chart, .sentiment-chart {
          text-align: center;
          margin-top: 20px;
        }
        
        .segmentation-chart img, .sentiment-chart img {
          max-width: 100%;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        /* Styles pour l'analyse de sentiment */
        .films-positive h3 {
          color: #1a293b;
          margin-bottom: 20px;
        }
        
        .films-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .film-sentiment-card {
          background: white;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
        }
        
        .film-sentiment-card h4 {
          margin-top: 0;
          color: #1a293b;
        }
        
        .sentiment-bar {
          display: flex;
          height: 30px;
          border-radius: 6px;
          overflow: hidden;
        }
        
        .positive-bar {
          background: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: 500;
        }
        
        .negative-bar {
          background: #ef4444;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: 500;
        }
        
        .neutral-bar {
          background: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: 500;
        }
        
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
          
          .stats-charts {
            grid-template-columns: 1fr;
          }
          
          .segmentation-grid, .films-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .operator-content {
            padding: 15px;
          }
          
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .tabs {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .chart-container {
            flex-direction: column;
          }
          
          .pie-chart {
            margin: 0 auto 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default OperatorStats;