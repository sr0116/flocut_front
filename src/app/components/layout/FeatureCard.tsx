function FeatureCard({ title }: { title: string }) {
    return (
        <div className="
            rounded-xl border p-6
            bg-white border-gray-200
            dark:bg-neutral-900 dark:border-neutral-800
        ">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                AI 기반 자동 요약 기능
            </p>
        </div>
    );
}
