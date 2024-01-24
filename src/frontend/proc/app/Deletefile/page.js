"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { Button, Container, Typography, Box, TextField } from "@mui/material";

const DeleteFile = () => {
  const [fileName, setFileName] = useState('');
  const [deleteFileResult, setDeleteFileResult] = useState("");
  const [showResult, setShowResult] = useState(false);

  const handleDeleteFileClick = async () => {
    if (!fileName.trim()) {
      return;
    }
    try {
      const response = await axios.patch(`http://localhost:20004/delete_file/${fileName}`);
      if ('message' in response.data) {
        setDeleteFileResult(response.data.message);
      } else if ('error' in response.data) {
        setDeleteFileResult(response.data.error);
      }
      setShowResult(true);
      setTimeout(() => {
        setShowResult(false);
      }, 10000);
    } catch (error) {
      console.error('Error:', error);
      setDeleteFileResult("");
      setShowResult(false);
    }
  };

  return (
    <Container>
      <Box>
        <TextField
          label="File Name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <Button
          style={{
            backgroundColor: "#1976D2",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 5,
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "#135692",
            },
          }}
          onClick={handleDeleteFileClick}
          disabled={!fileName.trim()}
        >
          Delete File
        </Button>
        {showResult && deleteFileResult && (
          <Typography style={{
            marginTop: 10,
            color: "#000",
          }} variant="body1">
             {deleteFileResult}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default DeleteFile;