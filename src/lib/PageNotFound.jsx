import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';


export default function PageNotFound({}) {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0D0D0D]">
            <div className="max-w-md w-full">
                <div className="text-center space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-7xl font-light text-[#333]">404</h1>
                        <div className="h-0.5 w-16 bg-[#252525] mx-auto"></div>
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-2xl font-medium text-[#E5E5E5]">Page Not Found</h2>
                        <p className="text-[#6B6B6B] leading-relaxed">
                            The page <span className="font-medium text-[#999]">"{pageName}"</span> could not be found.
                        </p>
                    </div>
                    {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
                        <div className="mt-8 p-4 bg-[#161616] rounded-lg border border-[#252525]">
                            <p className="text-sm text-[#6B6B6B]">Admin: This page may not be implemented yet.</p>
                        </div>
                    )}
                    <div className="pt-6">
                        <button 
                            onClick={() => window.location.href = '/'} 
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#E5E5E5] bg-[#1A1A1A] border border-[#333] rounded-lg hover:bg-[#252525] transition-colors"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}