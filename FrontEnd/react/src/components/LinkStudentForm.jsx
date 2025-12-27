import { useState } from 'react';
import { Link2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LinkStudentForm() {
    const [referralCode, setReferralCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const { linkStudent } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!referralCode.trim()) return;

        setIsLoading(true);
        setError("");
        setSuccess("");

        const result = await linkStudent(referralCode.trim());

        setIsLoading(false);
        if (result.success) {
            setSuccess(result.message);
            setReferralCode("");
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-[#00B4D8]">
                    <Link2 className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Link Your Student</h3>
                    <p className="text-xs text-gray-500">Enter the referral code from your child.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        placeholder="E.g. A1B2C3D4"
                        className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] outline-none transition-all font-mono tracking-widest uppercase"
                    />
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg text-sm">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span className="font-medium">{success}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !referralCode.trim()}
                    className="w-full bg-[#00B4D8] text-white font-bold py-3 rounded-xl hover:bg-[#0096B4] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                    {isLoading ? 'Linking...' : 'Link Student'}
                </button>
            </form>
        </div>
    );
}
