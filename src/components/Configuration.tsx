import Section from "./Section";

interface ConfigurationProps {
    reconnect: boolean;
    debugMode: boolean;
    refreshRate: number;
    setReconnect: (reconnect: boolean) => void;
    setDebugMode: (debugMode: boolean) => void;
    setRefreshRate: (refreshRate: number) => void;
}

function Configuration({ reconnect, debugMode, refreshRate, setReconnect, setDebugMode, setRefreshRate }: ConfigurationProps) {
    return (<Section title="Configuration">
        <div className="">
            <div className="border-b-2 m-1">
                <input checked={reconnect} onChange={(e) => setReconnect(e.target.checked)} type="checkbox" className="border-2 border-black m-2" />
                <label className="form-check-label" >Auto-reconnect</label>
                <div className="text-sm text-gray-400">Automatically reconnect if connection is lost</div>
            </div>

            <div className="border-b-2 m-1">
                <input checked={debugMode} onChange={(e) => setDebugMode(e.target.checked)} type="checkbox" className="form-check-input border-2 border-black m-2"  />
                <label className="form-check-label" >Debug Mode</label>

                <div className="text-sm text-gray-400">Show detailed logs for troubleshooting</div>
            </div>

            <div className="border-b-2 m-1">
                <input type="number" value={refreshRate} onChange={(e) => setRefreshRate(Number(e.target.value))} className="w-16 mx-1 p-1 border-2 border-black rounded" />
                <label className="form-label">Data refresh rate (seconds)</label>
                <div className="text-sm text-gray-400">How often TTPG should send data</div>
            </div>
        </div>
    </Section>);
}

export default Configuration;