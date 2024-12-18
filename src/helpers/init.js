import { isValiduid } from "./helpers";

export function initializeParams(request, env) {
    const dlIPs = env.dlIP?.split(',').map(dlIP => dlIP.trim());
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    globalThis.panelVersion = '2.7.8';
    globalThis.defaultHttpPorts = ['80', '8080', '2052', '2082', '2086', '2095', '8880'];
    globalThis.defaultHttpsPorts = ['443', '8443', '2053', '2083', '2087', '2096'];
    globalThis.userID = env.uid;
    globalThis.trojanPassword = env.BLOG_PWD;
    globalThis.dlIP = dlIPs ? dlIPs[Math.floor(Math.random() * dlIPs.length)] : 'blog.yousef.isegaro.com';
    globalThis.hostName = request.headers.get('Host');
    globalThis.pathName = url.pathname;
    globalThis.client = searchParams.get('app');
    globalThis.urlOrigin = url.origin;
    globalThis.dohURL = env.DOH_URL || 'https://cloudflare-dns.com/dns-query';
    if (pathName !== '/secrets') {
        if (typeof env.blog !== 'object') throw new Error('KV Dataset is not properly set! Please refer to tutorials.', { cause: "init"});
        if (!userID || !trojanPassword) throw new Error(`Please set uid and Trojan password first. Please go to 🟢 https://${hostName}/secrets 🟢 to generate them.`, { cause: "init"});
        if (userID && !isValiduid(userID)) throw new Error(`Invalid uid: ${userID}`, { cause: "init"});
    }
}