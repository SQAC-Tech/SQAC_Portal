import NoticeCard from "./NoticeCard";

export default function MainContent({ notices, onDelete, isAdmin }) {
    const safeNotices = Array.isArray(notices) ? notices : [];

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-10 pt-10 pb-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Noticeboard
                    </h1>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {safeNotices.length > 0 ? (
                        safeNotices.map((notice) => (
                            <NoticeCard
                                key={notice._id}
                                notice={notice}
                                onDelete={onDelete}
                                isAdmin={isAdmin}
                            />
                        ))
                    ) : (
                        <p className="text-gray-400 col-span-full text-center">
                            No notices available
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
}