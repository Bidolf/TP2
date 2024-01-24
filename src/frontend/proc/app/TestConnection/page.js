"use client"
import React, {  useState } from 'react';
import axios from 'axios';
import { Button, Container, Typography, Box } from "@mui/material";
const TestConnection = () => {
  const [testConnectionResult, setTestConnectionResult] = useState('null');
  const [showResult, setShowResult] = useState(false);

  const fetchTestConnection = async () => {
    try {
      const response = await axios.get('http://localhost:20004/test_conn');
      setTestConnectionResult(response.data.message);
      setShowResult(true);
      setTimeout(() => {
        setShowResult(false);
      }, 10000);
    } catch (error) {
      console.error('Error:', error);
      setTestConnectionResult('null');
    }
  };

  const handleTestConnectionClick = async () => {
    // Call the function to fetch test connection when the user clicks the button
    await fetchTestConnection();
  };

  return (
    <Container>
      <Box>
        <Button style={{
    backgroundColor: "#1976D2",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: 5,
    cursor: "pointer",
    marginRight: 10,
    "&:hover": {
      backgroundColor: "#135692",
    },
  }} onClick={handleTestConnectionClick}>
          Test Connection
        </Button>
        {showResult && testConnectionResult && (
          <Typography style={{
    marginTop: 10,
    color: "#1976D2",
  }} variant="body1">
            {testConnectionResult}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default TestConnection;