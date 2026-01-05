import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import io from 'socket.io-client';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';

const socket = io.connect("http://localhost:5000");

function CodeEditor() {
  const { roomId } = useParams(); // Get room ID from URL
  const [code, setCode] = useState('# Python 3.9 - Type here...');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Join the room on load
    socket.emit('join-room', roomId);

    // 2. Listen for updates in THIS room
    socket.on('code-update', (newCode) => {
        setCode(newCode);
    });

    return () => {
        socket.off('code-update');
    };
  }, [roomId]);

  const handleEditorChange = (value) => {
    setCode(value);
    // Send room ID along with the code
    socket.emit('code-change', { roomId, code: value });
  };

  const runCode = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/execute', { code });
      setOutput(response.data.output);
    } catch (error) {
      setOutput("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#1e1e1e', height: '100vh', color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h2>🚀 Room: {roomId}</h2>
        <button 
          onClick={runCode}
          disabled={loading}
          style={{ backgroundColor: loading ? '#555' : '#0e639c', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', fontSize: '16px' }}
        >
          {loading ? 'Executing...' : 'Run Code ▶'}
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', height: '80%' }}>
        <div style={{ flex: 1, border: '1px solid #333' }}>
          <Editor 
            height="100%" 
            defaultLanguage="python" 
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
          />
        </div>
        <div style={{ flex: 1, backgroundColor: '#000', padding: '10px', border: '1px solid #333', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
          <div style={{ color: '#888', borderBottom: '1px solid #333', marginBottom: '10px' }}>OUTPUT TERMINAL</div>
          {output}
        </div>
      </div>
    </div>
  );
}

// Landing Page to pick a room
function Home() {
    const [room, setRoom] = useState('');
    const navigate = useNavigate();

    const joinRoom = () => {
        if(room) navigate(`/room/${room}`);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#1e1e1e', color: 'white' }}>
            <h1>CodeDock ⚓</h1>
            <input 
                placeholder="Enter Room Name..." 
                onChange={(e) => setRoom(e.target.value)}
                style={{ padding: '10px', fontSize: '16px', marginBottom: '10px', width: '200px' }}
            />
            <button onClick={joinRoom} style={{ padding: '10px 20px', backgroundColor: '#0e639c', color: 'white', border: 'none', cursor: 'pointer' }}>
                Join Room
            </button>
        </div>
    );
}

// Main App with Routing
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/room/:roomId" element={<CodeEditor />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;