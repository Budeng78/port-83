import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import api, { csrf } from './axios/axios';
import AgreementModalLogin from './components/modal/AgreementModalLogin';
import PendingRegister from './components/modal/PendingRegister';

export default function Login() {
    // State Management
    const [loading, setLoading] = useState(false);
    const [showAgreement, setShowAgreement] = useState(false);
    const [latestTerm, setLatestTerm] = useState(null);
    const [userTemp, setUserTemp] = useState(null);
    
    const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
    const [pendingMessage, setPendingMessage] = useState('');

    const [noWhatsapp, setNoWhatsapp] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (typeof csrf === 'function') {
                await csrf();
            }
            
            const res = await api.post('/login', { 
                no_whatsapp: noWhatsapp, 
                password 
            });
            
            const { user, access_token, agreement_required, latest_term } = res.data;

            if (agreement_required) {
                setLatestTerm(latest_term);
                setUserTemp(user);
                localStorage.setItem('temp_token', access_token);
                setShowAgreement(true);
                setLoading(false);
                return;
            }

            localStorage.setItem('access_token', access_token);
            window.location.href = '/dashboard';

        } catch (err) {
            if (err.response && err.response.status === 403) {
                setPendingMessage(err.response.data.message); 
                setIsPendingModalOpen(true);
            } else {
                console.error("error login:", err.response?.data);
                alert(err.response?.data?.message || "Login gagal, periksa kredensial bapak.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAgreementSuccess = async () => {
        setLoading(true);
        const tempToken = localStorage.getItem('temp_token');

        try {
            await api.post('/user/legal-consent', 
                { 
                    term_id: latestTerm.id,
                    identity: noWhatsapp 
                }, 
                { headers: { Authorization: `Bearer ${tempToken}` } }
            );

            setShowAgreement(false);
            localStorage.removeItem('temp_token'); 
            alert("Terima kasih pak " + (userTemp?.name || '') + ", persetujuan telah dicatat. Silakan login kembali.");
            
            setNoWhatsapp('');
            setPassword('');
        } catch (err) {
            console.error("gagal simpan consent:", err.response?.data);
            alert("Gagal mencatat persetujuan, silakan coba lagi pak.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-['Instrument_Sans'] relative w-full overflow-hidden">
            <div className="relative w-full max-w-[420px] z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 text-white text-2xl font-bold mb-4 italic transition-transform hover:scale-110 duration-300">SWI</div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight italic">Portal Login</h1>
                    <p className="text-slate-400 text-sm mt-2 font-medium italic uppercase tracking-widest">Node Primary PT SWI</p>
                </div>

                {/* Card Putih Bersih dengan Bayangan Lembut */}
                <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/60">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600 ml-1 tracking-wider">Email atau Whatsapp</label>
                            <input 
                                type="text" 
                                name="no_whatsapp"
                                autoComplete="username"
                                value={noWhatsapp}
                                onChange={(e) => setNoWhatsapp(e.target.value)} 
                                className="input-parjos-light" 
                                placeholder="email@email.com / 0812345678" 
                                required 
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600 ml-1 tracking-wider">Password</label>
                            <input 
                                type="password" 
                                name="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                                className="input-parjos-light" 
                                placeholder="••••••••" 
                                required 
                            />
                        </div>

                        <button 
                            disabled={loading} 
                            type="submit"
                            className={`w-full py-4 mt-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span className="uppercase tracking-widest text-[12px]">Memverifikasi...</span>
                                </>
                            ) : <span className="uppercase tracking-widest text-[12px]">Masuk ke Sistem</span>}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm">
                        <span className="text-slate-500 font-medium">belum punya akun?</span>{' '}
                        <a href="/register" className="text-blue-600 font-bold hover:underline">daftar sekarang</a>
                    </div>

                    <div className="mt-4 text-center text-sm">
                        <a href="/" className="text-slate-400 font-medium hover:text-blue-600 transition">
                            &larr; kembali ke halaman utama
                        </a>
                    </div>
                </div>
            </div>

            {/* Modal Update Kebijakan */}
            <AgreementModalLogin
                isOpen={showAgreement} 
                termData={latestTerm} 
                userDetails={{ 
                    name: userTemp?.name, 
                    no_whatsapp: userTemp?.no_whatsapp 
                }}
                loading={loading}
                onSuccess={handleAgreementSuccess} 
            />

            {/* Modal Pending */}
            <PendingRegister
                isOpen={isPendingModalOpen}
                onClose={() => setIsPendingModalOpen(false)}
                message={pendingMessage}
            />

            <style>{`
                .input-parjos-light {
                    width: 100%; padding: 1rem 1.25rem; background-color: #f8fafc;
                    border: 1px solid #e2e8f0; border-radius: 1.25rem; font-weight: 600; outline: none; transition: all 0.2s; color: #0f172a;
                }
                .input-parjos-light::placeholder { color: #94a3b8; }
                .input-parjos-light:focus { background-color: #ffffff; border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
            `}</style>
        </div>
    );
}

// Mounting React ke Blade view
if (document.getElementById('auth-root')) {
    ReactDOM.createRoot(document.getElementById('auth-root')).render(<Login />);
}