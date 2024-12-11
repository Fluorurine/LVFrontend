// import { ButtonGroup } from "@aws-amplify/ui-react";
import React from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useState } from "react";
interface SearchMessageProps {
	content: string;
	score: number;
	source_doc: string;
	file_name: string;
}
function numberToColor(value: number): string {
	// Ensure the value is between 0 and 1
	value = Math.max(0, Math.min(1, value));

	// Calculate red and green components
	// When value is 0, it's fully green (0,255,0)
	// When value is 1, it's fully red (255,0,0)
	const red = Math.floor(value * 255);
	const green = Math.floor((1 - value) * 255);

	// Convert to hex, ensuring two-digit representation
	const hexColor = `#${red.toString(16).padStart(2, "0")}${green
		.toString(16)
		.padStart(2, "0")}00`;

	return hexColor;
}
const SearchMessage: React.FC<SearchMessageProps> = ({
	content,
	score,
	source_doc,
	file_name,
}) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const toggleText = () => {
		setIsExpanded(!isExpanded);
	};
	// console.log("Rendering" + score);
	// var score: number = score;
	// const score = 0.9;
	// console.log(numberToColor(score));
	// console.log("bg-[" + numberToColor(score) + "]");
	// Use green for user, blue for AI
	// const bgColor = bg;
	// console.log(bg);
	// const bgColor = "bg-[#19e500]";
	// const bgColor = bg;0=
	const bgColor = numberToColor(score);
	const scorefin = parseFloat((1 - score).toFixed(3)).toString();
	// console.log(bg == bgColor);
	// const bgColor = "bg-[#cc3300]";

	return (
		<div className="my-4">
			{
				<div className="flex items-start space-x-2">
					<div
						className={`w-16 h-16 flex-shrink-0 flex items-center font-semibold justify-center my-auto text-white`}
						style={{
							backgroundColor: bgColor,
						}}
					>
						{scorefin}
					</div>

					<div className=" bg-slate-100 p-3 rounded-lg shadow-md flex-grow my-auto">
						<p className=" font-bold">
							Sorce location :{" "}
							<a
								className="underline text-blue-500 font-bold"
								href={source_doc}
								target="_blank"
								rel="noopener noreferrer"
							>
								{file_name}
							</a>
						</p>
						<div
							className={`text-gray-600 break-words text-wrap transition-all duration-300 ${
								isExpanded ? "" : "line-clamp-3"
							}`}
						>
							<Markdown
								className=" max-w-[135ch] prose "
								rehypePlugins={[rehypeRaw]}
								components={{
									// Handle the custom 'highlight' tag
									span: ({ children }) => (
										<span
											style={{ backgroundColor: "yellow", padding: "0 2px" }}
										>
											{children}
										</span>
									),
								}}
							>
								{content}
							</Markdown>
						</div>
						<button
							onClick={toggleText}
							className="mt-2 text-blue-500 font-bold text-base focus:outline-none"
						>
							{isExpanded ? "Show Less" : "Show More"}
						</button>
					</div>
					<div className="w-10 h-10"></div>
				</div>
			}
		</div>
	);
};
export default SearchMessage;
