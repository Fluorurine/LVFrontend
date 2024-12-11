"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";
import { IconStarFilled } from "@tabler/icons-react";
import { IconStar } from "@tabler/icons-react";

const DocumentTable: React.FC = () => {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [totalRecords, setTotalRecords] = useState(0); // Total items in the database
	const [searchName, setSearchName] = useState("");
	const [searchCategory, setSearchCategory] = useState("");
	const [sortByDate, setSortByDate] = useState("desc");
	const [filterStarred, setFilterStarred] = useState("");
	const [sessionId, setSessionId] = useState("");
	const [authToken, setAuthToken] = useState("");
	const [status, setStatus] = useState("");
	// Phần Delete
	const [selectedRows, setSelectedRows] = useState<string[]>([]);
	const toggleRowSelection = (id: string) => {
		setSelectedRows((prev) =>
			prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
		);
	};
	const toggleSelectAll = () => {
		if (selectedRows.length === data.length) {
			setSelectedRows([]);
		} else {
			setSelectedRows(data.map((doc: any) => doc.id));
		}
	};
	const handleDelete = async () => {
		if (selectedRows.length === 0) {
			alert("No rows selected");
			return;
		}

		const confirmDelete = confirm(
			`Bạn có chắc muốn xóa ${selectedRows.length} dòng?`
		);
		console.log(selectedRows);
		if (!confirmDelete) return;
		try {
			const rest_api_endpoint =
				(process.env.NEXT_PUBLIC_API_ENDPOINT ?? "") + "/get";
			const response = await fetch(rest_api_endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: authToken,
				},
				body: JSON.stringify({
					ids: selectedRows,
					action: "batch_delete",
					session_id: sessionId,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to delete rows");
			}

			alert("Rows deleted successfully!");
			fetchData(); // Refresh the data
			setSelectedRows([]);
		} catch (error) {
			console.error("Error deleting rows:", error);
			alert("Failed to delete rows. Please try again.");
		}
	};
	// Hết phần delete
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
				action: "fetch_cv",
				session_id: sessionId,
				page: page,
				page_size: pageSize,
				search_name: searchName,
				search_category: searchCategory,
				sort_by_date: sortByDate,
				filter_starred: filterStarred,
				status: status,
			};
			setLoading(true);
			setError(null);

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
				setData(JSON.parse(result.body).data);
				setTotalRecords(JSON.parse(result.body).total_records); // Set the total number of records
			} catch (err: any) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}
	};

	useEffect(() => {
		setPage(1); // Reset to the first page on new search
		fetchData();
	}, [
		// page,
		searchCategory,
		sortByDate,
		sessionId,
		authToken,
		filterStarred,
		pageSize,
		status,
	]);

	useEffect(() => {
		// if (page != 1) {
		fetchData();
		// }
		// setPage(1); // Reset to the first page on new search
	}, [
		page,
		// searchCategory,
		// sortByDate,
		// sessionId,
		// authToken,
		// filterStarred,
		// pageSize,
	]);
	const totalPages = Math.ceil(totalRecords / pageSize); // Calculate total pages

	const handleSearch = () => {
		setPage(1); // Reset to the first page on new search
		fetchData();
	};
	// Star

	const handleStar = async () => {
		if (selectedRows.length === 0) {
			alert("Không có dòng nào được chọn");
			return;
		}

		try {
			const rest_api_endpoint =
				(process.env.NEXT_PUBLIC_API_ENDPOINT ?? "") + "/get";
			const response = await fetch(rest_api_endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: authToken || "",
				},
				body: JSON.stringify({ ids: selectedRows, action: "batch_star" }),
			});

			if (!response.ok) {
				throw new Error("Cập nhật đánh dấu thành công");
			}

			alert("Cập nhật đánh dấu thành công!");
			fetchData();
			setSelectedRows([]);
		} catch (error) {
			console.error("Error updating stars:", error);
			alert("Failed to update stars. Please try again.");
		}
	};
	const handleUnstar = async () => {
		if (selectedRows.length === 0) {
			alert("No rows selected");
			return;
		}

		try {
			const rest_api_endpoint =
				(process.env.NEXT_PUBLIC_API_ENDPOINT ?? "") + "/get";
			const response = await fetch(rest_api_endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: authToken || "",
				},
				body: JSON.stringify({ ids: selectedRows, action: "batch_unstar" }),
			});

			if (!response.ok) {
				throw new Error("Failed to update stars");
			}

			alert("Cập nhật đánh dấu thành công!");
			fetchData();
			setSelectedRows([]);
		} catch (error) {
			console.error("Error updating stars:", error);
			alert("Failed to update stars. Please try again.");
		}
	};

	//
	return (
		<div className="w-full  shadow-md sm:rounded-lg border ml-4">
			<h1 className="mt-5 ml-4 text-lg font-semibold">
				Danh sách các tệp ({totalRecords})
			</h1>
			<div className="p-4 flex justify-between">
				<div>
					<input
						type="text"
						placeholder="Nhập tên để tìm kiếm"
						value={searchName}
						onChange={(e) => setSearchName(e.target.value)}
						className="border p-2 mr-2"
					/>
					<button
						onClick={handleSearch}
						className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 mr-3"
					>
						Tìm kiếm
					</button>
					<select
						// type="text"
						// placeholder="Search by Category"
						value={searchCategory}
						onChange={(e) => setSearchCategory(e.target.value)}
						className="border rounded p-2 mr-2"
					>
						<option value="">Tất cả danh mục</option>
						<option value="Data">Data</option>
						<option value="Fullstack">Fullstack</option>
					</select>
					<select
						value={sortByDate}
						onChange={(e) => setSortByDate(e.target.value)}
						className="border rounded p-2 mr-2"
					>
						<option value="desc">Mới nhất</option>
						<option value="asc">Cũ nhất</option>
					</select>

					<select
						value={filterStarred}
						onChange={(e) => setFilterStarred(e.target.value)}
						className="border rounded p-2 mr-2"
					>
						<option value="">Đánh dấu: Tất cả</option>
						<option value="starred">Đã đánh dấu</option>
						<option value="not-starred">Chưa đánh dấu</option>
					</select>
					<select
						value={status}
						onChange={(e) => setStatus(e.target.value)}
						className="border rounded p-2 mr-2"
					>
						<option value="">Trạng thái :Tất cả</option>
						<option value="0">Đang xử lý</option>
						<option value="1">Đã xử lý</option>
						<option value="2">Đang xóa</option>
					</select>
				</div>
				<div>
					<button
						onClick={handleStar}
						className="text-white bg-yellow-600 hover:bg-yellow-800 px-4 py-2 rounded disabled:bg-gray-500 "
						disabled={selectedRows.length === 0}
					>
						Thêm đánh dấu
					</button>
					<button
						onClick={handleUnstar}
						className="text-white bg-yellow-600 hover:bg-yellow-800 px-4 py-2 rounded disabled:bg-gray-500 ml-3 "
						disabled={selectedRows.length === 0}
					>
						Bỏ đánh dấu
					</button>
					<button
						onClick={handleDelete}
						className="text-white bg-red-600 hover:bg-red-800 px-4 py-2 rounded disabled:bg-gray-500 ml-3"
						disabled={selectedRows.length === 0}
					>
						Xóa các trường đã chọn
					</button>
				</div>
			</div>
			<div className="flex justify-between items-center mb-3">
				<div className=""></div>
				<select
					value={pageSize}
					onChange={(e) => setPageSize(Number(e.target.value))}
					className="border rounded p-2 mr-[50px]"
				>
					<option value="10">Hiển thị: 10</option>
					<option value="20">Hiển thị: 20</option>
					<option value="40">Hiển thị: 40</option>
				</select>
			</div>

			{/* Error and Loading */}
			{error && <div style={{ color: "red" }}>Error: {error}</div>}

			{/* Document Table */}
			{/* {!loading && !error && documents.length > 0 && ( */}
			<table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
				<thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
					<tr>
						{!loading ? (
							<th className=" text-center px-4 py-2">
								<input
									type="checkbox"
									checked={
										selectedRows.length === data.length && data.length > 0
									}
									onChange={toggleSelectAll}
								/>
							</th>
						) : (
							<th className=" text-center px-4 py-2"> </th>
						)}
						<th scope="col" className="px-6 py-3 w-3/12">
							Đường dẫn
						</th>
						<th scope="col" className="px-6 py-3 w-[170px] text-center">
							Trạng thái
						</th>
						<th scope="col" className="px-6 py-3 w-1/12 text-center">
							Tên tài liệu
						</th>
						<th scope="col" className="px-6 py-3 w-1/12 text-center">
							Danh mục
						</th>
						<th scope="col" className="px-6 py-3 w-[100px] text-center">
							Số trang
						</th>
						<th scope="col" className="px-6 py-3 w-2/12 text-center">
							Ngày tạo
						</th>
						<th scope="col" className="px-6 py-3 w-[50px] text-center">
							Đánh dấu
						</th>
						<th scope="col" className="px-6 py-3 text-center ">
							Hành động
						</th>
					</tr>
				</thead>
				<tbody>
					{loading ? (
						<tr>
							<td colSpan={9} className="text-center p-4">
								Đang tải...
							</td>
						</tr>
					) : data.length != 0 ? (
						data.map((doc: any) => (
							<tr
								key={doc.id}
								className="hover:bg-gray-100 active:bg-gray-200 cursor-pointer"
							>
								<td className=" px-4 py-2 text-center">
									<input
										type="checkbox"
										checked={selectedRows.includes(doc.id)}
										onChange={() => toggleRowSelection(doc.id)}
									/>
								</td>
								<td className="px-6 py-4 underline text-blue-500 font-medium whitespace-nowrap max-w-[400px] truncate">
									<a target="_blank" href={doc.doc_url}>
										{doc.doc_url}
									</a>
								</td>

								<td className="px-6 py-4 text-center">
									{doc.status === 0 && (
										<span className="inline-block px-3 py-1 text-white bg-yellow-500 rounded-md">
											Đang xử lý
										</span>
									)}
									{doc.status === 1 && (
										<span className="inline-block px-3 py-1 text-white bg-green-500 rounded-md">
											Đã xử lý
										</span>
									)}
									{doc.status === 2 && (
										<span className="inline-block px-3 py-1 text-white bg-red-500 rounded-md">
											Đang xóa
										</span>
									)}
									{doc.status === 3 && (
										<span className="inline-block px-3 py-1 text-white bg-gray-500 rounded-md">
											Đã xóa
										</span>
									)}
								</td>
								<td className="px-6 py-4 text-black ">{doc.file_name}</td>
								<td className="px-6 py-4 text-center">{doc.job}</td>
								<td className="px-6 py-4 text-center">{doc.pages}</td>
								<td className="px-6 py-4 text-center">
									{new Date(doc.created_at).toLocaleString()}
								</td>
								<td className="px-6 py-4 ">
									<div className=" flex items-center justify-center">
										{doc.star === 1 ? (
											<IconStarFilled className="text-yellow-500 h-5 w-5" />
										) : (
											<IconStar className="text-gray-500  h-5 w-5" />
										)}
									</div>
								</td>
								<td className="px-6 py-4">
									<div className="flex flex-row space-y-2 ">
										<button className="w-[100px] mx-auto">
											{doc.status === 1 && (
												<Link
													href={`/profile/${doc.id}`}
													className="text-blue-600 text-base underline hover:text-blue-800 hover:text-lg font-bold"
												>
													Tương tác
												</Link>
											)}
											{doc.status === 2 && (
												<Link
													href={`/profile/${doc.id}`}
													className="text-blue-600 text-base underline hover:text-blue-800 hover:text-lg font-bold"
												>
													Tương tác
												</Link>
											)}
										</button>

										{/* <button
											// href={`/delete/${doc.id}`}
											className="text-red-600 text-base underline mt-2 hover:text-red-800 hover:text-lg font-bold"
										>
											Xóa
										</button> */}
									</div>
								</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan={9} className="text-center p-4">
								Không có dữ liệu
							</td>
						</tr>
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
			<div className="flex justify-between items-center">
				<div className="p-4">
					<button
						onClick={() => {
							setPage((prev) => Math.max(prev - 1, 1));
							// fetchData();
						}}
						disabled={page === 1}
						className="bg-gray-300 p-2 mr-3 hover:cursor-pointer rounded hover:bg-slate-400 disabled:opacity-50 "
					>
						Trở lại
					</button>
					<span>
						Trang {page} của {totalPages}
					</span>
					<button
						onClick={() => {
							setPage((prev) => Math.min(prev + 1, totalPages));
							// fetchData();
						}}
						disabled={page === totalPages}
						className="bg-gray-300 p-2 ml-3 hover:cursor-pointer rounded hover:bg-slate-400 disabled:opacity-50"
					>
						Tiếp theo
					</button>
				</div>
				<select
					value={pageSize}
					onChange={(e) => setPageSize(Number(e.target.value))}
					className="border rounded p-2 mr-[50px]"
				>
					<option value="10">Hiển thị: 10</option>
					<option value="20">Hiển thị: 20</option>
					<option value="40">Hiển thị: 40</option>
				</select>
			</div>
		</div>
	);
};

export default DocumentTable;
