"use client";

import React, { useState, useEffect, useRef } from "react";
import SearchMessage from "./SearchMessage";

// import { useRouter } from "next/router";
import { IconSend2 } from "@tabler/icons-react";
import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";
// import { usePathname, useSearchParams } from "next/navigation";
interface Message {
	content: string;
	source_doc: string;
	file_name: string;
	score: number;
}

// const bgColor = "Hello";
const ChatApp: React.FC = () => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [clean_history, setCleanHistory] = useState<boolean>(false);
	const [loading, setLoading] = useState(false);
	const messageContainerRef = useRef<HTMLDivElement>(null);

	const handleSendMessage = async (message: string) => {
		const defaultErrorMessage =
			"Đã có sự cố xảy ra trong quá trình lấy dữ liệu. Vui lòng thử lại";
		// fetch the cognito authentication tokens to use with the API call if dont have already yet.

		const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
		const userAttributes = await fetchUserAttributes();
		// Append the user's input message to the message container immediately
		// setMessages((prevMessages) => [
		// 	...prevMessages,
		// 	{
		// 		content: message,
		// 		score: score,
		// 		source_doc: source_doc,
		// 		file_name: file_name,
		// 	},
		// ]);

		// Call the API to get the response
		const rest_api_endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT ?? "";
		try {
			setLoading(true);
			// console.log("Sening");
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
					clean_history: clean_history,
					chatbot_type: "rag",
				}),
			});
			const responseData = await response.json();
			const responseData2 = JSON.parse(responseData.response);
			console.log(responseData2);
			setLoading(false);

			let searcharray: Message[] = [];
			responseData2.forEach((response: any) => {
				searcharray.push({
					content: response.page_content,
					score: response.score,
					source_doc: response.metadata.document_source_location,
					file_name: response.metadata.file_name,
				});
			});
			console.log(searcharray);
			setMessages(searcharray);
		} catch {
			console.log("Có lỗi xảy ra trong quá trình tương tác dữ liệu từ server");
		}
	};

	// below useEffect handles automatic scroll down when the messages content
	// overflows the container.
	useEffect(() => {
		if (messageContainerRef.current) {
			messageContainerRef.current.scrollTop =
				messageContainerRef.current.scrollHeight;
		}
	}, [messages]);
	// const router = useSearchParams();
	// const id = router.get("id");
	// console.log(router);
	return (
		<div className="bg-white px-4 pb-2 rounded-lg shadow-sm w-full ">
			<div className="space-y-4">
				<div className="flex space-x-2 ">
					<textarea
						id="chat-message-input"
						className="flex-1 p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring focus:border-blue-500"
						// type="textarea"
						// rows=5
						rows={10}
						placeholder="Nhập miêu tả từ JD của bạn..."
						onKeyDown={(e) => {
							// send message on enter if not empty
							// if (e.key === "Enter") {
							// 	if (e.currentTarget.value !== "") {
							// 		handleSendMessage(e.currentTarget.value);
							// 		e.currentTarget.value = "";
							// 	}
							// }
						}}
						autoComplete="off"
					></textarea>
					<button
						className="px-2 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 flex items-center"
						onClick={() => {
							const inputElement = document.getElementById(
								"chat-message-input"
							) as HTMLInputElement;
							const message = inputElement.value.trim();
							// send message on button click if not empty
							if (message !== "") {
								handleSendMessage(message);
								// inputElement.value = "";
							}
						}}
					>
						Gửi
						<IconSend2 className="h-5 w-5 text-white ml-2" />
					</button>
				</div>
				{/* ---------------------------------------------------------------------------------- */}
				<div
					ref={messageContainerRef}
					className="h-[calc(100vh-260px)] px-4 overflow-hidden hover:overflow-y-scroll border-t border-gray-200 "
				>
					{loading && (
						<div className="text-center mt-3 text-gray-500">
							Vui lòng chờ trong lúc hệ thống gửi dữ liệu...
						</div>
					)}

					{messages.length === 0 && (
						<div className="text-center mt-3 text-gray-500">
							Không có dữ liệu
						</div>
					)}

					{messages.map((message, index) => (
						<SearchMessage
							key={index}
							content={message.content}
							// bg={bgColor}
							score={message.score}
							source_doc={message.source_doc}
							file_name={message.file_name}
							// isUser={message.isUser}
						/>
					))}
				</div>
				{/* <div className="flex justify-between mt-2 items-center w-full">
					<DebugToggleSwitch onToggle={(value) => setDebugMode(value)} />
					<SelectMode
						onClick={(mode) => {
							setAssistantMode(mode);
						}}
					/>
					<ClearButton
						onClick={() => {
							// Handle clearing the conversation
							setMessages([]);
							setCleanHistory(true);
						}}
					/>
				</div> */}
			</div>
		</div>
	);
};

export default ChatApp;
