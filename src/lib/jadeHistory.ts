import { z } from 'zod';

export interface action {
    time: string;
    uid: string;
    add_num: number;
    action: string;
}

export interface uniqueAction {
    action: string;
    lastUpdated: Date;
    jades: number;
    times: number;
    totalJades: number;
}

export const schema = z.object({
    url: z.string().url().refine((val) => {
        return val.includes('api-os-takumi.hoyoverse.com');
    },),
});

export function formatUrl(url: string): URL {
    const inputUrl = new URL(url);
    if (inputUrl.hostname !== 'api-os-takumi.hoyoverse.com') {
        throw new Error('Invalid URL');
    }

    inputUrl.searchParams.set('page_size', '100');
    return inputUrl;
}

export async function loadJadeHistory(url: URL): Promise<action[]> {
    const jadeActionList = [] as action[];
    let prevList = [] as action[];
    let i = 1;

    do {
        url.searchParams.set('page', (i).toString());
        try {
            const res = await fetch(url);
            const json = await res.json();

            const currList = json.data.list as action[];
            jadeActionList.push(...currList);
            prevList = currList
            i++
        } catch {
            console.error('Failed to load page', i);
        } 
    } while (prevList.length > 1)

    return jadeActionList;
}

export function populateUniqueActions(jadeActionList: action[]): Map<action['action'], uniqueAction> {
    return jadeActionList.reduce<Map<action['action'], uniqueAction>>(
        (previousValue, currentValue) => {
            const preVal = previousValue as Map<action['action'], uniqueAction>;

            const item = preVal.get(`${currentValue.action} ${currentValue.add_num}`);

            if (!item) {
                preVal.set(`${currentValue.action} ${currentValue.add_num}`, {
                    action: currentValue.action,
                    jades: currentValue.add_num,
                    lastUpdated: new Date(currentValue.time),
                    times: 1,
                    totalJades: currentValue.add_num
                });

                return preVal;
            }

            const itemDate = new Date(currentValue.time);
            
            if (itemDate > item.lastUpdated) {
                item.lastUpdated = itemDate
            }

            item.times++;
            item.totalJades += currentValue.add_num;

            return preVal;
        },
        new Map()
    );
}

export function calculateTotalJades(jadeActionList: action[]): number {
    return jadeActionList.reduce((previousValue, currentValue) => {
        return previousValue + currentValue.add_num;
    }, 0);
}