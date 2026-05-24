"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "../admin/admin.css";

export default function LoginPage() {
  const [username, setUsername] = useState("admin2");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user?.role === 'admin') {
        window.location.href = "/admin/users";
      } else {
        window.location.href = "/admin/posts";
      }
    } catch (err) {
      alert('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f9] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col md:flex-row max-w-4xl w-full">
        {/* Left Side: Logo */}
        <div className="md:w-1/2 p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
          <div className="relative w-48 h-48 mb-4">
            <Image
              src="/images/U44-icon-133x123.png"
              alt="U FORTY FOUR Logo"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-[#b8955d] text-center font-bold text-sm tracking-widest uppercase">
            U FORTY FOUR
          </p>
          <p className="text-[#b8955d] text-center text-[10px] uppercase">
            TECHNOLOGY SOLUTIONS CO., LTD.
          </p>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#333] mb-2">Admin :</h1>
            <h2 className="text-4xl font-bold text-[#333]">U44Tech</h2>
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative px-4 bg-white">
              <span className="text-sm text-gray-500 uppercase tracking-wider">Login</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-[#eef3ff] border-none rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-800"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[#eef3ff] border-none rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-800"
                required
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#1b8a53] hover:bg-[#156d41] text-white font-bold py-3 rounded transition-colors duration-200"
            >
              Login
            </button>

            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-[#1b8a53] focus:ring-[#1b8a53]"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
