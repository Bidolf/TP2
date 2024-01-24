"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { Button, Container, Typography, Box, Select, MenuItem, TextField } from "@mui/material";

const YearRegionInfo = () => {
  const [region, setRegion] = useState('');
  const [year, setYear] = useState('');
  const [yearRegionInfoResult, setYearRegionInfoResult] = useState("");
  const [showResult, setShowResult] = useState(false);

  const handleRetrieveYearRegionClick = async () => {
    if (!region.trim() || !year.trim()) {
      return;
    }
    try {
      const response = await axios.get(`http://localhost:20004/retrieve_year_region/${region}/${year}`);
      if (Array.isArray(response.data) && response.data.length > 0) {
        const extractedData = response.data.map(item => ({
          UFO_SHAPE: item.data['UFO SHAPE'],
          ENCOUNTER_DURATION: item.data['ENCOUNTER DURATION'],
          DESCRIPTION: item.data['DESCRIPTION']
        }));
        const formattedResult = extractedData.map(item => (
          `UFO_SHAPE: ${item.UFO_SHAPE}, ENCOUNTER_DURATION: ${item.ENCOUNTER_DURATION}, DESCRIPTION: ${item.DESCRIPTION}`
        )).join('<br />');

        setYearRegionInfoResult(formattedResult);
        setShowResult(true);
      } else if ('message' in response.data) {
        setYearRegionInfoResult(response.data.message);
        setShowResult(false);
      } else {
        setYearRegionInfoResult('Unexpected response format');
        setShowResult(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setYearRegionInfoResult("");
      setShowResult(false);
    }
  };

  const years = Array.from({ length: 125 }, (_, index) => 1900 + index); // Generate an array of years from 1900 to 2024

  return (
    <Container>
      <Box>
        <TextField
          label="Region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          style={{ marginRight: 10 }}
        />
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
          onClick={handleRetrieveYearRegionClick}
          disabled={!region.trim() || !year.trim()}
        >
          Retrieve Year Region Info
        </Button>
        {!showResult && yearRegionInfoResult && (
 <Typography style={{
            marginTop: 10,
            color: "#000",
          }} variant="body1">
             {yearRegionInfoResult}
          </Typography>
)}
        {showResult && yearRegionInfoResult && (
          <>
            <table style={{ width: '100%', marginTop: 10 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>UFO_SHAPE</th>
                  <th style={{ textAlign: 'center' }}>ENCOUNTER_DURATION</th>
                  <th style={{ textAlign: 'center' }}>DESCRIPTION</th>
                </tr>
              </thead>
              <tbody>
                {yearRegionInfoResult.split('<br />').map((line, index) => {
                  const [ufoShape, duration, description] = line.match(/UFO_SHAPE: (.+), ENCOUNTER_DURATION: (.+), DESCRIPTION: (.+)/).slice(1);
                  return (
                    <tr key={index}>
                      <td style={{ textAlign: 'center' }}>{ufoShape}</td>
                      <td style={{ textAlign: 'center' }}>{duration}</td>
                      <td style={{ textAlign: 'center' }}>{description}</td>
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

export default YearRegionInfo;
