import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiPost } from '../api';
import './Auth.css';

function Register() {
	const [form, setForm] = useState({
		firstName: '',
		middleName: '',
		lastName: '',
		phoneNumber: '',
		addressLine1: '',
		addressLine2: '',
		district: '',
		state: '',
		country: '',
		userType: 'Farmer'
	});
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const navigate = useNavigate();

	function updateField(key, value) {
		setForm(prev => ({ ...prev, [key]: value }));
	}

	function validate() {
		const required = ['firstName','lastName','phoneNumber','addressLine1','district','state','country','userType'];
		for (const k of required) {
			if (!form[k] || String(form[k]).trim() === '') return `Please fill ${k}`;
		}
		if (!['Farmer','Vendor','Consumer'].includes(form.userType)) return 'Invalid user type';
		return '';
	}

	async function handleSubmit(e) {
		e.preventDefault();
		setError('');
		setSuccess('');
		const v = validate();
		if (v) { setError(v); return; }
		try {
			const res = await apiPost('/register', form);
			setSuccess(`Registration successful! Your Unique ID is ${res.user.uniqueId}`);
			setTimeout(() => {
				navigate('/login');
			}, 1800);
		} catch (err) {
			setError(err.message);
		}
	}

	return (
		<div className="auth-wrapper">
			<div className="auth-card">
				<div className="auth-header">
					<h1 className="auth-title">Create Your AgriChain Account</h1>
					<p className="auth-subtitle">Fill in your personal and address details to get your AGRI ID.</p>
				</div>
				<form onSubmit={handleSubmit} className="auth-form">
					<div className="section-title">Personal Details</div>
					<label>First Name
						<input className="auth-input" value={form.firstName} onChange={e=>updateField('firstName', e.target.value)} placeholder="John" />
					</label>
					<label>Middle Name
						<input className="auth-input" value={form.middleName} onChange={e=>updateField('middleName', e.target.value)} placeholder="M" />
					</label>
					<label>Last Name
						<input className="auth-input" value={form.lastName} onChange={e=>updateField('lastName', e.target.value)} placeholder="Doe" />
					</label>
					<label>Phone Number
						<input className="auth-input" type="tel" value={form.phoneNumber} onChange={e=>updateField('phoneNumber', e.target.value)} placeholder="9999999999" />
					</label>

					<div className="divider"></div>
					<div className="section-title">Address Details</div>
					<label>Address Line 1
						<input className="auth-input" value={form.addressLine1} onChange={e=>updateField('addressLine1', e.target.value)} placeholder="Street, House No." />
					</label>
					<label>Address Line 2
						<input className="auth-input" value={form.addressLine2} onChange={e=>updateField('addressLine2', e.target.value)} placeholder="Area, Landmark (optional)" />
					</label>
					<label>District
						<input className="auth-input" value={form.district} onChange={e=>updateField('district', e.target.value)} placeholder="District" />
					</label>
					<label>State
						<input className="auth-input" value={form.state} onChange={e=>updateField('state', e.target.value)} placeholder="State" />
					</label>
					<label>Country
						<input className="auth-input" value={form.country} onChange={e=>updateField('country', e.target.value)} placeholder="Country" />
					</label>

					<div className="divider"></div>
					<div className="section-title">User Type</div>
					<label>User Type
						<select className="auth-select" value={form.userType} onChange={e=>updateField('userType', e.target.value)}>
							<option>Farmer</option>
							<option>Vendor</option>
							<option>Consumer</option>
						</select>
					</label>

					{error && <div className="error">{error}</div>}
					{success && <div className="success">{success}</div>}

					<div className="auth-actions">
						<button type="submit" className="btn-primary">Register</button>
						<p className="auth-note">
							Already have an account? <Link to="/login" className="auth-link">Login</Link>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
}

export default Register;


