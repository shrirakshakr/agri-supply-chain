import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiPost } from '../api';
import './Auth.css';

function Login() {
	const [phoneNumber, setPhoneNumber] = useState('');
	const [uniqueId, setUniqueId] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();

	async function handleSubmit(e) {
		e.preventDefault();
		setError('');
		if (!phoneNumber || !uniqueId) {
			setError('Please enter phone number and unique ID');
			return;
		}
		try {
			const res = await apiPost('/login', { phoneNumber, uniqueId });
			localStorage.setItem('agri_user', JSON.stringify(res.user));
			if (res.user.userType === 'Admin') {
				navigate('/admin');
			} else {
				navigate('/');
			}
		} catch (err) {
			setError(err.message);
		}
	}

	return (
		<div className="auth-wrapper">
			<div className="auth-card">
				<div className="auth-header">
					<h1 className="auth-title">Welcome to AgriChain Portal</h1>
					<p className="auth-subtitle">Sign in using your phone number and unique AGRI ID.</p>
				</div>
				<form onSubmit={handleSubmit} className="auth-form">
					<label>
						Phone Number
						<input
							type="tel"
							className="auth-input"
							value={phoneNumber}
							onChange={e => setPhoneNumber(e.target.value)}
							placeholder="Enter phone number"
						/>
					</label>
					<label>
						Unique ID (AGRIxxxxx)
						<input
							type="text"
							className="auth-input"
							value={uniqueId}
							onChange={e => setUniqueId(e.target.value)}
							placeholder="AGRI00001"
						/>
					</label>
					{error && <div className="error">{error}</div>}
					<div className="auth-actions">
						<button type="submit" className="btn-primary">Login</button>
						<p className="auth-note">
							Don’t have an account? <Link to="/register" className="auth-link">Register</Link>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
}

export default Login;


