import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { LayoutDashboard, ShoppingCart, LogOut, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [role, setRole] = useState('');

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
            } else {
                setUser(session.user);
                // Fetch role from users table
                const { data } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();
                if (data) {
                    setRole(data.role);
                }
            }
        };
        checkUser();

        // Listen auth state changes
        var { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                navigate('/login');
            }
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
        { name: 'Orders', path: '/orders', icon: <ShoppingCart size={18} /> },
    ];

    if (role === 'superadmin') {
        navItems.push({ name: 'Users', path: '/users', icon: <Users size={18} /> });
    }

    return (
        <div className="wrapper">
            <nav id="sidebar" className="sidebar">
                <div className="sidebar-content">
                    <Link className="sidebar-brand" to="/">
                        <span className="align-middle">PPIC Monitor</span>
                    </Link>

                    <ul className="sidebar-nav">
                        <li className="sidebar-header">
                            Menu Utama
                        </li>

                        {navItems.map((item) => (
                            <li key={item.path} className={`sidebar-item ${location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/') ? 'active' : ''}`}>
                                <Link className="sidebar-link" to={item.path}>
                                    {item.icon} <span className="align-middle">{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            <div className="main">
                <nav className="navbar-bg sticky-top">
                    <div className="d-flex align-items-center">
                        <span className="text-dark fw-bold me-2">Role:</span>
                        <span className="badge bg-secondary text-uppercase">{role || 'Loading...'}</span>
                    </div>

                    <div className="navbar-collapse collapse">
                        <ul className="navbar-nav navbar-align ms-auto">
                            <li className="nav-item">
                                <button className="btn btn-sm btn-outline-danger" onClick={handleLogout}>
                                    <LogOut size={16} className="me-1" /> Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </nav>

                <main className="content">
                    <div className="container-fluid p-0">
                        <Outlet context={{ user, role }} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
