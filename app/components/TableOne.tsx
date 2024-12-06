const TableTwo = () => {
	return (
		<div className="w-5/6  shadow-md sm:rounded-lg border">
			<table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
				<thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
					<tr>
						<th scope="col" className="px-6 py-3">
							Product name
						</th>
						<th scope="col" className="px-6 py-3">
							Color
						</th>
						<th scope="col" className="px-6 py-3">
							Category
						</th>
						<th scope="col" className="px-6 py-3">
							Price
						</th>
						<th scope="col" className="px-6 py-3">
							Action
						</th>
					</tr>
				</thead>
				<tbody>
					<tr className="odd:bg-white  even:bg-gray-50 ">
						<th
							scope="row"
							className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
						>
							Apple MacBook Pro 17"
						</th>
						<td className="px-6 py-4">Silver</td>
						<td className="px-6 py-4">Laptop</td>
						<td className="px-6 py-4">$2999</td>
						<td className="px-6 py-4">
							<a href="#" className="font-medium text-blue-600 hover:underline">
								Edit
							</a>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
};

export default TableTwo;
