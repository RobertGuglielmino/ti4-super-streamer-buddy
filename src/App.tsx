
import { useEffect, useState } from 'react';
import SystemStatus from './components/SystemStatus.tsx';
import Configuration from './components/Configuration.tsx';
import PlayerBox from './components/PlayerBox.tsx';
import ActivityLog from './components/ActivityLog.tsx';
import io from 'socket.io-client';
import { GameDataTTPG, LogEntry, PlayerTTPG } from './interfaces.tsx';
import { mockData } from './mockData.tsx';


function App() {
    const [gameData, setGameData] = useState(mockData);
    const [logEntries, setLogEntries] = useState(initalizeLogs());
    const [reconnect, setReconnect] = useState(true);
    const [horizontalLayout, setInfoLayout] = useState(true);
    const [debugMode, setDebugMode] = useState(true);
    const [refreshRate, setRefreshRate] = useState(5);
    const [authStatus, setAuthStatus] = useState(false);
    const [dataReceived, setDataReceived] = useState(false);
    const [dataPushed, setDataPushed] = useState(false);
    const [lastDataReceived, setLastDataReceived] = useState<string>('None');

    // Create socket connection
    const [socket] = useState(() => io('http://localhost:8080', {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    }));

    useEffect(() => {
        addLog('Dashboard initialized');
        socket.emit('request_status');

        // SET UP SOCKET LISTENERS

        socket.on('connect', () => {
            addLog('Connected to server', 'success');
            console.log('Socket connected!');
            setGameData([]);
        });

        socket.on('disconnect', () => {
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

        socket.on('ttpg_data', (data) => {
            setAuthStatus(true);
            setDataReceived(true);
            setDataPushed(true);
            updateGameData(data);
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

    return (
        <div className="min-h-screen h-screen">
            <main className="max-w-6xl h-full overflow-auto">
                <div className="flex flex-row gap-2 m-2 h-100">
                    {horizontalLayout ? (
                        // Horizontal layout
                        <div className="flex flex-col gap-2 w-auto">
                            <div className="flex flex-row gap-2 justify-center">
                                <Configuration
                                    reconnect={reconnect}
                                    debugMode={debugMode}
                                    refreshRate={refreshRate}
                                    infoLayout={horizontalLayout}
                                    setInfoLayout={setInfoLayout}
                                    setReconnect={setReconnect}
                                    setDebugMode={setDebugMode}
                                    setRefreshRate={setRefreshRate}
                                />
                                <SystemStatus
                                    authStatus={authStatus}
                                    dataReceived={dataReceived}
                                    dataPushed={dataPushed}
                                    lastDataReceived={lastDataReceived}
                                    refreshClick={refreshClick}
                                    addLog={addLog}
                                />
                            </div>
                            <div className="grid grid-cols-3 p-2 bg-gray-950">
                                {gameData.map((player) => (<PlayerBox key={player.playerName} {...player} />))}
                            </div>
                        </div>
                    ) : (
                        // Vertical layout with PlayerBox on the right
                        <div className='flex flex-col gap-2'>
                            <div className=" flex flex-row gap-2">
                                <div className="flex flex-col grow gap-2">
                                    <Configuration
                                        reconnect={reconnect}
                                        debugMode={debugMode}
                                        refreshRate={refreshRate}
                                        infoLayout={horizontalLayout}
                                        setInfoLayout={setInfoLayout}
                                        setReconnect={setReconnect}
                                        setDebugMode={setDebugMode}
                                        setRefreshRate={setRefreshRate}
                                    />
                                    <SystemStatus
                                        authStatus={authStatus}
                                        dataReceived={dataReceived}
                                        dataPushed={dataPushed}
                                        lastDataReceived={lastDataReceived}
                                        refreshClick={refreshClick}
                                        addLog={addLog}
                                    />
                                </div>
                                <div className="grid grid-cols-1 p-1 bg-gray-950">
                                    {gameData.map((player) => (<PlayerBox key={player.playerName} {...player} />))}
                                </div>
                            </div>
                        </div>
                    )}
                        <ActivityLog logEntries={logEntries} />
                </div>
            </main>
        </div>
    );

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

    function updateGameData(gameData: GameDataTTPG) {
        const newData = gameData.players.map((player: PlayerTTPG) => ({
            playerName: player.steamName,
            color: player.color,
            score: player.score,
            faction: player.factionShort,
            strategyCard: player.strategyCards[0] || '-',
            strategyCardFlipped: player.strategyCardsFaceDown.length > 0,
            speaker: gameData.speaker === player.color,
        }));
        setGameData(newData); // This replaces the entire array
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
}

export default App;



/*

import { useEffect, useState } from 'react';
import SystemStatus from './components/SystemStatus.tsx';
import Configuration from './components/Configuration.tsx';
import PlayerBox from './components/PlayerBox.tsx';
import ActivityLog from './components/ActivityLog.tsx';
import io from 'socket.io-client';
import { GameDataTTPG, LogEntry, PlayerTTPG } from './interfaces.tsx';
import { mockData } from './mockData.tsx';


function App() {
    const [gameData, setGameData] = useState(mockData);
    const [logEntries, setLogEntries] = useState(initalizeLogs());
    const [reconnect, setReconnect] = useState(true);
    const [infoLayout, setInfoLayout] = useState(true);
    const [debugMode, setDebugMode] = useState(true);
    const [refreshRate, setRefreshRate] = useState(5);
    const [authStatus, setAuthStatus] = useState(false);
    const [dataReceived, setDataReceived] = useState(false);
    const [dataPushed, setDataPushed] = useState(false);
    const [lastDataReceived, setLastDataReceived] = useState<string>('None');

    // Create socket connection
    const [socket] = useState(() => io('http://localhost:8080', {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    }));

    useEffect(() => {
        addLog('Dashboard initialized');
        socket.emit('request_status');

        // SET UP SOCKET LISTENERS

        socket.on('connect', () => {
            addLog('Connected to server', 'success');
            console.log('Socket connected!');
        });

        socket.on('disconnect', () => {
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

        socket.on('ttpg_data', (data) => {
            setAuthStatus(true);
            setDataReceived(true);
            setDataPushed(true);
            updateGameData(data);
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

    return (
        <div className="min-h-screen">
            <main className="max-w-2xl mx-auto">
                {infoLayout ?
                    <>
                    <div className='flex flex-col w-100'>
                        <div className="flex flex-row">
                            <div className="flex flex-col gap-2 justify-center m-2">
                                <Configuration
                                    reconnect={reconnect}
                                    debugMode={debugMode}
                                    refreshRate={refreshRate}
                                    infoLayout={infoLayout}
                                    setInfoLayout={setInfoLayout}
                                    setReconnect={setReconnect}
                                    setDebugMode={setDebugMode}
                                    setRefreshRate={setRefreshRate}
                                />
                                <SystemStatus
                                    authStatus={authStatus}
                                    dataReceived={dataReceived}
                                    dataPushed={dataPushed}
                                    lastDataReceived={lastDataReceived}
                                    refreshClick={refreshClick}
                                    addLog={addLog} />
                            </div>
                            <div className="grid grid-cols-1 h-auto m-2 p-2 bg-gray-950">
                                {gameData.map((player) => (<PlayerBox {...player} />))}
                            </div>
                        </div>
                        <div className="flex flex-row justify-center gap-2">
                            <ActivityLog logEntries={logEntries} />
                        </div>
                    </div>
                    </> :
                    <>
                        <div className="flex gap-6 justify-center m-2">
                            <Configuration
                                reconnect={reconnect}
                                debugMode={debugMode}
                                refreshRate={refreshRate}
                                infoLayout={infoLayout}
                                setInfoLayout={setInfoLayout}
                                setReconnect={setReconnect}
                                setDebugMode={setDebugMode}
                                setRefreshRate={setRefreshRate}
                            />
                            <SystemStatus
                                authStatus={authStatus}
                                dataReceived={dataReceived}
                                dataPushed={dataPushed}
                                lastDataReceived={lastDataReceived}
                                refreshClick={refreshClick}
                                addLog={addLog} />
                        </div>
                        <div className="flex flex-col g-2">
                            <div className="grid grid-cols-3 h-auto p-1 m-2 bg-gray-950">
                                {gameData.map((player) => (<PlayerBox {...player} />))}
                            </div>
                            <ActivityLog logEntries={logEntries} />
                        </div>
                    </>
                }
            </main>
        </div>
    );

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

    function updateGameData(gameData: GameDataTTPG) {
        const newData = gameData.players.map((player: PlayerTTPG) => ({
            playerName: player.steamName,
            color: player.color,
            score: player.score,
            faction: player.factionShort,
            strategyCard: player.strategyCards[0],
            strategyCardFlipped: player.strategyCardsFaceDown.length > 0,
            speaker: gameData.speaker === player.color,
        }));
        console.log("updating data", newData);
        setGameData(newData);
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
}

export default App;

*/
