"use client"
import React, { useState } from 'react';
import axios from 'axios';
import { Button, Container, Typography, Box, Select, MenuItem, TextField } from "@mui/material";

const ShapeMonthInfo = () => {
  const [shape, setShape] = useState('');
  const [month, setMonth] = useState('');
  const [shapeMonthInfoResult, setShapeMonthInfoResult] = useState("");
  const [showResult, setShowResult] = useState(false);

  const handleRetrieveShapeMonthClick = async () => {
    if (!shape.trim() || !month.trim()) {
      return;
    }
    try {
      const response = await axios.get(`http://localhost:20004/retrieve_shape_month/${shape}/${month}`);
      if (Array.isArray(response.data) && response.data.length > 0) {
          const extractedData = response.data.map(item => ({
              FILE_NAME: item.data['FILE NAME'],
              YEAR: item.data['YEAR'],
              REGION: item.data['REGION'],
              ENCOUNTER_DURATION: item.data['ENCOUNTER DURATION'],
              DESCRIPTION: item.data['DESCRIPTION']
          }));
          const formattedResult = extractedData.map(item => (
              `FILE_NAME: ${item.FILE_NAME}, YEAR: ${item.YEAR}, REGION: ${item.REGION}, ENCOUNTER_DURATION: ${item.ENCOUNTER_DURATION}, DESCRIPTION: ${item.DESCRIPTION}`
          )).join('<br />');
          setShapeMonthInfoResult(formattedResult);
          setShowResult(true);
      }else if ('message' in response.data) {
        setShapeMonthInfoResult(response.data.message);
        setShowResult(false);
      } else {
        setShapeMonthInfoResult('Unexpected response format');
        setShowResult(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setShapeMonthInfoResult("");
      setShowResult(false);
    }
  };

  const months = Array.from({ length: 12 }, (_, index) => {
  const monthNumber = index + 1;
  return monthNumber < 10 ? `0${monthNumber}` : `${monthNumber}`;
});

  return (
    <Container>
      <Box>
        <TextField
          label="Shape"
          value={shape}
          onChange={(e) => setShape(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <Select
  label="Month"
  value={month}
  onChange={(e) => setMonth(String(e.target.value))}
  style={{ marginRight: 10 }}
>
  {months.map((m) => (
    <MenuItem key={m} value={m}>
      {m}
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
          onClick={handleRetrieveShapeMonthClick}
          disabled={!shape.trim() || !month.trim()}
        >
          Retrieve Shape Month Info
        </Button>
{!showResult && shapeMonthInfoResult && (
 <Typography style={{
            marginTop: 10,
            color: "#000",
          }} variant="body1">
             {shapeMonthInfoResult}
          </Typography>
)}
        {showResult && shapeMonthInfoResult && (
          <>
            <table style={{ width: '100%', marginTop: 10 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>FILE_NAME</th>
                  <th style={{ textAlign: 'center' }}>YEAR</th>
                  <th style={{ textAlign: 'center' }}>REGION</th>
                  <th style={{ textAlign: 'center' }}>ENCOUNTER_DURATION</th>
                  <th style={{ textAlign: 'center' }}>DESCRIPTION</th>
                </tr>
              </thead>
              <tbody>
                {shapeMonthInfoResult.split('<br />').map((line, index) => {
                  const [fileName, year, region, duration, description] = line.match(/FILE_NAME: (.+), YEAR: (.+), REGION: (.+), ENCOUNTER_DURATION: (.+), DESCRIPTION: (.+)/).slice(1);
                  return (
                    <tr key={index}>
                      <td style={{ textAlign: 'center' }}>{fileName}</td>
                      <td style={{ textAlign: 'center' }}>{year}</td>
                      <td style={{ textAlign: 'center' }}>{region}</td>
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

export default ShapeMonthInfo;