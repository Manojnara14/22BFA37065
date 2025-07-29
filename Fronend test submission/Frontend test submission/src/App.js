import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  useNavigate
} from 'react-router-dom';

const MainApp = () => {
  const [urlData, setUrlData] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [validity, setValidity] = useState(30);
  const [shortcode, setShortcode] = useState('');

  useEffect(() => {
    // Load existing data from localStorage
    const stored = JSON.parse(localStorage.getItem('urlData') || '[]');
    setUrlData(stored);
  }, []);

  const handleShorten = () => {
    if (!urlInput || !urlInput.startsWith('http')) {
      alert('Invalid URL. Please enter a valid URL starting with http or https.');
      return;
    }

    const code = shortcode || uuidv4().slice(0, 6);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + validity * 60000);

    const newEntry = {
      originalUrl: urlInput,
      shortUrl: `http://localhost:3000/${code}`,
      shortcode: code,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      clicks: []
    };

    const updated = [...urlData, newEntry];
    setUrlData(updated);
    localStorage.setItem('urlData', JSON.stringify(updated));

    const mappings = JSON.parse(localStorage.getItem("urlMappings") || "{}");
    mappings[code] = urlInput;
    localStorage.setItem("urlMappings", JSON.stringify(mappings));

    setUrlInput('');
    setValidity(30);
    setShortcode('');
  };

  const handleClick = (code) => {
    const now = new Date();
    const updated = urlData.map((entry) =>
      entry.shortcode === code
        ? {
            ...entry,
            clicks: [
              ...entry.clicks,
              {
                timestamp: now.toISOString(),
                source: 'localhost',
                location: 'India'
              }
            ]
          }
        : entry
    );
    setUrlData(updated);
    localStorage.setItem('urlData', JSON.stringify(updated));
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>URL Shortener</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          label="Original URL"
          fullWidth
          margin="normal"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
        />
        <TextField
          label="Validity (minutes)"
          type="number"
          fullWidth
          margin="normal"
          value={validity}
          onChange={(e) => setValidity(Number(e.target.value))}
        />
        <TextField
          label="Preferred Shortcode (optional)"
          fullWidth
          margin="normal"
          value={shortcode}
          onChange={(e) => setShortcode(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleShorten}>Shorten</Button>
      </Paper>

      <Grid container spacing={2}>
        {urlData.map((item, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Paper sx={{ p: 2 }}>
              <Typography><strong>Original:</strong> {item.originalUrl}</Typography>
              <Typography>
                <strong>Shortened:</strong>{' '}
                <a
                  href={`/${item.shortcode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleClick(item.shortcode)}
                >
                  {item.shortUrl}
                </a>
              </Typography>
              <Typography><strong>Expires At:</strong> {item.expiresAt}</Typography>
              <Typography><strong>Clicks:</strong> {item.clicks.length}</Typography>
              <List dense>
                {item.clicks.map((click, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={`Clicked at ${click.timestamp}`}
                      secondary={`Source: ${click.source}, Location: ${click.location}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

// 🔁 Redirect handler component
const RedirectHandler = () => {
  const { shortcode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const mappings = JSON.parse(localStorage.getItem("urlMappings") || "{}");
    const target = mappings[shortcode];
    if (target) {
      window.location.href = target;
    } else {
      alert("URL not found or expired");
      navigate("/");
    }
  }, [shortcode, navigate]);

  return null;
};

// 🌐 Root App with routing
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/:shortcode" element={<RedirectHandler />} />
      </Routes>
    </Router>
  );
};

export default App;
