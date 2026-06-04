export default function PageWrapper({ wrapperId, children }: { wrapperId: string; children: React.ReactNode }) {
    return (
        <div id={wrapperId} className="w-full max-w-[95%] lg:max-w-5xl h-full mx-auto px-0 py-6 md:py-8 overflow-hidden flex flex-col justify-start items-start gap-2">
            {children}
        </div>
    );
}