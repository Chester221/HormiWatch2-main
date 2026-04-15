import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Tables } from '@/types/supabase'

// Definimos un tipo más específico para el proyecto con sus relaciones
export type ProjectWithDetails = Tables<'projects'> & {
  project_leader: { full_name: string } | null
  client: { name: string } | null
}

// El hook para obtener los proyectos
export const useProjects = () => {
  const fetchProjects = async (): Promise<ProjectWithDetails[]> => {
    try {
      // Usamos el nombre específico de la relación para desambiguar
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_leader:profiles!projects_project_leader_id_fkey ( full_name ),
          client:clients ( name )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        // Si la tabla no existe, devolver array vacío en lugar de error
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.warn('La tabla projects no existe en Supabase. Devolviendo array vacío.')
          return []
        }
        console.error('Error fetching projects:', error)
        throw new Error(error.message)
      }

      return (data || []) as ProjectWithDetails[]
    } catch (err) {
      console.error('Error en useProjects:', err)
      return []
    }
  }

  return useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    retry: false, // No reintentar si falla
  })
}