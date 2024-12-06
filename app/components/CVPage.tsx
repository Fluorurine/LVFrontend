"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";
interface ChildProps {
	docId: string;
}
const DocumentTable: React.FC<ChildProps> = ({ docId }) => {
	const [data, setData] = useState([]);
	// const [loading, setLoading] = useState(false);
	// const [error, setError] = useState(null);
	// const [page, setPage] = useState(1);
	// const [pageSize] = useState(10);
	// const [totalRecords, setTotalRecords] = useState(0); // Total items in the database
	// const [searchName, setSearchName] = useState("");
	// const [searchCategory, setSearchCategory] = useState("");
	// const [sortByDate, setSortByDate] = useState("desc");
	const rest_api_endpoint =
		(process.env.NEXT_PUBLIC_API_ENDPOINT ?? "") + "/get";

	const fetchData = async () => {
		const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
		const userAttributes = await fetchUserAttributes();

		//`${rest_api_endpoint}?page=${page}&page_size=${pageSize}&search_name=${searchName}&search_category=${searchCategory}&sort_by_date=${sortByDate}`

		const data = {
			action: "fetch_cv_by_id",
			// session_id: userAttributes.sub,
			// page: page,
			// page_size: pageSize,
			// search_name: searchName,
			// search_category: searchCategory,
			// sort_by_date: sortByDate,
		};
		// setLoading(true);
		// setError(null);

		// 	try {
		// 		console.log(`${rest_api_endpoint}`);
		// 		const response = await fetch(`${rest_api_endpoint}`, {
		// 			method: "POST",
		// 			headers: {
		// 				"Content-Type": "application/json",
		// 				Authorization: authToken || "",
		// 			},
		// 			body: JSON.stringify(data),
		// 		});
		// 		if (!response.ok) {
		// 			throw new Error("Failed to fetch documents");
		// 		}
		// 		const result = await response.json();
		// 		console.log(result);
		// 		// console.log(result.body.json());
		// 		setData(JSON.parse(result.body).data);
		// 		setTotalRecords(JSON.parse(result.body).total_records); // Set the total number of records
		// 	} catch (err: any) {
		// 		setError(err.message);
		// 	} finally {
		// 		setLoading(false);
		// 	}
	};

	// useEffect(() => {
	// 	fetchData();
	// }, [page, searchCategory, sortByDate]);
	// const totalPages = Math.ceil(totalRecords / pageSize); // Calculate total pages

	// const handleSearch = () => {
	// 	setPage(1); // Reset to the first page on new search
	// 	fetchData();
	// };

	return (
		<div className="w-full  shadow-md sm:rounded-lg border ml-4">
			<h1>This is {docId}</h1>
		</div>
	);
};

export default DocumentTable;
