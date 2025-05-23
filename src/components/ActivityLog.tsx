
import { LogEntry } from "@/App";
import Section from "./Section";

interface ActivityLogProps {
    logEntries: LogEntry[];
}

function ActivityLog({logEntries}: ActivityLogProps) {

    function getEntryColor(type: string) {
        switch (type) {
            case 'success':
                return 'text-green-600';
            case 'error':
                return 'text-red-500';
            case 'info':
                return 'text-blue-200';
            case 'warning':
                return 'text-yellow-300';
            default:
                return 'text-white';
        }
    }

    return (<Section title="Activity Log">
        <div className="bg-black h-48 w-auto overflow-y-auto">
            {logEntries.map(entry => <div className={`h-8 w-full ${getEntryColor(entry.type)}`}>{`[${entry.timestamp}] ${entry.message}`}</div>)}
        </div>
    </Section>);

}

export default ActivityLog;