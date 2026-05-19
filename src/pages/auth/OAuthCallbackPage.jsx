import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setToken, setOAuthUser, getMe } from '../../store/authSlice';

const OAuthCallbackPage = () => {
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            navigate('/login');
            return;
        }

        localStorage.setItem('lms_token', token);
        dispatch(setToken(token));

        dispatch(getMe())
            .unwrap()
            .then((user) => {
                dispatch(setOAuthUser(user));
                navigate('/courses', { replace: true });
            })
            .catch(() => {
                localStorage.removeItem('lms_token');
                navigate('/login', { replace: true });
            });
    }, []);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e2e8f0',
                borderTop: '4px solid #6366f1',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ marginTop: '16px', color: '#64748b' }}>Logging you in...</p>
        </div>
    );
};

export default OAuthCallbackPage;