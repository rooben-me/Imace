import React, { useState } from "react";
import Head from "next/head";
import ImageGallery from "../components/ImageGallery";
import SearchBar from "../components/SearchBar";
import Settings from "../components/Settings";
import ThreeDGallery from "../components/ThreeDGallery";

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-gray-900 font-sans">
      <Head>
        <title>Imace</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Imace
          </h1>
          <button
            className="bg-white hover:bg-gray-100/50 border border-gray-200 text-gray-800 rounded-full py-2 px-4 focus:outline-none focus:shadow-outline"
            onClick={() => setShowSettings(!showSettings)}
          >
            {showSettings ? "Hide Settings" : "Show Settings"}
          </button>
        </header>

        {/* Settings Section */}
        {showSettings && <Settings />}

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 order-2">
            {/* Search Bar */}
            <SearchBar />

            {/* Image Gallery */}
            <ImageGallery />
          </div>

          {/* 3D Gallery */}
          <section className="mb-12 order-1 lg:order-2 lg:col-span-4 rounded-xl border border-gray-200 h-[60vh] lg:sticky lg:top-4 lg:h-[calc(100vh-(1rem+3rem+42px+2rem))] bg-white">
            <ThreeDGallery />
          </section>
        </section>
      </main>
    </div>
  );
}
