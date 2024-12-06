"use client";

import React, { useState, useEffect, useRef } from "react";
import SearchMessage from "./SearchMessage";
import ClearButton from "./ClearButton";
import SelectMode from "./SelectMode";
import DebugToggleSwitch from "./DebugToggleSwitch";
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

const score = 0.5;
const source_doc = "https://www.google.com.vn";
const file_name = "test.pdf";
// const bgColor = "Hello";
const ChatApp: React.FC = () => {
	const [messages, setMessages] = useState<Message[]>([
		// {
		// 	content:
		// 		"HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHellHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHellooHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHellHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHellooHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHellHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHeHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHellHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHellooHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHellHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHellooHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHellHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHellooHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHellolloHelloHelloHelloHelloHelloHellooHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello",
		// 	score: score,
		// 	source_doc: source_doc,
		// 	file_name: file_name,
		// },
		// {
		// 	content: "Hello",
		// 	score: score,
		// 	source_doc: source_doc,
		// 	file_name: file_name,
		// },
	]);
	const [clean_history, setCleanHistory] = useState<boolean>(false);
	const [debugMode, setDebugMode] = useState(false);
	const [assistantMode, setAssistantMode] = useState<"basic" | "agentic">(
		"basic"
	);

	const messageContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const storedDebugMode = localStorage.getItem("debugMode");
		setDebugMode(storedDebugMode === "true");

		const storedAssistantMode = localStorage.getItem("assistantMode");
		setAssistantMode(storedAssistantMode === "agentic" ? "agentic" : "basic");
	}, []);

	const handleSendMessage = async (message: string) => {
		const defaultErrorMessage =
			"Đã có sự cố xảy ra trong quá trình lấy dữ liệu. Vui lòng thử lại";
		// fetch the cognito authentication tokens to use with the API call.
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
			console.log("Sening");
			const testmsg = `Designing navigation and manipulation interface for Fetch Manipulator Robot platforms using Python and ROS.
o Building Object Oriented Programming classes to control Fetch Robot on low-level.
o Applying AprilTag3D to track objects of interest’s positions in camera frame.
o Subscribing to Robot Operation System (ROS) with Rospy to update robot’s joint states in real-time.
o Performing matrix transformation to transform among different frames of Fetch using Numpy.
• Designed a wearable device for data collector that enable robot sensors (LiDAR, 3D camera, Odometry).
• Led a team of 13 people to collect more than 20 hours of socially-complaint human navigation dataset for robot learning.
o Published an academic paper to International Conference on Intelligent Robots and System (IROS)
Research Engineer | Department of Electrical Engineering, Miami University | OH, USA August 2020 – December 2021
• Implemented Deep Deterministic Policy Gradient in Pytorch to optimally control Unmanned Aerial Vehicles in group.
• Developed a Python simulation enabling feedback from ground-based users, enhancing the overall UAV system.
• Built an interactive graph with JavaScript and Python that can visualize causal relationships.
• Published a book chapter to Broadband Communications, Computing, and Control for Ubiquitous Intelligence.`;
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
			// Add the response to the messages state after receiving it
			// setCleanHistory(false);
			// let AIMessage: Message;
			// if (responseData.errorMessage && debugMode) {
			// 	AIMessage = {
			// 		content: `Error: ${
			// 			responseData.errorMessage
			// 		}\n\nDetails: \n\n\`\`\`\n\n${JSON.stringify(
			// 			responseData,
			// 			null,
			// 			2
			// 		)}\n\n\`\`\``,
			// 		isUser: false,
			// 	};
			// } else if (responseData.errorMessage) {
			// 	AIMessage = { content: defaultErrorMessage, isUser: false };
			// } else {
			// 	AIMessage = { content: responseData.response, isUser: false };
			// }
			// setMessages((prevMessages) => [...prevMessages, AIMessage]);
		} catch {
			// setMessages((prevMessages) => [
			// 	...prevMessages,
			// 	{
			// 		content: defaultErrorMessage,
			// 		score: score,
			// 		source_doc: source_doc,
			// 		file_name: file_name,
			// 	},
			// ]);
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
						className="px-2 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-2 focus:bg-blue-600 flex items-center"
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
				<div className="flex justify-between mt-2 items-center w-full">
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
				</div>
			</div>
		</div>
	);
};

export default ChatApp;
