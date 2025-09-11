import React from "react";

const MovieSelection = ({ movies }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '20px',
      justifyContent: 'center'
    }}>
      {movies.slice(0, 5).map(movie => (
        <div 
          key={movie._id} 
          style={{ 
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{
            height: '300px',
            backgroundImage: `url(${movie.poster})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '8px',
            marginBottom: '10px'
          }} />
          <h3 style={{ margin: '10px 0' }}>{movie.title}</h3>
          <p style={{ color: '#777' }}>{movie.genre}</p>
        </div>
      ))}
    </div>
  );
};

export default MovieSelection;