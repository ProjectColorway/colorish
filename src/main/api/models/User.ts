export default interface User {
    id: string,
    username: string,
    avatar: string,
    discriminator: string,
    public_flags: number,
    flags: number,
    banner: string | null,
    accent_color: number,
    global_name: string,
    avatar_decoration_data: {
        asset: string,
        sku_id: string,
        expires_at: string | null;
    } | null,
    collectibles: any[] | null,
    banner_color: string,
    clan: any,
    primary_guild: any,
    mfa_enabled: boolean,
    locale: string,
    premium_type: number,
    email: string,
    verified: boolean;
}
