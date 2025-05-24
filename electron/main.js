const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");
const http = require("http");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const socketIo = require("socket.io");
const { nativeImage, Tray, Menu } = require("electron");
const axios = require("axios");
const zlib = require("zlib");


/*
========================
     LOGGING SET UP
========================
*/

const LOG_FILE_PATH = path.join(os.homedir(), "electron-app-log.txt");

let frontendLogger = {
  log: (message) => {
    if (io) {
      io.emit("server_log", { type: "info", message: String(message) });
    }
  },
  error: (message) => {
    if (io) {
      io.emit("server_log", { type: "error", message: String(message) });
    }
  },
  warn: (message) => {
    if (io) {
      io.emit("server_log", { type: "warning", message: String(message) });
    }
  },
  success: (message) => {
    if (io) {
      io.emit("server_log", { type: "success", message: String(message) });
    }
  },
};

function logToFile(message) {
  if (
    message.includes("[ERROR]") ||
    message.includes("[UNCAUGHT EXCEPTION]") ||
    message.includes("[UNHANDLED REJECTION]")
  ) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    try {
      fs.appendFileSync(LOG_FILE_PATH, logMessage);
    } catch (err) {
      try {
        const tempLogPath = path.join(os.tmpdir(), "electron-app-log.txt");
        fs.appendFileSync(tempLogPath, logMessage);
      } catch (e) {}
    }
  }
}

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.log = function () {
  const args = Array.from(arguments).join(" ");
  originalConsoleLog.apply(console, arguments);
  if (io) frontendLogger.log(args);
};

console.error = function () {
  const args = Array.from(arguments).join(" ");
  logToFile(`[ERROR] ${args}`);
  originalConsoleError.apply(console, arguments);
  if (io) frontendLogger.error(args);
};

console.warn = function () {
  const args = Array.from(arguments).join(" ");
  originalConsoleWarn.apply(console, arguments);
  if (io) frontendLogger.warn(args);
};

console.success = function () {
  const args = Array.from(arguments).join(" ");
  originalConsoleLog.apply(console, arguments);
  if (io) frontendLogger.success(args);
};

process.on("uncaughtException", (error) => {
  logToFile(`[UNCAUGHT EXCEPTION] ${error.stack || error}`);
  if (io) frontendLogger.error(`Uncaught Exception: ${error.message}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logToFile(`[UNHANDLED REJECTION] ${reason}`);
  if (io) frontendLogger.error(`Unhandled Promise Rejection: ${reason}`);
});




/*
========================
    TWITCH AUTH DATA
     CONFIGURATION
========================
*/


const PORT = 8080;
const CLIENT_ID = "gaod8qeh6v1bhu46nzvo4fmrqqvvrf";
const JWT_SIGNING_URL =
  "https://v0-serverless-jwt-signing.vercel.app/api/sign-jwt";
const REDIRECT_URI = `http://localhost:${PORT}/auth/callback`;
const VERSION = "1.0.0";
const USER_DATA_PATH = path.join(os.homedir(), ".ttpg-twitch-helper");
const AUTH_FILE_PATH = path.join(USER_DATA_PATH, "auth-data.json");

let tray = null;
let mainWindow;
let expressApp;
let server;
let io;
let signedJwt = "";


let config = {
  autoReconnect: true,
  debugMode: false,
  refreshInterval: 5,
  minimizeToTray: true,
  startMinimized: false,
  autoLaunch: false,
};

let authData = {
  token: null,
  channelId: null,
  isAuthenticated: false,
};

function loadSavedAuthData() {
  try {
    if (!fs.existsSync(USER_DATA_PATH)) {
      fs.mkdirSync(USER_DATA_PATH, { recursive: true });
      return false;
    }

    if (fs.existsSync(AUTH_FILE_PATH)) {
      const savedData = JSON.parse(fs.readFileSync(AUTH_FILE_PATH, "utf8"));
      if (savedData && savedData.token && savedData.channelId) {
        authData = savedData;
        console.log("Loaded saved authentication data");
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Error loading saved auth data:", error.message);
    return false;
  }
}

function saveAuthData() {
  try {
    if (!fs.existsSync(USER_DATA_PATH)) {
      fs.mkdirSync(USER_DATA_PATH, { recursive: true });
    }
    fs.writeFileSync(AUTH_FILE_PATH, JSON.stringify(authData, null, 2));
    console.log("Authentication data saved");
  } catch (error) {
    console.error("Error saving auth data:", error.message);
  }
}


/*
========================
       SET UP APP
========================
*/

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createWindow);
}

const isDev =
  process.env.NODE_ENV !== "development" ||
  (process.env.NODE_ENV === undefined && !app.isPackaged);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  startExpressServer();

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    const possiblePaths = [
      path.join(__dirname, "../dist/index.html"),
    ];

    let loaded = false;

    for (const indexPath of possiblePaths) {
      if (fs.existsSync(indexPath)) {
        mainWindow.loadFile(indexPath);
        loaded = true;
        break;
      }
    }

    if (!loaded) {
      console.error("Could not find index.html in any location");

      // Create a simple HTML page with debugging information
      const debugHtml = `
        <html>
          <head>
            <title>Debug Information</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
            </style>
          </head>
          <body>
            <h1>Failed to load application</h1>
            <p>The application could not find the required HTML files.</p>
            <h2>Debug Information:</h2>
            <pre>
App path: ${app.getAppPath()}
Current directory: ${process.cwd()}
Resource path: ${process.resourcesPath}
Log file: ${LOG_FILE_PATH}
            </pre>
            <h2>Directory Contents:</h2>
            <pre>
App directory: ${listDirectoryContents(app.getAppPath())}

Resources directory: ${listDirectoryContents(process.resourcesPath)}

Current directory: ${listDirectoryContents(process.cwd())}
            </pre>
          </body>
        </html>
      `;

      // Write the debug HTML to a temporary file and load it
      const tempHtmlPath = path.join(os.tmpdir(), "electron-debug.html");
      fs.writeFileSync(tempHtmlPath, debugHtml);
      mainWindow.loadFile(tempHtmlPath);
    }
  }

  createTray();

  mainWindow.on("closed", function () {
    mainWindow = null;
  });

  // Only open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

function createTray() {
  try {
    const image = nativeImage.createFromPath(
      path.join(__dirname, "assets", "icon.png")
    );

    tray = new Tray(image);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Open Dashboard",
        click: () => {
          mainWindow.show();
        },
      },
      {
        label: "Twitch Authentication",
        click: () => {
          const authWindow = new BrowserWindow({
            width: 800,
            height: 700,
            parent: mainWindow,
            modal: true,
          });

          authWindow.loadURL(`http://localhost:${PORT}/auth`);

          authWindow.on("closed", () => {
            if (mainWindow) {
              mainWindow.webContents.reload();
            }
          });
        },
      },
      { type: "separator" },
      {
        label: "Debug Mode",
        type: "checkbox",
        checked: config.debugMode,
        click: (menuItem) => {
          config.debugMode = menuItem.checked;
          io.emit("config_updated", config);
        },
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => {
          app.isQuitting = true;
          app.quit();
        },
      },
    ]);

    tray.setToolTip("TTPG Twitch Extension Helper");
    tray.setContextMenu(contextMenu);

    tray.on("click", () => {
      mainWindow.show();
    });
  } catch (error) {
    console.error("Failed to create tray icon:", error.message);
  }
}


/*
=======================
     SET UP SERVER
=======================
*/

function startExpressServer() {
  expressApp = express();
  server = http.createServer(expressApp);
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Set up Socket.IO connection handler
  io.on("connection", (socket) => {
    console.success("Client connected to Socket.IO");

    // Send initial logs
    socket.emit("server_log", {
      type: "info",
      message: `Server started at ${new Date().toISOString()}`,
    });
  });

  expressApp.use(cors());
  expressApp.use(bodyParser.json({ limit: "5mb" }));

  expressApp.use((req, res, next) => {
    next();
  });

  expressApp.get("/", (req, res) => {
    const indexPath = path.join(__dirname, "index.html");
    console.log("Serving index.html from:", indexPath);
    console.log("File exists:", fs.existsSync(indexPath));
    res.sendFile(indexPath);
  });

  expressApp.get("/auth", (req, res) => {
    console.log("Auth endpoint called");
    const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=token&scope=channel:read:subscriptions`;

    res.redirect(authUrl);
  });

  expressApp.get("/auth/callback", (req, res) => {
    const callbackPath = path.join(__dirname, "public", "callback.html");
    console.log("Serving callback.html from:", callbackPath);
    console.log("File exists:", fs.existsSync(callbackPath));
    res.sendFile(callbackPath);
  });

  expressApp.post("/auth/complete", (req, res) => {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ error: "No access token provided" });
    }

    axios
      .get("https://api.twitch.tv/helix/users", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Client-ID": CLIENT_ID,
        },
      })
      .then((response) => {
        const userData = response.data.data[0];

        authData = {
          token: access_token,
          channelId: userData.id,
          username: userData.login,
          displayName: userData.display_name,
          isAuthenticated: true,
        };

        saveAuthData();

        console.log(
          "Authentication successful for user:",
          userData.display_name
        );
        io.emit("auth_status", {
          authenticated: true,
          channelId: userData.id,
          username: userData.login,
          displayName: userData.display_name,
        });

        res.json({ success: true });
      })
      .catch((err) => {
        console.error("Error getting user data:", err.message);
        res.status(500).json({ error: "Failed to get user data" });
      });
  });

  expressApp.post("/auth/logout", (req, res) => {
    authData = {
      token: null,
      channelId: null,
      isAuthenticated: false,
    };

    // Delete the saved auth file
    try {
      if (fs.existsSync(AUTH_FILE_PATH)) {
        fs.unlinkSync(AUTH_FILE_PATH);
      }
    } catch (error) {
      console.error("Error removing auth file:", error.message);
    }

    io.emit("auth_status", {
      authenticated: false,
      channelId: null,
      username: null,
      displayName: null,
    });

    res.json({ success: true });
  });

  expressApp.post("/postkey_ttpg", async (req, res) => {
    const preprocessedGameData = req.body;

    const gameData = transformTTPGtoAppV2(preprocessedGameData);
    lastGameData = gameData;

    if (config.debugMode) {
      console.log(
        "Received game data:",
        JSON.stringify(gameData).substring(0, 100) + "..."
      );
    }

    io.emit("ttpg_data", gameData);

    if (!authData.isAuthenticated) {
      return res.status(401).json({ error: "Not authenticated with Twitch" });
    }

    try {
      if (signedJwt === "") {
        signedJwt = await getNewSignedJWT();
      }

      const pubsubResult = await sendToPubSub(signedJwt, gameData);

      io.emit("pubsub_status", { success: true });

      console.log("PubSub result:", pubsubResult);

      res.json({ success: true });
    } catch (err) {
      console.error("Error processing game data:", err.message);

      io.emit("pubsub_status", {
        success: false,
        error: err.message,
        details: err.details,
      });

      res
        .status(500)
        .json({ error: "Error processing game data: " + err.message });
    }
  });

  async function getNewSignedJWT() {
    try {
      console.log("Attempting to sign JWT...");
      const jwtPayload = {
        user_id: authData.channelId,
        role: "external",
        channel_id: authData.channelId,
        pubsub_perms: {
          send: ["broadcast"],
        },
      };

      const signResponse = await axios.post(JWT_SIGNING_URL, jwtPayload);
      const newSignedJwt = signResponse.data.token;
      console.log("JWT signed successfully.");

      return newSignedJwt;
    } catch {
      throw new Error("Failed to sign JWT");
    }
  }

  expressApp.get("/api/status", (req, res) => {
    const status = {
      version: VERSION,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      authenticated: authData.isAuthenticated,
      channelId: authData.channelId,
      lastDataReceived: lastGameData ? new Date().toISOString() : null,
      config: config,
      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        memory: {
          total: Math.floor(os.totalmem() / (1024 * 1024)),
          free: Math.floor(os.freemem() / (1024 * 1024)),
        },
      },
    };

    res.json(status);
  });

  expressApp.post("/api/config", (req, res) => {
    const newConfig = req.body;

    if (!newConfig) {
      return res.status(400).json({ error: "Invalid configuration" });
    }

    config = {
      ...config,
      ...newConfig,
    };

    io.emit("config_updated", config);
    res.json({ success: true, config });
  });

  server.listen(PORT, () => {
    const networkInterfaces = os.networkInterfaces();
    let localIp = "localhost";

    Object.keys(networkInterfaces).forEach((ifname) => {
      networkInterfaces[ifname].forEach((iface) => {
        if (iface.family === "IPv4" && !iface.internal) {
          localIp = iface.address;
        }
      });
    });

    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Or access via local network: http://${localIp}:${PORT}`);
    console.log(
      `To authenticate with Twitch, visit http://localhost:${PORT}/auth`
    );
  });
}

async function sendToPubSub(jwt, data) {
  try {
    const endpoint = `https://api.twitch.tv/helix/extensions/pubsub`;

    const jsonString = JSON.stringify(data);
    const compressedData = zlib.gzipSync(jsonString).toString("base64");

    const payload = {
      broadcaster_id: authData.channelId,
      message: JSON.stringify({
        compressed: true,
        data: compressedData,
      }),
      target: ["broadcast"],
    };

    const headers = {
      Authorization: `Bearer ${jwt}`,
      "Client-ID": "7t2yby9rut597oiqidb2cu7hvzwwuv",
      "Content-Type": "application/json",
    };

    if (config.debugMode) {
      console.log("PubSub Request:", {
        endpoint,
        headers: { ...headers, Authorization: "Bearer [TOKEN HIDDEN]" },
        payload: {
          ...payload,
          message: `[COMPRESSED: ${compressedSize.toFixed(2)}KB]`,
        },
      });
    }

    const response = await axios.post(endpoint, payload, { headers });

    console.log("Data sent to PubSub successfully:", response.status);

    return response.data;
  } catch (err) {
    console.error("=== PubSub Error Details ===");
    console.error(`Status: ${err.response?.status || "Unknown"}`);
    console.error(`Message: ${err.message}`);

    if (err.response) {
      console.error(
        "Response data:",
        JSON.stringify(err.response.data, null, 2)
      );
      console.error(
        "Response headers:",
        JSON.stringify(err.response.headers, null, 2)
      );
    }

    // Log JWT details (expiration only, not the token itself)
    try {
      const tokenParts = jwt.split(".");
      if (tokenParts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(tokenParts[1], "base64").toString()
        );
        console.error(
          "JWT expiration:",
          new Date(payload.exp * 1000).toISOString()
        );
        console.error("Current time:", new Date().toISOString());
        console.error("JWT expired:", payload.exp * 1000 < Date.now());
      }
    } catch (tokenErr) {
      console.error("Could not parse JWT for debugging:", tokenErr.message);
    }

    console.error("Channel ID:", authData.channelId);
    console.error("==========================");

    // Enrich the error object with more context for the UI
    const enhancedError = new Error(`PubSub Error: ${err.message}`);
    enhancedError.status = err.response?.status;
    enhancedError.details = err.response?.data;

    throw enhancedError;
  }
}

app.on("will-quit", () => {
  if (server) {
    server.close();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

/*
========================
       SET UP IPC
  Communicates between
  server and front-end
========================
*/

function setupIPC() {
  ipcMain.handle("get-app-info", () => {
    return {
      appName: app.getName(),
      appVersion: app.getVersion(),
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      chromeVersion: process.versions.chrome,
    };
  });

  ipcMain.handle("fetch-api-data", async () => {
    try {
      const serverRunning = await isServerRunning();
      if (!serverRunning) {
        throw new Error(`API server is not running on port ${PORT}`);
      }

      const response = await fetch(`http://localhost:${PORT}/api/data`);
      console.log(
        `Attempting to fetch from: http://localhost:${PORT}/api/data`
      );

      console.log(`Response status: ${response.status} ${response.statusText}`);

      const text = await response.text();

      if (
        text.trim().startsWith("<!DOCTYPE") ||
        text.trim().startsWith("<html")
      ) {
        throw new Error(
          "Received HTML instead of JSON. The API server might be returning a web page."
        );
      }

      const data = JSON.parse(text);
      return data;
    } catch (error) {
      console.error("Error fetching API data:", error);
      return {
        error: error.message || "Failed to fetch data",
        isError: true,
      };
    }
  });
}

setupIPC();

async function isServerRunning() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    const response = await fetch(`http://localhost:${PORT}/api/status`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log(`Server check failed: ${error.message}`);
    return false;
  }
}

function listDirectoryContents(dirPath) {
  try {
    return fs.readdirSync(dirPath).join("\n");
  } catch (err) {
    return `Error reading directory: ${err.message}`;
  }
}
