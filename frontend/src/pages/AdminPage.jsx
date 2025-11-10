import { useEffect, useState } from 'react';
import { apiGet, apiDelete } from '../api';
import './Auth.css';

const ADMIN_PHONE = '9999999999';
const ADMIN_UNIQUE_ID = 'ADMIN12345';

function AdminPage() {
	const [users, setUsers] = useState([]);
	const [error, setError] = useState('');

	async function load() {
		setError('');
		try {
			const data = await apiGet(`/users?phoneNumber=${ADMIN_PHONE}&uniqueId=${ADMIN_UNIQUE_ID}`);
			setUsers(data);
		} catch (err) {
			setError(err.message);
		}
	}

	useEffect(() => {
		load();
	}, []);

	async function handleDelete(id) {
		if (!confirm('Delete this user?')) return;
		try {
			await apiDelete(`/users/${id}?phoneNumber=${ADMIN_PHONE}&uniqueId=${ADMIN_UNIQUE_ID}`);
			await load();
		} catch (err) {
			setError(err.message);
		}
	}

	return (
		<div className="auth-wrapper">
			<div className="auth-card">
				<div className="auth-header">
					<h1 className="auth-title">Admin Dashboard</h1>
					<p className="auth-subtitle">Manage registered users in the AgriChain system.</p>
				</div>
				{error && <div className="error">{error}</div>}
				<div className="table-wrap">
					<table className="table">
						<thead>
							<tr>
								<th>Unique ID</th>
								<th>First Name</th>
								<th>Middle</th>
								<th>Last Name</th>
								<th>Phone</th>
								<th>Address 1</th>
								<th>Address 2</th>
								<th>District</th>
								<th>State</th>
								<th>Country</th>
								<th>User Type</th>
								<th>Created At</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{users.map(u => (
								<tr key={u._id}>
									<td>{u.uniqueId}</td>
									<td>{u.firstName}</td>
									<td>{u.middleName}</td>
									<td>{u.lastName}</td>
									<td>{u.phoneNumber}</td>
									<td>{u.addressLine1}</td>
									<td>{u.addressLine2}</td>
									<td>{u.district}</td>
									<td>{u.state}</td>
									<td>{u.country}</td>
									<td>{u.userType}</td>
									<td>{new Date(u.createdAt).toLocaleString()}</td>
									<td>
										<button onClick={() => handleDelete(u._id)} className="btn-primary">Delete</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

export default AdminPage;


