"use client";
import React, { useState } from 'react';
import axios from 'axios';
import {Button, Container, Box, Select, MenuItem, Typography} from "@mui/material";

const SightingsInfo = () => {
  const [year, setYear] = useState('');
  const [sightingsInfoResult, setSightingsInfoResult] = useState("");
  const [showResult, setShowResult] = useState(false);

  const handleGetSightingsInfoClick = async () => {
    if (!year.trim()) {
      return;
    }
    try {
      const response = await axios.get(`http://localhost:20004/get_number_sightings_in_year/${year}`);
       if (Array.isArray(response.data) && response.data.length > 0) {
  const extractedData = response.data.map(item => ({
    YEAR: item.data['YEAR'],
    XML_FILE: item.data['XML_FILE'],
    COUNT: item.data['COUNT']
  }));
  const formattedResult = extractedData.map(item => (
    `YEAR: ${item.YEAR}, XML_FILE: ${item.XML_FILE}, COUNT: ${item.COUNT}`
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

  const years = Array.from({ length: 225 }, (_, index) => 1900 + index); // Generate an array of years from 1900 to 2024

  return (
    <Container>
      <Box>
        <Select
          label="Year"
          value={year}
          onChange={(e) => setYear(String(e.target.value))}
          style={{ marginRight: 10 }}
        >
          {years.map((y) => (
            <MenuItem key={y} value={String(y)}>
             {y}
            </MenuItem>
          ))}
        </Select>
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
          disabled={!year.trim()}
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
                <th style={{ textAlign: 'center' }}>XML_FILE</th>
                <th style={{ textAlign: 'center' }}>COUNT</th>
              </tr>
            </thead>
            <tbody>
              {sightingsInfoResult.split('<br />').map((line, index) => {
                const [year, xmlFile, count] = line.match(/YEAR: (.+), XML_FILE: (.+), COUNT: (.+)/).slice(1);
                return (
                  <tr key={index}>
                    <td style={{ textAlign: 'center' }}>{year}</td>
                    <td style={{ textAlign: 'center' }}>{xmlFile}</td>
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