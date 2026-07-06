export interface Job {
    id: string;
    title: string;
    description: string;
    company: string;
    location: { lat: number; lon: number };
    createdAt: string;
}

export interface GetJobsResponse {
    jobs: Job[];
    from: number;
    size: number;
}

export interface CursorPageResponse {
    jobs: Job[];
    size: number;
    nextCursor: string | null;
}