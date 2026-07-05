export interface Job {
    id: string;
    title: string;
    company: string;
    description: string;
    skills: string[];
    location: { lat: number; lon: number };
    createdAt: string;
}