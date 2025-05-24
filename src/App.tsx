
import { useEffect, useState } from 'react';
import SystemStatus from './components/SystemStatus.tsx';
import Configuration from './components/Configuration.tsx';
import PlayerBox from './components/PlayerBox.tsx';
import ActivityLog from './components/ActivityLog.tsx';
import io from 'socket.io-client';

export interface LogEntry {
    type: string,
    timestamp: string,
    message: string
}

function App() {
    const [logEntries, setLogEntries] = useState(initalizeLogs());
    const [reconnect, setReconnect] = useState(true);
    const [debugMode, setDebugMode] = useState(true);
    const [refreshRate, setRefreshRate] = useState(5);
    const [authStatus, setAuthStatus] = useState(false);
    const [dataReceived, setDataReceived] = useState(false);
    const [dataPushed, setDataPushed] = useState(false);
    const [lastDataReceived, setLastDataReceived] = useState<string>('None');
    const [socketConnected, setSocketConnected] = useState(false);
    
    // Create socket connection
    const [socket] = useState(() => io('http://localhost:8080', {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    }));

    useEffect(() => {
        // Set up socket event listeners
        socket.on('connect', () => {
            setSocketConnected(true);
            addLog('Connected to server', 'success');
            console.log('Socket connected!');
        });

        socket.on('disconnect', () => {
            setSocketConnected(false);
            addLog('Disconnected from server', 'error');

            if (reconnect) {
                setTimeout(() => {
                    addLog('Attempting to reconnect...', 'warning');
                    socket.connect();
                }, 5000);
            }
        });

        socket.on('auth_status', (data) => {
            if (data.authenticated) {
                setAuthStatus(true);
                addLog('Successfully authenticated with Twitch', 'success');
            } else {
                setAuthStatus(false);
            }
        });

        socket.on('pubsub_status', (data) => {
            if (data.success) {
                setDataPushed(true);
                addLog('Data sent to PubSub successfully', 'success');
            } else {
                setDataPushed(false);
                addLog('Error sending data to PubSub: ' + JSON.stringify(data), 'error');
            }
        });

        socket.on('ttpg_data', () => {
            setAuthStatus(true);
            setDataReceived(true);
            setDataPushed(true);
            setLastDataReceived(new Date().toLocaleTimeString());

            if (debugMode) {
                addLog('Received game data from TTPG', 'info');
            }
        });

        socket.on('server_log', (data) => {
            console.log('Received server log:', data);
            addLog(data.message, data.type);
        });

        // Clean up event listeners on unmount
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('auth_status');
            socket.off('pubsub_status');
            socket.off('ttpg_data');
            socket.off('server_log');
        };
    }, [socket, reconnect, debugMode]);

    useEffect(() => {
        // Load app info when component mounts
        const loadData = async () => {
            try {
                // setIsLoading(true);

                if (window.electronAPI) {
                    console.log("IN ELECTRON");
                    // const info = await window.electronAPI.getAppInfo();

                    // const data = await window.electronAPI.fetchApiData();
                    // setGameData(data);
                } else {
                    // const response = await fetch('http://localhost:8080/api/data');
                    // const data = await response.json();
                    // // setGameData(data);
                }
            } catch (err) {
                console.error('Error loading data:', err);
                // setError('Failed to load data. Make sure the Express server is running.');
            } finally {
                // setIsLoading(false);
            }
        };

        loadData();
    }, []);

    function initalizeLogs() {
        const logs: LogEntry[] = [{
            type: 'warning',
            timestamp: new Date().toISOString(),
            message: 'Application started'
        }];
        return logs;
    }


    function refreshClick() {
        socket.emit('request_status');
        addLog('Status refresh requested', 'info');
    }

    function addLog(message: string, type: string = 'info') {
        const timestamp = new Date().toISOString();
        
        // Check if this is a duplicate of the most recent log
        const isDuplicate = logEntries.length > 0 && 
                            logEntries[0].message === message && 
                            logEntries[0].type === type &&
                            Date.now() - new Date(logEntries[0].timestamp).getTime() < 1000;
        
        if (!isDuplicate) {
            setLogEntries(prevLogs => [{ type, timestamp, message }, ...prevLogs]);
        }
    }

    const mockData = [
        {
            playerName: 'Player 1',
            color: 'blue',
            score: 1,
            faction: 'muaat',
            strategyCard: 'strategyCard1',
            strategyCardFlipped: false,
        },
        {
            playerName: 'Player 1',
            color: 'green',
            score: 1,
            faction: 'muaat',
            strategyCard: 'strategyCard1',
            strategyCardFlipped: false,
        },
        {
            playerName: 'Player 1',
            color: 'purple',
            score: 1,
            faction: 'muaat',
            strategyCard: 'strategyCard1',
            strategyCardFlipped: true,
        },
        {
            playerName: 'Player 1',
            color: 'yellow',
            score: 1,
            faction: 'muaat',
            strategyCard: 'strategyCard1',
            strategyCardFlipped: false,
        },
        {
            playerName: 'Player 1',
            color: 'white',
            score: 1,
            faction: 'muaat',
            strategyCard: 'strategyCard1',
            strategyCardFlipped: false,
        },
        {
            playerName: 'Player 1',
            color: 'red',
            score: 1,
            faction: 'muaat',
            strategyCard: 'strategyCard1',
            strategyCardFlipped: false,
        },
    ];

    useEffect(() => {
        addLog('Dashboard initialized');
        socket.emit('request_status');
    }, []);

    return (
        <div className="min-h-screen p-8">
            <main className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2 grid grid-cols-3">
                        {mockData.map((player) => (<PlayerBox {...player} />))}
                    </div>
                    <SystemStatus
                        authStatus={authStatus}
                        dataReceived={dataReceived}
                        dataPushed={dataPushed}
                        lastDataReceived={lastDataReceived}
                        refreshClick={refreshClick}
                        addLog={addLog} />
                    <Configuration
                        reconnect={reconnect}
                        debugMode={debugMode}
                        refreshRate={refreshRate}
                        setReconnect={setReconnect}
                        setDebugMode={setDebugMode}
                        setRefreshRate={setRefreshRate}
                    />
                    <ActivityLog logEntries={logEntries} />
                    {/* <ExampleComponent title="App Information" data={appInfo} />
                    <ExampleComponent title="API Data" data={apiData} /> */}
                </div>
            </main>
        </div>
    );
}

export default App;
