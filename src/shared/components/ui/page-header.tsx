
export default function PageHeader({ title, description, icon, headerId }: { title: string; description: string; icon: React.ReactNode; headerId: string }) {
    return (
        <header id={headerId} className="w-full mb-2 flex flex-col md:gap-2">
            <div className="flex items-center gap-2">
                <div className="grid size-10 place-content-center rounded-full bg-primary/10 text-primary">
                    {icon}
                </div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            </div>
            <p className="text-sm text-muted-foreground">
                {description}
            </p>
        </header>
    );
}