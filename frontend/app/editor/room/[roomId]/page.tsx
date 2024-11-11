"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Awareness } from "y-protocols/awareness";
import axios from "axios";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { PinataSDK } from "pinata";
const CANVAS_SIZE = 512;
const pinataApiKey = process.env.NEXT_PUBLIC_API_KEY;
const pinataApiSecret = process.env.NEXT_PUBLIC_API_SECRET;
export default function Room({ params }: { params: { roomId: string } }) {
  const router = useRouter();
  const { roomId } = params;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [color, setColor] = useState<string>("#000000");
  const [drawing, setDrawing] = useState<boolean>(false);
  const [approved, setApproved] = useState(false);
  const [allApproved, setAllApproved] = useState(false);
  const [numUsers, setNumUsers] = useState(1); // Track number of users
  const [users, setUsers] = useState<any[]>([]); // Track users in the room

  const ydoc = useRef<Y.Doc | null>(null);
  const wsProvider = useRef<WebsocketProvider | null>(null);
  const pixelArray = useRef<Y.Array<[number, number, string]> | null>(null);
  const awareness = useRef<any>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    ydoc.current = new Y.Doc();
    wsProvider.current = new WebsocketProvider(
      "ws://localhost:1234",
      `pixel-room-${roomId}`,
      ydoc.current
    );

    // Create a shared array for pixels
    pixelArray.current =
      ydoc.current.getArray<[number, number, string]>("pixels");

    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      setCtx(context);
      canvas.width = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;
      canvas.style.imageRendering = "pixelated";
      drawInitialGrid(context);

      // Observe pixel changes and sync across clients
      pixelArray.current.observe((event) => {
        event.changes.added.forEach((change) => {
          change.content.getContent().forEach(([x, y, pixelColor]) => {
            drawPixel(context, x, y, pixelColor);
          });
        });
      });

      pixelArray.current.forEach(([x, y, pixelColor]) => {
        drawPixel(context, x, y, pixelColor);
      });
    }

    // Setup awareness to track users and approvals
    awareness.current = wsProvider.current.awareness;
    awareness.current.setLocalStateField("approved", false); // Default approval status
    awareness.current.on("change", () => {
      const states = Array.from(awareness.current.getStates().values());
      const allUsersApproved = states.every((state: any) => state?.approved);
      setAllApproved(allUsersApproved);
      setNumUsers(states.length);
    });

    // Cleanup on component unmount
    return () => {
      wsProvider.current?.destroy();
      ydoc.current?.destroy();
    };
  }, [roomId]);

  const drawInitialGrid = (context: CanvasRenderingContext2D | null) => {
    if (context) {
      context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      for (let x = 0; x < CANVAS_SIZE; x++) {
        for (let y = 0; y < CANVAS_SIZE; y++) {
          drawPixel(context, x, y, "#FFFFFF");
        }
      }
    }
  };

  // Function to draw a pixel at a given x, y coordinate
  const drawPixel = (
    context: CanvasRenderingContext2D | null,
    x: number,
    y: number,
    color: string
  ) => {
    if (context) {
      context.fillStyle = color;
      context.fillRect(x, y, 1, 1);
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (!ctx || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor(
      (event.clientX - rect.left) / (rect.width / CANVAS_SIZE)
    );
    const y = Math.floor(
      (event.clientY - rect.top) / (rect.height / CANVAS_SIZE)
    );

    drawPixel(ctx, x, y, color);

    pixelArray.current?.push([[x, y, color]]);
    setDrawing(true);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!ctx || !canvasRef.current || !drawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor(
      (event.clientX - rect.left) / (rect.width / CANVAS_SIZE)
    );
    const y = Math.floor(
      (event.clientY - rect.top) / (rect.height / CANVAS_SIZE)
    );

    drawPixel(ctx, x, y, color);

    pixelArray.current?.push([[x, y, color]]);
  };

  const handleMouseUp = () => setDrawing(false);

  const handleApprove = () => {
    setApproved(true);
    awareness.current.setLocalStateField("approved", true);
  };
  const uploadImageToPinata = async (imageBlob: Blob) => {
    const formData = new FormData();
    formData.append("file", imageBlob, "pixel-art.png");

    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const headers = {
      "Content-Type": `multipart/form-data`,
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataApiSecret,
    };

    try {
      setUploading(true);
      const response = await axios.post(url, formData, { headers });

      console.log(`Image uploaded to IPFS: ${response.data.IpfsHash}`);

      setUploading(false);
      return response.data.IpfsHash;
    } catch (error) {
      console.error("Error uploading image to Pinata:", error);
      throw error;
      setUploading(false);
    }
  };

  // Function to convert canvas to Blob
  const canvasToBlob = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to convert canvas to Blob"));
          }
        });
      } else {
        reject(new Error("Canvas not found"));
      }
    });
  };

  const uploadMetadataToPinata = async (metadata: any) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    const headers = {
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataApiSecret,
    };

    try {
      setUploading(true);
      const response = await axios.post(url, metadata, { headers });
      const dbResponse = await axios.post("http://localhost:8080/ipfs", {
        ipfsHash: response.data.IpfsHash,
      });
      console.log(`Metadata uploaded to IPFS: ${response.data.IpfsHash}`);
      setUploading(false);
      return response.data.IpfsHash;
    } catch (error) {
      console.error("Error uploading metadata to Pinata:", error);
      throw error;
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-lg font-bold mb-4">Room ID: {roomId}</h1>

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="border-2 border-white"
      />

      <div className="mt-4">
        <label htmlFor="colorPicker">Choose color:</label>
        <input
          id="colorPicker"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="ml-2"
        />
      </div>

      <button
        onClick={handleApprove}
        className={`mt-4 py-2 px-4 rounded ${
          approved ? "bg-green-500" : "bg-blue-500"
        }`}
        disabled={approved}
      >
        {approved ? "Approved" : "Approve"}
      </button>

      <div className="mt-4">
        <p>Number of users in the room: {numUsers}</p>
        {allApproved && (
          <p className="text-green-500">All users have approved!</p>
        )}
        <Button
          disabled={!allApproved || uploading}
          onClick={async () => {
            try {
              const imageBlob = await canvasToBlob(); // Convert canvas to Blob
              const imageIpfsHash = await uploadImageToPinata(imageBlob); // Pass the Blob to the function
              await uploadMetadataToPinata({
                name: `Pixel Art by ${roomId}`,
                description: "Pixel art created by users in a shared room",
                image: `https://ipfs.io/ipfs/${imageIpfsHash}`,
                imageIpfsHash,
              });
              router.push("/");
            } catch (error) {
              console.error("Error uploading image:", error);
            }
          }}
        >
          {uploading ? (
            <div>Uploading...</div>
          ) : (
            <div>Upload to marketplace</div>
          )}
        </Button>
      </div>
    </div>
  );
}
