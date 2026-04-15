import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export interface Holiday {
    id: number;
    date: string; // YYYY-MM-DD
    name: string;
    is_working_day: boolean;
}

export const useHolidays = () => {
    const queryClient = useQueryClient();

    const fetchHolidays = async (): Promise<Holiday[]> => {
        const { data, error } = await supabase
            .from('holidays')
            .select('*')
            .order('date', { ascending: true });

        if (error) throw error;
        return data || [];
    };

    const addHolidayMutation = useMutation({
        mutationFn: async (holiday: Omit<Holiday, 'id'>) => {
            const { data, error } = await (supabase as any)
                .from('holidays')
                .insert(holiday)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['holidays'] });
            toast.success('Feriado agregado correctamente');
        },
        onError: (error: any) => {
            toast.error(`Error al agregar feriado: ${error.message}`);
        }
    });

    const deleteHolidayMutation = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await (supabase as any)
                .from('holidays')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['holidays'] });
            toast.success('Feriado eliminado');
        },
        onError: (error: any) => {
            toast.error(`Error al eliminar feriado: ${error.message}`);
        }
    });

    const syncHolidaysMutation = useMutation({
        mutationFn: async (year: number) => {
            // 1. Fetch from Nager.Date API
            // Costa Rica country code is CR
            const response = await fetch(`https://date.nager.at/api/v3/publicholidays/${year}/CR`);
            if (!response.ok) throw new Error('Error fetching from public API');

            const publicHolidays = await response.json();

            // 2. Transform to our schema
            const holidaysToInsert = publicHolidays.map((h: any) => ({
                date: h.date,
                name: h.localName,
                is_working_day: false // Most public holidays are non-working
            }));

            // 3. Insert into Supabase (upsert to avoid duplicates would be better, but basic insert is fine for now)
            // Using upsert on date to avoid duplicates if table has unique constraint on date, 
            // otherwise verify manually. Assuming date should be unique for holidays? 
            // Let's try basic insert and catch errors if duplicates exist, or use upsert.

            const { error } = await (supabase as any)
                .from('holidays')
                .upsert(holidaysToInsert, { onConflict: 'date', ignoreDuplicates: true }); // Requires unique constraint on date

            if (error) throw error;
            return holidaysToInsert.length;
        },
        onSuccess: (count) => {
            queryClient.invalidateQueries({ queryKey: ['holidays'] });
            toast.success(`${count} feriados sincronizados exitosamente`);
        },
        onError: (error: any) => {
            console.error(error);
            toast.error(`Error al sincronizar: ${error.message}`);
        }
    });

    return {
        holidays: useQuery({
            queryKey: ['holidays'],
            queryFn: fetchHolidays,
        }),
        addHoliday: addHolidayMutation,
        deleteHoliday: deleteHolidayMutation,
        syncHolidays: syncHolidaysMutation
    };
};
