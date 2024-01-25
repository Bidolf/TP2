"use client"
import React, { useState } from 'react';
import axios from 'axios';
import { Button, Container, Typography, Box, TextField } from "@mui/material";

const AddFile = () => {
	const [fileName, setFileName] = useState('');
	const [addFileResult, setAddFileResult] = useState("");
	const [showResult, setShowResult] = useState(false);

	const handleAddFileClick = async () => {
		if (!fileName.trim()) {
			return;
		}
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
			setAddFileResult("");
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
					onClick={handleAddFileClick}
					disabled={!fileName.trim()}
				>
					Add File
				</Button>
				{showResult && addFileResult && (
					<Typography style={{
						marginTop: 10,
						color: "#000",
					}} variant="body1">
						{addFileResult}
					</Typography>
				)}
			</Box>
		</Container>
	);
};

export default AddFile;
