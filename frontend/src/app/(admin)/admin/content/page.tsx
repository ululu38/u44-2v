'use client';

import React from 'react';

export default function ContentPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#1a2a3a]">General Content</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4">About Us Content</h2>
          <textarea rows={6} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 mb-4" placeholder="Edit description..."></textarea>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Update Content</button>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4">Contact Information</h2>
          <div className="space-y-4">
            <input type="text" placeholder="Phone Number" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg" />
            <input type="text" placeholder="Address" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Update Info</button>
          </div>
        </div>
      </div>
    </div>
  );
}
