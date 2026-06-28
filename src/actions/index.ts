import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { createClient } from '@supabase/supabase-js';
import { sha256 } from '@/lib/utils';

const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export const server = {
  submitContact: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(1, 'Name is required'),
      contactInfo: z.string().min(1, 'Contact info is required'),
      message: z.string().max(2000).optional(),
      // Honeypot field (invisible to humans, bots fill it)
      website_hp: z.string().max(0, 'Bot detected').optional().nullable(),
    }),
    handler: async (input, context) => {
      // 1. Honeypot check
      if (input.website_hp && input.website_hp.length > 0) {
        console.warn('[SECURITY] Bot submission triggered honeypot');
        return { success: true };
      }

      try {
        // 2. Rate limiting via IP hash
        const clientIp = context.clientAddress || context.request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
        const ipHash = await sha256(clientIp);
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

        const { count, error: countError } = await supabase
          .from('request_logs')
          .select('*', { count: 'exact', head: true })
          .eq('ip_hash', ipHash)
          .gt('created_at', fifteenMinutesAgo);

        if (countError) {
          console.error('[DB] Rate limit query error:', countError.message);
        }

        if (count !== null && count >= 3) {
          return { success: false, errorId: 'rate_limit' };
        }

        // 3. Log IP
        await supabase.from('request_logs').insert({ ip_hash: ipHash });

        // 4. Insert contact lead
        const { error: insertError } = await supabase.from('contacts').insert({
          name: input.name,
          contact_info: input.contactInfo,
          message: input.message || null,
        });

        if (insertError) {
          console.error('[DB] Failed to insert contact:', insertError.message);
          return { success: false, errorId: 'generic' };
        }

        return { success: true };
      } catch (err: unknown) {
        console.error('[SERVER] Action exception:', err instanceof Error ? err.message : String(err));
        return { success: false, errorId: 'generic' };
      }
    },
  }),
};
