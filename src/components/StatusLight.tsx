
interface SystemStatusProps {
    online: boolean;
}

function SystemStatus({ online }: SystemStatusProps) {

    const statusColor = online ? "bg-green-400" : "bg-red-600";

    return (
        <div className={`m-2 size-4 min-w-4 min-h-4 rounded-[50%] ${statusColor}`} />
    );
}

export default SystemStatus;