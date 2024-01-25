"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { Button, Container, Typography, Box, Select, MenuItem, TextField } from "@mui/material";

const ShapeRegionInfo = () => {
  const [shape, setShape] = useState('');
  const [shapeRegionInfoResult, setShapeRegionInfoResult] = useState("");
  const [showResult, setShowResult] = useState(false);

  const handleRetrieveShapeRegionClick = async () => {
    if (!shape.trim()) {
      return;
    }
    try {
      const response = await axios.get(`http://localhost:20004/retrieve_shape_region/${shape}`);
      if (Array.isArray(response.data) && response.data.length > 0) {
        const extractedData = response.data.map(item => ({
          FILE_NAME: item.data['FILE NAME'],
          REGION: item.data['REGION'],
          UFO_SIGHTINGS: item.data['UFOs SIGHTINGS']
        }));
        const formattedResult = extractedData.map(item => (
          `FILE_NAME: ${item.FILE_NAME}, REGION: ${item.REGION}, UFO_SIGHTINGS: ${item.UFO_SIGHTINGS}`
        )).join('<br />');

        setShapeRegionInfoResult(formattedResult);
        setShowResult(true);
      } else if ('message' in response.data) {
        setShapeRegionInfoResult(response.data.message);
        setShowResult(false);
      } else {
        setShapeRegionInfoResult('Unexpected response format');
        setShowResult(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setShapeRegionInfoResult("");
      setShowResult(false);
    }
  };

  return (
    <Container>
      <Box>
        <TextField
          label="Shape"
          value={shape}
          onChange={(e) => setShape(e.target.value)}
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
          onClick={handleRetrieveShapeRegionClick}
          disabled={!shape.trim()}
        >
          Retrieve Shape Region Info
        </Button>
        {!showResult && shapeRegionInfoResult && (
          <Typography style={{
            marginTop: 10,
            color: "#000",
          }} variant="body1">
            {shapeRegionInfoResult}
          </Typography>
        )}
        {showResult && shapeRegionInfoResult && (
          <>
            <table style={{ width: '100%', marginTop: 10 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>FILE_NAME</th>
                  <th style={{ textAlign: 'center' }}>REGION</th>
                  <th style={{ textAlign: 'center' }}>UFOS_SIGHTINGS</th>
                </tr>
              </thead>
              <tbody>
                {shapeRegionInfoResult.split('<br />').map((line, index) => {
                  const [fileName, region, ufosSightings] = line.match(/FILE_NAME: (.+), REGION: (.+), UFOS_SIGHTINGS: (.+)/).slice(1);
                  return (
                    <tr key={index}>
                      <td style={{ textAlign: 'center' }}>{fileName}</td>
                      <td style={{ textAlign: 'center' }}>{region}</td>
                      <td style={{ textAlign: 'center' }}>{ufosSightings}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </Box>
    </Container>
  );
};

export default ShapeRegionInfo;