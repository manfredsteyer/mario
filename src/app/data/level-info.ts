export type LevelInfo = {
    title: string;
    fileName: string;
};

export type LevelOverview = {
    levels: LevelInfo[];
};

export const initLevelOverview: LevelOverview = {
    levels: []
};
