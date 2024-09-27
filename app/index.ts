import { createServer as createHttpServer, IncomingMessage, ServerResponse } from 'http';
import { createServer as createHttpsServer } from 'https';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { io as io_client } from 'socket.io-client';

import cors from 'cors';
import express from 'express';
import fs from 'fs';
import axios from 'axios';
import { DeviceService } from './services/device_service';
import { LogService } from './services/log_service';
import conf from '../config/conf';


// Socket.IO client connection
const socket_client = io_client(conf.RX_SOCKET_URL);
socket_client.on('connect', () => {
  console.log("Successfully connected to Rx server");
});


const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const service = new DeviceService();
const logService = new LogService();

interface Log {
  isUpside: any;
  battery: any;
  sensor_status: boolean;
  isTrainDetected: boolean;
  is_online: boolean;
  uid: any;
}

const addLog = async (device: Log) => {
  const logData = {
    battery: device.battery,
    sensor_status: device.sensor_status,
    isTrainDetected: device.isTrainDetected,
    device_status: device.is_online,
    isUpside: device.isUpside,
    device_uid: device.uid, // Ensure this UID exists in the Device table
  };

  try {
    await logService.addLog(logData);
  } catch (error) {
    console.error("Error adding log:", error);
  }
};

app.prepare().then(() => {
  const expressApp = express();

  // CORS configuration
  expressApp.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT'],
    credentials: true
  }));

  // Handle API routes through Express
  expressApp.all('*', (req, res) => handle(req, res));

  let server;
  if (conf.USE_HTTPS) {
    const sslOptions = {
      key: fs.readFileSync('app/ssl/private.key'),
      cert: fs.readFileSync('app/ssl/certificate.crt')
    };
    // Create HTTPS server
    server = createHttpsServer(sslOptions, expressApp);
  } else {
    // Create HTTP server
    server = createHttpServer(expressApp);
  }

  // Initialize Socket.IO on the same server
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    }
  });

  const broadcastRealtimeUpdate = async () => {
    try {
      const data = await service.getAllDevices();
      io.emit('realtimeUpdate', data);
    } catch (error) {
      console.error("An error occurred during broadcast:", error);
    }
  };

  // Broadcast realtime update every minute
  setInterval(broadcastRealtimeUpdate, 60000);


  io.on('connection', (socket: any) => {
    console.log('Client connected');

    socket.on("userConnected", async (userId: string) => {
      socket.userId = userId;
      await broadcastRealtimeUpdate();
    });

    socket.on('rebootDevice', (data: any) => {
      console.log("Sending data to", data);
      io.emit("restartRelay", data);
    });

    socket.on('updateDevice', async (data: any) => {
      const uid = socket.deviceId;
      try {
        const device = await service.updateDeviceStatus(uid, data);
        if (data.isTrainDetected) {
          socket_client.emit("trainDetectedIn", device);
        }
        await addLog(device);
      } catch (error) {
        console.error('Error updating device online status:', error);
      }
    });

    socket.on('deviceConnect', async (deviceId: any) => {
      socket.deviceId = deviceId;
      try {
        const device = await service.updateDeviceStatus(deviceId, { is_online: true });
        await addLog(device);
        console.log("Device connected with ID:", deviceId);
      } catch (error) {
        console.error('Error updating device online status:', error);
      }
    });

    socket.on('disconnect', async () => {
      const deviceId = socket.deviceId;
      if (deviceId) {
        try {
          const device = await service.updateDeviceStatus(deviceId, { is_online: false });
          await addLog(device);
          console.log("Device disconnected with ID:", deviceId);
        } catch (error) {
          console.error('Error updating device offline status:', error);
        }
      }
    });
  });

  const port = conf.PORT || 3005;
  server.listen(port, () => {
    console.log(`> Server ready on ${conf.USE_HTTPS ? 'https' : 'http'}://localhost:${port}`);
  });
});
