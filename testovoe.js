const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const app = express();
const port = 3000;

// MongoDB - это хороший выбор для этой задачи, так как:

//Она хорошо работает с JSON-подобными данными.
//Обеспечивает гибкость схемы, что удобно при работе с внешним API.
//Хорошо масштабируется, если в будущем потребуется обрабатывать больше данных

mongoose.connect('mongodb://localhost/github_trending');

const repoSchema = new mongoose.Schema({
  id: Number,
  name: String,
  full_name: String,
  description: String,
  stars: Number,
  url: String
});

const Repo = mongoose.model('Repo', repoSchema);

async function fetchTrendingRepos() {
  try {
    const response = await axios.get('https://api.github.com/search/repositories?q=stars:>1&sort=stars&order=desc');
    const repos = response.data.items.slice(0, 10);

    // Сохраняем данные в базу данных
    for (const repo of repos) {
      await Repo.findOneAndUpdate(
        { id: repo.id },
        {
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          stars: repo.stargazers_count,
          url: repo.html_url
        },
        { upsert: true, new: true }
      );
    }

    console.log('Repositories updated');
  } catch (error) {
    console.error('Error fetching trending repos:', error);
  }
}

let syncInterval = setInterval(fetchTrendingRepos, 30 * 60 * 1000);

// API endpoints
app.get('/api/repos', async (req, res) => {
  const repos = await Repo.find();
  res.json(repos);
});

app.get('/api/repos/:identifier', async (req, res) => {
  const { identifier } = req.params;
  const repo = await Repo.findOne({
    $or: [{ id: identifier }, { name: identifier }]
  });
  if (repo) {
    res.json(repo);
  } else {
    res.status(404).json({ error: 'Repository not found' });
  }
});

app.post('/api/sync', (req, res) => {
  clearInterval(syncInterval);
  fetchTrendingRepos();
  syncInterval = setInterval(fetchTrendingRepos, 30 * 60 * 1000);
  res.json({ message: 'Sync started' });
});

app.get('/', (req, res) => {
  res.send('Welcome to the GitHub Trending Repos API');
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
