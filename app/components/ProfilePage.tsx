"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";

const DocumentTable: React.FC = () => {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [totalRecords, setTotalRecords] = useState(0); // Total items in the database
	const [searchName, setSearchName] = useState("");
	const [searchCategory, setSearchCategory] = useState("");
	const [sortByDate, setSortByDate] = useState("desc");

	const fetchData = async () => {
		const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
		const userAttributes = await fetchUserAttributes();

		//`${rest_api_endpoint}?page=${page}&page_size=${pageSize}&search_name=${searchName}&search_category=${searchCategory}&sort_by_date=${sortByDate}`

		const data = {
			action: "fetch_cv",
			session_id: userAttributes.sub,
			page: page,
			page_size: pageSize,
			search_name: searchName,
			search_category: searchCategory,
			sort_by_date: sortByDate,
		};
		setLoading(true);
		setError(null);

		try {
			const rest_api_endpoint =
				(process.env.NEXT_PUBLIC_API_ENDPOINT ?? "") + "/get";
			console.log(`${rest_api_endpoint}`);
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
			// console.log(result.body.json());
			setData(JSON.parse(result.body).data);
			setTotalRecords(JSON.parse(result.body).total_records); // Set the total number of records
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [page, searchCategory, sortByDate]);
	const totalPages = Math.ceil(totalRecords / pageSize); // Calculate total pages

	const handleSearch = () => {
		setPage(1); // Reset to the first page on new search
		fetchData();
	};

	return (
		<div className="w-full  shadow-md sm:rounded-lg border ml-4">
			<h1 className="mt-5 ml-4 text-lg">Danh sách các tệp</h1>

			{/* Filters */}
			{/* <div
				style={{ marginBottom: "20px" }}
				className="border border-red-400 h-[50px] flex items-center"
			>
				<select
					value={searchCategory}
					onChange={(e) => setSearchCategory(e.target.value)}
					style={{ marginRight: "10px" }}
				>
					<option value="">All Categories</option>
					<option value="Data">Data</option>
					<option value="Fullstack">Fullstack</option>
				</select>
				<select
					value={sortByDate}
					onChange={(e) => setSortByDate(e.target.value)}
					style={{ marginRight: "10px" }}
				>
					<option value="desc">Newest First</option>
					<option value="asc">Oldest First</option>
				</select>
				<input
					type="text"
					placeholder="Search by name"
					value={searchName}
					onChange={(e) => setSearchName(e.target.value)}
					style={{ marginRight: "10px" }}
				/>
				<button onClick={fetchData} disabled={loading}>
					Search
				</button>
			</div> */}
			<div className="p-4">
				<input
					type="text"
					placeholder="Nhập tên để tìm kiếm"
					value={searchName}
					onChange={(e) => setSearchName(e.target.value)}
					className="border p-2 mr-2"
				/>
				<select
					// type="text"
					// placeholder="Search by Category"
					value={searchCategory}
					onChange={(e) => setSearchCategory(e.target.value)}
					className="border p-2 mr-2"
				>
					<option value="">All Categories</option>
					<option value="Data">Data</option>
					<option value="Fullstack">Fullstack</option>
				</select>
				<select
					value={sortByDate}
					onChange={(e) => setSortByDate(e.target.value)}
					className="border p-2 mr-2"
				>
					<option value="desc">Newest First</option>
					<option value="asc">Oldest First</option>
				</select>
				<button onClick={handleSearch} className="bg-blue-500 text-white p-2">
					Search
				</button>
			</div>
			{/* Error and Loading */}
			{error && <div style={{ color: "red" }}>Error: {error}</div>}

			{/* Document Table */}
			{/* {!loading && !error && documents.length > 0 && ( */}
			<table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
				<thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
					<tr>
						<th scope="col" className="px-6 py-3 w-4/12">
							Document link
						</th>
						<th scope="col" className="px-6 py-3 w-1/12 text-center">
							Status
						</th>
						<th scope="col" className="px-6 py-3 w-1/12 text-center">
							Name
						</th>
						<th scope="col" className="px-6 py-3 w-1/12 text-center">
							Job
						</th>
						<th scope="col" className="px-6 py-3 w-[100px] text-center">
							Pages
						</th>
						<th scope="col" className="px-6 py-3 w-1/12 text-center">
							Created At
						</th>
						<th scope="col" className="px-6 py-3 ">
							Action
						</th>
					</tr>
				</thead>
				<tbody>
					{loading ? (
						<tr>
							<td colSpan={6} className="text-center p-4">
								Loading...
							</td>
						</tr>
					) : (
						data.map((doc: any) => (
							<tr key={doc.id}>
								<td className="px-6 py-4 underline text-blue-500 font-medium whitespace-nowrap max-w-[400px] truncate">
									<a href={doc.doc_url}>{doc.doc_url}</a>
								</td>
								<td className="px-6 py-4 text-center">{doc.status}</td>
								<td className="px-6 py-4 ">{doc.file_name}</td>
								<td className="px-6 py-4 text-center">{doc.job}</td>
								<td className="px-6 py-4 text-center">{doc.pages}</td>
								<td className="px-6 py-4 text-center">
									{new Date(doc.created_at).toLocaleString()}
								</td>
								<td className="px-6 py-4">
									<Link
										href={`/profile/${doc.id}`}
										className="text-blue-600 underline"
									>
										Interact
									</Link>
								</td>
							</tr>
						))
					)}
					{/* <tr className="odd:bg-blue-50  even:bg-gray-50 ">
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

			{/* Pagination */}
			<div className="p-4">
				<button
					onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
					disabled={page === 1}
					className="bg-gray-300 p-2 mr-2"
				>
					Previous
				</button>
				<span>
					Page {page} of {totalPages}
				</span>
				<button
					onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
					disabled={page === totalPages}
					className="bg-gray-300 p-2 ml-2"
				>
					Next
				</button>
			</div>
		</div>
	);
};

export default DocumentTable;
