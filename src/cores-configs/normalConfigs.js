import { getConfigAddresses, generateRemark, randomUpperCase, getRandomPath } from './helpers';
import { getDataset } from '../kv/handlers';

export async function getNormalConfigs(request, env) {
    const { blogSettings } = await getDataset(request, env);
    const { 
        cleanIPs, 
        dlIP, 
        ports, 
        vlessConfigs, 
        trojanConfigs , 
        outdl, 
        customCdnAddrs, 
        customCdnHost, 
        customCdnSni, 
        enableIPv6
    } = blogSettings;
    
    let vlessConfs = '', trojanConfs = '', chaindl = '';
    let dlIndex = 1;
    const Addresses = await getConfigAddresses(cleanIPs, enableIPv6);
    const customCdnAddresses = customCdnAddrs ? customCdnAddrs.split(',') : [];
    const totalAddresses = [...Addresses, ...customCdnAddresses];
    const alpn = globalThis.client === 'singbox' ? 'http/1.1' : 'h2,http/1.1';
    const trojanPass = encodeURIComponent(globalThis.trojanPassword);
    const earlyData = globalThis.client === 'singbox' 
        ? '&eh=Sec-WebSocket-Protocol&ed=2560' 
        : encodeURIComponent('?ed=2560');
    
    ports.forEach(port => {
        totalAddresses.forEach((addr, index) => {
            const isCustomAddr = index > Addresses.length - 1;
            const configType = isCustomAddr ? 'C' : '';
            const sni = isCustomAddr ? customCdnSni : randomUpperCase(globalThis.hostName);
            const host = isCustomAddr ? customCdnHost : globalThis.hostName;
            const path = `${getRandomPath(16)}${dlIP ? `/${encodeURIComponent(btoa(dlIP))}` : ''}${earlyData}`;
            const vlessRemark = encodeURIComponent(generateRemark(dlIndex, port, addr, cleanIPs, 'VLESS', configType));
            const trojanRemark = encodeURIComponent(generateRemark(dlIndex, port, addr, cleanIPs, 'Trojan', configType));
            const tlsFields = globalThis.defaultHttpsPorts.includes(port) 
                ? `&security=tls&sni=${sni}&fp=randomized&alpn=${alpn}`
                : '&security=none';

            if (vlessConfigs) {
                vlessConfs += `${atob('dmxlc3M6Ly8=')}${globalThis.userID}@${addr}:${port}?path=/${path}&encryption=none&host=${host}&type=ws${tlsFields}#${vlessRemark}\n`; 
            }

            if (trojanConfigs) {
                trojanConfs += `${atob('dHJvamFuOi8v')}${trojanPass}@${addr}:${port}?path=/tr${path}&host=${host}&type=ws${tlsFields}#${trojanRemark}\n`;
            }
            
            dlIndex++;
        });
    });

    if (outdl) {
        let chainRemark = `#${encodeURIComponent('💦 Chain dl 🔗')}`;
        if (outdl.startsWith('socks') || outdl.startsWith('http')) {
            const regex = /^(?:socks|http):\/\/([^@]+)@/;
            const isUserPass = outdl.match(regex);
            const userPass = isUserPass ? isUserPass[1] : false;
            chaindl = userPass 
                ? outdl.replace(userPass, btoa(userPass)) + chainRemark 
                : outdl + chainRemark;
        } else {
            chaindl = outdl.split('#')[0] + chainRemark;
        }
    }

    const configs = btoa(vlessConfs + trojanConfs + chaindl);
    return new Response(configs, { 
        status: 200,
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate, dl-revalidate',
            'CDN-Cache-Control': 'no-store'
        }
    });
}