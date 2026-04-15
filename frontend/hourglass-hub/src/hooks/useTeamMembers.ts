import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { UserRole } from '@/contexts/AuthContext'

// Tipo para usuario/perfil
export interface TeamMember {
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
    role: UserRole
}

// Hook para obtener usuarios por rol
export const useTeamMembers = (options?: {
    role?: UserRole | 'all'
    searchQuery?: string
}) => {
    const { role = 'all', searchQuery } = options || {}

    const fetchMembers = async (): Promise<TeamMember[]> => {
        try {
            let query = supabase
                .from('profiles')
                .select('*')
                .order('full_name', { ascending: true })

            // Filtrar por rol si se especifica
            if (role && role !== 'all') {
                query = query.eq('role', role)
            }

            const { data, error } = await query

            if (error) {
                if (error.code === '42P01' || error.message.includes('does not exist')) {
                    console.warn('La tabla profiles no existe en Supabase.')
                    return []
                }
                console.error('Error fetching team members:', error)
                throw new Error(error.message)
            }

            // Filtrar localmente si hay búsqueda
            let members = (data || []) as TeamMember[]
            if (searchQuery) {
                const search = searchQuery.toLowerCase()
                members = members.filter(m =>
                    (m.full_name && m.full_name.toLowerCase().includes(search)) ||
                    (m.email && m.email.toLowerCase().includes(search))
                )
            }

            return members
        } catch (err) {
            console.error('Error en useTeamMembers:', err)
            return []
        }
    }

    return useQuery({
        queryKey: ['team_members', role, searchQuery],
        queryFn: fetchMembers,
        retry: false,
    })
}

// Hook para obtener solo técnicos
export const useTechnicians = (searchQuery?: string) => {
    return useTeamMembers({ role: 'Technician', searchQuery })
}

// Hook para obtener todos los usuarios (para seleccionar líder)
export const useAllUsers = (searchQuery?: string) => {
    return useTeamMembers({ role: 'all', searchQuery })
}
