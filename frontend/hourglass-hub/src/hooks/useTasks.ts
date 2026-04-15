import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Tables, InsertTables } from '@/types/supabase'

// Tipos para tareas derivados de Supabase
export type Task = Tables<'tasks'> & {
  // Relaciones
  projects?: { name: string } | null
  services?: { name: string } | null
  technician?: { full_name: string; avatar_url: string | null } | null
}

// Tipo para crear nueva tarea derivado de Supabase
export type CreateTaskData = InsertTables<'tasks'>

// Hook para obtener tareas
export const useTasks = (projectId?: string | 'all') => {
  const fetchTasks = async (): Promise<Task[]> => {
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          projects ( name ),
          services ( name ),
          technician:profiles ( full_name, avatar_url )
        `)
        .order('start_time', { ascending: false })

      if (projectId && projectId !== 'all') {
        query = query.eq('project_id', projectId)
      }

      const { data, error } = await query

      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.warn('La tabla tasks o relación no existe.')
          return []
        }
        throw new Error(error.message)
      }

      return (data || []) as Task[]
    } catch (err) {
      console.error('Error fetching tasks:', err)
      return []
    }
  }

  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: fetchTasks,
  })
}

// Hook para crear tarea
export const useCreateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newTask: CreateTaskData) => {
      // @ts-ignore
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask as any)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

// Hook para actualizar tarea
export const useUpdateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateTaskData> }) => {
      // @ts-ignore
      const { data: updated, error } = await supabase
        .from('tasks')
        .update(data as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return updated
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

// Hook para eliminar tarea
export const useDeleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskId: number) => {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}