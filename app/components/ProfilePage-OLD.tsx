"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import SearchMessage from "./SearchMessage";
import ClearButton from "./ClearButton";
import SelectMode from "./SelectMode";
import DebugToggleSwitch from "./DebugToggleSwitch";
// import { useRouter } from "next/router";
import { IconSend2 } from "@tabler/icons-react";
import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";
// import { usePathname, useSearchParams } from "next/navigation";
const url =
	"https://serverlessllmassistantstac-agentdatabucket67afdfb9-walrlyl2embi.s3.us-east-1.amazonaws.com/documents_processed.json";

interface Message {
	content: string;
	source_doc: string;
	file_name: string;
	score: number;
}
// import TableOne from "./TableOne";

const score = 0.5;
const source_doc = "https://www.google.com.vn";
const file_name = "test.pdf";
// const bgColor = "Hello";
const ProfilePage: React.FC = () => {
	const [fetchresult, setResponse] = useState([]);
	// let responsejson = useState([]);
	useEffect(() => {
		// Function to fetch data
		const fetchData = async () => {
			try {
				// Replace this URL with your actual JSON file URL
				const response = await fetch(url);

				// Check if the response is ok
				if (!response.ok) {
					throw new Error("Failed to fetch data");
				}

				// Parse the JSON data
				const result = await response.json();
				console.log(result);
				setResponse(result);
				// Update the state with fetched data
				// setData(result);
				// setIsLoading(false);
			} catch (err) {
				// Handle any errors during fetching
				// setError(err.message);
				// setIsLoading(false);
				console.log("Error fetching data: ", err);
			}
		};

		// Call the fetch function
		fetchData();
	}, []); // Empty dependency array means this effect runs once on component mount
	return (
		<div className="w-5/6  shadow-md sm:rounded-lg border ml-4">
			<table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
				<thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
					<tr>
						<th scope="col" className="px-6 py-3 w-5/12">
							Document link
						</th>
						<th scope="col" className="px-6 py-3 w-1/12">
							Name
						</th>
						<th scope="col" className="px-6 py-3 w-1/1	2">
							Job
						</th>
						<th scope="col" className="px-6 py-3 w-1/12">
							Pages
						</th>
						<th scope="col" className="px-6 py-3 ">
							Action
						</th>
					</tr>
				</thead>
				<tbody>
					{fetchresult.map((doc: any, index) => (
						<tr key={index}>
							<td
								scope="row"
								className="px-6 py-4 font-medium whitespace-nowrap max-w-[500px] truncate underline text-blue-500 "
							>
								c<a href={doc.source_location}>{doc.source_location}</a>
							</td>
							<td className="px-6 py-4">{doc.name}</td>
							<td className="px-6 py-4">{doc.metadata.job}</td>
							<td className="px-6 py-4">{doc.pages.length}</td>
							<td className="px-6 py-4">
								<Link
									href={`/profile/1?name=${doc.source_location}`}
									className="font-medium text-blue-600 hover:underline"
								>
									INTERACT
								</Link>
							</td>
						</tr>
					))}
					{/* <tr className="odd:bg-white  even:bg-gray-50 ">
						<td
							scope="row"
							className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap max-w-[500px] truncate "
						>
							This is a very long text that will be truncated with an ellipsis
							using the truncate class This is a very long text that will be
							truncated with an ellipsis using the truncate class This is a very
							long text that will be truncated with an ellipsis using the
							truncate class using the truncate class This is a very long text
							that will be truncated with an ellipsis using the truncate class
							This is a very long text that will be truncated with an ellipsis
							using the truncate class
						</td>
						<td className="px-6 py-4">VuLinh.pdf</td>
						<td className="px-6 py-4">Data</td>
						<td className="px-6 py-4">2</td>
						<td className="px-6 py-4">
							<a href="#" className="font-medium text-blue-600 hover:underline">
								INTERACT
							</a>
						</td>
					</tr> */}
				</tbody>
			</table>
		</div>
	);
};

export default ProfilePage;
