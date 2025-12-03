import Link from 'next/link'

export default function AuthCodeErrorPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
            <div className="w-full max-w-md space-y-8 px-4 text-center">
                <h2 className="text-2xl font-bold text-red-500">Authentication Error</h2>
                <p className="text-zinc-400">
                    There was a problem verifying your email link. The link may have expired or is invalid.
                </p>
                <div className="mt-8">
                    <Link
                        href="/login"
                        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
