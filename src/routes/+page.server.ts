import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server'
import { z } from 'zod';
import type { Actions } from './$types';
import { loadJadeHistory, populateUniqueActions, calculateTotalJades, formatUrl } from '$lib/jadeHistory';

const schema = z.object({
    url: z.string().url().refine((val) => {
        return val.includes('api-os-takumi.hoyoverse.com');
    },),
});

export const load = async (event) => {
    const sForm = await superValidate(event, schema);

    return {
        sForm
    }
}

export const actions = {
    default: async ({ request }) => {
        const sForm = await superValidate(request, schema);

        if (!sForm.valid) {
            return fail(400, { sForm });
        }

        const jadeActionList = await loadJadeHistory(formatUrl(sForm.data.url));
        const uniqueActions = populateUniqueActions(jadeActionList);
        const totalJades = calculateTotalJades(jadeActionList);
        return {
            sForm,
            jadeActionList,
            uniqueActions,
            totalJades
        };
    }
} satisfies Actions;