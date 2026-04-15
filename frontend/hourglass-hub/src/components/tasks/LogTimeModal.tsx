import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Hooks para datos reales
import { useProjects, type ProjectWithDetails } from "@/hooks/useProjects";
import { useServices } from "@/hooks/useServices";

const taskFormSchema = z.object({
  date: z.date({ required_error: "La fecha es requerida" }),
  startTime: z.string().min(1, "Hora de inicio requerida"),
  endTime: z.string().min(1, "Hora de fin requerida"),
  projectId: z.string().min(1, "Selecciona un proyecto"),
  serviceId: z.string().min(1, "Selecciona un servicio"),
  completed: z.boolean().default(false),
  description: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface LogTimeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects?: ProjectWithDetails[]; // Opcional, ya que podemos cargarlos dentro si no se pasan
  onSubmit?: (data: TaskFormValues) => void;
}

export function LogTimeModal({ open, onOpenChange, onSubmit, projects: propProjects }: LogTimeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos si no se pasan como props (aunque Tasks.tsx los pasa, es bueno tener fallback o usar el hook aquí)
  const { data: fetchedProjects = [] } = useProjects();
  const projectsList = propProjects || fetchedProjects;

  const { data: services = [] } = useServices();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      date: new Date(),
      startTime: "09:00",
      endTime: "17:00",
      projectId: "",
      serviceId: "",
      completed: false,
      description: "",
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        date: new Date(),
        startTime: "09:00",
        endTime: "17:00",
        projectId: "",
        serviceId: "",
        completed: false,
        description: "",
      });
    }
  }, [open, form]);

  const handleSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true);

    // Simular pequeño delay para UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (onSubmit) {
      onSubmit(data);
    } else {
      // Fallback si no hay onSubmit prop (aunque Tasks.tsx lo maneja)
      console.log("Datos del formulario:", data);
      toast.info("Función de guardado no conectada en este contexto");
    }

    // El manejo de éxito/error real debe estar en la función onSubmit del padre (Tasks.tsx)
    // Pero aquí cerramos el modal para feedback inmediato si todo "parece" bien en validación
    // Idealmente el padre controla el cierre tras éxito, pero mantendremos comportamiento previo
    // setIsSubmitting(false); // Lo hace el efecto de cierre o el padre
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Registrar Tiempo
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            {/* Date Picker */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-foreground">Fecha</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-muted/50 border-border hover:bg-muted",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Selecciona una fecha</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Hora Inicio</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        className="bg-muted/50 border-border focus:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Hora Fin</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        className="bg-muted/50 border-border focus:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Project Dropdown */}
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Proyecto</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-muted/50 border-border">
                        <SelectValue placeholder="Selecciona un proyecto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border max-h-[200px]">
                      {projectsList.length === 0 ? (
                        <div className="p-2 text-sm text-center text-muted-foreground">No hay proyectos disponibles</div>
                      ) : (
                        projectsList.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Service Selection */}
            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Servicio</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-muted/50 border-border">
                        <SelectValue placeholder="Selecciona un servicio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border max-h-[200px]">
                      {services.length === 0 ? (
                        <div className="p-2 text-sm text-center text-muted-foreground">No hay servicios disponibles</div>
                      ) : (
                        services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} (${service.default_hourly_rate}/hr)
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Detalles de la tarea..."
                      className="bg-muted/50 border-border"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Completed Toggle */}
            <FormField
              control={form.control}
              name="completed"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border border-border bg-muted/50 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-foreground font-medium">Marcar como Completada</FormLabel>
                    <p className="text-xs text-muted-foreground">Activar si la tarea ya fue finalizada</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Registrar Tiempo
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
