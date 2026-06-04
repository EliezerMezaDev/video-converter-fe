
export default function PageHeader({ title, description, icon, headerId }: { title: string; description: string; icon: React.ReactNode; headerId: string }) {
    return (
        <header id={headerId} className="w-full mb-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-0.5">
                {icon}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
            </p>
        </header>
    );
}