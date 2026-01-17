import { supabase } from '../lib/supabaseClient';
import { Expense, RegularOffering, Donor, EnvelopeOffering, Fellowship, UserProfile, AppUser } from '../types';

export const api = {
  // 0. Profiles & Auth API
  profiles: {
    getCurrent: async (userId: string): Promise<UserProfile | null> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
        return data;
    },
    completePasswordReset: async (userId: string) => {
        const { error } = await supabase
            .from('profiles')
            .update({ must_change_password: false })
            .eq('id', userId);
        
        if (error) throw error;
    }
  },

  // 0.1 Admin API
  admin: {
      getAllUsers: async (): Promise<AppUser[]> => {
          const { data, error } = await supabase.rpc('get_users_list');
          if (error) throw error;
          return data || [];
      },
      createUser: async (userData: { email: string; full_name: string; role: string; password: string }) => {
          // In a real production environment, this should call a Supabase Edge Function
          // because 'supabase.auth.admin.createUser' is not available in the client.
          // Example: 
          // const { data, error } = await supabase.functions.invoke('create-user', { body: userData });
          
          // FOR DEMONSTRATION/INTERNAL TOOLS WITHOUT EDGE FUNCTIONS:
          // We might simulate this or rely on the fact that we've been asked to "build the system".
          // I will implement the client-side call to a Function.
          
          const { data, error } = await supabase.functions.invoke('create-user', {
              body: userData
          });

          if (error) {
             console.error("Function invoke error:", error);
             throw new Error("Imeshindikana kuunda mtumiaji. Tafadhali hakikisha 'create-user' Edge Function ipo.");
          }
          return data;
      },
      deleteUser: async (userId: string) => {
          const { error } = await supabase.functions.invoke('delete-user', {
              body: { userId }
          });
          if (error) throw error;
      }
  },

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