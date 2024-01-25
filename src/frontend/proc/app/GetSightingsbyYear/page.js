"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { Button, Container, Typography, Box, TextField, Select, MenuItem } from "@mui/material";
const SightingsInfo = () => {
  const [sightingsInfoResult, setSightingsInfoResult] = useState("");
  const [showResult, setShowResult] = useState(false);
  const handleGetSightingsInfoClick = async () => {
    try {
      const response = await axios.get(`http://localhost:20004/get_number_sightings_group_by_year`);
      if (Array.isArray(response.data) && response.data.length > 0) {
        const extractedData = response.data.map(item => ({
          YEAR: item.data['YEAR'],
          COUNT: item.data['COUNT']
        }));
        const formattedResult = extractedData.map(item => (
          `YEAR: ${item.YEAR}, COUNT: ${item.COUNT}`
        )).join('<br />');

        setSightingsInfoResult(formattedResult);
        setShowResult(true);
      } else if ('message' in response.data) {
        setSightingsInfoResult(response.data.message);
        setShowResult(false);
      } else {
        setSightingsInfoResult('Unexpected response format');
        setShowResult(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setSightingsInfoResult("");
      setShowResult(false);
    }
  };


  return (
    <Container>
      <Box>
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
          onClick={handleGetSightingsInfoClick}
        >
          Get Sightings Info
        </Button>
        {!showResult && sightingsInfoResult && (
          <Typography style={{
            marginTop: 10,
            color: "#000",
          }} variant="body1">
            {sightingsInfoResult}
          </Typography>
        )}
        {showResult && sightingsInfoResult && (
          <>
            <table style={{ width: '100%', marginTop: 10 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>YEAR</th>
                  <th style={{ textAlign: 'center' }}>COUNT</th>
                </tr>
              </thead>
              <tbody>
                {sightingsInfoResult.split('<br />').map((line, index) => {
                  const [year, count] = line.match(/YEAR: (.+), COUNT: (.+)/).slice(1);
                  return (
                    <tr key={index}>
                      <td style={{ textAlign: 'center' }}>{year}</td>
                      <td style={{ textAlign: 'center' }}>{count}</td>
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

export default SightingsInfo;