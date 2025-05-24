
interface SectionProps {
    title: string;
    children: any;
}

function Section({ title, children }: SectionProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-md p-2 w-auto h-full">
            <h2 className="text-xl text-center font-semibold mb-4">{title}</h2>
            <div>
                {children}
            </div>
        </div>
    );
}

export default Section;