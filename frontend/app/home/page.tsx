"use client";
import React from "react";
import ReadContract from "@/components/ReadContract";
import WriteContract from "@/components/WriteContract";
import { homedir } from "os";
const Home = () => {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-10">
      <ReadContract />
      <WriteContract />
    </main>
  );
};
export default Home;
