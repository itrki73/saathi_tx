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
import { log } from 'console';

const socket_client = io_client('http://localhost:3006');

socket_client.on('connect',()=>{
  console.log("we are successfully connected to Rx server")
})


const useHTTPS = process.env.NEXT_PUBLIC_USE_HTTPS === "true";

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const service = new DeviceService();

interface Log{
  isUpside: any;
  battery: any,
  sensor_status: Boolean,
  isTrainDetected:Boolean,
  is_online: Boolean,
  uid:any 
}


const addLog = async (device:Log) => {

  console.log("got device to insert log: ", device)

  const logData = {
    battery: device.battery,
    sensor_status: device.sensor_status,
    isTrainDetected:device.isTrainDetected,
    device_status: device.is_online,
    isUpside:device.isUpside,
    device_uid: device.uid, // Ensure this UID exists in the Device table
  };

  console.log( logData,"this log data has to be stored")

};

app.prepare().then(() => {
  const expressApp = express();

  // CORS configuration
  expressApp.use(cors({
    origin: ['http://localhost:3002', 'https://railkriti.co.in'], // Allow these origins
    methods: ['GET', 'POST', 'PUT'], // Allow these methods
    credentials: true // Allow credentials if needed
  }));

  // Handle API routes through Express
  expressApp.all('*', (req, res) => handle(req, res));

  let server;
  if (useHTTPS) {
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

  // Initialize Socket.IO on the same server with CORS settings
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*", // Allow all origins
      methods: ["GET", "POST"], // Allow specific HTTP methods
      allowedHeaders: ["my-custom-header"], // Allow custom headers (optional)
      credentials: true // Allow credentials (optional)
    }
  });

  const broadcastRealtimeUpdate = async () => {
    try {
      // const data = await service.getAllDevices();
      io.emit('realtimeUpdate',  []);
    } catch (error) {
      console.log("An error has occurred:", error);
    }
  };

  // Broadcast realtime update every minute
  setInterval(broadcastRealtimeUpdate, 60000); // 60000ms = 1 minute


  const sendLog = async (phoneNumbers: any, message:any) => {
    const data = {
      "numbers": phoneNumbers,
      "message": message,
      "template_id": 164893
    }
    const res = await axios.post(`${process.env.NEXT_PUBLIC_WLMS}/api/send-sms`, data);

    return res.data;
  }

  io.on('connection', (socket: any) => {
    console.log('Client connected');

    socket.on("userConnected", async (userId:string) => {
      socket.userId = userId;
      await broadcastRealtimeUpdate();
      //console.log(`User is connected: ${userId}`);
    });

    socket.on('rebootDevice', async (data: any) => {
      console.log("sending data to ", data);
      io.emit("restartRelay", data);
    });

    socket.on('trainDetected', async (deviceId: any) => {
      const uid = socket.deviceId;
      try {
        const device = await service.updateDeviceStatus(uid, { is_online: true });
        socket_client.emit("trainDetectedIn",device);
        await addLog(device);
        
        console.log("traind detected on: ", uid)
      } catch (error) {
        console.error('Error updating device online status:', error);
      }
    });


    socket.on('deviceConnect', async (deviceId: any) => {
      socket.deviceId = deviceId;
      try {
        // const device = await service.updateDeviceStatus(deviceId, { is_online: true });
        // await addLog(device);
        console.log("device connected with id : ", deviceId)
      } catch (error) {
        console.error('Error updating device online status:', error);
      }
    });



    socket.on('disconnect', async () => {
      const deviceId = socket.deviceId;

      if (deviceId) {
        try {
          // const device = await service.updateDeviceStatus(deviceId, { is_online: false });
          // await addLog(device);
          console.log("device disconnected with id : ", deviceId)
        } catch (error) {
          console.error('Error updating device offline status:', error);
        }
      }
    });
  });

  const port = process.env.PORT || 3004;
  server.listen(port, () => {
    console.log(`> Server ready on ${useHTTPS ? 'https' : 'http'}://localhost:${port}`);
  });
});
