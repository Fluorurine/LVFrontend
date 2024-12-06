import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";

interface FileData {
	fileName: string;
	fileType: string;
	fileContent: string;
	category: string;
}

const UploadComponent: React.FC = () => {
	const [files, setFiles] = useState<File[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [category, setCategory] = useState<string | null>("Data");
	// Handle file drops with validation
	const onDrop = useCallback((acceptedFiles: File[]) => {
		setError(null); // Reset error on new drop

		const validFiles = acceptedFiles.filter((file) => {
			if (file.type !== "application/pdf") {
				setError(`${file.name} is not a PDF file.`);
				return false;
			}
			if (file.size > 5 * 1024 * 1024) {
				// 5MB
				setError(`${file.name} exceeds the 5MB file size limit.`);
				return false;
			}
			return true;
		});

		if (validFiles.length > 0) {
			setFiles((prevFiles) => [...prevFiles, ...validFiles]);
		}
	}, []);

	// Remove a file from the list
	const removeFile = (index: number) => {
		setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
	};
	// Handle category selection
	const selectCategory = (selectedCategory: string) => {
		setCategory(selectedCategory);
	};

	// Handle file submission
	const handleSubmit = async () => {
		console.log("first");
		if (files.length === 0) {
			setError("No files to upload");
			return;
		}
		if (!category) {
			setError("Please select a category before submitting");
			return;
		}

		try {
			const fileDataArray: FileData[] = await Promise.all(
				files.map(async (file) => {
					const fileContent = await file.arrayBuffer();
					const base64Content = btoa(
						new Uint8Array(fileContent).reduce(
							(data, byte) => data + String.fromCharCode(byte),
							""
						)
					);
					return {
						fileName: file.name,
						fileType: file.type,
						fileContent: base64Content,
						category,
					};
				})
			);

			// fetch the cognito authentication tokens to use with the API call.
			const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
			const userAttributes = await fetchUserAttributes();
			const rest_api_endpoint =
				(process.env.NEXT_PUBLIC_API_ENDPOINT ?? "") + "/api";
			const data = { session_id: userAttributes.sub, files: fileDataArray };
			console.log(data);
			try {
				// ---------------------------------------OLD
				// const response = await fetch(rest_api_endpoint, {
				// 	// mode: "no-cors",
				// 	method: "POST",
				// 	headers: {
				// 		"Content-Type": "application/json",
				// 		Authorization: authToken || "",
				// 	},
				// 	// Currently we use the cognito user.sub as a session_id
				// 	// this needs to be updated if one wants to store multiple chats for the same user.
				// 	body: JSON.stringify({
				// 		session_id: userAttributes.sub,
				// 	}),
				// });
				// const responseData = await response.json();
				// console.log(responseData);
				// // Add the response to the messages state after receiving it
				// ---------------------------------------NEW
				// Make API call to AWS Lambda directly
				const response = await fetch(rest_api_endpoint, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: authToken || "",
					},
					body: JSON.stringify(data),
				});

				if (!response.ok) {
					throw new Error(`Upload failed: ${response.statusText}`);
				}

				const result = await response.json();
				// console.log(`Success: ${result.uploadResults}`);
				console.log(result);

				// Clear files on successful upload
				setFiles([]);
				setCategory("Data");
			} catch {
				console.log("Lỗi kết nối");
			}
		} catch (error) {
			setError(
				`Error uploading files: ${(error as Error).message || "Unknown error"}`
			);
		}
	};

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
	});

	return (
		<div>
			<div
				{...getRootProps()}
				style={{
					border: "2px dashed #ccc",
					padding: "20px",
					marginBottom: "10px",
				}}
			>
				<input {...getInputProps()} />
				<p>Drag & drop your PDF files here, or click to select files</p>
			</div>

			{error && <p style={{ color: "red" }}>{error}</p>}

			{files.length > 0 && (
				<ul>
					{files.map((file, index) => (
						<li key={index} style={{ display: "flex", alignItems: "center" }}>
							<span style={{ flex: 1 }}>{file.name}</span>
							<button
								onClick={() => removeFile(index)}
								style={{
									marginLeft: "10px",
									padding: "5px 10px",
									backgroundColor: "#ff4d4f",
									color: "#fff",
									border: "none",
									cursor: "pointer",
								}}
							>
								Remove
							</button>
						</li>
					))}
				</ul>
			)}
			<div style={{ marginTop: "10px" }}>
				<button
					onClick={() => selectCategory("Data")}
					style={{
						marginRight: "10px",
						padding: "10px 20px",
						backgroundColor: category === "Data" ? "#f94449" : "#ccc",
						color: "#fff",
						border: "none",
						cursor: "pointer",
					}}
				>
					Data Category
				</button>
				<button
					onClick={() => selectCategory("Fullstack")}
					style={{
						padding: "10px 20px",
						backgroundColor: category === "Fullstack" ? "#f94449" : "#ccc",
						color: "#fff",
						border: "none",
						cursor: "pointer",
					}}
				>
					Fullstack Category
				</button>
			</div>
			<button
				onClick={handleSubmit}
				style={{
					marginTop: "10px",
					padding: "10px 20px",
					backgroundColor: "#007bff",
					color: "#fff",
					border: "none",
					cursor: "pointer",
				}}
				disabled={files.length === 0 || !category}
			>
				Submit Files
			</button>
		</div>
	);
};

export default UploadComponent;
