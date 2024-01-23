import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [fileName, setFileName] = useState('');
  const [testResult, setTestResult] = useState('');
  const [addFileResult, setAddFileResult] = useState('');
  const [deleteFileResult, setDeleteFileResult] = useState('');

  const handleFileNameChange = (e) => {
    setFileName(e.target.value);
  };

  const testConnection = async () => {
    try {
      const response = await axios.get('/test_conn');
      setTestResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Error calling test_conn:', error);
    }
  };

  const addFile = async () => {
    try {
      const response = await axios.patch(`/add_file/${fileName}`);
      setAddFileResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Error calling add_file:', error);
    }
  };

  const deleteFile = async () => {
    try {
      const response = await axios.patch(`/delete_file/${fileName}`);
      setDeleteFileResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Error calling delete_file:', error);
    }
  };

  return (
    <div className="container">
      <div>
        <label className="label">
          File Name:
          <input
            className="input"
            type="text"
            value={fileName}
            onChange={handleFileNameChange}
          />
        </label>
      </div>

      <button className="button" onClick={testConnection}>
        Test Connection
      </button>
      <div>Test Connection Result: <pre>{testResult}</pre></div>

      <button className="button" onClick={addFile}>
        Add File
      </button>
      <div>Add File Result: <pre>{addFileResult}</pre></div>

      <button className="button" onClick={deleteFile}>
        Delete File
      </button>
      <div>Delete File Result: <pre>{deleteFileResult}</pre></div>
    </div>
  );
}

export default App;
