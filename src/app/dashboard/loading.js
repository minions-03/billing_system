export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="h-9 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
                <div className="flex space-x-2">
                    <div className="h-10 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse"></div>
                    <div className="h-10 w-36 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse"></div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                            <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                        </div>
                        <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-2"></div>
                        <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse"></div>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow p-6">
                    <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-56 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse mb-6"></div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex justify-between items-center">
                                <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                                <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                                <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
