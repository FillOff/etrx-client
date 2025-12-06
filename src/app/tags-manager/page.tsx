'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Tag {
    id: string;
    name: string;
    complexity: number;
}

const API_URL = 'http://localhost:8080/api'; 

export default function TagsManagerPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            setLoading(true);
            const response = await axios.get<Tag[]>(`${API_URL}/tags`);
            
            const sortedTags = response.data.sort((a, b) => 
                (a.complexity - b.complexity) || a.name.localeCompare(b.name)
            );
            
            setTags(sortedTags);
            setError(null);
        } catch (e) {
            console.error(e);
            setError('Boot failed. Make sure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (id: string, value: string) => {
        const numberValue = parseInt(value) || 0;
        setTags(prev => prev.map(tag => 
            tag.id === id ? { ...tag, complexity: numberValue } : tag
        ));
    };

    const saveComplexity = async (tag: Tag) => {
        try {
            await axios.put(`${API_URL}/tags/${tag.name}`, { 
                complexity: tag.complexity 
            });
            console.log(`Saved (PUT): ${tag.name} -> ${tag.complexity}`);
        } catch (e) {
            console.error(e);
            alert(`Save error "${tag.name}". Check console.`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, tag: Tag) => {
        if (e.key === 'Enter') {
            saveComplexity(tag);
            (e.target as HTMLInputElement).blur();
        }
    };

    if (loading) return <div className="p-10 text-xl">Download...</div>;
    if (error) return <div className="p-10 text-xl text-red-600">{error}</div>;

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-4">Tag complexity</h1>
            <p className="text-gray-600 mb-6">
                Change value (10, 20...). Saving occurs when you press Enter or click outside the field.
            </p>

            <div className="overflow-hidden border border-gray-200 rounded-lg shadow-md">
                <table className="min-w-full bg-white text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700 uppercase">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Complexity</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {tags.map((tag) => (
                            <tr key={tag.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 text-lg">
                                    {tag.name}
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="number"
                                        className="border border-gray-300 rounded px-3 py-2 w-24 text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={tag.complexity}
                                        onChange={(e) => handleInputChange(tag.id, e.target.value)}
                                        onBlur={() => saveComplexity(tag)}
                                        onKeyDown={(e) => handleKeyDown(e, tag)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}