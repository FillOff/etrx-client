import React, { useEffect, useState } from 'react';
import { Tag } from '../models/Tag';
import { TagsApi } from '../services/tagsApi';

export const TagsComplexityPage = () => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            setLoading(true);
            const data = await TagsApi.getAll();
            const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
            setTags(sorted);
        } catch (e) {
            console.error("Error loading tags", e);
            alert("Failed to load tags");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (id: string, newValue: string) => {
        const numberValue = parseInt(newValue) || 0;
        
        setTags(prevTags => prevTags.map(tag => 
            tag.id === id ? { ...tag, complexity: numberValue } : tag
        ));
    };

    const saveComplexity = async (tag: Tag) => {
        try {
            await TagsApi.updateComplexity(tag.name, tag.complexity);
            console.log(`Tag ${tag.name} updated: ${tag.complexity}`);
        } catch (e) {
            console.error(`Error while saving tag ${tag.name}`, e);
            alert(`Error while saving tag ${tag.name}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, tag: Tag) => {
        if (e.key === 'Enter') {
            saveComplexity(tag);
            (e.target as HTMLInputElement).blur();
        }
    };

    if (loading) return <div>Tag loading...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Set complexity tags</h1>
            <p>10 - easy, 20 - harder (step 10). Can be inserted 15.</p>
            
            <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ background: '#f0f0f0' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Название тега</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Сложность</th>
                    </tr>
                </thead>
                <tbody>
                    {tags.map(tag => (
                        <tr key={tag.id}>
                            <td style={{ padding: '10px' }}>
                                <strong>{tag.name}</strong>
                            </td>
                            <td style={{ padding: '10px' }}>
                                <input
                                    type="number"
                                    value={tag.complexity}
                                    onChange={(e) => handleInputChange(tag.id, e.target.value)}
                                    onBlur={() => saveComplexity(tag)}
                                    onKeyDown={(e) => handleKeyDown(e, tag)}
                                    style={{ 
                                        padding: '5px', 
                                        width: '80px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};