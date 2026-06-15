import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithToken } = useAuth();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);

        const token = searchParams.get('token') || '';
        const role = searchParams.get('role') || '';
        const username = searchParams.get('username') || '';

        if (token) {
            // Save to context and localStorage
            loginWithToken(token, { username, role });
            
            // Redirect based on role
            if (role === 'ROLE_ADMIN') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } else {
            navigate('/login?error=oauth2');
        }
    }, [location, navigate, loginWithToken]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Đang xác thực...</h2>
                <p className="text-slate-500 mt-2 font-medium">Vui lòng đợi trong giây lát.</p>
            </div>
        </div>
    );
};

export default OAuth2RedirectHandler;
