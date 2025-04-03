export type Memo = {
    idx: number;
    title: string;
    content: string;
    group_idx: number;
    group_name: string;
    isPinned: boolean;
    image_url?: string;
    pin_order: number | null;
    created_at?: string; // ISO 형식 문자열
    updated_at?: string;
};

export type Group = {
    idx: number;
    group_name: string;
};
