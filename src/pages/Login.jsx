import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            navigate('/');
        }
        setLoading(false);
    };

    return (
        <div className="d-flex w-100 vh-100 justify-content-center align-items-center bg-light">
            <div className="card shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="card-body p-4">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold">Login PPIC</h2>
                        <p className="text-muted">Sistem Monitoring Produksi</p>
                    </div>

                    {error && <div className="alert alert-danger py-2">{error}</div>}

                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button className="btn btn-primary w-100 py-2" type="submit" disabled={loading}>
                            {loading ? 'Memproses...' : 'Login'}
                        </button>
                    </form>

                    <div className="mt-4 text-center text-muted small">
                        &copy; {new Date().getFullYear()} Tugas Akhir PPIC Monitoring
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
