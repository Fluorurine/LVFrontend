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
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [doc, setDoc] = useState<any[]>([]);
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
		// console.log("first");
		setError(null);
		setLoading(true);
		setSuccess(false);
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
					// throw new Error(`Upload failed: ${response.statusText}`);
					console.log("Dữ liệu không hợp lệ");
				}

				const result = await response.json();
				setDoc(JSON.parse(result.body).uploadResults);
				// console.log(doc);
				setLoading(false);
				setSuccess(true);
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
				<p>
					Kéo hoặc thả các tệp PDF của bạn ở đây, hoặc nhấn click để chọn tệp
				</p>
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
								Xóa
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
					Danh mục Data
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
					Danh mục Fullstack
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
				Gửi tệp tin lên
			</button>
			{loading && <div>Đang tải lên...</div>}
			{success && <div>Đã tải lên thành công!</div>}
			{doc.length > 0 && (
				<div>
					<h2 className=" mt-[50px]">Kết quả tải lên:</h2>
					<ul>
						{doc.map((item, index) => (
							<li key={index}>
								{item.fileName} - {item.status} - {item.message}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export default UploadComponent;
