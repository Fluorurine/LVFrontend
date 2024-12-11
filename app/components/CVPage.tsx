"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import ChatMessage from "./ChatMessage";
import ClearButton from "./ClearButton";
import SelectMode from "./SelectMode";
import { IconSend2 } from "@tabler/icons-react";

interface ChildProps {
	docId: string;
}

interface Message {
	content: string;
	isUser: boolean;
}
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
	"pdfjs-dist/build/pdf.worker.min.mjs",
	import.meta.url
).toString();
const CVPage: React.FC<ChildProps> = ({ docId }) => {
	// const [data, setData] = useState([]);
	const [sessionId, setSessionId] = useState("");
	const [loading, setLoading] = useState(true);
	const [authToken, setAuthToken] = useState("");
	const [numPages, setNumPages] = useState<number>(1);
	const [pageNumber, setPageNumber] = useState<number>(1);
	const [file_source, setFileSource] = useState<string>("");
	const [page_content, setPageContent] = useState<string>("");

	function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
		setNumPages(numPages);
	}
	// const [loading, setLoading] = useState(false);
	// const [error, setError] = useState(null);
	// const [page, setPage] = useState(1);
	// const [pageSize] = useState(10);
	// const [totalRecords, setTotalRecords] = useState(0); // Total items in the database
	// const [searchName, setSearchName] = useState("");
	// const [searchCategory, setSearchCategory] = useState("");
	// const [sortByDate, setSortByDate] = useState("desc");

	const fetchData = async () => {
		//`${rest_api_endpoint}?page=${page}&page_size=${pageSize}&search_name=${searchName}&search_category=${searchCategory}&sort_by_date=${sortByDate}`
		if (authToken == "" || sessionId == "") {
			setLoading(true);
			try {
				const authToken =
					(await fetchAuthSession()).tokens?.idToken?.toString() ?? "";
				const userAttributes = (await fetchUserAttributes()) ?? {};
				if (userAttributes.sub == undefined) {
					userAttributes.sub = "";
					return;
				}
				setAuthToken(authToken);
				setSessionId(userAttributes.sub);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(true);
			}
		}
		if (authToken != "" && sessionId != "") {
			const data = {
				action: "fetch_cv_by_id",
				session_id: sessionId,
				file_id: docId,
			};
			setLoading(true);

			try {
				const rest_api_endpoint =
					(process.env.NEXT_PUBLIC_API_ENDPOINT ?? "") + "/get";
				const response = await fetch(`${rest_api_endpoint}`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: authToken || "",
					},
					body: JSON.stringify(data),
				});
				if (!response.ok) {
					throw new Error("Failed to fetch documents");
				}

				const result = await response.json();
				console.log(result);
				let cv_data = JSON.parse(result.body)[0];
				// console.log(cv_data);
				setFileSource(cv_data.doc_url);
				setPageContent(cv_data.page_content);
				// setData(JSON.parse(result.body).data);
				// setTotalRecords(JSON.parse(result.body).total_records); // Set the total number of records
			} catch (err: any) {
				// setError(err.message);
			} finally {
				setLoading(false);
			}
		}
	};

	useEffect(() => {
		fetchData();
	}, [authToken, sessionId]);
	// ----------------------------------------------------------
	const [messages, setMessages] = useState<Message[]>([]);

	const messageContainerRef = useRef<HTMLDivElement>(null);
	const handleSendMessage = async (message: string) => {
		const defaultErrorMessage =
			"Error while preparing your answer. Check your connectivity to the backend.";
		// fetch the cognito authentication tokens to use with the API call.
		const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
		const userAttributes = await fetchUserAttributes();
		// Append the user's input message to the message container immediately
		setMessages((prevMessages) => [
			...prevMessages,
			{ content: message, isUser: true },
		]);

		// Call the API to get the response
		const rest_api_endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT ?? "";
		try {
			const response = await fetch(rest_api_endpoint, {
				// mode: "no-cors",
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: authToken || "",
				},
				// Currently we use the cognito user.sub as a session_id
				// this needs to be updated if one wants to store multiple chats for the same user.
				body: JSON.stringify({
					user_input: message,
					session_id: userAttributes.sub,
					page_content: page_content,
					// clean_history: clean_history,
					chatbot_type: "chatcv",
				}),
			});
			const responseData = await response.json();
			// Add the response to the messages state after receiving it
			// setCleanHistory(false);
			// const responseData = {
			// 	response:
			// 		// "Hello Test nhe lorem ipsum Hello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsumHello Test nhe lorem ipsum",
			// 		page_content,
			// 	errorMessage: "",
			// };
			let AIMessage: Message;
			if (responseData.errorMessage) {
				AIMessage = {
					content: `Error: ${
						responseData.errorMessage
					}\n\nDetails: \n\n\`\`\`\n\n${JSON.stringify(
						responseData,
						null,
						2
					)}\n\n\`\`\``,
					isUser: false,
				};
			} else if (responseData.errorMessage) {
				AIMessage = { content: defaultErrorMessage, isUser: false };
			} else {
				AIMessage = { content: responseData.response, isUser: false };
			}
			setMessages((prevMessages) => [...prevMessages, AIMessage]);
		} catch {
			setMessages((prevMessages) => [
				...prevMessages,
				{ content: defaultErrorMessage, isUser: false },
			]);
		}
	};

	// ----------------------------------------------------------
	return (
		<div className="w-full  shadow-md sm:rounded-lg  ml-4">
			{/* eslint-enable react/no-unescaped-entities */}
			{/* <h1>Thông tin CV của bạn:</h1> */}
			<div className="flex flex-row justify-start">
				<div className="w-[750]">
					{loading ? (
						<div>Loading...</div>
					) : (
						<Document file={file_source} onLoadSuccess={onDocumentLoadSuccess}>
							{/* {Array.from(new Array(numPages), (_el, index) => ( */}
							<Page
								// key={`page_${index + 1}`}
								// pageNumber={index + 1}
								pageNumber={pageNumber}
								width={750}
							/>
							{/* ))} */}
						</Document>
					)}
					<div className="px-auto flex justify-center items-center border-t pt-3">
						<button
							onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
							disabled={pageNumber === 1}
							className="bg-gray-300 p-2 mr-2 hover:cursor-pointer rounded hover:bg-slate-400 disabled:opacity-50 "
						>
							Trở lại
						</button>
						<span>
							Trang {pageNumber} của {numPages}
						</span>
						<button
							onClick={() =>
								setPageNumber((prev) => Math.min(prev + 1, numPages))
							}
							disabled={pageNumber === numPages}
							className="bg-gray-300 p-2 ml-2 hover:cursor-pointer rounded hover:bg-slate-400 disabled:opacity-50"
						>
							Tiếp theo
						</button>
					</div>
					{/* <p>
							Page {pageNumber} of {numPages}
						</p> */}
				</div>

				<div className="bg-white px-4 pb-2 rounded-lg shadow-sm w-1/2 border ml-5 ">
					<div className="space-y-4">
						<div
							ref={messageContainerRef}
							className="h-[calc(100vh-260px)] px-4 overflow-hidden hover:overflow-y-scroll bg-gray-50 border-b border-gray-200"
						>
							{messages.map((message, index) => (
								<ChatMessage
									key={index}
									content={message.content}
									isUser={message.isUser}
								/>
							))}
						</div>
						{!loading ? (
							<div className="flex space-x-2 ">
								<input
									id="chat-message-input"
									className="flex-1 p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring focus:border-blue-500 "
									type="text"
									placeholder="Nhập thông tin bạn cần tra cứu trên CV này..."
									onKeyDown={(e) => {
										// send message on enter if not empty
										if (e.key === "Enter") {
											// if (e.currentTarget.value !== "") {
											// 	handleSendMessage(e.currentTarget.value);
											// 	e.currentTarget.value = "";
											// }
										}
									}}
									autoComplete="off"
								/>
								<button
									className="px-2 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-600 focus:outline-none  focus:bg-blue-600 flex items-center"
									onClick={() => {
										const inputElement = document.getElementById(
											"chat-message-input"
										) as HTMLInputElement;
										const message = inputElement.value.trim();
										// send message on button click if not empty
										if (message !== "") {
											handleSendMessage(message);
											inputElement.value = "";
										}
									}}
								>
									Gửi
									<IconSend2 className="h-5 w-5 text-white ml-2" />
								</button>
							</div>
						) : (
							<span className="text-center mt-3 text-black">
								Vui lòng chờ tệp tin tải xong...
							</span>
						)}

						<div className="flex justify-between mt-2 items-center w-full"></div>
					</div>
				</div>
			</div>
			{/* eslint-enable react/no-unescaped-entities */}
		</div>
	);
};

export default CVPage;
