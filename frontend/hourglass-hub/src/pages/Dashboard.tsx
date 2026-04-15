import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { CheckSquare, Clock, FolderKanban, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";

const Dashboard = () => {
  const { user } = useAuth();
  const { data: tasks, isLoading: isLoadingTasks } = useTasks();
  const { data: projects, isLoading: isLoadingProjects } = useProjects();

  // Obtener nombre del usuario
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';

  // Calcular métricas
  const tareasCount = tasks?.length || 0;
  const proyectosCount = projects?.length || 0;

  // Calcular horas totales de las tareas
  const horasTotal = tasks?.reduce((acc, task) => {
    if (task.start_time && task.end_time) {
      const start = new Date(task.start_time).getTime();
      const end = new Date(task.end_time).getTime();
      const hours = (end - start) / (1000 * 60 * 60);
      return acc + hours;
    }
    return acc;
  }, 0) || 0;

  // Contar tareas completadas
  const tareasCompletadas = tasks?.filter(t => t.status === 'Completed').length || 0;

  const isLoading = isLoadingTasks || isLoadingProjects;

  return (
    <DashboardLayout>
      {/* Encabezado de la página */}
      <div className="mb-8 opacity-0 animate-fade-in fill-mode-forwards">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {isLoading ? "Cargando..." : `¡Hola, ${userName}! 👋`}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Aquí tienes un resumen de lo que está pasando con tus proyectos hoy.
        </p>
      </div>

      {/* Rejilla de Métricas */}
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {/* Tarjeta 1: Tareas */}
          <MetricCard
            title="Tareas Registradas"
            value={tareasCount}
            subtitle="Total en el sistema"
            icon={CheckSquare}
            trend={{ value: 12, positive: true }}
            delay={100}
          />

          {/* Tarjeta 2: Horas */}
          <MetricCard
            title="Horas Registradas"
            value={`${horasTotal.toFixed(1)}h`}
            subtitle="Tiempo total invertido"
            icon={Clock}
            trend={{ value: 8, positive: true }}
            delay={150}
          />

          {/* Tarjeta 3: Proyectos Activos */}
          <MetricCard
            title="Proyectos"
            value={proyectosCount}
            subtitle="Total registrados"
            icon={FolderKanban}
            trend={{ value: 2, positive: true }}
            delay={200}
          />

          {/* Tarjeta 4: Tareas Completadas */}
          <MetricCard
            title="Tareas Completadas"
            value={tareasCompletadas}
            subtitle="Historial de éxito"
            icon={TrendingUp}
            trend={{ value: 5, positive: true }}
            delay={250}
          />
        </div>
      )}

      {/* Rejilla Inferior (Feeds y Acciones) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;