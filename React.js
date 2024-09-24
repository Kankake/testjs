const React = require('react');
const { useState, useEffect } = React;
const axios = require('axios');

function App() {
  const [repos, setRepos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    const response = await axios.get('http://localhost:3000/api/repos');
    setRepos(response.data);
  };

  const searchRepo = async () => {
    const response = await axios.get(`http://localhost:3000/api/repos/${searchTerm}`);
    setRepos([response.data]);
  };

  const startSync = async () => {
    await axios.post('http://localhost:3000/api/sync');
    alert('Sync started');
  };

  return (
    <div>
      <h1>GitHub Trending Repos</h1>
      <button onClick={fetchRepos}>Get All Repos</button>
      <button onClick={startSync}>Start Sync</button>
      <input 
        type="text" 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
        placeholder="Search by name or ID"
      />
      <button onClick={searchRepo}>Search</button>
      <ul>
        {repos.map(repo => (
          <li key={repo.id}>{repo.name} - Stars: {repo.stars}</li>
        ))}
      </ul>
    </div>
  );
}

module.exports = App;
