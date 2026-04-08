export default function PageWrapper({ wrapperId, children }: { wrapperId: string; children: React.ReactNode }) {
    return (
        <div id={wrapperId} className="w-full max-w-[95%] lg:max-w-6xl h-full mx-auto p-0 md:py-4 overflow-hidden flex flex-col justify-center items-center gap-2">
            {children}
        </div>
    );
}