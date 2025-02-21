export type LevelInfo = {
    title: string;
    levelKey: string;
};

export type LevelOverview = {
    levels: LevelInfo[];
};

export const initLevelOverview: LevelOverview = {
    levels: []
};
