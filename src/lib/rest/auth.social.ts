import { SocialProvider, SocialLoginWindowOptions } from "./auth.social.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export function openSocialLogin(
    provider: SocialProvider,
    options: SocialLoginWindowOptions = {}
) {
    const { width = 500, height = 600, name = `${provider}Login` } = options;

    window.open(
        `${BASE_URL}/oauth2/authorization/${provider}`,
        name,
        `width=${width},height=${height}`
    );
}

export const googleLoginHandler = () => openSocialLogin("google");
