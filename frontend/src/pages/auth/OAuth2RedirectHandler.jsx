import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const getUrlParameter = (name) => {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            var results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        };

        const token = getUrlParameter('token');
        const role = getUrlParameter('role');
        const username = getUrlParameter('username');
        const error = getUrlParameter('error');

        if (token) {
            localStorage.setItem('slife_token', token);
            localStorage.setItem('slife_role', role);
            localStorage.setItem('slife_username', username);
            
            toast.success(`Đăng nhập Google thành công! Chào mừng ${username}`);
            
            if (role === 'ROLE_ADMIN') {
                navigate('/admin');
            } else {
                navigate('/shop');
            }
        } else {
            const errorMsg = error || 'Đăng nhập Google thất bại';
            toast.error(errorMsg);
            navigate('/login');
        }
    }, [location, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-500 font-bold animate-pulse">Đang xác thực với Google...</p>
            </div>
        </div>
    );
};

export default OAuth2RedirectHandler;
