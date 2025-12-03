import Image from 'next/image'
import { UpdatePasswordForm } from '@/components/auth/update-password-form'

export default async function UpdatePasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string }>
}) {
    const params = await searchParams
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white selection:bg-emerald-500/30">
            <div className="w-full max-w-md space-y-8 px-4 sm:px-0">
                <div className="flex justify-center mb-8">
                    <div className="relative h-16 w-64">
                        <Image
                            src="/99grindlogo.png"
                            alt="99Grind Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                <UpdatePasswordForm message={params?.message} />
            </div>
        </div>
    )
}
