
interface SectionProps {
    title: string;
    children: any;
}

function Section({ title, children }: SectionProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <div>
                {children}
            </div>
        </div>
    );
}

export default Section;