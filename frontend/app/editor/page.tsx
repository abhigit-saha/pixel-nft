// app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const router = useRouter();
  const [roomIdInput, setRoomIdInput] = useState("");

  const createRoom = () => {
    const roomId = uuidv4();
    router.push(`/editor/room/${roomId}`);
  };

  const joinRoom = () => {
    if (roomIdInput.trim()) {
      router.push(`/editor/room/${roomIdInput.trim()}`);
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">
        Collaborative Pixel Art Editor
      </h1>

      <button
        onClick={createRoom}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Create Room
      </button>

      <div className="flex flex-col items-center">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomIdInput}
          onChange={(e) => setRoomIdInput(e.target.value)}
          className="mb-2 p-2 text-black rounded"
        />
        <button
          onClick={joinRoom}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Join Room
        </button>
      </div>
    </div>
  );
}
