import { supabase } from '../lib/supabaseClient';
import { Expense, RegularOffering, Donor, EnvelopeOffering, Fellowship } from '../types';

export const api = {
  // 1. Fellowships API
  fellowships: {
    getAll: async (): Promise<Fellowship[]> => {
        const { data, error } = await supabase.from('fellowships').select('*').order('name');
        if (error) throw error;
        return data || [];
    }
  },

  // 4. Expenses API
  expenses: {
    getAll: async (): Promise<Expense[]> => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    create: async (data: Omit<Expense, 'id'>): Promise<Expense> => {
      const { data: newRecord, error } = await supabase
        .from('expenses')
        .insert([data])
        .select()
        .single();
        
      if (error) throw error;
      return newRecord;
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
    },
    update: async (id: string, data: Partial<Expense>): Promise<Expense | null> => {
        const { data: updated, error } = await supabase
            .from('expenses')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return updated;
    }
  },

  // 5. Regular Offerings API
  offerings: {
    getAll: async (): Promise<RegularOffering[]> => {
      const { data, error } = await supabase
        .from('regular_offerings')
        .select('*')
        .order('service_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    create: async (data: Omit<RegularOffering, 'id'>): Promise<RegularOffering> => {
      const { data: newRecord, error } = await supabase
        .from('regular_offerings')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return newRecord;
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('regular_offerings').delete().eq('id', id);
      if (error) throw error;
    },
    update: async (id: string, data: Partial<RegularOffering>): Promise<RegularOffering | null> => {
        const { data: updated, error } = await supabase
            .from('regular_offerings')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return updated;
    }
  },

  // 6. Wahumini (Donors) API
  donors: {
    getAll: async (): Promise<Donor[]> => {
      // Join to get fellowship name
      const { data, error } = await supabase
        .from('donors')
        .select(`
            *,
            fellowships (
                name
            )
        `);

      if (error) throw error;
      
      const formatted = (data || []).map((item: any) => ({
          ...item,
          fellowship_name: item.fellowships?.name || 'Hana Jumuiya'
      }));

      // Sort by envelope number
      return formatted.sort((a, b) => parseInt(a.envelope_number) - parseInt(b.envelope_number));
    },
    create: async (data: Donor): Promise<Donor> => {
      // Ensure we don't send the view-only 'fellowship_name' to the insert
      const { fellowship_name, ...insertData } = data;
      
      const { data: newRecord, error } = await supabase
        .from('donors')
        .insert([insertData])
        .select()
        .single();

      if (error) {
          if (error.code === '23505') {
              throw new Error(`Namba ya bahasha ${data.envelope_number} tayari imesajiliwa.`);
          }
          throw error;
      }
      return newRecord;
    }
  },

  // 7. Envelope Offerings API
  envelopeOfferings: {
    getAll: async (): Promise<EnvelopeOffering[]> => {
      const { data, error } = await supabase
        .from('envelope_offerings')
        .select(`
            *,
            donors (
                donor_name
            )
        `)
        .order('offering_date', { ascending: false });

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        envelope_number: item.envelope_number,
        amount: item.amount,
        offering_date: item.offering_date,
        donor_name: item.donors?.donor_name || 'Haijulikani'
      }));
    },
    create: async (data: Omit<EnvelopeOffering, 'id'>): Promise<EnvelopeOffering> => {
      const { data: donor } = await supabase
        .from('donors')
        .select('envelope_number')
        .eq('envelope_number', data.envelope_number)
        .single();

      if (!donor) {
        throw new Error(`Mtoa sadaka mwenye namba ${data.envelope_number} hayupo.`);
      }

      const { data: newRecord, error } = await supabase
        .from('envelope_offerings')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return newRecord;
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('envelope_offerings').delete().eq('id', id);
      if (error) throw error;
    },
    update: async (id: string, data: Partial<EnvelopeOffering>): Promise<EnvelopeOffering | null> => {
        const { data: updated, error } = await supabase
            .from('envelope_offerings')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return updated;
    }
  },

  // 8. Reports
  reports: {
    getSummary: async () => {
        const { data: exp } = await supabase.from('expenses').select('amount');
        const { data: reg } = await supabase.from('regular_offerings').select('amount');
        const { data: env } = await supabase.from('envelope_offerings').select('amount');

        const totalExpenses = (exp || []).reduce((sum, item) => sum + item.amount, 0);
        const totalOfferings = (reg || []).reduce((sum, item) => sum + item.amount, 0);
        const totalEnvOfferings = (env || []).reduce((sum, item) => sum + item.amount, 0);
        const totalIncome = totalOfferings + totalEnvOfferings;

        return {
            totalIncome,
            totalExpenses,
            netBalance: totalIncome - totalExpenses,
            breakdown: {
                regular: totalOfferings,
                envelopes: totalEnvOfferings
            }
        };
    }
  }
};