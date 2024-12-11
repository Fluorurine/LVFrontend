"use client";
// Tìm kiếm theo từ khóa
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
const SearchApp: React.FC = () => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState(false);
	const handleSendMessage = async (message: string) => {
		const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
		const userAttributes = await fetchUserAttributes();
		const sessionId = userAttributes.sub;
		//`${rest_api_endpoint}?page=${page}&page_size=${pageSize}&search_name=${searchName}&search_category=${searchCategory}&sort_by_date=${sortByDate}`

		// if (authToken != "" && sessionId != "") {
		const data = {
			action: "fetch_search",
			session_id: sessionId,
			page_size: 10,
			search_name: message,
		};

		setLoading(true);
		// setError(null);

		try {
			const rest_api_endpoint =
				(process.env.NEXT_PUBLIC_API_ENDPOINT ?? "") + "/get";
			// console.log(`${rest_api_endpoint}`);
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
			// const results = JSON.parse(result);
			console.log(result);
			const responseData2 = JSON.parse(result.body);
			let searcharray: Message[] = [];

			responseData2.forEach((response: any) => {
				searcharray.push({
					content: response.highlighted_content,
					score: response.score,
					source_doc: response.doc_url,
					file_name: response.file_name,
				});
			});

			setMessages(searcharray);
		} catch (err: any) {
			// setError(err.message);
			console.log(err.message);
		} finally {
			setLoading(false);
		}
	};
	// };
	const messageContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (messageContainerRef.current) {
			messageContainerRef.current.scrollTop =
				messageContainerRef.current.scrollHeight;
		}
	}, [messages]);

	return (
		<div className="bg-white px-4 pb-2 rounded-lg shadow-sm w-full ">
			<div className="space-y-4">
				<div className="flex space-x-2 ">
					<textarea
						id="chat-message-input"
						className="flex-1 p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring focus:border-blue-500"
						rows={5}
						placeholder="Nhập từ khóa cần tìm kiếm..."
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
					{/* check the length of message = 0 then render Loading */}

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
							score={1 - message.score}
							source_doc={message.source_doc}
							file_name={message.file_name}
							// isUser={message.isUser}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default SearchApp;
