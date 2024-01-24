"use client"
import React, { useState } from 'react';
import axios from 'axios';
import { Button, Container, Typography, Box } from "@mui/material";

const AddFile = () => {
  const [addFileResult, setAddFileResult] = useState("null");
  const [showResult, setShowResult] = useState(false);

  const handleAddFileClick = async (fileName) => {
    try {
      const response = await axios.patch(`http://localhost:20004/add_file/${fileName}`);
      if ('message' in response.data) {
         setAddFileResult(response.data.message);
      } else if ('error' in response.data) {
         setAddFileResult(response.data.error);
      }
      setShowResult(true);
      setTimeout(() => {
        setShowResult(false);
      }, 10000);
    } catch (error) {
      console.error('Error:', error);
      setAddFileResult("null");
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Add File Interaction
      </Typography>
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
        }} onClick={() => handleAddFileClick("yourFileName")}>
          Add File
        </Button>
        {showResult && addFileResult && (
          <Typography style={{
            marginTop: 10,
            color: "#000", // Change this to your preferred text color
          }} variant="body1">
            Result: {addFileResult}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default AddFile;
