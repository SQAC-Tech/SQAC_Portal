import NoticeCard from "./NoticeCard";

export default function MainContent({ notices }) {
    return (
        <div className="flex-1 p-10 overflow-y-auto">

            <h1 className="text-4xl font-bold mb-2">Noticeboard</h1>
            <p className="text-gray-400 mb-8">
                Manage global announcements, club updates, and urgent alerts.
            </p>

            <div className="grid grid-cols-3 gap-6">
                {notices.map((n) => (
                    <NoticeCard key={n._id} notice={n} />
                ))}
            </div>
        </div>
    );
}