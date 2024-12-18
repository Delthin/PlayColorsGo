export type UserVO = {
    id?: number;
    name: string;
    password?: string;
    paletteCollections?: PaletteCollectionVO[];
}

export type PaletteCollectionVO = {
    id?: number;
    name: string;
    palettes?: PaletteVO[];
}

export type PaletteVO = {
    id?: number;
    colors: string[];
}

export type UserInfo = {   
    name?: string;
    password?: string;
}
