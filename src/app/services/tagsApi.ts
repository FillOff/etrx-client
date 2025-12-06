import axios from 'axios';
import { Tag, UpdateTagComplexityDto } from '../models/Tag';

const API_URL = 'http://localhost:8080/api'; 

export const TagsApi = {
    getAll: async (): Promise<Tag[]> => {
        const response = await axios.get<Tag[]>(`${API_URL}/Tags`);
        return response.data;
    },

    updateComplexity: async (name: string, complexity: number): Promise<void> => {
        const body: UpdateTagComplexityDto = { complexity };
        
        await axios.put(`${API_URL}/Tags/${name}`, body);
    }
};