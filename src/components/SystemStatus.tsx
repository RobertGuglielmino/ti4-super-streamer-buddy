import Section from "./Section";
import StatusLight from "./StatusLight";

interface SystemStatusProps {
    authStatus: boolean;
    dataReceived: boolean;
    dataPushed: boolean;
    lastDataReceived: any;
    refreshClick: () => void;
    addLog: (message: string, type: string) => void;
}

function SystemStatus({ authStatus, dataReceived, dataPushed, lastDataReceived, refreshClick, addLog }: SystemStatusProps) {

    function authClick() {
        const serverPort = 8080; 
        const authUrl = `http://localhost:${serverPort}/auth`;
        
        const authWindow = window.open(authUrl, 'twitchAuthWindow', 'width=800,height=700,resizable=yes');

        if (authWindow) {
            authWindow.focus();
        }
    }

    function logoutClick() {
        fetch('/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    addLog('Successfully logged out from Twitch', 'success');
                }
            })
            .catch(error => {
                addLog('Error logging out: ' + error.message, 'error');
            });
    }

    return (<Section title="System Status">
        <div className="flex flex-col gap-2">
            <div className="flex items-center">
                <StatusLight online={authStatus} />Authenticated with Twitch
            </div>
            <div className="flex items-center">
                <StatusLight online={dataReceived} />{dataReceived ? 'TTPG data received' : 'No data received from TTPG yet'}
            </div>
            <div className="flex items-center">
                <StatusLight online={dataPushed} />{dataPushed ? 'PubSub connected' : 'PubSub status: error'}
            </div>
            <div>
                Last received data: {lastDataReceived}
            </div>
        </div>
        <button onClick={() => authClick()} className="bg-blue-500 rounded p-2 text-white font-semibold text-sm m-2">Authenticate with Twitch</button>
        <button onClick={() => logoutClick()} className="bg-blue-300 border-blue-500 border rounded p-2 text-black font-semibold text-sm m-2">Logout Twitch</button>
        <button onClick={() => refreshClick()} className="bg-blue-50 border-blue-500 border rounded p-2 text-black font-semibold text-sm m-2">Refresh Status</button>
    </Section>);
}

export default SystemStatus;
